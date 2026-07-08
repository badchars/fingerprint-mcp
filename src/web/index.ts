import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import * as cheerio from "cheerio";

// ─── Module-level Rate Limiter & Cache ───

const limiter = new RateLimiter(300);
const cache = new TTLCache<any>(300_000);

// ─── Shared Helpers ───

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchPage(url: string): Promise<string> {
  const cached = cache.get(`html:${url}`);
  if (cached) return cached as string;

  await limiter.acquire();
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  const html = await res.text();
  cache.set(`html:${url}`, html);
  return html;
}

async function fetchRaw(url: string, options?: RequestInit): Promise<Response> {
  await limiter.acquire();
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
    ...options,
  });
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function extractVersion(filename: string): string | null {
  const m = filename.match(/[-@](\d+(?:\.\d+){1,3})(?:[.\-_]|min|\.js)/);
  return m ? m[1] : null;
}

// ─── Known CVE Database ───

interface KnownCVE {
  library: string;
  maxVersion: string;
  cve: string;
  description: string;
}

const KNOWN_CVES: KnownCVE[] = [
  { library: "jquery", maxVersion: "3.5.0", cve: "CVE-2020-11022", description: "jQuery < 3.5.0 XSS in htmlPrefilter" },
  { library: "jquery", maxVersion: "3.5.0", cve: "CVE-2020-11023", description: "jQuery < 3.5.0 XSS via HTML containing <option>" },
  { library: "jquery", maxVersion: "3.0.0", cve: "CVE-2015-9251", description: "jQuery < 3.0.0 XSS via cross-domain ajax request" },
  { library: "jquery", maxVersion: "1.12.0", cve: "CVE-2019-11358", description: "jQuery < 1.12.0 prototype pollution in extend()" },
  { library: "lodash", maxVersion: "4.17.21", cve: "CVE-2021-23337", description: "Lodash < 4.17.21 prototype pollution via template()" },
  { library: "lodash", maxVersion: "4.17.12", cve: "CVE-2019-10744", description: "Lodash < 4.17.12 prototype pollution via defaultsDeep()" },
  { library: "angular", maxVersion: "1.8.0", cve: "CVE-2022-25869", description: "AngularJS < 1.8.0 XSS via $sanitize" },
  { library: "moment", maxVersion: "2.29.4", cve: "CVE-2022-31129", description: "Moment.js < 2.29.4 ReDoS in parsing" },
  { library: "vue", maxVersion: "2.7.14", cve: "CVE-2024-6783", description: "Vue.js < 2.7.14 XSS via v-bind" },
  { library: "axios", maxVersion: "1.6.0", cve: "CVE-2023-45857", description: "Axios < 1.6.0 XSRF token leak to third-party hosts" },
  { library: "dompurify", maxVersion: "3.0.6", cve: "CVE-2023-48631", description: "DOMPurify < 3.0.6 mutation XSS bypass" },
];

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

function findCVEs(library: string, version: string): KnownCVE[] {
  const normalizedLib = library.toLowerCase().replace(/\.js$/i, "");
  return KNOWN_CVES.filter(
    (cve) => cve.library === normalizedLib && compareVersions(version, cve.maxVersion) < 0,
  );
}

// ─── JS Library Detection Patterns ───

