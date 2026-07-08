import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import * as net from "node:net";
import * as tls from "node:tls";
import { resolveTxt } from "node:dns/promises";
import { SMTP_SIGNATURES, type SmtpSignature } from "../data/smtp-signatures.js";

// ─── Module-Level Setup ───

const limiter = new RateLimiter(1000); // slow — SMTP servers are sensitive

const SMTP_TIMEOUT = 15_000;
const SMTP_READ_TIMEOUT = 10_000;

// ─── Helpers ───

/**
 * Open a raw TCP connection to an SMTP server and return the socket
 * along with a helper to read lines and send commands.
 */
function smtpConnect(
  host: string,
  port: number,
): Promise<{
  socket: net.Socket;
  readResponse: () => Promise<string>;
  send: (command: string) => Promise<string>;
  close: () => void;
}> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("SMTP connection timeout")), SMTP_TIMEOUT);

    const socket = net.connect({ host, port }, () => {
      clearTimeout(timer);

      let buffer = "";
      const pendingResolvers: ((data: string) => void)[] = [];

      socket.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf-8");

        // SMTP responses end when a line starts with "NNN " (not "NNN-")
        while (pendingResolvers.length > 0) {
          const lines = buffer.split("\r\n");
          // Find the terminal line: one that starts with 3 digits followed by space
          let endIdx = -1;
          for (let i = 0; i < lines.length; i++) {
            if (/^\d{3}\s/.test(lines[i]) || (i === lines.length - 1 && lines[i] === "")) {
              endIdx = i;
            }
          }

          if (endIdx >= 0 && lines[endIdx] === "") {
            // We've reached the end of a complete response
            const response = lines.slice(0, endIdx).join("\n");
            buffer = lines.slice(endIdx + 1).join("\r\n");
            const resolver = pendingResolvers.shift();
            resolver?.(response);
          } else if (endIdx >= 0 && /^\d{3}\s/.test(lines[endIdx])) {
            const response = lines.slice(0, endIdx + 1).join("\n");
            buffer = lines.slice(endIdx + 1).join("\r\n");
            const resolver = pendingResolvers.shift();
            resolver?.(response);
          } else {
            break;
          }
        }
      });

      const readResponse = (): Promise<string> => {
        return new Promise<string>((res, rej) => {
          const readTimer = setTimeout(() => rej(new Error("SMTP read timeout")), SMTP_READ_TIMEOUT);

          // Check if we already have a complete response in buffer
          const checkBuffer = () => {
            const lines = buffer.split("\r\n");
            for (let i = 0; i < lines.length; i++) {
              if (/^\d{3}\s/.test(lines[i])) {
                clearTimeout(readTimer);
                const response = lines.slice(0, i + 1).join("\n");
                buffer = lines.slice(i + 1).join("\r\n");
                res(response);
                return true;
              }
            }
            return false;
          };

          if (checkBuffer()) return;

          pendingResolvers.push((data: string) => {
            clearTimeout(readTimer);
            res(data);
          });
        });
      };

      const send = async (command: string): Promise<string> => {
        socket.write(command + "\r\n");
        return readResponse();
      };

      const close = () => {
        try {
          socket.write("QUIT\r\n");
        } catch {
          // ignore
        }
        setTimeout(() => {
          try {
            socket.end();
            socket.destroy();
          } catch {
            // ignore
          }
        }, 500);
      };

      resolve({ socket, readResponse, send, close });
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.on("timeout", () => {
      clearTimeout(timer);
      socket.destroy();
      reject(new Error("SMTP socket timeout"));
    });

    socket.setTimeout(SMTP_TIMEOUT);
  });
}

function matchBanner(banner: string): SmtpSignature | null {
  for (const sig of SMTP_SIGNATURES) {
    for (const pattern of sig.bannerPatterns) {
      if (new RegExp(pattern, "i").test(banner)) {
        return sig;
      }
    }
  }
  return null;
}

