/**
 * Multi-layer C2 (Command & Control) framework detection profiles.
 *
 * Combines JARM TLS fingerprints, certificate anomalies, HTTP behavioral
 * patterns, and known IOC paths to identify C2 team-servers in the wild.
 * These profiles are used for proactive threat hunting — not exploitation.
 *
 * JARM hashes are sourced from public research; certificate and HTTP patterns
 * are derived from default/untuned framework configurations.
 *
 * References:
 *  - https://github.com/salesforce/jarm
 *  - https://michaelkoczwara.medium.com/cobalt-strike-c2-hunting-with-shodan-c448d501a6e2
 *  - https://blog.fox-it.com/2022/08/31/sliver-c2-hunting/
 */

/** A multi-signal C2 framework detection profile. */
export interface C2Signature {
  /** Framework name */
  name: string;
  /** JARM TLS fingerprint hash (62 chars) — may vary with malleable profiles */
  jarm?: string;
  /** TLS certificate anomaly patterns for the default/out-of-box configuration */
  certPatterns: {
    /** Common Name regex patterns (e.g., "localhost", random hex strings) */
    cn?: string[];
    /** Organization field regex patterns */
    o?: string[];
    /** Certificate validity window anomalies */
    validity?: { minDays?: number; maxDays?: number };
    /** Whether the default cert is self-signed */
    selfSigned?: boolean;
    /** Serial number format regex (some frameworks use predictable serials) */
    serialPattern?: string;
  };
  /** HTTP-layer behavioral indicators */
  httpPatterns?: {
    /** Default URI paths served by the team-server or stager */
    defaultPaths?: string[];
    /** Specific response body size for a given status (e.g., 404 page with fixed length) */
    responseSize?: { status: number; size: number };
    /** Characteristic HTTP headers on responses */
    headers?: Record<string, string>;
  };
  /** Brief description of the framework and its primary use case */
  description: string;
}

