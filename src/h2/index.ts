import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import * as http2 from "node:http2";
import * as tls from "node:tls";
import { H2_SIGNATURES, type H2Signature } from "../data/h2-signatures.js";

// ─── Module-Level Setup ───

const limiter = new RateLimiter(300);
const cache = new TTLCache<any>(600_000);

const H2_CONNECT_TIMEOUT = 10_000;
const GOAWAY_WAIT_TIMEOUT = 35_000; // wait up to 35s for idle GOAWAY
const PING_TIMEOUT = 5_000;

// ─── HTTP/2 SETTINGS parameter IDs ───

const SETTINGS_NAMES: Record<number, string> = {
  1: "HEADER_TABLE_SIZE",
  2: "ENABLE_PUSH",
  3: "MAX_CONCURRENT_STREAMS",
  4: "INITIAL_WINDOW_SIZE",
  5: "MAX_FRAME_SIZE",
  6: "MAX_HEADER_LIST_SIZE",
};

// ─── Helpers ───

interface H2Settings {
  headerTableSize?: number;
  enablePush?: number;
  maxConcurrentStreams?: number;
  initialWindowSize?: number;
  maxFrameSize?: number;
  maxHeaderListSize?: number;
}

function extractSettings(remoteSettings: http2.Settings): H2Settings {
  return {
    headerTableSize: remoteSettings.headerTableSize,
    enablePush: remoteSettings.enablePush === true ? 1 : remoteSettings.enablePush === false ? 0 : undefined,
    maxConcurrentStreams: remoteSettings.maxConcurrentStreams,
    initialWindowSize: remoteSettings.initialWindowSize,
    maxFrameSize: remoteSettings.maxFrameSize,
    maxHeaderListSize: remoteSettings.maxHeaderListSize,
  };
}

function matchSignature(settings: H2Settings): { match: string; confidence: number }[] {
  const matches: { match: string; confidence: number }[] = [];

  for (const sig of H2_SIGNATURES) {
    let matchedFields = 0;
    let totalFields = 0;

    const checks: [keyof H2Settings, number | undefined][] = [
      ["headerTableSize", sig.settings.headerTableSize],
      ["enablePush", sig.settings.enablePush],
      ["maxConcurrentStreams", sig.settings.maxConcurrentStreams],
      ["initialWindowSize", sig.settings.initialWindowSize],
      ["maxFrameSize", sig.settings.maxFrameSize],
      ["maxHeaderListSize", sig.settings.maxHeaderListSize],
    ];

    for (const [key, expected] of checks) {
      if (expected === undefined) continue;
      totalFields++;
      if (settings[key] === expected) matchedFields++;
    }

    if (totalFields > 0) {
      const confidence = Math.round((matchedFields / totalFields) * 100);
      if (confidence >= 60) {
        matches.push({ match: sig.server, confidence });
      }
    }
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
}

function connectH2(host: string, port: number): Promise<http2.ClientHttp2Session> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("HTTP/2 connection timeout"));
    }, H2_CONNECT_TIMEOUT);

    const session = http2.connect(`https://${host}:${port}`, {
      rejectUnauthorized: false,
    });

    session.on("connect", () => {
      clearTimeout(timer);
      resolve(session);
    });

    session.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function getRemoteSettings(session: http2.ClientHttp2Session): Promise<H2Settings> {
  return new Promise((resolve) => {
    // remoteSettings may already be populated if the connection is established
    const rs = session.remoteSettings;
    if (rs && Object.keys(rs).length > 0) {
      resolve(extractSettings(rs));
      return;
    }

    session.on("remoteSettings", (settings) => {
      resolve(extractSettings(settings));
    });

    // Fallback: if remoteSettings event doesn't fire, resolve after short delay
    setTimeout(() => {
      resolve(extractSettings(session.remoteSettings));
    }, 2000);
  });
}

function safeCloseSession(session: http2.ClientHttp2Session): void {
  try {
    session.close();
    session.destroy();
  } catch {
    // ignore
  }
}

// ─── Tool 1: h2_server_fp ───