function parseEhloExtensions(response: string): string[] {
  const extensions: string[] = [];
  const lines = response.split("\n");
  // Skip the first line (greeting), parse extension lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Strip the response code prefix (250- or 250 )
    const cleaned = line.replace(/^250[-\s]/, "").trim();
    if (cleaned) extensions.push(cleaned);
  }
  return extensions;
}

// ─── Tool 1: smtp_probe ───

async function smtpProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 25;

  await limiter.acquire();

  try {
    const conn = await smtpConnect(host, port);

    // Read 220 banner
    const banner = await conn.readResponse();

    // Match banner against known signatures
    const bannerMatch = matchBanner(banner);

    // Send EHLO
    const ehloResponse = await conn.send("EHLO probe.fingerprint-mcp");

    // Parse EHLO extensions
    const extensions = parseEhloExtensions(ehloResponse);

    // Check extension ordering against known signatures
    const extensionMatches: { name: string; category: string; matchedExtensions: string[] }[] = [];
    for (const sig of SMTP_SIGNATURES) {
      if (!sig.ehloExtensions) continue;

      const matched: string[] = [];
      for (const ext of sig.ehloExtensions) {
        // Match extension name (case-insensitive, prefix match for AUTH etc.)
        for (const serverExt of extensions) {
          if (serverExt.toUpperCase().startsWith(ext.toUpperCase())) {
            matched.push(ext);
            break;
          }
        }
      }

      if (matched.length >= 3) {
        extensionMatches.push({
          name: sig.name,
          category: sig.category,
          matchedExtensions: matched,
        });
      }
    }

    // Sort by matched extension count
    extensionMatches.sort((a, b) => b.matchedExtensions.length - a.matchedExtensions.length);

    // Analyze specific extension capabilities
    const capabilities: Record<string, boolean> = {
      STARTTLS: extensions.some((e) => /^STARTTLS$/i.test(e)),
      PIPELINING: extensions.some((e) => /^PIPELINING$/i.test(e)),
      "8BITMIME": extensions.some((e) => /^8BITMIME$/i.test(e)),
      CHUNKING: extensions.some((e) => /^CHUNKING$/i.test(e)),
      SMTPUTF8: extensions.some((e) => /^SMTPUTF8$/i.test(e)),
      DSN: extensions.some((e) => /^DSN$/i.test(e)),
      ENHANCEDSTATUSCODES: extensions.some((e) => /^ENHANCEDSTATUSCODES$/i.test(e)),
    };

    // Extract AUTH mechanisms
    const authLine = extensions.find((e) => /^AUTH\s/i.test(e));
    const authMechanisms = authLine
      ? authLine.replace(/^AUTH\s+/i, "").split(/\s+/)
      : [];

    // Extract SIZE limit
    const sizeLine = extensions.find((e) => /^SIZE\s/i.test(e));
    const maxSize = sizeLine ? parseInt(sizeLine.replace(/^SIZE\s+/i, ""), 10) : null;

    conn.close();

    return json({
      host,
      port,
      banner,
      bannerMatch: bannerMatch
        ? { name: bannerMatch.name, category: bannerMatch.category }
        : null,
      ehlo: {
        extensions,
        extensionCount: extensions.length,
        capabilities,
        authMechanisms,
        maxMessageSize: maxSize,
      },
      extensionMatches: extensionMatches.slice(0, 5),
      identification: bannerMatch
        ? { server: bannerMatch.name, category: bannerMatch.category, source: "banner" }
        : extensionMatches.length > 0
          ? { server: extensionMatches[0].name, category: extensionMatches[0].category, source: "extensions" }
          : null,
    });
  } catch (err) {
    return json({
      host,
      port,
      error: err instanceof Error ? err.message : String(err),
      note: "SMTP connection failed. The server may not be accepting connections on this port, or a firewall may be blocking port 25.",
    });
  }
}

// ─── Tool 2: smtp_tls ───

