import { z } from "zod";
import * as dgram from "node:dgram";
import * as net from "node:net";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { json, text } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";

// ─── Rate Limiter ───

const limiter = new RateLimiter(500);

// ─── Constants ───

const UDP_TIMEOUT = 4_000; // 4 seconds for UDP operations
const TCP_TIMEOUT = 5_000; // 5 seconds for TCP connections

const SSDP_MULTICAST_ADDR = "239.255.255.250";
const SSDP_PORT = 1900;

const SSDP_MSEARCH = [
  "M-SEARCH * HTTP/1.1",
  `HOST: ${SSDP_MULTICAST_ADDR}:${SSDP_PORT}`,
  'MAN: "ssdp:discover"',
  "MX: 3",
  "ST: ssdp:all",
  "",
  "",
].join("\r\n");

// SNMP GET request for sysDescr.0 (OID 1.3.6.1.2.1.1.1.0) using "public" community
// Minimal SNMPv1 GET-Request packet
const SNMP_PORT = 161;

// Common IoT probe paths
const IOT_PROBE_PATHS = [
  { path: "/", label: "Root" },
  { path: "/cgi-bin/", label: "CGI-BIN (routers/cameras)" },
  { path: "/HNAP1/", label: "HNAP1 (D-Link routers)" },
  { path: "/api/system", label: "Generic IoT API" },
  { path: "/login.htm", label: "Login page (routers)" },
  { path: "/index.asp", label: "ASP index (IP cameras)" },
  { path: "/doc/page/login.asp", label: "Hikvision login" },
  { path: "/login.cgi", label: "CGI login (cameras)" },
  { path: "/System/configurationFile?auth=YWRtaW46YTFCMKM0NTY=", label: "Default config (Dahua)" },
  { path: "/goform/homepage", label: "Goform (Tenda/TP-Link)" },
];

const IOT_MANAGEMENT_PORTS = [80, 443, 8080, 8443, 8888, 4443, 8000];

// IPMI port
const IPMI_PORT = 623;

// ─── Helpers ───

/**
 * Send a UDP packet and wait for responses within a timeout.
 */
function udpProbe(
  host: string,
  port: number,
  payload: Buffer,
  timeoutMs: number = UDP_TIMEOUT,
): Promise<{ responses: { data: Buffer; rinfo: dgram.RemoteInfo }[] }> {
  return new Promise((resolve) => {
    const responses: { data: Buffer; rinfo: dgram.RemoteInfo }[] = [];
    const socket = dgram.createSocket("udp4");

    const timer = setTimeout(() => {
      socket.close();
      resolve({ responses });
    }, timeoutMs);

    socket.on("message", (msg, rinfo) => {
      responses.push({ data: msg, rinfo });
    });

    socket.on("error", () => {
      clearTimeout(timer);
      try { socket.close(); } catch { /* ignore */ }
      resolve({ responses });
    });

    socket.send(payload, 0, payload.length, port, host, (err) => {
      if (err) {
        clearTimeout(timer);
        try { socket.close(); } catch { /* ignore */ }
        resolve({ responses });
      }
    });
  });
}

/**
 * Check if a TCP port is open.
 */
function tcpCheck(
  host: string,
  port: number,
  timeoutMs: number = TCP_TIMEOUT,
): Promise<{ open: boolean; banner: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = "";

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ open: false, banner: "" });
    }, timeoutMs);

    socket.on("connect", () => {
      clearTimeout(timer);
      // Try to read a banner
      const bannerTimer = setTimeout(() => {
        socket.destroy();
        resolve({ open: true, banner });
      }, 2_000);

      socket.on("data", (data) => {
        banner += data.toString("utf-8").slice(0, 512);
        clearTimeout(bannerTimer);
        socket.destroy();
        resolve({ open: true, banner });
      });
    });

    socket.on("error", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ open: false, banner: "" });
    });

    socket.connect(port, host);
  });
}

/**
 * HTTP probe a specific path on a host.
 */
