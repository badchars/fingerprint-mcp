import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { json } from "../types/index.js";
import * as dns from "node:dns/promises";
import { CLOUD_PATTERNS } from "../data/cloud-ranges.js";
import {
  HEADER_ORDER_SIGNATURES,
  computeHeaderOrderHash,
} from "../data/header-order.js";
import { COOKIE_PATTERNS } from "../data/cookie-patterns.js";

// ─── Module-Level Setup ───

const limiter = new RateLimiter(300);
const cache = new TTLCache<unknown>(600_000);

// ─── POP Code → City Map ───

const POP_CODES: Record<string, string> = {
  IAD: "Washington DC, US",
  LAX: "Los Angeles, US",
  LHR: "London, UK",
  FRA: "Frankfurt, DE",
  NRT: "Tokyo, JP",
  SIN: "Singapore, SG",
  SYD: "Sydney, AU",
  AMS: "Amsterdam, NL",
  CDG: "Paris, FR",
  ORD: "Chicago, US",
  DFW: "Dallas, US",
  SEA: "Seattle, US",
  SFO: "San Francisco, US",
  ATL: "Atlanta, US",
  MIA: "Miami, US",
  JFK: "New York, US",
  EWR: "Newark, US",
  YYZ: "Toronto, CA",
  GRU: "Sao Paulo, BR",
  BOM: "Mumbai, IN",
  DEL: "Delhi, IN",
  HKG: "Hong Kong, HK",
  ICN: "Seoul, KR",
  MAD: "Madrid, ES",
  MXP: "Milan, IT",
  WAW: "Warsaw, PL",
  ARN: "Stockholm, SE",
  HEL: "Helsinki, FI",
  DUB: "Dublin, IE",
  ZRH: "Zurich, CH",
};

// ─── Helpers ───

async function resolveToIp(target: string): Promise<string> {
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipRegex.test(target)) return target;
  try {
    const addrs = await dns.resolve4(target);
    return addrs[0] ?? target;
  } catch {
    return target;
  }
}

async function safeFetch(
  url: string,
  timeoutMs = 10000,
): Promise<Response | null> {
  try {
    return await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
  } catch {
    return null;
  }
}

function reverseIpOctets(ip: string): string {
  return ip.split(".").reverse().join(".");
}