async function smtpTls(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 25;

  await limiter.acquire();

  const result: {
    host: string;
    port: number;
    starttls: {
      supported: boolean;
      certificate: {
        subject: Record<string, string>;
        issuer: Record<string, string>;
        san: string[];
        validFrom: string;
        validTo: string;
        serialNumber: string;
        keyType: string;
        keySize: number | null;
        signatureAlgorithm: string;
      } | null;
      protocol: string | null;
      cipher: string | null;
      error: string | null;
    };
    mtaSts: {
      hasTxtRecord: boolean;
      txtRecord: string | null;
      policy: {
        version: string | null;
        mode: string | null;
        maxAge: string | null;
        mx: string[];
        raw: string;
      } | null;
      error: string | null;
    };
    tlsRpt: {
      hasTxtRecord: boolean;
      record: string | null;
      error: string | null;
    };
  } = {
    host,
    port,
    starttls: {
      supported: false,
      certificate: null,
      protocol: null,
      cipher: null,
      error: null,
    },
    mtaSts: {
      hasTxtRecord: false,
      txtRecord: null,
      policy: null,
      error: null,
    },
    tlsRpt: {
      hasTxtRecord: false,
      record: null,
      error: null,
    },
  };

  // 1. STARTTLS test
  try {
    const conn = await smtpConnect(host, port);

    // Read banner
    await conn.readResponse();

    // Send EHLO
    const ehloResponse = await conn.send("EHLO probe.fingerprint-mcp");
    const extensions = parseEhloExtensions(ehloResponse);

    const supportsStartTls = extensions.some((e) => /^STARTTLS$/i.test(e));

    if (supportsStartTls) {
      result.starttls.supported = true;

      // Send STARTTLS
      const startTlsResponse = await conn.send("STARTTLS");

      if (startTlsResponse.startsWith("220")) {
        // Upgrade to TLS
        const tlsSocket = await new Promise<tls.TLSSocket>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("TLS upgrade timeout")), SMTP_TIMEOUT);

          const secureSocket = tls.connect(
            {
              socket: conn.socket,
              host,
              rejectUnauthorized: false,
              servername: host,
            },
            () => {
              clearTimeout(timer);
              resolve(secureSocket);
            },
          );

          secureSocket.on("error", (err) => {
            clearTimeout(timer);
            reject(err);
          });
        });

        // Extract certificate info
        const cert = tlsSocket.getPeerCertificate(false);
        if (cert && cert.subject) {
          const subjectFields: Record<string, string> = {};
          for (const [key, value] of Object.entries(cert.subject)) {
            subjectFields[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
          }

          const issuerFields: Record<string, string> = {};
          for (const [key, value] of Object.entries(cert.issuer || {})) {
            issuerFields[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
          }

          // Extract SANs
          const sans: string[] = [];
          if (cert.subjectaltname) {
            for (const entry of cert.subjectaltname.split(",")) {
              const trimmed = entry.trim();
              if (trimmed.startsWith("DNS:")) {
                sans.push(trimmed.slice(4));
              }
            }
          }

          // Determine key type and size
          let keyType = "unknown";
          let keySize: number | null = null;
          if (cert.bits) {
            keySize = cert.bits;
          }
          // Try to get key info from modulus (RSA) or pubkey
          if (cert.modulus) {
            keyType = "RSA";
          } else if (cert.asn1Curve) {
            keyType = `ECDSA (${cert.asn1Curve})`;
          } else if (cert.nistCurve) {
            keyType = `ECDSA (${cert.nistCurve})`;
          }

          result.starttls.certificate = {
            subject: subjectFields,
            issuer: issuerFields,
            san: sans,
            validFrom: cert.valid_from ?? "",
            validTo: cert.valid_to ?? "",
            serialNumber: cert.serialNumber ?? "",
            keyType,
            keySize,
            signatureAlgorithm: (cert as any).signatureAlgorithm ?? "unknown",
          };
        }

        result.starttls.protocol = tlsSocket.getProtocol() ?? null;
        const cipherInfo = tlsSocket.getCipher();
        result.starttls.cipher = cipherInfo ? cipherInfo.name : null;

        try {
          tlsSocket.end();
          tlsSocket.destroy();
        } catch {
          // ignore
        }
      }
    } else {
      conn.close();
    }
  } catch (err) {
    result.starttls.error = err instanceof Error ? err.message : String(err);
  }

  // 2. MTA-STS: check _mta-sts.domain TXT record and policy
  // Extract domain from host (strip leading mx., mail., etc.)
  const domain = host.replace(/^(mx\d*|mail\d*|smtp\d*)\./i, "");

  try {
    const txtRecords = await resolveTxt(`_mta-sts.${domain}`);
    const flatRecords = txtRecords.map((r) => r.join(""));
    const mtaStsRecord = flatRecords.find((r) => r.startsWith("v=STSv1"));

    if (mtaStsRecord) {
      result.mtaSts.hasTxtRecord = true;
      result.mtaSts.txtRecord = mtaStsRecord;

      // Fetch the policy file
      try {
        const policyUrl = `https://mta-sts.${domain}/.well-known/mta-sts.txt`;
        const policyRes = await fetch(policyUrl, {
          signal: AbortSignal.timeout(10_000),
          redirect: "follow",
        });

        if (policyRes.ok) {
          const policyText = await policyRes.text();
          const lines = policyText.split("\n").map((l) => l.trim());

          const policy: {
            version: string | null;
            mode: string | null;
            maxAge: string | null;
            mx: string[];
            raw: string;
          } = {
            version: null,
            mode: null,
            maxAge: null,
            mx: [],
            raw: policyText,
          };

          for (const line of lines) {
            if (line.startsWith("version:")) policy.version = line.split(":")[1]?.trim() ?? null;
            if (line.startsWith("mode:")) policy.mode = line.split(":")[1]?.trim() ?? null;
            if (line.startsWith("max_age:")) policy.maxAge = line.split(":")[1]?.trim() ?? null;
            if (line.startsWith("mx:")) policy.mx.push(line.split(":")[1]?.trim() ?? "");
          }

          result.mtaSts.policy = policy;
        }
      } catch (err) {
        result.mtaSts.error = err instanceof Error ? err.message : String(err);
      }
    }
  } catch {
    // No MTA-STS TXT record
  }

  // 3. TLSRPT: check _smtp._tls.domain TXT record
  try {
    const txtRecords = await resolveTxt(`_smtp._tls.${domain}`);
    const flatRecords = txtRecords.map((r) => r.join(""));
    const tlsRptRecord = flatRecords.find((r) => r.startsWith("v=TLSRPTv1"));

    if (tlsRptRecord) {
      result.tlsRpt.hasTxtRecord = true;
      result.tlsRpt.record = tlsRptRecord;
    }
  } catch {
    // No TLSRPT record
  }

  return json(result);
}

