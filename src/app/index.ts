import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import * as cheerio from "cheerio";
import { APP_SIGNATURES, type AppSignature } from "../data/app-signatures.js";

// ─── Module-Level Setup ───

const limiter = new RateLimiter(300);
const cache = new TTLCache<any>(300_000);

const REQUEST_TIMEOUT = 10_000;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Helpers ───

async function safeFetch(
  url: string,
  options?: RequestInit,
): Promise<{ status: number; headers: Headers; body: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, ...(options?.headers as Record<string, string> ?? {}) },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      ...options,
    });
    const body = await res.text();
    return { status: res.status, headers: res.headers, body };
  } catch {
    return null;
  }
}

function parseCookieNames(headers: Headers): string[] {
  const names: string[] = [];
  const setCookie = headers.getSetCookie?.() ?? [];
  for (const raw of setCookie) {
    const name = raw.split("=")[0]?.trim();
    if (name) names.push(name);
  }
  return names;
}

function matchPatterns(
  text: string,
  patterns: string[],
): { matched: string[]; details: string[] } {
  const matched: string[] = [];
  const details: string[] = [];
  for (const pattern of patterns) {
    const re = new RegExp(pattern, "i");
    const m = text.match(re);
    if (m) {
      matched.push(pattern);
      details.push(m[0]);
    }
  }
  return { matched, details };
}

// ─── Tool 1: app_cms ───

