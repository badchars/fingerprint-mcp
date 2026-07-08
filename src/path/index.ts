import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { json, text } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";

// ─── Rate Limiter & Cache ───

const limiter = new RateLimiter(200);
const cache = new TTLCache<any>(300_000);

// ─── Constants ───

const REQUEST_TIMEOUT = 8_000;
const BATCH_SIZE = 10;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Path Databases ───

const SENSITIVE_PATHS: Record<string, string[]> = {
  admin: [
    "/admin/", "/admin/login", "/wp-admin/", "/wp-login.php", "/administrator/",
    "/manager/html", "/phpmyadmin/", "/adminer.php", "/cockpit/", "/grafana/",
    "/kibana/", "/jenkins/", "/hudson/", "/nagios/", "/cacti/", "/zabbix/",
    "/webmin/", "/cpanel", "/plesk", "/directadmin", "/console", "/dashboard", "/portal",
  ],
  config: [
    "/.env", "/.env.bak", "/.env.local", "/.env.production",
    "/wp-config.php", "/wp-config.php.bak", "/web.config", "/config.php",
    "/configuration.php", "/settings.py", "/application.yml", "/application.properties",
    "/appsettings.json", "/config.json", "/config.yaml", "/database.yml",
    "/secrets.yml", "/credentials.json", "/local.settings.json",
  ],
  debug: [
    "/actuator", "/actuator/env", "/actuator/health", "/actuator/info",
    "/actuator/mappings", "/actuator/configprops", "/actuator/heapdump",
    "/actuator/threaddump", "/debug/vars", "/debug/pprof", "/debug/pprof/goroutine",
    "/server-info", "/server-status", "/nginx_status", "/stub_status",
    "/console", "/elmah.axd", "/_profiler", "/trace", "/metrics",
    "/health", "/healthz", "/ready", "/status",
  ],
  backup: [
    "/backup/", "/backup.zip", "/backup.tar.gz", "/backup.sql", "/dump.sql",
    "/db.sql", "/database.sql", "/site.zip", "/www.zip", "/htdocs.zip",
    "/public.zip", "/wp-content/debug.log", "/error.log", "/access.log", "/debug.log",
  ],
  vcs: [
    "/.git/config", "/.git/HEAD", "/.git/index", "/.git/logs/HEAD",
    "/.gitignore", "/.svn/entries", "/.svn/wc.db", "/.hg/hgrc",
    "/.bzr/README", "/CVS/Root",
  ],
  dependency: [
    "/composer.json", "/composer.lock", "/package.json", "/package-lock.json",
    "/yarn.lock", "/requirements.txt", "/Pipfile", "/Pipfile.lock",
    "/go.mod", "/go.sum", "/Gemfile", "/Gemfile.lock", "/pom.xml",
    "/build.gradle", "/Cargo.toml", "/Cargo.lock", "/mix.exs",
  ],
  "well-known": [
    "/.well-known/security.txt", "/.well-known/openid-configuration",
    "/.well-known/apple-app-site-association", "/.well-known/assetlinks.json",
    "/.well-known/change-password", "/.well-known/acme-challenge/",
    "/.well-known/matrix/server", "/.well-known/nodeinfo", "/.well-known/webfinger",
  ],
  "api-docs": [
    "/swagger.json", "/swagger.yaml", "/openapi.json", "/openapi.yaml",
    "/api-docs", "/api-docs.json", "/swagger-ui.html", "/swagger-ui/",
    "/swagger-resources", "/graphql", "/graphiql", "/playground", "/altair",
    "/voyager", "/_catalog", "/v2/_catalog", "/api/v1", "/api/v2", "/api/v3",
  ],
  cloud: [
    "/latest/meta-data/", "/latest/user-data/",
    "/computeMetadata/v1/", "/metadata/instance", "/metadata/v1/",
  ],
  "ci-cd": [
    "/Jenkinsfile", "/.github/workflows/", "/.gitlab-ci.yml",
    "/Dockerfile", "/docker-compose.yml", "/docker-compose.yaml",
    "/.drone.yml", "/.circleci/config.yml", "/.travis.yml",
    "/Vagrantfile", "/Procfile",
  ],
  secrets: [
    "/.npmrc", "/.pypirc", "/.docker/config.json", "/id_rsa", "/id_rsa.pub",
    "/.ssh/authorized_keys", "/.htpasswd", "/.htaccess", "/.netrc",
    "/.pgpass", "/.my.cnf", "/wp-content/uploads/",
    "/.aws/credentials", "/.azure/accessTokens.json",
  ],
};

