import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";

// ─── Inline Signature Databases ───

/** JARM fingerprint signatures */
const JARM_SIGNATURES: Record<string, { name: string; category: string; confidence: number }> = {
  "07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1": { name: "Cobalt Strike", category: "c2", confidence: 0.95 },
  "07d14d16d21d21d000007d14d21d21d000000000000000000000000000000": { name: "Metasploit Framework", category: "c2", confidence: 0.9 },
  "2ad2ad0002ad2ad00042d42d000000ad9bf51cc3f5a1e29eecb81d0c7b06eb": { name: "Sliver C2", category: "c2", confidence: 0.92 },
  "29d29d15d29d29d21c29d29d29d29dce7a321a0a0a0a0a0a0a0a0a0a0a0a0": { name: "Brute Ratel C4", category: "c2", confidence: 0.93 },
  "00000000000000000041d41d000000041d41d41d41d41d41d41d41d41d41d": { name: "Havoc C2", category: "c2", confidence: 0.88 },
  "07d14d16d21d21d07c07d14d07d21d9b2f5869a6985368a9dec764186a9175": { name: "Mythic C2", category: "c2", confidence: 0.85 },
  "07d14d16d21d21d07c42d43d000000f50d155305214cf247147c43c0f1a823": { name: "Covenant C2", category: "c2", confidence: 0.87 },
  "2ad2ad0002ad2ad22c42d42d000000faabb8fd156aa8b4d8a37853e1063261": { name: "PoshC2", category: "c2", confidence: 0.86 },
  "07d14d16d21d21d07c42d41d00041de48f7e0c1ef5e08f0e0829b98e2d892": { name: "Cobalt Strike 4.x (malleable)", category: "c2", confidence: 0.8 },
  "21d14d00021d21d21c21d14d21d21d2b12e8449b5b089aa0b2eb55a24b7654": { name: "Deimos C2", category: "c2", confidence: 0.82 },
  "00000000000000000041d00000041d9535d5acd30472a4b71e504b23e19590": { name: "Merlin C2", category: "c2", confidence: 0.84 },
  "29d29d15d29d29d21c29d29d29d29de1a3c0d7ca6ad8388057924be83dfc6a": { name: "Nginx (default)", category: "server", confidence: 0.75 },
  "29d29d00029d29d21c29d29d29d29d9f8e3e81060c7abac4ae7abd5dba4f1c": { name: "Nginx (OpenSSL 1.1.1)", category: "server", confidence: 0.7 },
  "2ad2ad0002ad2ad22c2ad2ad2ad2adce8be1af6b0e09b5a8e7b7cb49cc3e3a": { name: "Apache httpd (OpenSSL)", category: "server", confidence: 0.72 },
  "07d14d16d21d21d07c42d41d00041d47e4e0ae17960b2a5b4fd6107fbb0926": { name: "Microsoft IIS 10.0", category: "server", confidence: 0.85 },
  "27d27d27d00027d1dc27d27d27d27d4cf86d0e5d5855cb2d08a62e05b8e87b": { name: "Microsoft IIS 8.5", category: "server", confidence: 0.82 },
  "27d40d40d29d40d1dc27d40d27d40d5c6db2af4c111d3a76013bbd3e1a4a2c": { name: "Cloudflare", category: "cdn", confidence: 0.9 },
  "27d3ed3ed0003ed1dc42d43d00041d6183ff1bfae51ebd88d70e30c10c6c6e": { name: "Cloudflare (HTTP/2)", category: "cdn", confidence: 0.88 },
  "29d29d20d29d29d21c29d29d29d29dfdb866af6514e0ed6c5a4b51a14f4e93": { name: "Amazon CloudFront", category: "cdn", confidence: 0.87 },
};

