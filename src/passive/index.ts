import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";
import { CLOUD_PATTERNS } from "../data/cloud-ranges.js";
import { HEADER_ORDER_SIGNATURES, computeHeaderOrderHash } from "../data/header-order.js";
import { WAF_SIGNATURES } from "../data/waf-signatures.js";
import { COOKIE_PATTERNS } from "../data/cookie-patterns.js";
import { TECH_PATTERNS } from "../data/tech-patterns.js";
import { ANALYTICS_PATTERNS } from "../data/analytics-patterns.js";
import { SERVICE_BANNERS } from "../data/service-banners.js";
import * as cheerio from "cheerio";

// ─── Helpers ───

/** Safely test a regex pattern against a string, returning false on invalid regex. */
function safeRegexTest(pattern: string, value: string): boolean {
  try {
    return new RegExp(pattern, "i").test(value);
  } catch {
    return false;
  }
}

/** Safely extract first capture group using a regex pattern. */
function safeRegexExtract(pattern: string, value: string): string | null {
  try {
    const match = new RegExp(pattern, "i").exec(value);
    return match?.[1] ?? match?.[2] ?? null;
  } catch {
    return null;
  }
}

/**
 * Decode an F5 BIG-IP persistence cookie value to extract internal IP:port.
 *
 * The decimal cookie value encodes backend IP and port:
 * - Split by '.': first part is encoded IP, second is encoded port
 * - IP: convert decimal to hex, reverse byte pairs, convert each pair to decimal octets
 * - Port: convert decimal to hex, reverse byte pair, convert to decimal
 */
function decodeBigIpCookie(cookieValue: string): { ip: string; port: number } | null {
  try {
    const parts = cookieValue.split(".");
    if (parts.length < 2) return null;

    const encodedIp = parseInt(parts[0], 10);
    const encodedPort = parseInt(parts[1], 10);

    if (isNaN(encodedIp) || isNaN(encodedPort)) return null;

    // Decode IP: convert to hex, reverse byte pairs
    const ipHex = encodedIp.toString(16).padStart(8, "0");
    const ip = [
      parseInt(ipHex.substring(6, 8), 16),
      parseInt(ipHex.substring(4, 6), 16),
      parseInt(ipHex.substring(2, 4), 16),
      parseInt(ipHex.substring(0, 2), 16),
    ].join(".");

    // Decode port: convert to hex, reverse byte pair
    const portHex = encodedPort.toString(16).padStart(4, "0");
    const port = parseInt(portHex.substring(2, 4) + portHex.substring(0, 2), 16);

    return { ip, port };
  } catch {
    return null;
  }
}

// ─── Security Header Constants ───

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-xss-protection",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
] as const;

// ─── Port-to-Protocol Map ───

const PORT_PROTOCOL_MAP: Record<number, string> = {
  21: "ftp",
  22: "ssh",
  25: "smtp",
  80: "http",
  110: "pop3",
  143: "imap",
  443: "http",
  465: "smtp",
  587: "smtp",
  3306: "mysql",
  5432: "postgresql",
  6379: "redis",
  8080: "http",
  8443: "http",
  11211: "memcached",
  27017: "mongodb",
};

// ─── Tool 1: fp_analyze_headers ───

