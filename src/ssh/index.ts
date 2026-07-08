import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { json } from "../types/index.js";
import * as net from "node:net";
import { createHash } from "node:crypto";

const limiter = new RateLimiter(300);
const cache = new TTLCache<any>(600_000); // 10min cache

// ─── Constants ───

const CONNECT_TIMEOUT = 10_000;
const BANNER_READ_TIMEOUT = 5_000;
const KEXINIT_READ_TIMEOUT = 8_000;
const SSH_MSG_KEXINIT = 20;
const CLIENT_BANNER = "SSH-2.0-fingerprint-mcp\r\n";

// ─── Deprecated / Weak Algorithm Sets ───

const WEAK_KEX = new Set([
  "diffie-hellman-group1-sha1",
  "diffie-hellman-group-exchange-sha1",
  "diffie-hellman-group14-sha1",
  "ecdh-sha2-nistp256", // not weak per se, but NIST concerns
]);

const DEPRECATED_KEX = new Set([
  "diffie-hellman-group1-sha1",
  "diffie-hellman-group-exchange-sha1",
]);

const WEAK_CIPHERS = new Set([
  "3des-cbc",
  "arcfour",
  "arcfour128",
  "arcfour256",
  "blowfish-cbc",
  "cast128-cbc",
  "aes128-cbc",
  "aes192-cbc",
  "aes256-cbc",
  "rijndael-cbc@lysator.liu.se",
]);

const DEPRECATED_CIPHERS = new Set([
  "3des-cbc",
  "arcfour",
  "arcfour128",
  "arcfour256",
  "blowfish-cbc",
  "cast128-cbc",
]);

const WEAK_MACS = new Set([
  "hmac-sha1",
  "hmac-sha1-96",
  "hmac-md5",
  "hmac-md5-96",
  "umac-64@openssh.com",
]);

const DEPRECATED_MACS = new Set([
  "hmac-md5",
  "hmac-md5-96",
]);

const WEAK_HOST_KEY_TYPES = new Set([
  "ssh-rsa",
  "ssh-dss",
]);

// ─── OpenSSH Version to Algorithm Mapping (for version pinpointing) ───

const OPENSSH_VERSION_HINTS: { version: string; indicators: string[]; missing: string[] }[] = [
  {
    version: "9.x+",
    indicators: ["sntrup761x25519-sha512@openssh.com"],
    missing: ["ssh-rsa"],
  },
  {
    version: "8.5+",
    indicators: ["sk-ssh-ed25519@openssh.com"],
    missing: [],
  },
  {
    version: "8.x",
    indicators: ["curve25519-sha256", "chacha20-poly1305@openssh.com"],
    missing: ["diffie-hellman-group1-sha1"],
  },
  {
    version: "7.x",
    indicators: ["curve25519-sha256@libssh.org", "diffie-hellman-group14-sha256"],
    missing: [],
  },
  {
    version: "6.x",
    indicators: ["ecdh-sha2-nistp256"],
    missing: ["curve25519-sha256"],
  },
];

// ─── Dropbear Algorithm Signatures ───

const DROPBEAR_INDICATORS = [
  "diffie-hellman-group14-sha256",
  "ecdh-sha2-nistp521",
  "ecdh-sha2-nistp384",
];
const DROPBEAR_MISSING = ["curve25519-sha256@libssh.org"];

// ─── SSH Banner Parsing ───

interface SSHBannerInfo {
  raw: string;
  protocolVersion: string;
  softwareName: string;
  softwareVersion: string;
  os?: string;
  comments?: string;
}

