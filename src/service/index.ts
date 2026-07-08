import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { json } from "../types/index.js";
import * as net from "node:net";
import { SERVICE_BANNERS, MYSQL_AUTH_PLUGIN_MAP } from "../data/service-banners.js";

const limiter = new RateLimiter(300);
const cache = new TTLCache<unknown>(600_000);

// ─── TCP Helpers ───

function tcpConnect(host: string, port: number, timeoutMs = 5000): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => { socket.destroy(); reject(new Error("Connection timeout")); });
    socket.on("error", reject);
    socket.connect(port, host, () => resolve(socket));
  });
}

function readBytes(socket: net.Socket, timeoutMs = 3000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timer = setTimeout(() => { socket.destroy(); resolve(Buffer.concat(chunks)); }, timeoutMs);
    socket.on("data", (chunk: Buffer) => { chunks.push(chunk); });
    socket.on("end", () => { clearTimeout(timer); resolve(Buffer.concat(chunks)); });
    socket.on("error", (err) => { clearTimeout(timer); reject(err); });
  });
}

function sendAndRead(socket: net.Socket, data: string | Buffer, timeoutMs = 3000): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timer = setTimeout(() => { resolve(Buffer.concat(chunks)); }, timeoutMs);
    socket.on("data", (chunk: Buffer) => { chunks.push(chunk); });
    socket.on("error", (err) => { clearTimeout(timer); reject(err); });
    socket.write(data, () => {});
    socket.on("end", () => { clearTimeout(timer); resolve(Buffer.concat(chunks)); });
  });
}

// ─── Tool 1: svc_mysql_probe ───