async function analyzeHeaders(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const headers = args.headers as Record<string, string>;
  const url = args.url as string | undefined;

  // Normalize header keys to lowercase for consistent matching
  const normalizedHeaders: Record<string, string> = {};
  const originalHeaderOrder: string[] = [];
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value;
    originalHeaderOrder.push(key);
  }

  // 1. Server identification
  const claimedServer = normalizedHeaders["server"] ?? null;

  // Compute header order hash and match against known signatures
  const headerOrderHash = computeHeaderOrderHash(originalHeaderOrder);
  let headerOrderServer: string | null = null;
  for (const sig of HEADER_ORDER_SIGNATURES) {
    if (sig.hash === headerOrderHash) {
      headerOrderServer = sig.server;
      break;
    }
  }

  const server = {
    claimed: claimedServer,
    headerOrderMatch: headerOrderServer,
    headerOrderHash,
    headerOrderMismatch:
      claimedServer && headerOrderServer
        ? !claimedServer.toLowerCase().includes(headerOrderServer.toLowerCase()) &&
          !headerOrderServer.toLowerCase().includes(claimedServer.toLowerCase())
        : false,
  };

  // 2. CDN/Cloud detection
  const cloudDetections: {
    provider: string;
    matchedHeaders: { header: string; pattern: string }[];
  }[] = [];

  for (const cloud of CLOUD_PATTERNS) {
    const matchedHeaders: { header: string; pattern: string }[] = [];
    for (const [headerName, pattern] of Object.entries(cloud.headerPatterns)) {
      const headerValue = normalizedHeaders[headerName.toLowerCase()];
      if (headerValue !== undefined && safeRegexTest(pattern, headerValue)) {
        matchedHeaders.push({ header: headerName, pattern });
      }
    }
    if (matchedHeaders.length > 0) {
      cloudDetections.push({
        provider: cloud.provider,
        matchedHeaders,
      });
    }
  }

  // 3. WAF detection
  const wafDetections: {
    name: string;
    vendor: string;
    confidence: number;
    matchedHeaders: string[];
    matchedCookies: string[];
  }[] = [];

  // Extract cookie names from set-cookie headers
  const setCookieValue = normalizedHeaders["set-cookie"] ?? "";
  const cookieHeader = normalizedHeaders["cookie"] ?? "";
  const allCookieText = setCookieValue + " " + cookieHeader;
  // Extract cookie names from Set-Cookie (name=value; ...) patterns
  const cookieNames: string[] = [];
  const cookieNameMatches = allCookieText.match(/(?:^|[,;]\s*)([^=\s]+)=/g);
  if (cookieNameMatches) {
    for (const match of cookieNameMatches) {
      const name = match.replace(/^[,;]\s*/, "").replace(/=$/, "");
      if (name) cookieNames.push(name);
    }
  }

  for (const waf of WAF_SIGNATURES) {
    const matchedHeaders: string[] = [];
    const matchedCookies: string[] = [];

    // Check header patterns
    if (waf.patterns.headers) {
      for (const [headerName, pattern] of Object.entries(waf.patterns.headers)) {
        const headerValue = normalizedHeaders[headerName.toLowerCase()];
        if (headerValue !== undefined && safeRegexTest(pattern, headerValue)) {
          matchedHeaders.push(headerName);
        }
      }
    }

    // Check cookie patterns
    if (waf.patterns.cookies) {
      for (const cookiePattern of waf.patterns.cookies) {
        for (const cookieName of cookieNames) {
          if (safeRegexTest(cookiePattern, cookieName)) {
            matchedCookies.push(cookieName);
          }
        }
      }
    }

    if (matchedHeaders.length > 0 || matchedCookies.length > 0) {
      wafDetections.push({
        name: waf.name,
        vendor: waf.vendor,
        confidence: waf.confidence,
        matchedHeaders,
        matchedCookies,
      });
    }
  }

  // 4. Security header audit
  const securityHeaderResults: {
    header: string;
    present: boolean;
    value: string | null;
    assessment: string;
  }[] = [];

  let securityHeaderCount = 0;
  let securityScore = 0;

  for (const header of SECURITY_HEADERS) {
    const value = normalizedHeaders[header] ?? null;
    const present = value !== null;
    let assessment = "Missing";

    if (present) {
      securityHeaderCount++;
      securityScore += 10;
      assessment = "Present";

      // Additional quality checks
      if (header === "strict-transport-security") {
        const maxAgeMatch = value.match(/max-age=(\d+)/i);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
        if (maxAge >= 31536000) {
          assessment = "Strong (max-age >= 1 year)";
        } else if (maxAge >= 2592000) {
          assessment = "Moderate (max-age >= 30 days)";
        } else {
          assessment = "Weak (max-age < 30 days)";
          securityScore -= 3;
        }
        if (/includesubdomains/i.test(value)) assessment += ", includeSubDomains";
        if (/preload/i.test(value)) assessment += ", preload";
      } else if (header === "x-content-type-options") {
        assessment = value.toLowerCase() === "nosniff" ? "Correct (nosniff)" : `Unexpected value: ${value}`;
      } else if (header === "x-frame-options") {
        if (/^deny$/i.test(value)) {
          assessment = "Strong (DENY)";
        } else if (/^sameorigin$/i.test(value)) {
          assessment = "Good (SAMEORIGIN)";
        } else {
          assessment = `Custom: ${value}`;
        }
      } else if (header === "referrer-policy") {
        if (/no-referrer$/i.test(value) || /strict-origin-when-cross-origin/i.test(value)) {
          assessment = `Good (${value})`;
        } else {
          assessment = `Present (${value})`;
        }
      }
    }

    securityHeaderResults.push({ header, present, value, assessment });
  }

  // Grade calculation: A-F based on count (10 headers total, 10 points each = 100 max)
  const securityGrade =
    securityScore >= 90
      ? "A"
      : securityScore >= 70
        ? "B"
        : securityScore >= 50
          ? "C"
          : securityScore >= 30
            ? "D"
            : securityScore >= 10
              ? "E"
              : "F";

  const securityHeaders = {
    results: securityHeaderResults,
    present: securityHeaderCount,
    total: SECURITY_HEADERS.length,
    grade: securityGrade,
    score: securityScore,
  };

  // 5. Infrastructure cookie decode
  const cookieFindings: {
    cookieName: string;
    technology: string;
    category: string;
    name: string;
    decoded?: { ip: string; port: number } | null;
    note?: string;
  }[] = [];

  for (const cookieName of cookieNames) {
    for (const pattern of COOKIE_PATTERNS) {
      if (safeRegexTest(pattern.pattern, cookieName)) {
        const finding: (typeof cookieFindings)[number] = {
          cookieName,
          technology: pattern.technology,
          category: pattern.category,
          name: pattern.name,
        };

        // Decode BIGipServer cookies
        if (cookieName.startsWith("BIGipServer")) {
          // Try to extract the cookie value from the raw set-cookie header
          const bigIpMatch = allCookieText.match(
            new RegExp(`${cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;\\s]+)`)
          );
          if (bigIpMatch) {
            finding.decoded = decodeBigIpCookie(bigIpMatch[1]);
          }
          finding.note = "F5 BIG-IP persistence cookie - may reveal internal IP:port";
        } else if (cookieName.startsWith("AWSALB")) {
          finding.note = "AWS Application Load Balancer cookie";
        } else if (cookieName.startsWith("NSC_")) {
          finding.note = "Citrix NetScaler persistence cookie - may encode VIP address";
        }

        cookieFindings.push(finding);
        break; // First match per cookie name
      }
    }
  }

  // 6. Technology detection
  const technologyDetections: {
    header: string;
    value: string;
    technology: string;
  }[] = [];

  const techHeaders: Record<string, string> = {
    "x-powered-by": "Server-side technology",
    "x-aspnet-version": "ASP.NET version",
    "x-generator": "Site generator",
    "x-drupal-cache": "Drupal CMS",
    "x-drupal-dynamic-cache": "Drupal CMS (dynamic cache)",
    "x-varnish": "Varnish cache",
    "x-magento-vary": "Magento e-commerce",
    "x-shopify-stage": "Shopify",
    "x-wix-request-id": "Wix",
    "x-envoy-upstream-service-time": "Envoy proxy",
    "x-litespeed-cache": "LiteSpeed Cache",
    "x-turbo-charged-by": "LiteSpeed (Turbo)",
    "x-pingback": "WordPress (xmlrpc)",
    "x-redirect-by": "WordPress redirect",
    "x-runtime": "Ruby on Rails / Rack",
  };

  for (const [header, tech] of Object.entries(techHeaders)) {
    const value = normalizedHeaders[header];
    if (value !== undefined) {
      technologyDetections.push({ header, value, technology: tech });
    }
  }

  // 7. Cache strategy
  const cacheStrategy: {
    cacheControl: string | null;
    etag: string | null;
    age: string | null;
    xCache: string | null;
    vary: string | null;
    cdnCache: string | null;
    strategy: string;
  } = {
    cacheControl: normalizedHeaders["cache-control"] ?? null,
    etag: normalizedHeaders["etag"] ?? null,
    age: normalizedHeaders["age"] ?? null,
    xCache: normalizedHeaders["x-cache"] ?? null,
    vary: normalizedHeaders["vary"] ?? null,
    cdnCache:
      normalizedHeaders["cf-cache-status"] ??
      normalizedHeaders["x-vercel-cache"] ??
      normalizedHeaders["x-cache-hits"] ??
      null,
    strategy: "unknown",
  };

  // Determine caching strategy
  const cc = cacheStrategy.cacheControl?.toLowerCase() ?? "";
  if (cc.includes("no-store") || cc.includes("no-cache")) {
    cacheStrategy.strategy = "no-cache";
  } else if (cc.includes("public") && cc.includes("max-age")) {
    cacheStrategy.strategy = "aggressive-caching";
  } else if (cc.includes("private")) {
    cacheStrategy.strategy = "private-caching";
  } else if (cc.includes("must-revalidate") || cacheStrategy.etag) {
    cacheStrategy.strategy = "revalidation-based";
  } else if (cacheStrategy.xCache || cacheStrategy.cdnCache) {
    cacheStrategy.strategy = "cdn-managed";
  } else if (cacheStrategy.cacheControl) {
    cacheStrategy.strategy = "custom";
  }

  // Intelligence summary
  const intelligence: string[] = [];
  if (server.headerOrderMismatch) {
    intelligence.push(
      `Server header claims "${server.claimed}" but header ordering matches "${server.headerOrderMatch}" - possible header spoofing`
    );
  }
  if (cloudDetections.length > 0) {
    intelligence.push(
      `Cloud infrastructure detected: ${cloudDetections.map((c) => c.provider).join(", ")}`
    );
  }
  if (wafDetections.length > 0) {
    intelligence.push(
      `WAF detected: ${wafDetections.map((w) => `${w.name} (${w.vendor})`).join(", ")}`
    );
  }
  if (securityGrade === "F" || securityGrade === "E") {
    intelligence.push(
      `Poor security header posture (grade ${securityGrade}) - ${securityHeaderCount}/${SECURITY_HEADERS.length} headers present`
    );
  }
  if (cookieFindings.some((c) => c.decoded)) {
    intelligence.push("Infrastructure cookies leak internal IP addresses");
  }
  if (technologyDetections.length > 0) {
    intelligence.push(
      `Technologies revealed via headers: ${technologyDetections.map((t) => t.value || t.technology).join(", ")}`
    );
  }

  const result = {
    url: url ?? null,
    server,
    cloud: cloudDetections,
    waf: wafDetections,
    securityHeaders,
    cookies: cookieFindings,
    technology: technologyDetections,
    cacheStrategy,
    intelligence,
  };

  return json(result);
}