function parseSSHBanner(banner: string): SSHBannerInfo {
  const raw = banner.trim();
  const result: SSHBannerInfo = {
    raw,
    protocolVersion: "",
    softwareName: "",
    softwareVersion: "",
  };

  // SSH-<protoversion>-<softwareversion> <comments>
  const match = raw.match(/^SSH-([\d.]+)-(\S+?)(?:\s+(.+))?$/);
  if (!match) {
    result.protocolVersion = "unknown";
    result.softwareName = raw;
    return result;
  }

  result.protocolVersion = match[1];
  const softwarePart = match[2];
  result.comments = match[3];

  // Parse software name and version: "OpenSSH_9.7", "dropbear_2022.83"
  const swMatch = softwarePart.match(/^(.+?)[-_]([\d][\d._p]+.*)$/);
  if (swMatch) {
    result.softwareName = swMatch[1];
    result.softwareVersion = swMatch[2];
  } else {
    result.softwareName = softwarePart;
  }

  // OS detection from comments or software string
  if (result.comments) {
    const osPatterns: { pattern: RegExp; os: string }[] = [
      { pattern: /Ubuntu/i, os: "Ubuntu Linux" },
      { pattern: /Debian/i, os: "Debian Linux" },
      { pattern: /FreeBSD/i, os: "FreeBSD" },
      { pattern: /CentOS/i, os: "CentOS Linux" },
      { pattern: /Red Hat/i, os: "Red Hat Enterprise Linux" },
      { pattern: /Fedora/i, os: "Fedora Linux" },
      { pattern: /SUSE/i, os: "SUSE Linux" },
      { pattern: /Raspbian/i, os: "Raspbian (Raspberry Pi)" },
      { pattern: /Arch/i, os: "Arch Linux" },
      { pattern: /Gentoo/i, os: "Gentoo Linux" },
      { pattern: /Alpine/i, os: "Alpine Linux" },
    ];
    for (const { pattern, os } of osPatterns) {
      if (pattern.test(result.comments)) {
        result.os = os;
        break;
      }
    }
  }

  return result;
}

// ─── KEXINIT Binary Parsing ───

interface KexInitData {
  cookie: string;
  kexAlgorithms: string[];
  serverHostKeyAlgorithms: string[];
  encryptionClientToServer: string[];
  encryptionServerToClient: string[];
  macClientToServer: string[];
  macServerToClient: string[];
  compressionClientToServer: string[];
  compressionServerToClient: string[];
  languagesClientToServer: string[];
  languagesServerToClient: string[];
}

function parseKexInit(data: Buffer): KexInitData | null {
  try {
    // SSH packet: 4 bytes length + 1 byte padding length + payload
    if (data.length < 6) return null;

    let offset = 0;

    // Read packet length
    const packetLength = data.readUInt32BE(offset);
    offset += 4;

    // Read padding length
    const paddingLength = data.readUInt8(offset);
    offset += 1;

    // Read message type
    const msgType = data.readUInt8(offset);
    offset += 1;

    if (msgType !== SSH_MSG_KEXINIT) {
      // Maybe the data doesn't start with the length prefix (some servers)
      // Try interpreting from byte 0 as the message type
      offset = 0;
      const altMsgType = data.readUInt8(offset);
      offset += 1;
      if (altMsgType !== SSH_MSG_KEXINIT) return null;
    }

    // 16 bytes cookie
    if (offset + 16 > data.length) return null;
    const cookie = data.subarray(offset, offset + 16).toString("hex");
    offset += 16;

    // Read 10 name-lists
    const nameLists: string[][] = [];
    for (let i = 0; i < 10; i++) {
      if (offset + 4 > data.length) return null;
      const listLength = data.readUInt32BE(offset);
      offset += 4;

      if (offset + listLength > data.length) return null;
      const listStr = data.subarray(offset, offset + listLength).toString("utf-8");
      offset += listLength;

      nameLists.push(listStr.length > 0 ? listStr.split(",") : []);
    }

    return {
      cookie,
      kexAlgorithms: nameLists[0],
      serverHostKeyAlgorithms: nameLists[1],
      encryptionClientToServer: nameLists[2],
      encryptionServerToClient: nameLists[3],
      macClientToServer: nameLists[4],
      macServerToClient: nameLists[5],
      compressionClientToServer: nameLists[6],
      compressionServerToClient: nameLists[7],
      languagesClientToServer: nameLists[8],
      languagesServerToClient: nameLists[9],
    };
  } catch {
    return null;
  }
}

