import { z } from "zod";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { json, text } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { shodanFaviconHash } from "../utils/murmurhash3.js";
import {
  computeHeaderOrderHash,
  HEADER_ORDER_SIGNATURES,
} from "../data/header-order.js";

// ─── Module-Level Setup ───

const limiter = new RateLimiter(200); // 200ms between requests
const cache = new TTLCache<any>(300_000); // 5min cache

const USER_AGENT = "fingerprint-mcp/0.1";
const DEFAULT_TIMEOUT = 10_000; // 10 seconds

// ─── Known Header Order Patterns (inline for spoofing detection) ───

const KNOWN_SERVER_HEADER_ORDERS: Record<string, string[][]> = {
  apache: [
    ["date", "server", "last-modified", "etag", "accept-ranges", "content-length", "content-type"],
    ["date", "server", "content-type", "content-length", "connection"],
    ["date", "server", "last-modified", "etag", "accept-ranges", "content-length", "vary", "content-type"],
  ],
  nginx: [
    ["server", "date", "content-type", "content-length", "connection", "last-modified", "etag", "accept-ranges"],
    ["server", "date", "content-type", "transfer-encoding", "connection"],
    ["server", "date", "content-type", "content-length", "connection"],
  ],
  iis: [
    ["content-type", "server", "x-powered-by", "date", "content-length"],
    ["content-type", "server", "date", "content-length"],
  ],
  express: [
    ["x-powered-by", "content-type", "content-length", "etag", "date", "connection"],
    ["x-powered-by", "content-type", "date", "connection", "transfer-encoding"],
  ],
  litespeed: [
    ["date", "content-type", "transfer-encoding", "connection", "x-powered-by"],
    ["date", "server", "content-type", "content-length", "connection"],
  ],
  caddy: [
    ["server", "content-type", "date"],
    ["server", "content-type", "content-length", "date"],
  ],
};

// ─── Known ETag Format Patterns ───

interface ETagPattern {
  server: string;
  regex: RegExp;
  description: string;
  extract?: (match: RegExpMatchArray) => Record<string, string | number>;
}

const ETAG_PATTERNS: ETagPattern[] = [
  {
    server: "Apache",
    regex: /^"([0-9a-f]+)-([0-9a-f]+)-([0-9a-f]+)"$/i,
    description: "Apache inode-size-timestamp format (hex triplet)",
    extract: (m) => ({
      inode: parseInt(m[1], 16),
      fileSize: parseInt(m[2], 16),
      timestamp: parseInt(m[3], 16),
      timestampDate: new Date(parseInt(m[3], 16) * 1000).toISOString(),
    }),
  },
  {
    server: "Nginx",
    regex: /^"([0-9a-f]+)-([0-9a-f]+)"$/i,
    description: "Nginx timestamp-size format (hex pair)",
    extract: (m) => ({
      timestamp: parseInt(m[1], 16),
      timestampDate: new Date(parseInt(m[1], 16) * 1000).toISOString(),
      fileSize: parseInt(m[2], 16),
    }),
  },
  {
    server: "IIS",
    regex: /^"[0-9a-f]+:[0-9a-f]+"$/i,
    description: "IIS opaque hash format (colon-separated)",
  },
  {
    server: "LiteSpeed",
    regex: /^"([0-9a-f]+)-([0-9a-f]+)-([0-9a-f]+)"$/i,
    description: "LiteSpeed size-timestamp-gzip format",
    extract: (m) => ({
      fileSize: parseInt(m[1], 16),
      timestamp: parseInt(m[2], 16),
      gzipFlag: parseInt(m[3], 16),
    }),
  },
  {
    server: "Cloudflare",
    regex: /^W\/"[0-9a-f]+-[0-9a-f]+"$/i,
    description: "Cloudflare weak ETag (W/ prefix)",
  },
  {
    server: "Cloudflare",
    regex: /^W\//,
    description: "Weak ETag (generic, possibly Cloudflare or CDN)",
  },
];

// ─── Session Cookie Patterns (inline) ───

const SESSION_COOKIE_MAP: Record<string, string> = {
  PHPSESSID: "PHP",
  JSESSIONID: "Java (Servlet/JSP)",
  "ASP.NET_SessionId": "ASP.NET",
  "connect.sid": "Express.js (Node.js)",
  laravel_session: "Laravel (PHP)",
  "rack.session": "Ruby on Rails / Sinatra",
  _session_id: "Ruby on Rails",
  csrftoken: "Django (Python)",
  sessionid: "Django (Python)",
  ci_session: "CodeIgniter (PHP)",
  _gorilla_csrf: "Go (Gorilla toolkit)",
};

// ─── Known Services for Resource Hints ───

const KNOWN_SERVICES: Record<string, string> = {
  "fonts.googleapis.com": "Google Fonts",
  "fonts.gstatic.com": "Google Fonts (static)",
  "www.googletagmanager.com": "Google Tag Manager",
  "www.google-analytics.com": "Google Analytics",
  "analytics.google.com": "Google Analytics",
  "cdn.segment.com": "Segment Analytics",
  "js.stripe.com": "Stripe Payments",
  "m.stripe.com": "Stripe Mobile",
  "api.stripe.com": "Stripe API",
  "js.braintreegateway.com": "Braintree Payments",
  "cdn.auth0.com": "Auth0 Authentication",
  "browser.sentry-cdn.com": "Sentry Error Tracking",
  "js.sentry-cdn.com": "Sentry Error Tracking",
  "cdn.heapanalytics.com": "Heap Analytics",
  "cdn.amplitude.com": "Amplitude Analytics",
  "cdn.mxpnl.com": "Mixpanel Analytics",
  "static.hotjar.com": "Hotjar Heatmaps",
  "script.hotjar.com": "Hotjar Heatmaps",
  "connect.facebook.net": "Facebook SDK",
  "platform.twitter.com": "Twitter/X Platform",
  "cdn.jsdelivr.net": "jsDelivr CDN",
  "cdnjs.cloudflare.com": "Cloudflare cdnjs",
  "unpkg.com": "unpkg CDN",
  "ajax.googleapis.com": "Google Hosted Libraries",
  "cdn.shopify.com": "Shopify CDN",
  "static.cloudflareinsights.com": "Cloudflare Web Analytics",
  "widget.intercom.io": "Intercom",
  "js.intercomcdn.com": "Intercom CDN",
  "fast.wistia.com": "Wistia Video",
  "player.vimeo.com": "Vimeo Player",
  "www.youtube.com": "YouTube",
  "maps.googleapis.com": "Google Maps",
  "api.mapbox.com": "Mapbox Maps",
  "kit.fontawesome.com": "Font Awesome",
  "use.typekit.net": "Adobe Fonts (Typekit)",
  "snap.licdn.com": "LinkedIn Insight Tag",
  "bat.bing.com": "Bing Ads UET",
  "sc-static.net": "Snapchat Pixel",
  "px.ads.linkedin.com": "LinkedIn Ads",
  "cdn.cookielaw.org": "OneTrust Cookie Consent",
};

// ─── Shared Helpers ───

async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  await limiter.acquire();
  return fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    headers: { "User-Agent": USER_AGENT },
    ...init,
  });
}

function getHeaderOrder(response: Response): string[] {
  const order: string[] = [];
  response.headers.forEach((_value, key) => {
    order.push(key);
  });
  return order;
}

function matchServerFromOrder(headerOrder: string[]): {
  detected: string | null;
  confidence: number;
} {
  const lowerOrder = headerOrder.map((h) => h.toLowerCase());
  const hash = computeHeaderOrderHash(headerOrder);

  // Check against known signatures from data file
  for (const sig of HEADER_ORDER_SIGNATURES) {
    if (sig.hash === hash) {
      return { detected: sig.server, confidence: 0.9 };
    }
  }

  // Fuzzy match against inline patterns
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [server, patterns] of Object.entries(KNOWN_SERVER_HEADER_ORDERS)) {
    for (const pattern of patterns) {
      // Count how many headers appear in the same relative order
      let matchCount = 0;
      let lastIdx = -1;
      for (const hdr of pattern) {
        const idx = lowerOrder.indexOf(hdr);
        if (idx > lastIdx) {
          matchCount++;
          lastIdx = idx;
        }
      }
      const score = matchCount / pattern.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = server;
      }
    }
  }

  if (bestScore >= 0.6) {
    return { detected: bestMatch, confidence: bestScore };
  }

  return { detected: null, confidence: 0 };
}

function detectSpoofing(
  serverHeader: string | null,
  orderDetection: string | null,
): { spoofed: boolean; details: string } {
  if (!serverHeader || !orderDetection) {
    return { spoofed: false, details: "Insufficient data for spoofing detection" };
  }

  const serverLower = serverHeader.toLowerCase();
  const orderLower = orderDetection.toLowerCase();

  // Map server header values to canonical names
  const serverCanonical =
    serverLower.includes("apache") ? "apache"
    : serverLower.includes("nginx") ? "nginx"
    : serverLower.includes("iis") || serverLower.includes("microsoft") ? "iis"
    : serverLower.includes("express") ? "express"
    : serverLower.includes("litespeed") ? "litespeed"
    : serverLower.includes("caddy") ? "caddy"
    : serverLower.includes("cloudflare") ? "cloudflare"
    : null;

  if (!serverCanonical) {
    return { spoofed: false, details: "Server header value not in spoofing detection database" };
  }

  if (!orderLower.includes(serverCanonical)) {
    return {
      spoofed: true,
      details: `Server header claims "${serverHeader}" but header ordering pattern matches "${orderDetection}"`,
    };
  }

  return { spoofed: false, details: "Server header consistent with header ordering pattern" };
}

function parseCookieString(setCookieHeader: string): {
  name: string;
  value: string;
  attributes: Record<string, string | boolean>;
} {
  const parts = setCookieHeader.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIdx = nameValue.indexOf("=");
  const name = eqIdx > 0 ? nameValue.slice(0, eqIdx) : nameValue;
  const value = eqIdx > 0 ? nameValue.slice(eqIdx + 1) : "";

  const attributes: Record<string, string | boolean> = {};
  for (const attr of attrs) {
    const aEqIdx = attr.indexOf("=");
    if (aEqIdx > 0) {
      attributes[attr.slice(0, aEqIdx).toLowerCase()] = attr.slice(aEqIdx + 1);
    } else {
      attributes[attr.toLowerCase()] = true;
    }
  }

  return { name, value, attributes };
}

