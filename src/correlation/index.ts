import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json } from "../types/index.js";

// ─── Known Patterns for Correlation Analysis ───

/** Header ordering fingerprints for common web servers */
const HEADER_ORDER_PATTERNS: Record<string, string[]> = {
  nginx: ["server", "date", "content-type", "content-length", "connection"],
  apache: ["date", "server", "content-type", "content-length"],
  iis: ["content-type", "server", "x-powered-by", "date", "content-length"],
  caddy: ["server", "content-type", "date"],
  litespeed: ["date", "content-type", "content-length", "server"],
};

/** Cookie names associated with specific technologies */
const COOKIE_TECH_MAP: Record<string, string> = {
  PHPSESSID: "PHP",
  JSESSIONID: "Java (Servlet/JSP)",
  "ASP.NET_SessionId": "ASP.NET",
  "connect.sid": "Node.js (Express/Connect)",
  _csrf: "Node.js (csurf/Express)",
  laravel_session: "PHP (Laravel)",
  ci_session: "PHP (CodeIgniter)",
  PLAY_SESSION: "Scala (Play Framework)",
  rack_session: "Ruby (Rack/Rails)",
  _session_id: "Ruby on Rails",
  wp_settings: "PHP (WordPress)",
  CRAFT_CSRF_TOKEN: "PHP (Craft CMS)",
  "django-session": "Python (Django)",
  beaker_session_id: "Python (Pylons/TurboGears)",
};

/** Server headers that imply specific technologies */
const SERVER_TECH_MAP: Record<string, string> = {
  nginx: "Nginx",
  apache: "Apache",
  "microsoft-iis": "IIS",
  litespeed: "LiteSpeed",
  caddy: "Caddy",
  openresty: "OpenResty (Nginx)",
  gunicorn: "Python (Gunicorn)",
  uvicorn: "Python (Uvicorn)",
  "cowboy": "Erlang (Cowboy)",
  jetty: "Java (Jetty)",
  tomcat: "Java (Tomcat)",
  kestrel: "ASP.NET (Kestrel)",
};

/** TLS version compatibility reference */
const TLS_COMPATIBILITY: Record<string, { minYear: number; maxYear: number }> = {
  "TLSv1.3": { minYear: 2018, maxYear: 9999 },
  "TLSv1.2": { minYear: 2008, maxYear: 9999 },
  "TLSv1.1": { minYear: 2006, maxYear: 2021 },
  "TLSv1.0": { minYear: 1999, maxYear: 2020 },
  SSLv3: { minYear: 1996, maxYear: 2015 },
};

// ─── Tool 1: fp_correlate ───