// ─── HASSH Fingerprint ───

function computeHASSH(kex: KexInitData): { hassh: string; hasshRaw: string } {
  // HASSH = MD5(kex_algorithms;encryption_algorithms_client_to_server;mac_algorithms_client_to_server;compression_algorithms_client_to_server)
  const hasshRaw = [
    kex.kexAlgorithms.join(","),
    kex.encryptionClientToServer.join(","),
    kex.macClientToServer.join(","),
    kex.compressionClientToServer.join(","),
  ].join(";");

  const hassh = createHash("md5").update(hasshRaw).digest("hex");
  return { hassh, hasshRaw };
}

// ─── SSH Connection + KEXINIT Exchange ───

interface SSHProbeResult {
  banner: SSHBannerInfo | null;
  kexInit: KexInitData | null;
  hassh: string | null;
  hasshRaw: string | null;
  error?: string;
}

function performSSHProbe(host: string, port: number): Promise<SSHProbeResult> {
  return new Promise((resolve) => {
    const result: SSHProbeResult = {
      banner: null,
      kexInit: null,
      hassh: null,
      hasshRaw: null,
    };

    let finished = false;
    const finish = (socket: net.Socket) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(result);
    };

    const connectTimer = setTimeout(() => {
      result.error = "connection timeout";
      resolve(result);
    }, CONNECT_TIMEOUT);

    const socket = net.connect({ host, port }, () => {
      clearTimeout(connectTimer);

      let buffer = Buffer.alloc(0);
      let bannerRead = false;
      let bannerStr = "";
      let kexPhaseTimer: ReturnType<typeof setTimeout> | null = null;

      socket.on("data", (chunk: Buffer) => {
        buffer = Buffer.concat([buffer, chunk]);

        // Phase 1: Read banner (text line ending with \n)
        if (!bannerRead) {
          const newlineIdx = buffer.indexOf(0x0a); // \n
          if (newlineIdx !== -1) {
            bannerStr = buffer.subarray(0, newlineIdx).toString("utf-8").replace(/\r$/, "");
            result.banner = parseSSHBanner(bannerStr);
            buffer = buffer.subarray(newlineIdx + 1);
            bannerRead = true;

            // Send our client banner to trigger KEXINIT exchange
            try {
              socket.write(CLIENT_BANNER);
            } catch {
              finish(socket);
              return;
            }

            // Set timeout for KEXINIT phase
            kexPhaseTimer = setTimeout(() => {
              // We got the banner but no KEXINIT — still useful
              finish(socket);
            }, KEXINIT_READ_TIMEOUT);
          } else if (buffer.length > 1024) {
            // Banner too long — not a real SSH server
            result.error = "banner exceeded 1024 bytes";
            finish(socket);
            return;
          }
          // If no newline yet, wait for more data
          if (!bannerRead) return;
        }

        // Phase 2: Read KEXINIT binary packet
        // Need at least 4 bytes for packet length
        if (buffer.length >= 4) {
          const packetLength = buffer.readUInt32BE(0);

          // Sanity check: packet shouldn't be > 64KB for KEXINIT
          if (packetLength > 65536) {
            if (kexPhaseTimer) clearTimeout(kexPhaseTimer);
            finish(socket);
            return;
          }

          // Wait for full packet: 4 (length field) + packetLength
          if (buffer.length >= 4 + packetLength) {
            const kexPacket = buffer.subarray(0, 4 + packetLength);
            const parsed = parseKexInit(kexPacket);

            if (parsed) {
              result.kexInit = parsed;
              const { hassh, hasshRaw } = computeHASSH(parsed);
              result.hassh = hassh;
              result.hasshRaw = hasshRaw;
            }

            if (kexPhaseTimer) clearTimeout(kexPhaseTimer);
            finish(socket);
            return;
          }
        }
      });

      // Timeout for initial banner read
      setTimeout(() => {
        if (!bannerRead) {
          result.error = "banner read timeout";
          finish(socket);
        }
      }, BANNER_READ_TIMEOUT);
    });

    socket.on("error", (err: Error) => {
      clearTimeout(connectTimer);
      result.error = err.message;
      resolve(result);
    });
  });
}