function decodeBigIpCookie(
  cookieValue: string,
): { ip: string; port: number } | null {
  const parts = cookieValue.split(".");
  if (parts.length < 2) return null;
  const ipEncoded = parseInt(parts[0], 10);
  const portEncoded = parseInt(parts[1], 10);
  if (isNaN(ipEncoded) || isNaN(portEncoded)) return null;
  const ip = [
    ipEncoded & 0xff,
    (ipEncoded >> 8) & 0xff,
    (ipEncoded >> 16) & 0xff,
    (ipEncoded >> 24) & 0xff,
  ].join(".");
  const portHex = portEncoded.toString(16).padStart(4, "0");
  const port = parseInt(portHex.slice(2, 4) + portHex.slice(0, 2), 16);
  return { ip, port };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Tools ───

export const infraTools: ToolDef[] = [
  // ══════════════════════════════════════════════════
  // Tool 1: infra_cloud_detect
  // ══════════════════════════════════════════════════
  {
    name: "infra_cloud_detect",
    description:
      "Comprehensive cloud provider detection from multiple signals including ASN, reverse DNS, HTTP headers, and service-specific identifiers. Returns provider name, matched signals, detected sub-services, and confidence score.",
    schema: {
      target: z
        .string()
        .describe("IP address or domain to identify cloud provider"),
      checkHeaders: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Also check HTTP response headers (default: true)",
        ),
    },
    execute: async (args) => {
      try {
        await limiter.acquire();

        const target = args.target as string;
        const checkHeaders = (args.checkHeaders as boolean) ?? true;
        const cacheKey = `cloud_detect:${target}:${checkHeaders}`;
        const cached = cache.get(cacheKey);
        if (cached) return json(cached);

        // 1. Resolve target to IP
        const ip = await resolveToIp(target);

        // 2. Get PTR record (reverse DNS)
        let ptr: string[] = [];
        try {
          ptr = await dns.reverse(ip);
        } catch {
          /* no PTR */
        }

        // 3. Get ASN info from HackerTarget
        let asnNumber = "";
        let asnOrg = "";
        let asnPrefixes = "";
        try {
          const htResp = await safeFetch(
            `https://api.hackertarget.com/aslookup/?q=${ip}`,
          );
          if (htResp && htResp.ok) {
            const text = await htResp.text();
            // Format: "ip,asn_number,org_name" (may have multiple lines)
            const lines = text.trim().split("\n");
            if (lines.length > 0) {
              const parts = lines[0].split(",");
              if (parts.length >= 3) {
                asnNumber = parts[1]?.trim() ?? "";
                asnOrg = parts.slice(2).join(",").trim();
              }
            }
          }
        } catch {
          /* HackerTarget unavailable */
        }

        // 4. Team Cymru DNS lookup
        const reversedIp = reverseIpOctets(ip);
        let cymruAsn = "";
        let cymruPrefix = "";
        let cymruCC = "";
        let cymruRegistry = "";
        let cymruAllocated = "";
        try {
          const txtRecords = await dns.resolveTxt(
            `${reversedIp}.origin.asn.cymru.com`,
          );
          if (txtRecords.length > 0) {
            // Format: "ASN | Prefix | CC | Registry | Allocated"
            const record = txtRecords[0].join("");
            const parts = record.split("|").map((p) => p.trim());
            cymruAsn = parts[0] ?? "";
            cymruPrefix = parts[1] ?? "";
            cymruCC = parts[2] ?? "";
            cymruRegistry = parts[3] ?? "";
            cymruAllocated = parts[4] ?? "";
          }
        } catch {
          /* Cymru DNS unavailable */
        }

        // Use Cymru ASN if HackerTarget didn't return one
        const effectiveAsn = asnNumber || cymruAsn;
        const asnFormatted = effectiveAsn.startsWith("AS")
          ? effectiveAsn
          : `AS${effectiveAsn}`;

        // 5. Match against CLOUD_PATTERNS
        const matchedSignals: string[] = [];
        const detectedServices: string[] = [];
        let cloudProvider: string | null = null;
        let bestMatchScore = 0;

        // Fetch headers if needed
        let httpHeaders: Record<string, string> = {};
        let httpsHeaders: Record<string, string> = {};
        if (checkHeaders) {
          const host = target.replace(/^https?:\/\//, "").split("/")[0];
          const [httpResp, httpsResp] = await Promise.all([
            safeFetch(`http://${host}/`),
            safeFetch(`https://${host}/`),
          ]);
          if (httpResp) {
            httpResp.headers.forEach((v, k) => {
              httpHeaders[k.toLowerCase()] = v;
            });
          }
          if (httpsResp) {
            httpsResp.headers.forEach((v, k) => {
              httpsHeaders[k.toLowerCase()] = v;
            });
          }
        }

        const allHeaders = { ...httpHeaders, ...httpsHeaders };

        for (const pattern of CLOUD_PATTERNS) {
          let score = 0;
          const signals: string[] = [];
          const services: string[] = [];

          // Check ASN match
          if (
            effectiveAsn &&
            pattern.asn.some(
              (a) =>
                a === asnFormatted ||
                a === `AS${effectiveAsn}` ||
                a === effectiveAsn,
            )
          ) {
            score += 3;
            signals.push(`ASN match: ${asnFormatted}`);
          }

          // Check PTR/rDNS match
          for (const ptrHost of ptr) {
            for (const rdns of pattern.rdnsPatterns) {
              if (new RegExp(rdns, "i").test(ptrHost)) {
                score += 2;
                signals.push(`rDNS match: ${ptrHost} ~ ${rdns}`);
              }
            }
          }

          // Check HTTP headers
          if (checkHeaders && Object.keys(allHeaders).length > 0) {
            for (const [headerName, headerPattern] of Object.entries(
              pattern.headerPatterns,
            )) {
              const headerValue = allHeaders[headerName.toLowerCase()];
              if (
                headerValue &&
                new RegExp(headerPattern, "i").test(headerValue)
              ) {
                score += 2;
                signals.push(
                  `Header match: ${headerName}: ${headerValue}`,
                );
              }
            }
          }

          // Check service identifiers
          if (pattern.serviceIdentifiers) {
            for (const svc of pattern.serviceIdentifiers) {
              // Check against PTR
              for (const ptrHost of ptr) {
                if (new RegExp(svc.pattern, "i").test(ptrHost)) {
                  services.push(svc.service);
                }
              }
              // Check against headers (some serviceIdentifiers match header names)
              if (allHeaders[svc.pattern.toLowerCase()]) {
                services.push(svc.service);
              }
              // Check against target domain
              if (new RegExp(svc.pattern, "i").test(target)) {
                services.push(svc.service);
              }
            }
          }

          if (score > bestMatchScore) {
            bestMatchScore = score;
            cloudProvider = pattern.provider;
            matchedSignals.length = 0;
            matchedSignals.push(...signals);
            detectedServices.length = 0;
            detectedServices.push(...[...new Set(services)]);
          }
        }

        // Score confidence
        let confidence: "high" | "medium" | "low" | "none" = "none";
        if (bestMatchScore >= 5) confidence = "high";
        else if (bestMatchScore >= 3) confidence = "medium";
        else if (bestMatchScore >= 1) confidence = "low";
        else cloudProvider = null;

        const result = {
          target,
          ip,
          ptr: ptr.length > 0 ? ptr : null,
          asn: {
            number: effectiveAsn || null,
            org: asnOrg || null,
            prefixes: cymruPrefix || asnPrefixes || null,
          },
          cloudProvider,
          matchedSignals,
          services: detectedServices.length > 0 ? detectedServices : [],
          confidence,
          intelligence:
            cloudProvider
              ? `Target ${target} (${ip}) is hosted on ${cloudProvider} with ${confidence} confidence. ` +
                `${matchedSignals.length} signal(s) matched. ` +
                (detectedServices.length > 0
                  ? `Detected services: ${detectedServices.join(", ")}.`
                  : "No specific sub-services identified.")
              : `No cloud provider detected for ${target} (${ip}). The host may be on-premise or on an unrecognized provider.`,
        };

        cache.set(cacheKey, result);
        return json(result);
      } catch (err) {
        return json({
          error: `infra_cloud_detect failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  },

  // ══════════════════════════════════════════════════
  // Tool 2: infra_asn_lookup
  // ══════════════════════════════════════════════════
  {
    name: "infra_asn_lookup",
    description:
      "ASN information lookup via Team Cymru DNS and HackerTarget API. Returns ASN number, name, organization, country, registry, allocation date, and announced prefixes.",
    schema: {
      ip: z.string().describe("IP address for ASN lookup"),
    },
    execute: async (args) => {
      try {
        await limiter.acquire();

        const ip = args.ip as string;
        const cacheKey = `asn_lookup:${ip}`;
        const cached = cache.get(cacheKey);
        if (cached) return json(cached);

        // 1. Reverse IP octets
        const reversed = reverseIpOctets(ip);

        // 2. Query Team Cymru origin
        let cymruAsn = "";
        let cymruPrefix = "";
        let cymruCC = "";
        let cymruRegistry = "";
        let cymruAllocated = "";
        try {
          const txtRecords = await dns.resolveTxt(
            `${reversed}.origin.asn.cymru.com`,
          );
          if (txtRecords.length > 0) {
            // Format: "ASN | Prefix | CC | Registry | Allocated"
            const record = txtRecords[0].join("");
            const parts = record.split("|").map((p) => p.trim());
            cymruAsn = parts[0] ?? "";
            cymruPrefix = parts[1] ?? "";
            cymruCC = parts[2] ?? "";
            cymruRegistry = parts[3] ?? "";
            cymruAllocated = parts[4] ?? "";
          }
        } catch {
          /* Cymru origin DNS unavailable */
        }

        // 3. Query Team Cymru for org name
        let cymruOrgName = "";
        if (cymruAsn) {
          try {
            const asnRecords = await dns.resolveTxt(
              `AS${cymruAsn}.asn.cymru.com`,
            );
            if (asnRecords.length > 0) {
              // Format: "ASN | CC | Registry | Allocated | AS Name"
              const record = asnRecords[0].join("");
              const parts = record.split("|").map((p) => p.trim());
              cymruOrgName = parts[4] ?? "";
            }
          } catch {
            /* Cymru ASN DNS unavailable */
          }
        }

        // 4. Fallback: HackerTarget API
        let htAsn = "";
        let htOrg = "";
        try {
          const htResp = await safeFetch(
            `https://api.hackertarget.com/aslookup/?q=${ip}`,
          );
          if (htResp && htResp.ok) {
            const text = await htResp.text();
            const lines = text.trim().split("\n");
            if (lines.length > 0) {
              const parts = lines[0].split(",");
              if (parts.length >= 3) {
                htAsn = parts[1]?.trim() ?? "";
                htOrg = parts.slice(2).join(",").trim();
              }
            }
          }
        } catch {
          /* HackerTarget unavailable */
        }

        // 5. Merge results (prefer Cymru, fallback to HackerTarget)
        const asnNumber = cymruAsn || htAsn;
        const asnName = cymruOrgName || htOrg;
        const asnOrg = cymruOrgName || htOrg;

        const result = {
          ip,
          asn: {
            number: asnNumber || null,
            name: asnName || null,
            org: asnOrg || null,
            country: cymruCC || null,
            registry: cymruRegistry || null,
            allocated: cymruAllocated || null,
            prefixes: cymruPrefix || null,
          },
          intelligence: asnNumber
            ? `IP ${ip} belongs to AS${asnNumber} (${asnName || "unknown org"}). ` +
              `Country: ${cymruCC || "unknown"}. Registry: ${cymruRegistry || "unknown"}. ` +
              `Allocated: ${cymruAllocated || "unknown"}. Prefix: ${cymruPrefix || "unknown"}.`
            : `No ASN information found for IP ${ip}. The IP may not be announced or may be private/reserved.`,
        };

        cache.set(cacheKey, result);
        return json(result);
      } catch (err) {
        return json({
          error: `infra_asn_lookup failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  },

  // ══════════════════════════════════════════════════
  // Tool 3: infra_cdn_identify
  // ══════════════════════════════════════════════════
  {
    name: "infra_cdn_identify",
    description:
      "Deep CDN identification with edge node analysis. Detects Cloudflare, CloudFront, Fastly, Akamai, Vercel, Netlify, Google, and others. Extracts POP/edge location, cache status, and cache strategy from response headers.",
    schema: {
      url: z.string().describe("URL to analyze CDN configuration"),
    },
    execute: async (args) => {
      try {
        await limiter.acquire();

        const url = args.url as string;
        const cacheKey = `cdn_identify:${url}`;
        const cached = cache.get(cacheKey);
        if (cached) return json(cached);

        // 1. Fetch the URL
        const response = await safeFetch(url);
        if (!response) {
          return json({
            url,
            cdn: null,
            error: "Failed to fetch URL",
            intelligence:
              "Could not fetch the target URL. The server may be unreachable or blocking requests.",
          });
        }

        // Collect all response headers
        const headers: Record<string, string> = {};
        response.headers.forEach((v, k) => {
          headers[k.toLowerCase()] = v;
        });

        let cdn: string | null = null;
        let edgeLocation: string | null = null;
        let cacheStatus: string | null = null;
        const cdnHeaders: Record<string, string> = {};

        // 2. Cloudflare detection
        const cfRay = headers["cf-ray"];
        if (cfRay) {
          cdn = "Cloudflare";
          // Extract POP code: last segment before the dash, e.g., "7c5d1a2b3c4d5e-IAD" → "IAD"
          const rayParts = cfRay.split("-");
          if (rayParts.length >= 2) {
            const popCode = rayParts[rayParts.length - 1];
            edgeLocation =
              POP_CODES[popCode] ?? popCode;
          }
          cacheStatus = headers["cf-cache-status"] ?? null;
          cdnHeaders["cf-ray"] = cfRay;
          if (headers["cf-cache-status"])
            cdnHeaders["cf-cache-status"] = headers["cf-cache-status"];
        }

        // 3. CloudFront detection
        const cfPop = headers["x-amz-cf-pop"];
        if (cfPop && !cdn) {
          cdn = "Amazon CloudFront";
          // Extract POP: "IAD89-P2" → "IAD"
          const popCode = cfPop.replace(/\d.*$/, "");
          edgeLocation =
            POP_CODES[popCode] ?? popCode;
          cdnHeaders["x-amz-cf-pop"] = cfPop;
        }
        if (headers["x-amz-cf-id"]) {
          if (!cdn) cdn = "Amazon CloudFront";
          cdnHeaders["x-amz-cf-id"] = headers["x-amz-cf-id"];
        }

        // 4. Fastly detection
        const servedBy = headers["x-served-by"];
        if (servedBy && /^cache-/i.test(servedBy) && !cdn) {
          cdn = "Fastly";
          // Extract POP: "cache-iad2127-IAD" → "IAD"
          const match = servedBy.match(/cache-[a-z]+\d+-([A-Z]{3})/i);
          if (match) {
            const popCode = match[1].toUpperCase();
            edgeLocation =
              POP_CODES[popCode] ?? popCode;
          }
          cdnHeaders["x-served-by"] = servedBy;
          if (headers["x-cache"]) cdnHeaders["x-cache"] = headers["x-cache"];
          if (headers["x-cache-hits"])
            cdnHeaders["x-cache-hits"] = headers["x-cache-hits"];
          if (headers["x-timer"]) cdnHeaders["x-timer"] = headers["x-timer"];
        }

        // 5. Akamai detection
        if (
          (headers["x-akamai-transformed"] ||
            headers["x-akamai-request-id"]) &&
          !cdn
        ) {
          cdn = "Akamai";
          if (headers["x-akamai-transformed"])
            cdnHeaders["x-akamai-transformed"] =
              headers["x-akamai-transformed"];
          if (headers["x-akamai-request-id"])
            cdnHeaders["x-akamai-request-id"] =
              headers["x-akamai-request-id"];
          if (headers["x-cache"]) cdnHeaders["x-cache"] = headers["x-cache"];
        }

        // 6. Vercel detection
        const vercelId = headers["x-vercel-id"];
        if (vercelId && !cdn) {
          cdn = "Vercel";
          // Extract region: "iad1::..." → "iad1"
          const region = vercelId.split("::")[0];
          if (region) {
            const popCode = region.replace(/\d+$/, "").toUpperCase();
            edgeLocation =
              POP_CODES[popCode] ?? region;
          }
          cdnHeaders["x-vercel-id"] = vercelId;
          if (headers["x-vercel-cache"])
            cdnHeaders["x-vercel-cache"] = headers["x-vercel-cache"];
          cacheStatus = headers["x-vercel-cache"] ?? null;
        }

        // 7. Netlify detection
        if (headers["x-nf-request-id"] && !cdn) {
          cdn = "Netlify";
          cdnHeaders["x-nf-request-id"] = headers["x-nf-request-id"];
        }
        if (
          headers["server"] &&
          /^netlify$/i.test(headers["server"]) &&
          !cdn
        ) {
          cdn = "Netlify";
        }

        // 8. Google detection
        if (!cdn) {
          const googleHeaders = Object.keys(headers).filter((h) =>
            h.startsWith("x-goog-"),
          );
          if (googleHeaders.length > 0) {
            cdn = "Google Cloud CDN";
            for (const h of googleHeaders) {
              cdnHeaders[h] = headers[h];
            }
          }
          if (
            headers["via"] &&
            /google/i.test(headers["via"])
          ) {
            if (!cdn) cdn = "Google Cloud CDN";
            cdnHeaders["via"] = headers["via"];
          }
        }

        // 9. Fallback: check Server header
        if (!cdn && headers["server"]) {
          const serverLower = headers["server"].toLowerCase();
          if (serverLower === "cloudflare") cdn = "Cloudflare";
          else if (serverLower === "akamainetstorage" || serverLower === "akamaighost")
            cdn = "Akamai";
          else if (serverLower === "vercel") cdn = "Vercel";
          else if (serverLower === "netlify") cdn = "Netlify";
        }

        // 10. Cache behavior analysis
        if (!cacheStatus && headers["x-cache"]) {
          cacheStatus = headers["x-cache"];
        }
        const cacheControl = headers["cache-control"] ?? null;
        const age = headers["age"] ?? null;

        let cacheStrategy: string | null = null;
        if (cacheControl) {
          if (/no-store/i.test(cacheControl)) cacheStrategy = "no-store";
          else if (/no-cache/i.test(cacheControl)) cacheStrategy = "revalidate";
          else if (/max-age=(\d+)/i.test(cacheControl)) {
            const match = cacheControl.match(/max-age=(\d+)/i);
            const maxAge = match ? parseInt(match[1], 10) : 0;
            if (maxAge > 86400) cacheStrategy = "long-lived";
            else if (maxAge > 0) cacheStrategy = "short-lived";
            else cacheStrategy = "no-cache";
          }
          if (/s-maxage/i.test(cacheControl))
            cacheStrategy = (cacheStrategy ?? "") + " (shared-cache override)";
          if (/immutable/i.test(cacheControl))
            cacheStrategy = (cacheStrategy ?? "") + " (immutable)";
        }

        const result = {
          url,
          cdn,
          edgeLocation,
          cacheStatus,
          cacheStrategy: cacheStrategy?.trim() || null,
          headers: Object.keys(cdnHeaders).length > 0 ? cdnHeaders : null,
          intelligence: cdn
            ? `CDN detected: ${cdn}.` +
              (edgeLocation ? ` Edge location: ${edgeLocation}.` : "") +
              (cacheStatus ? ` Cache status: ${cacheStatus}.` : "") +
              (cacheStrategy ? ` Cache strategy: ${cacheStrategy.trim()}.` : "") +
              (age ? ` Object age: ${age}s.` : "")
            : `No CDN detected for ${url}. The server may be serving content directly without a CDN layer.`,
        };

        cache.set(cacheKey, result);
        return json(result);
      } catch (err) {
        return json({
          error: `infra_cdn_identify failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  },

  // ══════════════════════════════════════════════════
  // Tool 4: infra_reverse_proxy_detect
  // ══════════════════════════════════════════════════
  {
    name: "infra_reverse_proxy_detect",
    description:
      "Reverse proxy detection via multi-signal analysis. Checks Via headers, proxy-specific headers, server/header-order mismatches, and timing variance across multiple paths to identify reverse proxies like Nginx, HAProxy, Envoy, and Traefik.",
    schema: {
      url: z.string().describe("URL to check for reverse proxy"),
    },
    execute: async (args) => {
      try {
        await limiter.acquire();

        const url = args.url as string;
        const cacheKey = `reverse_proxy:${url}`;
        const cached = cache.get(cacheKey);
        if (cached) return json(cached);

        // 1. Fetch the URL twice (different paths)
        const baseUrl = url.replace(/\/$/, "");
        const [resp1, resp2] = await Promise.all([
          safeFetch(`${baseUrl}/`),
          safeFetch(`${baseUrl}/does-not-exist-404-test`),
        ]);

        const indicators: string[] = [];
        let claimedServer: string | null = null;
        let actualServer: string | null = null;
        let via: string | null = null;
        const proxyHeaders: Record<string, string> = {};

        // Collect headers from both responses
        const headers1: Record<string, string> = {};
        const headers2: Record<string, string> = {};
        const headerOrder1: string[] = [];
        const headerOrder2: string[] = [];

        if (resp1) {
          resp1.headers.forEach((v, k) => {
            headers1[k.toLowerCase()] = v;
            headerOrder1.push(k);
          });
        }
        if (resp2) {
          resp2.headers.forEach((v, k) => {
            headers2[k.toLowerCase()] = v;
            headerOrder2.push(k);
          });
        }

        const headers = { ...headers1, ...headers2 };

        // 2. Check reverse proxy indicators

        // Via header
        if (headers["via"]) {
          via = headers["via"];
          indicators.push(`Via header present: ${via}`);
          proxyHeaders["via"] = via;
        }

        // Proxy-specific headers in response
        if (headers["x-forwarded-for"]) {
          indicators.push(
            `X-Forwarded-For exposed in response: ${headers["x-forwarded-for"]}`,
          );
          proxyHeaders["x-forwarded-for"] = headers["x-forwarded-for"];
        }
        if (headers["x-forwarded-proto"]) {
          indicators.push(
            `X-Forwarded-Proto present: ${headers["x-forwarded-proto"]}`,
          );
          proxyHeaders["x-forwarded-proto"] = headers["x-forwarded-proto"];
        }
        if (headers["x-real-ip"]) {
          indicators.push(`X-Real-IP present: ${headers["x-real-ip"]}`);
          proxyHeaders["x-real-ip"] = headers["x-real-ip"];
        }
        if (headers["x-proxy-id"]) {
          indicators.push(`X-Proxy-Id present: ${headers["x-proxy-id"]}`);
          proxyHeaders["x-proxy-id"] = headers["x-proxy-id"];
        }
        if (headers["x-proxy"]) {
          indicators.push(`X-Proxy present: ${headers["x-proxy"]}`);
          proxyHeaders["x-proxy"] = headers["x-proxy"];
        }

        // Server header
        claimedServer = headers["server"] ?? null;

        // Server vs X-Powered-By mismatch
        const poweredBy = headers["x-powered-by"] ?? null;
        if (claimedServer && poweredBy) {
          const serverLower = claimedServer.toLowerCase();
          const poweredByLower = poweredBy.toLowerCase();

          // Detect mismatch: e.g., Server: nginx, X-Powered-By: Express
          const isNginxOrApache =
            serverLower.includes("nginx") || serverLower.includes("apache");
          const isAppFramework =
            poweredByLower.includes("express") ||
            poweredByLower.includes("asp.net") ||
            poweredByLower.includes("php") ||
            poweredByLower.includes("django") ||
            poweredByLower.includes("rails") ||
            poweredByLower.includes("next.js");

          if (isNginxOrApache && isAppFramework) {
            indicators.push(
              `Server/X-Powered-By mismatch: Server=${claimedServer}, X-Powered-By=${poweredBy} — suggests reverse proxy`,
            );
          }
        }

        // 3. Header order analysis
        if (headerOrder1.length > 0) {
          const hash = computeHeaderOrderHash(headerOrder1);
          for (const sig of HEADER_ORDER_SIGNATURES) {
            if (sig.hash === hash) {
              actualServer = sig.server;
              break;
            }
          }

          // If claimed server doesn't match header-order-detected server
          if (claimedServer && actualServer) {
            const claimedLower = claimedServer.toLowerCase();
            const actualLower = actualServer.toLowerCase();
            if (
              !actualLower.includes(claimedLower) &&
              !claimedLower.includes(actualLower.split(" ")[0])
            ) {
              indicators.push(
                `Header order suggests ${actualServer}, but Server header claims ${claimedServer}`,
              );
            }
          }
        }

        // 4. Date header timestamp difference
        if (headers1["date"] && headers2["date"]) {
          const date1 = new Date(headers1["date"]).getTime();
          const date2 = new Date(headers2["date"]).getTime();
          if (!isNaN(date1) && !isNaN(date2)) {
            const diff = Math.abs(date1 - date2);
            if (diff > 1000) {
              indicators.push(
                `Date header difference between requests: ${diff}ms — may indicate different backend clocks`,
              );
            }
          }
        }

        // 5. Different server headers between responses
        if (
          headers1["server"] &&
          headers2["server"] &&
          headers1["server"] !== headers2["server"]
        ) {
          indicators.push(
            `Different Server headers across paths: "${headers1["server"]}" vs "${headers2["server"]}"`,
          );
        }

        const reverseProxyDetected = indicators.length > 0;
        let confidence: "high" | "medium" | "low" | "none" = "none";
        if (indicators.length >= 3) confidence = "high";
        else if (indicators.length >= 2) confidence = "medium";
        else if (indicators.length >= 1) confidence = "low";

        const result = {
          url,
          reverseProxyDetected,
          indicators,
          claimedServer,
          actualServer,
          via,
          proxyHeaders:
            Object.keys(proxyHeaders).length > 0 ? proxyHeaders : null,
          confidence,
          intelligence: reverseProxyDetected
            ? `Reverse proxy detected for ${url} with ${confidence} confidence. ` +
              `${indicators.length} indicator(s) found. ` +
              (claimedServer
                ? `Claimed server: ${claimedServer}. `
                : "") +
              (actualServer
                ? `Header-order-detected server: ${actualServer}. `
                : "") +
              (via ? `Via: ${via}.` : "")
            : `No reverse proxy indicators detected for ${url}. The server appears to serve content directly.`,
        };

        cache.set(cacheKey, result);
        return json(result);
      } catch (err) {
        return json({
          error: `infra_reverse_proxy_detect failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  },

  // ══════════════════════════════════════════════════
  // Tool 5: infra_lb_detect
  // ══════════════════════════════════════════════════
  {
    name: "infra_lb_detect",
    description:
      "Load balancer detection via response variance analysis. Sends multiple requests and compares Server headers, ETags, request IDs, and cookies to detect F5 BIG-IP, AWS ALB, HAProxy, Google Cloud LB, Citrix NetScaler, and other load balancers. Decodes BIG-IP cookies to reveal backend IPs and ports.",
    schema: {
      url: z.string().describe("URL to probe for load balancer"),
      requests: z
        .number()
        .optional()
        .default(10)
        .describe("Number of requests to send (default: 10)"),
    },
    execute: async (args) => {
      try {
        await limiter.acquire();

        const url = args.url as string;
        const requestCount = Math.min(
          Math.max((args.requests as number) ?? 10, 2),
          50,
        );
        const cacheKey = `lb_detect:${url}:${requestCount}`;
        const cached = cache.get(cacheKey);
        if (cached) return json(cached);

        // 1. Send N sequential requests
        const serverValues: string[] = [];
        const dateValues: string[] = [];
        const etagValues: string[] = [];
        const requestIdValues: string[] = [];
        const contentLengthValues: string[] = [];
        const allCookieNames: Set<string> = new Set();
        const lbCookies: {
          name: string;
          value: string;
          type: string;
          decoded?: { ip: string; port: number } | null;
        }[] = [];

        for (let i = 0; i < requestCount; i++) {
          const resp = await safeFetch(url);
          if (!resp) continue;

          // Record header values
          const server = resp.headers.get("server");
          if (server) serverValues.push(server);

          const date = resp.headers.get("date");
          if (date) dateValues.push(date);

          const etag = resp.headers.get("etag");
          if (etag) etagValues.push(etag);

          const requestId = resp.headers.get("x-request-id");
          if (requestId) requestIdValues.push(requestId);

          const contentLength = resp.headers.get("content-length");
          if (contentLength) contentLengthValues.push(contentLength);

          // Parse Set-Cookie headers
          const setCookies = resp.headers.getSetCookie?.() ?? [];
          for (const cookieStr of setCookies) {
            const eqIdx = cookieStr.indexOf("=");
            if (eqIdx === -1) continue;
            const cookieName = cookieStr.slice(0, eqIdx).trim();
            const cookieValueRaw = cookieStr.slice(eqIdx + 1);
            const cookieValue = cookieValueRaw.split(";")[0].trim();
            allCookieNames.add(cookieName);

            // Check for load balancer cookies
            if (cookieName.startsWith("BIGipServer")) {
              const decoded = decodeBigIpCookie(cookieValue);
              lbCookies.push({
                name: cookieName,
                value: cookieValue,
                type: "F5 BIG-IP",
                decoded,
              });
            } else if (cookieName === "AWSALB" || cookieName === "AWSALBCORS") {
              lbCookies.push({
                name: cookieName,
                value: cookieValue,
                type: "AWS ALB",
              });
            } else if (cookieName === "GCLB") {
              lbCookies.push({
                name: cookieName,
                value: cookieValue,
                type: "Google Cloud LB",
              });
            } else if (
              cookieName === "ROUTEID" ||
              cookieName === "SERVERID"
            ) {
              lbCookies.push({
                name: cookieName,
                value: cookieValue,
                type: "HAProxy",
              });
            } else if (cookieName.startsWith("NSC_")) {
              lbCookies.push({
                name: cookieName,
                value: cookieValue,
                type: "Citrix NetScaler",
              });
            }
          }

          // Small delay between requests to avoid being rate-limited
          if (i < requestCount - 1) {
            await sleep(150);
          }
        }

        // 4. Analyze variance
        const uniqueServers = [...new Set(serverValues)];
        const uniqueEtags = [...new Set(etagValues)];
        const uniqueRequestIds = [...new Set(requestIdValues)];
        const uniqueContentLengths = [...new Set(contentLengthValues)];

        // Determine LB type
        let lbType: string = "none";
        let loadBalancerDetected = false;

        // Check LB cookies first (most reliable signal)
        if (lbCookies.length > 0) {
          loadBalancerDetected = true;
          // Use first detected LB cookie type
          const uniqueTypes = [...new Set(lbCookies.map((c) => c.type))];
          lbType = uniqueTypes.join(" + ");
        }

        // Check variance signals
        if (uniqueServers.length > 1) {
          loadBalancerDetected = true;
          if (lbType === "none") lbType = "unknown";
        }

        if (
          uniqueEtags.length > 1 &&
          etagValues.length >= 3 &&
          uniqueEtags.length >= etagValues.length * 0.3
        ) {
          // Multiple different ETags for the same URL suggests different backends
          loadBalancerDetected = true;
          if (lbType === "none") lbType = "unknown";
        }

        if (uniqueRequestIds.length > 1 && requestIdValues.length >= 3) {
          // Different patterns in request IDs may indicate different backends
          // Check if request ID formats differ (length, character composition)
          const lengths = uniqueRequestIds.map((id) => id.length);
          const uniqueLengths = [...new Set(lengths)];
          if (uniqueLengths.length > 1) {
            loadBalancerDetected = true;
            if (lbType === "none") lbType = "unknown";
          }
        }

        // Extract decoded backends from BIG-IP cookies
        const backends: { ip: string; port: number }[] = [];
        const seenBackends = new Set<string>();
        for (const cookie of lbCookies) {
          if (cookie.decoded) {
            const key = `${cookie.decoded.ip}:${cookie.decoded.port}`;
            if (!seenBackends.has(key)) {
              seenBackends.add(key);
              backends.push(cookie.decoded);
            }
          }
        }

        // Deduplicate LB cookies for output
        const uniqueLbCookies = lbCookies.filter(
          (cookie, index, self) =>
            self.findIndex(
              (c) => c.name === cookie.name && c.type === cookie.type,
            ) === index,
        );

        const result = {
          url,
          loadBalancerDetected,
          type: lbType,
          backends: backends.length > 0 ? backends : [],
          cookies: uniqueLbCookies.length > 0 ? uniqueLbCookies : [],
          variance: {
            serverValues: uniqueServers,
            etagValues: uniqueEtags,
            uniqueServerCount: uniqueServers.length,
            uniqueEtagCount: uniqueEtags.length,
            uniqueRequestIdCount: uniqueRequestIds.length,
            uniqueContentLengthCount: uniqueContentLengths.length,
          },
          requestsSent: requestCount,
          intelligence: loadBalancerDetected
            ? `Load balancer detected for ${url}. Type: ${lbType}. ` +
              (backends.length > 0
                ? `Decoded backend servers: ${backends.map((b) => `${b.ip}:${b.port}`).join(", ")}. `
                : "") +
              (uniqueServers.length > 1
                ? `Multiple Server header values observed: ${uniqueServers.join(", ")}. `
                : "") +
              (uniqueLbCookies.length > 0
                ? `LB cookies found: ${uniqueLbCookies.map((c) => `${c.name} (${c.type})`).join(", ")}. `
                : "") +
              `Sent ${requestCount} requests.`
            : `No load balancer detected for ${url} after ${requestCount} requests. ` +
              `All responses appear to originate from a single backend server.`,
        };

        cache.set(cacheKey, result);
        return json(result);
      } catch (err) {
        return json({
          error: `infra_lb_detect failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
  },
];