export const C2_SIGNATURES: C2Signature[] = [
  // ──────────────────────────────────────────────────
  // Cobalt Strike
  // ──────────────────────────────────────────────────
  {
    name: "Cobalt Strike",
    jarm: "07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1",
    certPatterns: {
      cn: ["^localhost$", "^Major Cobalt Strike$"],
      o: ["^cobaltstrike$", "^Strategic Cyber LLC$"],
      validity: { minDays: 3650, maxDays: 3660 },
      selfSigned: true,
      serialPattern: "^146473198$",
    },
    httpPatterns: {
      defaultPaths: [
        "/visit.js",
        "/j.ad",
        "/ga.js",
        "/cm",
        "/push",
        "/submit.php",
        "/___utm.gif",
        "/pixel",
        "/updates.rss",
        "/fwlink",
      ],
      responseSize: { status: 404, size: 0 },
      headers: {},
    },
    description:
      "Commercial adversary simulation framework by Fortra (formerly HelpSystems). Most widely abused C2 framework. Default config uses a self-signed cert with CN=localhost, O=cobaltstrike, and 10-year validity.",
  },

  // ──────────────────────────────────────────────────
  // Metasploit Framework
  // ──────────────────────────────────────────────────
  {
    name: "Metasploit Framework",
    jarm: "07d14d16d21d21d000007d14d21d21d000000000000000000000000000000",
    certPatterns: {
      cn: ["^localhost$", "^MetasploitSelfSignedCA$"],
      o: ["^Rapid7$"],
      validity: { minDays: 365, maxDays: 1825 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: [
        "/handler",
        "/exploit",
        "/payload",
        "/shell",
        "/connect",
      ],
      responseSize: { status: 404, size: 292 },
      headers: {},
    },
    description:
      "Open-source penetration testing framework by Rapid7. Default HTTPS handler generates a self-signed certificate with predictable attributes. Meterpreter reverse_https uses /handler as the callback URI.",
  },

  // ──────────────────────────────────────────────────
  // Sliver C2
  // ──────────────────────────────────────────────────
  {
    name: "Sliver C2",
    jarm: "2ad2ad0002ad2ad00042d42d000000ad9bf51cc3f5a1e29eecb81d0c7b06eb",
    certPatterns: {
      cn: ["^[a-z]{8,16}\\.[a-z]{2,6}$"],
      o: ["^[A-Z][a-z]+ (Inc|LLC|Ltd|Corp)$"],
      validity: { minDays: 365, maxDays: 730 },
      selfSigned: true,
      serialPattern: "^[0-9a-f]{32}$",
    },
    httpPatterns: {
      defaultPaths: [
        "/info",
        "/rpc/",
        "/start",
        "/session",
        "/assets.js",
      ],
      headers: {
        "cache-control": "^no-store, no-cache, must-revalidate$",
      },
    },
    description:
      "Open-source cross-platform C2 by BishopFox. Generates random-looking domain names for TLS certificates. Uses mutual TLS (mTLS), HTTP/S, DNS, and WireGuard transports. Default HTTPS listener produces JARM consistent with Go's crypto/tls.",
  },

  // ──────────────────────────────────────────────────
  // Brute Ratel C4
  // ──────────────────────────────────────────────────
  {
    name: "Brute Ratel C4",
    jarm: "29d29d15d29d29d21c29d29d29d29dce7a321a0a0a0a0a0a0a0a0a0a0a0a0",
    certPatterns: {
      cn: ["^[a-z0-9-]+\\.[a-z]{2,}$"],
      o: [],
      validity: { minDays: 365, maxDays: 365 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: ["/content", "/auth", "/api/", "/feed"],
      responseSize: { status: 200, size: 0 },
      headers: {
        "content-type": "^text/html$",
      },
    },
    description:
      "Commercial C2 framework by Chetan Nayak (Paranoid Ninja). Designed to evade EDR. Default HTTPS listener returns an empty 200 OK with text/html content-type. BRC4 badgers communicate over encrypted channels.",
  },

  // ──────────────────────────────────────────────────
  // Havoc C2
  // ──────────────────────────────────────────────────
  {
    name: "Havoc C2",
    jarm: "00000000000000000041d41d000000041d41d41d41d41d41d41d41d41d41d",
    certPatterns: {
      cn: ["^localhost$", "^Havoc$"],
      o: ["^Havoc$"],
      validity: { minDays: 365, maxDays: 3650 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: ["/", "/demon"],
      responseSize: { status: 404, size: 0 },
      headers: {
        "x-powered-by": "^Havoc$",
      },
    },
    description:
      "Open-source post-exploitation C2 framework. Teamserver (written in Go/C++) listens on HTTPS with a self-signed cert. Demon agents use HTTP/S for tasking. Known for poor OPSEC defaults.",
  },

  // ──────────────────────────────────────────────────
  // Mythic C2
  // ──────────────────────────────────────────────────
  {
    name: "Mythic C2",
    jarm: "07d14d16d21d21d07c07d14d07d21d9b2f5869a6985368a9dec764186a9175",
    certPatterns: {
      cn: ["^Mythic$", "^mythic-ssl$"],
      o: ["^Mythic$"],
      validity: { minDays: 365, maxDays: 730 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: [
        "/api/v1.4/agent_message",
        "/agent_message",
        "/login",
        "/new/callbacks",
      ],
      headers: {
        server: "^nginx$",
      },
    },
    description:
      "Open-source collaborative C2 platform with pluggable agent architecture (Apollo, Poseidon, Medusa, etc.). Built on Docker with a React UI. Uses Nginx as a reverse proxy by default, making the JARM consistent with Nginx rather than a raw Go TLS server.",
  },

  // ──────────────────────────────────────────────────
  // Covenant
  // ──────────────────────────────────────────────────
  {
    name: "Covenant",
    jarm: "07d14d16d21d21d07c42d43d000000f50d155305214cf247147c43c0f1a823",
    certPatterns: {
      cn: ["^Covenant$", "^localhost$"],
      o: ["^Covenant$"],
      validity: { minDays: 365, maxDays: 365 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: [
        "/en-us/test.html",
        "/en-us/docs.html",
        "/covenantuser/login",
        "/api/grunts",
      ],
      headers: {
        server: "^Microsoft-HTTPAPI/2\\.0$",
      },
    },
    description:
      "Open-source .NET C2 framework. Runs on ASP.NET Core (Kestrel). Default grunt stager uses /en-us/test.html and /en-us/docs.html as callback URIs. Teamserver exposes a Blazor UI on the same port.",
  },

  // ──────────────────────────────────────────────────
  // PoshC2
  // ──────────────────────────────────────────────────
  {
    name: "PoshC2",
    jarm: "2ad2ad0002ad2ad22c42d42d000000faabb8fd156aa8b4d8a37853e1063261",
    certPatterns: {
      cn: ["^P18055077$", "^PoshC2$"],
      o: ["^PoshC2$"],
      validity: { minDays: 365, maxDays: 730 },
      selfSigned: true,
      serialPattern: "^[0-9]{8,12}$",
    },
    httpPatterns: {
      defaultPaths: [
        "/images/static/content/",
        "/news/",
        "/webapp/static/",
        "/homepage/",
        "/get",
      ],
      responseSize: { status: 200, size: 1 },
      headers: {
        server: "^Apache$",
      },
    },
    description:
      "Open-source proxy-aware C2 framework. Written in Python with PowerShell/C#/Python implants. Default server spoofs Apache Server header. Uses predictable URI prefixes and returns 200 with a 1-byte body as a heartbeat.",
  },

  // ──────────────────────────────────────────────────
  // Nighthawk (commercial, less documented)
  // ──────────────────────────────────────────────────
  {
    name: "Nighthawk",
    certPatterns: {
      cn: ["^[a-z0-9]{6,12}$"],
      o: [],
      validity: { minDays: 30, maxDays: 365 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: ["/index.html", "/static/"],
      headers: {},
    },
    description:
      "Commercial C2 framework by MDSec. Designed as a Cobalt Strike alternative with advanced evasion. Limited public JARM/IOC data due to its commercial, licensed nature.",
  },

  // ──────────────────────────────────────────────────
  // Villain
  // ──────────────────────────────────────────────────
  {
    name: "Villain",
    certPatterns: {
      cn: ["^villain$", "^localhost$"],
      o: [],
      validity: { minDays: 365, maxDays: 365 },
      selfSigned: true,
    },
    httpPatterns: {
      defaultPaths: ["/", "/shell"],
      responseSize: { status: 200, size: 0 },
      headers: {},
    },
    description:
      "Open-source Python C2 framework generating Windows/Linux reverse shells. Supports HoaxShell-based PowerShell payloads. Minimal OPSEC; self-signed cert with CN=villain.",
  },
];