function decodeBigIPCookie(cookieValue: string): {
  ip: string;
  port: number;
} | null {
  try {
    // Simple format: NNNNN.NNNNN.0000
    const simpleParts = cookieValue.split(".");
    if (simpleParts.length >= 2) {
      const ipEncoded = parseInt(simpleParts[0], 10);
      const portEncoded = parseInt(simpleParts[1], 10);

      if (!isNaN(ipEncoded) && !isNaN(portEncoded)) {
        // Decode IP: convert to hex, reverse byte pairs, convert each pair to decimal
        const ipHex = (ipEncoded >>> 0).toString(16).padStart(8, "0");
        const ip = [
          parseInt(ipHex.slice(6, 8), 16),
          parseInt(ipHex.slice(4, 6), 16),
          parseInt(ipHex.slice(2, 4), 16),
          parseInt(ipHex.slice(0, 2), 16),
        ].join(".");

        // Decode port: convert to hex, reverse byte pair, convert to decimal
        const portHex = (portEncoded >>> 0).toString(16).padStart(4, "0");
        const port = parseInt(portHex.slice(2, 4) + portHex.slice(0, 2), 16);

        return { ip, port };
      }
    }

    // Extended format: rd<N>o00000000000000000000ffff<hex-ip>o<port>
    const extMatch = cookieValue.match(
      /rd\d+o0+ffff([0-9a-f]{8})o(\d+)/i,
    );
    if (extMatch) {
      const hexIp = extMatch[1];
      const ip = [
        parseInt(hexIp.slice(0, 2), 16),
        parseInt(hexIp.slice(2, 4), 16),
        parseInt(hexIp.slice(4, 6), 16),
        parseInt(hexIp.slice(6, 8), 16),
      ].join(".");
      const port = parseInt(extMatch[2], 10);
      return { ip, port };
    }

    return null;
  } catch {
    return null;
  }
}

function decodeNetScalerCookie(
  cookieName: string,
  cookieValue: string,
): {
  vserverName: string;
  ip: string | null;
  port: number | null;
} {
  // Cookie name after NSC_ is the vserver name with char substitution
  const encodedName = cookieName.replace(/^NSC_/, "");
  // Reverse the character mapping (lowercase letters shifted by a fixed offset)
  const vserverName = encodedName
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 97 && code <= 122) {
        // a-z: reverse rotate
        return String.fromCharCode(((code - 97 + 13) % 26) + 97);
      }
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + 13) % 26) + 65);
      }
      return c;
    })
    .join("");

  // Cookie value: hex-encoded, first 8 hex = XOR-decoded VIP, next 4 = XOR-decoded port
  let ip: string | null = null;
  let port: number | null = null;

  try {
    const hexMatch = cookieValue.match(/^([0-9a-f]{8})([0-9a-f]{4})/i);
    if (hexMatch) {
      const ipEncoded = parseInt(hexMatch[1], 16);
      const portEncoded = parseInt(hexMatch[2], 16);

      // XOR with 0x03030303 for IP
      const ipDecoded = ipEncoded ^ 0x03030303;
      ip = [
        (ipDecoded >>> 24) & 0xff,
        (ipDecoded >>> 16) & 0xff,
        (ipDecoded >>> 8) & 0xff,
        ipDecoded & 0xff,
      ].join(".");

      // XOR with 0x0303 for port
      port = portEncoded ^ 0x0303;
    }
  } catch {
    // Decoding failed — return what we have
  }

  return { vserverName, ip, port };
}

// ──────────────────────────────────────────────────────────────────────────────
// Tool 1: http_headers
// ──────────────────────────────────────────────────────────────────────────────