const CATEGORY_ENUM = [
  "admin", "config", "debug", "backup", "vcs", "dependency",
  "well-known", "api-docs", "cloud", "ci-cd", "secrets",
] as const;

// ─── Debug Endpoint Definitions ───

interface DebugEndpoint {
  path: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  technology: string;
  description: string;
}

const DEBUG_ENDPOINTS: DebugEndpoint[] = [
  // Spring Boot Actuator
  { path: "/actuator/env", severity: "CRITICAL", technology: "Spring Boot Actuator", description: "Exposes all environment variables including secrets, API keys, and database passwords" },
  { path: "/actuator/heapdump", severity: "CRITICAL", technology: "Spring Boot Actuator", description: "JVM heap dump — contains in-memory secrets, session tokens, and credentials" },
  { path: "/actuator/mappings", severity: "HIGH", technology: "Spring Boot Actuator", description: "Lists all URL mappings/routes — reveals hidden endpoints and internal APIs" },
  { path: "/actuator/configprops", severity: "HIGH", technology: "Spring Boot Actuator", description: "Exposes all configuration properties including database URLs and credentials" },
  { path: "/actuator/info", severity: "LOW", technology: "Spring Boot Actuator", description: "Application info endpoint — may reveal version, git commit, build info" },
  { path: "/actuator/health", severity: "INFO", technology: "Spring Boot Actuator", description: "Health check — confirms Spring Boot, may reveal component status" },
  { path: "/actuator/beans", severity: "MEDIUM", technology: "Spring Boot Actuator", description: "Lists all Spring beans — reveals application architecture and dependencies" },
  { path: "/actuator/conditions", severity: "LOW", technology: "Spring Boot Actuator", description: "Auto-configuration conditions — reveals why beans were/weren't created" },
  { path: "/actuator/threaddump", severity: "MEDIUM", technology: "Spring Boot Actuator", description: "Thread dump — reveals active operations, database connections, internal URLs" },
  { path: "/actuator/loggers", severity: "MEDIUM", technology: "Spring Boot Actuator", description: "Logger configuration — can be used to enable debug logging and leak data" },
  { path: "/actuator/metrics", severity: "LOW", technology: "Spring Boot Actuator", description: "Application metrics — reveals request counts, error rates, JVM stats" },
  { path: "/actuator/scheduledtasks", severity: "LOW", technology: "Spring Boot Actuator", description: "Scheduled tasks — reveals cron jobs and internal processing logic" },
  { path: "/actuator", severity: "MEDIUM", technology: "Spring Boot Actuator", description: "Actuator index — lists all enabled actuator endpoints" },
  // Go debug
  { path: "/debug/vars", severity: "MEDIUM", technology: "Go expvar", description: "Go runtime variables — memory stats, goroutine count, custom vars" },
  { path: "/debug/pprof", severity: "HIGH", technology: "Go pprof", description: "CPU profiling endpoint — can be used to profile the application remotely" },
  { path: "/debug/pprof/goroutine", severity: "MEDIUM", technology: "Go pprof", description: "Goroutine dump — reveals active operations and stack traces" },
  // Apache
  { path: "/server-info", severity: "HIGH", technology: "Apache", description: "Full Apache module list, configuration, and server info" },
  { path: "/server-status", severity: "HIGH", technology: "Apache", description: "Active connections, request URIs, client IPs, worker status" },
  // Flask/Werkzeug
  { path: "/console", severity: "CRITICAL", technology: "Flask/Werkzeug", description: "Interactive Python shell — full RCE if no PIN or PIN is bypassed" },
  // Tomcat
  { path: "/manager/html", severity: "CRITICAL", technology: "Apache Tomcat", description: "Tomcat Manager — deploy/undeploy WARs, full server control (try admin:admin, tomcat:tomcat)" },
  { path: "/host-manager/html", severity: "HIGH", technology: "Apache Tomcat", description: "Tomcat Host Manager — create/delete virtual hosts" },
  // PHP
  { path: "/phpinfo.php", severity: "HIGH", technology: "PHP", description: "Full PHP configuration — paths, modules, environment variables, server info" },
  { path: "/info.php", severity: "HIGH", technology: "PHP", description: "PHP info page — same as phpinfo.php, alternate filename" },
  // Node.js
  { path: "/debug", severity: "MEDIUM", technology: "Node.js", description: "Node.js debug endpoint — may expose inspector or diagnostic data" },
  // Nginx
  { path: "/nginx_status", severity: "MEDIUM", technology: "Nginx", description: "Nginx stub status — active connections, request counts" },
  { path: "/stub_status", severity: "MEDIUM", technology: "Nginx", description: "Nginx stub status — alternate path for connection stats" },
  // Laravel
  { path: "/telescope", severity: "HIGH", technology: "Laravel Telescope", description: "Debug dashboard — requests, queries, logs, mail, notifications, jobs" },
  { path: "/_debugbar", severity: "HIGH", technology: "Laravel Debugbar", description: "Debug toolbar — queries, routes, views, session data" },
];