async function mysqlProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 3306;
  const cacheKey = `mysql:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  let socket: net.Socket | null = null;
  try {
    socket = await tcpConnect(host, port);
    const data = await readBytes(socket, 5000);

    if (data.length < 5) {
      const result = { host, port, error: "No greeting packet received or packet too short" };
      cache.set(cacheKey, result);
      return json(result);
    }

    // Parse MySQL greeting packet
    // Bytes 0-2: packet length (3 bytes LE)
    const packetLength = data.readUIntLE(0, 3);
    // Byte 3: sequence number
    const sequenceNumber = data.readUInt8(3);
    // Byte 4: protocol version (usually 10)
    const protocolVersion = data.readUInt8(4);

    // Bytes 5+: server version (null-terminated string)
    let offset = 5;
    const versionEnd = data.indexOf(0x00, offset);
    if (versionEnd === -1) {
      const result = { host, port, error: "Malformed greeting: no null-terminated version string" };
      cache.set(cacheKey, result);
      return json(result);
    }
    const serverVersion = data.subarray(offset, versionEnd).toString("utf-8");
    offset = versionEnd + 1;

    // Connection ID (4 bytes LE)
    let connectionId = 0;
    if (offset + 4 <= data.length) {
      connectionId = data.readUInt32LE(offset);
      offset += 4;
    }

    // auth_plugin_data_part_1 (8 bytes) — skip over
    if (offset + 8 <= data.length) {
      offset += 8;
    }

    // filler (1 byte 0x00)
    if (offset < data.length) {
      offset += 1;
    }

    // capability_flags lower 2 bytes
    let capabilityFlags = 0;
    if (offset + 2 <= data.length) {
      capabilityFlags = data.readUInt16LE(offset);
      offset += 2;
    }

    // character_set (1 byte)
    let characterSet = 0;
    if (offset < data.length) {
      characterSet = data.readUInt8(offset);
      offset += 1;
    }

    // status_flags (2 bytes LE)
    let statusFlags = 0;
    if (offset + 2 <= data.length) {
      statusFlags = data.readUInt16LE(offset);
      offset += 2;
    }

    // capability_flags upper 2 bytes
    if (offset + 2 <= data.length) {
      capabilityFlags |= data.readUInt16LE(offset) << 16;
      offset += 2;
    }

    // auth_data_len (1 byte)
    let authDataLen = 0;
    if (offset < data.length) {
      authDataLen = data.readUInt8(offset);
      offset += 1;
    }

    // reserved (10 bytes 0x00)
    if (offset + 10 <= data.length) {
      offset += 10;
    }

    // auth_plugin_data_part_2 (max(13, auth_data_len - 8) bytes)
    const part2Len = Math.max(13, authDataLen - 8);
    if (offset + part2Len <= data.length) {
      offset += part2Len;
    }

    // auth_plugin_name (null-terminated)
    let authPlugin = "";
    if (offset < data.length) {
      const pluginEnd = data.indexOf(0x00, offset);
      if (pluginEnd !== -1) {
        authPlugin = data.subarray(offset, pluginEnd).toString("utf-8");
      } else {
        authPlugin = data.subarray(offset).toString("utf-8").replace(/\0/g, "");
      }
    }

    // Determine variant
    let variant = "MySQL";
    if (/mariadb/i.test(serverVersion)) {
      variant = "MariaDB";
    } else if (/percona/i.test(serverVersion)) {
      variant = "Percona";
    }

    // Auth plugin info
    const authPluginInfo = MYSQL_AUTH_PLUGIN_MAP[authPlugin] ?? "Unknown auth plugin";

    // Character set name mapping (common ones)
    const charsetMap: Record<number, string> = {
      8: "latin1",
      33: "utf8mb3",
      45: "utf8mb4",
      63: "binary",
      224: "utf8mb4_unicode_ci",
      255: "utf8mb4_0900_ai_ci",
    };
    const characterSetName = charsetMap[characterSet] ?? `charset_id_${characterSet}`;

    // Intelligence notes
    const intelligence: string[] = [];
    if (variant === "MariaDB") {
      intelligence.push("MariaDB fork detected — community-driven MySQL alternative.");
    } else if (variant === "Percona") {
      intelligence.push("Percona Server detected — performance-optimized MySQL fork.");
    }
    if (authPlugin === "mysql_native_password") {
      intelligence.push("Using mysql_native_password — default for MySQL 5.x. Consider upgrading to caching_sha2_password (MySQL 8.0+).");
    } else if (authPlugin === "caching_sha2_password") {
      intelligence.push("Using caching_sha2_password — default for MySQL 8.0+, provides stronger authentication.");
    } else if (authPlugin === "mysql_old_password") {
      intelligence.push("CRITICAL: Using deprecated mysql_old_password — extremely weak, vulnerable to replay attacks.");
    }
    if (protocolVersion !== 10) {
      intelligence.push(`Non-standard protocol version ${protocolVersion} detected (expected 10).`);
    }

    // Try to send quit command gracefully
    try {
      const quitPacket = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x01]); // COM_QUIT
      socket.write(quitPacket);
    } catch {
      // Ignore write errors on cleanup
    }

    const result = {
      host,
      port,
      protocol_version: protocolVersion,
      server_version: serverVersion,
      variant,
      connection_id: connectionId,
      auth_plugin: authPlugin,
      auth_plugin_info: authPluginInfo,
      character_set: characterSetName,
      capabilities: `0x${capabilityFlags.toString(16).padStart(8, "0")}`,
      status_flags: `0x${statusFlags.toString(16).padStart(4, "0")}`,
      intelligence,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const result = { host, port, error: `MySQL probe failed: ${error}` };
    cache.set(cacheKey, result);
    return json(result);
  } finally {
    if (socket) {
      try { socket.destroy(); } catch { /* ignore */ }
    }
  }
}

// ─── Tool 2: svc_postgres_probe ───

async function postgresProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 5432;
  const cacheKey = `postgres:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  let socket: net.Socket | null = null;
  try {
    socket = await tcpConnect(host, port);

    // Build StartupMessage: length(4) + version(4) + "user\0postgres\0\0"
    const userParam = Buffer.from("user\0postgres\0\0", "utf-8"); // user\0postgres\0 + trailing \0
    const startupLen = 4 + 4 + userParam.length; // 4 (length) + 4 (version) + params
    const startup = Buffer.alloc(startupLen);
    startup.writeInt32BE(startupLen, 0); // length includes self
    startup.writeInt32BE(196608, 4); // version 3.0 = 0x00030000
    userParam.copy(startup, 8);

    const response = await sendAndRead(socket, startup, 5000);

    if (response.length === 0) {
      const result = { host, port, error: "No response from PostgreSQL server" };
      cache.set(cacheKey, result);
      return json(result);
    }

    // Parse PostgreSQL protocol messages
    let offset = 0;
    let authMethod = "unknown";
    const parameters: Record<string, string> = {};
    let backendPid = 0;
    let backendSecret = 0;
    let serverVersion = "unknown";
    let errorMessage: string | null = null;

    while (offset < response.length) {
      if (offset + 5 > response.length) break;

      const msgType = String.fromCharCode(response.readUInt8(offset));
      const msgLen = response.readInt32BE(offset + 1); // includes self (4 bytes) but not the type byte
      const msgEnd = offset + 1 + msgLen;

      if (msgEnd > response.length) break;

      const payload = response.subarray(offset + 5, msgEnd);

      switch (msgType) {
        case "R": {
          // Authentication
          if (payload.length >= 4) {
            const authType = payload.readInt32BE(0);
            const authMap: Record<number, string> = {
              0: "AuthenticationOk",
              2: "KerberosV5",
              3: "CleartextPassword",
              5: "MD5Password",
              6: "SCMCredential",
              7: "GSS",
              8: "GSSContinue",
              9: "SSPI",
              10: "SASL",
              11: "SASLContinue",
              12: "SASLFinal",
            };
            authMethod = authMap[authType] ?? `Unknown(${authType})`;
          }
          break;
        }
        case "S": {
          // ParameterStatus: key\0value\0
          const paramStr = payload.toString("utf-8");
          const nullIdx = paramStr.indexOf("\0");
          if (nullIdx !== -1) {
            const key = paramStr.substring(0, nullIdx);
            const value = paramStr.substring(nullIdx + 1).replace(/\0$/, "");
            parameters[key] = value;
            if (key === "server_version") {
              serverVersion = value;
            }
          }
          break;
        }
        case "K": {
          // BackendKeyData: pid(4) + secret(4)
          if (payload.length >= 8) {
            backendPid = payload.readInt32BE(0);
            backendSecret = payload.readInt32BE(4);
          }
          break;
        }
        case "E": {
          // ErrorResponse: severity\0message\0...
          // Format: sequence of (byte field-type + string\0), terminated by \0
          const errStr = payload.toString("utf-8");
          const fields: Record<string, string> = {};
          let eOffset = 0;
          while (eOffset < errStr.length) {
            const fieldType = errStr[eOffset];
            if (fieldType === "\0") break;
            eOffset++;
            const fieldEnd = errStr.indexOf("\0", eOffset);
            if (fieldEnd === -1) break;
            fields[fieldType] = errStr.substring(eOffset, fieldEnd);
            eOffset = fieldEnd + 1;
          }
          errorMessage = fields["M"] ?? errStr.slice(0, 200);
          break;
        }
        case "Z": {
          // ReadyForQuery — we're done
          break;
        }
        default:
          break;
      }

      offset = msgEnd;
    }

    // Send Terminate message
    try {
      const terminate = Buffer.alloc(5);
      terminate.writeUInt8(0x58, 0); // 'X'
      terminate.writeInt32BE(4, 1);
      socket.write(terminate);
    } catch {
      // Ignore write errors on cleanup
    }

    // Intelligence
    const intelligence: string[] = [];
    if (authMethod === "AuthenticationOk") {
      intelligence.push("CRITICAL: Server accepted connection without authentication — trust-based auth or no password set.");
    } else if (authMethod === "MD5Password") {
      intelligence.push("Using MD5 password authentication — consider upgrading to SCRAM-SHA-256 (scram-sha-256) for stronger security.");
    } else if (authMethod === "CleartextPassword") {
      intelligence.push("CRITICAL: Cleartext password authentication — passwords sent in plain text over the wire.");
    } else if (authMethod === "SASL") {
      intelligence.push("Using SASL authentication (likely SCRAM-SHA-256) — modern and secure.");
    }
    if (parameters["ssl_library"]) {
      intelligence.push(`SSL library: ${parameters["ssl_library"]}`);
    }
    if (errorMessage) {
      intelligence.push(`Server returned error: ${errorMessage}`);
    }
    if (serverVersion !== "unknown") {
      const majorVersion = parseInt(serverVersion.split(".")[0], 10);
      if (majorVersion < 14) {
        intelligence.push(`PostgreSQL ${serverVersion} may be near or past end-of-life — check official support policy.`);
      }
    }

    const result = {
      host,
      port,
      server_version: serverVersion,
      auth_method: authMethod,
      parameters,
      backend_pid: backendPid || undefined,
      error: errorMessage ?? undefined,
      intelligence,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const result = { host, port, error: `PostgreSQL probe failed: ${error}` };
    cache.set(cacheKey, result);
    return json(result);
  } finally {
    if (socket) {
      try { socket.destroy(); } catch { /* ignore */ }
    }
  }
}