async function appCms(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const cacheKey = `app_cms:${url}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const response = await safeFetch(url);
  if (!response) {
    return json({ url, error: "Failed to fetch URL", detections: [] });
  }

  const { body, headers } = response;
  const $ = cheerio.load(body);

  const cmsSignatures = APP_SIGNATURES.filter((s) => s.category === "cms");
  const detections: {
    name: string;
    confidence: number;
    signals: string[];
    version: string | null;
  }[] = [];

  for (const sig of cmsSignatures) {
    const signals: string[] = [];
    let totalChecks = 0;
    let matchedChecks = 0;

    // 1. Meta generator tag
    if (sig.detection.meta && sig.detection.meta.length > 0) {
      totalChecks++;
      for (const pattern of sig.detection.meta) {
        const re = new RegExp(pattern, "i");
        if (re.test(body)) {
          matchedChecks++;
          signals.push(`Meta generator: ${pattern}`);
          break;
        }
      }
    }

    // 2. Path patterns in HTML source
    if (sig.detection.paths && sig.detection.paths.length > 0) {
      totalChecks++;
      const foundPaths: string[] = [];
      for (const path of sig.detection.paths) {
        if (body.includes(path)) {
          foundPaths.push(path);
        }
      }
      if (foundPaths.length > 0) {
        matchedChecks++;
        signals.push(`Paths found: ${foundPaths.join(", ")}`);
      }
    }

    // 3. Script patterns
    if (sig.detection.scripts && sig.detection.scripts.length > 0) {
      totalChecks++;
      const foundScripts: string[] = [];
      for (const pattern of sig.detection.scripts) {
        const re = new RegExp(pattern, "i");
        if (re.test(body)) {
          foundScripts.push(pattern);
        }
      }
      if (foundScripts.length > 0) {
        matchedChecks++;
        signals.push(`Script patterns: ${foundScripts.join(", ")}`);
      }
    }

    // 4. JS globals in HTML
    if (sig.detection.globals && sig.detection.globals.length > 0) {
      totalChecks++;
      const foundGlobals: string[] = [];
      for (const global of sig.detection.globals) {
        if (body.includes(global)) {
          foundGlobals.push(global);
        }
      }
      if (foundGlobals.length > 0) {
        matchedChecks++;
        signals.push(`JS globals: ${foundGlobals.join(", ")}`);
      }
    }

    // 5. Cookie names
    if (sig.detection.cookies && sig.detection.cookies.length > 0) {
      totalChecks++;
      const cookieNames = parseCookieNames(headers);
      const matchedCookies: string[] = [];
      for (const pattern of sig.detection.cookies) {
        const re = new RegExp(pattern, "i");
        for (const name of cookieNames) {
          if (re.test(name)) {
            matchedCookies.push(name);
          }
        }
      }
      if (matchedCookies.length > 0) {
        matchedChecks++;
        signals.push(`Cookies: ${matchedCookies.join(", ")}`);
      }
    }

    // 6. HTTP headers
    if (sig.detection.headers && Object.keys(sig.detection.headers).length > 0) {
      totalChecks++;
      const matchedHeaders: string[] = [];
      for (const [header, pattern] of Object.entries(sig.detection.headers)) {
        const value = headers.get(header);
        if (value) {
          const re = new RegExp(pattern, "i");
          if (re.test(value)) {
            matchedHeaders.push(`${header}: ${value}`);
          }
        }
      }
      if (matchedHeaders.length > 0) {
        matchedChecks++;
        signals.push(`Headers: ${matchedHeaders.join(", ")}`);
      }
    }

    // 7. Body content patterns
    if (sig.detection.body && sig.detection.body.length > 0) {
      totalChecks++;
      const foundBody: string[] = [];
      for (const pattern of sig.detection.body) {
        const re = new RegExp(pattern, "i");
        if (re.test(body)) {
          foundBody.push(pattern);
        }
      }
      if (foundBody.length > 0) {
        matchedChecks++;
        signals.push(`Body patterns: ${foundBody.join(", ")}`);
      }
    }

    if (matchedChecks > 0 && totalChecks > 0) {
      const confidence = Math.round((matchedChecks / totalChecks) * 100);

      // Version detection
      let version: string | null = null;
      if (sig.versionDetection) {
        const re = new RegExp(sig.versionDetection.pattern, "i");
        const m = body.match(re);
        if (m && m[1]) {
          version = m[1];
        }
      }

      detections.push({
        name: sig.name,
        confidence,
        signals,
        version,
      });
    }
  }

  // Also check admin path accessibility for top candidates
  const adminPaths: Record<string, string[]> = {
    WordPress: ["/wp-admin/", "/wp-login.php"],
    Drupal: ["/user/login"],
    Joomla: ["/administrator/"],
    Ghost: ["/ghost/"],
  };

  const adminResults: Record<string, { path: string; status: number }[]> = {};

  for (const detection of detections.slice(0, 3)) {
    const paths = adminPaths[detection.name];
    if (!paths) continue;

    const results: { path: string; status: number }[] = [];
    for (const path of paths) {
      try {
        const baseUrl = new URL(url);
        const adminUrl = `${baseUrl.origin}${path}`;
        const res = await safeFetch(adminUrl, { method: "HEAD" });
        if (res) {
          results.push({ path, status: res.status });
        }
      } catch {
        // skip
      }
    }
    if (results.length > 0) {
      adminResults[detection.name] = results;
    }
  }

  // Sort by confidence
  detections.sort((a, b) => b.confidence - a.confidence);

  const result = {
    url,
    detections,
    adminPathChecks: Object.keys(adminResults).length > 0 ? adminResults : undefined,
    bestMatch: detections.length > 0 ? detections[0] : null,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 2: app_ecommerce ───

async function appEcommerce(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const cacheKey = `app_ecommerce:${url}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const response = await safeFetch(url);
  if (!response) {
    return json({ url, error: "Failed to fetch URL", detections: [] });
  }

  const { body, headers } = response;
  const $ = cheerio.load(body);

  const ecomSignatures = APP_SIGNATURES.filter((s) => s.category === "ecommerce");
  const detections: {
    name: string;
    confidence: number;
    signals: string[];
    version: string | null;
  }[] = [];

  for (const sig of ecomSignatures) {
    const signals: string[] = [];
    let totalChecks = 0;
    let matchedChecks = 0;

    // 1. Meta tags
    if (sig.detection.meta && sig.detection.meta.length > 0) {
      totalChecks++;
      for (const pattern of sig.detection.meta) {
        if (new RegExp(pattern, "i").test(body)) {
          matchedChecks++;
          signals.push(`Meta tag match: ${pattern}`);
          break;
        }
      }
    }

    // 2. CDN / script patterns (definitive for some platforms)
    if (sig.detection.scripts && sig.detection.scripts.length > 0) {
      totalChecks++;
      const found: string[] = [];
      for (const pattern of sig.detection.scripts) {
        if (new RegExp(pattern, "i").test(body)) {
          found.push(pattern);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Script/CDN: ${found.join(", ")}`);
      }
    }

    // 3. Path patterns
    if (sig.detection.paths && sig.detection.paths.length > 0) {
      totalChecks++;
      const found: string[] = [];
      for (const path of sig.detection.paths) {
        if (body.includes(path)) {
          found.push(path);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Path patterns: ${found.join(", ")}`);
      }
    }

    // 4. JS globals
    if (sig.detection.globals && sig.detection.globals.length > 0) {
      totalChecks++;
      const found: string[] = [];
      for (const global of sig.detection.globals) {
        if (body.includes(global)) {
          found.push(global);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`JS globals: ${found.join(", ")}`);
      }
    }

    // 5. Cookies
    if (sig.detection.cookies && sig.detection.cookies.length > 0) {
      totalChecks++;
      const cookieNames = parseCookieNames(headers);
      const found: string[] = [];
      for (const pattern of sig.detection.cookies) {
        for (const name of cookieNames) {
          if (new RegExp(pattern, "i").test(name)) {
            found.push(name);
          }
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Cookies: ${found.join(", ")}`);
      }
    }

    // 6. HTTP headers
    if (sig.detection.headers && Object.keys(sig.detection.headers).length > 0) {
      totalChecks++;
      const found: string[] = [];
      for (const [header, pattern] of Object.entries(sig.detection.headers)) {
        const value = headers.get(header);
        if (value && new RegExp(pattern, "i").test(value)) {
          found.push(`${header}: ${value}`);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Headers: ${found.join(", ")}`);
      }
    }

    // 7. Body content
    if (sig.detection.body && sig.detection.body.length > 0) {
      totalChecks++;
      const found: string[] = [];
      for (const pattern of sig.detection.body) {
        if (new RegExp(pattern, "i").test(body)) {
          found.push(pattern);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Body: ${found.join(", ")}`);
      }
    }

    if (matchedChecks > 0 && totalChecks > 0) {
      const confidence = Math.round((matchedChecks / totalChecks) * 100);

      let version: string | null = null;
      if (sig.versionDetection) {
        const m = body.match(new RegExp(sig.versionDetection.pattern, "i"));
        if (m && m[1]) version = m[1];
      }

      detections.push({ name: sig.name, confidence, signals, version });
    }
  }

  // Payment provider detection (inline)
  const paymentProviders: { provider: string; signal: string }[] = [];
  const paymentChecks: [RegExp, string][] = [
    [/js\.stripe\.com|Stripe\(/i, "Stripe"],
    [/paypal\.com\/sdk|PayPal/i, "PayPal"],
    [/square\.com|squareup\.com/i, "Square"],
    [/braintree/i, "Braintree"],
    [/klarna/i, "Klarna"],
    [/afterpay|clearpay/i, "Afterpay/Clearpay"],
    [/affirm/i, "Affirm"],
    [/razorpay/i, "Razorpay"],
    [/adyen/i, "Adyen"],
    [/shopPay|shop-pay/i, "Shop Pay"],
    [/apple-pay|ApplePaySession/i, "Apple Pay"],
    [/google-pay|GooglePayButton/i, "Google Pay"],
  ];

  for (const [pattern, provider] of paymentChecks) {
    const m = body.match(pattern);
    if (m) {
      paymentProviders.push({ provider, signal: m[0] });
    }
  }

  detections.sort((a, b) => b.confidence - a.confidence);

  const result = {
    url,
    detections,
    paymentProviders: paymentProviders.length > 0 ? paymentProviders : undefined,
    bestMatch: detections.length > 0 ? detections[0] : null,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 3: app_framework ───

async function appFramework(
  args: Record<string, unknown>,
  _ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const cacheKey = `app_framework:${url}`;

  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const baseUrl = new URL(url);
  const frameworkSignatures = APP_SIGNATURES.filter((s) => s.category === "framework");

  const detections: {
    name: string;
    confidence: number;
    signals: string[];
  }[] = [];

  // 1. Trigger error response on nonexistent path
  const errorUrl = `${baseUrl.origin}/nonexistent-path-fp-${Date.now()}`;
  const errorResponse = await safeFetch(errorUrl);

  // 2. Fetch the main page for header/cookie analysis
  const mainResponse = await safeFetch(url);

  // 3. Trailing slash behavior test
  let trailingSlashBehavior: string | null = null;
  try {
    const noSlashUrl = `${baseUrl.origin}/test-trailing-slash-fp`;
    const withSlashUrl = `${baseUrl.origin}/test-trailing-slash-fp/`;

    const [noSlash, withSlash] = await Promise.all([
      safeFetch(noSlashUrl, { redirect: "manual" }),
      safeFetch(withSlashUrl, { redirect: "manual" }),
    ]);

    if (noSlash && withSlash) {
      if (noSlash.status === 301 || noSlash.status === 302) {
        const location = noSlash.headers.get("location");
        if (location && location.endsWith("/")) {
          trailingSlashBehavior = "redirects_to_slash (Django/Rails-like)";
        }
      } else if (noSlash.status !== withSlash.status) {
        trailingSlashBehavior = `different_status: ${noSlash.status} vs ${withSlash.status}`;
      } else {
        trailingSlashBehavior = "same_response";
      }
    }
  } catch {
    // skip
  }

  // 4. Content negotiation test
  let xmlNegotiation: string | null = null;
  try {
    const xmlResponse = await safeFetch(errorUrl, {
      headers: { Accept: "application/xml", "User-Agent": USER_AGENT },
    });
    if (xmlResponse) {
      const ct = xmlResponse.headers.get("content-type") ?? "";
      if (ct.includes("xml")) {
        xmlNegotiation = "supports_xml (Spring/ASP.NET-like)";
      } else if (ct.includes("json")) {
        xmlNegotiation = "json_only";
      } else {
        xmlNegotiation = `returns: ${ct}`;
      }
    }
  } catch {
    // skip
  }

  for (const sig of frameworkSignatures) {
    const signals: string[] = [];
    let totalChecks = 0;
    let matchedChecks = 0;

    // Error response format matching
    if (sig.detection.errorFormat && errorResponse) {
      totalChecks++;
      const re = new RegExp(sig.detection.errorFormat, "is");
      if (re.test(errorResponse.body)) {
        matchedChecks++;
        signals.push(`Error format matches ${sig.name}`);
      }
    }

    // Header patterns from error response
    if (sig.detection.headers && Object.keys(sig.detection.headers).length > 0 && errorResponse) {
      totalChecks++;
      const found: string[] = [];
      for (const [header, pattern] of Object.entries(sig.detection.headers)) {
        const value = errorResponse.headers.get(header);
        if (value && new RegExp(pattern, "i").test(value)) {
          found.push(`${header}: ${value}`);
        }
      }
      // Also check main response headers
      if (mainResponse) {
        for (const [header, pattern] of Object.entries(sig.detection.headers)) {
          const value = mainResponse.headers.get(header);
          if (value && new RegExp(pattern, "i").test(value)) {
            const entry = `${header}: ${value}`;
            if (!found.includes(entry)) found.push(entry);
          }
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Headers: ${found.join(", ")}`);
      }
    }

    // Cookie patterns from main response
    if (sig.detection.cookies && sig.detection.cookies.length > 0 && mainResponse) {
      totalChecks++;
      const cookieNames = parseCookieNames(mainResponse.headers);
      const found: string[] = [];
      for (const pattern of sig.detection.cookies) {
        for (const name of cookieNames) {
          if (new RegExp(pattern, "i").test(name)) {
            found.push(name);
          }
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Cookies: ${found.join(", ")}`);
      }
    }

    // Body content patterns from main response
    if (sig.detection.body && sig.detection.body.length > 0 && mainResponse) {
      totalChecks++;
      const found: string[] = [];
      for (const pattern of sig.detection.body) {
        if (new RegExp(pattern, "i").test(mainResponse.body)) {
          found.push(pattern);
        }
      }
      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Body patterns: ${found.join(", ")}`);
      }
    }

    // Path-based detection: probe known framework paths
    if (sig.detection.paths && sig.detection.paths.length > 0) {
      totalChecks++;
      const found: string[] = [];

      // Check if body references these paths
      for (const path of sig.detection.paths) {
        if (mainResponse && mainResponse.body.includes(path)) {
          found.push(`${path} (referenced)`);
        }
      }

      // Probe up to 2 characteristic paths
      for (const path of sig.detection.paths.slice(0, 2)) {
        try {
          const probeUrl = `${baseUrl.origin}${path}`;
          const res = await safeFetch(probeUrl, { method: "HEAD" });
          if (res && res.status >= 200 && res.status < 404) {
            found.push(`${path} (status ${res.status})`);
          }
        } catch {
          // skip
        }
      }

      if (found.length > 0) {
        matchedChecks++;
        signals.push(`Paths: ${found.join(", ")}`);
      }
    }

    if (matchedChecks > 0 && totalChecks > 0) {
      const confidence = Math.round((matchedChecks / totalChecks) * 100);
      detections.push({ name: sig.name, confidence, signals });
    }
  }

  detections.sort((a, b) => b.confidence - a.confidence);

  const result = {
    url,
    detections,
    errorResponse: errorResponse
      ? {
          status: errorResponse.status,
          contentType: errorResponse.headers.get("content-type"),
          bodySnippet: errorResponse.body.slice(0, 500),
          server: errorResponse.headers.get("server"),
          poweredBy: errorResponse.headers.get("x-powered-by"),
        }
      : null,
    trailingSlashBehavior,
    xmlNegotiation,
    bestMatch: detections.length > 0 ? detections[0] : null,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool Definitions ───

export const appTools: ToolDef[] = [
  {
    name: "app_cms",
    description:
      "CMS detection via multi-signal analysis. Checks meta generator tags, path patterns (wp-content, sites/default/files, etc.), JS globals, cookie names, HTTP headers, and body content to identify WordPress, Drupal, Joomla, Ghost, TYPO3, Hugo, Gatsby, Jekyll, Hexo, Webflow, Squarespace, Wix, and more. Returns confidence scores and optional version detection.",
    schema: {
      url: z.string().url().describe("URL to detect CMS"),
    },
    execute: appCms,
  },
  {
    name: "app_ecommerce",
    description:
      "E-commerce platform detection. Analyzes CDN patterns (cdn.shopify.com), script patterns, cookie names, URL paths, meta tags, HTTP headers, and payment provider integration to identify Shopify, WooCommerce, Magento, BigCommerce, PrestaShop, OpenCart, Squarespace, Wix, and more. Also detects payment providers (Stripe, PayPal, Square, etc.).",
    schema: {
      url: z.string().url().describe("URL to detect e-commerce platform"),
    },
    execute: appEcommerce,
  },
  {
    name: "app_framework",
    description:
      "Backend framework fingerprint via error response, path, and header analysis. Triggers errors by requesting nonexistent paths and analyzes the error format (RFC 7807 for Spring Boot, Whitelabel Error Page, Werkzeug debugger, Whoops for Laravel, 'Cannot GET' for Express, etc.). Also tests trailing slash redirect behavior, content negotiation, and header patterns. Covers Spring Boot, Django, FastAPI, Flask, Laravel, Rails, Express, Koa, Gin, Fiber, ASP.NET, and more.",
    schema: {
      url: z.string().url().describe("URL to fingerprint backend framework"),
    },
    execute: appFramework,
  },
];