async function h2ServerFp(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 443;
  const cacheKey = `h2_server_fp:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const session = await connectH2(host, port);
    const settings = await getRemoteSettings(session);

    // Format settings as the SETTINGS frame representation
    const settingsFrame: Record<string, number | undefined> = {};
    for (const [id, name] of Object.entries(SETTINGS_NAMES)) {
      const key = ({
        "1": "headerTableSize",
        "2": "enablePush",
        "3": "maxConcurrentStreams",
        "4": "initialWindowSize",
        "5": "maxFrameSize",
        "6": "maxHeaderListSize",
      } as Record<string, keyof H2Settings>)[id];
      if (key) {
        settingsFrame[`${name} (0x${id})`] = settings[key];
      }
    }

    // Match against known signatures
    const signatureMatches = matchSignature(settings);

    safeCloseSession(session);

    const result = {
      host,
      port,
      settings: settingsFrame,
      rawSettings: settings,
      signatureMatches,
      bestMatch: signatureMatches.length > 0 ? signatureMatches[0] : null,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({
      host,
      port,
      error: err instanceof Error ? err.message : String(err),
      note: "HTTP/2 connection failed. The server may not support HTTP/2, or the port may be wrong.",
    });
  }
}

// ─── Tool 2: h2_detect ───

async function h2Detect(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 443;
  const cacheKey = `h2_detect:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const support: {
    h1: boolean;
    h2: boolean;
    h2c: boolean;
    h3: boolean;
    alpnProtocol: string | null;
    altSvc: string | null;
  } = {
    h1: false,
    h2: false,
    h2c: false,
    h3: false,
    alpnProtocol: null,
    altSvc: null,
  };

  // 1. TLS ALPN negotiation — check h2 vs http/1.1
  try {
    const alpnResult = await new Promise<string | false | null>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("ALPN timeout")), H2_CONNECT_TIMEOUT);

      const socket = tls.connect(
        {
          host,
          port,
          ALPNProtocols: ["h2", "http/1.1"],
          rejectUnauthorized: false,
          servername: host,
        },
        () => {
          clearTimeout(timer);
          const proto = socket.alpnProtocol;
          resolve(proto);
          socket.end();
          socket.destroy();
        },
      );

      socket.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    if (alpnResult === "h2") {
      support.h2 = true;
      support.h1 = true; // servers supporting h2 over TLS typically also support h1
      support.alpnProtocol = "h2";
    } else if (alpnResult === "http/1.1") {
      support.h1 = true;
      support.alpnProtocol = "http/1.1";
    } else if (alpnResult) {
      support.alpnProtocol = String(alpnResult);
    }
  } catch {
    // TLS connection failed — leave h2 as false
  }

  // 2. h2c cleartext upgrade (only on port 80 or non-443)
  if (port !== 443) {
    try {
      const h2cResponse = await fetch(`http://${host}:${port}/`, {
        method: "GET",
        headers: {
          Connection: "Upgrade, HTTP2-Settings",
          Upgrade: "h2c",
          "HTTP2-Settings": "",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(H2_CONNECT_TIMEOUT),
      });

      if (h2cResponse.status === 101) {
        support.h2c = true;
      }
    } catch {
      // h2c not supported or host not reachable on cleartext
    }
  }

  // 3. HTTP/3 (QUIC) detection via Alt-Svc header
  try {
    const httpsUrl = `https://${host}:${port}/`;
    const response = await fetch(httpsUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(H2_CONNECT_TIMEOUT),
    });

    const altSvc = response.headers.get("alt-svc");
    if (altSvc) {
      support.altSvc = altSvc;
      if (/h3(?:=|-)/.test(altSvc) || altSvc.includes("h3")) {
        support.h3 = true;
      }
    }

    // If we didn't detect h1 from ALPN, check here
    if (!support.h1 && response.ok) {
      support.h1 = true;
    }
  } catch {
    // HTTPS fetch failed
  }

  const result = {
    host,
    port,
    support,
    summary: {
      protocols: [
        support.h1 ? "HTTP/1.1" : null,
        support.h2 ? "HTTP/2 (TLS)" : null,
        support.h2c ? "HTTP/2 (cleartext/h2c)" : null,
        support.h3 ? "HTTP/3 (QUIC)" : null,
      ].filter(Boolean),
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 3: h2_goaway ───

async function h2Goaway(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 443;
  const cacheKey = `h2_goaway:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const session = await connectH2(host, port);
    const connectTime = Date.now();

    // Gather results
    const result: {
      host: string;
      port: number;
      goaway: {
        received: boolean;
        errorCode: number | null;
        lastStreamID: number | null;
        debugData: string | null;
        idleTimeMs: number | null;
      };
      ping: {
        supported: boolean;
        rttMs: number | null;
      };
      settings: H2Settings;
    } = {
      host,
      port,
      goaway: {
        received: false,
        errorCode: null,
        lastStreamID: null,
        debugData: null,
        idleTimeMs: null,
      },
      ping: {
        supported: false,
        rttMs: null,
      },
      settings: extractSettings(session.remoteSettings),
    };

    // Listen for GOAWAY
    const goawayPromise = new Promise<void>((resolve) => {
      session.on("goaway", (errorCode: number, lastStreamID: number, opaqueData: Buffer) => {
        result.goaway.received = true;
        result.goaway.errorCode = errorCode;
        result.goaway.lastStreamID = lastStreamID;
        result.goaway.debugData = opaqueData.length > 0 ? opaqueData.toString("utf-8") : null;
        result.goaway.idleTimeMs = Date.now() - connectTime;
        resolve();
      });
    });

    // Send PING and measure latency
    const pingPromise = new Promise<void>((resolve) => {
      const pingTimer = setTimeout(() => {
        result.ping.supported = false;
        resolve();
      }, PING_TIMEOUT);

      try {
        const pingStart = performance.now();
        session.ping((err: Error | null, _duration: number, _payload: Buffer) => {
          clearTimeout(pingTimer);
          if (!err) {
            result.ping.supported = true;
            result.ping.rttMs = Math.round((performance.now() - pingStart) * 100) / 100;
          }
          resolve();
        });
      } catch {
        clearTimeout(pingTimer);
        resolve();
      }
    });

    // Wait for ping result
    await pingPromise;

    // Wait for GOAWAY or timeout
    const goawayTimer = new Promise<void>((resolve) =>
      setTimeout(resolve, GOAWAY_WAIT_TIMEOUT),
    );

    await Promise.race([goawayPromise, goawayTimer]);

    safeCloseSession(session);

    // Match GOAWAY behavior against known signatures
    const behaviorMatches: { server: string; note: string }[] = [];
    if (result.goaway.received && result.goaway.idleTimeMs !== null) {
      const idleTimeSec = Math.round(result.goaway.idleTimeMs / 1000);
      for (const sig of H2_SIGNATURES) {
        if (sig.goawayTimeout !== undefined) {
          // Allow 20% tolerance on timeout matching
          const diff = Math.abs(idleTimeSec - sig.goawayTimeout);
          const tolerance = Math.max(sig.goawayTimeout * 0.2, 5);
          if (diff <= tolerance) {
            let note = `GOAWAY timeout ~${idleTimeSec}s matches ${sig.server} (expected ~${sig.goawayTimeout}s)`;
            if (sig.goawayDebugData !== undefined && result.goaway.debugData === sig.goawayDebugData) {
              note += ` with matching debug data "${sig.goawayDebugData}"`;
            }
            behaviorMatches.push({ server: sig.server, note });
          }
        }
      }
    }

    const finalResult = {
      ...result,
      behaviorMatches,
      notes: [
        result.goaway.received
          ? `Server sent GOAWAY after ~${Math.round((result.goaway.idleTimeMs ?? 0) / 1000)}s idle`
          : `No GOAWAY received within ${GOAWAY_WAIT_TIMEOUT / 1000}s`,
        result.ping.supported
          ? `PING/PONG RTT: ${result.ping.rttMs}ms`
          : "Server did not respond to PING",
      ],
    };

    cache.set(cacheKey, finalResult);
    return json(finalResult);
  } catch (err) {
    return json({
      host,
      port,
      error: err instanceof Error ? err.message : String(err),
      note: "HTTP/2 connection failed. The server may not support HTTP/2.",
    });
  }
}

// ─── Tool Definitions ───

export const h2Tools: ToolDef[] = [
  {
    name: "h2_server_fp",
    description:
      "HTTP/2 server SETTINGS frame fingerprint. Connects via HTTP/2 ALPN and captures the server's initial SETTINGS parameters (HEADER_TABLE_SIZE, ENABLE_PUSH, MAX_CONCURRENT_STREAMS, INITIAL_WINDOW_SIZE, MAX_FRAME_SIZE, MAX_HEADER_LIST_SIZE) to identify the server implementation. Compares against known signatures for Nginx, Apache, Envoy, Cloudflare, AWS ALB, Caddy, LiteSpeed, and others.",
    schema: {
      host: z.string().describe("Target hostname"),
      port: z.number().optional().default(443).describe("HTTPS port"),
    },
    execute: h2ServerFp,
  },
  {
    name: "h2_detect",
    description:
      "HTTP/2 + HTTP/3 + QUIC support detection. Tests TLS ALPN negotiation for h2 vs http/1.1, h2c cleartext upgrade via HTTP/1.1 Upgrade header, and HTTP/3 QUIC support via Alt-Svc response header. Returns a support matrix showing which protocol versions the server supports.",
    schema: {
      host: z.string().describe("Target hostname"),
      port: z.number().optional().default(443).describe("Port"),
    },
    execute: h2Detect,
  },
  {
    name: "h2_goaway",
    description:
      "HTTP/2 GOAWAY frame behavior analysis. Connects via HTTP/2, holds an idle connection, observes when and how the server sends a GOAWAY frame (timing, error code, debug data). Also tests PING frame handling and measures PONG latency. Different servers exhibit characteristic idle timeout durations and debug strings.",
    schema: {
      host: z.string().describe("Target hostname"),
      port: z.number().optional().default(443).describe("Port"),
    },
    execute: h2Goaway,
  },
];