// ─── Banner Spoofing Detection ───

interface SpoofingResult {
  detected: boolean;
  reason?: string;
  bannerClaims: string;
  algorithmsSuggest?: string;
}

function detectBannerSpoofing(banner: SSHBannerInfo, kex: KexInitData): SpoofingResult {
  const bannerSw = banner.softwareName.toLowerCase();

  // Check if banner says OpenSSH but algorithms suggest Dropbear
  if (bannerSw.includes("openssh")) {
    const hasDropbearSign =
      DROPBEAR_INDICATORS.some((a) => kex.kexAlgorithms.includes(a)) &&
      DROPBEAR_MISSING.every((a) => !kex.kexAlgorithms.includes(a));

    if (hasDropbearSign) {
      return {
        detected: true,
        reason:
          "Banner claims OpenSSH but algorithm set matches Dropbear profile (missing curve25519-sha256@libssh.org, has dropbear-specific kex)",
        bannerClaims: "OpenSSH",
        algorithmsSuggest: "Dropbear",
      };
    }
  }

  // Check if banner says Dropbear but algorithms suggest OpenSSH
  if (bannerSw.includes("dropbear")) {
    const hasOpenSSHSign = kex.kexAlgorithms.includes("curve25519-sha256@libssh.org") ||
      kex.kexAlgorithms.includes("sntrup761x25519-sha512@openssh.com");

    if (hasOpenSSHSign) {
      return {
        detected: true,
        reason:
          "Banner claims Dropbear but algorithm set includes OpenSSH-specific extensions (curve25519-sha256@libssh.org or sntrup761)",
        bannerClaims: "Dropbear",
        algorithmsSuggest: "OpenSSH",
      };
    }
  }

  // Check for libssh
  if (bannerSw.includes("openssh")) {
    if (kex.encryptionClientToServer.includes("chacha20-poly1305") &&
        !kex.encryptionClientToServer.includes("chacha20-poly1305@openssh.com")) {
      return {
        detected: true,
        reason: "Banner claims OpenSSH but cipher names lack @openssh.com suffix — possible libssh or custom implementation",
        bannerClaims: "OpenSSH",
        algorithmsSuggest: "libssh or custom",
      };
    }
  }

  return {
    detected: false,
    bannerClaims: banner.softwareName,
  };
}

// ─── Version Pinpointing from Algorithms ───

function pinpointVersion(kex: KexInitData): string | null {
  for (const hint of OPENSSH_VERSION_HINTS) {
    const hasIndicators = hint.indicators.every((a) =>
      kex.kexAlgorithms.includes(a) ||
      kex.encryptionClientToServer.includes(a) ||
      kex.serverHostKeyAlgorithms.includes(a),
    );
    const missingCorrectly = hint.missing.every((a) =>
      !kex.kexAlgorithms.includes(a) &&
      !kex.encryptionClientToServer.includes(a) &&
      !kex.serverHostKeyAlgorithms.includes(a),
    );

    if (hasIndicators && missingCorrectly) {
      return `OpenSSH ${hint.version} (estimated from algorithm set)`;
    }
  }
  return null;
}

// ─── Tool 1: ssh_probe ───

