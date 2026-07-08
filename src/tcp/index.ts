import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { json } from "../types/index.js";
import * as net from "node:net";

const limiter = new RateLimiter(200);

// ─── Helpers ───

const DEFAULT_PORTS = [80, 443, 22, 8080, 8443];
const CONNECT_TIMEOUT = 5_000;
const BANNER_TIMEOUT = 2_000;

interface ProbeResult {
  port: number;
  open: boolean;
  connectTimeMs: number;
  remoteFamily?: string;
  localPort?: number;
  banner?: string;
  error?: string;
}

/** Connect to a TCP port and measure timing + grab initial banner data. */
function tcpConnect(
  host: string,
  port: number,
): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const start = performance.now();
    const result: ProbeResult = { port, open: false, connectTimeMs: 0 };

    const connectTimer = setTimeout(() => {
      socket.destroy();
      result.error = "connection timeout";
      resolve(result);
    }, CONNECT_TIMEOUT);

    const socket = net.connect({ host, port }, () => {
      clearTimeout(connectTimer);
      result.open = true;
      result.connectTimeMs = Math.round((performance.now() - start) * 100) / 100;
      result.remoteFamily = socket.remoteFamily;
      result.localPort = socket.localPort;

      const chunks: Buffer[] = [];
      let bannerTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = () => {
        if (bannerTimer) clearTimeout(bannerTimer);
        socket.destroy();
        if (chunks.length > 0) {
          const raw = Buffer.concat(chunks);
          // Attempt UTF-8 decode; fall back to hex for binary
          const text = raw.toString("utf-8");
          const hasBinary = text.includes("\ufffd") || /[\x00-\x08\x0e-\x1f]/.test(text.slice(0, 64));
          result.banner = hasBinary
            ? `(binary ${raw.length} bytes) ${raw.toString("hex").slice(0, 128)}`
            : text.trim().slice(0, 1024);
        }
        resolve(result);
      };

      socket.on("data", (data: Buffer) => {
        chunks.push(data);
        // If we got data, give a short window for more, then finish
        if (bannerTimer) clearTimeout(bannerTimer);
        bannerTimer = setTimeout(finish, 500);
      });

      // Wait up to BANNER_TIMEOUT for any data
      bannerTimer = setTimeout(finish, BANNER_TIMEOUT);
    });

    socket.on("error", (err: Error) => {
      clearTimeout(connectTimer);
      result.error = err.message;
      resolve(result);
    });
  });
}

// ─── Protocol Detection Patterns ───

interface ProtocolDetection {
  protocol: string;
  confidence: "high" | "medium" | "low";
  version?: string;
  details?: string;
}

function detectProtocol(banner: string, rawBanner?: string): ProtocolDetection | null {
  if (!banner) return null;

  if (banner.startsWith("SSH-")) {
    const match = banner.match(/^SSH-([\d.]+)-(.+?)(?:\s+(.+))?$/);
    return {
      protocol: "SSH",
      confidence: "high",
      version: match ? match[2] : undefined,
      details: match?.[3] ?? undefined,
    };
  }

  if (/^220[\s-]/.test(banner)) {
    // Distinguish FTP vs SMTP
    if (/ftp|vsftpd|proftpd|pure-ftpd|filezilla/i.test(banner)) {
      return { protocol: "FTP", confidence: "high", details: banner.split("\n")[0] };
    }
    if (/smtp|mail|postfix|sendmail|exim|exchange|esmtp/i.test(banner)) {
      return { protocol: "SMTP", confidence: "high", details: banner.split("\n")[0] };
    }
    return { protocol: "FTP/SMTP", confidence: "medium", details: banner.split("\n")[0] };
  }

  if (banner.startsWith("* OK")) {
    return { protocol: "IMAP", confidence: "high", details: banner.split("\n")[0] };
  }

  if (banner.startsWith("+OK")) {
    return { protocol: "POP3", confidence: "high", details: banner.split("\n")[0] };
  }

  if (banner.startsWith("HTTP/")) {
    const match = banner.match(/^HTTP\/([\d.]+)\s+(\d+)/);
    return {
      protocol: "HTTP",
      confidence: "high",
      version: match ? match[1] : undefined,
      details: match ? `Status ${match[2]}` : undefined,
    };
  }

  if (banner.startsWith("-NOAUTH") || banner.startsWith("+PONG") || banner.startsWith("-ERR") || banner.startsWith("$")) {
    return { protocol: "Redis", confidence: "high" };
  }

  if (banner.startsWith("STAT ") || banner.startsWith("END")) {
    return { protocol: "Memcached", confidence: "high" };
  }

  // MySQL greeting: starts with binary packet containing 0x0a (protocol version 10)
  if (rawBanner && rawBanner.startsWith("(binary")) {
    const hexPart = rawBanner.replace(/^\(binary \d+ bytes\)\s*/, "");
    // MySQL: packet length (3 bytes) + sequence (1 byte) + 0x0a
    if (hexPart.length >= 10 && hexPart.substring(8, 10) === "0a") {
      return { protocol: "MySQL", confidence: "medium" };
    }
    // MongoDB wire protocol
    if (hexPart.length > 24) {
      return { protocol: "Binary Protocol (possible MongoDB/custom)", confidence: "low" };
    }
  }

  return null;
}