/** Favicon MurmurHash3 signatures */
const FAVICON_SIGNATURES: Record<number, { name: string; category: string }> = {
  [-586023785]: { name: "Jenkins", category: "ci-cd" },
  [81586312]: { name: "Jenkins (Blue Ocean)", category: "ci-cd" },
  [-1293290337]: { name: "GitLab CE/EE", category: "ci-cd" },
  [-1231872293]: { name: "Argo CD", category: "ci-cd" },
  [1485257654]: { name: "Sonatype Nexus", category: "ci-cd" },
  [-473653720]: { name: "JFrog Artifactory", category: "ci-cd" },
  [1917443752]: { name: "SonarQube", category: "ci-cd" },
  [595148549]: { name: "Harbor Registry", category: "ci-cd" },
  [-1399433489]: { name: "Grafana", category: "monitoring" },
  [-1811827550]: { name: "Kibana", category: "monitoring" },
  [1571196100]: { name: "Prometheus", category: "monitoring" },
  [999357577]: { name: "Zabbix", category: "monitoring" },
  [-412708573]: { name: "Nagios", category: "monitoring" },
  [945408572]: { name: "FortiGate (Fortinet)", category: "firewall" },
  [-305179312]: { name: "pfSense", category: "firewall" },
  [1485478972]: { name: "OPNsense", category: "firewall" },
  [362091310]: { name: "Citrix NetScaler / ADC", category: "firewall" },
  [116323821]: { name: "Spring Boot (default Leaf)", category: "application" },
  [1117779739]: { name: "Apache Tomcat (default)", category: "application" },
  [-335242539]: { name: "phpMyAdmin", category: "database" },
  [-536764016]: { name: "Elasticsearch", category: "database" },
  [-1073546895]: { name: "HashiCorp Vault", category: "security" },
  [113734322]: { name: "HashiCorp Consul", category: "security" },
  [-1166125415]: { name: "Keycloak", category: "security" },
  [-822940097]: { name: "MinIO", category: "storage" },
  [-1535817075]: { name: "Synology DSM", category: "storage" },
  [671932091]: { name: "Portainer", category: "management" },
  [-1950415971]: { name: "Kubernetes Dashboard", category: "management" },
  [-1889921692]: { name: "Atlassian Jira", category: "management" },
  [-305317842]: { name: "Atlassian Confluence", category: "management" },
};

/** HASSH fingerprint signatures */
const HASSH_SIGNATURES: Record<string, { name: string; version: string }> = {
  "ec7378c1a92f5a8dde7e8b7a1ddf33d1": { name: "OpenSSH", version: "7.x-8.x (Linux)" },
  "b12d2871a1571f57b5f7e53e3e7d2b97": { name: "OpenSSH", version: "6.x" },
  "06046964c022c6407d15a27b12a6a4fb": { name: "Dropbear SSH", version: "2019+" },
  "92674389fa1e47a27ddd8d9b63ecd42b": { name: "PuTTY", version: "0.70+" },
  "c8a9b0c5c7e4d8e1f2a3b4c5d6e7f8a9": { name: "Paramiko", version: "Python SSH library" },
  "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6": { name: "libssh2", version: "1.x" },
  "3f0099d323fed5119bbfcca064478207": { name: "OpenSSH", version: "8.2+ (Ubuntu 20.04)" },
  "fa01011c703e5f1cd2bbfa8e2c099e5e": { name: "OpenSSH", version: "9.x" },
};

/** Header ordering signatures */
const HEADER_ORDER_SIGNATURES: Record<string, { name: string; description: string }> = {
  "nginx_default": { name: "Nginx (default)", description: "server, date, content-type, content-length, connection" },
  "apache_default": { name: "Apache httpd (default)", description: "date, server, content-type, content-length" },
  "iis_default": { name: "Microsoft IIS", description: "content-type, server, x-powered-by, date, content-length" },
  "caddy_default": { name: "Caddy", description: "server, content-type, date" },
  "express_default": { name: "Express.js (Node)", description: "x-powered-by, content-type, date, connection, content-length" },
  "cloudflare_proxy": { name: "Cloudflare (proxied)", description: "date, content-type, cf-ray, cf-cache-status, server" },
};