async function sshProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 22;
  const cacheKey = `ssh_probe:${host}:${port}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const probe = await performSSHProbe(host, port);

  if (probe.error && !probe.banner) {
    const errorResult = {
      host,
      port,
      error: probe.error,
      banner: null,
      kexInit: null,
      hassh: null,
    };
    return json(errorResult);
  }

  const spoofing = probe.banner && probe.kexInit
    ? detectBannerSpoofing(probe.banner, probe.kexInit)
    : null;

  const versionEstimate = probe.kexInit ? pinpointVersion(probe.kexInit) : null;

  const result = {
    host,
    port,
    banner: probe.banner,
    kexInit: probe.kexInit
      ? {
          cookie: probe.kexInit.cookie,
          kexAlgorithms: probe.kexInit.kexAlgorithms,
          serverHostKeyAlgorithms: probe.kexInit.serverHostKeyAlgorithms,
          encryptionClientToServer: probe.kexInit.encryptionClientToServer,
          encryptionServerToClient: probe.kexInit.encryptionServerToClient,
          macClientToServer: probe.kexInit.macClientToServer,
          macServerToClient: probe.kexInit.macServerToClient,
          compressionClientToServer: probe.kexInit.compressionClientToServer,
          compressionServerToClient: probe.kexInit.compressionServerToClient,
        }
      : null,
    hassh: probe.hassh,
    hasshRaw: probe.hasshRaw,
    bannerSpoofing: spoofing,
    versionEstimate,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 2: ssh_hostkey_lookup ───

async function sshHostkeyLookup(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 22;

  await limiter.acquire();

  // First, get the SSH host key fingerprint via probe
  const probe = await performSSHProbe(host, port);

  if (!probe.kexInit) {
    return json({
      host,
      port,
      error: probe.error ?? "Could not retrieve SSH KEXINIT — cannot extract host key fingerprint",
      fingerprint: null,
      shodanResults: null,
    });
  }

  // We compute the HASSH as the "fingerprint" for cross-referencing.
  // For a true host key fingerprint, we would need to complete the key exchange,
  // but HASSH (algorithm fingerprint) is more useful for finding cloned configs.
  const { hassh } = computeHASSH(probe.kexInit);

  const result: {
    host: string;
    port: number;
    banner: SSHBannerInfo | null;
    hassh: string;
    serverHostKeyAlgorithms: string[];
    shodanResults: {
      total: number;
      matches: { ip: string; port: number; org?: string; isp?: string; os?: string }[];
    } | null;
    shodanError?: string;
  } = {
    host,
    port,
    banner: probe.banner,
    hassh,
    serverHostKeyAlgorithms: probe.kexInit.serverHostKeyAlgorithms,
    shodanResults: null,
  };

  // Query Shodan if API key is available
  const shodanKey = ctx.config.shodanApiKey;
  if (shodanKey) {
    try {
      const query = encodeURIComponent(`ssh.hassh:${hassh}`);
      const url = `https://api.shodan.io/shodan/host/search?key=${shodanKey}&query=${query}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data = (await response.json()) as {
          total: number;
          matches: { ip_str: string; port: number; org?: string; isp?: string; os?: string }[];
        };

        result.shodanResults = {
          total: data.total,
          matches: (data.matches ?? []).slice(0, 25).map((m) => ({
            ip: m.ip_str,
            port: m.port,
            org: m.org,
            isp: m.isp,
            os: m.os,
          })),
        };
      } else {
        const errText = await response.text().catch(() => "");
        result.shodanError = `Shodan API returned ${response.status}: ${errText.slice(0, 200)}`;
      }
    } catch (err) {
      result.shodanError = `Shodan API error: ${(err as Error).message}`;
    }
  } else {
    result.shodanError =
      "SHODAN_API_KEY not set — returning fingerprint only. Set the key to cross-reference with Shodan.";
  }

  return json(result);
}

// ─── Tool 3: ssh_audit ───

interface AlgorithmAssessment {
  name: string;
  status: "secure" | "weak" | "deprecated";
  note?: string;
}

function assessKex(alg: string): AlgorithmAssessment {
  if (DEPRECATED_KEX.has(alg)) {
    return { name: alg, status: "deprecated", note: "Known vulnerable, should be disabled" };
  }
  if (WEAK_KEX.has(alg)) {
    return { name: alg, status: "weak", note: "Uses SHA-1 or has known weaknesses" };
  }
  return { name: alg, status: "secure" };
}

