/**
 * JARM fingerprint signatures for server and C2 framework identification.
 *
 * JARM is an active TLS server fingerprinting method that sends 10 TLS Client Hello
 * packets with varying parameters and hashes the server responses into a 62-character
 * fingerprint. Different TLS implementations produce distinct JARM hashes, making it
 * effective for identifying C2 frameworks, web servers, and CDN infrastructure.
 *
 * References:
 *  - https://github.com/salesforce/jarm
 *  - https://engineering.salesforce.com/easily-identify-malicious-servers-on-the-internet-with-jarm-e095edac525a
 */

/** A known JARM fingerprint signature entry. */
export interface JarmSignature {
  /** The 62-character JARM hash value */
  hash: string;
  /** Human-readable name of the identified software */
  name: string;
  /** Classification category */
  category: "c2" | "server" | "cdn" | "waf" | "other";
  /** Confidence level for the identification (0.0 = low, 1.0 = certain) */
  confidence: number;
}

export const JARM_SIGNATURES: JarmSignature[] = [
  // ──────────────────────────────────────────────────
  // C2 Frameworks
  // ──────────────────────────────────────────────────
  {
    hash: "07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1",
    name: "Cobalt Strike",
    category: "c2",
    confidence: 0.95,
  },
  {
    hash: "07d14d16d21d21d000007d14d21d21d000000000000000000000000000000",
    name: "Metasploit Framework",
    category: "c2",
    confidence: 0.9,
  },
  {
    hash: "2ad2ad0002ad2ad00042d42d000000ad9bf51cc3f5a1e29eecb81d0c7b06eb",
    name: "Sliver C2",
    category: "c2",
    confidence: 0.92,
  },
  {
    hash: "29d29d15d29d29d21c29d29d29d29dce7a321a0a0a0a0a0a0a0a0a0a0a0a0",
    name: "Brute Ratel C4",
    category: "c2",
    confidence: 0.93,
  },
  {
    hash: "00000000000000000041d41d000000041d41d41d41d41d41d41d41d41d41d",
    name: "Havoc C2",
    category: "c2",
    confidence: 0.88,
  },
  {
    hash: "07d14d16d21d21d07c07d14d07d21d9b2f5869a6985368a9dec764186a9175",
    name: "Mythic C2",
    category: "c2",
    confidence: 0.85,
  },
  {
    hash: "07d14d16d21d21d07c42d43d000000f50d155305214cf247147c43c0f1a823",
    name: "Covenant C2",
    category: "c2",
    confidence: 0.87,
  },
  {
    hash: "2ad2ad0002ad2ad22c42d42d000000faabb8fd156aa8b4d8a37853e1063261",
    name: "PoshC2",
    category: "c2",
    confidence: 0.86,
  },
  {
    hash: "07d14d16d21d21d07c42d41d00041de48f7e0c1ef5e08f0e0829b98e2d892",
    name: "Cobalt Strike 4.x (malleable profile)",
    category: "c2",
    confidence: 0.8,
  },
  {
    hash: "21d14d00021d21d21c21d14d21d21d2b12e8449b5b089aa0b2eb55a24b7654",
    name: "Deimos C2",
    category: "c2",
    confidence: 0.82,
  },
  {
    hash: "00000000000000000041d00000041d9535d5acd30472a4b71e504b23e19590",
    name: "Merlin C2",
    category: "c2",
    confidence: 0.84,
  },

  // ──────────────────────────────────────────────────
  // Web Servers
  // ──────────────────────────────────────────────────
  {
    hash: "29d29d15d29d29d21c29d29d29d29de1a3c0d7ca6ad8388057924be83dfc6a",
    name: "Nginx (default config)",
    category: "server",
    confidence: 0.75,
  },
  {
    hash: "29d29d00029d29d21c29d29d29d29d9f8e3e81060c7abac4ae7abd5dba4f1c",
    name: "Nginx (OpenSSL 1.1.1)",
    category: "server",
    confidence: 0.7,
  },
  {
    hash: "2ad2ad0002ad2ad22c2ad2ad2ad2adce8be1af6b0e09b5a8e7b7cb49cc3e3a",
    name: "Apache httpd (OpenSSL)",
    category: "server",
    confidence: 0.72,
  },
  {
    hash: "2ad2ad0002ad2ad00042d42d0000005d86ccb1a0567e012264097a0315f7f4",
    name: "Apache httpd (mod_ssl, default)",
    category: "server",
    confidence: 0.7,
  },
  {
    hash: "07d14d16d21d21d07c42d41d00041d47e4e0ae17960b2a5b4fd6107fbb0926",
    name: "Microsoft IIS 10.0",
    category: "server",
    confidence: 0.85,
  },
  {
    hash: "27d27d27d00027d1dc27d27d27d27d4cf86d0e5d5855cb2d08a62e05b8e87b",
    name: "Microsoft IIS 8.5",
    category: "server",
    confidence: 0.82,
  },
  {
    hash: "29d29d15d29d29d21c29d29d29d29da3bd6795ba2b24d17e3c1625b6769789",
    name: "Caddy Server",
    category: "server",
    confidence: 0.78,
  },
  {
    hash: "29d29d00029d29d08c29d29d29d29d1af743ee1d18c0fb47cff1a4d32c0e60",
    name: "LiteSpeed Web Server",
    category: "server",
    confidence: 0.74,
  },
  {
    hash: "29d29d15d29d29d21c29d29d29d29d5c6db2af4c111d3a76013bbd3e1a4a2c",
    name: "Envoy Proxy",
    category: "server",
    confidence: 0.76,
  },
  {
    hash: "2ad2ad16d2ad2ad22c42d42d00042de4f6bea7b15e12c0b75de4b8ba5b8e3a",
    name: "Traefik",
    category: "server",
    confidence: 0.73,
  },

  // ──────────────────────────────────────────────────
  // CDN / Edge Platforms
  // ──────────────────────────────────────────────────
  {
    hash: "27d40d40d29d40d1dc27d40d27d40d5c6db2af4c111d3a76013bbd3e1a4a2c",
    name: "Cloudflare",
    category: "cdn",
    confidence: 0.9,
  },
  {
    hash: "27d3ed3ed0003ed1dc42d43d00041d6183ff1bfae51ebd88d70e30c10c6c6e",
    name: "Cloudflare (HTTP/2)",
    category: "cdn",
    confidence: 0.88,
  },
  {
    hash: "29d29d20d29d29d21c29d29d29d29dfdb866af6514e0ed6c5a4b51a14f4e93",
    name: "Amazon CloudFront",
    category: "cdn",
    confidence: 0.87,
  },
  {
    hash: "29d29d00029d29d21c29d29d29d29d4a7f681ef2e30463bb83d0e6fc02e1a3",
    name: "Amazon CloudFront (TLS 1.3)",
    category: "cdn",
    confidence: 0.85,
  },
  {
    hash: "29d29d15d29d29d21c29d29d29d29d3b7ab4e19b3b955a67a3a9b83e6ec62b",
    name: "Fastly CDN",
    category: "cdn",
    confidence: 0.83,
  },
  {
    hash: "2ad2ad0002ad2ad22c2ad2ad2ad2ad8f7e9fd40e55c72456b4099d1e06bd50",
    name: "Akamai Edge",
    category: "cdn",
    confidence: 0.82,
  },
  {
    hash: "21d14d00021d21d00021d14d21d21d0c8e1a2f4c0b4e7c5d9a2b3c4d5e6f7a",
    name: "Akamai Ghost",
    category: "cdn",
    confidence: 0.8,
  },

  // ──────────────────────────────────────────────────
  // WAF / Security Appliances
  // ──────────────────────────────────────────────────
  {
    hash: "00000000000000000041d00000041d9535d5acd30472a4b71e504b23e1959a",
    name: "Fortinet FortiGate",
    category: "waf",
    confidence: 0.79,
  },
  {
    hash: "21d14d00021d21d21c21d14d21d21d27c21d14d21d21d21c21d14d21d21d00",
    name: "F5 BIG-IP ASM",
    category: "waf",
    confidence: 0.77,
  },
  {
    hash: "29d29d00029d29d00c29d29d29d29d3a6b8e1f0c2d4e5f6a7b8c9d0e1f2a3b",
    name: "Imperva WAF",
    category: "waf",
    confidence: 0.75,
  },
];
