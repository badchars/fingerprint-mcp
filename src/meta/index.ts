import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";

// ─── Provider Catalog ───

interface ProviderEntry {
  name: string;
  description: string;
  prefix: string;
  toolCount: number;
  tools: { name: string; description: string }[];
  requiresApiKey: boolean;
  makesNetworkCalls: boolean;
  category: "active" | "passive" | "osint" | "enum" | "analysis" | "meta";
}

const PROVIDER_CATALOG: ProviderEntry[] = [
  {
    name: "tcp",
    description: "TCP connection fingerprinting: port probing, SYN-ACK latency measurement, and banner grabbing with protocol auto-detection.",
    prefix: "tcp_",
    toolCount: 2,
    tools: [
      { name: "tcp_probe", description: "Connect to target port(s), measure latency, detect load balancing" },
      { name: "tcp_banner", description: "Banner grab on arbitrary TCP port with protocol auto-detection" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "tls",
    description: "TLS/SSL fingerprinting: JARM hashing, JA4X extraction, certificate analysis, cipher enumeration, CT log queries, and SNI probing.",
    prefix: "tls_",
    toolCount: 8,
    tools: [
      { name: "tls_probe", description: "Full TLS handshake analysis with version and cipher details" },
      { name: "tls_jarm", description: "JARM fingerprint generation for TLS server identification" },
      { name: "tls_cert", description: "Certificate chain extraction and analysis" },
      { name: "tls_ja4x", description: "JA4X fingerprint extraction from TLS handshake" },
      { name: "tls_cert_cross_ref", description: "Cross-reference certificate across CT logs and search engines" },
      { name: "tls_ct_subdomains", description: "Subdomain discovery via Certificate Transparency logs" },
      { name: "tls_ciphers", description: "Enumerate supported cipher suites and detect weak configurations" },
      { name: "tls_sni", description: "SNI-based virtual host detection" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "ssh",
    description: "SSH fingerprinting: banner extraction, host key lookup, HASSH computation, and algorithm audit.",
    prefix: "ssh_",
    toolCount: 3,
    tools: [
      { name: "ssh_probe", description: "SSH banner grab, HASSH fingerprint, and algorithm enumeration" },
      { name: "ssh_hostkey_lookup", description: "Look up SSH host key fingerprint in known databases" },
      { name: "ssh_audit", description: "Audit SSH configuration for security issues" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "http",
    description: "HTTP fingerprinting: headers, favicon hash, ETag analysis, error pages, cookies, methods, CORS, compression, caching, security headers, timing, and more.",
    prefix: "http",
    toolCount: 17,
    tools: [
      { name: "httpHeaders", description: "Fetch and analyze HTTP response headers" },
      { name: "httpMultiFingerprint", description: "Multi-signal HTTP fingerprinting in a single request" },
      { name: "httpFavicon", description: "Fetch favicon and compute MurmurHash3 for Shodan lookups" },
      { name: "httpEtag", description: "ETag header analysis for backend identification" },
      { name: "httpErrors", description: "Trigger error pages to identify backend frameworks" },
      { name: "httpCookies", description: "Analyze cookies for technology and session management detection" },
      { name: "httpMethods", description: "Enumerate allowed HTTP methods" },
      { name: "httpCors", description: "Test CORS configuration and detect misconfigurations" },
      { name: "httpCompression", description: "Detect supported compression algorithms" },
      { name: "httpCache", description: "Analyze caching headers and CDN behavior" },
      { name: "httpSecurity", description: "Evaluate security headers (CSP, HSTS, X-Frame-Options, etc.)" },
      { name: "httpTiming", description: "Measure HTTP response timing for server profiling" },
      { name: "httpServerTiming", description: "Parse Server-Timing header for backend performance data" },
      { name: "httpResourceHints", description: "Extract preload/prefetch/preconnect resource hints" },
      { name: "httpKeepalive", description: "Test HTTP keep-alive behavior and connection reuse" },
      { name: "httpNel", description: "Parse Network Error Logging (NEL) configuration" },
      { name: "httpRedirect", description: "Follow and analyze HTTP redirect chains" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "web",
    description: "Web technology fingerprinting: tech stack detection, source map analysis, WebSocket probing, API discovery, GraphQL introspection, vhost enumeration, analytics IDs, and SRI checks.",
    prefix: "web_",
    toolCount: 9,
    tools: [
      { name: "web_tech", description: "Detect web technologies from HTML, headers, and scripts" },
      { name: "web_sourcemaps", description: "Find and analyze JavaScript source maps" },
      { name: "web_websocket", description: "Detect and probe WebSocket endpoints" },
      { name: "web_api_discovery", description: "Discover API endpoints from HTML, JS, and common paths" },
      { name: "web_graphql", description: "Detect GraphQL endpoints and attempt introspection" },
      { name: "web_vhost", description: "Virtual host enumeration via Host header manipulation" },
      { name: "web_sourcemap_paths", description: "Extract file paths from source maps for recon" },
      { name: "web_analytics", description: "Extract analytics and tracking IDs (GA, GTM, FB Pixel)" },
      { name: "web_sri", description: "Check Subresource Integrity (SRI) on external resources" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "path",
    description: "Path-based reconnaissance: sensitive file discovery, robots.txt parsing, Git leak detection, debug endpoint probing, and API version enumeration.",
    prefix: "path_",
    toolCount: 5,
    tools: [
      { name: "path_sensitive", description: "Probe for sensitive files and directories" },
      { name: "path_robots", description: "Parse robots.txt for hidden paths and disallowed routes" },
      { name: "path_git_leak", description: "Detect exposed .git directories and extract metadata" },
      { name: "path_debug", description: "Probe for debug endpoints (phpinfo, server-status, etc.)" },
      { name: "path_api_version", description: "Enumerate API versions from URL patterns" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "dns",
    description: "DNS fingerprinting: email security records (SPF/DKIM/DMARC), SaaS detection, subdomain takeover checks, DNS server fingerprinting, reverse DNS, and MTA-STS.",
    prefix: "dns_",
    toolCount: 7,
    tools: [
      { name: "dns_email", description: "Analyze SPF, DKIM, and DMARC records for email security posture" },
      { name: "dns_saas", description: "Detect SaaS services from CNAME and TXT records" },
      { name: "dns_takeover", description: "Check for dangling CNAMEs vulnerable to subdomain takeover" },
      { name: "dns_server_fp", description: "Fingerprint DNS server software and version" },
      { name: "dns_records", description: "Comprehensive DNS record enumeration (A, AAAA, MX, NS, TXT, etc.)" },
      { name: "dns_reverse", description: "Reverse DNS lookup for IP addresses" },
      { name: "dns_mta_sts", description: "Check MTA-STS policy for email transport security" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "waf",
    description: "WAF and CDN detection: WAF vendor identification, CDN detection, origin IP discovery behind CDN/WAF, and WAF rule fingerprinting.",
    prefix: "waf_",
    toolCount: 4,
    tools: [
      { name: "waf_detect", description: "Detect WAF vendor from response headers and behavior" },
      { name: "waf_cdn_detect", description: "Identify CDN provider from headers, IPs, and DNS" },
      { name: "waf_origin", description: "Attempt to discover origin IP behind CDN/WAF" },
      { name: "waf_fingerprint", description: "Fingerprint WAF rules and evasion characteristics" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "timing",
    description: "Timing-based fingerprinting: baseline latency measurement and timing-based authentication detection.",
    prefix: "timing_",
    toolCount: 2,
    tools: [
      { name: "timing_baseline", description: "Measure baseline response timing across multiple requests" },
      { name: "timing_auth", description: "Detect authentication mechanisms via timing differences" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "h2",
    description: "HTTP/2 fingerprinting: server fingerprinting via HTTP/2 settings, HTTP/2 support detection, and GOAWAY frame analysis.",
    prefix: "h2_",
    toolCount: 3,
    tools: [
      { name: "h2_server_fp", description: "Fingerprint server via HTTP/2 SETTINGS and WINDOW_UPDATE frames" },
      { name: "h2_detect", description: "Detect HTTP/2 and HTTP/3 support via ALPN" },
      { name: "h2_goaway", description: "Analyze HTTP/2 GOAWAY frames for server behavior profiling" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "smtp",
    description: "SMTP fingerprinting: mail server banner grab and STARTTLS analysis.",
    prefix: "smtp_",
    toolCount: 2,
    tools: [
      { name: "smtp_probe", description: "SMTP banner grab with EHLO capability enumeration" },
      { name: "smtp_tls", description: "Test STARTTLS support and certificate on mail servers" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "iot",
    description: "IoT device fingerprinting: common IoT protocol probing and MAC address OUI vendor lookup.",
    prefix: "iot_",
    toolCount: 2,
    tools: [
      { name: "iot_probe", description: "Probe common IoT protocols (UPnP, mDNS, MQTT, CoAP)" },
      { name: "iot_mac_lookup", description: "MAC address OUI vendor lookup" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "app",
    description: "Application-layer fingerprinting: CMS detection, e-commerce platform identification, and web framework detection.",
    prefix: "app_",
    toolCount: 3,
    tools: [
      { name: "app_cms", description: "Detect CMS (WordPress, Drupal, Joomla, etc.) with version" },
      { name: "app_ecommerce", description: "Identify e-commerce platforms (Shopify, Magento, WooCommerce)" },
      { name: "app_framework", description: "Detect web frameworks (Laravel, Django, Rails, Spring, etc.)" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "service",
    description: "Service-specific probes: MySQL, PostgreSQL, Redis, FTP, and VNC/RDP detection and banner analysis.",
    prefix: "svc_",
    toolCount: 5,
    tools: [
      { name: "svc_mysql_probe", description: "MySQL server greeting analysis and version detection" },
      { name: "svc_postgres_probe", description: "PostgreSQL server version and authentication detection" },
      { name: "svc_redis_probe", description: "Redis server info extraction and configuration analysis" },
      { name: "svc_ftp_probe", description: "FTP banner grab and feature enumeration" },
      { name: "svc_vnc_rdp_detect", description: "Detect VNC and RDP services with version info" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "correlation",
    description: "Cross-layer correlation and analysis: consistency validation, honeypot detection, spoofing detection, profile comparison, and infrastructure topology mapping.",
    prefix: "fp_",
    toolCount: 5,
    tools: [
      { name: "fp_correlate", description: "Cross-layer consistency validation across fingerprint signals" },
      { name: "fp_honeypot", description: "Honeypot probability scoring from service scan results" },
      { name: "fp_spoofing", description: "Detect server identity spoofing via cross-signal analysis" },
      { name: "fp_compare", description: "Compare two fingerprint profiles and report differences" },
      { name: "fp_topology", description: "Reconstruct infrastructure topology from collected data" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: false,
    category: "analysis",
  },
  {
    name: "identify",
    description: "Fingerprint identification: hash lookup in signature databases (JARM, favicon, HASSH, header order), C2 framework detection, and signature listing.",
    prefix: "fp_",
    toolCount: 3,
    tools: [
      { name: "fp_identify", description: "Look up any fingerprint hash in known signatures database" },
      { name: "fp_c2_detect", description: "Detect C2 frameworks from JARM, certificate, and timing data" },
      { name: "fp_list_signatures", description: "List all known signatures by category" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: false,
    category: "analysis",
  },
  {
    name: "passive",
    description: "Passive analysis: extract fingerprint data from previously collected headers, HTML, and banners without making any network calls.",
    prefix: "fp_analyze_",
    toolCount: 3,
    tools: [
      { name: "fp_analyze_headers", description: "Extract fingerprint signals from HTTP response headers" },
      { name: "fp_analyze_html", description: "Extract technology signals from HTML source" },
      { name: "fp_analyze_banner", description: "Parse and identify service from a raw banner string" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: false,
    category: "passive",
  },
  {
    name: "osint",
    description: "OSINT integrations: Shodan, Censys, reverse IP, WHOIS, Wayback Machine, and VirusTotal lookups.",
    prefix: "osint_",
    toolCount: 6,
    tools: [
      { name: "osint_shodan", description: "Query Shodan for host intelligence and open ports" },
      { name: "osint_censys", description: "Query Censys for host and certificate data" },
      { name: "osint_reverse_ip", description: "Reverse IP lookup to find co-hosted domains" },
      { name: "osint_whois", description: "WHOIS lookup for domain registration details" },
      { name: "osint_web_archive", description: "Query Wayback Machine for historical snapshots" },
      { name: "osint_virustotal", description: "VirusTotal lookup for domain/IP reputation" },
    ],
    requiresApiKey: true,
    makesNetworkCalls: true,
    category: "osint",
  },
  {
    name: "enum",
    description: "Enumeration: subdomain discovery, ASN neighbor mapping, passive DNS, TLD expansion, related domain finding, wildcard detection, and scope summary.",
    prefix: "enum_",
    toolCount: 7,
    tools: [
      { name: "enum_subdomains", description: "Passive subdomain enumeration from multiple sources" },
      { name: "enum_asn_neighbors", description: "Find neighboring IPs and domains in the same ASN" },
      { name: "enum_passive_dns", description: "Historical passive DNS record lookup" },
      { name: "enum_tld_expansion", description: "Check target domain across multiple TLDs" },
      { name: "enum_related_domains", description: "Find related domains via shared infrastructure" },
      { name: "enum_wildcard_detect", description: "Detect wildcard DNS responses" },
      { name: "enum_scope_summary", description: "Summarize enumeration results into a scoped target list" },
    ],
    requiresApiKey: true,
    makesNetworkCalls: true,
    category: "enum",
  },
  {
    name: "infra",
    description: "Infrastructure detection: cloud provider identification, ASN lookup, CDN identification, reverse proxy detection, and load balancer detection.",
    prefix: "infra_",
    toolCount: 5,
    tools: [
      { name: "infra_cloud_detect", description: "Identify cloud provider (AWS, GCP, Azure, etc.) from IP ranges" },
      { name: "infra_asn_lookup", description: "ASN information lookup for an IP address" },
      { name: "infra_cdn_identify", description: "Identify CDN provider from headers and IP ranges" },
      { name: "infra_reverse_proxy_detect", description: "Detect reverse proxy presence and identify software" },
      { name: "infra_lb_detect", description: "Detect load balancer via response analysis" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: true,
    category: "active",
  },
  {
    name: "meta",
    description: "Meta/utility tools: list all available providers and tools, show server configuration summary.",
    prefix: "fp_",
    toolCount: 2,
    tools: [
      { name: "fp_list_sources", description: "List all providers, tools, and categories" },
      { name: "fp_server_config", description: "Server configuration and runtime summary" },
    ],
    requiresApiKey: false,
    makesNetworkCalls: false,
    category: "meta",
  },
];

// ─── Tool 1: fp_list_sources ───

const fpListSources: ToolDef = {
  name: "fp_list_sources",
  description:
    "List all available providers and their tools with categorization. Helps AI agents discover what " +
    "fingerprinting tools exist, plan analysis workflows, and understand which tools require API keys or " +
    "make network calls. Filter by category: active, passive, osint, enum, analysis, meta, or all.",
  schema: {
    category: z
      .string()
      .optional()
      .describe("Filter by category: 'active', 'passive', 'osint', 'enum', 'analysis', 'meta', or 'all' (default: all)"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const category = (args.category as string | undefined) ?? "all";
    const categoryLower = category.toLowerCase();

    const filtered =
      categoryLower === "all"
        ? PROVIDER_CATALOG
        : PROVIDER_CATALOG.filter((p) => p.category === categoryLower);

    // Build category summary
    const categorySummary: Record<string, { providerCount: number; toolCount: number }> = {};
    for (const provider of PROVIDER_CATALOG) {
      if (!categorySummary[provider.category]) {
        categorySummary[provider.category] = { providerCount: 0, toolCount: 0 };
      }
      categorySummary[provider.category].providerCount++;
      categorySummary[provider.category].toolCount += provider.toolCount;
    }

    const totalToolCount = PROVIDER_CATALOG.reduce((sum, p) => sum + p.toolCount, 0);

    const result = {
      filter: category,
      totalProviders: filtered.length,
      totalTools: filtered.reduce((sum, p) => sum + p.toolCount, 0),
      providers: filtered.map((p) => ({
        name: p.name,
        description: p.description,
        category: p.category,
        toolCount: p.toolCount,
        requiresApiKey: p.requiresApiKey,
        makesNetworkCalls: p.makesNetworkCalls,
        tools: p.tools,
      })),
      categorySummary,
      allToolCount: totalToolCount,
    };

    return json(result);
  },
};

// ─── Tool 2: fp_server_config ───

const fpServerConfig: ToolDef = {
  name: "fp_server_config",
  description:
    "Returns server configuration summary: version, available API keys (masked), total tools loaded, " +
    "runtime info (Node.js version, platform, architecture), and provider listing with tool counts.",
  schema: {},
  async execute(_args: Record<string, unknown>, ctx: ToolContext): Promise<ReturnType<typeof json>> {
    const version = "0.1.0";

    // Check configured API keys and mask them
    const apiKeys: Record<string, string> = {};
    const keyMap: Record<string, string> = {
      shodanApiKey: "Shodan",
      censysApiId: "Censys (ID)",
      censysApiSecret: "Censys (Secret)",
      securitytrailsApiKey: "SecurityTrails",
      virustotalApiKey: "VirusTotal",
    };

    for (const [key, label] of Object.entries(keyMap)) {
      const value = ctx.config[key as keyof typeof ctx.config] as string | undefined;
      if (value && value.length > 0) {
        const masked = value.slice(0, 4) + "****";
        apiKeys[label] = masked;
      } else {
        apiKeys[label] = "(not configured)";
      }
    }

    // Count total tools from catalog
    const totalTools = PROVIDER_CATALOG.reduce((sum, p) => sum + p.toolCount, 0);

    // Provider summary
    const providers = PROVIDER_CATALOG.map((p) => ({
      name: p.name,
      toolCount: p.toolCount,
      category: p.category,
    }));

    const result = {
      server: "fingerprint-mcp",
      version,
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      totalTools,
      totalProviders: PROVIDER_CATALOG.length,
      apiKeys,
      providers,
    };

    return json(result);
  },
};

// ─── Export All Meta Tools ───

export const metaTools: ToolDef[] = [
  fpListSources,
  fpServerConfig,
];