async function httpProbe(
  host: string,
  port: number,
  path: string,
): Promise<{
  status: number;
  server: string;
  title: string;
  powered_by: string;
  content_length: number;
  redirects_to: string;
} | null> {
  try {
    const protocol = port === 443 || port === 8443 || port === 4443 ? "https" : "http";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TCP_TIMEOUT);

    const res = await fetch(`${protocol}://${host}:${port}${path}`, {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IoTProbe/1.0)",
        Accept: "*/*",
      },
    });

    clearTimeout(timeout);

    const body = await res.text().catch(() => "");
    const titleMatch = body.match(/<title[^>]*>([^<]*)<\/title>/i);

    return {
      status: res.status,
      server: res.headers.get("server") ?? "",
      title: titleMatch?.[1]?.trim() ?? "",
      powered_by: res.headers.get("x-powered-by") ?? "",
      content_length: body.length,
      redirects_to: res.headers.get("location") ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Build a minimal SNMPv1 GET-Request for sysDescr.0 (1.3.6.1.2.1.1.1.0).
 */
function buildSnmpGetRequest(community: string): Buffer {
  // SNMPv1 GET-Request PDU for OID 1.3.6.1.2.1.1.1.0 (sysDescr.0)
  const communityBuf = Buffer.from(community, "ascii");

  // OID 1.3.6.1.2.1.1.1.0 encoded as BER
  const oid = Buffer.from([
    0x06, 0x08, // OBJECT IDENTIFIER, length 8
    0x2b, 0x06, 0x01, 0x02, 0x01, 0x01, 0x01, 0x00, // 1.3.6.1.2.1.1.1.0
  ]);

  // VarBind: SEQUENCE { oid, NULL }
  const nullValue = Buffer.from([0x05, 0x00]); // NULL
  const varBind = Buffer.concat([
    Buffer.from([0x30, oid.length + nullValue.length]), // SEQUENCE
    oid,
    nullValue,
  ]);

  // VarBindList: SEQUENCE { varBind }
  const varBindList = Buffer.concat([
    Buffer.from([0x30, varBind.length]), // SEQUENCE
    varBind,
  ]);

  // Request ID (4 bytes)
  const requestId = Buffer.from([
    0x02, 0x04, // INTEGER, length 4
    0x00, 0x00, 0x00, 0x01, // request-id = 1
  ]);

  // Error status and error index (both 0)
  const errorStatus = Buffer.from([0x02, 0x01, 0x00]); // INTEGER 0
  const errorIndex = Buffer.from([0x02, 0x01, 0x00]); // INTEGER 0

  // GET-Request PDU
  const pduContent = Buffer.concat([requestId, errorStatus, errorIndex, varBindList]);
  const pdu = Buffer.concat([
    Buffer.from([0xa0, pduContent.length]), // GetRequest-PDU tag (0xa0)
    pduContent,
  ]);

  // SNMP Message: SEQUENCE { version, community, pdu }
  const version = Buffer.from([0x02, 0x01, 0x00]); // INTEGER 0 (SNMPv1)
  const communityTlv = Buffer.concat([
    Buffer.from([0x04, communityBuf.length]), // OCTET STRING
    communityBuf,
  ]);

  const messageContent = Buffer.concat([version, communityTlv, pdu]);
  const message = Buffer.concat([
    Buffer.from([0x30, messageContent.length]), // SEQUENCE
    messageContent,
  ]);

  return message;
}

/**
 * Parse a basic SNMP response to extract sysDescr string.
 */
function parseSnmpResponse(data: Buffer): string | null {
  try {
    // Simple extraction: look for OCTET STRING values after the OID
    // The response contains the sysDescr as an OCTET STRING
    // Walk through the buffer looking for 0x04 (OCTET STRING) tags
    // that contain printable ASCII text
    const str = data.toString("ascii");
    // Find the last substantial OCTET STRING in the response
    let bestMatch = "";
    for (let i = 0; i < data.length - 2; i++) {
      if (data[i] === 0x04) {
        const len = data[i + 1];
        if (len > 5 && len < 200 && i + 2 + len <= data.length) {
          const candidate = data.subarray(i + 2, i + 2 + len).toString("utf-8");
          // Check if it's mostly printable ASCII
          const printable = candidate.replace(/[^\x20-\x7e]/g, "");
          if (printable.length > candidate.length * 0.8 && candidate.length > bestMatch.length) {
            bestMatch = candidate;
          }
        }
      }
    }
    return bestMatch || null;
  } catch {
    return null;
  }
}

/**
 * Parse SSDP response headers.
 */
function parseSsdpResponse(data: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const lines = data.split("\r\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      const value = line.substring(colonIdx + 1).trim();
      headers[key] = value;
    }
  }
  return headers;
}