// ─── API Version Paths ───

const API_VERSION_PATHS = [
  "/api/v0", "/api/v1", "/api/v2", "/api/v3", "/api/v4",
  "/api/beta", "/api/internal", "/api/legacy", "/api/dev", "/api/staging",
  "/v0", "/v1", "/v2", "/v3",
  "/api", "/rest", "/graphql", "/grpc",
];

// ─── VCS/Secret Exposure Paths ───

const VCS_LEAK_PATHS = [
  "/.git/config", "/.git/HEAD", "/.git/logs/HEAD", "/.git/index",
  "/.svn/entries", "/.svn/wc.db",
  "/.env", "/.DS_Store", "/Thumbs.db",
];

// ─── Helpers ───

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

interface ProbeResult {
  path: string;
  status: number;
  contentType: string;
  size: number;
  redirectUrl?: string;
  headers?: Record<string, string>;
  body?: string;
}

async function probePath(
  baseUrl: string,
  path: string,
  method: "HEAD" | "GET" = "HEAD",
  followRedirect = true,
): Promise<ProbeResult | null> {
  try {
    const url = `${stripTrailingSlash(baseUrl)}${path}`;
    const res = await fetch(url, {
      method,
      headers: { "User-Agent": USER_AGENT },
      redirect: followRedirect ? "follow" : "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    const contentType = res.headers.get("content-type") ?? "unknown";
    const redirectUrl = res.headers.get("location") ?? undefined;
    const allHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => { allHeaders[k] = v; });

    let body: string | undefined;
    let size = 0;
    if (method === "GET") {
      body = await res.text();
      size = body.length;
    } else {
      const cl = res.headers.get("content-length");
      size = cl ? parseInt(cl, 10) : 0;
    }

    return {
      path,
      status: res.status,
      contentType,
      size,
      redirectUrl,
      headers: allHeaders,
      body,
    };
  } catch {
    return null;
  }
}

async function batchProbe(
  baseUrl: string,
  paths: string[],
  method: "HEAD" | "GET" = "HEAD",
  batchSize = BATCH_SIZE,
): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];

  for (let i = 0; i < paths.length; i += batchSize) {
    await limiter.acquire();
    const batch = paths.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((p) => probePath(baseUrl, p, method)),
    );

    for (const result of settled) {
      if (result.status === "fulfilled" && result.value !== null) {
        results.push(result.value);
      }
    }
  }

  return results;
}

// ─── Tool 1: path_sensitive ───