// ─── Tool 2: fp_analyze_html ───

async function analyzeHtml(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const html = args.html as string;
  const url = args.url as string | undefined;

  const $ = cheerio.load(html);

  // 1. Technology detection
  const technologies: {
    name: string;
    category: string;
    version: string | null;
    cves: { cve: string; description: string }[];
    matchType: string;
  }[] = [];

  // Collect all script src values
  const scriptSrcs: string[] = [];
  $("script[src]").each((_i, el) => {
    const src = $(el).attr("src");
    if (src) scriptSrcs.push(src);
  });

  // Collect all inline script content
  const inlineScripts: string[] = [];
  $("script:not([src])").each((_i, el) => {
    const content = $(el).html();
    if (content) inlineScripts.push(content);
  });
  const inlineScriptText = inlineScripts.join("\n");

  // Collect all meta tags as raw HTML
  const metaTags: string[] = [];
  $("meta").each((_i, el) => {
    const outerHtml = $.html(el);
    if (outerHtml) metaTags.push(outerHtml);
  });

  // Collect all HTML comments
  const htmlComments: string[] = [];
  const commentRegex = /<!--([\s\S]*?)-->/g;
  let commentMatch: RegExpExecArray | null;
  while ((commentMatch = commentRegex.exec(html)) !== null) {
    htmlComments.push(commentMatch[1].trim());
  }

  const htmlBody = $.html();

  for (const tech of TECH_PATTERNS) {
    let detected = false;
    let matchType = "";

    // Check script patterns
    if (tech.detection.script) {
      for (const pattern of tech.detection.script) {
        for (const src of scriptSrcs) {
          if (safeRegexTest(pattern, src)) {
            detected = true;
            matchType = "script-src";
            break;
          }
        }
        if (detected) break;
      }
    }

    // Check DOM patterns
    if (!detected && tech.detection.dom) {
      for (const pattern of tech.detection.dom) {
        if (safeRegexTest(pattern, htmlBody)) {
          detected = true;
          matchType = "dom";
          break;
        }
      }
    }

    // Check meta patterns
    if (!detected && tech.detection.meta) {
      for (const pattern of tech.detection.meta) {
        for (const metaTag of metaTags) {
          if (safeRegexTest(pattern, metaTag)) {
            detected = true;
            matchType = "meta";
            break;
          }
        }
        if (detected) break;
      }
    }

    // Check comment patterns
    if (!detected && tech.detection.comment) {
      for (const pattern of tech.detection.comment) {
        for (const comment of htmlComments) {
          if (safeRegexTest(pattern, comment)) {
            detected = true;
            matchType = "comment";
            break;
          }
        }
        if (detected) break;
      }
    }

    if (detected) {
      // Try to extract version
      let version: string | null = null;
      if (tech.versionExtract) {
        // Search across all available text sources
        version =
          safeRegexExtract(tech.versionExtract, html) ??
          safeRegexExtract(tech.versionExtract, inlineScriptText);
        // Also check script src values for version info
        if (!version) {
          for (const src of scriptSrcs) {
            version = safeRegexExtract(tech.versionExtract, src);
            if (version) break;
          }
        }
      }

      // Check CVEs if version found
      const matchedCves: { cve: string; description: string }[] = [];
      if (version && tech.cves) {
        for (const cveEntry of tech.cves) {
          // Simple version comparison: if the CVE applies to versions below a threshold
          // we include it as potentially applicable (exact semver comparison is complex,
          // so we flag all known CVEs for manual review when a version is detected)
          matchedCves.push({
            cve: cveEntry.cve,
            description: cveEntry.description,
          });
        }
      } else if (!version && tech.cves) {
        // If no version extracted but CVEs exist, flag them as "version unknown"
        for (const cveEntry of tech.cves) {
          matchedCves.push({
            cve: cveEntry.cve,
            description: `${cveEntry.description} (version not determined - manual check needed for ${cveEntry.version})`,
          });
        }
      }

      technologies.push({
        name: tech.name,
        category: tech.category,
        version,
        cves: matchedCves,
        matchType,
      });
    }
  }

  // 2. Analytics detection
  const analytics: {
    name: string;
    category: string;
    trackingId: string | null;
    crossRefValue: boolean;
    matchType: string;
  }[] = [];

  for (const ap of ANALYTICS_PATTERNS) {
    let detected = false;
    let matchType = "";

    // Check script patterns
    if (ap.patterns.script) {
      for (const pattern of ap.patterns.script) {
        for (const src of scriptSrcs) {
          if (safeRegexTest(pattern, src)) {
            detected = true;
            matchType = "script-src";
            break;
          }
        }
        if (detected) break;
      }
    }

    // Check inline patterns
    if (!detected && ap.patterns.inline) {
      for (const pattern of ap.patterns.inline) {
        if (safeRegexTest(pattern, inlineScriptText)) {
          detected = true;
          matchType = "inline-script";
          break;
        }
      }
    }

    if (detected) {
      // Extract tracking ID
      let trackingId: string | null = null;
      if (ap.idExtract) {
        trackingId =
          safeRegexExtract(ap.idExtract, html) ??
          safeRegexExtract(ap.idExtract, inlineScriptText);
        if (!trackingId) {
          for (const src of scriptSrcs) {
            trackingId = safeRegexExtract(ap.idExtract, src);
            if (trackingId) break;
          }
        }
      }

      analytics.push({
        name: ap.name,
        category: ap.category,
        trackingId,
        crossRefValue: ap.crossRefValue,
        matchType,
      });
    }
  }

  // 3. Meta generator
  const generatorMeta = $('meta[name="generator"]').attr("content") ?? null;

  // 4. Framework indicators
  const frameworkIndicators: { framework: string; indicator: string }[] = [];

  if (html.includes("__NEXT_DATA__") || $("script#__NEXT_DATA__").length > 0) {
    frameworkIndicators.push({ framework: "Next.js", indicator: "__NEXT_DATA__" });
  }
  if (html.includes("__NUXT__") || html.includes("$nuxt")) {
    frameworkIndicators.push({ framework: "Nuxt.js", indicator: "__NUXT__" });
  }
  if ($("[ng-version]").length > 0) {
    const ngVersion = $("[ng-version]").attr("ng-version") ?? "unknown";
    frameworkIndicators.push({ framework: "Angular", indicator: `ng-version="${ngVersion}"` });
  }
  if ($("[data-reactroot]").length > 0 || html.includes("data-reactroot")) {
    frameworkIndicators.push({ framework: "React", indicator: "data-reactroot" });
  }
  if (/\bdata-v-[a-f0-9]+/.test(html)) {
    frameworkIndicators.push({ framework: "Vue.js", indicator: "data-v-* scoped attributes" });
  }
  if (/\bclass="svelte-[a-z0-9]+"/i.test(html) || html.includes("svelte-")) {
    frameworkIndicators.push({ framework: "Svelte", indicator: "svelte-* class names" });
  }
  if ($("astro-island").length > 0 || html.includes("astro-island")) {
    frameworkIndicators.push({ framework: "Astro", indicator: "astro-island element" });
  }

  // 5. Source maps
  const sourceMaps: string[] = [];
  $("script[src]").each((_i, el) => {
    const src = $(el).attr("src");
    if (src && src.endsWith(".map")) {
      sourceMaps.push(src);
    }
  });
  $("link[href]").each((_i, el) => {
    const href = $(el).attr("href");
    if (href && href.endsWith(".map")) {
      sourceMaps.push(href);
    }
  });
  // Check inline scripts for sourceMappingURL
  const sourceMappingRegex = /\/\/[#@]\s*sourceMappingURL\s*=\s*(\S+)/g;
  let smMatch: RegExpExecArray | null;
  while ((smMatch = sourceMappingRegex.exec(html)) !== null) {
    sourceMaps.push(smMatch[1]);
  }

  // 6. HTML comments analysis
  const interestingComments: {
    content: string;
    type: string;
  }[] = [];

  for (const comment of htmlComments) {
    // Skip empty or very short comments
    if (comment.length < 3) continue;

    // Version strings
    if (/v?\d+\.\d+\.\d+/.test(comment)) {
      interestingComments.push({ content: comment.substring(0, 200), type: "version" });
    }
    // TODO/FIXME markers
    else if (/\b(TODO|FIXME|HACK|BUG|XXX|WARN)\b/i.test(comment)) {
      interestingComments.push({ content: comment.substring(0, 200), type: "developer-note" });
    }
    // Internal URLs
    else if (/https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(comment)) {
      interestingComments.push({ content: comment.substring(0, 200), type: "internal-url" });
    }
    // Developer notes with useful info
    else if (comment.length > 20 && !/^\s*\[if\s/.test(comment) && !/^\s*<!\[endif\]/.test(comment)) {
      // Skip IE conditional comments, only flag substantive comments
      if (/\b(debug|config|password|secret|key|token|api|admin|internal|staging|test)\b/i.test(comment)) {
        interestingComments.push({ content: comment.substring(0, 200), type: "potentially-sensitive" });
      }
    }
  }

  // 7. Hardcoded endpoints
  const endpoints: {
    url: string;
    type: string;
    source: string;
  }[] = [];

  // Scan inline scripts for URLs
  const urlRegex = /(?:["'`])((https?:\/\/[^\s"'`<>]+))/g;
  let urlMatch: RegExpExecArray | null;
  const seenUrls = new Set<string>();
  while ((urlMatch = urlRegex.exec(inlineScriptText)) !== null) {
    const foundUrl = urlMatch[1];
    if (!seenUrls.has(foundUrl)) {
      seenUrls.add(foundUrl);
      let type = "external-url";
      if (/\/api\//i.test(foundUrl)) type = "api-endpoint";
      else if (/\/v[1-9]\//i.test(foundUrl)) type = "versioned-api";
      else if (/\/graphql/i.test(foundUrl)) type = "graphql-endpoint";
      endpoints.push({ url: foundUrl, type, source: "inline-script" });
    }
  }

  // Scan inline scripts for IP addresses
  const ipRegex = /(?:["'`])(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?)/g;
  let ipMatch: RegExpExecArray | null;
  const seenIps = new Set<string>();
  while ((ipMatch = ipRegex.exec(inlineScriptText)) !== null) {
    const foundIp = ipMatch[1];
    if (!seenIps.has(foundIp) && !/^0\.0\.0\.0$/.test(foundIp) && !/^127\.0\.0\.1$/.test(foundIp)) {
      seenIps.add(foundIp);
      endpoints.push({ url: foundIp, type: "ip-address", source: "inline-script" });
    }
  }

  // Scan inline scripts for API path patterns
  const apiPathRegex = /(?:["'`])(\/(?:api|v[1-9]|v\d+|graphql)\/[^\s"'`<>]*)/g;
  let apiMatch: RegExpExecArray | null;
  const seenPaths = new Set<string>();
  while ((apiMatch = apiPathRegex.exec(inlineScriptText)) !== null) {
    const foundPath = apiMatch[1];
    if (!seenPaths.has(foundPath)) {
      seenPaths.add(foundPath);
      let type = "api-path";
      if (/\/graphql/i.test(foundPath)) type = "graphql-path";
      endpoints.push({ url: foundPath, type, source: "inline-script" });
    }
  }

  // 8. Build tool detection
  let buildTool: { name: string; indicators: string[] } | null = null;

  const buildIndicators: string[] = [];
  if (html.includes("webpackJsonp") || html.includes("__webpack_require__") || html.includes("webpackChunk")) {
    buildIndicators.push(
      html.includes("webpackJsonp") ? "webpackJsonp" : "",
      html.includes("__webpack_require__") ? "__webpack_require__" : "",
      html.includes("webpackChunk") ? "webpackChunk" : ""
    );
    buildTool = { name: "Webpack", indicators: buildIndicators.filter(Boolean) };
  } else if (html.includes("/@vite/") || html.includes("__vite_")) {
    buildIndicators.push(
      html.includes("/@vite/") ? "/@vite/ import" : "",
      html.includes("__vite_") ? "__vite_ global" : ""
    );
    buildTool = { name: "Vite", indicators: buildIndicators.filter(Boolean) };
  } else if (html.includes("parcelRequire")) {
    buildTool = { name: "Parcel", indicators: ["parcelRequire"] };
  }

  // Intelligence summary
  const intelligence: string[] = [];
  if (technologies.length > 0) {
    intelligence.push(
      `${technologies.length} technologies detected: ${technologies.map((t) => t.name + (t.version ? ` v${t.version}` : "")).join(", ")}`
    );
  }
  const vulnerableTechs = technologies.filter((t) => t.cves.length > 0);
  if (vulnerableTechs.length > 0) {
    const totalCves = vulnerableTechs.reduce((sum, t) => sum + t.cves.length, 0);
    intelligence.push(
      `${totalCves} potential CVEs found across ${vulnerableTechs.length} technologies`
    );
  }
  if (analytics.length > 0) {
    const crossRefAnalytics = analytics.filter((a) => a.trackingId && a.crossRefValue);
    if (crossRefAnalytics.length > 0) {
      intelligence.push(
        `Cross-referenceable tracking IDs: ${crossRefAnalytics.map((a) => `${a.name}=${a.trackingId}`).join(", ")}`
      );
    }
  }
  if (sourceMaps.length > 0) {
    intelligence.push(`${sourceMaps.length} source maps found - may expose original source code`);
  }
  if (endpoints.length > 0) {
    intelligence.push(
      `${endpoints.length} hardcoded endpoints found in inline scripts`
    );
  }
  if (interestingComments.length > 0) {
    intelligence.push(
      `${interestingComments.length} interesting HTML comments found`
    );
  }

  const result = {
    url: url ?? null,
    technologies,
    analytics,
    generator: generatorMeta,
    frameworkIndicators,
    sourceMaps,
    comments: interestingComments,
    endpoints,
    buildTool,
    intelligence,
  };

  return json(result);
}

// ─── Tool 3: fp_analyze_banner ───

async function analyzeBanner(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const banner = args.banner as string;
  const port = args.port as number | undefined;

  // 1. Match against SERVICE_BANNERS database
  let matchedService: {
    service: string;
    software: string;
    version: string | null;
    matchedPattern: string;
  } | null = null;

  for (const entry of SERVICE_BANNERS) {
    try {
      const regex = new RegExp(entry.pattern, "i");
      const match = regex.exec(banner);
      if (match) {
        let version: string | null = null;
        // Extract version from capture groups
        if (entry.version_extract && match.length > 1) {
          // Use the first non-undefined capture group
          for (let i = 1; i < match.length; i++) {
            if (match[i]) {
              version = match[i];
              break;
            }
          }
        }

        matchedService = {
          service: entry.service,
          software: entry.name,
          version,
          matchedPattern: entry.pattern,
        };
        break; // Use first match
      }
    } catch {
      // Invalid regex in pattern DB, skip
    }
  }

  // 2. Port-based protocol heuristic as tiebreaker
  let portProtocol: string | null = null;
  if (port !== undefined && PORT_PROTOCOL_MAP[port]) {
    portProtocol = PORT_PROTOCOL_MAP[port];
  }

  // 3. Common banner patterns not in the DB
  const additionalDetections: { pattern: string; protocol: string; software: string }[] = [];

  if (/^RFB\s+\d+\.\d+/i.test(banner)) {
    additionalDetections.push({
      pattern: "RFB protocol header",
      protocol: "vnc",
      software: "VNC Server",
    });
  }
  if (/^\*\s+OK/i.test(banner)) {
    additionalDetections.push({
      pattern: "* OK (IMAP greeting)",
      protocol: "imap",
      software: "IMAP Server",
    });
  }
  if (/^\+OK/i.test(banner)) {
    additionalDetections.push({
      pattern: "+OK (POP3 greeting)",
      protocol: "pop3",
      software: "POP3 Server",
    });
  }
  if (/^HTTP\/\d+\.\d+/i.test(banner)) {
    additionalDetections.push({
      pattern: "HTTP/ protocol header",
      protocol: "http",
      software: "HTTP Server",
    });
  }

  // 4. OS hints from banner
  const osHints: string[] = [];
  if (/ubuntu/i.test(banner)) osHints.push("Ubuntu");
  if (/debian/i.test(banner)) osHints.push("Debian");
  if (/centos/i.test(banner)) osHints.push("CentOS");
  if (/red\s*hat/i.test(banner)) osHints.push("Red Hat");
  if (/fedora/i.test(banner)) osHints.push("Fedora");
  if (/alpine/i.test(banner)) osHints.push("Alpine Linux");
  if (/freebsd/i.test(banner)) osHints.push("FreeBSD");
  if (/windows/i.test(banner)) osHints.push("Windows");
  if (/win32|win64/i.test(banner)) osHints.push("Windows");
  if (/darwin|macos/i.test(banner)) osHints.push("macOS");
  if (/suse/i.test(banner)) osHints.push("SUSE Linux");
  if (/arch\s*linux/i.test(banner)) osHints.push("Arch Linux");
  if (/amazon\s*linux/i.test(banner)) osHints.push("Amazon Linux");

  // Determine final service identification
  const service = matchedService?.service ?? additionalDetections[0]?.protocol ?? portProtocol ?? "unknown";
  const software = matchedService?.software ?? additionalDetections[0]?.software ?? "Unknown";
  const version = matchedService?.version ?? null;

  // Confidence scoring
  let confidence: "high" | "medium" | "low";
  if (matchedService) {
    confidence = version ? "high" : "medium";
  } else if (additionalDetections.length > 0) {
    confidence = "medium";
  } else if (portProtocol) {
    confidence = "low";
  } else {
    confidence = "low";
  }

  // Protocol determination
  const protocol = matchedService?.service ?? additionalDetections[0]?.protocol ?? portProtocol ?? "unknown";

  // Intelligence summary
  const intelligence: string[] = [];
  if (software !== "Unknown") {
    intelligence.push(`Identified as ${software}${version ? ` version ${version}` : ""}`);
  }
  if (osHints.length > 0) {
    intelligence.push(`OS hint: ${osHints.join(", ")}`);
  }
  if (matchedService && portProtocol && matchedService.service !== portProtocol) {
    intelligence.push(
      `Service "${matchedService.service}" running on non-standard port ${port} (expected ${portProtocol})`
    );
  }
  if (version) {
    intelligence.push("Version disclosed in banner - check for known vulnerabilities");
  }
  if (confidence === "low") {
    intelligence.push("Low confidence identification - banner may be custom or obfuscated");
  }

  const result = {
    banner: banner.substring(0, 500), // Truncate very long banners
    port: port ?? null,
    service,
    software,
    version,
    osHint: osHints.length > 0 ? osHints.join(", ") : null,
    protocol,
    matchedPattern: matchedService?.matchedPattern ?? additionalDetections[0]?.pattern ?? null,
    additionalDetections:
      additionalDetections.length > 0 && !matchedService ? additionalDetections : [],
    confidence,
    intelligence,
  };

  return json(result);
}

// ─── Tool Definitions ───

export const passiveTools: ToolDef[] = [
  {
    name: "fp_analyze_headers",
    description:
      "Passive HTTP header fingerprinting. Analyzes pre-collected response headers for server identification (claimed vs header-order-based), CDN/cloud provider detection, WAF detection, security header audit with grading (A-F), infrastructure cookie decoding (F5 BIG-IP, NetScaler, AWS ALB), technology stack detection, and cache strategy analysis. No network requests are made.",
    schema: {
      headers: z
        .record(z.string())
        .describe("HTTP response headers as key-value pairs"),
      url: z
        .string()
        .optional()
        .describe("Original URL for context (not fetched)"),
    },
    execute: analyzeHeaders,
  },
  {
    name: "fp_analyze_html",
    description:
      "Passive HTML source fingerprinting. Analyzes raw HTML for client-side technology detection with version extraction and CVE cross-referencing, analytics/tracking code identification with ID extraction for cross-domain correlation, framework indicators (Next.js, Nuxt, Angular, React, Vue, Svelte, Astro), source map exposure, interesting HTML comments, hardcoded API endpoints and IP addresses, and build tool detection. No network requests are made.",
    schema: {
      html: z.string().describe("Raw HTML source to analyze"),
      url: z
        .string()
        .optional()
        .describe("Original URL for context (not fetched)"),
    },
    execute: analyzeHtml,
  },
  {
    name: "fp_analyze_banner",
    description:
      "Passive service banner fingerprinting. Analyzes a raw service banner string to identify the service software, extract version numbers, detect OS hints, and determine protocol. Matches against a database of known banner patterns for SSH, FTP, SMTP, HTTP, MySQL, PostgreSQL, Redis, MongoDB, Memcached, IMAP, POP3, and DNS. Uses port number as a tiebreaker for ambiguous banners. No network requests are made.",
    schema: {
      banner: z.string().describe("Raw service banner string to analyze"),
      port: z
        .number()
        .optional()
        .describe("Port number for protocol heuristics"),
    },
    execute: analyzeBanner,
  },
];