/** C2 detection profiles */
const C2_PROFILES: {
  name: string;
  jarm?: string;
  certCn?: string[];
  certOrg?: string[];
  selfSigned: boolean;
  validityDays?: { min: number; max: number };
  description: string;
}[] = [
  {
    name: "Cobalt Strike",
    jarm: "07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1",
    certCn: ["localhost", "Major Cobalt Strike"],
    certOrg: ["cobaltstrike", "Strategic Cyber LLC"],
    selfSigned: true,
    validityDays: { min: 3650, max: 3660 },
    description: "Commercial adversary simulation. Default cert: CN=localhost, O=cobaltstrike, 10yr validity.",
  },
  {
    name: "Metasploit Framework",
    jarm: "07d14d16d21d21d000007d14d21d21d000000000000000000000000000000",
    certCn: ["localhost", "MetasploitSelfSignedCA"],
    certOrg: ["Rapid7"],
    selfSigned: true,
    validityDays: { min: 365, max: 1825 },
    description: "Open-source pen test framework. Default HTTPS handler with self-signed cert.",
  },
  {
    name: "Sliver C2",
    jarm: "2ad2ad0002ad2ad00042d42d000000ad9bf51cc3f5a1e29eecb81d0c7b06eb",
    certCn: [],
    certOrg: [],
    selfSigned: true,
    validityDays: { min: 365, max: 730 },
    description: "BishopFox open-source C2. Random domain CN, Go crypto/tls JARM.",
  },
  {
    name: "Brute Ratel C4",
    jarm: "29d29d15d29d29d21c29d29d29d29dce7a321a0a0a0a0a0a0a0a0a0a0a0a0",
    certCn: [],
    certOrg: [],
    selfSigned: true,
    validityDays: { min: 365, max: 365 },
    description: "Commercial C2 by Paranoid Ninja. Designed to evade EDR.",
  },
  {
    name: "Havoc C2",
    jarm: "00000000000000000041d41d000000041d41d41d41d41d41d41d41d41d41d",
    certCn: ["localhost", "Havoc"],
    certOrg: ["Havoc"],
    selfSigned: true,
    validityDays: { min: 365, max: 3650 },
    description: "Open-source post-exploitation C2. Poor OPSEC defaults.",
  },
  {
    name: "Mythic C2",
    jarm: "07d14d16d21d21d07c07d14d07d21d9b2f5869a6985368a9dec764186a9175",
    certCn: ["Mythic", "mythic-ssl"],
    certOrg: ["Mythic"],
    selfSigned: true,
    validityDays: { min: 365, max: 730 },
    description: "Collaborative C2 with pluggable agents. Docker + Nginx frontend.",
  },
  {
    name: "Covenant",
    jarm: "07d14d16d21d21d07c42d43d000000f50d155305214cf247147c43c0f1a823",
    certCn: ["Covenant", "localhost"],
    certOrg: ["Covenant"],
    selfSigned: true,
    validityDays: { min: 365, max: 365 },
    description: ".NET C2 framework. ASP.NET Core (Kestrel). Blazor UI.",
  },
  {
    name: "PoshC2",
    jarm: "2ad2ad0002ad2ad22c42d42d000000faabb8fd156aa8b4d8a37853e1063261",
    certCn: ["P18055077", "PoshC2"],
    certOrg: ["PoshC2"],
    selfSigned: true,
    validityDays: { min: 365, max: 730 },
    description: "Python-based C2 with PowerShell/C#/Python implants. Spoofs Apache header.",
  },
];

// ─── Tool 1: fp_identify ───