function assessCipher(alg: string): AlgorithmAssessment {
  if (DEPRECATED_CIPHERS.has(alg)) {
    return { name: alg, status: "deprecated", note: "Broken or obsolete cipher, must be removed" };
  }
  if (WEAK_CIPHERS.has(alg)) {
    return { name: alg, status: "weak", note: "CBC mode vulnerable to padding oracle attacks" };
  }
  return { name: alg, status: "secure" };
}

function assessMac(alg: string): AlgorithmAssessment {
  if (DEPRECATED_MACS.has(alg)) {
    return { name: alg, status: "deprecated", note: "MD5-based MAC, cryptographically broken" };
  }
  if (WEAK_MACS.has(alg)) {
    return { name: alg, status: "weak", note: "SHA-1 based or short tag length" };
  }
  return { name: alg, status: "secure" };
}

function assessHostKey(alg: string): AlgorithmAssessment {
  if (WEAK_HOST_KEY_TYPES.has(alg)) {
    const note = alg === "ssh-dss"
      ? "DSA keys are limited to 1024 bits, considered insecure"
      : "SHA-1 based signature, deprecated in OpenSSH 8.8+";
    return { name: alg, status: "deprecated", note };
  }
  return { name: alg, status: "secure" };
}

async function sshAudit(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 22;
  const cacheKey = `ssh_audit:${host}:${port}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const probe = await performSSHProbe(host, port);

  if (!probe.kexInit) {
    return json({
      host,
      port,
      error: probe.error ?? "Could not retrieve KEXINIT for audit",
      banner: probe.banner,
    });
  }

  // Assess all algorithm categories
  const kexAssessment = probe.kexInit.kexAlgorithms.map(assessKex);
  const cipherAssessment = probe.kexInit.encryptionClientToServer.map(assessCipher);
  const macAssessment = probe.kexInit.macClientToServer.map(assessMac);
  const hostKeyAssessment = probe.kexInit.serverHostKeyAlgorithms.map(assessHostKey);
  const compressionList = probe.kexInit.compressionClientToServer;

  // Collect all weak and deprecated
  const allAssessments = [...kexAssessment, ...cipherAssessment, ...macAssessment, ...hostKeyAssessment];
  const deprecated = allAssessments.filter((a) => a.status === "deprecated");
  const weak = allAssessments.filter((a) => a.status === "weak");
  const secure = allAssessments.filter((a) => a.status === "secure");

  // Security rating
  let rating: "A" | "B" | "C" | "D" | "F";
  let ratingDescription: string;

  if (deprecated.length === 0 && weak.length === 0) {
    rating = "A";
    ratingDescription = "Excellent — no weak or deprecated algorithms found";
  } else if (deprecated.length === 0 && weak.length <= 2) {
    rating = "B";
    ratingDescription = `Good — ${weak.length} weak algorithm(s) found but no deprecated ones`;
  } else if (deprecated.length <= 2) {
    rating = "C";
    ratingDescription = `Fair — ${deprecated.length} deprecated and ${weak.length} weak algorithm(s) found`;
  } else if (deprecated.length <= 5) {
    rating = "D";
    ratingDescription = `Poor — ${deprecated.length} deprecated and ${weak.length} weak algorithm(s) found`;
  } else {
    rating = "F";
    ratingDescription = `Critical — ${deprecated.length} deprecated and ${weak.length} weak algorithm(s) found`;
  }

  // Spoofing detection
  const spoofing = probe.banner
    ? detectBannerSpoofing(probe.banner, probe.kexInit)
    : null;

  // Version pinpointing
  const versionEstimate = pinpointVersion(probe.kexInit);

  // Recommendations
  const recommendations: string[] = [];
  if (deprecated.length > 0) {
    recommendations.push(
      `Remove deprecated algorithms: ${deprecated.map((a) => a.name).join(", ")}`,
    );
  }
  if (weak.length > 0) {
    recommendations.push(
      `Consider replacing weak algorithms: ${weak.map((a) => a.name).join(", ")}`,
    );
  }
  if (WEAK_HOST_KEY_TYPES.has("ssh-rsa") && probe.kexInit.serverHostKeyAlgorithms.includes("ssh-rsa")) {
    recommendations.push("Disable ssh-rsa host key type — use rsa-sha2-256 or rsa-sha2-512 instead");
  }
  if (probe.kexInit.serverHostKeyAlgorithms.includes("ssh-dss")) {
    recommendations.push("Remove ssh-dss (DSA) host key — DSA is limited to 1024 bits");
  }
  if (!probe.kexInit.kexAlgorithms.includes("curve25519-sha256") &&
      !probe.kexInit.kexAlgorithms.includes("curve25519-sha256@libssh.org")) {
    recommendations.push("Enable curve25519-sha256 key exchange for modern security");
  }
  if (!probe.kexInit.encryptionClientToServer.includes("chacha20-poly1305@openssh.com") &&
      !probe.kexInit.encryptionClientToServer.includes("aes256-gcm@openssh.com")) {
    recommendations.push("Enable chacha20-poly1305@openssh.com or aes256-gcm@openssh.com cipher");
  }
  if (compressionList.includes("zlib") || compressionList.includes("zlib@openssh.com")) {
    recommendations.push("Consider disabling compression to mitigate CRIME/BREACH style attacks");
  }

  const result = {
    host,
    port,
    banner: probe.banner,
    hassh: probe.hassh,
    hasshRaw: probe.hasshRaw,
    versionEstimate,
    bannerSpoofing: spoofing,
    algorithms: {
      kex: kexAssessment,
      ciphers: cipherAssessment,
      macs: macAssessment,
      hostKeys: hostKeyAssessment,
      compression: compressionList,
    },
    security: {
      rating,
      description: ratingDescription,
      totalAlgorithms: allAssessments.length,
      secure: secure.length,
      weak: weak.length,
      deprecated: deprecated.length,
      weakList: weak.map((a) => ({ name: a.name, note: a.note })),
      deprecatedList: deprecated.map((a) => ({ name: a.name, note: a.note })),
    },
    recommendations,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool Definitions ───

export const sshTools: ToolDef[] = [
  {
    name: "ssh_probe",
    description:
      "SSH banner and key exchange analysis. Connects to SSH port, reads the server banner (protocol version, software, OS), triggers KEXINIT exchange to extract supported algorithms (kex, ciphers, MACs, compression, host key types), computes HASSH fingerprint, and detects banner spoofing (e.g., OpenSSH banner with Dropbear algorithms).",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(22).describe("SSH port"),
    },
    execute: sshProbe,
  },
  {
    name: "ssh_hostkey_lookup",
    description:
      "Cross-reference SSH host key fingerprint against Shodan. Connects to target SSH, extracts HASSH fingerprint, then queries Shodan API to find other IPs with the same algorithm set. Identifies cloned servers, same organization infrastructure, or lateral movement targets. Requires SHODAN_API_KEY for cross-referencing; without it, returns the fingerprint only.",
    schema: {
      host: z.string().describe("Target host to get SSH fingerprint"),
      port: z.number().optional().default(22).describe("SSH port"),
    },
    execute: sshHostkeyLookup,
  },
  {
    name: "ssh_audit",
    description:
      "Full SSH algorithm enumeration with security assessment. Connects and extracts all supported KEX algorithms, ciphers, MACs, compression, and host key types. Flags deprecated (3des-cbc, arcfour, ssh-dss, diffie-hellman-group1-sha1) and weak algorithms. Calculates HASSH fingerprint, estimates OpenSSH version from algorithm set, detects banner-algorithm mismatches, and provides a security rating (A-F) with hardening recommendations.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(22).describe("SSH port"),
    },
    execute: sshAudit,
  },
];
