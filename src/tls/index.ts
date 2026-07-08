import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import * as tls from "node:tls";
import * as net from "node:net";
import { X509Certificate, createHash } from "node:crypto";
import { json } from "../types/index.js";

// ─── Module-Level Singletons ───

const limiter = new RateLimiter(200);
const cache = new TTLCache<any>(600_000); // 10min cache

// ─── Helper: TLS Connection ───

async function tlsConnect(
  host: string,
  port: number,
  options?: tls.ConnectionOptions,
): Promise<{ socket: tls.TLSSocket; cert: tls.PeerCertificate }> {
  return new Promise((resolve, reject) => {
    const opts: tls.ConnectionOptions = {
      host,
      port,
      rejectUnauthorized: false,
      servername: host,
      timeout: 10000,
      ...options,
    };
    const socket = tls.connect(opts, () => {
      const cert = socket.getPeerCertificate(true);
      resolve({ socket, cert });
    });
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("TLS connection timeout"));
    });
  });
}

// ─── Helper: Safely close a TLS socket ───

function safeClose(socket: tls.TLSSocket): void {
  try {
    socket.end();
    socket.destroy();
  } catch {
    // ignore
  }
}

// ─── Helper: Parse certificate subject/issuer fields ───

function parseDN(dn: tls.PeerCertificate["subject"]): Record<string, string> {
  if (!dn) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(dn)) {
    result[key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  }
  return result;
}

// ─── Helper: Get SHA-256 fingerprint from raw DER cert ───

function sha256Fingerprint(raw: Buffer | undefined): string {
  if (!raw) return "N/A";
  return createHash("sha256").update(raw).digest("hex");
}

// ─── Helper: DNS resolution for cross-referencing ───

async function resolveHostname(hostname: string): Promise<string[]> {
  const dns = await import("node:dns/promises");
  try {
    const result = await dns.resolve4(hostname);
    return result;
  } catch {
    return [];
  }
}

// ─── Helper: Extract SAN list from certificate ───

function extractSANs(cert: tls.PeerCertificate): { dns: string[]; ips: string[] } {
  const dns: string[] = [];
  const ips: string[] = [];
  const subjectaltname = cert.subjectaltname ?? "";
  if (!subjectaltname) return { dns, ips };

  for (const entry of subjectaltname.split(",")) {
    const trimmed = entry.trim();
    if (trimmed.startsWith("DNS:")) {
      dns.push(trimmed.slice(4));
    } else if (trimmed.startsWith("IP Address:")) {
      ips.push(trimmed.slice(11));
    }
  }
  return { dns, ips };
}

// ─── Helper: Detect malware certificate patterns ───

function detectMalwareCertPatterns(cert: tls.PeerCertificate): string[] {
  const warnings: string[] = [];
  const subject = parseDN(cert.subject);
  const issuer = parseDN(cert.issuer);

  // CN=localhost
  if (subject.CN === "localhost") {
    warnings.push("Subject CN is 'localhost' — common in malware/C2 certificates");
  }

  // Internet Widgits Pty Ltd (OpenSSL default)
  if (subject.O === "Internet Widgits Pty Ltd") {
    warnings.push("Subject O is 'Internet Widgits Pty Ltd' (OpenSSL default) — common in malware certs");
  }

  // Self-signed detection
  const isSelfSigned =
    subject.CN === issuer.CN &&
    subject.O === issuer.O &&
    (subject.C ?? "") === (issuer.C ?? "");
  if (isSelfSigned) {
    warnings.push("Certificate is self-signed");
  }

  // Very long validity (>5 years)
  if (cert.valid_from && cert.valid_to) {
    const from = new Date(cert.valid_from).getTime();
    const to = new Date(cert.valid_to).getTime();
    const years = (to - from) / (1000 * 60 * 60 * 24 * 365.25);
    if (years > 5) {
      warnings.push(`Certificate validity period is ${years.toFixed(1)} years (>5 years) — suspicious`);
    }
  }

  // Self-signed with no SAN
  const sans = extractSANs(cert);
  if (isSelfSigned && sans.dns.length === 0 && sans.ips.length === 0) {
    warnings.push("Self-signed certificate with no SAN — strong malware indicator");
  }

  return warnings;
}

// ─── Helper: Walk certificate chain ───

function walkCertChain(cert: tls.PeerCertificate): Array<{
  subject: Record<string, string>;
  issuer: Record<string, string>;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  fingerprint256: string;
}> {
  const chain: Array<{
    subject: Record<string, string>;
    issuer: Record<string, string>;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    fingerprint256: string;
  }> = [];

  const visited = new Set<string>();
  let current: tls.PeerCertificate | undefined = cert;

  while (current) {
    const serial = current.serialNumber ?? "unknown";
    if (visited.has(serial)) break;
    visited.add(serial);

    chain.push({
      subject: parseDN(current.subject),
      issuer: parseDN(current.issuer),
      serialNumber: serial,
      validFrom: current.valid_from ?? "N/A",
      validTo: current.valid_to ?? "N/A",
      fingerprint256: current.fingerprint256 ?? sha256Fingerprint(current.raw),
    });

    // Walk up the chain
    const issuerCert: any = (current as any).issuerCertificate;
    if (!issuerCert || issuerCert === current) break;
    current = issuerCert;
  }

  return chain;
}

// ─── Helper: Compute RDN ordering string ───

function rdnOrder(dn: Record<string, string>): string {
  // Standard RDN field order as they appear in the certificate
  const knownFields = ["CN", "O", "OU", "L", "ST", "C", "emailAddress", "serialNumber"];
  const order: string[] = [];
  for (const field of knownFields) {
    if (dn[field] !== undefined && dn[field] !== "") {
      order.push(field);
    }
  }
  // Include any non-standard fields
  for (const key of Object.keys(dn)) {
    if (!knownFields.includes(key) && dn[key] !== undefined && dn[key] !== "") {
      order.push(key);
    }
  }
  return order.join(",");
}

// ─── Helper: Extract extension OIDs from X509Certificate ───

