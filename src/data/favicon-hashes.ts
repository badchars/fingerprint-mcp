/**
 * Favicon MurmurHash3 database for application fingerprinting.
 *
 * Shodan computes a signed 32-bit MurmurHash3 of the raw favicon bytes (after
 * base64-encoding and joining lines with \n). The resulting hash is deterministic
 * for a given favicon file. Many applications ship a default favicon that never
 * changes across installations, making the hash a reliable fingerprint.
 *
 * Usage in Shodan: http.favicon.hash:<hash>
 *
 * References:
 *  - https://www.shodan.io/search/facet?query=http.favicon.hash
 *  - https://github.com/Viralmaniar/Favicon-Hash-For-Shodan
 */

/** A known favicon hash entry. */
export interface FaviconHash {
  /** Signed 32-bit MurmurHash3 of the favicon */
  hash: number;
  /** Human-readable application name */
  name: string;
  /** Classification category */
  category:
    | "ci-cd"
    | "monitoring"
    | "firewall"
    | "network"
    | "cms"
    | "database"
    | "security"
    | "storage"
    | "management"
    | "other";
}

export const FAVICON_HASHES: FaviconHash[] = [
  // ──────────────────────────────────────────────────
  // CI/CD & DevOps
  // ──────────────────────────────────────────────────
  {
    hash: -586023785,
    name: "Jenkins",
    category: "ci-cd",
  },
  {
    hash: 81586312,
    name: "Jenkins (blue ocean)",
    category: "ci-cd",
  },
  {
    hash: -1293290337,
    name: "GitLab CE/EE",
    category: "ci-cd",
  },
  {
    hash: -1231872293,
    name: "Argo CD",
    category: "ci-cd",
  },
  {
    hash: 1485257654,
    name: "Sonatype Nexus Repository",
    category: "ci-cd",
  },
  {
    hash: -473653720,
    name: "JFrog Artifactory",
    category: "ci-cd",
  },
  {
    hash: 1917443752,
    name: "SonarQube",
    category: "ci-cd",
  },
  {
    hash: 595148549,
    name: "Harbor Registry",
    category: "ci-cd",
  },

  // ──────────────────────────────────────────────────
  // Monitoring & Observability
  // ──────────────────────────────────────────────────
  {
    hash: -1399433489,
    name: "Grafana",
    category: "monitoring",
  },
  {
    hash: -1811827550,
    name: "Kibana",
    category: "monitoring",
  },
  {
    hash: 1571196100,
    name: "Prometheus",
    category: "monitoring",
  },
  {
    hash: -580765191,
    name: "Graylog",
    category: "monitoring",
  },
  {
    hash: 999357577,
    name: "Zabbix",
    category: "monitoring",
  },
  {
    hash: -412708573,
    name: "Nagios",
    category: "monitoring",
  },
  {
    hash: -54810069,
    name: "Cacti",
    category: "monitoring",
  },

  // ──────────────────────────────────────────────────
  // Firewalls & Network Security
  // ──────────────────────────────────────────────────
  {
    hash: 945408572,
    name: "FortiGate (Fortinet)",
    category: "firewall",
  },
  {
    hash: -305179312,
    name: "pfSense",
    category: "firewall",
  },
  {
    hash: 1485478972,
    name: "OPNsense",
    category: "firewall",
  },
  {
    hash: 362091310,
    name: "Citrix NetScaler / ADC",
    category: "firewall",
  },

  // ──────────────────────────────────────────────────
  // Network Equipment & Infrastructure
  // ──────────────────────────────────────────────────
  {
    hash: -1011037059,
    name: "Ubiquiti UniFi Controller",
    category: "network",
  },
  {
    hash: 1898498554,
    name: "MikroTik RouterOS",
    category: "network",
  },
  {
    hash: -831237885,
    name: "Traefik Dashboard",
    category: "network",
  },

  // ──────────────────────────────────────────────────
  // CMS & Web Applications
  // ──────────────────────────────────────────────────
  {
    hash: -335242539,
    name: "phpMyAdmin",
    category: "cms",
  },
  {
    hash: 116323821,
    name: "Spring Boot (default Leaf favicon)",
    category: "cms",
  },
  {
    hash: 1117779739,
    name: "Apache Tomcat (default)",
    category: "cms",
  },
  {
    hash: -428315662,
    name: "Webmin",
    category: "cms",
  },
  {
    hash: -160464759,
    name: "cPanel",
    category: "cms",
  },
  {
    hash: -2044357687,
    name: "Plesk",
    category: "cms",
  },
  {
    hash: -244487534,
    name: "RabbitMQ Management",
    category: "cms",
  },

  // ──────────────────────────────────────────────────
  // Database & Search
  // ──────────────────────────────────────────────────
  {
    hash: -536764016,
    name: "Elasticsearch",
    category: "database",
  },
  {
    hash: -656811182,
    name: "CouchDB Fauxton",
    category: "database",
  },

  // ──────────────────────────────────────────────────
  // Security & IAM
  // ──────────────────────────────────────────────────
  {
    hash: -1073546895,
    name: "HashiCorp Vault",
    category: "security",
  },
  {
    hash: 113734322,
    name: "HashiCorp Consul",
    category: "security",
  },
  {
    hash: -1166125415,
    name: "Keycloak",
    category: "security",
  },

  // ──────────────────────────────────────────────────
  // Storage & NAS
  // ──────────────────────────────────────────────────
  {
    hash: -822940097,
    name: "MinIO",
    category: "storage",
  },
  {
    hash: -1535817075,
    name: "Synology DSM",
    category: "storage",
  },
  {
    hash: 1262005765,
    name: "QNAP QTS",
    category: "storage",
  },

  // ──────────────────────────────────────────────────
  // Management & Orchestration
  // ──────────────────────────────────────────────────
  {
    hash: -1889921692,
    name: "Atlassian Jira",
    category: "management",
  },
  {
    hash: -305317842,
    name: "Atlassian Confluence",
    category: "management",
  },
  {
    hash: -1950415971,
    name: "Kubernetes Dashboard",
    category: "management",
  },
  {
    hash: 671932091,
    name: "Portainer",
    category: "management",
  },
];