// ─── Tool 1: tcp_probe ───

async function tcpProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const ports = (args.ports as number[] | undefined) ?? DEFAULT_PORTS;

  await limiter.acquire();

  const results: ProbeResult[] = [];

  for (const port of ports) {
    const result = await tcpConnect(host, port);
    results.push(result);
  }

  const openPorts = results.filter((r) => r.open);
  const closedPorts = results.filter((r) => !r.open);

  // Backend analysis: compare timing and banners across open ports
  const analysis: {
    openPorts: number[];
    closedPorts: number[];
    backendGroups: { ports: number[]; avgConnectTimeMs: number; banner?: string }[];
    loadBalancerDetected: boolean;
    notes: string[];
  } = {
    openPorts: openPorts.map((r) => r.port),
    closedPorts: closedPorts.map((r) => r.port),
    backendGroups: [],
    loadBalancerDetected: false,
    notes: [],
  };

  // Group by similar timing (within 20% tolerance) and banner similarity
  if (openPorts.length > 1) {
    const groups: Map<string, ProbeResult[]> = new Map();

    for (const result of openPorts) {
      const bannerKey = result.banner?.slice(0, 50) ?? "(no banner)";
      let placed = false;

      for (const [key, group] of groups) {
        const avgTime = group.reduce((sum, r) => sum + r.connectTimeMs, 0) / group.length;
        const timeDiff = Math.abs(result.connectTimeMs - avgTime) / avgTime;
        const samePrefix = key === bannerKey;

        if (timeDiff < 0.2 && samePrefix) {
          group.push(result);
          placed = true;
          break;
        }
      }

      if (!placed) {
        const key = bannerKey;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(result);
      }
    }

    for (const [bannerKey, group] of groups) {
      const avgTime =
        Math.round((group.reduce((sum, r) => sum + r.connectTimeMs, 0) / group.length) * 100) / 100;
      analysis.backendGroups.push({
        ports: group.map((r) => r.port),
        avgConnectTimeMs: avgTime,
        banner: bannerKey !== "(no banner)" ? bannerKey : undefined,
      });
    }

    if (analysis.backendGroups.length > 1) {
      analysis.loadBalancerDetected = true;
      analysis.notes.push(
        "Different backend groups detected across ports — possible load balancer, reverse proxy, or different services.",
      );
    } else {
      analysis.notes.push(
        "All open ports show similar timing and banner patterns — likely same backend.",
      );
    }
  }

  // Timing notes
  if (openPorts.length > 0) {
    const avgConnect =
      openPorts.reduce((sum, r) => sum + r.connectTimeMs, 0) / openPorts.length;
    if (avgConnect < 5) {
      analysis.notes.push("Very low latency — target is likely on same network or nearby.");
    } else if (avgConnect > 200) {
      analysis.notes.push(
        "High connection latency — target may be geographically distant or behind rate limiting.",
      );
    }
  }

  return json({
    host,
    probes: results.map((r) => ({
      port: r.port,
      open: r.open,
      connectTimeMs: r.connectTimeMs,
      remoteFamily: r.remoteFamily,
      localPort: r.localPort,
      banner: r.banner,
      error: r.error,
    })),
    analysis,
  });
}

// ─── Tool 2: tcp_banner ───

/** Protocol probes to send when no banner arrives automatically. */
const PROTOCOL_PROBES: { name: string; probe: Buffer; waitMs: number }[] = [
  { name: "Redis PING", probe: Buffer.from("PING\r\n"), waitMs: 1500 },
  { name: "Memcached stats", probe: Buffer.from("stats\r\n"), waitMs: 1500 },
  { name: "HTTP GET", probe: Buffer.from("GET / HTTP/1.0\r\nHost: target\r\n\r\n"), waitMs: 2000 },
];