// ─── Tool 3: svc_redis_probe ───

async function redisProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 6379;
  const cacheKey = `redis:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  let socket: net.Socket | null = null;
  try {
    socket = await tcpConnect(host, port);

    // Send PING
    const pingResponse = await sendAndRead(socket, "PING\r\n", 3000);
    const pingStr = pingResponse.toString("utf-8").trim();

    let authRequired = false;
    let protectedMode = false;

    if (pingStr.startsWith("-NOAUTH")) {
      authRequired = true;
      const intelligence = [
        "Redis requires authentication — AUTH command needed before any other commands.",
        "Ensure a strong password is configured (requirepass directive).",
      ];

      const result = {
        host,
        port,
        version: null,
        mode: null,
        os: null,
        arch: null,
        uptime_seconds: null,
        connected_clients: null,
        memory: null,
        role: null,
        keyspace: null,
        auth_required: true,
        protected_mode: false,
        intelligence,
      };
      cache.set(cacheKey, result);
      return json(result);
    }

    if (pingStr.startsWith("-DENIED")) {
      protectedMode = true;
      const intelligence = [
        "Redis is running in protected mode — connections from non-loopback interfaces are denied.",
        "This is a security feature; disable only if proper authentication is configured.",
      ];

      const result = {
        host,
        port,
        version: null,
        mode: null,
        os: null,
        arch: null,
        uptime_seconds: null,
        connected_clients: null,
        memory: null,
        role: null,
        keyspace: null,
        auth_required: false,
        protected_mode: true,
        intelligence,
      };
      cache.set(cacheKey, result);
      return json(result);
    }

    if (!pingStr.startsWith("+PONG")) {
      const result = {
        host,
        port,
        error: `Unexpected PING response: ${pingStr.slice(0, 200)}`,
        auth_required: false,
        protected_mode: false,
      };
      cache.set(cacheKey, result);
      return json(result);
    }

    // PONG received — send INFO command
    // Need a new socket since the previous sendAndRead may have consumed events
    socket.destroy();
    socket = await tcpConnect(host, port);
    const infoResponse = await sendAndRead(socket, "INFO\r\n", 5000);
    const infoStr = infoResponse.toString("utf-8");

    // Parse INFO response — format: $length\r\n<bulk data>\r\n
    // The bulk data contains key:value lines separated by \r\n, with section headers starting with #
    const infoLines = infoStr.split("\r\n");
    const infoMap: Record<string, string> = {};

    for (const line of infoLines) {
      if (line.startsWith("#") || line.startsWith("$") || line.length === 0) continue;
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        infoMap[key] = value;
      }
    }

    const version = infoMap["redis_version"] ?? null;
    const mode = infoMap["redis_mode"] ?? null;
    const os = infoMap["os"] ?? null;
    const arch = infoMap["arch_bits"] ? `${infoMap["arch_bits"]}-bit` : null;
    const uptimeSeconds = infoMap["uptime_in_seconds"] ? parseInt(infoMap["uptime_in_seconds"], 10) : null;
    const connectedClients = infoMap["connected_clients"] ? parseInt(infoMap["connected_clients"], 10) : null;

    const memory: Record<string, string> = {};
    if (infoMap["used_memory_human"]) memory["used"] = infoMap["used_memory_human"];
    if (infoMap["used_memory_peak_human"]) memory["peak"] = infoMap["used_memory_peak_human"];

    const role = infoMap["role"] ?? null;
    const connectedSlaves = infoMap["connected_slaves"] ? parseInt(infoMap["connected_slaves"], 10) : null;

    // Parse keyspace
    const keyspace: Record<string, string> = {};
    for (const [key, value] of Object.entries(infoMap)) {
      if (key.startsWith("db")) {
        keyspace[key] = value;
      }
    }

    // Send QUIT
    try {
      socket.write("QUIT\r\n");
    } catch {
      // Ignore write errors on cleanup
    }

    // Intelligence
    const intelligence: string[] = [];
    if (!authRequired && !protectedMode) {
      intelligence.push("WARNING: Redis accepted commands without authentication — no password is set (requirepass is empty).");
    }
    if (version) {
      const majorMinor = version.split(".").slice(0, 2).join(".");
      const major = parseInt(version.split(".")[0], 10);
      if (major < 6) {
        intelligence.push(`Redis ${version} is outdated — consider upgrading to 7.x for security patches and ACL support.`);
      } else if (major < 7) {
        intelligence.push(`Redis ${version} — ACL support available (since 6.0). Ensure ACL rules are configured.`);
      }
    }
    if (role === "master" && connectedSlaves !== null && connectedSlaves > 0) {
      intelligence.push(`Master node with ${connectedSlaves} connected slave(s) — replication is active.`);
    } else if (role === "slave") {
      intelligence.push("This instance is a replica (slave) — data is read from master.");
    }
    if (Object.keys(keyspace).length === 0) {
      intelligence.push("No keyspace data found — database may be empty or INFO keyspace is restricted.");
    }

    const result = {
      host,
      port,
      version,
      mode,
      os,
      arch,
      uptime_seconds: uptimeSeconds,
      connected_clients: connectedClients,
      memory: Object.keys(memory).length > 0 ? memory : null,
      role,
      connected_slaves: connectedSlaves,
      keyspace: Object.keys(keyspace).length > 0 ? keyspace : null,
      auth_required: authRequired,
      protected_mode: protectedMode,
      intelligence,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const result = { host, port, error: `Redis probe failed: ${error}` };
    cache.set(cacheKey, result);
    return json(result);
  } finally {
    if (socket) {
      try { socket.destroy(); } catch { /* ignore */ }
    }
  }
}

// ─── Tool 4: svc_ftp_probe ───

async function ftpProbe(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const port = (args.port as number | undefined) ?? 21;
  const cacheKey = `ftp:${host}:${port}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  let socket: net.Socket | null = null;
  try {
    socket = await tcpConnect(host, port);

    // Read 220 banner (FTP servers send greeting immediately)
    const bannerData = await readBytes(socket, 5000);
    const bannerStr = bannerData.toString("utf-8").trim();

    if (!bannerStr.startsWith("220")) {
      const result = {
        host,
        port,
        error: `Unexpected FTP banner: ${bannerStr.slice(0, 200)}`,
        banner: bannerStr.slice(0, 500),
      };
      cache.set(cacheKey, result);
      return json(result);
    }

    // Match banner against SERVICE_BANNERS for FTP
    let software: string | null = null;
    let version: string | null = null;
    const ftpBanners = SERVICE_BANNERS.filter((b) => b.service === "ftp");
    for (const entry of ftpBanners) {
      const regex = new RegExp(entry.pattern);
      const match = bannerStr.match(regex);
      if (match) {
        software = entry.name;
        if (match[1]) {
          version = match[1];
        }
        break;
      }
    }

    // If no SERVICE_BANNERS match, try additional known patterns
    if (!software) {
      if (/vsftpd/i.test(bannerStr)) {
        software = "vsftpd";
        const m = bannerStr.match(/vsftpd\s+([\d.]+)/i);
        if (m) version = m[1];
      } else if (/proftpd/i.test(bannerStr)) {
        software = "ProFTPD";
        const m = bannerStr.match(/ProFTPD\s+([\d.]+\w*)/i);
        if (m) version = m[1];
      } else if (/pure-ftpd/i.test(bannerStr)) {
        software = "Pure-FTPd";
      } else if (/filezilla/i.test(bannerStr)) {
        software = "FileZilla Server";
        const m = bannerStr.match(/FileZilla Server\s+([\d.]+)/i);
        if (m) version = m[1];
      } else if (/microsoft ftp/i.test(bannerStr)) {
        software = "Microsoft IIS FTP";
      }
    }

    // Need new socket for SYST command (previous readBytes consumed events)
    socket.destroy();
    socket = await tcpConnect(host, port);
    // Read and discard the banner again
    await readBytes(socket, 3000);

    // Send SYST command
    let systemType: string | null = null;
    try {
      socket.destroy();
      socket = await tcpConnect(host, port);
      await readBytes(socket, 3000); // consume banner

      const systResponse = await sendAndRead(socket, "SYST\r\n", 3000);
      const systStr = systResponse.toString("utf-8").trim();
      if (systStr.startsWith("215")) {
        systemType = systStr.replace(/^215\s+/, "").trim();
      }
    } catch {
      // SYST may not be supported
    }

    // Send FEAT command
    let features: string[] = [];
    let tlsSupport = false;
    try {
      socket.destroy();
      socket = await tcpConnect(host, port);
      await readBytes(socket, 3000); // consume banner

      const featResponse = await sendAndRead(socket, "FEAT\r\n", 3000);
      const featStr = featResponse.toString("utf-8").trim();

      if (featStr.includes("211")) {
        const featLines = featStr.split("\r\n");
        for (const line of featLines) {
          const trimmed = line.trim();
          // Feature lines are indented after "211-" header and before "211 End"
          if (trimmed.startsWith("211-") || trimmed.startsWith("211 ")) continue;
          if (trimmed.length > 0) {
            features.push(trimmed);
          }
        }
        // Check for TLS support
        tlsSupport = features.some((f) =>
          /AUTH\s+TLS/i.test(f) || /AUTH\s+SSL/i.test(f),
        );
      }
    } catch {
      // FEAT may not be supported
    }

    // Send QUIT
    try {
      socket.write("QUIT\r\n");
    } catch {
      // Ignore write errors on cleanup
    }

    // Intelligence
    const intelligence: string[] = [];
    if (software) {
      intelligence.push(`Identified FTP server software: ${software}${version ? ` v${version}` : ""}.`);
    }
    if (!tlsSupport) {
      intelligence.push("WARNING: No TLS support detected (AUTH TLS/SSL not in FEAT) — credentials transmitted in cleartext.");
    } else {
      intelligence.push("TLS support available via AUTH TLS/SSL — encrypted connections possible.");
    }
    if (software === "vsftpd" && version) {
      const major = parseInt(version.split(".")[0], 10);
      const minor = parseInt(version.split(".")[1], 10);
      if (major < 3 || (major === 3 && minor === 0 && parseInt(version.split(".")[2], 10) < 3)) {
        intelligence.push("vsftpd version may be outdated — check for known CVEs.");
      }
    }
    if (features.length === 0) {
      intelligence.push("FEAT command returned no features or is not supported — limited protocol extension support.");
    }
    if (systemType) {
      intelligence.push(`System type: ${systemType}`);
    }

    const result = {
      host,
      port,
      banner: bannerStr.slice(0, 500),
      software,
      version,
      system_type: systemType,
      features,
      tls_support: tlsSupport,
      intelligence,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const result = { host, port, error: `FTP probe failed: ${error}` };
    cache.set(cacheKey, result);
    return json(result);
  } finally {
    if (socket) {
      try { socket.destroy(); } catch { /* ignore */ }
    }
  }
}