const httpHeaders: ToolDef = {
  name: "http_headers",
  description:
    "HTTP header ordering fingerprint. Sends a GET request, captures response headers in order, " +
    "compares ordering against known server patterns (Apache, Nginx, IIS, Express, LiteSpeed, Caddy). " +
    "Detects spoofing when Server header claims one server but header ordering follows another pattern. " +
    "Computes header order hash for correlation.",
  schema: {
    url: z.string().url().describe("Target URL to fingerprint via header ordering"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_headers:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });
      const headerOrder = getHeaderOrder(res);
      const hash = computeHeaderOrderHash(headerOrder);
      const serverHeader = res.headers.get("server");
      const orderMatch = matchServerFromOrder(headerOrder);
      const spoofCheck = detectSpoofing(serverHeader, orderMatch.detected);

      const result = {
        url,
        status: res.status,
        serverHeader,
        headerOrder,
        headerOrderHash: hash,
        headerCount: headerOrder.length,
        detection: {
          serverFromOrder: orderMatch.detected,
          confidence: orderMatch.confidence,
        },
        spoofing: spoofCheck,
        rawHeaders: Object.fromEntries(
          headerOrder.map((h) => [h, res.headers.get(h)]),
        ),
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 2: http_multi_fingerprint
// ──────────────────────────────────────────────────────────────────────────────

const httpMultiFingerprint: ToolDef = {
  name: "http_multi_fingerprint",
  description:
    "Multi-request header ordering comparison. Sends GET /, GET /nonexistent404, POST /, HEAD / and compares " +
    "header ordering across request types. Ordering differences between methods provide additional fingerprint " +
    "signal for server identification.",
  schema: {
    url: z.string().url().describe("Target URL for multi-method header fingerprinting"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_multi_fingerprint:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const methods: { label: string; init: RequestInit; path: string }[] = [
      { label: "GET /", init: { method: "GET" }, path: "" },
      {
        label: "GET /nonexistent404",
        init: { method: "GET" },
        path: "/nonexistent-path-fingerprint-mcp-404",
      },
      { label: "POST /", init: { method: "POST", body: "" }, path: "" },
      { label: "HEAD /", init: { method: "HEAD" }, path: "" },
    ];

    const results: Record<
      string,
      {
        status: number;
        headerOrder: string[];
        hash: string;
        serverHeader: string | null;
      }
    > = {};

    const baseUrl = new URL(url);

    for (const m of methods) {
      try {
        const targetUrl = new URL(m.path, baseUrl).toString();
        const res = await safeFetch(targetUrl, {
          ...m.init,
          redirect: "follow",
        });
        const headerOrder = getHeaderOrder(res);
        results[m.label] = {
          status: res.status,
          headerOrder,
          hash: computeHeaderOrderHash(headerOrder),
          serverHeader: res.headers.get("server"),
        };
      } catch (err: any) {
        results[m.label] = {
          status: 0,
          headerOrder: [],
          hash: "",
          serverHeader: null,
        };
      }
    }

    // Analyze ordering differences
    const hashes = Object.values(results).map((r) => r.hash).filter(Boolean);
    const uniqueHashes = [...new Set(hashes)];
    const orderingConsistent = uniqueHashes.length <= 1;

    // Detect server from the GET / response
    const getResult = results["GET /"];
    const detection = getResult
      ? matchServerFromOrder(getResult.headerOrder)
      : { detected: null, confidence: 0 };

    const result = {
      url,
      requests: results,
      analysis: {
        uniqueOrderHashes: uniqueHashes.length,
        orderingConsistent,
        serverDetection: detection.detected,
        confidence: detection.confidence,
        insight: orderingConsistent
          ? "Header ordering is consistent across methods — typical for single-server deployments"
          : "Header ordering varies across methods — may indicate reverse proxy, load balancer, or WAF in front of origin",
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 3: http_favicon
// ──────────────────────────────────────────────────────────────────────────────

const httpFavicon: ToolDef = {
  name: "http_favicon",
  description:
    "Favicon detection and hashing. Checks 4 sources: /favicon.ico, HTML <link rel=\"icon\">, " +
    "/apple-touch-icon.png, /apple-touch-icon-precomposed.png. Calculates Shodan MurmurHash3, MD5, " +
    "and SHA256. Matches against known application favicon hashes (Jenkins, Grafana, Kibana, etc.).",
  schema: {
    url: z.string().url().describe("Target URL for favicon detection and hash fingerprinting"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_favicon:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const baseUrl = new URL(url);
    const faviconSources: {
      source: string;
      url: string;
      hash?: number;
      md5?: string;
      sha256?: string;
      size?: number;
      contentType?: string;
      match?: string;
      error?: string;
    }[] = [];

    // Helper to fetch and hash a favicon URL
    async function fetchAndHash(faviconUrl: string, source: string) {
      try {
        const res = await safeFetch(faviconUrl, { redirect: "follow" });
        if (!res.ok) {
          faviconSources.push({ source, url: faviconUrl, error: `HTTP ${res.status}` });
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        // Skip HTML responses (error pages returned as 200)
        if (contentType.includes("text/html") && source !== "html-link") {
          faviconSources.push({ source, url: faviconUrl, error: "Returned HTML instead of icon" });
          return;
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length === 0) {
          faviconSources.push({ source, url: faviconUrl, error: "Empty response" });
          return;
        }

        const mmh3 = shodanFaviconHash(buffer);
        const md5 = createHash("md5").update(buffer).digest("hex");
        const sha256 = createHash("sha256").update(buffer).digest("hex");

        // Match against known favicon hashes
        const { FAVICON_HASHES } = await import("../data/favicon-hashes.js");
        const knownMatch = FAVICON_HASHES.find((f) => f.hash === mmh3);

        faviconSources.push({
          source,
          url: faviconUrl,
          hash: mmh3,
          md5,
          sha256,
          size: buffer.length,
          contentType,
          match: knownMatch?.name ?? undefined,
        });
      } catch (err: any) {
        faviconSources.push({ source, url: faviconUrl, error: err.message });
      }
    }

    // Source 1: /favicon.ico
    await fetchAndHash(new URL("/favicon.ico", baseUrl).toString(), "favicon.ico");

    // Source 2: HTML <link rel="icon">
    try {
      const htmlRes = await safeFetch(url, { redirect: "follow" });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const $ = cheerio.load(html);
        const iconLink = $('link[rel="icon"], link[rel="shortcut icon"]').first();
        if (iconLink.length) {
          const href = iconLink.attr("href");
          if (href) {
            const iconUrl = new URL(href, url).toString();
            await fetchAndHash(iconUrl, "html-link");
          }
        }
      }
    } catch {
      // HTML parsing failed — skip
    }

    // Source 3: /apple-touch-icon.png
    await fetchAndHash(
      new URL("/apple-touch-icon.png", baseUrl).toString(),
      "apple-touch-icon",
    );

    // Source 4: /apple-touch-icon-precomposed.png
    await fetchAndHash(
      new URL("/apple-touch-icon-precomposed.png", baseUrl).toString(),
      "apple-touch-icon-precomposed",
    );

    const foundIcons = faviconSources.filter((f) => f.hash !== undefined);
    const matches = faviconSources.filter((f) => f.match);

    const result = {
      url,
      sources: faviconSources,
      summary: {
        iconsFound: foundIcons.length,
        knownApplicationMatches: matches.map((m) => ({
          source: m.source,
          application: m.match,
          shodanHash: m.hash,
        })),
        shodanSearchQuery: foundIcons.length > 0
          ? `http.favicon.hash:${foundIcons[0].hash}`
          : null,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 4: http_etag
// ──────────────────────────────────────────────────────────────────────────────

const httpEtag: ToolDef = {
  name: "http_etag",
  description:
    "ETag format analysis for server fingerprinting. Detects server type from ETag format patterns: " +
    "Apache (inode-size-timestamp hex), Nginx (timestamp-size hex), IIS (opaque), LiteSpeed (size-timestamp-gzip), " +
    "Cloudflare (weak ETag W/). Extracts Apache inode number, file size, and timestamp from ETag values.",
  schema: {
    url: z.string().url().describe("Target URL for ETag format analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_etag:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });
      const etag = res.headers.get("etag");

      if (!etag) {
        const result = {
          url,
          etag: null,
          serverDetected: null,
          analysis: "No ETag header present — server may disable ETags or use different caching strategy",
        };
        cache.set(cacheKey, result);
        return json(result);
      }

      let serverDetected: string | null = null;
      let formatDescription: string | null = null;
      let extractedData: Record<string, string | number> | null = null;
      const isWeak = etag.startsWith("W/");

      for (const pattern of ETAG_PATTERNS) {
        const match = etag.match(pattern.regex);
        if (match) {
          serverDetected = pattern.server;
          formatDescription = pattern.description;
          if (pattern.extract) {
            extractedData = pattern.extract(match);
          }
          break;
        }
      }

      // Check for Apache inode leak specifically
      let inodeLeak = false;
      if (serverDetected === "Apache" && extractedData && "inode" in extractedData) {
        inodeLeak = true;
      }

      const result = {
        url,
        etag,
        isWeakETag: isWeak,
        serverDetected,
        formatDescription,
        extractedData,
        securityFindings: {
          inodeLeak,
          inodeLeakDetails: inodeLeak
            ? `Apache inode ${extractedData?.inode} leaked — may aid in identifying specific files or filesystem layout`
            : null,
        },
        serverHeader: res.headers.get("server"),
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 5: http_errors
// ──────────────────────────────────────────────────────────────────────────────

const httpErrors: ToolDef = {
  name: "http_errors",
  description:
    "Error page fingerprinting. Triggers 400, 404, 405, 500 errors plus special triggers " +
    "(null byte, oversized header, invalid method). Each error response is matched against " +
    "framework signatures (Apache, Nginx, IIS, Express, Django, Laravel, Spring Boot, etc.). " +
    "Reveals server software, version, and potentially debug information.",
  schema: {
    url: z.string().url().describe("Target URL for error page fingerprinting"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_errors:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const baseUrl = new URL(url);

    const errorTests: {
      name: string;
      expectedStatus: number;
      fetch: () => Promise<Response>;
    }[] = [
      {
        name: "404 — Non-existent path",
        expectedStatus: 404,
        fetch: () =>
          safeFetch(
            new URL("/nonexistent-path-fpmcp-" + Date.now(), baseUrl).toString(),
            { redirect: "follow" },
          ),
      },
      {
        name: "405 — Method Not Allowed (DELETE on root)",
        expectedStatus: 405,
        fetch: () =>
          safeFetch(url, { method: "DELETE", redirect: "follow" }),
      },
      {
        name: "400 — Null byte in URL",
        expectedStatus: 400,
        fetch: () =>
          safeFetch(
            new URL("/test%00null", baseUrl).toString(),
            { redirect: "follow" },
          ),
      },
      {
        name: "400 — Oversized header",
        expectedStatus: 400,
        fetch: () =>
          safeFetch(url, {
            redirect: "follow",
            headers: {
              "User-Agent": USER_AGENT,
              "X-Oversized-Test": "A".repeat(16384),
            },
          }),
      },
      {
        name: "405 — Invalid method (FAKEVERB)",
        expectedStatus: 405,
        fetch: () =>
          safeFetch(url, { method: "FAKEVERB" as any, redirect: "follow" }),
      },
    ];

    const { ERROR_SIGNATURES } = await import("../data/error-signatures.js");

    const errorResults: {
      name: string;
      status: number;
      serverHeader: string | null;
      bodySnippet: string;
      matchedSignatures: { server: string; confidence: number; matchedPatterns: string[] }[];
      error?: string;
    }[] = [];

    for (const test of errorTests) {
      try {
        const res = await test.fetch();
        const body = await res.text();
        const bodySnippet = body.slice(0, 2000);
        const serverHeader = res.headers.get("server");

        const matchedSignatures: {
          server: string;
          confidence: number;
          matchedPatterns: string[];
        }[] = [];

        for (const sig of ERROR_SIGNATURES) {
          const matchedPatterns: string[] = [];

          // Check body patterns
          if (sig.patterns.body) {
            for (const pattern of sig.patterns.body) {
              try {
                if (new RegExp(pattern, "is").test(body)) {
                  matchedPatterns.push(`body: ${pattern}`);
                }
              } catch {
                // Invalid regex — skip
              }
            }
          }

          // Check header patterns
          if (sig.patterns.headers) {
            for (const [headerName, headerPattern] of Object.entries(
              sig.patterns.headers,
            )) {
              const headerValue = res.headers.get(headerName);
              if (headerValue) {
                try {
                  if (new RegExp(headerPattern, "i").test(headerValue)) {
                    matchedPatterns.push(
                      `header ${headerName}: ${headerPattern}`,
                    );
                  }
                } catch {
                  // Invalid regex — skip
                }
              }
            }
          }

          if (matchedPatterns.length > 0) {
            matchedSignatures.push({
              server: sig.server,
              confidence: sig.confidence,
              matchedPatterns,
            });
          }
        }

        errorResults.push({
          name: test.name,
          status: res.status,
          serverHeader,
          bodySnippet,
          matchedSignatures,
        });
      } catch (err: any) {
        errorResults.push({
          name: test.name,
          status: 0,
          serverHeader: null,
          bodySnippet: "",
          matchedSignatures: [],
          error: err.message,
        });
      }
    }

    // Aggregate the most confident detections
    const allDetections = errorResults.flatMap((r) => r.matchedSignatures);
    const serverCounts: Record<string, { count: number; maxConfidence: number }> = {};
    for (const d of allDetections) {
      if (!serverCounts[d.server]) {
        serverCounts[d.server] = { count: 0, maxConfidence: 0 };
      }
      serverCounts[d.server].count++;
      serverCounts[d.server].maxConfidence = Math.max(
        serverCounts[d.server].maxConfidence,
        d.confidence,
      );
    }

    const topDetection = Object.entries(serverCounts)
      .sort((a, b) => b[1].maxConfidence - a[1].maxConfidence || b[1].count - a[1].count)
      .map(([server, info]) => ({ server, ...info }));

    const result = {
      url,
      errorTests: errorResults,
      summary: {
        detectedServers: topDetection,
        primaryDetection: topDetection[0]?.server ?? null,
        debugInfoExposed: errorResults.some(
          (r) =>
            r.bodySnippet.includes("Traceback") ||
            r.bodySnippet.includes("stack trace") ||
            r.bodySnippet.includes("DEBUG = True") ||
            r.bodySnippet.includes("Exception"),
        ),
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 6: http_cookies
// ──────────────────────────────────────────────────────────────────────────────

const httpCookies: ToolDef = {
  name: "http_cookies",
  description:
    "Cookie analysis for technology and infrastructure detection. Identifies session technology " +
    "(PHPSESSID, JSESSIONID, connect.sid, etc.), decodes infrastructure cookies (F5 BIG-IP " +
    "backend IP:port, Citrix NetScaler VIP:port), and assesses cookie security (HttpOnly, Secure, " +
    "SameSite, domain scope, expiry).",
  schema: {
    url: z.string().url().describe("Target URL for cookie analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_cookies:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "manual" });

      // Collect all Set-Cookie headers
      const setCookieHeaders: string[] = [];
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          setCookieHeaders.push(value);
        }
      });

      // Some environments merge set-cookie — also try splitting on comma+space pattern
      // But first try the raw headers approach
      if (setCookieHeaders.length === 0) {
        const raw = res.headers.get("set-cookie");
        if (raw) {
          // Set-Cookie headers can contain commas in dates, so splitting is complex
          // Just treat the whole thing as one cookie for now
          setCookieHeaders.push(raw);
        }
      }

      if (setCookieHeaders.length === 0) {
        const result = {
          url,
          cookies: [],
          technologies: [],
          infrastructure: [],
          securityAssessment: { findings: ["No cookies set by server"] },
        };
        cache.set(cacheKey, result);
        return json(result);
      }

      const cookies = setCookieHeaders.map(parseCookieString);

      // Session technology detection
      const technologies: { cookieName: string; technology: string }[] = [];
      for (const cookie of cookies) {
        for (const [pattern, tech] of Object.entries(SESSION_COOKIE_MAP)) {
          if (cookie.name === pattern || cookie.name.startsWith(pattern)) {
            technologies.push({ cookieName: cookie.name, technology: tech });
            break;
          }
        }
        // WordPress-specific pattern checks
        if (cookie.name.startsWith("wordpress_logged_in_")) {
          technologies.push({ cookieName: cookie.name, technology: "WordPress" });
        }
        if (cookie.name.startsWith("wp-settings-")) {
          technologies.push({ cookieName: cookie.name, technology: "WordPress" });
        }
        // Drupal pattern
        if (/^SESS[0-9a-f]{32}$/.test(cookie.name)) {
          technologies.push({ cookieName: cookie.name, technology: "Drupal" });
        }
      }

      // Infrastructure decode
      const infrastructure: {
        cookieName: string;
        technology: string;
        decoded: any;
      }[] = [];

      for (const cookie of cookies) {
        // F5 BIG-IP
        if (cookie.name.startsWith("BIGipServer")) {
          const decoded = decodeBigIPCookie(cookie.value);
          infrastructure.push({
            cookieName: cookie.name,
            technology: "F5 BIG-IP",
            decoded: decoded
              ? { backendIP: decoded.ip, backendPort: decoded.port, poolName: cookie.name.replace("BIGipServer", "") }
              : { raw: cookie.value, decodeFailed: true },
          });
        }

        // Citrix NetScaler
        if (cookie.name.startsWith("NSC_")) {
          const decoded = decodeNetScalerCookie(cookie.name, cookie.value);
          infrastructure.push({
            cookieName: cookie.name,
            technology: "Citrix NetScaler",
            decoded,
          });
        }

        // AWS ALB
        if (cookie.name === "AWSALB" || cookie.name === "AWSALBCORS") {
          infrastructure.push({
            cookieName: cookie.name,
            technology: "AWS ALB",
            decoded: { note: "ALB routing cookie — base64-encoded target group info" },
          });
        }

        // Google Cloud LB
        if (cookie.name === "GCLB") {
          infrastructure.push({
            cookieName: cookie.name,
            technology: "Google Cloud Load Balancer",
            decoded: { note: "GCLB backend routing cookie" },
          });
        }

        // HAProxy
        if (cookie.name === "ROUTEID" || cookie.name === "SERVERID") {
          infrastructure.push({
            cookieName: cookie.name,
            technology: "HAProxy",
            decoded: { backendServer: cookie.value },
          });
        }

        // Cloudflare
        if (
          cookie.name === "__cf_bm" ||
          cookie.name === "_cfuvid" ||
          cookie.name === "cf_clearance"
        ) {
          infrastructure.push({
            cookieName: cookie.name,
            technology: "Cloudflare",
            decoded: { note: "Cloudflare bot management / security cookie" },
          });
        }
      }

      // Security assessment
      const securityFindings: string[] = [];
      for (const cookie of cookies) {
        const prefix = `Cookie "${cookie.name}":`;
        if (!cookie.attributes.httponly) {
          securityFindings.push(`${prefix} missing HttpOnly flag — accessible via JavaScript`);
        }
        if (!cookie.attributes.secure) {
          securityFindings.push(`${prefix} missing Secure flag — may be sent over HTTP`);
        }
        if (!cookie.attributes.samesite) {
          securityFindings.push(`${prefix} missing SameSite attribute — defaults to Lax in modern browsers`);
        }
        if (cookie.attributes.domain) {
          const domain = cookie.attributes.domain as string;
          if (domain.startsWith(".")) {
            securityFindings.push(
              `${prefix} wide domain scope (${domain}) — shared across subdomains`,
            );
          }
        }
        if (cookie.attributes.expires) {
          const expiryDate = new Date(cookie.attributes.expires as string);
          const daysUntilExpiry = Math.floor(
            (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );
          if (daysUntilExpiry > 365) {
            securityFindings.push(
              `${prefix} long expiry (${daysUntilExpiry} days) — consider shorter session lifetime`,
            );
          }
        }
      }

      const result = {
        url,
        cookies: cookies.map((c) => ({
          name: c.name,
          valueLength: c.value.length,
          attributes: c.attributes,
        })),
        technologies,
        infrastructure,
        securityAssessment: {
          totalCookies: cookies.length,
          findings: securityFindings.length > 0 ? securityFindings : ["All cookies have proper security attributes"],
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 7: http_methods
// ──────────────────────────────────────────────────────────────────────────────

const httpMethods: ToolDef = {
  name: "http_methods",
  description:
    "HTTP method probing. Tests GET, POST, PUT, DELETE, PATCH, OPTIONS, TRACE, CONNECT, PROPFIND, " +
    "MKCOL and method override headers (X-HTTP-Method-Override). Identifies TRACE 200 (XST risk), " +
    "PROPFIND 207 (WebDAV), verb tampering (FAKEVERB), and method override support.",
  schema: {
    url: z.string().url().describe("Target URL for HTTP method probing"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_methods:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const methodsToTest = [
      "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS",
      "TRACE", "PROPFIND", "MKCOL", "FAKEVERB",
    ];

    const methodResults: Record<
      string,
      { status: number; allowed: boolean; note?: string; error?: string }
    > = {};

    for (const method of methodsToTest) {
      try {
        const res = await safeFetch(url, {
          method: method as any,
          redirect: "follow",
        });
        const status = res.status;
        const allowed = status < 400 || status === 401 || status === 403;

        let note: string | undefined;
        if (method === "TRACE" && status === 200) {
          note = "SECURITY: TRACE enabled — Cross-Site Tracing (XST) risk";
        }
        if (method === "PROPFIND" && status === 207) {
          note = "WebDAV enabled (207 Multi-Status response)";
        }
        if (method === "FAKEVERB" && status < 400) {
          note = "Verb tampering possible — server accepts unknown HTTP methods";
        }
        if (method === "OPTIONS") {
          const allow = res.headers.get("allow");
          if (allow) {
            note = `Allowed methods: ${allow}`;
          }
        }

        // Consume body to avoid connection issues
        await res.text().catch(() => {});

        methodResults[method] = { status, allowed, note };
      } catch (err: any) {
        methodResults[method] = { status: 0, allowed: false, error: err.message };
      }
    }

    // Test method override headers
    const overrideResults: Record<
      string,
      { status: number; overrideWorked: boolean }
    > = {};

    const overrideHeaders = [
      "X-HTTP-Method-Override",
      "X-HTTP-Method",
      "X-Method-Override",
    ];

    for (const header of overrideHeaders) {
      try {
        const res = await safeFetch(url, {
          method: "POST",
          headers: {
            "User-Agent": USER_AGENT,
            [header]: "DELETE",
            "Content-Length": "0",
          },
          redirect: "follow",
        });
        // Compare against normal POST status
        const normalPostStatus = methodResults["POST"]?.status ?? 0;
        const overrideWorked = res.status !== normalPostStatus && res.status < 400;

        await res.text().catch(() => {});

        overrideResults[header] = {
          status: res.status,
          overrideWorked,
        };
      } catch (err: any) {
        overrideResults[header] = { status: 0, overrideWorked: false };
      }
    }

    const findings: string[] = [];
    if (methodResults["TRACE"]?.status === 200) {
      findings.push("TRACE method enabled — XST (Cross-Site Tracing) vulnerability risk");
    }
    if (methodResults["PROPFIND"]?.status === 207) {
      findings.push("WebDAV enabled — PROPFIND returns 207 Multi-Status");
    }
    if (methodResults["PUT"]?.allowed) {
      findings.push("PUT method allowed — check for arbitrary file upload");
    }
    if (methodResults["DELETE"]?.allowed) {
      findings.push("DELETE method allowed — check for unauthorized deletion");
    }
    if (methodResults["FAKEVERB"]?.allowed) {
      findings.push("Server accepts unknown HTTP verbs — potential verb tampering");
    }
    for (const [header, r] of Object.entries(overrideResults)) {
      if (r.overrideWorked) {
        findings.push(`Method override via ${header} header is supported`);
      }
    }

    const result = {
      url,
      methods: methodResults,
      methodOverride: overrideResults,
      securityFindings: findings.length > 0 ? findings : ["No concerning method configurations found"],
      allowedMethods: Object.entries(methodResults)
        .filter(([, r]) => r.allowed)
        .map(([m]) => m),
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 8: http_cors
// ──────────────────────────────────────────────────────────────────────────────

const httpCors: ToolDef = {
  name: "http_cors",
  description:
    "CORS (Cross-Origin Resource Sharing) configuration analysis. Tests origin reflection " +
    "(evil.com), null origin, subdomain trust, prefix/suffix regex bypass. Extracts " +
    "Access-Control-Allow-Methods/Headers/Expose-Headers to map API surface and discover " +
    "internal header names.",
  schema: {
    url: z.string().url().describe("Target URL for CORS configuration analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_cors:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const targetHost = new URL(url).hostname;

    const originTests: {
      name: string;
      origin: string;
      expectReflect: boolean;
      risk: string;
    }[] = [
      {
        name: "Arbitrary origin",
        origin: "https://evil.com",
        expectReflect: false,
        risk: "HIGH: Server reflects arbitrary origins — full CORS bypass",
      },
      {
        name: "Null origin",
        origin: "null",
        expectReflect: false,
        risk: "HIGH: Null origin accepted — exploitable via sandboxed iframes, data: URIs",
      },
      {
        name: "Subdomain",
        origin: `https://test.${targetHost}`,
        expectReflect: false,
        risk: "MEDIUM: Subdomain trusted — subdomain takeover could lead to CORS bypass",
      },
      {
        name: "Prefix bypass",
        origin: `https://${targetHost}.evil.com`,
        expectReflect: false,
        risk: "HIGH: Origin prefix bypass — regex/string matching flaw",
      },
      {
        name: "Suffix bypass",
        origin: `https://evil${targetHost}`,
        expectReflect: false,
        risk: "HIGH: Origin suffix bypass — regex/string matching flaw",
      },
      {
        name: "Scheme mismatch (HTTP)",
        origin: `http://${targetHost}`,
        expectReflect: false,
        risk: "MEDIUM: HTTP origin accepted on HTTPS site — downgrade risk",
      },
    ];

    const corsResults: {
      name: string;
      origin: string;
      reflected: boolean;
      allowCredentials: boolean;
      allowMethods: string | null;
      allowHeaders: string | null;
      exposeHeaders: string | null;
      risk: string | null;
      error?: string;
    }[] = [];

    for (const test of originTests) {
      try {
        const res = await safeFetch(url, {
          method: "OPTIONS",
          headers: {
            "User-Agent": USER_AGENT,
            Origin: test.origin,
            "Access-Control-Request-Method": "GET",
          },
          redirect: "follow",
        });

        const acao = res.headers.get("access-control-allow-origin");
        const reflected = acao === test.origin || acao === "*";
        const allowCredentials =
          res.headers.get("access-control-allow-credentials") === "true";
        const allowMethods = res.headers.get("access-control-allow-methods");
        const allowHeaders = res.headers.get("access-control-allow-headers");
        const exposeHeaders = res.headers.get("access-control-expose-headers");

        await res.text().catch(() => {});

        corsResults.push({
          name: test.name,
          origin: test.origin,
          reflected,
          allowCredentials,
          allowMethods,
          allowHeaders,
          exposeHeaders,
          risk: reflected ? test.risk : null,
        });
      } catch (err: any) {
        corsResults.push({
          name: test.name,
          origin: test.origin,
          reflected: false,
          allowCredentials: false,
          allowMethods: null,
          allowHeaders: null,
          exposeHeaders: null,
          risk: null,
          error: err.message,
        });
      }
    }

    // Also do a simple GET with Origin to check non-preflight behavior
    let getReflection: {
      reflected: boolean;
      acao: string | null;
      allowCredentials: boolean;
    } | null = null;

    try {
      const res = await safeFetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Origin: "https://evil.com",
        },
        redirect: "follow",
      });
      const acao = res.headers.get("access-control-allow-origin");
      getReflection = {
        reflected: acao === "https://evil.com" || acao === "*",
        acao,
        allowCredentials:
          res.headers.get("access-control-allow-credentials") === "true",
      };
      await res.text().catch(() => {});
    } catch {
      // Skip
    }

    const vulnerabilities = corsResults.filter((r) => r.risk !== null);
    const wildcardWithCredentials = corsResults.some(
      (r) => r.reflected && r.allowCredentials,
    );

    // Extract API surface from allowed methods/headers
    const allMethods = new Set<string>();
    const allHeaders = new Set<string>();
    const allExposedHeaders = new Set<string>();

    for (const r of corsResults) {
      if (r.allowMethods) {
        r.allowMethods.split(",").map((m) => m.trim()).forEach((m) => allMethods.add(m));
      }
      if (r.allowHeaders) {
        r.allowHeaders.split(",").map((h) => h.trim()).forEach((h) => allHeaders.add(h));
      }
      if (r.exposeHeaders) {
        r.exposeHeaders.split(",").map((h) => h.trim()).forEach((h) => allExposedHeaders.add(h));
      }
    }

    const result = {
      url,
      tests: corsResults,
      getReflection,
      apiSurface: {
        allowedMethods: [...allMethods],
        allowedHeaders: [...allHeaders],
        exposedHeaders: [...allExposedHeaders],
      },
      summary: {
        vulnerabilities: vulnerabilities.map((v) => v.risk),
        wildcardWithCredentials,
        wildcardWithCredentialsNote: wildcardWithCredentials
          ? "CRITICAL: Origin reflected with credentials — allows full cross-origin data theft"
          : null,
        corsConfigured: corsResults.some((r) => r.reflected || r.allowMethods !== null),
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 9: http_compression
// ──────────────────────────────────────────────────────────────────────────────

const httpCompression: ToolDef = {
  name: "http_compression",
  description:
    "Compression support probing. Tests gzip, deflate, br (Brotli), and zstd encoding support. " +
    "Intelligence: Brotli + modern stack = modern infrastructure. Only gzip = legacy. " +
    "No compression = embedded/IoT device.",
  schema: {
    url: z.string().url().describe("Target URL for compression support probing"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_compression:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const encodings = ["gzip", "deflate", "br", "zstd"];
    const compressionResults: Record<
      string,
      {
        supported: boolean;
        contentEncoding: string | null;
        contentLength: string | null;
        vary: string | null;
        error?: string;
      }
    > = {};

    // Also fetch without compression for baseline
    let baselineSize: number | null = null;
    try {
      const baseRes = await safeFetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Encoding": "identity",
        },
        redirect: "follow",
      });
      const baseBody = await baseRes.arrayBuffer();
      baselineSize = baseBody.byteLength;
    } catch {
      // Skip baseline
    }

    for (const encoding of encodings) {
      try {
        const res = await safeFetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            "Accept-Encoding": encoding,
          },
          redirect: "follow",
        });

        const contentEncoding = res.headers.get("content-encoding");
        const contentLength = res.headers.get("content-length");
        const vary = res.headers.get("vary");

        // Consume body
        await res.arrayBuffer().catch(() => {});

        compressionResults[encoding] = {
          supported: contentEncoding?.toLowerCase().includes(encoding) ?? false,
          contentEncoding,
          contentLength,
          vary,
        };
      } catch (err: any) {
        compressionResults[encoding] = {
          supported: false,
          contentEncoding: null,
          contentLength: null,
          vary: null,
          error: err.message,
        };
      }
    }

    const supportedEncodings = Object.entries(compressionResults)
      .filter(([, r]) => r.supported)
      .map(([enc]) => enc);

    let stackAssessment: string;
    if (supportedEncodings.includes("br") && supportedEncodings.includes("zstd")) {
      stackAssessment = "Cutting-edge stack — Brotli and Zstd support indicates modern infrastructure (likely CDN or recent server)";
    } else if (supportedEncodings.includes("br")) {
      stackAssessment = "Modern stack — Brotli support indicates recent server software or CDN";
    } else if (supportedEncodings.includes("gzip") && !supportedEncodings.includes("br")) {
      stackAssessment = "Legacy stack — only gzip compression, no Brotli support";
    } else if (supportedEncodings.length === 0) {
      stackAssessment = "No compression — may indicate embedded device, IoT, or minimal HTTP server";
    } else {
      stackAssessment = "Standard compression support";
    }

    const result = {
      url,
      baselineSizeBytes: baselineSize,
      encodings: compressionResults,
      supported: supportedEncodings,
      intelligence: {
        stackAssessment,
        compressionRatio: baselineSize && compressionResults.gzip?.contentLength
          ? (parseInt(compressionResults.gzip.contentLength, 10) / baselineSize).toFixed(3)
          : null,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 10: http_cache
// ──────────────────────────────────────────────────────────────────────────────

const httpCache: ToolDef = {
  name: "http_cache",
  description:
    "Cache behavior analysis. Detects hit/miss via X-Cache, CF-Cache-Status headers. " +
    "Discovers cache key components by varying query string, headers, and cookies. " +
    "Tests cache poisoning potential via unkeyed headers.",
  schema: {
    url: z.string().url().describe("Target URL for cache behavior analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_cache:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    // First request — establish baseline
    let baseline: {
      status: number;
      cacheHeaders: Record<string, string | null>;
      age: string | null;
    } | null = null;

    const cacheHeaderNames = [
      "x-cache", "x-cache-status", "cf-cache-status",
      "x-varnish", "x-fastly-request-id", "x-served-by",
      "x-cache-hits", "cache-control", "expires",
      "pragma", "age", "via",
    ];

    try {
      const res = await safeFetch(url, { redirect: "follow" });
      const headers: Record<string, string | null> = {};
      for (const h of cacheHeaderNames) {
        headers[h] = res.headers.get(h);
      }
      baseline = {
        status: res.status,
        cacheHeaders: headers,
        age: res.headers.get("age"),
      };
      await res.text().catch(() => {});
    } catch (err: any) {
      return json({ url, error: err.message });
    }

    // Second request — check if cache warms
    let secondRequest: Record<string, string | null> | null = null;
    try {
      const res2 = await safeFetch(url, { redirect: "follow" });
      secondRequest = {};
      for (const h of cacheHeaderNames) {
        secondRequest[h] = res2.headers.get(h);
      }
      await res2.text().catch(() => {});
    } catch {
      // Skip
    }

    // Cache key discovery: vary query string
    let queryStringKeyed = false;
    try {
      const bustUrl = new URL(url);
      bustUrl.searchParams.set("_fpmcp_bust", String(Date.now()));
      const res = await safeFetch(bustUrl.toString(), { redirect: "follow" });
      const xcache = res.headers.get("x-cache") || res.headers.get("cf-cache-status") || "";
      queryStringKeyed = xcache.toLowerCase().includes("miss") || xcache.toLowerCase().includes("dynamic");
      await res.text().catch(() => {});
    } catch {
      // Skip
    }

    // Test unkeyed headers for cache poisoning
    const poisonTests: {
      header: string;
      value: string;
      keyed: boolean;
      error?: string;
    }[] = [];

    const unkeyedHeaders = [
      { header: "X-Forwarded-Host", value: "evil.com" },
      { header: "X-Original-URL", value: "/admin" },
      { header: "X-Rewrite-URL", value: "/admin" },
      { header: "X-Forwarded-Scheme", value: "nothttps" },
    ];

    for (const test of unkeyedHeaders) {
      try {
        const res = await safeFetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            [test.header]: test.value,
          },
          redirect: "follow",
        });
        const xc = res.headers.get("x-cache") || res.headers.get("cf-cache-status") || "";
        // If still a cache HIT, the header is unkeyed
        const isHit = xc.toLowerCase().includes("hit");
        poisonTests.push({
          header: test.header,
          value: test.value,
          keyed: !isHit,
        });
        await res.text().catch(() => {});
      } catch (err: any) {
        poisonTests.push({
          header: test.header,
          value: test.value,
          keyed: true,
          error: err.message,
        });
      }
    }

    // Detect CDN / cache provider
    let cacheProvider: string | null = null;
    if (baseline.cacheHeaders["cf-cache-status"]) cacheProvider = "Cloudflare";
    else if (baseline.cacheHeaders["x-varnish"]) cacheProvider = "Varnish";
    else if (baseline.cacheHeaders["x-fastly-request-id"]) cacheProvider = "Fastly";
    else if (baseline.cacheHeaders["x-served-by"]?.includes("cache-")) cacheProvider = "Fastly";
    else if (baseline.cacheHeaders["via"]?.includes("cloudfront")) cacheProvider = "CloudFront";
    else if (baseline.cacheHeaders["x-cache"]) cacheProvider = "CDN/Cache (unknown vendor)";

    const poisonable = poisonTests.filter((p) => !p.keyed && !p.error);

    const result = {
      url,
      cacheProvider,
      baseline: baseline.cacheHeaders,
      secondRequest,
      cacheKeyAnalysis: {
        queryStringKeyed,
        unkeyedHeaders: poisonTests,
      },
      summary: {
        cachingDetected: cacheProvider !== null || baseline.age !== null,
        provider: cacheProvider,
        poisoningRisk: poisonable.length > 0,
        poisonableHeaders: poisonable.map((p) => p.header),
        cacheControl: baseline.cacheHeaders["cache-control"],
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 11: http_security
// ──────────────────────────────────────────────────────────────────────────────

const httpSecurity: ToolDef = {
  name: "http_security",
  description:
    "Security header assessment. Evaluates HSTS, CSP, X-Frame-Options, X-Content-Type-Options, " +
    "Permissions-Policy, Referrer-Policy, COOP, CORP, and other security headers. " +
    "Missing headers are reported as findings with severity ratings.",
  schema: {
    url: z.string().url().describe("Target URL for security header assessment"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_security:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });

      const securityHeaders: {
        name: string;
        value: string | null;
        present: boolean;
        severity: "high" | "medium" | "low" | "info";
        description: string;
        recommendation?: string;
      }[] = [
        {
          name: "Strict-Transport-Security",
          value: res.headers.get("strict-transport-security"),
          present: !!res.headers.get("strict-transport-security"),
          severity: "high",
          description: "HSTS — forces HTTPS connections, prevents SSL stripping attacks",
          recommendation: "max-age=31536000; includeSubDomains; preload",
        },
        {
          name: "Content-Security-Policy",
          value: res.headers.get("content-security-policy"),
          present: !!res.headers.get("content-security-policy"),
          severity: "high",
          description: "CSP — mitigates XSS, data injection, and clickjacking attacks",
          recommendation: "Define strict policy with nonces or hashes",
        },
        {
          name: "X-Frame-Options",
          value: res.headers.get("x-frame-options"),
          present: !!res.headers.get("x-frame-options"),
          severity: "medium",
          description: "Clickjacking protection — prevents page from being embedded in iframes",
          recommendation: "DENY or SAMEORIGIN",
        },
        {
          name: "X-Content-Type-Options",
          value: res.headers.get("x-content-type-options"),
          present: !!res.headers.get("x-content-type-options"),
          severity: "medium",
          description: "MIME type sniffing prevention",
          recommendation: "nosniff",
        },
        {
          name: "Permissions-Policy",
          value: res.headers.get("permissions-policy"),
          present: !!res.headers.get("permissions-policy"),
          severity: "medium",
          description: "Controls browser feature access (camera, microphone, geolocation, etc.)",
          recommendation: "Restrict unused features: camera=(), microphone=(), geolocation=()",
        },
        {
          name: "Referrer-Policy",
          value: res.headers.get("referrer-policy"),
          present: !!res.headers.get("referrer-policy"),
          severity: "low",
          description: "Controls how much referrer information is sent with requests",
          recommendation: "strict-origin-when-cross-origin or no-referrer",
        },
        {
          name: "Cross-Origin-Opener-Policy",
          value: res.headers.get("cross-origin-opener-policy"),
          present: !!res.headers.get("cross-origin-opener-policy"),
          severity: "low",
          description: "COOP — isolates browsing context to prevent Spectre-like attacks",
          recommendation: "same-origin",
        },
        {
          name: "Cross-Origin-Resource-Policy",
          value: res.headers.get("cross-origin-resource-policy"),
          present: !!res.headers.get("cross-origin-resource-policy"),
          severity: "low",
          description: "CORP — controls which origins can load resources",
          recommendation: "same-origin or cross-origin (if CDN)",
        },
        {
          name: "Cross-Origin-Embedder-Policy",
          value: res.headers.get("cross-origin-embedder-policy"),
          present: !!res.headers.get("cross-origin-embedder-policy"),
          severity: "low",
          description: "COEP — prevents loading cross-origin resources without explicit opt-in",
          recommendation: "require-corp",
        },
        {
          name: "X-XSS-Protection",
          value: res.headers.get("x-xss-protection"),
          present: !!res.headers.get("x-xss-protection"),
          severity: "info",
          description: "Legacy XSS filter (deprecated in modern browsers, CSP is preferred)",
        },
      ];

      // Analyze HSTS strength
      let hstsAnalysis: Record<string, any> | null = null;
      const hstsValue = res.headers.get("strict-transport-security");
      if (hstsValue) {
        const maxAgeMatch = hstsValue.match(/max-age=(\d+)/i);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
        hstsAnalysis = {
          maxAge,
          maxAgeDays: Math.floor(maxAge / 86400),
          includeSubDomains: /includeSubDomains/i.test(hstsValue),
          preload: /preload/i.test(hstsValue),
          adequate: maxAge >= 31536000,
        };
      }

      // Analyze CSP
      let cspAnalysis: Record<string, any> | null = null;
      const cspValue = res.headers.get("content-security-policy");
      if (cspValue) {
        const hasUnsafeInline = cspValue.includes("'unsafe-inline'");
        const hasUnsafeEval = cspValue.includes("'unsafe-eval'");
        const hasWildcard = /\s\*\s/.test(cspValue) || cspValue.includes(" * ");
        const directives = cspValue.split(";").map((d) => d.trim()).filter(Boolean);
        cspAnalysis = {
          directiveCount: directives.length,
          unsafeInline: hasUnsafeInline,
          unsafeEval: hasUnsafeEval,
          wildcardSource: hasWildcard,
          weaknesses: [
            ...(hasUnsafeInline ? ["unsafe-inline allows inline scripts/styles"] : []),
            ...(hasUnsafeEval ? ["unsafe-eval allows eval() and similar"] : []),
            ...(hasWildcard ? ["Wildcard (*) source allows loading from any origin"] : []),
          ],
        };
      }

      // Information disclosure headers
      const infoDisclosure: { header: string; value: string }[] = [];
      const disclosureHeaders = [
        "server", "x-powered-by", "x-aspnet-version",
        "x-runtime", "x-generator", "x-drupal-cache",
        "x-drupal-dynamic-cache",
      ];
      for (const h of disclosureHeaders) {
        const val = res.headers.get(h);
        if (val) {
          infoDisclosure.push({ header: h, value: val });
        }
      }

      const missing = securityHeaders.filter((h) => !h.present);
      const present = securityHeaders.filter((h) => h.present);

      // Score (0-100)
      const totalWeight = securityHeaders.reduce((sum, h) => {
        const w = h.severity === "high" ? 25 : h.severity === "medium" ? 15 : h.severity === "low" ? 10 : 5;
        return sum + w;
      }, 0);
      const earnedWeight = present.reduce((sum, h) => {
        const w = h.severity === "high" ? 25 : h.severity === "medium" ? 15 : h.severity === "low" ? 10 : 5;
        return sum + w;
      }, 0);
      const score = Math.round((earnedWeight / totalWeight) * 100);

      const result = {
        url,
        score,
        grade:
          score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F",
        presentHeaders: present.map((h) => ({ name: h.name, value: h.value })),
        missingHeaders: missing.map((h) => ({
          name: h.name,
          severity: h.severity,
          description: h.description,
          recommendation: h.recommendation,
        })),
        hstsAnalysis,
        cspAnalysis,
        informationDisclosure: infoDisclosure,
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 12: http_timing
// ──────────────────────────────────────────────────────────────────────────────

const httpTiming: ToolDef = {
  name: "http_timing",
  description:
    "Response timing analysis. Sends 10 identical GET requests and measures response times. " +
    "Computes mean and standard deviation. Low stddev = bare metal / dedicated. High stddev = " +
    "shared / cloud. High first request, low subsequent = serverless cold start pattern.",
  schema: {
    url: z.string().url().describe("Target URL for response timing analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_timing:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const timings: number[] = [];
    const requestCount = 10;

    for (let i = 0; i < requestCount; i++) {
      try {
        const start = performance.now();
        const res = await safeFetch(url, { redirect: "follow" });
        await res.text().catch(() => {});
        const elapsed = performance.now() - start;
        timings.push(Math.round(elapsed * 100) / 100);
      } catch {
        timings.push(-1); // Mark failed requests
      }
    }

    const validTimings = timings.filter((t) => t >= 0);

    if (validTimings.length === 0) {
      return json({ url, error: "All requests failed", timings });
    }

    const mean =
      validTimings.reduce((a, b) => a + b, 0) / validTimings.length;
    const variance =
      validTimings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) /
      validTimings.length;
    const stddev = Math.sqrt(variance);
    const min = Math.min(...validTimings);
    const max = Math.max(...validTimings);
    const coefficientOfVariation = mean > 0 ? (stddev / mean) * 100 : 0;

    // Detect cold start pattern: first request significantly slower than rest
    const firstTiming = validTimings[0];
    const restMean =
      validTimings.length > 1
        ? validTimings.slice(1).reduce((a, b) => a + b, 0) /
          (validTimings.length - 1)
        : mean;
    const coldStartRatio = firstTiming / restMean;
    const coldStartDetected = coldStartRatio > 2.0 && validTimings.length > 2;

    let infrastructureAssessment: string;
    if (coldStartDetected) {
      infrastructureAssessment =
        "Serverless / Lambda pattern detected — first request significantly slower (cold start), subsequent requests fast";
    } else if (coefficientOfVariation < 10) {
      infrastructureAssessment =
        "Consistent timing (low CV) — likely bare metal, dedicated server, or well-provisioned infrastructure";
    } else if (coefficientOfVariation < 30) {
      infrastructureAssessment =
        "Moderate variance — likely cloud VM or containerized deployment";
    } else {
      infrastructureAssessment =
        "High variance — shared hosting, heavily loaded server, or multi-region CDN with variable latency";
    }

    const result = {
      url,
      requestCount,
      successfulRequests: validTimings.length,
      timingsMs: timings,
      statistics: {
        meanMs: Math.round(mean * 100) / 100,
        stddevMs: Math.round(stddev * 100) / 100,
        minMs: min,
        maxMs: max,
        coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
      },
      coldStartAnalysis: {
        firstRequestMs: firstTiming,
        subsequentMeanMs: Math.round(restMean * 100) / 100,
        ratio: Math.round(coldStartRatio * 100) / 100,
        coldStartDetected,
      },
      intelligence: {
        infrastructureAssessment,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 13: http_server_timing
// ──────────────────────────────────────────────────────────────────────────────

const httpServerTiming: ToolDef = {
  name: "http_server_timing",
  description:
    "Server-Timing header intelligence. Parses Server-Timing for CDN layer information, " +
    "backend service names, cache architecture details. Reveals internal service topology " +
    "and processing pipeline stages.",
  schema: {
    url: z.string().url().describe("Target URL for Server-Timing header analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_server_timing:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });
      const serverTiming = res.headers.get("server-timing");

      if (!serverTiming) {
        const result = {
          url,
          serverTiming: null,
          analysis: "No Server-Timing header present",
        };
        cache.set(cacheKey, result);
        return json(result);
      }

      // Parse Server-Timing: metric-name;desc="description";dur=123.4, metric2;dur=56
      const metrics: {
        name: string;
        description: string | null;
        durationMs: number | null;
        raw: string;
      }[] = [];

      const entries = serverTiming.split(",").map((e) => e.trim());
      for (const entry of entries) {
        const parts = entry.split(";").map((p) => p.trim());
        const name = parts[0];
        let description: string | null = null;
        let durationMs: number | null = null;

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (part.startsWith("desc=")) {
            description = part.slice(5).replace(/^"|"$/g, "");
          } else if (part.startsWith("dur=")) {
            durationMs = parseFloat(part.slice(4));
          }
        }

        metrics.push({ name, description, durationMs, raw: entry });
      }

      // Intelligence extraction
      const serviceNames = metrics.map((m) => m.name);
      const totalDuration = metrics
        .filter((m) => m.durationMs !== null)
        .reduce((sum, m) => sum + (m.durationMs ?? 0), 0);

      // Detect CDN indicators
      const cdnIndicators: string[] = [];
      for (const m of metrics) {
        const lower = (m.name + " " + (m.description || "")).toLowerCase();
        if (lower.includes("cdn") || lower.includes("edge") || lower.includes("pop")) {
          cdnIndicators.push(`${m.name}: CDN/edge processing`);
        }
        if (lower.includes("cache") || lower.includes("hit") || lower.includes("miss")) {
          cdnIndicators.push(`${m.name}: Cache layer`);
        }
        if (lower.includes("origin") || lower.includes("backend") || lower.includes("upstream")) {
          cdnIndicators.push(`${m.name}: Origin/backend fetch`);
        }
        if (lower.includes("waf") || lower.includes("firewall") || lower.includes("security")) {
          cdnIndicators.push(`${m.name}: WAF/security processing`);
        }
        if (lower.includes("db") || lower.includes("database") || lower.includes("sql") || lower.includes("redis")) {
          cdnIndicators.push(`${m.name}: Database layer`);
        }
      }

      const result = {
        url,
        serverTiming,
        metrics,
        intelligence: {
          totalProcessingMs: Math.round(totalDuration * 100) / 100,
          serviceNames,
          cdnIndicators,
          internalTopology: cdnIndicators.length > 0
            ? "Server-Timing reveals internal processing pipeline and service names"
            : "No obvious infrastructure indicators in metric names",
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 14: http_resource_hints
// ──────────────────────────────────────────────────────────────────────────────

const httpResourceHints: ToolDef = {
  name: "http_resource_hints",
  description:
    "Resource hint analysis. Parses <link rel=\"preconnect\">, <link rel=\"dns-prefetch\">, " +
    "<link rel=\"preload\"> and Link HTTP headers. Maps third-party dependency graph and " +
    "identifies known services (Google Fonts, Stripe, Sentry, Auth0, Segment, etc.).",
  schema: {
    url: z.string().url().describe("Target URL for resource hint and third-party dependency analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_resource_hints:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });
      const html = await res.text();
      const linkHeader = res.headers.get("link");

      const $ = cheerio.load(html);

      const hints: {
        type: string;
        href: string;
        source: "html" | "header";
        domain: string | null;
        knownService: string | null;
        as?: string;
        crossorigin?: string;
      }[] = [];

      // Parse HTML link elements
      const hintTypes = ["preconnect", "dns-prefetch", "preload", "prefetch", "modulepreload"];
      for (const rel of hintTypes) {
        $(`link[rel="${rel}"]`).each((_i, el) => {
          const href = $(el).attr("href");
          if (!href) return;

          let domain: string | null = null;
          try {
            domain = new URL(href, url).hostname;
          } catch {
            // Relative URL or invalid
          }

          hints.push({
            type: rel,
            href,
            source: "html",
            domain,
            knownService: domain ? (KNOWN_SERVICES[domain] ?? null) : null,
            as: $(el).attr("as") || undefined,
            crossorigin: $(el).attr("crossorigin") || undefined,
          });
        });
      }

      // Parse Link HTTP header
      if (linkHeader) {
        const linkParts = linkHeader.split(",").map((p) => p.trim());
        for (const part of linkParts) {
          const urlMatch = part.match(/<([^>]+)>/);
          const relMatch = part.match(/rel="([^"]+)"/);
          if (urlMatch && relMatch) {
            const href = urlMatch[1];
            const rel = relMatch[1];

            let domain: string | null = null;
            try {
              domain = new URL(href, url).hostname;
            } catch {
              // Invalid URL
            }

            hints.push({
              type: rel,
              href,
              source: "header",
              domain,
              knownService: domain ? (KNOWN_SERVICES[domain] ?? null) : null,
            });
          }
        }
      }

      // Build dependency graph
      const thirdPartyDomains = [
        ...new Set(
          hints
            .filter((h) => h.domain && h.domain !== new URL(url).hostname)
            .map((h) => h.domain!),
        ),
      ];

      const identifiedServices = hints
        .filter((h) => h.knownService)
        .map((h) => ({
          service: h.knownService!,
          domain: h.domain!,
          hintType: h.type,
        }));

      // Deduplicate identified services by service name
      const uniqueServices = [
        ...new Map(identifiedServices.map((s) => [s.service, s])).values(),
      ];

      const result = {
        url,
        hints,
        dependencyGraph: {
          thirdPartyDomains,
          thirdPartyCount: thirdPartyDomains.length,
          identifiedServices: uniqueServices,
          unidentifiedDomains: thirdPartyDomains.filter(
            (d) => !KNOWN_SERVICES[d],
          ),
        },
        summary: {
          totalHints: hints.length,
          preconnect: hints.filter((h) => h.type === "preconnect").length,
          dnsPrefetch: hints.filter((h) => h.type === "dns-prefetch").length,
          preload: hints.filter((h) => h.type === "preload").length,
          prefetch: hints.filter((h) => h.type === "prefetch").length,
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 15: http_keepalive
// ──────────────────────────────────────────────────────────────────────────────

const httpKeepalive: ToolDef = {
  name: "http_keepalive",
  description:
    "Connection keep-alive behavior analysis. Measures server idle timeout, max requests " +
    "per connection (via Keep-Alive header parsing). Detects HTTP/2 behavior and connection " +
    "management strategies.",
  schema: {
    url: z.string().url().describe("Target URL for keep-alive behavior analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_keepalive:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      // Send request with Connection: keep-alive
      const res = await safeFetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Connection: "keep-alive",
        },
        redirect: "follow",
      });

      const connectionHeader = res.headers.get("connection");
      const keepAliveHeader = res.headers.get("keep-alive");
      const altSvc = res.headers.get("alt-svc");

      // Parse Keep-Alive header: timeout=5, max=100
      let timeout: number | null = null;
      let maxRequests: number | null = null;

      if (keepAliveHeader) {
        const timeoutMatch = keepAliveHeader.match(/timeout=(\d+)/i);
        const maxMatch = keepAliveHeader.match(/max=(\d+)/i);
        if (timeoutMatch) timeout = parseInt(timeoutMatch[1], 10);
        if (maxMatch) maxRequests = parseInt(maxMatch[1], 10);
      }

      await res.text().catch(() => {});

      // Also test with Connection: close
      let closeResponse: {
        connectionHeader: string | null;
        serverRespected: boolean;
      } | null = null;

      try {
        const closeRes = await safeFetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Connection: "close",
          },
          redirect: "follow",
        });
        const closeConn = closeRes.headers.get("connection");
        await closeRes.text().catch(() => {});
        closeResponse = {
          connectionHeader: closeConn,
          serverRespected: closeConn?.toLowerCase() === "close",
        };
      } catch {
        // Skip
      }

      // HTTP/2 detection from Alt-Svc
      let http2Indicators: string[] = [];
      if (altSvc) {
        if (altSvc.includes("h2")) http2Indicators.push("Alt-Svc advertises HTTP/2 (h2)");
        if (altSvc.includes("h3")) http2Indicators.push("Alt-Svc advertises HTTP/3 (h3/QUIC)");
      }

      let assessment: string;
      if (keepAliveHeader) {
        assessment = `Keep-Alive configured: timeout=${timeout ?? "unknown"}s, max=${maxRequests ?? "unknown"} requests`;
      } else if (connectionHeader?.toLowerCase() === "keep-alive") {
        assessment =
          "Server supports keep-alive but does not expose timeout/max parameters";
      } else if (connectionHeader?.toLowerCase() === "close") {
        assessment =
          "Server closes connections after each request — may be HTTP/1.0 compatible or behind a proxy that disables keep-alive";
      } else {
        assessment =
          "No explicit Connection header — default behavior applies (HTTP/1.1 defaults to keep-alive)";
      }

      const result = {
        url,
        connection: connectionHeader,
        keepAlive: {
          header: keepAliveHeader,
          timeout,
          maxRequests,
        },
        altSvc,
        http2Indicators,
        closeTest: closeResponse,
        assessment,
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 16: http_nel
// ──────────────────────────────────────────────────────────────────────────────

const httpNel: ToolDef = {
  name: "http_nel",
  description:
    "NEL (Network Error Logging), Report-To, Reporting-Endpoints, and Expect-CT header analysis. " +
    "Extracts monitoring provider information, CDN/security vendor confirmation from reporting " +
    "endpoints and error logging configuration.",
  schema: {
    url: z.string().url().describe("Target URL for NEL / reporting header analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_nel:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    try {
      const res = await safeFetch(url, { redirect: "follow" });

      const nel = res.headers.get("nel");
      const reportTo = res.headers.get("report-to");
      const reportingEndpoints = res.headers.get("reporting-endpoints");
      const expectCt = res.headers.get("expect-ct");

      const analysis: {
        nel: any;
        reportTo: any;
        reportingEndpoints: any;
        expectCt: any;
        providers: string[];
        endpoints: string[];
      } = {
        nel: null,
        reportTo: null,
        reportingEndpoints: null,
        expectCt: null,
        providers: [],
        endpoints: [],
      };

      // Parse NEL header (JSON)
      if (nel) {
        try {
          analysis.nel = JSON.parse(nel);
        } catch {
          analysis.nel = { raw: nel, parseError: true };
        }
      }

      // Parse Report-To header (JSON, may be array)
      if (reportTo) {
        try {
          // Report-To can be multiple JSON objects separated by commas
          // Each object is a separate group
          const groups = reportTo.split(/(?<=\})\s*,\s*(?=\{)/).map((g) => {
            try {
              return JSON.parse(g.trim());
            } catch {
              return { raw: g.trim(), parseError: true };
            }
          });
          analysis.reportTo = groups;

          // Extract endpoint URLs
          for (const group of groups) {
            if (group.endpoints && Array.isArray(group.endpoints)) {
              for (const ep of group.endpoints) {
                if (ep.url) {
                  analysis.endpoints.push(ep.url);
                  try {
                    const domain = new URL(ep.url).hostname;
                    if (domain.includes("cloudflare")) analysis.providers.push("Cloudflare");
                    else if (domain.includes("sentry")) analysis.providers.push("Sentry");
                    else if (domain.includes("report-uri")) analysis.providers.push("Report URI");
                    else if (domain.includes("datadog")) analysis.providers.push("Datadog");
                    else if (domain.includes("newrelic")) analysis.providers.push("New Relic");
                    else analysis.providers.push(domain);
                  } catch {
                    // Invalid URL
                  }
                }
              }
            }
          }
        } catch {
          analysis.reportTo = { raw: reportTo, parseError: true };
        }
      }

      // Parse Reporting-Endpoints header (key=value pairs)
      if (reportingEndpoints) {
        const endpoints: Record<string, string> = {};
        const parts = reportingEndpoints.split(",").map((p) => p.trim());
        for (const part of parts) {
          const eqIdx = part.indexOf("=");
          if (eqIdx > 0) {
            const key = part.slice(0, eqIdx).trim();
            const value = part.slice(eqIdx + 1).trim().replace(/^"|"$/g, "");
            endpoints[key] = value;
            analysis.endpoints.push(value);

            try {
              const domain = new URL(value).hostname;
              if (domain.includes("cloudflare")) analysis.providers.push("Cloudflare");
              else if (domain.includes("sentry")) analysis.providers.push("Sentry");
              else if (domain.includes("report-uri")) analysis.providers.push("Report URI");
              else if (domain.includes("datadog")) analysis.providers.push("Datadog");
              else analysis.providers.push(domain);
            } catch {
              // Invalid URL
            }
          }
        }
        analysis.reportingEndpoints = endpoints;
      }

      // Parse Expect-CT header
      if (expectCt) {
        const parts: Record<string, string | boolean> = {};
        for (const part of expectCt.split(",").map((p) => p.trim())) {
          if (part.startsWith("max-age=")) {
            parts["max-age"] = part.split("=")[1];
          } else if (part.startsWith("report-uri=")) {
            const uri = part.split("=").slice(1).join("=").replace(/^"|"$/g, "");
            parts["report-uri"] = uri;
            analysis.endpoints.push(uri);
          } else if (part === "enforce") {
            parts.enforce = true;
          }
        }
        analysis.expectCt = parts;
      }

      // Deduplicate providers
      analysis.providers = [...new Set(analysis.providers)];
      analysis.endpoints = [...new Set(analysis.endpoints)];

      const hasReporting =
        nel !== null ||
        reportTo !== null ||
        reportingEndpoints !== null ||
        expectCt !== null;

      const result = {
        url,
        headers: {
          nel: nel ?? null,
          reportTo: reportTo ?? null,
          reportingEndpoints: reportingEndpoints ?? null,
          expectCt: expectCt ?? null,
        },
        analysis,
        summary: {
          reportingConfigured: hasReporting,
          monitoringProviders: analysis.providers,
          reportingEndpoints: analysis.endpoints,
          insight: hasReporting
            ? `Reporting configured — monitored by: ${analysis.providers.join(", ") || "unknown provider"}`
            : "No NEL/Report-To/Reporting-Endpoints/Expect-CT headers present",
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err: any) {
      return json({ url, error: err.message });
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Tool 17: http_redirect
// ──────────────────────────────────────────────────────────────────────────────

const httpRedirect: ToolDef = {
  name: "http_redirect",
  description:
    "Full redirect chain analysis. Follows all 3xx responses manually (no auto-follow). " +
    "Maps complete redirection path. Detects CDN redirect patterns, WAF challenge redirects, " +
    "and authentication redirects. Extracts intermediate servers from Via/Server headers at each hop.",
  schema: {
    url: z.string().url().describe("Target URL for redirect chain analysis"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const url = args.url as string;
    const cacheKey = `http_redirect:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const chain: {
      step: number;
      url: string;
      status: number;
      statusText: string;
      location: string | null;
      serverHeader: string | null;
      viaHeader: string | null;
      setCookies: string[];
      headers: Record<string, string>;
      pattern?: string;
    }[] = [];

    let currentUrl = url;
    const maxRedirects = 20;
    const visitedUrls = new Set<string>();

    for (let step = 0; step < maxRedirects; step++) {
      if (visitedUrls.has(currentUrl)) {
        chain.push({
          step,
          url: currentUrl,
          status: 0,
          statusText: "REDIRECT LOOP DETECTED",
          location: null,
          serverHeader: null,
          viaHeader: null,
          setCookies: [],
          headers: {},
          pattern: "redirect-loop",
        });
        break;
      }
      visitedUrls.add(currentUrl);

      try {
        const res = await safeFetch(currentUrl, { redirect: "manual" });

        const location = res.headers.get("location");
        const serverHeader = res.headers.get("server");
        const viaHeader = res.headers.get("via");

        // Collect Set-Cookie headers
        const setCookies: string[] = [];
        res.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            setCookies.push(value);
          }
        });
        if (setCookies.length === 0) {
          const raw = res.headers.get("set-cookie");
          if (raw) setCookies.push(raw);
        }

        // Collect interesting headers
        const interestingHeaders: Record<string, string> = {};
        const headerNames = [
          "server", "via", "x-powered-by", "x-forwarded-for",
          "cf-ray", "x-cache", "x-amz-cf-id", "x-served-by",
        ];
        for (const h of headerNames) {
          const val = res.headers.get(h);
          if (val) interestingHeaders[h] = val;
        }

        // Detect redirect patterns
        let pattern: string | undefined;
        if (res.status === 301) pattern = "permanent-redirect";
        else if (res.status === 302) pattern = "temporary-redirect";
        else if (res.status === 303) pattern = "see-other";
        else if (res.status === 307) pattern = "temporary-redirect-preserving-method";
        else if (res.status === 308) pattern = "permanent-redirect-preserving-method";

        // Detect specific redirect patterns
        if (location) {
          if (location.includes("/login") || location.includes("/auth") || location.includes("/signin")) {
            pattern = "authentication-redirect";
          } else if (location.includes("challenge") || location.includes("captcha")) {
            pattern = "waf-challenge-redirect";
          } else if (
            location.startsWith("https://") &&
            currentUrl.startsWith("http://") &&
            new URL(location).hostname === new URL(currentUrl).hostname
          ) {
            pattern = "http-to-https-upgrade";
          } else if (
            location.includes("www.") && !currentUrl.includes("www.")
          ) {
            pattern = "www-redirect";
          } else if (
            !location.includes("www.") && currentUrl.includes("www.")
          ) {
            pattern = "www-to-bare-redirect";
          }
        }

        await res.text().catch(() => {});

        chain.push({
          step,
          url: currentUrl,
          status: res.status,
          statusText: res.statusText,
          location,
          serverHeader,
          viaHeader,
          setCookies,
          headers: interestingHeaders,
          pattern,
        });

        // Follow redirect
        if (res.status >= 300 && res.status < 400 && location) {
          try {
            currentUrl = new URL(location, currentUrl).toString();
          } catch {
            // Invalid location header
            break;
          }
        } else {
          // Not a redirect — we've reached the final destination
          break;
        }
      } catch (err: any) {
        chain.push({
          step,
          url: currentUrl,
          status: 0,
          statusText: err.message,
          location: null,
          serverHeader: null,
          viaHeader: null,
          setCookies: [],
          headers: {},
          pattern: "error",
        });
        break;
      }
    }

    // Analyze the chain
    const redirectCount = chain.filter(
      (c) => c.status >= 300 && c.status < 400,
    ).length;
    const finalHop = chain[chain.length - 1];
    const intermediateServers = [
      ...new Set(chain.map((c) => c.serverHeader).filter(Boolean)),
    ] as string[];
    const viaChain = [
      ...new Set(chain.map((c) => c.viaHeader).filter(Boolean)),
    ] as string[];

    const patterns = [
      ...new Set(chain.map((c) => c.pattern).filter(Boolean)),
    ] as string[];

    const hostsInChain = [
      ...new Set(
        chain.map((c) => {
          try {
            return new URL(c.url).hostname;
          } catch {
            return null;
          }
        }).filter(Boolean),
      ),
    ] as string[];

    const result = {
      url,
      chain,
      summary: {
        totalHops: chain.length,
        redirectCount,
        finalUrl: finalHop?.url ?? url,
        finalStatus: finalHop?.status ?? 0,
        intermediateServers,
        viaChain,
        redirectPatterns: patterns,
        hostsInChain,
        crossDomain: hostsInChain.length > 1,
        hasLoop: chain.some((c) => c.pattern === "redirect-loop"),
        excessiveRedirects: redirectCount > 5,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Export All HTTP Tools
// ──────────────────────────────────────────────────────────────────────────────

export const httpTools: ToolDef[] = [
  httpHeaders,
  httpMultiFingerprint,
  httpFavicon,
  httpEtag,
  httpErrors,
  httpCookies,
  httpMethods,
  httpCors,
  httpCompression,
  httpCache,
  httpSecurity,
  httpTiming,
  httpServerTiming,
  httpResourceHints,
  httpKeepalive,
  httpNel,
  httpRedirect,
];