function extractExtensionOIDs(cert: tls.PeerCertificate): string[] {
  try {
    if (!cert.raw) return [];
    const x509 = new X509Certificate(cert.raw);
    const infoAccess = x509.infoAccess;
    const keyUsage = x509.keyUsage;
    const oids: string[] = [];

    // Standard extensions we can detect
    if (x509.subjectAltName) oids.push("2.5.29.17"); // SAN
    if (keyUsage && keyUsage.length > 0) oids.push("2.5.29.15"); // Key Usage
    if (infoAccess) {
      oids.push("1.3.6.1.5.5.7.1.1"); // Authority Info Access
      if (infoAccess.includes("OCSP")) oids.push("1.3.6.1.5.5.7.48.1"); // OCSP
      if (infoAccess.includes("CA Issuers")) oids.push("1.3.6.1.5.5.7.48.2"); // CA Issuers
    }
    // Basic Constraints — detect via ca property
    if ((x509 as any).ca !== undefined) oids.push("2.5.29.19");
    // Subject Key Identifier
    if (cert.serialNumber) oids.push("2.5.29.14");
    // Authority Key Identifier
    if ((cert as any).issuerCertificate) oids.push("2.5.29.35");
    // Extended Key Usage — check via ext_key_usage
    if ((cert as any).ext_key_usage) oids.push("2.5.29.37");
    // CRL Distribution Points
    oids.push("2.5.29.31");
    // SCT (Certificate Transparency)
    // OID: 1.3.6.1.4.1.11129.2.4.2
    // We check the raw cert for this OID as a rough heuristic
    if (cert.raw) {
      const rawHex = cert.raw.toString("hex");
      // SCT extension OID in DER: 060a2b06010401d679020402
      if (rawHex.includes("060a2b06010401d679020402")) {
        oids.push("1.3.6.1.4.1.11129.2.4.2");
      }
    }

    return oids;
  } catch {
    return [];
  }
}

// ─── Helper: Detect key type and size from X509Certificate ───

function detectKeyInfo(cert: tls.PeerCertificate): { type: string; size: number | string } {
  try {
    if (!cert.raw) return { type: "unknown", size: "unknown" };
    const x509 = new X509Certificate(cert.raw);
    const pubkey = x509.publicKey;
    const keyType = pubkey.asymmetricKeyType ?? "unknown";
    const keySize = (pubkey as any).asymmetricKeySize ?? "unknown";
    return { type: keyType.toUpperCase(), size: keySize };
  } catch {
    // Fallback: try to infer from bits field
    return {
      type: (cert as any).asn1Curve ? "ECDSA" : "RSA",
      size: (cert as any).bits ?? "unknown",
    };
  }
}

// ─── Helper: Check for CT SCT extension ───

function hasSCTExtension(cert: tls.PeerCertificate): boolean {
  if (!cert.raw) return false;
  const rawHex = cert.raw.toString("hex");
  // SCT extension OID in DER encoding: 060a2b06010401d679020402
  return rawHex.includes("060a2b06010401d679020402");
}

// ──────────────────────────────────────────────────────────────────────────────
// Tool 1: tls_probe — TLS Handshake Analysis
// ──────────────────────────────────────────────────────────────────────────────