// ─── Tool 1: iot_probe ───

const iotProbe: ToolDef = {
  name: "iot_probe",
  description:
    "Detect IoT and embedded devices on a target host. Performs UPnP/SSDP discovery (UDP multicast M-SEARCH on 239.255.255.250:1900), " +
    "probes common IoT ports and web management paths (/cgi-bin/, /HNAP1/, /api/system), " +
    "SNMP community string probing (port 161 UDP with 'public' and 'private' communities to extract sysDescr), " +
    "and IPMI detection on port 623 UDP. Identifies device type, manufacturer, model, and firmware where possible.",
  schema: {
    host: z.string().describe("Target host IP for IoT device detection"),
    ports: z
      .array(z.number())
      .optional()
      .describe("Additional ports to probe"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const host = args.host as string;
    const extraPorts = (args.ports as number[] | undefined) ?? [];

    await limiter.acquire();

    const results: {
      ssdp: {
        discovered: boolean;
        devices: {
          location: string;
          server: string;
          st: string;
          usn: string;
          headers: Record<string, string>;
        }[];
      };
      web_management: {
        port: number;
        open: boolean;
        paths: {
          path: string;
          label: string;
          status: number;
          server: string;
          title: string;
          powered_by: string;
        }[];
      }[];
      snmp: {
        port_open: boolean;
        community_found: string | null;
        sys_descr: string | null;
      };
      ipmi: {
        port_open: boolean;
      };
      device_hints: string[];
    } = {
      ssdp: { discovered: false, devices: [] },
      web_management: [],
      snmp: { port_open: false, community_found: null, sys_descr: null },
      ipmi: { port_open: false },
      device_hints: [],
    };

    // 1. SSDP/UPnP Discovery (only useful for local network targets)
    const isLocalTarget =
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === "127.0.0.1" ||
      host === "localhost";

    if (isLocalTarget) {
      try {
        const ssdpPayload = Buffer.from(SSDP_MSEARCH, "ascii");
        const { responses } = await udpProbe(
          SSDP_MULTICAST_ADDR,
          SSDP_PORT,
          ssdpPayload,
          UDP_TIMEOUT,
        );

        for (const { data } of responses) {
          const responseText = data.toString("utf-8");
          const headers = parseSsdpResponse(responseText);

          results.ssdp.devices.push({
            location: headers["location"] ?? "",
            server: headers["server"] ?? "",
            st: headers["st"] ?? "",
            usn: headers["usn"] ?? "",
            headers,
          });

          if (headers["server"]) {
            results.device_hints.push(`SSDP server: ${headers["server"]}`);
          }
        }

        results.ssdp.discovered = results.ssdp.devices.length > 0;
      } catch {
        // SSDP may not be available
      }
    }

    // 2. Web management probing on common IoT ports
    const portsToProbe = [...new Set([...IOT_MANAGEMENT_PORTS, ...extraPorts])];

    for (const port of portsToProbe) {
      await limiter.acquire();

      const portCheck = await tcpCheck(host, port, TCP_TIMEOUT);
      if (!portCheck.open) continue;

      const portResult: (typeof results.web_management)[0] = {
        port,
        open: true,
        paths: [],
      };

      if (portCheck.banner) {
        results.device_hints.push(`Banner on port ${port}: ${portCheck.banner.trim().slice(0, 200)}`);
      }

      // Probe IoT-specific paths
      for (const { path, label } of IOT_PROBE_PATHS) {
        const probeResult = await httpProbe(host, port, path);
        if (probeResult && probeResult.status !== 0) {
          portResult.paths.push({
            path,
            label,
            status: probeResult.status,
            server: probeResult.server,
            title: probeResult.title,
            powered_by: probeResult.powered_by,
          });

          // Extract device hints from server header and page title
          if (probeResult.server) {
            results.device_hints.push(`Server (${port}${path}): ${probeResult.server}`);
          }
          if (probeResult.title) {
            results.device_hints.push(`Title (${port}${path}): ${probeResult.title}`);
          }

          // Detect specific IoT device patterns
          const combined = `${probeResult.server} ${probeResult.title} ${probeResult.powered_by}`.toLowerCase();
          if (/hikvision/i.test(combined)) results.device_hints.push("Device: Hikvision (IP camera/NVR)");
          if (/dahua/i.test(combined)) results.device_hints.push("Device: Dahua (IP camera/NVR)");
          if (/d-link/i.test(combined)) results.device_hints.push("Device: D-Link (router/camera)");
          if (/tp-link|tplink/i.test(combined)) results.device_hints.push("Device: TP-Link (router/AP)");
          if (/netgear/i.test(combined)) results.device_hints.push("Device: Netgear (router)");
          if (/linksys/i.test(combined)) results.device_hints.push("Device: Linksys (router)");
          if (/mikrotik|routeros/i.test(combined)) results.device_hints.push("Device: MikroTik (RouterOS)");
          if (/ubiquiti|unifi/i.test(combined)) results.device_hints.push("Device: Ubiquiti (UniFi/EdgeOS)");
          if (/synology/i.test(combined)) results.device_hints.push("Device: Synology (NAS)");
          if (/qnap/i.test(combined)) results.device_hints.push("Device: QNAP (NAS)");
          if (/boa\/|mini_httpd|lighttpd|goahead/i.test(combined)) results.device_hints.push("Embedded web server detected");
        }

        await limiter.acquire();
      }

      if (portResult.paths.length > 0) {
        results.web_management.push(portResult);
      }
    }

    // 3. SNMP community string probing
    const snmpCommunities = ["public", "private"];

    for (const community of snmpCommunities) {
      try {
        const snmpPacket = buildSnmpGetRequest(community);
        const { responses } = await udpProbe(host, SNMP_PORT, snmpPacket, UDP_TIMEOUT);

        if (responses.length > 0) {
          results.snmp.port_open = true;
          results.snmp.community_found = community;

          const sysDescr = parseSnmpResponse(responses[0].data);
          if (sysDescr) {
            results.snmp.sys_descr = sysDescr;
            results.device_hints.push(`SNMP sysDescr (community '${community}'): ${sysDescr}`);
          } else {
            results.device_hints.push(`SNMP responds to community '${community}' but sysDescr could not be parsed`);
          }

          break; // Found a working community, stop trying
        }
      } catch {
        // SNMP probe may fail
      }
    }

    // 4. IPMI detection (port 623 UDP)
    try {
      // IPMI RMCP ping: version 0x06, reserved 0x00, sequence 0xFF, class 0x06 (ASF)
      // ASF presence ping
      const ipmiPing = Buffer.from([
        0x06, 0x00, 0xff, 0x06, // RMCP header
        0x00, 0x00, 0x11, 0xbe, // ASF IANA
        0x80, // ASF message type (presence ping)
        0x00, // message tag
        0x00, // reserved
        0x00, // data length
      ]);

      const { responses } = await udpProbe(host, IPMI_PORT, ipmiPing, UDP_TIMEOUT);

      if (responses.length > 0) {
        results.ipmi.port_open = true;
        results.device_hints.push("IPMI/BMC detected on port 623 (server hardware with out-of-band management)");
      }
    } catch {
      // IPMI probe may fail
    }

    // Deduplicate device hints
    results.device_hints = [...new Set(results.device_hints)];

    return json({
      host,
      is_local_target: isLocalTarget,
      ...results,
    });
  },
};

// ─── Tool 2: iot_mac_lookup ───

// OUI prefix database (~50 common entries)
const OUI_DATABASE: Record<string, string> = {
  "005056": "VMware",
  "000C29": "VMware",
  "001C14": "VMware",
  "0050C2": "IEEE Registration Authority",
  "00163E": "Xen (virtual)",
  "080027": "Oracle VirtualBox",
  "0A0027": "Oracle VirtualBox",
  "B827EB": "Raspberry Pi Foundation",
  "DCA632": "Raspberry Pi Foundation",
  "E45F01": "Raspberry Pi Foundation",
  "D83ADD": "Raspberry Pi Foundation",
  "001B44": "Dell",
  "001A2B": "Cisco Systems",
  "00259C": "Cisco Systems",
  "001839": "Cisco Systems",
  "0025B5": "Hewlett Packard",
  "3C4A92": "Hewlett Packard",
  "001E67": "Intel Corporate",
  "001CC0": "Intel Corporate",
  "A4BADB": "Intel Corporate",
  "001AA0": "Dell",
  "F0DEF1": "Google",
  "3C5AB4": "Google",
  "A47733": "Google",
  "3C22FB": "Apple",
  "A483E7": "Apple",
  "F0D1A9": "Apple",
  "6C709F": "Apple",
  "AC87A3": "Apple",
  "D0817A": "Apple",
  "000DB9": "PC Engines (APU)",
  "001C42": "Parallels",
  "00155D": "Microsoft Hyper-V",
  "B4FBE4": "Ubiquiti Networks",
  "18E829": "Ubiquiti Networks",
  "788A20": "Ubiquiti Networks",
  "68D79A": "Ubiquiti Networks",
  "0024A5": "Synology",
  "001132": "Synology",
  "443839": "Cumulus Networks",
  "000F66": "MikroTik",
  "D4CA6D": "MikroTik",
  "6C3B6B": "MikroTik",
  "E48D8C": "MikroTik",
  "C4AD34": "Routerboard (MikroTik)",
  "001E58": "D-Link",
  "1CBDB9": "D-Link",
  "28107B": "D-Link",
  "C0A0BB": "D-Link",
  "5C497D": "TP-Link",
  "E894F6": "TP-Link",
  "6466B3": "TP-Link",
  "E8DE27": "TP-Link",
  "28EE52": "Netgear",
  "C43DC7": "Netgear",
  "A040A0": "Netgear",
  "001AA1": "Cisco Linksys (Belkin)",
  "20AA4B": "Cisco Linksys (Belkin)",
  "58EF68": "Aruba Networks",
  "000B86": "Aruba Networks",
  "D8C7C8": "Aruba Networks",
  "485B39": "Hewlett Packard Enterprise",
  "2CF0A2": "Asus",
  "10C37B": "Asus",
  "60A44C": "Asus",
  "0090A9": "Western Digital",
  "001673": "Zyxel (ZyXEL Communications)",
  "C86C87": "Zyxel (ZyXEL Communications)",
  "001D09": "Dell (iDRAC)",
  "005054": "QEMU/KVM (virtual)",
  "525400": "QEMU/KVM (virtual)",
  "000569": "VMware (ESXi vSwitch)",
  "00249B": "Amazon (AWS)",
  "0A5871": "Amazon (AWS ENI)",
  "06B946": "Amazon (AWS ENI)",
  "0CD0F8": "Samsung",
  "A0CBFD": "Samsung",
  "000AEB": "TP-Link",
  "001EE5": "Cisco Meraki",
  "0018A5": "Hikvision",
  "38AF29": "Hikvision",
  "C0563A": "Hikvision",
  "E05FB9": "Hikvision",
  "34A846": "Dahua",
  "A063A1": "Dahua",
  "B0C5CA": "Dahua",
};

/**
 * Normalize a MAC address to uppercase hex without separators.
 */
function normalizeMac(mac: string): string {
  return mac.replace(/[:\-\.]/g, "").toUpperCase();
}

/**
 * Format a MAC address in standard colon-separated notation.
 */
function formatMac(normalized: string): string {
  return normalized.match(/.{1,2}/g)?.join(":") ?? normalized;
}

const iotMacLookup: ToolDef = {
  name: "iot_mac_lookup",
  description:
    "Look up the manufacturer/vendor of a network device by its MAC address using OUI (Organizationally Unique Identifier) prefix matching. " +
    "Supports any MAC format: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX. " +
    "Includes ~80 common OUI prefixes covering VMware, Cisco, Apple, Raspberry Pi, Ubiquiti, MikroTik, Hikvision, Dahua, and more.",
  schema: {
    mac: z
      .string()
      .describe(
        "MAC address (any format: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX)",
      ),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const rawMac = args.mac as string;
    const normalized = normalizeMac(rawMac);

    // Validate MAC format
    if (!/^[0-9A-F]{12}$/.test(normalized)) {
      return json({
        error: "Invalid MAC address format",
        input: rawMac,
        expected_formats: [
          "XX:XX:XX:XX:XX:XX",
          "XX-XX-XX-XX-XX-XX",
          "XXXXXXXXXXXX",
        ],
      });
    }

    const oui = normalized.substring(0, 6);
    const manufacturer = OUI_DATABASE[oui] ?? null;

    // Determine device category based on manufacturer
    let category = "Unknown";
    if (manufacturer) {
      const mfgLower = manufacturer.toLowerCase();
      if (/vmware|virtualbox|hyper-v|parallels|xen|qemu|kvm|virtual/i.test(manufacturer)) {
        category = "Virtual Machine / Hypervisor";
      } else if (/raspberry pi/i.test(manufacturer)) {
        category = "Single-Board Computer (SBC)";
      } else if (/cisco|mikrotik|routerboard|tp-link|netgear|linksys|d-link|asus|zyxel|aruba/i.test(manufacturer)) {
        category = "Network Equipment (Router/Switch/AP)";
      } else if (/ubiquiti/i.test(manufacturer)) {
        category = "Network Equipment (Ubiquiti)";
      } else if (/hikvision|dahua/i.test(manufacturer)) {
        category = "IP Camera / NVR / DVR";
      } else if (/synology|qnap|western digital/i.test(manufacturer)) {
        category = "Network Attached Storage (NAS)";
      } else if (/apple/i.test(manufacturer)) {
        category = "Apple Device";
      } else if (/google/i.test(manufacturer)) {
        category = "Google Device";
      } else if (/samsung/i.test(manufacturer)) {
        category = "Samsung Device";
      } else if (/dell|hewlett|intel|pc engines/i.test(manufacturer)) {
        category = "Server / Workstation";
      } else if (/amazon|aws/i.test(manufacturer)) {
        category = "Cloud Instance (AWS)";
      } else if (/cisco meraki/i.test(manufacturer)) {
        category = "Cloud-Managed Network (Meraki)";
      } else if (/idrac/i.test(mfgLower)) {
        category = "Out-of-Band Management (iDRAC)";
      } else if (/cumulus/i.test(manufacturer)) {
        category = "Network Operating System (Cumulus Linux)";
      }
    }

    // Check if it's a locally administered address (bit 1 of first octet)
    const firstByte = parseInt(normalized.substring(0, 2), 16);
    const isLocallyAdministered = (firstByte & 0x02) !== 0;
    const isMulticast = (firstByte & 0x01) !== 0;

    return json({
      mac: formatMac(normalized),
      mac_normalized: normalized,
      oui_prefix: formatMac(oui + "000000").substring(0, 8),
      manufacturer: manufacturer ?? "Unknown (OUI not in local database)",
      category,
      is_locally_administered: isLocallyAdministered,
      is_multicast: isMulticast,
      note: isLocallyAdministered
        ? "This is a locally administered address (LAA) — may be randomized (iOS/Android privacy feature) or virtual"
        : manufacturer
          ? undefined
          : "OUI prefix not found in local database. For comprehensive lookup, use IEEE OUI database at https://standards-oui.ieee.org/",
    });
  },
};

// ─── Export All IoT Tools ───

export const iotTools: ToolDef[] = [iotProbe, iotMacLookup];