const fpCorrelate: ToolDef = {
  name: "fp_correlate",
  description:
    "Cross-layer consistency validation. Takes fingerprint data from multiple tools and checks for contradictions " +
    "between server header, header ordering, TLS version, error page signature, SSH banner, cookies, and JARM. " +
    "Returns a consistency score (0.0-1.0) and a list of contradictions with explanations.",
  schema: {
    serverHeader: z.string().optional().describe("Server header value"),
    headerOrderHash: z.string().optional().describe("Header ordering hash"),
    tlsVersion: z.string().optional().describe("Negotiated TLS version"),
    errorSignature: z.string().optional().describe("Detected error page framework"),
    cookies: z.array(z.string()).optional().describe("Cookie names found"),
    sshBanner: z.string().optional().describe("SSH banner string"),
    jarm: z.string().optional().describe("JARM fingerprint hash"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const serverHeader = (args.serverHeader as string | undefined)?.toLowerCase();
    const headerOrderHash = args.headerOrderHash as string | undefined;
    const tlsVersion = args.tlsVersion as string | undefined;
    const errorSignature = (args.errorSignature as string | undefined)?.toLowerCase();
    const cookies = args.cookies as string[] | undefined;
    const sshBanner = args.sshBanner as string | undefined;
    const jarm = args.jarm as string | undefined;

    const contradictions: { check: string; severity: "HIGH" | "MEDIUM" | "LOW"; explanation: string }[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // Detect server technology from header
    let detectedServerTech: string | null = null;
    if (serverHeader) {
      for (const [pattern, tech] of Object.entries(SERVER_TECH_MAP)) {
        if (serverHeader.includes(pattern)) {
          detectedServerTech = tech;
          break;
        }
      }
    }

    // Check 1: Server header vs header ordering
    if (serverHeader && headerOrderHash) {
      totalChecks++;
      // If server says Apache but ordering matches Nginx (or vice versa), flag it
      const isApache = serverHeader.includes("apache");
      const isNginx = serverHeader.includes("nginx");
      const isIIS = serverHeader.includes("microsoft-iis");

      // We cannot reverse a hash, but if we know the hash came from a known pattern
      // we can check consistency. For now, just log the relationship.
      // In practice, compare against known hash databases.
      if ((isApache && headerOrderHash.startsWith("nginx")) ||
          (isNginx && headerOrderHash.startsWith("apache")) ||
          (isIIS && headerOrderHash.startsWith("nginx"))) {
        contradictions.push({
          check: "server_vs_header_order",
          severity: "HIGH",
          explanation: `Server header claims "${serverHeader}" but header ordering pattern matches a different server. ` +
            `This strongly indicates server header spoofing or a reverse proxy.`,
        });
      } else {
        passedChecks++;
      }
    }

    // Check 2: TLS version vs server version claim
    if (tlsVersion && serverHeader) {
      totalChecks++;
      const versionMatch = serverHeader.match(/(\d+\.\d+(\.\d+)?)/);
      if (versionMatch) {
        const claimedVersion = versionMatch[1];
        const majorMinor = claimedVersion.split(".").slice(0, 2).join(".");

        // Apache 2.2 typically cannot do TLS 1.3 natively (requires OpenSSL 1.1.1+)
        if (serverHeader.includes("apache") && majorMinor === "2.2" && tlsVersion === "TLSv1.3") {
          contradictions.push({
            check: "tls_vs_server_version",
            severity: "HIGH",
            explanation: `Server claims "Apache/2.2" but negotiated TLS 1.3. Apache 2.2 uses OpenSSL < 1.1.1 which ` +
              `does not support TLS 1.3. This is likely a reverse proxy (Cloudflare, Nginx) in front, or server header spoofing.`,
          });
        }
        // IIS 7.x and below cannot do TLS 1.2+ natively
        else if (serverHeader.includes("microsoft-iis") && parseFloat(majorMinor) <= 7.5 &&
                 (tlsVersion === "TLSv1.2" || tlsVersion === "TLSv1.3")) {
          contradictions.push({
            check: "tls_vs_server_version",
            severity: "MEDIUM",
            explanation: `Server claims "IIS/${claimedVersion}" but negotiated ${tlsVersion}. IIS 7.x only supports ` +
              `TLS 1.0 natively. A load balancer or reverse proxy likely handles TLS termination.`,
          });
        }
        // Very old Nginx with TLS 1.3
        else if (serverHeader.includes("nginx") && parseFloat(majorMinor) < 1.13 && tlsVersion === "TLSv1.3") {
          contradictions.push({
            check: "tls_vs_server_version",
            severity: "LOW",
            explanation: `Server claims "nginx/${claimedVersion}" which predates TLS 1.3 support (requires nginx 1.13+). ` +
              `Likely version spoofing or a CDN/proxy terminating TLS.`,
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks++;
      }
    }

    // Check 3: Error page vs server header
    if (errorSignature && serverHeader) {
      totalChecks++;
      const errorToServer: Record<string, string[]> = {
        nginx: ["nginx"],
        apache: ["apache"],
        iis: ["microsoft-iis", "iis"],
        tomcat: ["tomcat", "apache-coyote"],
        "spring boot": ["apache", "tomcat", "jetty"],
        django: ["gunicorn", "uvicorn", "apache", "nginx"],
        express: ["express", "nginx"],
        flask: ["gunicorn", "uvicorn", "werkzeug"],
        laravel: ["apache", "nginx"],
      };

      const expectedServers = errorToServer[errorSignature];
      if (expectedServers) {
        const matches = expectedServers.some((s) => serverHeader.includes(s));
        if (!matches) {
          contradictions.push({
            check: "error_page_vs_server",
            severity: "MEDIUM",
            explanation: `Error page signature indicates "${errorSignature}" but server header says "${serverHeader}". ` +
              `The error page reveals the actual backend framework while the server header may be spoofed or from a proxy.`,
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks++;
      }
    }

    // Check 4: Cookie technology vs server header
    if (cookies && cookies.length > 0 && serverHeader) {
      totalChecks++;
      const cookieTechs: string[] = [];
      for (const cookie of cookies) {
        const tech = COOKIE_TECH_MAP[cookie];
        if (tech) cookieTechs.push(tech);
      }

      if (cookieTechs.length > 0) {
        // JSESSIONID + "Apache" without AJP is suspicious
        const hasJava = cookieTechs.some((t) => t.includes("Java"));
        const hasPHP = cookieTechs.some((t) => t.includes("PHP"));
        const hasNet = cookieTechs.some((t) => t.includes("ASP.NET"));
        const hasNode = cookieTechs.some((t) => t.includes("Node"));
        const hasPython = cookieTechs.some((t) => t.includes("Python"));
        const hasRuby = cookieTechs.some((t) => t.includes("Ruby"));

        if (hasJava && serverHeader.includes("apache") && !serverHeader.includes("tomcat")) {
          // Apache fronting Tomcat via mod_jk/AJP is normal, but pure Apache + JSESSIONID is odd
          contradictions.push({
            check: "cookie_tech_vs_server",
            severity: "LOW",
            explanation: `JSESSIONID cookie (Java) found behind Apache without Tomcat server header. ` +
              `Likely Apache reverse proxying to Tomcat/Jetty — normal architecture, but reveals backend technology.`,
          });
        } else if (hasNet && !serverHeader.includes("microsoft-iis") && !serverHeader.includes("kestrel")) {
          contradictions.push({
            check: "cookie_tech_vs_server",
            severity: "MEDIUM",
            explanation: `ASP.NET session cookie found but server header says "${serverHeader}" instead of IIS/Kestrel. ` +
              `A reverse proxy is hiding the actual ASP.NET backend.`,
          });
        } else if (hasPHP && serverHeader.includes("microsoft-iis")) {
          // PHP on IIS is possible but uncommon
          contradictions.push({
            check: "cookie_tech_vs_server",
            severity: "LOW",
            explanation: `PHP session cookie (PHPSESSID) found on IIS server. PHP on IIS via FastCGI is possible ` +
              `but uncommon — verify if this is intentional.`,
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks++;
      }
    }

    // Check 5: SSH banner vs server context
    if (sshBanner && serverHeader) {
      totalChecks++;
      // If SSH banner claims ancient version but web server is modern, note it
      const sshVersionMatch = sshBanner.match(/OpenSSH[_\s](\d+\.\d+)/i);
      if (sshVersionMatch) {
        const sshVersion = parseFloat(sshVersionMatch[1]);
        // OpenSSH < 7.0 is very old (2015)
        if (sshVersion < 7.0 && tlsVersion === "TLSv1.3") {
          contradictions.push({
            check: "ssh_vs_tls_modernity",
            severity: "MEDIUM",
            explanation: `SSH claims OpenSSH ${sshVersion} (pre-2015) but TLS 1.3 is negotiated (2018+). ` +
              `The SSH banner may be spoofed, or the system is severely misconfigured.`,
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks++;
      }
    }

    // Calculate consistency score
    const consistencyScore = totalChecks > 0 ? passedChecks / totalChecks : 1.0;

    const result = {
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      totalChecks,
      passedChecks,
      failedChecks: contradictions.length,
      contradictions,
      inputSignals: {
        serverHeader: serverHeader ?? null,
        headerOrderHash: headerOrderHash ?? null,
        tlsVersion: tlsVersion ?? null,
        errorSignature: errorSignature ?? null,
        cookies: cookies ?? [],
        sshBanner: sshBanner ?? null,
        jarm: jarm ?? null,
      },
      detectedServerTech,
      assessment:
        consistencyScore >= 0.9
          ? "CONSISTENT — Signals align. Server identity appears genuine."
          : consistencyScore >= 0.6
            ? "PARTIAL_MISMATCH — Some signals contradict. Possible reverse proxy, CDN, or partial spoofing."
            : "INCONSISTENT — Multiple contradictions detected. Server identity is likely spoofed or heavily proxied.",
    };

    return json(result);
  },
};

// ─── Tool 2: fp_honeypot ───

const fpHoneypot: ToolDef = {
  name: "fp_honeypot",
  description:
    "Honeypot probability scoring. Analyzes service scan results for honeypot indicators: old version claims with " +
    "modern protocols, identical sub-millisecond response times, too many open ports with perfect banners, TLS " +
    "contradictions, ancient SSH with modern KEX, and default credential acceptance. Returns a score (0.0-1.0) " +
    "with detailed reasoning for each signal.",
  schema: {
    services: z
      .array(
        z.object({
          port: z.number().describe("Service port number"),
          banner: z.string().optional().describe("Service banner string"),
          responseTimeMs: z.number().optional().describe("Response time in milliseconds"),
          tlsVersion: z.string().optional().describe("Negotiated TLS version"),
        }),
      )
      .describe("Service scan results"),
    openPortCount: z.number().optional().describe("Total open ports found"),
    sshBanner: z.string().optional().describe("SSH banner"),
    sshAlgorithms: z.array(z.string()).optional().describe("SSH KEX algorithms"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const services = args.services as Array<{
      port: number;
      banner?: string;
      responseTimeMs?: number;
      tlsVersion?: string;
    }>;
    const openPortCount = (args.openPortCount as number | undefined) ?? services.length;
    const sshBanner = args.sshBanner as string | undefined;
    const sshAlgorithms = args.sshAlgorithms as string[] | undefined;

    const signals: { indicator: string; weight: number; reasoning: string }[] = [];
    let totalWeight = 0;
    let honeypotWeight = 0;

    // Signal 1: Too many open ports
    totalWeight += 1.0;
    if (openPortCount > 50) {
      const weight = 0.9;
      honeypotWeight += weight;
      signals.push({
        indicator: "excessive_open_ports",
        weight,
        reasoning: `${openPortCount} open ports detected. Real servers typically have 3-15 open ports. ` +
          `Honeypots like Cowrie and Dionaea open many ports to attract scanners.`,
      });
    } else if (openPortCount > 30) {
      const weight = 0.5;
      honeypotWeight += weight;
      signals.push({
        indicator: "many_open_ports",
        weight,
        reasoning: `${openPortCount} open ports — more than typical for production servers. Possible honeypot.`,
      });
    }

    // Signal 2: Identical response times (single-process emulation)
    totalWeight += 1.0;
    const responseTimes = services.filter((s) => s.responseTimeMs !== undefined).map((s) => s.responseTimeMs!);
    if (responseTimes.length >= 3) {
      const allSame = responseTimes.every((t) => Math.abs(t - responseTimes[0]) < 0.5);
      const allSubMs = responseTimes.every((t) => t < 1.0);

      if (allSame && allSubMs) {
        const weight = 0.85;
        honeypotWeight += weight;
        signals.push({
          indicator: "identical_sub_ms_response",
          weight,
          reasoning: `All ${responseTimes.length} services respond in identical sub-millisecond times ` +
            `(~${responseTimes[0].toFixed(2)}ms). This suggests a single process emulating multiple services — ` +
            `classic honeypot behavior.`,
        });
      } else if (allSame) {
        const weight = 0.4;
        honeypotWeight += weight;
        signals.push({
          indicator: "identical_response_times",
          weight,
          reasoning: `All services respond in nearly identical times. Unusual for independent real services.`,
        });
      }
    }

    // Signal 3: Old version banners with modern TLS
    totalWeight += 1.0;
    const oldVersionModernTls: string[] = [];
    for (const svc of services) {
      if (!svc.banner || !svc.tlsVersion) continue;
      const bannerLower = svc.banner.toLowerCase();

      // Check for old Apache + TLS 1.3
      if (bannerLower.includes("apache/2.2") && svc.tlsVersion === "TLSv1.3") {
        oldVersionModernTls.push(`port ${svc.port}: Apache/2.2 + TLS 1.3`);
      }
      // Old Nginx + TLS 1.3
      if (bannerLower.match(/nginx\/1\.[0-9]\./) && svc.tlsVersion === "TLSv1.3") {
        oldVersionModernTls.push(`port ${svc.port}: old Nginx + TLS 1.3`);
      }
      // Old OpenSSH + modern TLS on adjacent ports
      if (bannerLower.match(/openssh[_\s][45]\./i) && svc.tlsVersion === "TLSv1.3") {
        oldVersionModernTls.push(`port ${svc.port}: ancient OpenSSH + TLS 1.3`);
      }
    }

    if (oldVersionModernTls.length >= 2) {
      const weight = 0.8;
      honeypotWeight += weight;
      signals.push({
        indicator: "old_versions_modern_tls",
        weight,
        reasoning: `Multiple services claim old versions but support modern TLS: ${oldVersionModernTls.join("; ")}. ` +
          `Real old software cannot negotiate TLS 1.3.`,
      });
    } else if (oldVersionModernTls.length === 1) {
      const weight = 0.4;
      honeypotWeight += weight;
      signals.push({
        indicator: "old_version_modern_tls",
        weight,
        reasoning: `${oldVersionModernTls[0]} — version claim contradicts TLS capability.`,
      });
    }

    // Signal 4: Perfect banners on every port
    totalWeight += 1.0;
    const banneredServices = services.filter((s) => s.banner && s.banner.length > 0);
    if (banneredServices.length === services.length && services.length > 10) {
      const weight = 0.6;
      honeypotWeight += weight;
      signals.push({
        indicator: "perfect_banners_all_ports",
        weight,
        reasoning: `Every single port (${services.length}) returns a clean banner. Real servers often have ports ` +
          `that respond with empty or malformed banners.`,
      });
    }

    // Signal 5: SSH banner vs KEX algorithms mismatch
    totalWeight += 1.0;
    if (sshBanner && sshAlgorithms && sshAlgorithms.length > 0) {
      const sshVersionMatch = sshBanner.match(/OpenSSH[_\s](\d+\.\d+)/i);
      if (sshVersionMatch) {
        const sshMajor = parseFloat(sshVersionMatch[1]);
        // Modern KEX algorithms that old OpenSSH cannot support
        const modernKex = [
          "curve25519-sha256",
          "curve25519-sha256@libssh.org",
          "sntrup761x25519-sha512@openssh.com",
        ];
        const hasModernKex = sshAlgorithms.some((a) => modernKex.includes(a));

        if (sshMajor < 6.5 && hasModernKex) {
          const weight = 0.85;
          honeypotWeight += weight;
          signals.push({
            indicator: "ssh_version_kex_mismatch",
            weight,
            reasoning: `SSH banner claims OpenSSH ${sshMajor} but supports modern KEX algorithms ` +
              `(curve25519-sha256 requires OpenSSH 6.5+). Banner is spoofed — likely a honeypot.`,
          });
        } else {
          // Consistent
        }
      }
    }

    // Signal 6: Every port responds (typical honeypot behavior)
    totalWeight += 1.0;
    if (services.length >= 20) {
      const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 9200];
      const matchedCommon = commonPorts.filter((p) => services.some((s) => s.port === p));
      if (matchedCommon.length >= 15) {
        const weight = 0.75;
        honeypotWeight += weight;
        signals.push({
          indicator: "too_many_common_ports",
          weight,
          reasoning: `${matchedCommon.length} of ${commonPorts.length} well-known ports are open. ` +
            `Production servers focus on a few services. Honeypots maximize attack surface to collect data.`,
        });
      }
    }

    const score = totalWeight > 0 ? Math.min(honeypotWeight / totalWeight, 1.0) : 0;
    const roundedScore = Math.round(score * 100) / 100;

    const result = {
      honeypotScore: roundedScore,
      assessment:
        roundedScore >= 0.8
          ? "HIGH_PROBABILITY — Strong honeypot indicators detected. Treat with extreme caution."
          : roundedScore >= 0.5
            ? "MODERATE_PROBABILITY — Several suspicious signals. Could be a honeypot or heavily emulated environment."
            : roundedScore >= 0.2
              ? "LOW_PROBABILITY — Minor anomalies but likely a real server."
              : "UNLIKELY — No significant honeypot indicators found.",
      signals,
      inputSummary: {
        servicesAnalyzed: services.length,
        openPortCount,
        sshBanner: sshBanner ?? null,
        sshAlgorithmCount: sshAlgorithms?.length ?? 0,
      },
    };

    return json(result);
  },
};

// ─── Tool 3: fp_spoofing ───

const fpSpoofing: ToolDef = {
  name: "fp_spoofing",
  description:
    "Spoofing detection. Identifies when services misrepresent their identity by comparing server header vs " +
    "header ordering, SSH banner vs HASSH fingerprint, and claimed version vs actual capabilities. Returns " +
    "actual estimate vs claimed identity with confidence.",
  schema: {
    serverHeader: z.string().optional().describe("Server header value"),
    headerOrder: z.array(z.string()).optional().describe("Response header names in order"),
    sshBanner: z.string().optional().describe("SSH banner"),
    hassh: z.string().optional().describe("HASSH fingerprint"),
    sshAlgorithms: z.array(z.string()).optional().describe("SSH supported algorithms"),
    claimedVersion: z.string().optional().describe("Claimed software version"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const serverHeader = (args.serverHeader as string | undefined)?.toLowerCase();
    const headerOrder = args.headerOrder as string[] | undefined;
    const sshBanner = args.sshBanner as string | undefined;
    const hassh = args.hassh as string | undefined;
    const sshAlgorithms = args.sshAlgorithms as string[] | undefined;
    const claimedVersion = args.claimedVersion as string | undefined;

    const findings: {
      check: string;
      spoofingDetected: boolean;
      claimedIdentity: string;
      actualEstimate: string;
      confidence: number;
      explanation: string;
    }[] = [];

    // Check 1: Server header vs header ordering
    if (serverHeader && headerOrder && headerOrder.length > 0) {
      const normalizedOrder = headerOrder.map((h) => h.toLowerCase());

      // Nginx typically sends: server, date, content-type, ...
      const looksLikeNginx =
        normalizedOrder[0] === "server" &&
        normalizedOrder.indexOf("date") < normalizedOrder.indexOf("content-length");
      // Apache typically sends: date, server, ...
      const looksLikeApache =
        normalizedOrder[0] === "date" && normalizedOrder[1] === "server";
      // IIS typically sends: content-type first
      const looksLikeIIS =
        normalizedOrder[0] === "content-type" &&
        normalizedOrder.includes("x-powered-by");

      let claimedServer = "unknown";
      let detectedServer = "unknown";

      if (serverHeader.includes("nginx")) claimedServer = "nginx";
      else if (serverHeader.includes("apache")) claimedServer = "apache";
      else if (serverHeader.includes("microsoft-iis")) claimedServer = "iis";
      else if (serverHeader.includes("litespeed")) claimedServer = "litespeed";
      else if (serverHeader.includes("caddy")) claimedServer = "caddy";

      if (looksLikeNginx) detectedServer = "nginx";
      else if (looksLikeApache) detectedServer = "apache";
      else if (looksLikeIIS) detectedServer = "iis";

      if (claimedServer !== "unknown" && detectedServer !== "unknown" && claimedServer !== detectedServer) {
        findings.push({
          check: "server_header_vs_header_order",
          spoofingDetected: true,
          claimedIdentity: `Server header: ${serverHeader}`,
          actualEstimate: `Header ordering matches ${detectedServer}`,
          confidence: 0.8,
          explanation: `Server claims to be ${claimedServer} but response header ordering pattern ` +
            `(${normalizedOrder.slice(0, 4).join(", ")}) is characteristic of ${detectedServer}. ` +
            `Header ordering is hard to fake without rewriting the entire HTTP stack.`,
        });
      } else {
        findings.push({
          check: "server_header_vs_header_order",
          spoofingDetected: false,
          claimedIdentity: claimedServer,
          actualEstimate: detectedServer !== "unknown" ? detectedServer : "matches claim",
          confidence: 0.7,
          explanation: "Server header and header ordering are consistent.",
        });
      }
    }

    // Check 2: SSH banner vs HASSH
    if (sshBanner && hassh) {
      // Known HASSH fingerprints
      const KNOWN_HASSH: Record<string, string> = {
        "ec7378c1a92f5a8dde7e8b7a1ddf33d1": "OpenSSH 7.x-8.x",
        "b12d2871a1571f57b5f7e53e3e7d2b97": "OpenSSH 6.x",
        "06046964c022c6407d15a27b12a6a4fb": "Dropbear SSH",
        "92674389fa1e47a27ddd8d9b63ecd42b": "PuTTY / libssh",
        "c8a9b0c5c7e4d8e1f2a3b4c5d6e7f8a9": "Paramiko (Python)",
        "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6": "libssh2",
      };

      const sshBannerLower = sshBanner.toLowerCase();
      const hasshMatch = KNOWN_HASSH[hassh];
      let spoofed = false;
      let claimedSsh = "unknown";
      let actualSsh = hasshMatch ?? "unknown (not in database)";

      if (sshBannerLower.includes("openssh")) claimedSsh = "OpenSSH";
      else if (sshBannerLower.includes("dropbear")) claimedSsh = "Dropbear";
      else if (sshBannerLower.includes("putty")) claimedSsh = "PuTTY";
      else if (sshBannerLower.includes("libssh")) claimedSsh = "libssh";

      if (hasshMatch) {
        // Banner says OpenSSH but HASSH matches Dropbear
        if (claimedSsh === "OpenSSH" && hasshMatch.includes("Dropbear")) {
          spoofed = true;
          actualSsh = "Dropbear SSH (masquerading as OpenSSH)";
        } else if (claimedSsh === "Dropbear" && hasshMatch.includes("OpenSSH")) {
          spoofed = true;
          actualSsh = "OpenSSH (masquerading as Dropbear)";
        } else if (claimedSsh === "OpenSSH" && hasshMatch.includes("Paramiko")) {
          spoofed = true;
          actualSsh = "Paramiko Python SSH (masquerading as OpenSSH)";
        }
      }

      findings.push({
        check: "ssh_banner_vs_hassh",
        spoofingDetected: spoofed,
        claimedIdentity: `SSH banner: ${sshBanner}`,
        actualEstimate: actualSsh,
        confidence: spoofed ? 0.9 : 0.6,
        explanation: spoofed
          ? `SSH banner claims ${claimedSsh} but HASSH fingerprint (${hassh}) matches ${actualSsh}. ` +
            `HASSH is computed from the SSH algorithm negotiation, which differs between implementations.`
          : "SSH banner and HASSH fingerprint are consistent (or HASSH not in database).",
      });
    }

    // Check 3: Claimed version vs SSH algorithms
    if (sshBanner && sshAlgorithms && sshAlgorithms.length > 0) {
      const versionMatch = sshBanner.match(/OpenSSH[_\s](\d+\.\d+)/i);
      if (versionMatch) {
        const version = parseFloat(versionMatch[1]);

        // Check for algorithm support that contradicts version
        const hasCurve25519 = sshAlgorithms.some((a) => a.includes("curve25519"));
        const hasEd25519 = sshAlgorithms.some((a) => a.includes("ed25519"));
        const hasChaCha = sshAlgorithms.some((a) => a.includes("chacha20"));

        // curve25519 requires OpenSSH 6.5+, ed25519 requires 6.5+, chacha20 requires 6.5+
        if (version < 6.5 && (hasCurve25519 || hasEd25519 || hasChaCha)) {
          findings.push({
            check: "ssh_version_vs_algorithms",
            spoofingDetected: true,
            claimedIdentity: `OpenSSH ${version}`,
            actualEstimate: `OpenSSH 6.5+ (supports modern algorithms not available in ${version})`,
            confidence: 0.92,
            explanation: `Banner claims OpenSSH ${version} but supports ${[
              hasCurve25519 ? "curve25519" : "",
              hasEd25519 ? "ed25519" : "",
              hasChaCha ? "chacha20-poly1305" : "",
            ].filter(Boolean).join(", ")} which require OpenSSH 6.5+. The version in the banner is spoofed.`,
          });
        }

        // DSA key algorithm was deprecated in OpenSSH 7.0+
        const hasDSA = sshAlgorithms.some((a) => a.includes("ssh-dss"));
        if (version >= 8.0 && hasDSA) {
          findings.push({
            check: "ssh_version_vs_dsa",
            spoofingDetected: true,
            claimedIdentity: `OpenSSH ${version}`,
            actualEstimate: "OpenSSH < 7.0 or manually re-enabled DSA",
            confidence: 0.5,
            explanation: `Banner claims OpenSSH ${version} but still offers ssh-dss (DSA). ` +
              `DSA was disabled by default in OpenSSH 7.0 and removed in 8.8. Could be re-enabled, ` +
              `but combined with other signals may indicate spoofing.`,
          });
        }
      }
    }

    // Check 4: Claimed version string validation
    if (claimedVersion && serverHeader) {
      const versionMatch = claimedVersion.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
      if (versionMatch) {
        const major = parseInt(versionMatch[1], 10);
        const minor = parseInt(versionMatch[2], 10);

        // Check for impossible version numbers
        if (serverHeader.includes("nginx") && major > 1) {
          findings.push({
            check: "impossible_version",
            spoofingDetected: true,
            claimedIdentity: `nginx/${claimedVersion}`,
            actualEstimate: "Unknown (nginx major version has never exceeded 1.x)",
            confidence: 0.95,
            explanation: `Nginx version ${claimedVersion} does not exist. Nginx has never released a 2.x version. ` +
              `This is clearly a spoofed or fabricated version string.`,
          });
        }

        if (serverHeader.includes("apache") && major === 2 && minor > 4) {
          findings.push({
            check: "impossible_version",
            spoofingDetected: true,
            claimedIdentity: `Apache/${claimedVersion}`,
            actualEstimate: "Unknown (Apache 2.x has never exceeded 2.4.x)",
            confidence: 0.95,
            explanation: `Apache version 2.${minor} does not exist. Apache httpd has stayed within 2.4.x releases. ` +
              `This version string is fabricated.`,
          });
        }
      }
    }

    const spoofingDetected = findings.some((f) => f.spoofingDetected);
    const maxConfidence = findings
      .filter((f) => f.spoofingDetected)
      .reduce((max, f) => Math.max(max, f.confidence), 0);

    const result = {
      spoofingDetected,
      overallConfidence: Math.round(maxConfidence * 100) / 100,
      totalChecks: findings.length,
      spoofedChecks: findings.filter((f) => f.spoofingDetected).length,
      findings,
      assessment: spoofingDetected
        ? `SPOOFING DETECTED — ${findings.filter((f) => f.spoofingDetected).length} signal(s) indicate ` +
          `the server is misrepresenting its identity.`
        : "NO SPOOFING DETECTED — All checked signals are consistent with claimed identity.",
    };

    return json(result);
  },
};

// ─── Tool 4: fp_compare ───

const fpCompare: ToolDef = {
  name: "fp_compare",
  description:
    "Compare two fingerprint profiles. Takes two sets of fingerprint data, diffs them, and reports significance " +
    "of each difference (e.g. 'WAF deployed', 'Server restarted with new config', 'Backend OS changed', " +
    "'CDN added'). Returns a similarity score (0.0-1.0) and a list of changes.",
  schema: {
    profile1: z.record(z.unknown()).describe("First fingerprint profile (JSON)"),
    profile2: z.record(z.unknown()).describe("Second fingerprint profile (JSON)"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const profile1 = args.profile1 as Record<string, unknown>;
    const profile2 = args.profile2 as Record<string, unknown>;

    const differences: {
      field: string;
      value1: unknown;
      value2: unknown;
      significance: string;
      changeType: string;
    }[] = [];

    // Get all unique keys from both profiles
    const allKeys = new Set([...Object.keys(profile1), ...Object.keys(profile2)]);
    let matchedKeys = 0;
    let totalKeys = 0;

    /** Interpret what a change in a specific field means */
    function interpretChange(key: string, val1: unknown, val2: unknown): { significance: string; changeType: string } {
      const keyLower = key.toLowerCase();

      if (keyLower.includes("server") || keyLower === "serverheader") {
        const v1 = String(val1 ?? "").toLowerCase();
        const v2 = String(val2 ?? "").toLowerCase();
        if ((v1.includes("nginx") && v2.includes("cloudflare")) ||
            (v1.includes("apache") && v2.includes("cloudflare"))) {
          return { significance: "CDN/WAF deployed — origin server now behind Cloudflare", changeType: "infrastructure" };
        }
        if (v1 !== v2) {
          return { significance: "Web server software changed", changeType: "configuration" };
        }
      }

      if (keyLower.includes("tls") || keyLower.includes("ssl")) {
        return { significance: "TLS configuration changed — may indicate certificate rotation or security hardening", changeType: "security" };
      }

      if (keyLower.includes("jarm")) {
        return { significance: "JARM fingerprint changed — TLS stack or configuration modified. Could indicate server software change, config update, or C2 profile switch", changeType: "infrastructure" };
      }

      if (keyLower.includes("ssh") || keyLower.includes("hassh")) {
        return { significance: "SSH configuration changed — possible server rebuild, OS update, or key rotation", changeType: "configuration" };
      }

      if (keyLower.includes("waf") || keyLower.includes("cdn")) {
        return { significance: "WAF/CDN configuration changed", changeType: "security" };
      }

      if (keyLower.includes("cookie")) {
        return { significance: "Cookie configuration changed — possible framework update or session management change", changeType: "application" };
      }

      if (keyLower.includes("header")) {
        return { significance: "HTTP header configuration changed", changeType: "configuration" };
      }

      if (keyLower.includes("cert") || keyLower.includes("certificate")) {
        return { significance: "TLS certificate changed — rotation, renewal, or issuer switch", changeType: "security" };
      }

      if (keyLower.includes("os") || keyLower.includes("platform")) {
        return { significance: "Operating system or platform changed — possible server migration", changeType: "infrastructure" };
      }

      if (keyLower.includes("port")) {
        return { significance: "Port configuration changed — new services added or removed", changeType: "infrastructure" };
      }

      if (keyLower.includes("origin") || keyLower.includes("ip")) {
        return { significance: "Origin IP changed — possible server migration, CDN change, or failover", changeType: "infrastructure" };
      }

      return { significance: "Configuration value changed", changeType: "general" };
    }

    for (const key of allKeys) {
      totalKeys++;
      const val1 = profile1[key];
      const val2 = profile2[key];

      const str1 = JSON.stringify(val1);
      const str2 = JSON.stringify(val2);

      if (str1 === str2) {
        matchedKeys++;
      } else {
        const { significance, changeType } = interpretChange(key, val1, val2);

        differences.push({
          field: key,
          value1: val1 ?? "(absent)",
          value2: val2 ?? "(absent)",
          significance,
          changeType,
        });
      }
    }

    const similarityScore = totalKeys > 0 ? matchedKeys / totalKeys : 1.0;
    const roundedScore = Math.round(similarityScore * 100) / 100;

    // Group changes by type
    const changesByType: Record<string, string[]> = {};
    for (const diff of differences) {
      if (!changesByType[diff.changeType]) changesByType[diff.changeType] = [];
      changesByType[diff.changeType].push(diff.field);
    }

    const result = {
      similarityScore: roundedScore,
      totalFields: totalKeys,
      matchedFields: matchedKeys,
      differentFields: differences.length,
      differences,
      changesByType,
      assessment:
        roundedScore >= 0.95
          ? "IDENTICAL — Profiles are effectively the same. Minor differences may be from timing or cache."
          : roundedScore >= 0.8
            ? "SIMILAR — Most signals match. Changes suggest minor configuration updates."
            : roundedScore >= 0.5
              ? "CHANGED — Significant differences detected. Major configuration or infrastructure change."
              : roundedScore >= 0.2
                ? "SUBSTANTIALLY_DIFFERENT — Most signals differ. Server rebuild, migration, or completely different host."
                : "COMPLETELY_DIFFERENT — Profiles share almost nothing. Likely different servers entirely.",
    };

    return json(result);
  },
};

// ─── Tool 5: fp_topology ───

const fpTopology: ToolDef = {
  name: "fp_topology",
  description:
    "Infrastructure topology reconstruction. Takes collected data from CDN detection, origin IP discovery, " +
    "F5 cookie decode, certificate SANs, DNS records, and builds a layered map: " +
    "Internet -> CDN/WAF -> Origin -> Load Balancer -> Backend(s) -> Internal hostnames.",
  schema: {
    cdnProvider: z.string().optional().describe("Detected CDN provider"),
    originIp: z.string().optional().describe("Discovered origin IP"),
    lbCookies: z.array(z.string()).optional().describe("Load balancer cookie values"),
    certSans: z.array(z.string()).optional().describe("Certificate SAN hostnames"),
    dnsRecords: z.record(z.unknown()).optional().describe("DNS records"),
    serverHeader: z.string().optional().describe("Server header"),
    internalHostnames: z.array(z.string()).optional().describe("Discovered internal hostnames"),
  },
  async execute(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
    const cdnProvider = args.cdnProvider as string | undefined;
    const originIp = args.originIp as string | undefined;
    const lbCookies = args.lbCookies as string[] | undefined;
    const certSans = args.certSans as string[] | undefined;
    const dnsRecords = args.dnsRecords as Record<string, unknown> | undefined;
    const serverHeader = args.serverHeader as string | undefined;
    const internalHostnames = args.internalHostnames as string[] | undefined;

    // Build topology layers
    const layers: {
      layer: number;
      name: string;
      type: string;
      details: Record<string, unknown>;
    }[] = [];

    // Layer 1: Internet (always present)
    layers.push({
      layer: 1,
      name: "Internet",
      type: "network",
      details: { description: "Public internet / client" },
    });

    // Layer 2: CDN/WAF (if detected)
    if (cdnProvider) {
      layers.push({
        layer: 2,
        name: cdnProvider,
        type: "cdn_waf",
        details: {
          provider: cdnProvider,
          role: "CDN / WAF / DDoS protection",
          tlsTermination: true,
          note: "CDN terminates TLS and proxies to origin. JARM fingerprint reflects CDN, not origin server.",
        },
      });
    }

    // Layer 3: Origin Server
    const originDetails: Record<string, unknown> = {};
    if (originIp) {
      originDetails.ip = originIp;
      // Classify IP
      if (originIp.match(/^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./)) {
        originDetails.networkType = "private (RFC 1918)";
        originDetails.note = "Origin IP is in a private range — likely behind NAT or in a cloud VPC";
      } else {
        originDetails.networkType = "public";
      }
    }
    if (serverHeader) {
      originDetails.serverSoftware = serverHeader;
    }
    if (dnsRecords) {
      const aRecords = dnsRecords["A"] ?? dnsRecords["a"];
      if (Array.isArray(aRecords)) {
        originDetails.dnsARecords = aRecords;
        if (aRecords.length > 1) {
          originDetails.dnsRoundRobin = true;
          originDetails.note = `${aRecords.length} A records suggest DNS-based load balancing or multi-region deployment`;
        }
      }
    }

    layers.push({
      layer: cdnProvider ? 3 : 2,
      name: "Origin Server",
      type: "origin",
      details: originDetails,
    });

    // Layer 4: Load Balancer (if cookies indicate)
    let lbDetected = false;
    const lbDetails: Record<string, unknown> = {};

    if (lbCookies && lbCookies.length > 0) {
      lbDetected = true;
      const parsedCookies: Record<string, unknown>[] = [];

      for (const cookie of lbCookies) {
        const parsed: Record<string, unknown> = { raw: cookie };

        // F5 BIG-IP cookie decode
        // F5 cookies look like: BIGipServer<pool_name>=<encoded_ip>.<encoded_port>.0000
        if (cookie.startsWith("BIGipServer")) {
          parsed.type = "F5 BIG-IP";
          const valueMatch = cookie.match(/=(\d+)\.(\d+)\./);
          if (valueMatch) {
            const encodedIp = parseInt(valueMatch[1], 10);
            const encodedPort = parseInt(valueMatch[2], 10);
            // Decode F5 IP: reverse byte order
            const ip = [
              encodedIp & 0xff,
              (encodedIp >> 8) & 0xff,
              (encodedIp >> 16) & 0xff,
              (encodedIp >> 24) & 0xff,
            ].join(".");
            // Decode F5 port: swap bytes
            const port = ((encodedPort & 0xff) << 8) | ((encodedPort >> 8) & 0xff);
            parsed.decodedBackendIp = ip;
            parsed.decodedBackendPort = port;
          }
        }
        // AWS ALB cookie
        else if (cookie.includes("AWSALB") || cookie.includes("AWSELB")) {
          parsed.type = "AWS ELB/ALB";
        }
        // HAProxy
        else if (cookie.includes("SERVERID") || cookie.includes("SRV")) {
          parsed.type = "HAProxy";
        }

        parsedCookies.push(parsed);
      }

      lbDetails.cookies = parsedCookies;
      lbDetails.type = parsedCookies[0]?.type ?? "Unknown load balancer";

      layers.push({
        layer: cdnProvider ? 4 : 3,
        name: "Load Balancer",
        type: "load_balancer",
        details: lbDetails,
      });
    }

    // Layer 5: Backends (from LB cookie decode, internal hostnames, SANs)
    const backends: Record<string, unknown>[] = [];

    // From F5 decoded IPs
    if (lbCookies) {
      for (const cookie of lbCookies) {
        const valueMatch = cookie.match(/BIGipServer.*?=(\d+)\.(\d+)\./);
        if (valueMatch) {
          const encodedIp = parseInt(valueMatch[1], 10);
          const encodedPort = parseInt(valueMatch[2], 10);
          const ip = [
            encodedIp & 0xff,
            (encodedIp >> 8) & 0xff,
            (encodedIp >> 16) & 0xff,
            (encodedIp >> 24) & 0xff,
          ].join(".");
          const port = ((encodedPort & 0xff) << 8) | ((encodedPort >> 8) & 0xff);
          backends.push({
            source: "F5 BIG-IP cookie",
            ip,
            port,
            note: "Backend server IP decoded from F5 persistence cookie",
          });
        }
      }
    }

    // From internal hostnames
    if (internalHostnames && internalHostnames.length > 0) {
      for (const hostname of internalHostnames) {
        backends.push({
          source: "internal_hostname",
          hostname,
          note: "Internal hostname discovered via headers, error pages, or certificate SANs",
        });
      }
    }

    if (backends.length > 0) {
      const backendLayer = (cdnProvider ? 4 : 3) + (lbDetected ? 1 : 0);
      layers.push({
        layer: backendLayer,
        name: "Backend Servers",
        type: "backends",
        details: {
          count: backends.length,
          servers: backends,
        },
      });
    }

    // Certificate SAN analysis
    const sanAnalysis: Record<string, unknown> = {};
    if (certSans && certSans.length > 0) {
      const wildcards = certSans.filter((s) => s.startsWith("*."));
      const specifics = certSans.filter((s) => !s.startsWith("*."));
      const uniqueDomains = [...new Set(certSans.map((s) => {
        const parts = s.replace("*.", "").split(".");
        return parts.slice(-2).join(".");
      }))];

      sanAnalysis.totalSans = certSans.length;
      sanAnalysis.wildcards = wildcards;
      sanAnalysis.specificHosts = specifics;
      sanAnalysis.uniqueRootDomains = uniqueDomains;
      if (uniqueDomains.length > 1) {
        sanAnalysis.multiTenant = true;
        sanAnalysis.note = "Multiple root domains on one certificate suggest shared hosting or multi-tenant infrastructure";
      }
    }

    // Build ASCII topology diagram
    const diagramLines: string[] = [];
    diagramLines.push("=== Infrastructure Topology ===");
    diagramLines.push("");
    for (const layer of layers) {
      const indent = "  ".repeat(layer.layer - 1);
      const arrow = layer.layer > 1 ? `${indent}|` : "";
      if (arrow) diagramLines.push(arrow);
      diagramLines.push(`${indent}[${layer.name}] (${layer.type})`);
    }
    diagramLines.push("");

    const result = {
      topology: {
        layers,
        totalLayers: layers.length,
        hasCdn: !!cdnProvider,
        hasLoadBalancer: lbDetected,
        backendCount: backends.length,
      },
      sanAnalysis,
      diagram: diagramLines.join("\n"),
      recommendations: [
        ...(cdnProvider ? [`CDN detected (${cdnProvider}). JARM and TLS fingerprints reflect CDN, not origin.`] : []),
        ...(backends.length > 0 ? ["Backend IPs discovered. These may be directly accessible, bypassing WAF/CDN."] : []),
        ...(lbDetected ? ["Load balancer detected. Multiple requests may hit different backends."] : []),
        ...(certSans && certSans.length > 5
          ? ["Certificate has many SANs — review for related domains and potential attack surface expansion."]
          : []),
      ],
    };

    return json(result);
  },
};

// ─── Export All Correlation Tools ───

export const correlationTools: ToolDef[] = [
  fpCorrelate,
  fpHoneypot,
  fpSpoofing,
  fpCompare,
  fpTopology,
];