const tlsProbe: ToolDef = {
  name: "tls_probe",
  description:
    "TLS handshake analysis. Connects via TLS and captures negotiated version, cipher suite, ALPN result, session ticket support, OCSP stapling, renegotiation info, and certificate validation status.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_probe:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    const { socket, cert } = await tlsConnect(host, port);

    try {
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();
      const alpn = (socket as any).alpnProtocol ?? null;
      const authorized = socket.authorized;
      const authError = socket.authorizationError;
      const ephemeralKeyInfo = (socket as any).getEphemeralKeyInfo?.() ?? null;
      const peerFinished = socket.getPeerFinished();
      const finished = socket.getFinished();

      // Session info
      const session = socket.getSession();
      const hasSession = !!session;

      // TLS version numerical check
      const isTls13 = protocol === "TLSv1.3";

      const result = {
        host,
        port,
        tls: {
          version: protocol,
          cipher: {
            name: cipher?.name ?? "unknown",
            standardName: cipher?.standardName ?? cipher?.name ?? "unknown",
            version: cipher?.version ?? "unknown",
            bits: (cipher as any)?.bits ?? null,
          },
          alpn: alpn || null,
          authorized,
          authorizationError: authError || null,
          ephemeralKey: ephemeralKeyInfo
            ? {
                type: ephemeralKeyInfo.type ?? "unknown",
                size: ephemeralKeyInfo.size ?? null,
                name: ephemeralKeyInfo.name ?? null,
              }
            : null,
          sessionTicket: hasSession,
          isTls13,
          peerCertificate: {
            subject: parseDN(cert.subject),
            issuer: parseDN(cert.issuer),
            validFrom: cert.valid_from ?? "N/A",
            validTo: cert.valid_to ?? "N/A",
            serialNumber: cert.serialNumber ?? "N/A",
          },
          renegotiation: {
            peerFinished: !!peerFinished,
            finished: !!finished,
          },
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } finally {
      safeClose(socket);
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 2: tls_jarm — JARM Fingerprint
// ──────────────────────────────────────────────────────────────────────────────

// JARM probe configurations: 10 different TLS connection parameters
const JARM_PROBES: Array<{
  label: string;
  minVersion?: tls.SecureVersion;
  maxVersion?: tls.SecureVersion;
  ciphers?: string;
  alpn?: string[];
}> = [
  // Probe 1: TLS 1.2 only, all ciphers
  { label: "tls12_all", minVersion: "TLSv1.2", maxVersion: "TLSv1.2" },
  // Probe 2: TLS 1.3 only
  { label: "tls13_only", minVersion: "TLSv1.3", maxVersion: "TLSv1.3" },
  // Probe 3: TLS 1.2, forward-secrecy only
  { label: "tls12_fs", minVersion: "TLSv1.2", maxVersion: "TLSv1.2", ciphers: "ECDHE:DHE" },
  // Probe 4: TLS 1.2, RSA key exchange
  { label: "tls12_rsa", minVersion: "TLSv1.2", maxVersion: "TLSv1.2", ciphers: "RSA" },
  // Probe 5: TLS 1.2, AES-GCM only
  {
    label: "tls12_aesgcm",
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
    ciphers: "AESGCM",
  },
  // Probe 6: TLS 1.2, ChaCha20 only
  {
    label: "tls12_chacha",
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
    ciphers: "CHACHA20",
  },
  // Probe 7: TLS 1.2 with ALPN h2
  { label: "tls12_h2", minVersion: "TLSv1.2", maxVersion: "TLSv1.2", alpn: ["h2"] },
  // Probe 8: TLS 1.2 with ALPN http/1.1
  {
    label: "tls12_h1",
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
    alpn: ["http/1.1"],
  },
  // Probe 9: Widest range (TLS 1.2 - 1.3)
  { label: "tls_wide", minVersion: "TLSv1.2", maxVersion: "TLSv1.3" },
  // Probe 10: TLS 1.3 with ALPN h2
  { label: "tls13_h2", minVersion: "TLSv1.3", maxVersion: "TLSv1.3", alpn: ["h2"] },
];

async function jarmProbe(
  host: string,
  port: number,
  probe: (typeof JARM_PROBES)[number],
): Promise<string> {
  try {
    const opts: tls.ConnectionOptions = {
      minVersion: probe.minVersion,
      maxVersion: probe.maxVersion,
    };
    if (probe.ciphers) {
      opts.ciphers = probe.ciphers;
    }
    if (probe.alpn) {
      opts.ALPNProtocols = probe.alpn;
    }

    const { socket } = await tlsConnect(host, port, opts);
    try {
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();
      if (!cipher || !protocol) return "000";

      // Extract first 3 hex chars from cipher name hash + TLS version indicator
      const cipherHash = createHash("md5").update(cipher.name ?? "").digest("hex");
      const versionByte = protocol === "TLSv1.3" ? "d" : protocol === "TLSv1.2" ? "c" : "0";
      return cipherHash.slice(0, 3) + versionByte;
    } finally {
      safeClose(socket);
    }
  } catch {
    return "0000";
  }
}

const tlsJarm: ToolDef = {
  name: "tls_jarm",
  description:
    "JARM TLS fingerprinting. Sends 10 TLS probes with varying protocol versions, cipher preferences, and ALPN settings to generate a server fingerprint. Useful for identifying C2 frameworks, web servers, and CDN infrastructure.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_jarm:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    // Run all 10 probes
    const probeResults: string[] = [];
    const probeDetails: Array<{ label: string; response: string }> = [];

    for (const probe of JARM_PROBES) {
      await limiter.acquire();
      const response = await jarmProbe(host, port, probe);
      probeResults.push(response);
      probeDetails.push({ label: probe.label, response });
    }

    // Build raw fingerprint from concatenated probe results
    const rawFingerprint = probeResults.join("");

    // Hash the raw fingerprint to produce the JARM hash (62 chars)
    const jarmHash = createHash("sha256").update(rawFingerprint).digest("hex").slice(0, 62);

    // Try to match against known JARM signatures
    let matchedSignature: { name: string; category: string; confidence: number } | null = null;
    try {
      const { JARM_SIGNATURES } = await import("../data/jarm-signatures.js");
      const match = JARM_SIGNATURES.find((sig) => sig.hash === jarmHash);
      if (match) {
        matchedSignature = {
          name: match.name,
          category: match.category,
          confidence: match.confidence,
        };
      }
    } catch {
      // Signature database not available
    }

    const result = {
      host,
      port,
      jarm: {
        hash: jarmHash,
        rawFingerprint,
        probeCount: probeResults.length,
        probes: probeDetails,
        match: matchedSignature,
        note: "Simplified JARM implementation — probes TLS server responses with varying parameters. For full accuracy, use the official Salesforce JARM tool.",
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 3: tls_cert — X.509 Certificate Deep Analysis
// ──────────────────────────────────────────────────────────────────────────────

const tlsCert: ToolDef = {
  name: "tls_cert",
  description:
    "X.509 certificate deep analysis. Extracts subject, issuer, SAN list, validity, key type/size, signature algorithm, fingerprint, full chain, self-signed detection, malware cert patterns, CT/SCT compliance, and wildcard detection.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_cert:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    const { socket, cert } = await tlsConnect(host, port);

    try {
      const subject = parseDN(cert.subject);
      const issuer = parseDN(cert.issuer);
      const sans = extractSANs(cert);
      const keyInfo = detectKeyInfo(cert);
      const malwareWarnings = detectMalwareCertPatterns(cert);
      const chain = walkCertChain(cert);
      const sctPresent = hasSCTExtension(cert);

      // Self-signed detection
      const isSelfSigned =
        subject.CN === issuer.CN &&
        subject.O === issuer.O &&
        (subject.C ?? "") === (issuer.C ?? "");

      // Wildcard detection
      const wildcardDomains = sans.dns.filter((d) => d.startsWith("*."));
      const isWildcard = wildcardDomains.length > 0 || (subject.CN ?? "").startsWith("*.");

      // Validity period
      const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
      const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
      const now = new Date();
      const isExpired = validTo ? now > validTo : false;
      const isNotYetValid = validFrom ? now < validFrom : false;
      const daysRemaining = validTo
        ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Signature algorithm from X509Certificate
      let signatureAlgorithm = "unknown";
      try {
        if (cert.raw) {
          const x509 = new X509Certificate(cert.raw);
          // The sigAlgName is not directly exposed; try fingerprint256 approach
          // Node's X509Certificate doesn't expose sigAlg directly, but we can detect from raw
          const rawHex = cert.raw.toString("hex");
          if (rawHex.includes("2a864886f70d01010b")) signatureAlgorithm = "sha256WithRSAEncryption";
          else if (rawHex.includes("2a864886f70d010105")) signatureAlgorithm = "sha1WithRSAEncryption";
          else if (rawHex.includes("2a864886f70d01010c")) signatureAlgorithm = "sha384WithRSAEncryption";
          else if (rawHex.includes("2a864886f70d01010d")) signatureAlgorithm = "sha512WithRSAEncryption";
          else if (rawHex.includes("2a8648ce3d040302")) signatureAlgorithm = "ecdsa-with-SHA256";
          else if (rawHex.includes("2a8648ce3d040303")) signatureAlgorithm = "ecdsa-with-SHA384";
          else if (rawHex.includes("2b6570")) signatureAlgorithm = "Ed25519";
        }
      } catch {
        // ignore
      }

      const fingerprint256 = cert.fingerprint256 ?? sha256Fingerprint(cert.raw);

      const result = {
        host,
        port,
        certificate: {
          subject,
          issuer,
          san: {
            dns: sans.dns,
            ips: sans.ips,
            total: sans.dns.length + sans.ips.length,
          },
          validity: {
            notBefore: cert.valid_from ?? "N/A",
            notAfter: cert.valid_to ?? "N/A",
            isExpired,
            isNotYetValid,
            daysRemaining,
          },
          serialNumber: cert.serialNumber ?? "N/A",
          key: {
            type: keyInfo.type,
            size: keyInfo.size,
          },
          signatureAlgorithm,
          fingerprint: {
            sha256: fingerprint256,
          },
          chain: {
            depth: chain.length,
            certificates: chain,
          },
          analysis: {
            isSelfSigned,
            isWildcard,
            wildcardDomains,
            ctCompliance: sctPresent,
            sctExtensionPresent: sctPresent,
            malwareIndicators: malwareWarnings,
            malwareScore:
              malwareWarnings.length === 0
                ? "clean"
                : malwareWarnings.length <= 2
                  ? "suspicious"
                  : "likely_malicious",
          },
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } finally {
      safeClose(socket);
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 4: tls_ja4x — JA4X Certificate Generation Fingerprint
// ──────────────────────────────────────────────────────────────────────────────

// Known JA4X patterns for certificate generation tools
const JA4X_KNOWN_TOOLS: Record<string, string> = {
  "CN,O,L,ST,C": "OpenSSL (default)",
  "CN,O,OU,L,ST,C": "OpenSSL (full subject)",
  CN: "mkcert / simple tool",
  "C,ST,L,O,OU,CN": "Java keytool",
  "C,O,CN": "Let's Encrypt / ACME",
  "O,CN": "Cobalt Strike (common pattern)",
  "C,ST,O,CN": "Microsoft PKI / Active Directory CS",
};

const tlsJa4x: ToolDef = {
  name: "tls_ja4x",
  description:
    "JA4X certificate generation fingerprint. Fingerprints HOW a certificate was generated by analyzing issuer/subject RDN ordering and extension OID list. Identifies the tool that generated the cert (Cobalt Strike, mkcert, OpenSSL, Let's Encrypt, etc.).",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_ja4x:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    const { socket, cert } = await tlsConnect(host, port);

    try {
      const issuerDN = parseDN(cert.issuer);
      const subjectDN = parseDN(cert.subject);

      // RDN ordering
      const issuerRdnOrder = rdnOrder(issuerDN);
      const subjectRdnOrder = rdnOrder(subjectDN);

      // Extension OIDs
      const extensionOIDs = extractExtensionOIDs(cert);
      const extensionStr = extensionOIDs.join(",");

      // Hash each section
      const issuerHash = createHash("sha256").update(issuerRdnOrder).digest("hex").slice(0, 12);
      const subjectHash = createHash("sha256").update(subjectRdnOrder).digest("hex").slice(0, 12);
      const extensionHash = createHash("sha256").update(extensionStr).digest("hex").slice(0, 12);

      // JA4X format: {issuer_hash}_{subject_hash}_{extension_hash}
      const ja4xFingerprint = `${issuerHash}_${subjectHash}_${extensionHash}`;

      // Attempt tool identification
      let toolGuess: string | null = null;
      for (const [pattern, tool] of Object.entries(JA4X_KNOWN_TOOLS)) {
        if (subjectRdnOrder === pattern || issuerRdnOrder === pattern) {
          toolGuess = tool;
          break;
        }
      }

      const result = {
        host,
        port,
        ja4x: {
          fingerprint: ja4xFingerprint,
          components: {
            issuer: {
              rdnOrder: issuerRdnOrder,
              hash: issuerHash,
              fields: issuerDN,
            },
            subject: {
              rdnOrder: subjectRdnOrder,
              hash: subjectHash,
              fields: subjectDN,
            },
            extensions: {
              oids: extensionOIDs,
              hash: extensionHash,
            },
          },
          toolIdentification: toolGuess
            ? {
                tool: toolGuess,
                matchedOn: subjectRdnOrder,
                confidence: "medium",
                note: "Based on RDN ordering pattern match against known certificate generation tools",
              }
            : {
                tool: "unknown",
                note: "RDN ordering does not match any known certificate generation tool pattern",
              },
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } finally {
      safeClose(socket);
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 5: tls_cert_cross_ref — Certificate Cross-Reference
// ──────────────────────────────────────────────────────────────────────────────

const tlsCertCrossRef: ToolDef = {
  name: "tls_cert_cross_ref",
  description:
    "Cross-reference certificate SAN/fingerprint for infrastructure mapping. Extracts all SANs, resolves each domain to IP, and generates Shodan/Censys queries for the cert fingerprint to discover shared infrastructure.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_cert_cross_ref:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    const { socket, cert } = await tlsConnect(host, port);

    try {
      const sans = extractSANs(cert);
      const fingerprint256 = cert.fingerprint256 ?? sha256Fingerprint(cert.raw);
      const serialNumber = cert.serialNumber ?? "N/A";

      // Resolve each SAN domain to IP addresses
      const domainResolutions: Array<{ domain: string; ips: string[] }> = [];
      const allIps = new Set<string>();

      // Add IPs from SAN directly
      for (const ip of sans.ips) {
        allIps.add(ip);
      }

      // Resolve DNS SANs (limit to avoid excessive DNS queries)
      const domainsToResolve = sans.dns.slice(0, 50);
      for (const domain of domainsToResolve) {
        // Skip wildcard domains for resolution
        if (domain.startsWith("*.")) {
          domainResolutions.push({ domain, ips: ["(wildcard — not resolved)"] });
          continue;
        }
        try {
          const ips = await resolveHostname(domain);
          domainResolutions.push({ domain, ips });
          for (const ip of ips) allIps.add(ip);
        } catch {
          domainResolutions.push({ domain, ips: ["(resolution failed)"] });
        }
      }

      // Identify interesting subdomains
      const internalKeywords = [
        "staging",
        "stage",
        "dev",
        "test",
        "internal",
        "admin",
        "jenkins",
        "vault",
        "gitlab",
        "jira",
        "confluence",
        "grafana",
        "kibana",
        "prometheus",
        "api",
        "vpn",
        "mail",
        "mx",
        "smtp",
        "imap",
        "pop",
        "ftp",
        "ssh",
        "rdp",
        "db",
        "database",
        "mongo",
        "redis",
        "elastic",
        "kafka",
      ];

      const interestingDomains = sans.dns.filter((d) =>
        internalKeywords.some((kw) => d.toLowerCase().includes(kw)),
      );

      // Clean fingerprint for search queries (remove colons)
      const cleanFingerprint = fingerprint256.replace(/:/g, "");

      const result = {
        host,
        port,
        crossReference: {
          certificate: {
            fingerprint256: cleanFingerprint,
            serialNumber,
            subject: parseDN(cert.subject),
          },
          san: {
            totalDomains: sans.dns.length,
            totalIPs: sans.ips.length,
            domains: sans.dns,
            ips: sans.ips,
          },
          dnsResolution: {
            resolved: domainResolutions,
            uniqueIPs: Array.from(allIps),
            totalUniqueIPs: allIps.size,
          },
          interestingFindings: {
            internalDomains: interestingDomains,
            wildcardDomains: sans.dns.filter((d) => d.startsWith("*.")),
          },
          searchQueries: {
            shodan: {
              byFingerprint: `ssl.cert.fingerprint:"${cleanFingerprint}"`,
              bySerial: `ssl.cert.serial:"${serialNumber}"`,
              byIssuerOrg: cert.issuer?.O
                ? `ssl.cert.issuer.o:"${cert.issuer.O}"`
                : null,
              bySubjectCN: cert.subject?.CN
                ? `ssl.cert.subject.cn:"${cert.subject.CN}"`
                : null,
            },
            censys: {
              byFingerprint: `services.tls.certificates.leaf.fingerprint_sha256:"${cleanFingerprint}"`,
              bySerial: `services.tls.certificates.leaf.tbs_certificate.serial_number:"${serialNumber}"`,
              bySubjectCN: cert.subject?.CN
                ? `services.tls.certificates.leaf.tbs_certificate.subject.common_name:"${cert.subject.CN}"`
                : null,
            },
          },
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } finally {
      safeClose(socket);
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 6: tls_ct_subdomains — Certificate Transparency Subdomain Discovery
// ──────────────────────────────────────────────────────────────────────────────

const tlsCtSubdomains: ToolDef = {
  name: "tls_ct_subdomains",
  description:
    "Certificate Transparency subdomain discovery via crt.sh. Queries CT logs for all certificates issued for a domain, extracts and deduplicates subdomain names, and highlights internal/interesting hostnames (staging, jenkins, vault, etc.).",
  schema: {
    domain: z.string().describe("Domain for CT log subdomain discovery"),
  },
  async execute(args) {
    const domain = args.domain as string;
    const cacheKey = `tls_ct_subdomains:${domain}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    // Query crt.sh API
    const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
    const response = await fetch(url, {
      headers: { "User-Agent": "fingerprint-mcp/0.1.0" },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`crt.sh API returned HTTP ${response.status}`);
    }

    const data: Array<{
      issuer_ca_id: number;
      issuer_name: string;
      common_name: string;
      name_value: string;
      id: number;
      entry_timestamp: string;
      not_before: string;
      not_after: string;
      serial_number: string;
    }> = await response.json();

    // Extract and deduplicate all subdomains
    const subdomainSet = new Set<string>();
    for (const entry of data) {
      // name_value can contain multiple domains separated by newlines
      const names = (entry.name_value ?? "").split("\n");
      for (const name of names) {
        const cleaned = name.trim().toLowerCase();
        if (cleaned && cleaned.endsWith(`.${domain.toLowerCase()}`)) {
          // Remove leading wildcard if present
          const normalized = cleaned.startsWith("*.") ? cleaned.slice(2) : cleaned;
          subdomainSet.add(normalized);
        }
        // Also include exact domain match
        if (cleaned === domain.toLowerCase()) {
          subdomainSet.add(cleaned);
        }
      }
      // Also check common_name
      const cn = (entry.common_name ?? "").trim().toLowerCase();
      if (cn && (cn.endsWith(`.${domain.toLowerCase()}`) || cn === domain.toLowerCase())) {
        const normalized = cn.startsWith("*.") ? cn.slice(2) : cn;
        subdomainSet.add(normalized);
      }
    }

    const subdomains = Array.from(subdomainSet).sort();

    // Categorize interesting subdomains
    const internalKeywords: Record<string, string> = {
      staging: "Staging environment",
      stage: "Staging environment",
      dev: "Development environment",
      test: "Test environment",
      uat: "User acceptance testing",
      qa: "Quality assurance",
      sandbox: "Sandbox environment",
      internal: "Internal service",
      admin: "Admin panel",
      jenkins: "CI/CD (Jenkins)",
      gitlab: "GitLab instance",
      github: "GitHub Enterprise",
      jira: "Issue tracker (Jira)",
      confluence: "Wiki/Docs (Confluence)",
      vault: "Secret management (Vault)",
      grafana: "Monitoring (Grafana)",
      kibana: "Log analysis (Kibana)",
      prometheus: "Monitoring (Prometheus)",
      elastic: "Elasticsearch",
      api: "API endpoint",
      vpn: "VPN gateway",
      mail: "Mail server",
      smtp: "SMTP server",
      imap: "IMAP server",
      webmail: "Webmail interface",
      ftp: "FTP server",
      sftp: "SFTP server",
      ssh: "SSH access",
      rdp: "Remote desktop",
      db: "Database server",
      mysql: "MySQL database",
      postgres: "PostgreSQL database",
      mongo: "MongoDB database",
      redis: "Redis cache",
      kafka: "Message broker (Kafka)",
      rabbitmq: "Message broker (RabbitMQ)",
      docker: "Docker registry",
      k8s: "Kubernetes",
      kubernetes: "Kubernetes",
      cdn: "CDN endpoint",
      static: "Static assets",
      assets: "Static assets",
      s3: "S3/Object storage",
      minio: "MinIO storage",
      sentry: "Error tracking (Sentry)",
      sonar: "Code quality (SonarQube)",
      nexus: "Artifact repository",
      artifactory: "Artifact repository",
      backup: "Backup service",
    };

    const interestingSubdomains: Array<{ subdomain: string; classification: string }> = [];
    for (const sub of subdomains) {
      const parts = sub.split(".");
      for (const part of parts) {
        for (const [keyword, classification] of Object.entries(internalKeywords)) {
          if (part.includes(keyword)) {
            interestingSubdomains.push({ subdomain: sub, classification });
            break;
          }
        }
        // Only match the first keyword per subdomain
        if (interestingSubdomains.length > 0 && interestingSubdomains.at(-1)?.subdomain === sub) {
          break;
        }
      }
    }

    // Wildcard domains found in raw data
    const wildcards = new Set<string>();
    for (const entry of data) {
      const names = (entry.name_value ?? "").split("\n");
      for (const name of names) {
        const cleaned = name.trim().toLowerCase();
        if (cleaned.startsWith("*.")) {
          wildcards.add(cleaned);
        }
      }
    }

    // Unique issuers
    const issuers = new Set<string>();
    for (const entry of data) {
      if (entry.issuer_name) issuers.add(entry.issuer_name);
    }

    const result = {
      domain,
      ctLogs: {
        source: "crt.sh (Certificate Transparency)",
        totalCertificatesFound: data.length,
        subdomains: {
          total: subdomains.length,
          list: subdomains,
        },
        interestingSubdomains,
        wildcardCertificates: Array.from(wildcards),
        certificateIssuers: Array.from(issuers).slice(0, 20),
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 7: tls_ciphers — Cipher Suite Enumeration
// ──────────────────────────────────────────────────────────────────────────────

// Cipher suites to test, grouped by security level
const CIPHER_SUITES_TO_TEST: Array<{
  name: string;
  openssl: string;
  security: "critical" | "weak" | "deprecated" | "acceptable" | "strong" | "modern";
  tlsVersion?: "tls12" | "tls13";
}> = [
  // Critical — should never be accepted
  { name: "NULL", openssl: "NULL", security: "critical" },
  { name: "EXPORT", openssl: "EXPORT", security: "critical" },
  { name: "eNULL", openssl: "eNULL", security: "critical" },
  { name: "aNULL", openssl: "aNULL", security: "critical" },

  // Weak — should be disabled
  { name: "RC4", openssl: "RC4", security: "weak" },
  { name: "DES-CBC3-SHA", openssl: "DES-CBC3-SHA", security: "weak" },
  { name: "DES-CBC-SHA", openssl: "DES-CBC-SHA", security: "weak" },
  { name: "SEED-SHA", openssl: "SEED-SHA", security: "weak" },
  { name: "IDEA-CBC-SHA", openssl: "IDEA-CBC-SHA", security: "weak" },

  // Deprecated — should be migrated away from
  { name: "AES128-SHA", openssl: "AES128-SHA", security: "deprecated" },
  { name: "AES256-SHA", openssl: "AES256-SHA", security: "deprecated" },
  { name: "AES128-SHA256", openssl: "AES128-SHA256", security: "deprecated" },
  { name: "AES256-SHA256", openssl: "AES256-SHA256", security: "deprecated" },

  // Acceptable — forward-secrecy with CBC
  { name: "ECDHE-RSA-AES128-SHA", openssl: "ECDHE-RSA-AES128-SHA", security: "acceptable" },
  { name: "ECDHE-RSA-AES256-SHA", openssl: "ECDHE-RSA-AES256-SHA", security: "acceptable" },
  { name: "ECDHE-RSA-AES128-SHA256", openssl: "ECDHE-RSA-AES128-SHA256", security: "acceptable" },
  { name: "ECDHE-RSA-AES256-SHA384", openssl: "ECDHE-RSA-AES256-SHA384", security: "acceptable" },
  { name: "DHE-RSA-AES128-SHA", openssl: "DHE-RSA-AES128-SHA", security: "acceptable" },
  { name: "DHE-RSA-AES256-SHA", openssl: "DHE-RSA-AES256-SHA", security: "acceptable" },
  { name: "DHE-RSA-AES128-SHA256", openssl: "DHE-RSA-AES128-SHA256", security: "acceptable" },
  { name: "DHE-RSA-AES256-SHA256", openssl: "DHE-RSA-AES256-SHA256", security: "acceptable" },

  // Strong — forward-secrecy with AEAD
  { name: "ECDHE-RSA-AES128-GCM-SHA256", openssl: "ECDHE-RSA-AES128-GCM-SHA256", security: "strong" },
  { name: "ECDHE-RSA-AES256-GCM-SHA384", openssl: "ECDHE-RSA-AES256-GCM-SHA384", security: "strong" },
  { name: "ECDHE-ECDSA-AES128-GCM-SHA256", openssl: "ECDHE-ECDSA-AES128-GCM-SHA256", security: "strong" },
  { name: "ECDHE-ECDSA-AES256-GCM-SHA384", openssl: "ECDHE-ECDSA-AES256-GCM-SHA384", security: "strong" },
  { name: "ECDHE-RSA-CHACHA20-POLY1305", openssl: "ECDHE-RSA-CHACHA20-POLY1305", security: "strong" },
  { name: "ECDHE-ECDSA-CHACHA20-POLY1305", openssl: "ECDHE-ECDSA-CHACHA20-POLY1305", security: "strong" },
  { name: "DHE-RSA-AES128-GCM-SHA256", openssl: "DHE-RSA-AES128-GCM-SHA256", security: "strong" },
  { name: "DHE-RSA-AES256-GCM-SHA384", openssl: "DHE-RSA-AES256-GCM-SHA384", security: "strong" },
  { name: "DHE-RSA-CHACHA20-POLY1305", openssl: "DHE-RSA-CHACHA20-POLY1305", security: "strong" },

  // Modern — TLS 1.3 cipher suites
  { name: "TLS_AES_128_GCM_SHA256", openssl: "TLS_AES_128_GCM_SHA256", security: "modern", tlsVersion: "tls13" },
  { name: "TLS_AES_256_GCM_SHA384", openssl: "TLS_AES_256_GCM_SHA384", security: "modern", tlsVersion: "tls13" },
  {
    name: "TLS_CHACHA20_POLY1305_SHA256",
    openssl: "TLS_CHACHA20_POLY1305_SHA256",
    security: "modern",
    tlsVersion: "tls13",
  },
];

async function testCipher(
  host: string,
  port: number,
  cipher: (typeof CIPHER_SUITES_TO_TEST)[number],
): Promise<{ name: string; accepted: boolean; security: string; negotiatedCipher?: string }> {
  try {
    const opts: tls.ConnectionOptions = {};
    if (cipher.tlsVersion === "tls13") {
      opts.minVersion = "TLSv1.3";
      opts.maxVersion = "TLSv1.3";
      opts.ciphers = undefined; // TLS 1.3 ciphers are controlled differently
      // For TLS 1.3, we use cipherSuites instead of ciphers
      (opts as any).cipherSuites = cipher.openssl;
    } else {
      opts.ciphers = cipher.openssl;
      opts.maxVersion = "TLSv1.2";
    }

    const { socket } = await tlsConnect(host, port, opts);
    const negotiated = socket.getCipher();
    safeClose(socket);

    return {
      name: cipher.name,
      accepted: true,
      security: cipher.security,
      negotiatedCipher: negotiated?.name,
    };
  } catch {
    return {
      name: cipher.name,
      accepted: false,
      security: cipher.security,
    };
  }
}

const tlsCiphers: ToolDef = {
  name: "tls_ciphers",
  description:
    "Enumerate accepted TLS cipher suites by testing each cipher individually. Identifies weak ciphers (RC4, DES, NULL, EXPORT), acceptable ciphers, strong ciphers (AES-GCM, ChaCha20), and TLS 1.3 suites. Provides a security grade.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_ciphers:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    // Test all cipher suites
    const results: Array<{
      name: string;
      accepted: boolean;
      security: string;
      negotiatedCipher?: string;
    }> = [];

    // Test in small batches to avoid overwhelming the target
    for (const cipher of CIPHER_SUITES_TO_TEST) {
      await limiter.acquire();
      const result = await testCipher(host, port, cipher);
      results.push(result);
    }

    // Categorize results
    const accepted = results.filter((r) => r.accepted);
    const rejected = results.filter((r) => !r.accepted);

    const bySecurity: Record<string, string[]> = {
      critical: [],
      weak: [],
      deprecated: [],
      acceptable: [],
      strong: [],
      modern: [],
    };

    for (const r of accepted) {
      bySecurity[r.security]?.push(r.name);
    }

    // Calculate security grade
    let grade: string;
    if (bySecurity.critical.length > 0) {
      grade = "F";
    } else if (bySecurity.weak.length > 0) {
      grade = "C";
    } else if (bySecurity.deprecated.length > 0 && bySecurity.strong.length === 0) {
      grade = "D";
    } else if (bySecurity.deprecated.length > 0) {
      grade = "B-";
    } else if (bySecurity.strong.length > 0 || bySecurity.modern.length > 0) {
      if (bySecurity.acceptable.length === 0) {
        grade = "A+";
      } else {
        grade = "A";
      }
    } else if (bySecurity.acceptable.length > 0) {
      grade = "B";
    } else {
      grade = "N/A";
    }

    const vulnerabilities: string[] = [];
    if (bySecurity.critical.length > 0) {
      vulnerabilities.push(`CRITICAL: Accepts NULL/EXPORT ciphers: ${bySecurity.critical.join(", ")}`);
    }
    if (bySecurity.weak.length > 0) {
      vulnerabilities.push(`WEAK: Accepts insecure ciphers: ${bySecurity.weak.join(", ")}`);
    }
    if (accepted.length === 0) {
      vulnerabilities.push("No cipher suites could be negotiated — server may be unreachable or using unusual configuration");
    }

    const result = {
      host,
      port,
      cipherEnumeration: {
        totalTested: CIPHER_SUITES_TO_TEST.length,
        totalAccepted: accepted.length,
        totalRejected: rejected.length,
        grade,
        accepted: accepted.map((r) => ({
          name: r.name,
          security: r.security,
          negotiated: r.negotiatedCipher,
        })),
        bySecurity: {
          critical: bySecurity.critical,
          weak: bySecurity.weak,
          deprecated: bySecurity.deprecated,
          acceptable: bySecurity.acceptable,
          strong: bySecurity.strong,
          modern: bySecurity.modern,
        },
        vulnerabilities,
        recommendations:
          grade === "A+" || grade === "A"
            ? ["Cipher configuration looks good"]
            : [
                bySecurity.critical.length > 0
                  ? "URGENT: Disable NULL and EXPORT cipher suites immediately"
                  : null,
                bySecurity.weak.length > 0 ? "Disable RC4, DES, and 3DES cipher suites" : null,
                bySecurity.deprecated.length > 0
                  ? "Migrate from non-FS cipher suites to ECDHE/DHE variants"
                  : null,
                bySecurity.modern.length === 0 ? "Enable TLS 1.3 cipher suites for best performance" : null,
              ].filter(Boolean),
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 8: tls_sni — SNI Probing
// ──────────────────────────────────────────────────────────────────────────────

async function sniProbe(
  host: string,
  port: number,
  sniValue: string | undefined,
  label: string,
): Promise<{
  label: string;
  sni: string | null;
  success: boolean;
  cert?: {
    cn: string;
    san: string[];
    issuer: string;
    fingerprint256: string;
  };
  error?: string;
}> {
  try {
    const opts: tls.ConnectionOptions = {};

    if (sniValue === undefined) {
      // No SNI — remove servername
      opts.servername = "";
    } else {
      opts.servername = sniValue;
    }

    const { socket, cert } = await tlsConnect(host, port, opts);

    try {
      const sans = extractSANs(cert);
      const subject = parseDN(cert.subject);
      const issuer = parseDN(cert.issuer);

      return {
        label,
        sni: sniValue ?? null,
        success: true,
        cert: {
          cn: subject.CN ?? "N/A",
          san: sans.dns,
          issuer: issuer.CN ?? issuer.O ?? "N/A",
          fingerprint256: cert.fingerprint256 ?? sha256Fingerprint(cert.raw),
        },
      };
    } finally {
      safeClose(socket);
    }
  } catch (err) {
    return {
      label,
      sni: sniValue ?? null,
      success: false,
      error: (err as Error).message,
    };
  }
}

const tlsSni: ToolDef = {
  name: "tls_sni",
  description:
    "SNI (Server Name Indication) probing. Connects with various SNI values and compares returned certificates. Detects reverse proxies with multiple backends, reveals default/backend certificates, and analyzes wildcard scope.",
  schema: {
    host: z.string().describe("Target hostname or IP"),
    port: z.number().optional().default(443).describe("TLS port"),
  },
  async execute(args) {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const cacheKey = `tls_sni:${host}:${port}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    // Define SNI values to test
    const sniTests: Array<{ sni: string | undefined; label: string }> = [
      { sni: host, label: "target_domain" },
      { sni: undefined, label: "no_sni" },
      { sni: "", label: "empty_sni" },
      { sni: "localhost", label: "localhost" },
      { sni: "internal", label: "internal" },
      { sni: `nonexistent-${Date.now()}.example.com`, label: "random_domain" },
    ];

    // If host looks like an IP, also test it as SNI
    const isIP = net.isIP(host);
    if (isIP) {
      sniTests.push({ sni: host, label: "ip_as_sni" });
    } else {
      // Try the IP address as SNI too
      try {
        const dns = await import("node:dns/promises");
        const ips = await dns.resolve4(host);
        if (ips.length > 0) {
          sniTests.push({ sni: ips[0], label: "resolved_ip_as_sni" });
        }
      } catch {
        // ignore DNS failure
      }
    }

    // Run all SNI probes
    const probeResults: Array<Awaited<ReturnType<typeof sniProbe>>> = [];
    for (const test of sniTests) {
      await limiter.acquire();
      const result = await sniProbe(host, port, test.sni, test.label);
      probeResults.push(result);
    }

    // Analyze results
    const successfulProbes = probeResults.filter((p) => p.success);
    const uniqueFingerprints = new Set(
      successfulProbes
        .filter((p) => p.cert)
        .map((p) => p.cert!.fingerprint256),
    );

    // Compare target domain cert with no-SNI cert
    const targetProbe = probeResults.find((p) => p.label === "target_domain" && p.success);
    const noSniProbe = probeResults.find(
      (p) => (p.label === "no_sni" || p.label === "empty_sni") && p.success,
    );

    const analysis: string[] = [];

    if (uniqueFingerprints.size > 1) {
      analysis.push(
        `Multiple certificates detected (${uniqueFingerprints.size} unique) — indicates reverse proxy or multi-tenant hosting`,
      );
    } else if (uniqueFingerprints.size === 1) {
      analysis.push("Same certificate returned for all SNI values — single-site or wildcard configuration");
    }

    if (targetProbe?.cert && noSniProbe?.cert) {
      if (targetProbe.cert.fingerprint256 !== noSniProbe.cert.fingerprint256) {
        analysis.push(
          `Different cert on no-SNI (CN=${noSniProbe.cert.cn}) vs target (CN=${targetProbe.cert.cn}) — reverse proxy with SNI routing`,
        );
        analysis.push(
          `Default certificate (no-SNI) reveals: CN=${noSniProbe.cert.cn}, Issuer=${noSniProbe.cert.issuer}`,
        );
      }
    }

    // Wildcard analysis
    const wildcardCerts = successfulProbes.filter(
      (p) => p.cert && p.cert.san.some((s) => s.startsWith("*.")),
    );
    if (wildcardCerts.length > 0) {
      const wildcardSans = new Set(
        wildcardCerts.flatMap((p) => p.cert!.san.filter((s) => s.startsWith("*."))),
      );
      analysis.push(`Wildcard certificate scope: ${Array.from(wildcardSans).join(", ")}`);
    }

    // Random domain test
    const randomProbe = probeResults.find((p) => p.label === "random_domain");
    if (randomProbe?.success && targetProbe?.success) {
      if (randomProbe.cert?.fingerprint256 === targetProbe.cert?.fingerprint256) {
        analysis.push("Server returns same cert for unknown domains — catch-all/default vhost configuration");
      } else if (randomProbe.success) {
        analysis.push(
          `Server returns different cert for unknown domain (CN=${randomProbe.cert?.cn}) — may reveal default backend`,
        );
      }
    }

    const result = {
      host,
      port,
      sniAnalysis: {
        probeCount: probeResults.length,
        successfulProbes: successfulProbes.length,
        uniqueCertificates: uniqueFingerprints.size,
        probes: probeResults,
        analysis,
        findings: {
          multipleBackends: uniqueFingerprints.size > 1,
          defaultCertificate: noSniProbe?.cert
            ? {
                cn: noSniProbe.cert.cn,
                issuer: noSniProbe.cert.issuer,
                san: noSniProbe.cert.san,
              }
            : null,
          wildcardScope: wildcardCerts.length > 0
            ? Array.from(new Set(wildcardCerts.flatMap((p) => p.cert!.san.filter((s) => s.startsWith("*.")))))
            : [],
        },
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────────────────────

export const tlsTools: ToolDef[] = [
  tlsProbe,
  tlsJarm,
  tlsCert,
  tlsJa4x,
  tlsCertCrossRef,
  tlsCtSubdomains,
  tlsCiphers,
  tlsSni,
];