// ─── Tool Definitions ───

export const smtpTools: ToolDef[] = [
  {
    name: "smtp_probe",
    description:
      "SMTP banner and EHLO extension fingerprint. Connects to the SMTP port, reads the 220 banner to identify the MTA software (Postfix, Exchange, Gmail, Sendmail, Exim, etc.), then sends EHLO and parses supported extensions (STARTTLS, AUTH mechanisms, SIZE, PIPELINING, 8BITMIME, CHUNKING, SMTPUTF8). Extension set and ordering identify the MTA implementation.",
    schema: {
      host: z.string().describe("Target SMTP host"),
      port: z.number().optional().default(25).describe("SMTP port (25, 587, or 465)"),
    },
    execute: smtpProbe,
  },
  {
    name: "smtp_tls",
    description:
      "SMTP TLS and MTA-STS analysis. Connects to SMTP, sends EHLO, upgrades via STARTTLS, and extracts the TLS certificate (issuer, SAN, key type, cipher suite). Also checks MTA-STS policy by querying _mta-sts.domain TXT record and fetching the policy file, plus TLSRPT via _smtp._tls.domain TXT record.",
    schema: {
      host: z.string().describe("Target SMTP host"),
      port: z.number().optional().default(25).describe("SMTP port"),
    },
    execute: smtpTls,
  },
];