// ─── Tool 5: svc_vnc_rdp_detect ───

interface DesktopResult {
  port: number;
  protocol: string;
  version: string | null;
  details: Record<string, unknown> | null;
  open: boolean;
}

// VNC security type names
const VNC_SECURITY_TYPES: Record<number, string> = {
  0: "Invalid",
  1: "None",
  2: "VNC Authentication",
  5: "RA2",
  6: "RA2ne",
  16: "Tight",
  18: "TLS",
  19: "VeNCrypt",
  30: "Apple Remote Desktop",
};

async function vncRdpDetect(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const host = args.host as string;
  const ports = (args.ports as number[] | undefined) ?? [3389, 5900, 5901];
  const cacheKey = `vnc_rdp:${host}:${ports.join(",")}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const results: DesktopResult[] = [];

  for (const port of ports) {
    let socket: net.Socket | null = null;
    try {
      socket = await tcpConnect(host, port, 5000);

      // Determine if this is a VNC or RDP port
      if (port >= 5900 && port <= 5999) {
        // VNC detection
        const data = await readBytes(socket, 3000);
        const vncBanner = data.toString("utf-8").trim();

        if (vncBanner.startsWith("RFB")) {
          // Parse "RFB xxx.yyy\n"
          const versionMatch = vncBanner.match(/^RFB\s+(\d{3}\.\d{3})/);
          const vncVersion = versionMatch ? versionMatch[1] : null;

          // Read security types
          const securityTypes: string[] = [];
          // After version exchange, server sends number of security types + types
          // We need to send our version back first
          try {
            socket.destroy();
            socket = await tcpConnect(host, port, 5000);
            const versionData = await readBytes(socket, 2000);
            const versionStr = versionData.toString("utf-8").trim();

            if (versionStr.startsWith("RFB")) {
              // Send back the same version string
              const sendVersion = versionStr.endsWith("\n") ? versionStr : versionStr + "\n";
              const secData = await sendAndRead(socket, sendVersion + "\n", 2000);

              if (secData.length > 0) {
                const numTypes = secData.readUInt8(0);
                for (let i = 1; i <= numTypes && i < secData.length; i++) {
                  const typeId = secData.readUInt8(i);
                  const typeName = VNC_SECURITY_TYPES[typeId] ?? `Unknown(${typeId})`;
                  securityTypes.push(typeName);
                }
              }
            }
          } catch {
            // Security type reading failed — we still have the version
          }

          results.push({
            port,
            protocol: "VNC",
            version: vncVersion,
            details: {
              rfb_version: vncVersion,
              security_types: securityTypes.length > 0 ? securityTypes : undefined,
            },
            open: true,
          });
        } else {
          // Port open but not VNC
          results.push({
            port,
            protocol: "unknown",
            version: null,
            details: { banner: vncBanner.slice(0, 200) || null },
            open: true,
          });
        }
      } else if (port === 3389) {
        // RDP detection — send X.224 Connection Request TPDU
        // TPKT header: 03 00 00 13 (version 3, reserved 0, length 19)
        // X.224 CR: 0e e0 00 00 00 00 00 01 00 08 00 03 00 00 00
        const x224Request = Buffer.from([
          0x03, 0x00, 0x00, 0x13, // TPKT header
          0x0e, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, // X.224 CR header
          0x01, 0x00, 0x08, 0x00, // cookie/routing
          0x03, 0x00, 0x00, 0x00, // RDP Negotiation Request (protocol TLS | CredSSP)
        ]);

        const rdpResponse = await sendAndRead(socket, x224Request, 3000);

        if (rdpResponse.length > 0) {
          const isTPKT = rdpResponse.readUInt8(0) === 0x03;
          // Check for X.224 Connection Confirm (0xd0)
          let isConnectionConfirm = false;
          let rdpProtocol: string | null = null;

          if (isTPKT && rdpResponse.length >= 7) {
            const x224Type = rdpResponse.readUInt8(5) & 0xf0;
            isConnectionConfirm = x224Type === 0xd0;

            // Parse RDP Negotiation Response if present
            if (isConnectionConfirm && rdpResponse.length >= 19) {
              // Look for RDP Negotiation Response at offset 11
              try {
                const negType = rdpResponse.readUInt8(11);
                if (negType === 0x02) {
                  // TYPE_RDP_NEG_RSP
                  const selectedProto = rdpResponse.readUInt32LE(15);
                  const protoMap: Record<number, string> = {
                    0: "Standard RDP Security",
                    1: "TLS 1.0+",
                    2: "CredSSP (NLA)",
                    3: "TLS + CredSSP",
                    8: "RDSTLS",
                  };
                  rdpProtocol = protoMap[selectedProto] ?? `Protocol(${selectedProto})`;
                } else if (negType === 0x03) {
                  // TYPE_RDP_NEG_FAILURE
                  rdpProtocol = "Negotiation failed";
                }
              } catch {
                // Failed to parse negotiation response
              }
            }
          }

          if (isConnectionConfirm) {
            results.push({
              port,
              protocol: "RDP",
              version: null,
              details: {
                tpkt_response: true,
                connection_confirm: true,
                negotiated_protocol: rdpProtocol,
                response_length: rdpResponse.length,
              },
              open: true,
            });
          } else {
            // Port open, got a response, but not RDP Connection Confirm
            results.push({
              port,
              protocol: "unknown",
              version: null,
              details: {
                tpkt_response: isTPKT,
                response_hex: rdpResponse.toString("hex").slice(0, 64),
                response_length: rdpResponse.length,
              },
              open: true,
            });
          }
        } else {
          // Port open but no response to X.224
          results.push({
            port,
            protocol: "unknown",
            version: null,
            details: null,
            open: true,
          });
        }
      } else {
        // Non-standard port — try VNC first, then RDP
        const data = await readBytes(socket, 2000);
        const banner = data.toString("utf-8").trim();

        if (banner.startsWith("RFB")) {
          const versionMatch = banner.match(/^RFB\s+(\d{3}\.\d{3})/);
          results.push({
            port,
            protocol: "VNC",
            version: versionMatch ? versionMatch[1] : null,
            details: { rfb_version: versionMatch ? versionMatch[1] : null },
            open: true,
          });
        } else {
          results.push({
            port,
            protocol: "unknown",
            version: null,
            details: { banner: banner.slice(0, 200) || null },
            open: true,
          });
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({
        port,
        protocol: "unknown",
        version: null,
        details: { error },
        open: false,
      });
    } finally {
      if (socket) {
        try { socket.destroy(); } catch { /* ignore */ }
      }
    }
  }

  // Intelligence
  const intelligence: string[] = [];
  const vncResults = results.filter((r) => r.protocol === "VNC");
  const rdpResults = results.filter((r) => r.protocol === "RDP");
  const openResults = results.filter((r) => r.open);

  if (vncResults.length > 0) {
    intelligence.push(`VNC detected on port(s): ${vncResults.map((r) => r.port).join(", ")}.`);
    for (const r of vncResults) {
      const secTypes = (r.details as Record<string, unknown>)?.security_types as string[] | undefined;
      if (secTypes && secTypes.includes("None")) {
        intelligence.push(`CRITICAL: VNC on port ${r.port} allows unauthenticated access (security type "None").`);
      }
      if (secTypes && secTypes.includes("VNC Authentication")) {
        intelligence.push(`VNC on port ${r.port} uses VNC Authentication — password-only, no username. Susceptible to brute force.`);
      }
    }
  }
  if (rdpResults.length > 0) {
    intelligence.push(`RDP detected on port(s): ${rdpResults.map((r) => r.port).join(", ")}.`);
    for (const r of rdpResults) {
      const negotiated = (r.details as Record<string, unknown>)?.negotiated_protocol as string | undefined;
      if (negotiated === "Standard RDP Security") {
        intelligence.push(`WARNING: RDP on port ${r.port} using Standard RDP Security — no NLA, vulnerable to MITM and brute force.`);
      } else if (negotiated && negotiated.includes("CredSSP")) {
        intelligence.push(`RDP on port ${r.port} supports Network Level Authentication (NLA/CredSSP) — good security posture.`);
      }
    }
  }
  if (openResults.length === 0) {
    intelligence.push("No remote desktop services detected on the specified ports.");
  }

  const result = {
    host,
    results,
    intelligence,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool Definitions ───

export const serviceTools: ToolDef[] = [
  {
    name: "svc_mysql_probe",
    description:
      "MySQL/MariaDB fingerprinting via greeting packet analysis. Connects to the MySQL port, reads the initial handshake packet, and extracts server version, variant (MySQL/MariaDB/Percona), authentication plugin, character set, capability flags, and connection metadata.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(3306).describe("MySQL port (default: 3306)"),
    },
    execute: mysqlProbe,
  },
  {
    name: "svc_postgres_probe",
    description:
      "PostgreSQL fingerprinting via StartupMessage. Sends a protocol 3.0 startup message, parses Authentication, ParameterStatus, BackendKeyData, and Error responses to extract server version, auth method, encoding, timezone, and other server parameters.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(5432).describe("PostgreSQL port (default: 5432)"),
    },
    execute: postgresProbe,
  },
  {
    name: "svc_redis_probe",
    description:
      "Redis fingerprinting via PING and INFO commands. Detects authentication requirements, protected mode, and extracts version, mode, OS, architecture, uptime, connected clients, memory usage, replication role, and keyspace statistics.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(6379).describe("Redis port (default: 6379)"),
    },
    execute: redisProbe,
  },
  {
    name: "svc_ftp_probe",
    description:
      "FTP server fingerprinting via banner, SYST, and FEAT commands. Identifies server software (vsftpd, ProFTPD, Pure-FTPd, FileZilla, IIS FTP), extracts version, system type, supported features, and TLS availability.",
    schema: {
      host: z.string().describe("Target host"),
      port: z.number().optional().default(21).describe("FTP port (default: 21)"),
    },
    execute: ftpProbe,
  },
  {
    name: "svc_vnc_rdp_detect",
    description:
      "VNC and RDP remote desktop detection. Probes specified ports for VNC (RFB protocol handshake, security types) and RDP (X.224 Connection Request/Confirm, NLA negotiation). Reports protocol version, authentication methods, and security posture.",
    schema: {
      host: z.string().describe("Target host"),
      ports: z.array(z.number()).optional().default([3389, 5900, 5901]).describe("Ports to check (default: [3389, 5900, 5901])"),
    },
    execute: vncRdpDetect,
  },
];