const JS_LIB_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /jquery[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "jQuery" },
  { pattern: /react(?:\.production)?[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "React" },
  { pattern: /react-dom[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "ReactDOM" },
  { pattern: /angular[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Angular" },
  { pattern: /vue[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Vue.js" },
  { pattern: /lodash[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Lodash" },
  { pattern: /moment[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Moment.js" },
  { pattern: /axios[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Axios" },
  { pattern: /d3[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "D3.js" },
  { pattern: /three[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Three.js" },
  { pattern: /backbone[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Backbone.js" },
  { pattern: /ember[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Ember.js" },
  { pattern: /underscore[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Underscore.js" },
  { pattern: /bootstrap[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Bootstrap" },
  { pattern: /tailwind[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.(?:js|css)/i, name: "Tailwind CSS" },
  { pattern: /socket\.io[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Socket.IO" },
  { pattern: /dompurify[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "DOMPurify" },
  { pattern: /handlebars[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Handlebars" },
  { pattern: /knockout[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Knockout.js" },
  { pattern: /gsap[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "GSAP" },
  { pattern: /alpine[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Alpine.js" },
  { pattern: /htmx[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "htmx" },
  { pattern: /svelte[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Svelte" },
  { pattern: /preact[-.]?(\d+(?:\.\d+){0,3})?(?:\.min)?\.js/i, name: "Preact" },
];

// ─── Framework DOM Indicators ───

interface FrameworkIndicator {
  name: string;
  check: (html: string, $: cheerio.CheerioAPI) => string | null;
}

const FRAMEWORK_INDICATORS: FrameworkIndicator[] = [
  {
    name: "Next.js",
    check: (html, $) => {
      const nextData = $("script#__NEXT_DATA__").html();
      if (nextData) {
        try {
          const parsed = JSON.parse(nextData);
          return `Next.js (Build ID: ${parsed.buildId ?? "unknown"})`;
        } catch {
          return "Next.js";
        }
      }
      return null;
    },
  },
  {
    name: "Nuxt",
    check: (html) => (html.includes("__NUXT__") || html.includes("__nuxt") ? "Nuxt.js" : null),
  },
  {
    name: "Angular",
    check: (_html, $) => {
      const ngVersion = $("[ng-version]").attr("ng-version");
      return ngVersion ? `Angular (v${ngVersion})` : null;
    },
  },
  {
    name: "React",
    check: (_html, $) => ($("[data-reactroot]").length > 0 || $("[data-reactid]").length > 0 ? "React (DOM)" : null),
  },
  {
    name: "Svelte",
    check: (html) => (html.includes("__svelte") ? "Svelte" : null),
  },
  {
    name: "Vue.js",
    check: (html, $) => {
      if (html.includes("__VUE__") || html.includes("__vue__")) return "Vue.js (DOM)";
      if ($("[data-v-]").length > 0 || $("[data-vue-app]").length > 0) return "Vue.js (DOM)";
      return null;
    },
  },
  {
    name: "Gatsby",
    check: (_html, $) => ($("script#gatsby-chunk-mapping").length > 0 || $("[data-gatsby-head]").length > 0 ? "Gatsby" : null),
  },
  {
    name: "Remix",
    check: (html) => (html.includes("__remixContext") ? "Remix" : null),
  },
];

// ─── Build Tool Detection ───

const BUILD_TOOL_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /\/_next\//i, name: "Next.js" },
  { pattern: /\/@vite\//i, name: "Vite" },
  { pattern: /\/webpack/i, name: "Webpack" },
  { pattern: /\/parcel\//i, name: "Parcel" },
  { pattern: /\/rollup\//i, name: "Rollup" },
  { pattern: /\.turbopack\//i, name: "Turbopack" },
  { pattern: /\/esbuild\//i, name: "esbuild" },
  { pattern: /\/__snowpack__\//i, name: "Snowpack" },
];

// ─── WebSocket Endpoints ───

const WS_ENDPOINTS = [
  { path: "/ws", framework: null },
  { path: "/websocket", framework: null },
  { path: "/socket.io/?EIO=4&transport=polling", framework: "Socket.IO (Node.js)" },
  { path: "/socket.io/", framework: "Socket.IO (Node.js)" },
  { path: "/sockjs/info", framework: "SockJS" },
  { path: "/cable", framework: "ActionCable (Rails)" },
  { path: "/hub", framework: "SignalR (ASP.NET)" },
  { path: "/signalr/negotiate", framework: "SignalR (ASP.NET)" },
  { path: "/graphql-ws", framework: "GraphQL Subscriptions" },
  { path: "/mqtt", framework: "MQTT" },
  { path: "/stomp", framework: "STOMP" },
  { path: "/realtime", framework: null },
  { path: "/live", framework: null },
  { path: "/stream", framework: null },
  { path: "/events", framework: null },
  { path: "/notifications", framework: null },
];

// ─── API Discovery Paths ───

const API_PATHS = {
  openapi: [
    "/swagger.json",
    "/openapi.json",
    "/api-docs",
    "/v1/api-docs",
    "/v2/api-docs",
    "/v3/api-docs",
    "/swagger.yaml",
    "/openapi.yaml",
    "/swagger-ui.html",
    "/swagger-ui/",
    "/swagger-resources",
  ],
  graphql: ["/graphql"],
  docker: ["/_catalog", "/v2/_catalog", "/v2/"],
  kubernetes: ["/api/v1", "/api/v1/namespaces", "/apis", "/version", "/healthz"],
};

// ─── Dangerous GraphQL Mutations ───

const DANGEROUS_MUTATIONS = [
  "deleteUser", "removeUser", "destroyUser",
  "updateRole", "setRole", "assignRole",
  "createAdmin", "addAdmin", "promoteUser",
  "resetPassword", "changePassword", "forceResetPassword",
  "deleteAccount", "destroyAccount",
  "updatePermission", "grantPermission",
  "executeCommand", "runCommand",
  "uploadFile", "deleteFile",
  "createToken", "revokeToken", "invalidateToken",
  "updateConfig", "setConfig",
  "sendEmail", "sendNotification",
  "impersonate", "switchUser",
];

// ─── Virtual Host Wordlist ───

const DEFAULT_VHOSTS = [
  "localhost", "127.0.0.1", "internal", "admin", "test",
  "dev", "staging", "default", "backend", "api",
  "intranet", "management", "portal", "dashboard", "monitor",
];

// ─── Analytics Detection Patterns ───

interface AnalyticsDetection {
  name: string;
  patterns: RegExp[];
  idPattern?: RegExp;
  crossRef: boolean;
}

const ANALYTICS_DETECT: AnalyticsDetection[] = [
  {
    name: "Google Analytics (Universal)",
    patterns: [/UA-\d{4,10}-\d{1,4}/i, /google-analytics\.com\/analytics\.js/i, /\bga\s*\(\s*['"]create['"]/i],
    idPattern: /(UA-\d{4,10}-\d{1,4})/,
    crossRef: true,
  },
  {
    name: "Google Analytics 4",
    patterns: [/G-[A-Z0-9]{4,15}/i, /gtag\s*\(\s*['"]config['"]/i, /googletagmanager\.com\/gtag\/js/i],
    idPattern: /(G-[A-Z0-9]{4,15})/,
    crossRef: true,
  },
  {
    name: "Google Tag Manager",
    patterns: [/GTM-[A-Z0-9]{4,10}/i, /googletagmanager\.com\/gtm\.js/i],
    idPattern: /(GTM-[A-Z0-9]{4,10})/,
    crossRef: true,
  },
  {
    name: "Facebook Pixel",
    patterns: [/fbq\s*\(\s*['"]init['"]/i, /connect\.facebook\.net/i],
    idPattern: /fbq\s*\(\s*['"]init['"]\s*,\s*['"]?(\d{10,20})/,
    crossRef: true,
  },
  {
    name: "Hotjar",
    patterns: [/hj\s*\(\s*['"]init['"]/i, /static\.hotjar\.com/i],
    idPattern: /hjid\s*:\s*(\d+)/,
    crossRef: true,
  },
  {
    name: "Segment",
    patterns: [/cdn\.segment\.com/i, /analytics\.identify/i],
    idPattern: /analytics\.load\s*\(\s*['"]([A-Za-z0-9]+)['"]/,
    crossRef: true,
  },
  {
    name: "Mixpanel",
    patterns: [/mixpanel\.init/i, /cdn\.mxpnl\.com/i],
    idPattern: /mixpanel\.init\s*\(\s*['"]([a-f0-9]{32})['"]/,
    crossRef: true,
  },
  {
    name: "Amplitude",
    patterns: [/amplitude\.getInstance/i, /cdn\.amplitude\.com/i],
    idPattern: /amplitude\.init\s*\(\s*['"]([a-f0-9]{32})['"]/,
    crossRef: true,
  },
  {
    name: "PostHog",
    patterns: [/posthog\.init/i, /posthog\.com/i],
    idPattern: /posthog\.init\s*\(\s*['"]([a-zA-Z0-9_-]+)['"]/,
    crossRef: true,
  },
  {
    name: "Plausible",
    patterns: [/plausible\.io/i],
    idPattern: /data-domain\s*=\s*['"]([^'"]+)['"]/,
    crossRef: false,
  },
  {
    name: "Matomo",
    patterns: [/_paq\.push/i, /matomo\.js/i, /piwik\.js/i],
    idPattern: /setSiteId['"\\s,]+(\d+)/,
    crossRef: false,
  },
  {
    name: "Heap",
    patterns: [/heap\.load/i, /heapanalytics\.com/i],
    idPattern: /heap\.load\s*\(\s*['"]?(\d{8,12})/,
    crossRef: true,
  },
  {
    name: "FullStory",
    patterns: [/fullstory\.com/i, /_fs_org/i],
    idPattern: /_fs_org\s*[=:]\s*['"]([A-Z0-9]+)['"]/,
    crossRef: true,
  },
  {
    name: "Microsoft Clarity",
    patterns: [/clarity\.ms/i, /clarity\s*\(\s*['"]set['"]/i],
    idPattern: /clarity\.ms\/tag\/([a-z0-9]+)/,
    crossRef: true,
  },
  {
    name: "Google AdSense",
    patterns: [/ca-pub-\d{10,16}/i, /adsbygoogle/i],
    idPattern: /(ca-pub-\d{10,16})/,
    crossRef: true,
  },
  {
    name: "Pinterest Tag",
    patterns: [/pintrk/i, /ct\.pinterest\.com/i],
    idPattern: /pintrk\s*\(\s*['"]load['"]\s*,\s*['"]?(\d+)/,
    crossRef: true,
  },
  {
    name: "Twitter Pixel",
    patterns: [/twq\s*\(\s*['"]init['"]/i, /ads-twitter\.com/i],
    idPattern: /twq\s*\(\s*['"]init['"]\s*,\s*['"]([a-z0-9]+)['"]/,
    crossRef: true,
  },
  {
    name: "LinkedIn Insight Tag",
    patterns: [/snap\.licdn\.com/i, /_linkedin_partner_id/i],
    idPattern: /_linkedin_partner_id\s*=\s*['"]?(\d+)/,
    crossRef: true,
  },
  {
    name: "TikTok Pixel",
    patterns: [/analytics\.tiktok\.com/i, /ttq\.load/i],
    idPattern: /ttq\.load\s*\(\s*['"]([A-Z0-9]+)['"]/,
    crossRef: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 1: web_tech — Technology Stack Detection
// ═══════════════════════════════════════════════════════════════════════════════

const webTech: ToolDef = {
  name: "web_tech",
  description:
    "Detect the full technology stack of a web page via HTML/JS analysis. Identifies JS libraries with versions, frameworks via DOM indicators, meta generator tags, build tools, and known CVEs for detected versions.",
  schema: {
    url: z.string().url().describe("URL to analyze technology stack"),
  },
  async execute(args) {
    const url = args.url as string;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // --- JS Libraries from <script src=""> ---
    const libraries: { name: string; version: string | null; src: string; cves: KnownCVE[] }[] = [];
    const seenLibs = new Set<string>();

    $("script[src]").each((_i, el) => {
      const src = $(el).attr("src") ?? "";
      for (const lib of JS_LIB_PATTERNS) {
        if (lib.pattern.test(src)) {
          const version = extractVersion(src);
          const key = `${lib.name}:${version ?? "unknown"}`;
          if (!seenLibs.has(key)) {
            seenLibs.add(key);
            const cves = version ? findCVEs(lib.name, version) : [];
            libraries.push({ name: lib.name, version, src, cves });
          }
        }
      }
    });

    // --- Framework DOM Indicators ---
    const frameworks: string[] = [];
    for (const indicator of FRAMEWORK_INDICATORS) {
      const result = indicator.check(html, $);
      if (result) frameworks.push(result);
    }

    // --- Meta Generator Tag ---
    const generator = $('meta[name="generator"]').attr("content") ?? null;

    // --- Build Tool Detection ---
    const buildTools = new Set<string>();
    $("script[src]").each((_i, el) => {
      const src = $(el).attr("src") ?? "";
      for (const bt of BUILD_TOOL_PATTERNS) {
        if (bt.pattern.test(src)) {
          buildTools.add(bt.name);
        }
      }
    });
    // Also check link tags (CSS)
    $("link[href]").each((_i, el) => {
      const href = $(el).attr("href") ?? "";
      for (const bt of BUILD_TOOL_PATTERNS) {
        if (bt.pattern.test(href)) {
          buildTools.add(bt.name);
        }
      }
    });

    // --- CSS Frameworks from <link> ---
    const cssFrameworks: string[] = [];
    $("link[rel='stylesheet'][href]").each((_i, el) => {
      const href = $(el).attr("href") ?? "";
      if (/bootstrap/i.test(href)) cssFrameworks.push("Bootstrap CSS");
      if (/tailwind/i.test(href)) cssFrameworks.push("Tailwind CSS");
      if (/bulma/i.test(href)) cssFrameworks.push("Bulma");
      if (/materialize/i.test(href)) cssFrameworks.push("Materialize CSS");
      if (/foundation/i.test(href)) cssFrameworks.push("Foundation");
    });

    // --- Aggregate all CVEs ---
    const allCVEs = libraries.flatMap((lib) => lib.cves);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              libraries: libraries.map((l) => ({
                name: l.name,
                version: l.version,
                src: l.src,
                cves: l.cves.map((c) => ({ cve: c.cve, description: c.description })),
              })),
              frameworks,
              generator,
              buildTools: [...buildTools],
              cssFrameworks: [...new Set(cssFrameworks)],
              knownVulnerabilities: allCVEs.length,
              cveDetails: allCVEs.map((c) => ({ cve: c.cve, library: c.library, maxVersion: c.maxVersion, description: c.description })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 2: web_sourcemaps — Source Map Detection
// ═══════════════════════════════════════════════════════════════════════════════

const webSourcemaps: ToolDef = {
  name: "web_sourcemaps",
  description:
    "Detect exposed JavaScript source maps by probing .map suffixes for each script file found on the page. Extracts internal file paths from found source maps, revealing directory structures and sensitive development information.",
  schema: {
    url: z.string().url().describe("URL to probe for source maps"),
  },
  async execute(args) {
    const url = args.url as string;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    const scriptSrcs: string[] = [];
    $("script[src]").each((_i, el) => {
      const src = $(el).attr("src");
      if (src) scriptSrcs.push(resolveUrl(url, src));
    });

    const found: {
      scriptUrl: string;
      mapUrl: string;
      detectedVia: string;
      sourceCount: number;
      sources: string[];
      sensitiveInfo: string[];
    }[] = [];

    const probed: { url: string; status: number | string }[] = [];

    for (const scriptUrl of scriptSrcs.slice(0, 20)) {
      // Method 1: Probe .map suffix
      const mapUrl = scriptUrl + ".map";
      try {
        const res = await fetchRaw(mapUrl);
        probed.push({ url: mapUrl, status: res.status });

        if (res.ok) {
          const contentType = res.headers.get("content-type") ?? "";
          const body = await res.text();

          // Validate it's actually a source map
          if (body.includes('"sources"') || contentType.includes("json")) {
            try {
              const sourceMap = JSON.parse(body);
              const sources: string[] = sourceMap.sources ?? [];
              const sensitiveInfo: string[] = [];

              for (const s of sources) {
                if (/\/home\/|\/Users\/|\/root\/|C:\\Users/i.test(s)) sensitiveInfo.push(`Local path: ${s}`);
                if (/\.env|config|secret|password|credential|private/i.test(s)) sensitiveInfo.push(`Sensitive file: ${s}`);
                if (/internal|private|staging|dev/i.test(s)) sensitiveInfo.push(`Internal path: ${s}`);
              }

              found.push({
                scriptUrl,
                mapUrl,
                detectedVia: ".map suffix probe",
                sourceCount: sources.length,
                sources: sources.slice(0, 50),
                sensitiveInfo,
              });
              continue;
            } catch {
              // Not valid JSON, skip
            }
          }
        }
      } catch {
        probed.push({ url: mapUrl, status: "error" });
      }

      // Method 2: Check sourceMappingURL comment in JS file
      try {
        const jsRes = await fetchRaw(scriptUrl);
        if (jsRes.ok) {
          const jsBody = await jsRes.text();
          const mappingMatch = jsBody.match(/\/\/[#@]\s*sourceMappingURL\s*=\s*(\S+)/);
          if (mappingMatch) {
            const mappingUrl = resolveUrl(scriptUrl, mappingMatch[1]);

            // If it's a data URI, skip external fetch
            if (mappingUrl.startsWith("data:")) {
              found.push({
                scriptUrl,
                mapUrl: "(inline data URI)",
                detectedVia: "sourceMappingURL comment (inline)",
                sourceCount: 0,
                sources: [],
                sensitiveInfo: ["Source map is embedded inline as data URI"],
              });
              continue;
            }

            try {
              const mapRes = await fetchRaw(mappingUrl);
              probed.push({ url: mappingUrl, status: mapRes.status });

              if (mapRes.ok) {
                const mapBody = await mapRes.text();
                try {
                  const sourceMap = JSON.parse(mapBody);
                  const sources: string[] = sourceMap.sources ?? [];
                  const sensitiveInfo: string[] = [];

                  for (const s of sources) {
                    if (/\/home\/|\/Users\/|\/root\/|C:\\Users/i.test(s)) sensitiveInfo.push(`Local path: ${s}`);
                    if (/\.env|config|secret|password|credential|private/i.test(s)) sensitiveInfo.push(`Sensitive file: ${s}`);
                    if (/internal|private|staging|dev/i.test(s)) sensitiveInfo.push(`Internal path: ${s}`);
                  }

                  found.push({
                    scriptUrl,
                    mapUrl: mappingUrl,
                    detectedVia: "sourceMappingURL comment",
                    sourceCount: sources.length,
                    sources: sources.slice(0, 50),
                    sensitiveInfo,
                  });
                } catch {
                  // Not valid JSON
                }
              }
            } catch {
              probed.push({ url: mappingUrl, status: "error" });
            }
          }
        }
      } catch {
        // Failed to fetch JS file, skip
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              totalScripts: scriptSrcs.length,
              sourceMapsFound: found.length,
              sourceMaps: found,
              probed: probed.slice(0, 30),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 3: web_websocket — WebSocket Endpoint Discovery
// ═══════════════════════════════════════════════════════════════════════════════

const webWebsocket: ToolDef = {
  name: "web_websocket",
  description:
    "Discover WebSocket endpoints by probing common WebSocket paths. Tests for Socket.IO, SockJS, ActionCable, SignalR, GraphQL subscriptions, MQTT, and more. Identifies backend frameworks from response patterns.",
  schema: {
    url: z.string().url().describe("Base URL to discover WebSocket endpoints"),
  },
  async execute(args) {
    const baseUrl = (args.url as string).replace(/\/+$/, "");
    const results: {
      path: string;
      fullUrl: string;
      status: number | string;
      responsive: boolean;
      framework: string | null;
      details: string | null;
    }[] = [];

    for (const ep of WS_ENDPOINTS) {
      const fullUrl = baseUrl + ep.path;
      try {
        const res = await fetchRaw(fullUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            Upgrade: "websocket",
            Connection: "Upgrade",
            "Sec-WebSocket-Version": "13",
            "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
          },
        });

        const status = res.status;
        const responsive = status === 101 || status === 200 || status === 400;
        let details: string | null = null;
        let framework = ep.framework;

        if (responsive) {
          const body = await res.text().catch(() => "");

          // Socket.IO detection
          if (body.includes('"sid"') && body.includes('"upgrades"')) {
            framework = "Socket.IO (Node.js)";
            details = "Socket.IO handshake response detected";
          }

          // SockJS detection
          if (body.includes('"websocket"') && body.includes('"entropy"')) {
            framework = "SockJS";
            details = "SockJS info endpoint responded";
          }

          // SignalR detection
          if (body.includes('"connectionId"') || body.includes('"connectionToken"')) {
            framework = "SignalR (ASP.NET)";
            details = "SignalR negotiation response detected";
          }

          // ActionCable detection
          if (res.headers.get("x-request-id") && ep.path === "/cable") {
            framework = "ActionCable (Rails)";
          }
        }

        results.push({
          path: ep.path,
          fullUrl,
          status,
          responsive,
          framework,
          details,
        });
      } catch (err) {
        results.push({
          path: ep.path,
          fullUrl,
          status: (err as Error).message.includes("timeout") ? "timeout" : "error",
          responsive: false,
          framework: ep.framework,
          details: null,
        });
      }
    }

    const activeEndpoints = results.filter((r) => r.responsive);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              baseUrl,
              totalProbed: results.length,
              activeEndpoints: activeEndpoints.length,
              endpoints: results,
              frameworksDetected: [...new Set(activeEndpoints.map((e) => e.framework).filter(Boolean))],
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 4: web_api_discovery — API Documentation Auto-Discovery
// ═══════════════════════════════════════════════════════════════════════════════

const webApiDiscovery: ToolDef = {
  name: "web_api_discovery",
  description:
    "Auto-discover API documentation endpoints including OpenAPI/Swagger, GraphQL, Docker Registry, and Kubernetes APIs. Parses found OpenAPI specs to extract titles, versions, endpoint counts, and authentication schemes.",
  schema: {
    url: z.string().url().describe("Base URL to discover API documentation"),
  },
  async execute(args) {
    const baseUrl = (args.url as string).replace(/\/+$/, "");

    const discovered: {
      category: string;
      path: string;
      fullUrl: string;
      status: number;
      details: Record<string, unknown> | null;
    }[] = [];

    // --- OpenAPI / Swagger ---
    for (const path of API_PATHS.openapi) {
      const fullUrl = baseUrl + path;
      try {
        const res = await fetchRaw(fullUrl);
        if (res.ok || res.status === 401 || res.status === 403) {
          let details: Record<string, unknown> | null = null;
          if (res.ok) {
            const body = await res.text();
            try {
              const spec = JSON.parse(body);
              const info = spec.info ?? {};
              const paths = spec.paths ? Object.keys(spec.paths) : [];
              const security = spec.securityDefinitions ?? spec.components?.securitySchemes ?? {};
              details = {
                title: info.title ?? null,
                version: info.version ?? null,
                endpointCount: paths.length,
                sampleEndpoints: paths.slice(0, 10),
                authSchemes: Object.keys(security),
                openapiVersion: spec.openapi ?? spec.swagger ?? null,
              };
            } catch {
              // YAML or non-JSON — still report as found
              details = { note: "Response received but not parseable as JSON (may be YAML)" };
            }
          } else {
            details = { note: `Auth required (HTTP ${res.status}) — endpoint exists but is protected` };
          }
          discovered.push({ category: "OpenAPI/Swagger", path, fullUrl, status: res.status, details });
        }
      } catch {
        // Skip unreachable
      }
    }

    // --- GraphQL ---
    for (const path of API_PATHS.graphql) {
      const fullUrl = baseUrl + path;
      try {
        const res = await fetchRaw(fullUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
          body: JSON.stringify({ query: "{ __typename }" }),
        });
        if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
          let details: Record<string, unknown> | null = null;
          if (res.ok) {
            try {
              const body = await res.json();
              details = { response: body, introspectionHint: "Use web_graphql for full schema introspection" };
            } catch {
              details = { note: "GraphQL endpoint responded but response is not JSON" };
            }
          } else {
            details = { note: `GraphQL endpoint exists (HTTP ${res.status})` };
          }
          discovered.push({ category: "GraphQL", path, fullUrl, status: res.status, details });
        }
      } catch {
        // Skip
      }
    }

    // --- Docker Registry ---
    for (const path of API_PATHS.docker) {
      const fullUrl = baseUrl + path;
      try {
        const res = await fetchRaw(fullUrl);
        if (res.ok || res.status === 401) {
          let details: Record<string, unknown> | null = null;
          if (res.ok) {
            try {
              const body = await res.json();
              details = { response: body };
            } catch {
              details = { note: "Docker Registry endpoint responded" };
            }
          } else {
            details = {
              note: "Docker Registry requires auth",
              wwwAuthenticate: res.headers.get("www-authenticate"),
            };
          }
          discovered.push({ category: "Docker Registry", path, fullUrl, status: res.status, details });
        }
      } catch {
        // Skip
      }
    }

    // --- Kubernetes ---
    for (const path of API_PATHS.kubernetes) {
      const fullUrl = baseUrl + path;
      try {
        const res = await fetchRaw(fullUrl);
        if (res.ok || res.status === 401 || res.status === 403) {
          let details: Record<string, unknown> | null = null;
          if (res.ok) {
            try {
              const body = await res.json();
              details = { response: body };
            } catch {
              details = { note: "Kubernetes endpoint responded" };
            }
          } else {
            details = { note: `Kubernetes API exists but requires auth (HTTP ${res.status})` };
          }
          discovered.push({ category: "Kubernetes", path, fullUrl, status: res.status, details });
        }
      } catch {
        // Skip
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              baseUrl,
              totalDiscovered: discovered.length,
              byCategory: Object.fromEntries(
                [...new Set(discovered.map((d) => d.category))].map((cat) => [
                  cat,
                  discovered.filter((d) => d.category === cat).length,
                ]),
              ),
              discovered,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 5: web_graphql — GraphQL Introspection
// ═══════════════════════════════════════════════════════════════════════════════

const webGraphql: ToolDef = {
  name: "web_graphql",
  description:
    "Perform GraphQL introspection on a given endpoint. Sends __schema query to extract types, queries, mutations, and identifies dangerous mutations like deleteUser, updateRole, createAdmin, and resetPassword.",
  schema: {
    url: z.string().url().describe("GraphQL endpoint URL"),
  },
  async execute(args) {
    const url = args.url as string;

    const introspectionQuery = JSON.stringify({
      query: `{
        __schema {
          types { name kind fields { name type { name kind } } }
          mutationType { fields { name } }
          queryType { fields { name } }
        }
      }`,
    });

    let schema: any = null;
    let method = "POST";

    // Try POST first
    try {
      const res = await fetchRaw(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
        body: introspectionQuery,
      });

      if (res.ok) {
        const body = await res.json();
        if (body.data?.__schema) {
          schema = body.data.__schema;
        } else if (body.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    url,
                    introspectionEnabled: false,
                    method: "POST",
                    errors: body.errors,
                    note: "Introspection is disabled or blocked on this endpoint",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      }
    } catch {
      // POST failed, try GET
    }

    // Try GET if POST didn't work
    if (!schema) {
      method = "GET";
      try {
        const getUrl = `${url}?query=${encodeURIComponent('{ __schema { types { name kind fields { name type { name kind } } } mutationType { fields { name } } queryType { fields { name } } } }')}`;
        const res = await fetchRaw(getUrl);
        if (res.ok) {
          const body = await res.json();
          if (body.data?.__schema) {
            schema = body.data.__schema;
          }
        }
      } catch {
        // GET also failed
      }
    }

    if (!schema) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                url,
                introspectionEnabled: false,
                note: "Could not retrieve schema via POST or GET. Introspection may be disabled.",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // --- Parse schema ---
    const types = (schema.types ?? [])
      .filter((t: any) => !t.name.startsWith("__"))
      .map((t: any) => ({
        name: t.name,
        kind: t.kind,
        fieldCount: t.fields?.length ?? 0,
      }));

    const queryFields = (schema.queryType?.fields ?? []).map((f: any) => f.name);
    const mutationFields = (schema.mutationType?.fields ?? []).map((f: any) => f.name);

    // --- Identify dangerous mutations ---
    const dangerousMutationsFound = mutationFields.filter((name: string) =>
      DANGEROUS_MUTATIONS.some((d) => name.toLowerCase().includes(d.toLowerCase())),
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              introspectionEnabled: true,
              method,
              typeCount: types.length,
              types: types.slice(0, 100),
              queryFields,
              mutationFields,
              dangerousMutations: dangerousMutationsFound,
              riskLevel:
                dangerousMutationsFound.length > 3
                  ? "HIGH"
                  : dangerousMutationsFound.length > 0
                    ? "MEDIUM"
                    : "LOW",
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 6: web_vhost — Virtual Host Enumeration
// ═══════════════════════════════════════════════════════════════════════════════

const webVhost: ToolDef = {
  name: "web_vhost",
  description:
    "Enumerate virtual hosts by sending HTTP requests with different Host headers. Compares response status codes, content lengths, and body content to identify distinct virtual hosts behind a single IP address.",
  schema: {
    url: z.string().url().describe("URL to enumerate virtual hosts"),
    hostnames: z
      .array(z.string())
      .optional()
      .describe("Additional hostnames to try beyond the default wordlist"),
  },
  async execute(args) {
    const url = args.url as string;
    const extraHostnames = (args.hostnames as string[] | undefined) ?? [];
    const parsedUrl = new URL(url);
    const baseHost = parsedUrl.hostname;

    // Get baseline response
    let baselineStatus: number;
    let baselineLength: number;
    let baselineBody: string;
    try {
      const res = await fetchRaw(url);
      baselineStatus = res.status;
      baselineBody = await res.text();
      baselineLength = baselineBody.length;
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ url, error: `Failed to fetch baseline: ${(err as Error).message}` }, null, 2),
          },
        ],
      };
    }

    const hostnames = [...new Set([...DEFAULT_VHOSTS, ...extraHostnames])].filter((h) => h !== baseHost);

    const results: {
      hostname: string;
      status: number | string;
      contentLength: number;
      different: boolean;
      differenceType: string[];
    }[] = [];

    for (const hostname of hostnames) {
      try {
        const res = await fetchRaw(url, {
          headers: {
            Host: hostname,
            "User-Agent": USER_AGENT,
          },
        });
        const body = await res.text();
        const status = res.status;
        const contentLength = body.length;

        const differenceType: string[] = [];
        if (status !== baselineStatus) differenceType.push("status_code");
        if (Math.abs(contentLength - baselineLength) > 100) differenceType.push("content_length");
        if (body !== baselineBody && differenceType.length === 0) {
          // Check if body differs significantly
          if (body.length > 0 && baselineBody.length > 0) {
            const similarity = body.substring(0, 500) === baselineBody.substring(0, 500);
            if (!similarity) differenceType.push("body_content");
          }
        }

        results.push({
          hostname,
          status,
          contentLength,
          different: differenceType.length > 0,
          differenceType,
        });
      } catch {
        results.push({
          hostname,
          status: "error",
          contentLength: 0,
          different: false,
          differenceType: [],
        });
      }
    }

    const distinctVhosts = results.filter((r) => r.different);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              baseHost,
              baseline: {
                status: baselineStatus,
                contentLength: baselineLength,
              },
              totalTested: results.length,
              distinctVhosts: distinctVhosts.length,
              results,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 7: web_sourcemap_paths — Source Map Intelligence Analysis
// ═══════════════════════════════════════════════════════════════════════════════

const webSourcemapPaths: ToolDef = {
  name: "web_sourcemap_paths",
  description:
    "Parse a downloaded source map for intelligence. Extracts internal file paths, analyzes directory structure patterns, identifies environment indicators (dev/staging/prod), and extracts dependency information from import paths.",
  schema: {
    url: z.string().url().describe("Source map URL to analyze"),
  },
  async execute(args) {
    const url = args.url as string;

    let sourceMapData: any;
    try {
      const res = await fetchRaw(url);
      if (!res.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ url, error: `HTTP ${res.status} — source map not accessible` }, null, 2),
            },
          ],
        };
      }
      const body = await res.text();
      sourceMapData = JSON.parse(body);
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ url, error: `Failed to fetch/parse source map: ${(err as Error).message}` }, null, 2),
          },
        ],
      };
    }

    const sources: string[] = sourceMapData.sources ?? [];
    const version = sourceMapData.version ?? null;
    const file = sourceMapData.file ?? null;

    // --- Directory Structure Analysis ---
    const directories = new Set<string>();
    for (const s of sources) {
      const parts = s.split("/");
      for (let i = 1; i < parts.length; i++) {
        directories.add(parts.slice(0, i).join("/"));
      }
    }

    // --- Environment Indicators ---
    const envIndicators: { path: string; environment: string }[] = [];
    for (const s of sources) {
      const lower = s.toLowerCase();
      if (/\/dev\/|\.dev\.|dev-config|development/i.test(lower)) envIndicators.push({ path: s, environment: "development" });
      if (/\/staging\/|\.staging\.|staging-config/i.test(lower)) envIndicators.push({ path: s, environment: "staging" });
      if (/\/prod\/|\.prod\.|production|\.production\./i.test(lower)) envIndicators.push({ path: s, environment: "production" });
      if (/\/test\/|\.test\.|\.spec\.|__tests__|__mocks__/i.test(lower)) envIndicators.push({ path: s, environment: "test" });
    }

    // --- Dependency Extraction ---
    const dependencies = new Set<string>();
    for (const s of sources) {
      const nodeModulesMatch = s.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
      if (nodeModulesMatch) dependencies.add(nodeModulesMatch[1]);
    }

    // --- Sensitive File Detection ---
    const sensitiveFiles: string[] = [];
    for (const s of sources) {
      if (/\.env|config\.(js|ts|json)|secret|password|credential|private[-_]?key|api[-_]?key/i.test(s)) {
        sensitiveFiles.push(s);
      }
    }

    // --- Local Path Leaks ---
    const localPaths: string[] = [];
    for (const s of sources) {
      if (/^\/home\/|^\/Users\/|^\/root\/|^C:\\Users|^\/var\/www|^\/opt\/|^\/srv\//i.test(s)) {
        localPaths.push(s);
      }
    }

    // --- File Type Breakdown ---
    const fileTypes: Record<string, number> = {};
    for (const s of sources) {
      const ext = s.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "unknown";
      fileTypes[ext] = (fileTypes[ext] ?? 0) + 1;
    }

    // --- Top-Level Directories ---
    const topLevelDirs: Record<string, number> = {};
    for (const s of sources) {
      const clean = s.replace(/^\.\/|^webpack:\/\/\/|^\//, "");
      const topDir = clean.split("/")[0];
      if (topDir) topLevelDirs[topDir] = (topLevelDirs[topDir] ?? 0) + 1;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              version,
              file,
              totalSources: sources.length,
              totalDirectories: directories.size,
              topLevelDirectories: topLevelDirs,
              fileTypes,
              sources: sources.slice(0, 100),
              envIndicators,
              dependencies: [...dependencies].sort(),
              sensitiveFiles,
              localPaths,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 8: web_analytics — Analytics & Tracking Code Detection
// ═══════════════════════════════════════════════════════════════════════════════

const webAnalytics: ToolDef = {
  name: "web_analytics",
  description:
    "Detect analytics and tracking codes embedded in a web page. Identifies Google Analytics, GTM, Facebook Pixel, Hotjar, Segment, Mixpanel, Amplitude, PostHog, Plausible, Matomo, Heap, FullStory, Clarity, AdSense, Pinterest, Twitter, LinkedIn, TikTok pixels. Extracts tracking IDs for cross-domain correlation.",
  schema: {
    url: z.string().url().describe("URL to detect analytics/tracking codes"),
  },
  async execute(args) {
    const url = args.url as string;
    const html = await fetchPage(url);

    const detections: {
      name: string;
      trackingId: string | null;
      crossReferable: boolean;
      matchedPattern: string;
    }[] = [];

    const seenServices = new Set<string>();

    for (const service of ANALYTICS_DETECT) {
      for (const pattern of service.patterns) {
        if (pattern.test(html)) {
          if (seenServices.has(service.name)) continue;
          seenServices.add(service.name);

          let trackingId: string | null = null;
          if (service.idPattern) {
            const idMatch = html.match(service.idPattern);
            if (idMatch) trackingId = idMatch[1] ?? idMatch[0];
          }

          detections.push({
            name: service.name,
            trackingId,
            crossReferable: service.crossRef,
            matchedPattern: pattern.source,
          });
          break;
        }
      }
    }

    // --- Cross-Reference Opportunities ---
    const crossRefIds = detections
      .filter((d) => d.crossReferable && d.trackingId)
      .map((d) => ({ service: d.name, id: d.trackingId }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              totalDetected: detections.length,
              detections,
              crossReferenceOpportunities: crossRefIds,
              note:
                crossRefIds.length > 0
                  ? "These tracking IDs can be used to find other domains owned by the same organization"
                  : "No cross-referenceable tracking IDs found",
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tool 9: web_sri — Subresource Integrity Analysis
// ═══════════════════════════════════════════════════════════════════════════════

const webSri: ToolDef = {
  name: "web_sri",
  description:
    "Analyze Subresource Integrity (SRI) usage on a web page. Identifies scripts and stylesheets loaded with or without SRI integrity attributes, extracts SHA hashes, detects trust chain gaps from CDN-loaded resources missing SRI, and compares CDN vs self-hosted resource security posture.",
  schema: {
    url: z.string().url().describe("URL to analyze Subresource Integrity"),
  },
  async execute(args) {
    const url = args.url as string;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const parsedUrl = new URL(url);

    const withSRI: {
      tag: string;
      src: string;
      integrity: string;
      algorithm: string;
      crossorigin: string | null;
      isCDN: boolean;
    }[] = [];

    const withoutSRI: {
      tag: string;
      src: string;
      isCDN: boolean;
      risk: string;
    }[] = [];

    function isCDNUrl(srcUrl: string): boolean {
      try {
        const parsed = new URL(srcUrl, url);
        return parsed.hostname !== parsedUrl.hostname;
      } catch {
        return false;
      }
    }

    function extractAlgorithm(integrity: string): string {
      const match = integrity.match(/^(sha\d+)-/);
      return match ? match[1] : "unknown";
    }

    // --- Analyze <script> tags ---
    $("script[src]").each((_i, el) => {
      const src = $(el).attr("src") ?? "";
      const integrity = $(el).attr("integrity") ?? "";
      const crossorigin = $(el).attr("crossorigin") ?? null;
      const fullSrc = resolveUrl(url, src);
      const cdn = isCDNUrl(fullSrc);

      if (integrity) {
        withSRI.push({
          tag: "script",
          src: fullSrc,
          integrity,
          algorithm: extractAlgorithm(integrity),
          crossorigin,
          isCDN: cdn,
        });
      } else {
        withoutSRI.push({
          tag: "script",
          src: fullSrc,
          isCDN: cdn,
          risk: cdn
            ? "HIGH — CDN-loaded script without SRI can be tampered if CDN is compromised"
            : "LOW — Self-hosted script, SRI less critical but still recommended",
        });
      }
    });

    // --- Analyze <link rel="stylesheet"> tags ---
    $('link[rel="stylesheet"][href]').each((_i, el) => {
      const href = $(el).attr("href") ?? "";
      const integrity = $(el).attr("integrity") ?? "";
      const crossorigin = $(el).attr("crossorigin") ?? null;
      const fullHref = resolveUrl(url, href);
      const cdn = isCDNUrl(fullHref);

      if (integrity) {
        withSRI.push({
          tag: "link",
          src: fullHref,
          integrity,
          algorithm: extractAlgorithm(integrity),
          crossorigin,
          isCDN: cdn,
        });
      } else {
        withoutSRI.push({
          tag: "link",
          src: fullHref,
          isCDN: cdn,
          risk: cdn
            ? "MEDIUM — CDN-loaded stylesheet without SRI could be modified"
            : "LOW — Self-hosted stylesheet",
        });
      }
    });

    // --- Stats ---
    const totalResources = withSRI.length + withoutSRI.length;
    const cdnWithoutSRI = withoutSRI.filter((r) => r.isCDN);
    const algorithmBreakdown: Record<string, number> = {};
    for (const r of withSRI) {
      algorithmBreakdown[r.algorithm] = (algorithmBreakdown[r.algorithm] ?? 0) + 1;
    }

    const sriCoverage = totalResources > 0 ? Math.round((withSRI.length / totalResources) * 100) : 0;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              url,
              totalExternalResources: totalResources,
              withSRI: withSRI.length,
              withoutSRI: withoutSRI.length,
              sriCoveragePercent: sriCoverage,
              cdnResourcesWithoutSRI: cdnWithoutSRI.length,
              algorithmBreakdown,
              overallRisk:
                cdnWithoutSRI.length > 3
                  ? "HIGH"
                  : cdnWithoutSRI.length > 0
                    ? "MEDIUM"
                    : "LOW",
              resourcesWithSRI: withSRI,
              resourcesWithoutSRI: withoutSRI,
              recommendations:
                cdnWithoutSRI.length > 0
                  ? [
                      `Add SRI hashes to ${cdnWithoutSRI.length} CDN-loaded resource(s) to prevent supply-chain attacks`,
                      "Use sha384 or sha512 for stronger integrity guarantees",
                      'Ensure crossorigin="anonymous" is set on all SRI-protected resources',
                    ]
                  : ["SRI is properly configured for CDN resources"],
            },
            null,
            2,
          ),
        },
      ],
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

export const webTools: ToolDef[] = [
  webTech,
  webSourcemaps,
  webWebsocket,
  webApiDiscovery,
  webGraphql,
  webVhost,
  webSourcemapPaths,
  webAnalytics,
  webSri,
];