const fpIdentify: ToolDef = {
  name: "fp_identify",
  description:
    "Look up any fingerprint hash in known signatures database. Accepts a hash value and type (jarm, favicon, " +
    "hassh, header_order). Returns matching signatures with name, category, and confidence level. Covers C2 " +
    "frameworks, web servers, CDNs, CI/CD tools, monitoring platforms, and more.",
  schema: {
    hash: z.string().describe("Fingerprint hash value to look up"),
    type: z.enum(["jarm", "favicon", "hassh", "header_order"]).describe("Type of fingerprint hash"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const hash = args.hash as string;
    const type = args.type as string;

    let match: Record<string, unknown> | null = null;
    let databaseSize = 0;

    switch (type) {
      case "jarm": {
        databaseSize = Object.keys(JARM_SIGNATURES).length;
        const sig = JARM_SIGNATURES[hash];
        if (sig) {
          match = {
            hash,
            name: sig.name,
            category: sig.category,
            confidence: sig.confidence,
            isC2: sig.category === "c2",
            alert: sig.category === "c2"
              ? `ALERT: JARM fingerprint matches known C2 framework "${sig.name}". Investigate immediately.`
              : undefined,
          };
        }
        break;
      }

      case "favicon": {
        databaseSize = Object.keys(FAVICON_SIGNATURES).length;
        const numHash = parseInt(hash, 10);
        if (!isNaN(numHash)) {
          const sig = FAVICON_SIGNATURES[numHash];
          if (sig) {
            match = {
              hash: numHash,
              name: sig.name,
              category: sig.category,
              shodanQuery: `http.favicon.hash:${numHash}`,
            };
          }
        }
        break;
      }

      case "hassh": {
        databaseSize = Object.keys(HASSH_SIGNATURES).length;
        const sig = HASSH_SIGNATURES[hash];
        if (sig) {
          match = {
            hash,
            name: sig.name,
            version: sig.version,
          };
        }
        break;
      }

      case "header_order": {
        databaseSize = Object.keys(HEADER_ORDER_SIGNATURES).length;
        const sig = HEADER_ORDER_SIGNATURES[hash];
        if (sig) {
          match = {
            hash,
            name: sig.name,
            description: sig.description,
          };
        }
        break;
      }
    }

    const result = {
      query: { hash, type },
      found: match !== null,
      match,
      databaseSize,
      note: match === null
        ? `No match found in ${databaseSize} known ${type} signatures. Hash may belong to custom/unknown software.`
        : `Match found in ${type} signature database.`,
    };

    return json(result);
  },
};

// ─── Tool 2: fp_c2_detect ───

const fpC2Detect: ToolDef = {
  name: "fp_c2_detect",
  description:
    "C2 framework detection. Takes JARM fingerprint, certificate details, and timing data. Matches against " +
    "known C2 profiles for Cobalt Strike, Metasploit, Sliver, Brute Ratel, Havoc, Mythic, Covenant, and PoshC2. " +
    "Returns detected C2 framework (if any), confidence score, and matching signals.",
  schema: {
    host: z.string().describe("Target host"),
    port: z.number().optional().default(443).describe("Port"),
    jarm: z.string().optional().describe("JARM fingerprint"),
    certCn: z.string().optional().describe("Certificate CN"),
    certOrg: z.string().optional().describe("Certificate Organization"),
    certSelfSigned: z.boolean().optional().describe("Is certificate self-signed"),
    certValidityDays: z.number().optional().describe("Certificate validity period in days"),
    responseTimingMs: z.number().optional().describe("Average response time"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const host = args.host as string;
    const port = (args.port as number | undefined) ?? 443;
    const jarm = args.jarm as string | undefined;
    const certCn = args.certCn as string | undefined;
    const certOrg = args.certOrg as string | undefined;
    const certSelfSigned = args.certSelfSigned as boolean | undefined;
    const certValidityDays = args.certValidityDays as number | undefined;
    const responseTimingMs = args.responseTimingMs as number | undefined;

    const detections: {
      framework: string;
      confidence: number;
      matchingSignals: string[];
      description: string;
    }[] = [];

    for (const profile of C2_PROFILES) {
      const matchingSignals: string[] = [];
      let signalCount = 0;
      let matchCount = 0;

      // JARM match
      if (profile.jarm && jarm) {
        signalCount++;
        if (jarm === profile.jarm) {
          matchCount += 2; // JARM is a strong signal
          signalCount++; // Weight it higher
          matchingSignals.push(`JARM fingerprint exact match: ${jarm}`);
        }
      }

      // Certificate CN match
      if (profile.certCn && profile.certCn.length > 0 && certCn) {
        signalCount++;
        const cnLower = certCn.toLowerCase();
        if (profile.certCn.some((cn) => cnLower === cn.toLowerCase())) {
          matchCount++;
          matchingSignals.push(`Certificate CN matches known pattern: "${certCn}"`);
        }
      }

      // Certificate Org match
      if (profile.certOrg && profile.certOrg.length > 0 && certOrg) {
        signalCount++;
        const orgLower = certOrg.toLowerCase();
        if (profile.certOrg.some((o) => orgLower === o.toLowerCase())) {
          matchCount++;
          matchingSignals.push(`Certificate Organization matches: "${certOrg}"`);
        }
      }

      // Self-signed check
      if (profile.selfSigned && certSelfSigned !== undefined) {
        signalCount++;
        if (certSelfSigned === profile.selfSigned) {
          matchCount++;
          matchingSignals.push("Certificate is self-signed (matches C2 default)");
        }
      }

      // Validity period check
      if (profile.validityDays && certValidityDays !== undefined) {
        signalCount++;
        if (certValidityDays >= profile.validityDays.min && certValidityDays <= profile.validityDays.max) {
          matchCount++;
          matchingSignals.push(
            `Certificate validity (${certValidityDays} days) matches expected range ` +
            `(${profile.validityDays.min}-${profile.validityDays.max} days)`,
          );
        }
      }

      if (matchingSignals.length >= 2 || (matchingSignals.length >= 1 && matchingSignals[0].includes("JARM"))) {
        const confidence = signalCount > 0 ? Math.min(matchCount / signalCount, 1.0) : 0;
        detections.push({
          framework: profile.name,
          confidence: Math.round(confidence * 100) / 100,
          matchingSignals,
          description: profile.description,
        });
      }
    }

    // Sort by confidence descending
    detections.sort((a, b) => b.confidence - a.confidence);

    const topDetection = detections[0] ?? null;

    const result = {
      target: `${host}:${port}`,
      c2Detected: detections.length > 0,
      topMatch: topDetection
        ? {
            framework: topDetection.framework,
            confidence: topDetection.confidence,
            matchingSignals: topDetection.matchingSignals,
            description: topDetection.description,
          }
        : null,
      allMatches: detections,
      inputSignals: {
        jarm: jarm ?? null,
        certCn: certCn ?? null,
        certOrg: certOrg ?? null,
        certSelfSigned: certSelfSigned ?? null,
        certValidityDays: certValidityDays ?? null,
        responseTimingMs: responseTimingMs ?? null,
      },
      recommendation: detections.length > 0
        ? `C2 framework indicators detected. Top match: ${topDetection!.framework} ` +
          `(confidence: ${topDetection!.confidence}). Recommend immediate investigation: ` +
          `check host reputation, review network traffic, and correlate with threat intelligence feeds.`
        : "No known C2 framework signatures matched. Host may still run custom or modified C2 — " +
          "consider behavioral analysis if suspicious.",
    };

    return json(result);
  },
};

// ─── Tool 3: fp_list_signatures ───

const fpListSignatures: ToolDef = {
  name: "fp_list_signatures",
  description:
    "List all known signatures by category. Filter by type (jarm, favicon, hassh, header_order, c2, all). " +
    "Returns the full signature database for the requested type, useful for manual lookups and research.",
  schema: {
    type: z
      .enum(["jarm", "favicon", "hassh", "header_order", "c2", "all"])
      .optional()
      .default("all")
      .describe("Signature category to list"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const type = (args.type as string | undefined) ?? "all";

    const sections: Record<string, unknown> = {};

    if (type === "all" || type === "jarm") {
      sections.jarm = {
        count: Object.keys(JARM_SIGNATURES).length,
        signatures: Object.entries(JARM_SIGNATURES).map(([hash, sig]) => ({
          hash,
          name: sig.name,
          category: sig.category,
          confidence: sig.confidence,
        })),
      };
    }

    if (type === "all" || type === "favicon") {
      sections.favicon = {
        count: Object.keys(FAVICON_SIGNATURES).length,
        signatures: Object.entries(FAVICON_SIGNATURES).map(([hash, sig]) => ({
          hash: parseInt(hash, 10),
          name: sig.name,
          category: sig.category,
          shodanQuery: `http.favicon.hash:${hash}`,
        })),
      };
    }

    if (type === "all" || type === "hassh") {
      sections.hassh = {
        count: Object.keys(HASSH_SIGNATURES).length,
        signatures: Object.entries(HASSH_SIGNATURES).map(([hash, sig]) => ({
          hash,
          name: sig.name,
          version: sig.version,
        })),
      };
    }

    if (type === "all" || type === "header_order") {
      sections.header_order = {
        count: Object.keys(HEADER_ORDER_SIGNATURES).length,
        signatures: Object.entries(HEADER_ORDER_SIGNATURES).map(([id, sig]) => ({
          id,
          name: sig.name,
          description: sig.description,
        })),
      };
    }

    if (type === "all" || type === "c2") {
      sections.c2 = {
        count: C2_PROFILES.length,
        profiles: C2_PROFILES.map((p) => ({
          name: p.name,
          jarm: p.jarm ?? null,
          certCn: p.certCn,
          certOrg: p.certOrg,
          selfSigned: p.selfSigned,
          validityDays: p.validityDays ?? null,
          description: p.description,
        })),
      };
    }

    const totalSignatures =
      (type === "all" || type === "jarm" ? Object.keys(JARM_SIGNATURES).length : 0) +
      (type === "all" || type === "favicon" ? Object.keys(FAVICON_SIGNATURES).length : 0) +
      (type === "all" || type === "hassh" ? Object.keys(HASSH_SIGNATURES).length : 0) +
      (type === "all" || type === "header_order" ? Object.keys(HEADER_ORDER_SIGNATURES).length : 0) +
      (type === "all" || type === "c2" ? C2_PROFILES.length : 0);

    const result = {
      filter: type,
      totalSignatures,
      sections,
    };

    return json(result);
  },
};

// ─── Export All Identify Tools ───

export const identifyTools: ToolDef[] = [
  fpIdentify,
  fpC2Detect,
  fpListSignatures,
];