function tcpBannerGrab(
  host: string,
  port: number,
): Promise<{
  banner: string | null;
  protocol: ProtocolDetection | null;
  probeSent: string | null;
  connectTimeMs: number;
  rawHex?: string;
}> {
  return new Promise((resolve) => {
    const start = performance.now();
    let finished = false;

    const finish = (result: {
      banner: string | null;
      protocol: ProtocolDetection | null;
      probeSent: string | null;
      connectTimeMs: number;
      rawHex?: string;
    }) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(result);
    };

    const connectTimer = setTimeout(() => {
      finish({
        banner: null,
        protocol: null,
        probeSent: null,
        connectTimeMs: 0,
      });
    }, CONNECT_TIMEOUT);

    const socket = net.connect({ host, port }, () => {
      clearTimeout(connectTimer);
      const connectTimeMs = Math.round((performance.now() - start) * 100) / 100;

      const chunks: Buffer[] = [];
      let probeIndex = -1;
      let probeSent: string | null = null;
      let dataTimer: ReturnType<typeof setTimeout> | null = null;
      let waitingForAutoResponse = true;

      const processResponse = () => {
        if (dataTimer) clearTimeout(dataTimer);
        const raw = Buffer.concat(chunks);
        const text = raw.toString("utf-8").trim();
        const hasBinary = /[\x00-\x08\x0e-\x1f]/.test(text.slice(0, 64));
        const bannerStr = hasBinary
          ? `(binary ${raw.length} bytes) ${raw.toString("hex").slice(0, 128)}`
          : text.slice(0, 2048);

        const detected = detectProtocol(bannerStr, hasBinary ? bannerStr : undefined);

        finish({
          banner: bannerStr || null,
          protocol: detected,
          probeSent,
          connectTimeMs,
          rawHex: hasBinary ? raw.toString("hex").slice(0, 256) : undefined,
        });
      };

      socket.on("data", (data: Buffer) => {
        chunks.push(data);
        waitingForAutoResponse = false;
        // Give a short window for more data
        if (dataTimer) clearTimeout(dataTimer);
        dataTimer = setTimeout(processResponse, 500);
      });

      const sendNextProbe = () => {
        if (!waitingForAutoResponse && chunks.length > 0) {
          // Already got data, process it
          processResponse();
          return;
        }

        probeIndex++;
        if (probeIndex >= PROTOCOL_PROBES.length) {
          // No more probes to try — return what we have (if anything)
          if (chunks.length > 0) {
            processResponse();
          } else {
            finish({
              banner: null,
              protocol: null,
              probeSent,
              connectTimeMs,
            });
          }
          return;
        }

        const probe = PROTOCOL_PROBES[probeIndex];
        probeSent = probe.name;
        waitingForAutoResponse = false;
        chunks.length = 0;

        try {
          socket.write(probe.probe);
        } catch {
          // Socket may have been closed by remote
          finish({
            banner: null,
            protocol: null,
            probeSent,
            connectTimeMs,
          });
          return;
        }

        dataTimer = setTimeout(() => {
          if (chunks.length > 0) {
            processResponse();
          } else {
            sendNextProbe();
          }
        }, probe.waitMs);
      };

      // First, wait for auto-response from server (some protocols send greeting automatically)
      dataTimer = setTimeout(() => {
        if (chunks.length > 0) {
          processResponse();
        } else {
          // No auto-banner; start sending probes
          sendNextProbe();
        }
      }, BANNER_TIMEOUT);
    });

    socket.on("error", (err: Error) => {
      clearTimeout(connectTimer);
      finish({
        banner: null,
        protocol: null,
        probeSent: null,
        connectTimeMs: 0,
      });
    });
  });
}

async function tcpBanner(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = args.port as number;

  await limiter.acquire();

  const result = await tcpBannerGrab(host, port);

  return json({
    host,
    port,
    banner: result.banner,
    protocol: result.protocol,
    probeSent: result.probeSent,
    connectTimeMs: result.connectTimeMs,
    rawHex: result.rawHex,
  });
}

// ─── Tool Definitions ───

export const tcpTools: ToolDef[] = [
  {
    name: "tcp_probe",
    description:
      "TCP connection fingerprint. Connects to target port(s) and measures SYN-ACK latency, reads initial banners, and compares signals across ports to detect load balancing or different backends. Useful for infrastructure mapping without HTTP.",
    schema: {
      host: z.string().describe("Target host"),
      ports: z
        .array(z.number())
        .optional()
        .describe("Ports to probe (default: [80, 443, 22, 8080, 8443])"),
    },
    execute: tcpProbe,
  },
  {
    name: "tcp_banner",
    description:
      "Banner grab on arbitrary TCP port. Connects via TCP, reads initial server data, and auto-detects protocol (SSH, FTP, SMTP, MySQL, Redis, IMAP, POP3, HTTP, Memcached, MongoDB). Sends protocol-specific probes for services that do not send a greeting automatically.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().describe("TCP port to grab banner from"),
    },
    execute: tcpBanner,
  },
];