const pathSensitive: ToolDef = {
  name: "path_sensitive",
  description:
    "Sensitive path probing: 200+ paths organized by 11 categories (admin, config, debug, backup, vcs, dependency, " +
    "well-known, api-docs, cloud, ci-cd, secrets). Sends HEAD requests in batches, reports status code, content-type, " +
    "and response size for every non-404 hit. Powerful attack surface discovery tool.",
  schema: {
    url: z.string().url().describe("Base URL to probe sensitive paths"),
    categories: z
      .array(
        z.enum(CATEGORY_ENUM),
      )
      .optional()
      .describe("Categories to probe (default: all)"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const baseUrl = stripTrailingSlash(args.url as string);
    const selectedCategories = (args.categories as string[] | undefined) ?? [...CATEGORY_ENUM];

    const cacheKey = `path_sensitive:${baseUrl}:${selectedCategories.sort().join(",")}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    // Collect all paths from selected categories
    const pathsByCategory: Record<string, string[]> = {};
    const allPaths: string[] = [];
    for (const cat of selectedCategories) {
      const paths = SENSITIVE_PATHS[cat];
      if (paths) {
        pathsByCategory[cat] = paths;
        allPaths.push(...paths);
      }
    }

    // Phase 1: HEAD requests for all paths
    const headResults = await batchProbe(baseUrl, allPaths, "HEAD");

    // Filter: only non-404 results
    const interestingResults = headResults.filter(
      (r) => r.status !== 404,
    );

    // Phase 2: GET request for interesting paths to check content
    const interestingPaths = interestingResults
      .filter((r) => r.status === 200 || r.status === 301 || r.status === 302)
      .map((r) => r.path);

    const getResults = await batchProbe(baseUrl, interestingPaths, "GET");
    const getMap = new Map(getResults.map((r) => [r.path, r]));

    // Build categorized results
    const findings: Record<string, any[]> = {};
    let totalHits = 0;

    for (const cat of selectedCategories) {
      const catPaths = pathsByCategory[cat] ?? [];
      const catFindings: any[] = [];

      for (const path of catPaths) {
        const headResult = interestingResults.find((r) => r.path === path);
        if (!headResult) continue;

        const getResult = getMap.get(path);
        const finding: any = {
          path,
          status: headResult.status,
          contentType: headResult.contentType,
          size: getResult?.size ?? headResult.size,
        };

        if (headResult.redirectUrl) {
          finding.redirectUrl = headResult.redirectUrl;
        }

        catFindings.push(finding);
        totalHits++;
      }

      if (catFindings.length > 0) {
        findings[cat] = catFindings;
      }
    }

    const result = {
      target: baseUrl,
      totalPathsProbed: allPaths.length,
      totalHits,
      categoriesProbed: selectedCategories,
      findings,
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ─── Tool 2: path_robots ───

const pathRobots: ToolDef = {
  name: "path_robots",
  description:
    "Fetch and parse robots.txt, sitemap.xml, security.txt, and humans.txt from a target URL. " +
    "Disallow entries in robots.txt are an attack surface roadmap. Sitemap reveals page structure. " +
    "Security.txt reveals bug bounty programs. Humans.txt reveals developer names and technologies.",
  schema: {
    url: z.string().url().describe("Base URL to fetch robots/sitemap/security files"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const baseUrl = stripTrailingSlash(args.url as string);

    const cacheKey = `path_robots:${baseUrl}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const result: any = { target: baseUrl };

    // Fetch all four files concurrently
    await limiter.acquire();
    const [robotsRes, sitemapRes, securityRes, humansRes] = await Promise.allSettled([
      probePath(baseUrl, "/robots.txt", "GET"),
      probePath(baseUrl, "/sitemap.xml", "GET"),
      probePath(baseUrl, "/.well-known/security.txt", "GET"),
      probePath(baseUrl, "/humans.txt", "GET"),
    ]);

    // Parse robots.txt
    if (robotsRes.status === "fulfilled" && robotsRes.value?.status === 200 && robotsRes.value.body) {
      const body = robotsRes.value.body;
      const lines = body.split("\n").map((l) => l.trim());
      const disallow: string[] = [];
      const allow: string[] = [];
      const sitemaps: string[] = [];
      let currentAgent = "*";
      const agents: Record<string, { disallow: string[]; allow: string[] }> = {};

      for (const line of lines) {
        if (line.startsWith("#") || line === "") continue;
        const [directive, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();

        switch (directive.toLowerCase()) {
          case "user-agent":
            currentAgent = value;
            if (!agents[currentAgent]) agents[currentAgent] = { disallow: [], allow: [] };
            break;
          case "disallow":
            if (value) {
              disallow.push(value);
              if (!agents[currentAgent]) agents[currentAgent] = { disallow: [], allow: [] };
              agents[currentAgent].disallow.push(value);
            }
            break;
          case "allow":
            if (value) {
              allow.push(value);
              if (!agents[currentAgent]) agents[currentAgent] = { disallow: [], allow: [] };
              agents[currentAgent].allow.push(value);
            }
            break;
          case "sitemap":
            if (value) sitemaps.push(value);
            break;
        }
      }

      result.robots = {
        found: true,
        disallowedPaths: Array.from(new Set(disallow)),
        allowedPaths: Array.from(new Set(allow)),
        sitemapUrls: sitemaps,
        userAgents: agents,
        totalDisallowed: new Set(disallow).size,
        rawLength: body.length,
      };
    } else {
      result.robots = { found: false };
    }

    // Parse sitemap.xml
    if (sitemapRes.status === "fulfilled" && sitemapRes.value?.status === 200 && sitemapRes.value.body) {
      const body = sitemapRes.value.body;
      const urls: string[] = [];
      const lastmods: string[] = [];

      // Simple XML parsing for <loc> and <lastmod> tags
      const locMatches = Array.from(body.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi));
      for (const match of locMatches) {
        urls.push(match[1]);
      }

      const lastmodMatches = Array.from(body.matchAll(/<lastmod>\s*(.*?)\s*<\/lastmod>/gi));
      for (const match of lastmodMatches) {
        lastmods.push(match[1]);
      }

      // Check for sitemap index (contains other sitemaps)
      const isSitemapIndex = body.includes("<sitemapindex");

      result.sitemap = {
        found: true,
        isSitemapIndex,
        totalUrls: urls.length,
        urls: urls.slice(0, 100), // Limit to first 100
        lastModified: lastmods.slice(0, 20),
        truncated: urls.length > 100,
        rawLength: body.length,
      };
    } else {
      result.sitemap = { found: false };
    }

    // Parse security.txt
    if (securityRes.status === "fulfilled" && securityRes.value?.status === 200 && securityRes.value.body) {
      const body = securityRes.value.body;
      const lines = body.split("\n").map((l) => l.trim());
      const security: any = { found: true };

      for (const line of lines) {
        if (line.startsWith("#") || line === "") continue;
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();

        switch (key) {
          case "contact": security.contact = security.contact ? `${security.contact}, ${value}` : value; break;
          case "encryption": security.encryption = value; break;
          case "acknowledgments":
          case "acknowledgements": security.acknowledgments = value; break;
          case "preferred-languages": security.preferredLanguages = value; break;
          case "canonical": security.canonical = value; break;
          case "policy": security.policy = value; break;
          case "hiring": security.hiring = value; break;
          case "expires": security.expires = value; break;
        }
      }

      security.hasBugBounty = !!(security.policy || security.acknowledgments);
      security.rawLength = body.length;
      result.security = security;
    } else {
      result.security = { found: false };
    }

    // Parse humans.txt
    if (humansRes.status === "fulfilled" && humansRes.value?.status === 200 && humansRes.value.body) {
      const body = humansRes.value.body;
      const lines = body.split("\n").map((l) => l.trim()).filter((l) => l !== "");

      result.humans = {
        found: true,
        content: lines.slice(0, 50),
        rawLength: body.length,
      };
    } else {
      result.humans = { found: false };
    }

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ─── Tool 3: path_git_leak ───

const pathGitLeak: ToolDef = {
  name: "path_git_leak",
  description:
    "Version control and secret exposure detection. Checks for exposed .git/config, .git/HEAD, .git/logs/HEAD, " +
    ".git/index, .svn/entries, .svn/wc.db, .env, .DS_Store, and Thumbs.db. Parses .git/config to extract remote " +
    "URLs and author info. Detects if a full git repo is cloneable via exposed .git/index.",
  schema: {
    url: z.string().url().describe("Base URL to check for VCS/secret exposure"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const baseUrl = stripTrailingSlash(args.url as string);

    const cacheKey = `path_git_leak:${baseUrl}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const findings: any[] = [];

    // Probe all VCS/secret paths with GET
    const results = await batchProbe(baseUrl, VCS_LEAK_PATHS, "GET");

    for (const r of results) {
      if (r.status !== 200) continue;

      const finding: any = {
        path: r.path,
        status: r.status,
        contentType: r.contentType,
        size: r.size,
        severity: "HIGH",
      };

      // Parse .git/config (INI format)
      if (r.path === "/.git/config" && r.body) {
        finding.severity = "CRITICAL";
        finding.description = "Git configuration file exposed — contains remote repository URL and author info";
        const remotes: { name: string; url: string }[] = [];
        const lines = r.body.split("\n");
        let currentRemote: string | null = null;

        for (const line of lines) {
          const remoteMatch = line.match(/^\[remote\s+"(.+)"\]/);
          if (remoteMatch) {
            currentRemote = remoteMatch[1];
            continue;
          }
          if (currentRemote) {
            const urlMatch = line.match(/^\s*url\s*=\s*(.+)/);
            if (urlMatch) {
              remotes.push({ name: currentRemote, url: urlMatch[1].trim() });
              currentRemote = null;
            }
          }
          if (line.startsWith("[") && !line.startsWith("[remote")) {
            currentRemote = null;
          }
        }

        // Extract branch info
        const branches: { name: string; remote: string; merge: string }[] = [];
        let currentBranch: string | null = null;
        let branchRemote = "";
        let branchMerge = "";

        for (const line of lines) {
          const branchMatch = line.match(/^\[branch\s+"(.+)"\]/);
          if (branchMatch) {
            if (currentBranch) {
              branches.push({ name: currentBranch, remote: branchRemote, merge: branchMerge });
            }
            currentBranch = branchMatch[1];
            branchRemote = "";
            branchMerge = "";
            continue;
          }
          if (currentBranch) {
            const rm = line.match(/^\s*remote\s*=\s*(.+)/);
            if (rm) branchRemote = rm[1].trim();
            const mg = line.match(/^\s*merge\s*=\s*(.+)/);
            if (mg) branchMerge = mg[1].trim();
          }
        }
        if (currentBranch) {
          branches.push({ name: currentBranch, remote: branchRemote, merge: branchMerge });
        }

        finding.parsed = { remotes, branches };
      }

      // Parse .git/HEAD
      if (r.path === "/.git/HEAD" && r.body) {
        finding.severity = "HIGH";
        finding.description = "Git HEAD exposed — reveals current branch name";
        const refMatch = r.body.trim().match(/^ref:\s*(.+)/);
        if (refMatch) {
          finding.parsed = { ref: refMatch[1], branch: refMatch[1].replace("refs/heads/", "") };
        } else {
          finding.parsed = { detachedHead: r.body.trim() };
        }
      }

      // Parse .git/logs/HEAD
      if (r.path === "/.git/logs/HEAD" && r.body) {
        finding.severity = "CRITICAL";
        finding.description = "Git reflog exposed — reveals commit history with author emails and timestamps";
        const logLines = r.body.trim().split("\n").slice(-20); // Last 20 entries
        const commits: any[] = [];

        for (const line of logLines) {
          // Format: old_hash new_hash Author Name <email> timestamp timezone	message
          const logMatch = line.match(
            /^([0-9a-f]+)\s+([0-9a-f]+)\s+(.+?)\s+<(.+?)>\s+(\d+)\s+([+-]\d{4})\t(.+)$/,
          );
          if (logMatch) {
            commits.push({
              from: logMatch[1].substring(0, 8),
              to: logMatch[2].substring(0, 8),
              author: logMatch[3],
              email: logMatch[4],
              timestamp: new Date(parseInt(logMatch[5], 10) * 1000).toISOString(),
              message: logMatch[7],
            });
          }
        }

        finding.parsed = { recentCommits: commits, totalEntries: r.body.trim().split("\n").length };
      }

      // .git/index — binary file, just flag it
      if (r.path === "/.git/index" && r.body) {
        finding.severity = "CRITICAL";
        finding.description = "Git index file exposed — full repository may be cloneable with git-dumper or similar tools";
        finding.parsed = {
          cloneable: true,
          recommendation: "Use git-dumper or GitTools to attempt full repository download",
        };
      }

      // .svn/entries
      if (r.path === "/.svn/entries" && r.body) {
        finding.severity = "HIGH";
        finding.description = "SVN entries file exposed — reveals repository structure and revision info";
        const svnLines = r.body.split("\n").slice(0, 20);
        finding.parsed = { firstLines: svnLines };
      }

      // .svn/wc.db
      if (r.path === "/.svn/wc.db" && r.body) {
        finding.severity = "CRITICAL";
        finding.description = "SVN working copy database exposed — SQLite DB with full repo metadata";
        finding.parsed = { isSQLite: r.body.startsWith("SQLite"), size: r.size };
      }

      // .env
      if (r.path === "/.env" && r.body) {
        finding.severity = "CRITICAL";
        finding.description = "Environment file exposed — likely contains API keys, database credentials, and secrets";
        // Extract variable names only, not values (for safety)
        const varNames: string[] = [];
        const sensitiveVars: string[] = [];
        const lines = r.body.split("\n");
        for (const line of lines) {
          if (line.startsWith("#") || line.trim() === "") continue;
          const eqIdx = line.indexOf("=");
          if (eqIdx > 0) {
            const varName = line.substring(0, eqIdx).trim();
            varNames.push(varName);
            const lower = varName.toLowerCase();
            if (
              lower.includes("key") || lower.includes("secret") || lower.includes("password") ||
              lower.includes("token") || lower.includes("auth") || lower.includes("credential") ||
              lower.includes("db_") || lower.includes("database") || lower.includes("api")
            ) {
              sensitiveVars.push(varName);
            }
          }
        }
        finding.parsed = { variableNames: varNames, sensitiveVariables: sensitiveVars, totalVars: varNames.length };
      }

      // .DS_Store
      if (r.path === "/.DS_Store" && r.body) {
        finding.severity = "MEDIUM";
        finding.description = "macOS .DS_Store file exposed — reveals directory listing and file names";
        finding.parsed = { size: r.size };
      }

      // Thumbs.db
      if (r.path === "/Thumbs.db" && r.body) {
        finding.severity = "LOW";
        finding.description = "Windows Thumbs.db file exposed — reveals file thumbnails and names";
        finding.parsed = { size: r.size };
      }

      findings.push(finding);
    }

    const result = {
      target: baseUrl,
      totalChecked: VCS_LEAK_PATHS.length,
      totalExposed: findings.length,
      findings,
      overallRisk: findings.some((f) => f.severity === "CRITICAL")
        ? "CRITICAL"
        : findings.some((f) => f.severity === "HIGH")
          ? "HIGH"
          : findings.length > 0
            ? "MEDIUM"
            : "NONE",
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ─── Tool 4: path_debug ───

const pathDebug: ToolDef = {
  name: "path_debug",
  description:
    "Debug and admin endpoint detection with severity ratings. Checks Spring Boot Actuator, Go pprof, " +
    "Apache server-info/status, Flask/Werkzeug console, Tomcat Manager, PHP info, Nginx status, and Laravel " +
    "Telescope/Debugbar. Each finding includes severity (CRITICAL/HIGH/MEDIUM/LOW/INFO) and attacker impact description.",
  schema: {
    url: z.string().url().describe("Base URL to check for debug/admin endpoints"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const baseUrl = stripTrailingSlash(args.url as string);

    const cacheKey = `path_debug:${baseUrl}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    const allDebugPaths = DEBUG_ENDPOINTS.map((e) => e.path);
    const endpointMap = new Map(DEBUG_ENDPOINTS.map((e) => [e.path, e]));

    // Probe all debug endpoints
    const results = await batchProbe(baseUrl, allDebugPaths, "GET", 15);

    const findings: any[] = [];

    for (const r of results) {
      // Skip 404s and connection errors
      if (r.status === 404) continue;

      const endpoint = endpointMap.get(r.path);
      if (!endpoint) continue;

      const finding: any = {
        path: r.path,
        status: r.status,
        contentType: r.contentType,
        size: r.size,
        severity: endpoint.severity,
        technology: endpoint.technology,
        description: endpoint.description,
        accessible: r.status === 200,
      };

      // Special handling for specific endpoints
      if (r.path === "/console" && r.status === 200 && r.body) {
        finding.werkzeugPinRequired = r.body.includes("PIN") || r.body.includes("pin");
        finding.interactiveShell = r.body.includes("interactive") || r.body.includes("console");
      }

      if (r.path === "/manager/html" && r.status === 401) {
        finding.description = "Tomcat Manager exists but requires authentication — try default credentials";
        finding.defaultCredentials = ["admin:admin", "tomcat:tomcat", "admin:tomcat", "tomcat:s3cret", "admin:"];
      }

      if (r.path === "/actuator" && r.status === 200 && r.body) {
        // Parse actuator index to find enabled endpoints
        try {
          const actuatorData = JSON.parse(r.body);
          if (actuatorData._links) {
            finding.enabledEndpoints = Object.keys(actuatorData._links);
          }
        } catch {
          // Not JSON, might be behind auth or different format
        }
      }

      if (r.path === "/actuator/env" && r.status === 200) {
        finding.criticalNote = "Environment variables exposed — likely contains secrets, API keys, and database passwords";
      }

      if (r.path === "/actuator/heapdump" && r.status === 200) {
        finding.criticalNote = "JVM heap dump downloadable — use Eclipse MAT or jhat to extract secrets from memory";
      }

      // Auth state detection
      if (r.status === 401) {
        finding.authRequired = true;
        finding.wwwAuthenticate = r.headers?.["www-authenticate"] ?? null;
      } else if (r.status === 403) {
        finding.forbidden = true;
        finding.note = "Endpoint exists but access is denied — may be bypassable via header manipulation or IP spoofing";
      }

      findings.push(finding);
    }

    // Sort by severity
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    findings.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

    const result = {
      target: baseUrl,
      totalChecked: allDebugPaths.length,
      totalFound: findings.length,
      criticalCount: findings.filter((f) => f.severity === "CRITICAL").length,
      highCount: findings.filter((f) => f.severity === "HIGH").length,
      mediumCount: findings.filter((f) => f.severity === "MEDIUM").length,
      lowCount: findings.filter((f) => f.severity === "LOW").length,
      infoCount: findings.filter((f) => f.severity === "INFO").length,
      findings,
      overallRisk: findings.some((f) => f.severity === "CRITICAL" && f.accessible)
        ? "CRITICAL"
        : findings.some((f) => f.severity === "HIGH" && f.accessible)
          ? "HIGH"
          : findings.some((f) => f.severity === "MEDIUM")
            ? "MEDIUM"
            : findings.length > 0
              ? "LOW"
              : "NONE",
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ─── Tool 5: path_api_version ───

const pathApiVersion: ToolDef = {
  name: "path_api_version",
  description:
    "API version probing: systematically tests version prefixes (/api/v0-v4, /api/beta, /api/internal, " +
    "/api/legacy, /api/dev, /api/staging, /v0-v3, /api, /rest, /graphql, /grpc) and compares responses. " +
    "Detects auth requirements per version — older versions often have weaker auth. Identifies response format differences.",
  schema: {
    url: z.string().url().describe("Base URL to probe API version endpoints"),
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const baseUrl = stripTrailingSlash(args.url as string);

    const cacheKey = `path_api_version:${baseUrl}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    // Probe all API version paths with GET
    const results = await batchProbe(baseUrl, API_VERSION_PATHS, "GET", 15);

    const endpoints: any[] = [];

    for (const r of results) {
      if (r.status === 404) continue;

      const endpoint: any = {
        path: r.path,
        status: r.status,
        contentType: r.contentType,
        size: r.size,
      };

      // Auth requirement detection
      if (r.status === 401) {
        endpoint.authRequired = true;
        endpoint.authType = r.headers?.["www-authenticate"] ?? "unknown";
      } else if (r.status === 403) {
        endpoint.authRequired = true;
        endpoint.authType = "forbidden";
      } else if (r.status === 200) {
        endpoint.authRequired = false;
      }

      // Response format detection
      const ct = (r.contentType ?? "").toLowerCase();
      if (ct.includes("json")) {
        endpoint.responseFormat = "JSON";
      } else if (ct.includes("xml")) {
        endpoint.responseFormat = "XML";
      } else if (ct.includes("html")) {
        endpoint.responseFormat = "HTML";
      } else if (ct.includes("grpc")) {
        endpoint.responseFormat = "gRPC";
      } else if (ct.includes("protobuf")) {
        endpoint.responseFormat = "Protobuf";
      } else {
        endpoint.responseFormat = ct || "unknown";
      }

      // Extract relevant headers
      const relevantHeaders: Record<string, string> = {};
      const interestingHeaders = [
        "x-powered-by", "server", "x-api-version", "api-version",
        "x-ratelimit-limit", "x-ratelimit-remaining", "x-request-id",
        "access-control-allow-origin", "x-frame-options", "content-security-policy",
        "x-content-type-options", "strict-transport-security",
      ];
      for (const h of interestingHeaders) {
        if (r.headers?.[h]) {
          relevantHeaders[h] = r.headers[h];
        }
      }
      if (Object.keys(relevantHeaders).length > 0) {
        endpoint.headers = relevantHeaders;
      }

      // Check for common API patterns in body
      if (r.body && r.status === 200) {
        const bodyLower = r.body.toLowerCase();
        if (bodyLower.includes("swagger") || bodyLower.includes("openapi")) {
          endpoint.hasApiDocs = true;
        }
        if (bodyLower.includes("graphql") || bodyLower.includes("__schema")) {
          endpoint.graphqlDetected = true;
        }
        if (bodyLower.includes("deprecated")) {
          endpoint.deprecated = true;
        }
      }

      endpoints.push(endpoint);
    }

    // Auth comparison analysis
    const authAnalysis: any = {
      unauthenticatedEndpoints: endpoints.filter((e) => e.authRequired === false).map((e) => e.path),
      authenticatedEndpoints: endpoints.filter((e) => e.authRequired === true).map((e) => e.path),
    };

    // Detect auth weaknesses: if newer versions require auth but older don't
    const versionedEndpoints = endpoints.filter((e) =>
      e.path.match(/\/(v\d|api\/v\d)/),
    );

    if (versionedEndpoints.length > 1) {
      const noAuth = versionedEndpoints.filter((e) => e.authRequired === false);
      const withAuth = versionedEndpoints.filter((e) => e.authRequired === true);

      if (noAuth.length > 0 && withAuth.length > 0) {
        authAnalysis.authWeakness = true;
        authAnalysis.weaknessDescription =
          "Some API versions do not require authentication while others do — older/unprotected versions may allow unauthorized access";
        authAnalysis.unprotectedVersions = noAuth.map((e) => e.path);
        authAnalysis.protectedVersions = withAuth.map((e) => e.path);
      }
    }

    // Internal/dev endpoint detection
    const internalEndpoints = endpoints.filter(
      (e) =>
        e.path.includes("internal") ||
        e.path.includes("dev") ||
        e.path.includes("staging") ||
        e.path.includes("legacy") ||
        e.path.includes("beta"),
    );

    const result = {
      target: baseUrl,
      totalChecked: API_VERSION_PATHS.length,
      totalFound: endpoints.length,
      endpoints,
      authAnalysis,
      internalEndpoints: internalEndpoints.length > 0 ? internalEndpoints : undefined,
      summary: {
        apiVersionsFound: endpoints.filter((e) => e.path.match(/\/v\d/)).map((e) => e.path),
        responseFormats: Array.from(new Set(endpoints.map((e) => e.responseFormat))),
        hasGraphQL: endpoints.some((e) => e.path.includes("graphql") || e.graphqlDetected),
        hasREST: endpoints.some((e) => e.path.includes("rest") || e.path.includes("api")),
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  },
};

// ─── Export All Path Tools ───

export const pathTools: ToolDef[] = [
  pathSensitive,
  pathRobots,
  pathGitLeak,
  pathDebug,
  pathApiVersion,
];
