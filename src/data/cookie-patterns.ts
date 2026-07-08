/**
 * HTTP cookie patterns for technology and infrastructure identification.
 *
 * Web servers, frameworks, load balancers, CDNs, and WAFs set distinctive cookies
 * that reveal the underlying technology stack. Some infrastructure cookies (F5 BIG-IP,
 * Citrix NetScaler) encode backend server addresses that can be decoded to discover
 * internal network topology.
 *
 * References:
 *  - https://github.com/AliasIO/wappalyzer
 *  - https://support.f5.com/csp/article/K6917 (BIG-IP cookie persistence)
 *  - https://support.citrix.com/article/CTX206793 (NetScaler persistence)
 */

/** A known cookie pattern entry. */
export interface CookiePattern {
  /** Regex string or literal prefix to match the cookie name */
  pattern: string;
  /** Human-readable name for the detected technology */
  name: string;
  /** Classification category */
  category: "session" | "infrastructure" | "security" | "analytics";
  /** Specific technology or product identified */
  technology: string;
  /** Human-readable description of how to decode the cookie value (if applicable) */
  decode?: string;
}

export const COOKIE_PATTERNS: CookiePattern[] = [
  // ──────────────────────────────────────────────────
  // Session / Framework Identification
  // ──────────────────────────────────────────────────
  {
    pattern: "^PHPSESSID$",
    name: "PHP Session",
    category: "session",
    technology: "PHP",
  },
  {
    pattern: "^JSESSIONID$",
    name: "Java Servlet Session",
    category: "session",
    technology: "Java (Servlet/JSP)",
  },
  {
    pattern: "^ASP\\.NET_SessionId$",
    name: "ASP.NET Session",
    category: "session",
    technology: "ASP.NET",
  },
  {
    pattern: "^connect\\.sid$",
    name: "Express.js Session",
    category: "session",
    technology: "Express.js (Node.js)",
  },
  {
    pattern: "^laravel_session$",
    name: "Laravel Session",
    category: "session",
    technology: "Laravel (PHP)",
  },
  {
    pattern: "^rack\\.session$",
    name: "Rack Session (Ruby)",
    category: "session",
    technology: "Ruby on Rails / Sinatra",
  },
  {
    pattern: "^_session_id$",
    name: "Rails Session",
    category: "session",
    technology: "Ruby on Rails",
  },
  {
    pattern: "^wordpress_test_cookie$",
    name: "WordPress Test Cookie",
    category: "session",
    technology: "WordPress",
  },
  {
    pattern: "^wordpress_logged_in_",
    name: "WordPress Auth Cookie",
    category: "session",
    technology: "WordPress",
  },
  {
    pattern: "^wp-settings-",
    name: "WordPress Settings Cookie",
    category: "session",
    technology: "WordPress",
  },
  {
    pattern: "^SESS[0-9a-f]{32}$",
    name: "Drupal Session",
    category: "session",
    technology: "Drupal",
  },
  {
    pattern: "^SSESS[0-9a-f]{32}$",
    name: "Drupal Secure Session",
    category: "session",
    technology: "Drupal (HTTPS)",
  },
  {
    pattern: "^ci_session$",
    name: "CodeIgniter Session",
    category: "session",
    technology: "CodeIgniter (PHP)",
  },
  {
    pattern: "^csrftoken$",
    name: "Django CSRF Token",
    category: "session",
    technology: "Django (Python)",
  },
  {
    pattern: "^sessionid$",
    name: "Django Session",
    category: "session",
    technology: "Django (Python)",
  },
  {
    pattern: "^_gorilla_csrf$",
    name: "Gorilla CSRF Token",
    category: "session",
    technology: "Go (Gorilla toolkit)",
  },

  // ──────────────────────────────────────────────────
  // Infrastructure / Load Balancer
  // ──────────────────────────────────────────────────
  {
    pattern: "^BIGipServer",
    name: "F5 BIG-IP Persistence Cookie",
    category: "infrastructure",
    technology: "F5 BIG-IP",
    decode:
      "Decimal cookie value encodes backend IP:port. Split value by '.': " +
      "first part is encoded IP (convert to hex, reverse byte pairs, convert each pair to decimal octets), " +
      "second part is encoded port (convert to hex, reverse byte pair, convert to decimal). " +
      "Example: 1677787402.36895.0000 -> IP 10.1.1.100, port 8080.",
  },
  {
    pattern: "^NSC_",
    name: "Citrix NetScaler Persistence Cookie",
    category: "infrastructure",
    technology: "Citrix NetScaler / ADC",
    decode:
      "Cookie name suffix after 'NSC_' is the vserver name with character substitution " +
      "(a-z mapped by XOR/Caesar). Cookie value is hex-encoded: first 8 hex chars = " +
      "XOR-decoded VIP address, next 4 hex chars = XOR-decoded port. XOR key is 0x03.",
  },
  {
    pattern: "^ROUTEID$",
    name: "HAProxy Route Persistence",
    category: "infrastructure",
    technology: "HAProxy",
    decode:
      "Value is the backend server identifier from HAProxy configuration (server directive name). " +
      "Reveals internal node naming conventions.",
  },
  {
    pattern: "^SERVERID$",
    name: "HAProxy Server ID",
    category: "infrastructure",
    technology: "HAProxy",
    decode: "Value is the backend server name or address assigned in HAProxy config.",
  },
  {
    pattern: "^AWSALB$",
    name: "AWS Application Load Balancer",
    category: "infrastructure",
    technology: "AWS ALB",
    decode:
      "Base64-encoded value contains ALB identifier and target group routing info. " +
      "Decoding reveals the ALB internal name and availability zone.",
  },
  {
    pattern: "^AWSALBCORS$",
    name: "AWS ALB CORS Cookie",
    category: "infrastructure",
    technology: "AWS ALB",
  },
  {
    pattern: "^GCLB$",
    name: "Google Cloud Load Balancer",
    category: "infrastructure",
    technology: "Google Cloud Platform",
    decode: "Base64-encoded value identifies the backend service instance.",
  },

  // ──────────────────────────────────────────────────
  // Security / CDN / WAF
  // ──────────────────────────────────────────────────
  {
    pattern: "^__cfduid$",
    name: "Cloudflare Device ID (deprecated)",
    category: "security",
    technology: "Cloudflare",
  },
  {
    pattern: "^__cf_bm$",
    name: "Cloudflare Bot Management",
    category: "security",
    technology: "Cloudflare",
  },
  {
    pattern: "^_cfuvid$",
    name: "Cloudflare Unique Visitor ID",
    category: "security",
    technology: "Cloudflare",
  },
  {
    pattern: "^cf_clearance$",
    name: "Cloudflare Challenge Clearance",
    category: "security",
    technology: "Cloudflare",
  },
  {
    pattern: "^incap_ses_",
    name: "Imperva Incapsula Session",
    category: "security",
    technology: "Imperva / Incapsula WAF",
    decode:
      "Cookie name suffix contains session and site identifiers. Value is an encrypted session token.",
  },
  {
    pattern: "^visid_incap_",
    name: "Imperva Incapsula Visitor ID",
    category: "security",
    technology: "Imperva / Incapsula WAF",
  },
  {
    pattern: "^__hssc$",
    name: "HubSpot Session Cookie",
    category: "analytics",
    technology: "HubSpot",
  },
  {
    pattern: "^__hstc$",
    name: "HubSpot Tracking Cookie",
    category: "analytics",
    technology: "HubSpot",
  },
];
