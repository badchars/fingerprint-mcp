import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { requireApiKey } from "../utils/require-key.js";
import { json } from "../types/index.js";

const limiter = new RateLimiter(1000); // respect API rate limits
const cache = new TTLCache<any>(600_000); // 10min cache

// ─── Helpers ───

const IP_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function isIpAddress(value: string): boolean {
  return IP_REGEX.test(value);
}

// ─── Tool 1: osint_shodan ───

async function osintShodan(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const ip = args.ip as string | undefined;
  const query = args.query as string | undefined;
  const page = (args.page as number | undefined) ?? 1;

  if (!ip && !query) {
    return json({ error: "Either 'ip' or 'query' parameter is required" });
  }

  const apiKey = requireApiKey(ctx.config.shodanApiKey, "Shodan", "SHODAN_API_KEY");

  // Search mode
  if (query) {
    const cacheKey = `osint_shodan:search:${query}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    try {
      const url = `https://api.shodan.io/shodan/host/search?key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&page=${page}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errText = await response.text();
        return json({
          error: `Shodan API error: ${response.status}`,
          details: errText,
        });
      }

      const data = await response.json();
      const result = {
        query,
        page,
        total: data.total ?? 0,
        matches: (data.matches ?? []).map((match: any) => ({
          ip: match.ip_str,
          port: match.port,
          transport: match.transport,
          product: match.product ?? null,
          version: match.version ?? null,
          os: match.os ?? null,
          hostnames: match.hostnames ?? [],
          org: match.org ?? null,
          isp: match.isp ?? null,
          asn: match.asn ?? null,
          country: match.location?.country_name ?? null,
          city: match.location?.city ?? null,
          banner: match.data?.substring(0, 500) ?? null,
          vulns: match.vulns ? Object.keys(match.vulns) : [],
          tags: match.tags ?? [],
          timestamp: match.timestamp ?? null,
        })),
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err) {
      return json({ error: `Shodan search failed: ${(err as Error).message}` });
    }
  }

  // Host lookup mode
  const cacheKey = `osint_shodan:host:${ip}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const url = `https://api.shodan.io/shodan/host/${encodeURIComponent(ip!)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return json({
        error: `Shodan API error: ${response.status}`,
        details: errText,
      });
    }

    const data = await response.json();
    const result = {
      ip: data.ip_str,
      hostnames: data.hostnames ?? [],
      os: data.os ?? null,
      org: data.org ?? null,
      isp: data.isp ?? null,
      asn: data.asn ?? null,
      country: data.country_name ?? null,
      city: data.city ?? null,
      lastUpdate: data.last_update ?? null,
      vulns: data.vulns ? Object.keys(data.vulns) : [],
      tags: data.tags ?? [],
      ports: data.ports ?? [],
      services: (data.data ?? []).map((svc: any) => ({
        port: svc.port,
        transport: svc.transport,
        product: svc.product ?? null,
        version: svc.version ?? null,
        cpe: svc.cpe ?? [],
        banner: svc.data?.substring(0, 500) ?? null,
        ssl: svc.ssl
          ? {
              jarm: svc.ssl.jarm ?? null,
              ja3s: svc.ssl.ja3s ?? null,
              cert: svc.ssl.cert
                ? {
                    subject: svc.ssl.cert.subject ?? null,
                    issuer: svc.ssl.cert.issuer ?? null,
                    expires: svc.ssl.cert.expires ?? null,
                    fingerprint: svc.ssl.cert.fingerprint?.sha256 ?? null,
                  }
                : null,
            }
          : null,
        http: svc.http
          ? {
              title: svc.http.title ?? null,
              server: svc.http.server ?? null,
              status: svc.http.status ?? null,
              redirects: svc.http.redirects ?? [],
            }
          : null,
      })),
      totalServices: (data.data ?? []).length,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `Shodan host lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 2: osint_censys ───

async function osintCensys(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const ip = args.ip as string | undefined;
  const query = args.query as string | undefined;
  const perPage = (args.perPage as number | undefined) ?? 25;

  if (!ip && !query) {
    return json({ error: "Either 'ip' or 'query' parameter is required" });
  }

  const apiId = requireApiKey(ctx.config.censysApiId, "Censys", "CENSYS_API_ID");
  const apiSecret = requireApiKey(ctx.config.censysApiSecret, "Censys", "CENSYS_API_SECRET");
  const authHeader = `Basic ${btoa(`${apiId}:${apiSecret}`)}`;

  // Search mode
  if (query) {
    const cacheKey = `osint_censys:search:${query}:${perPage}`;
    const cached = cache.get(cacheKey);
    if (cached) return json(cached);

    await limiter.acquire();

    try {
      const response = await fetch("https://search.censys.io/api/v2/hosts/search", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, per_page: perPage }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errText = await response.text();
        return json({
          error: `Censys API error: ${response.status}`,
          details: errText,
        });
      }

      const data = await response.json();
      const hits = data.result?.hits ?? [];
      const result = {
        query,
        totalHits: data.result?.total ?? 0,
        hits: hits.map((hit: any) => ({
          ip: hit.ip,
          services: (hit.services ?? []).map((svc: any) => ({
            port: svc.port,
            serviceName: svc.service_name ?? null,
            transportProtocol: svc.transport_protocol ?? null,
            certificate: svc.certificate ?? null,
            jarm: svc.jarm?.fingerprint ?? null,
            software: svc.software ?? [],
            banner: svc.banner ?? null,
          })),
          autonomousSystem: hit.autonomous_system ?? null,
          location: hit.location ?? null,
          operatingSystem: hit.operating_system ?? null,
          lastUpdatedAt: hit.last_updated_at ?? null,
        })),
      };

      cache.set(cacheKey, result);
      return json(result);
    } catch (err) {
      return json({ error: `Censys search failed: ${(err as Error).message}` });
    }
  }

  // Host lookup mode
  const cacheKey = `osint_censys:host:${ip}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const response = await fetch(`https://search.censys.io/api/v2/hosts/${encodeURIComponent(ip!)}`, {
      headers: {
        Authorization: authHeader,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return json({
        error: `Censys API error: ${response.status}`,
        details: errText,
      });
    }

    const data = await response.json();
    const host = data.result ?? {};
    const result = {
      ip: host.ip,
      services: (host.services ?? []).map((svc: any) => ({
        port: svc.port,
        serviceName: svc.service_name ?? null,
        transportProtocol: svc.transport_protocol ?? null,
        certificate: svc.certificate ?? null,
        jarm: svc.jarm?.fingerprint ?? null,
        software: svc.software ?? [],
        banner: svc.banner ?? null,
        tls: svc.tls
          ? {
              version: svc.tls.version_selected ?? null,
              cipherSuite: svc.tls.cipher_selected ?? null,
              certificate: svc.tls.certificates?.leaf_data
                ? {
                    subject: svc.tls.certificates.leaf_data.subject ?? null,
                    issuer: svc.tls.certificates.leaf_data.issuer ?? null,
                    fingerprint: svc.tls.certificates.leaf_data.fingerprint ?? null,
                    sans: svc.tls.certificates.leaf_data.names ?? [],
                  }
                : null,
            }
          : null,
      })),
      autonomousSystem: host.autonomous_system ?? null,
      location: host.location ?? null,
      operatingSystem: host.operating_system ?? null,
      lastUpdatedAt: host.last_updated_at ?? null,
      labels: host.labels ?? [],
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `Censys host lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 3: osint_reverse_ip ───

async function osintReverseIp(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const ip = args.ip as string;
  const cacheKey = `osint_reverse_ip:${ip}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const url = `https://api.hackertarget.com/reverseiplookup/?q=${encodeURIComponent(ip)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return json({
        error: `HackerTarget API error: ${response.status}`,
      });
    }

    const text = await response.text();

    // HackerTarget returns "error ..." for errors and plain-text domain list
    if (text.startsWith("error") || text.startsWith("API count exceeded")) {
      return json({
        ip,
        error: text.trim(),
        domains: [],
        totalDomains: 0,
      });
    }

    const domains = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== ip);

    const result = {
      ip,
      domains,
      totalDomains: domains.length,
      sharedHosting: domains.length > 1,
      intelligence: {
        isSharedHosting: domains.length > 5,
        note:
          domains.length > 5
            ? "Multiple domains on same IP suggest shared hosting — may indicate lower-value targets or shared infrastructure."
            : domains.length > 1
              ? "A few co-hosted domains — could be related properties or small shared hosting."
              : "Single domain on IP — likely dedicated hosting.",
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `Reverse IP lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 4: osint_whois ───

async function osintWhois(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const target = args.target as string;
  const cacheKey = `osint_whois:${target}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const url = `https://api.hackertarget.com/whois/?q=${encodeURIComponent(target)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return json({
        error: `HackerTarget WHOIS API error: ${response.status}`,
      });
    }

    const rawText = await response.text();

    if (rawText.startsWith("error") || rawText.startsWith("API count exceeded")) {
      return json({
        target,
        error: rawText.trim(),
      });
    }

    // Parse WHOIS fields from raw text
    const parsed: Record<string, string> = {};
    const lines = rawText.split("\n");
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        if (key && value) {
          // Store first occurrence (WHOIS often has duplicates)
          if (!parsed[key]) {
            parsed[key] = value;
          }
        }
      }
    }

    // Extract key fields
    const registrantName =
      parsed["registrant name"] ??
      parsed["registrant"] ??
      null;
    const registrantOrg =
      parsed["registrant organization"] ??
      parsed["registrant org"] ??
      parsed["org-name"] ??
      parsed["organization"] ??
      null;
    const registrantEmail =
      parsed["registrant email"] ??
      parsed["abuse-mailbox"] ??
      null;
    const creationDate =
      parsed["creation date"] ??
      parsed["created"] ??
      parsed["registration date"] ??
      null;
    const expirationDate =
      parsed["registry expiry date"] ??
      parsed["expiration date"] ??
      parsed["expires"] ??
      null;
    const registrar =
      parsed["registrar"] ??
      null;
    const dnssec =
      parsed["dnssec"] ??
      null;

    // Extract nameservers
    const nameservers: string[] = [];
    for (const line of lines) {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith("name server:") || lower.startsWith("nserver:")) {
        const ns = line.substring(line.indexOf(":") + 1).trim();
        if (ns) nameservers.push(ns.toLowerCase());
      }
    }

    // Intelligence analysis
    let domainAgeWarning: string | null = null;
    if (creationDate) {
      const created = new Date(creationDate);
      const now = new Date();
      const ageMonths = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageMonths < 6) {
        domainAgeWarning = `Domain is less than 6 months old (created ${creationDate}) — potentially suspicious for phishing or fraud.`;
      }
    }

    const result = {
      target,
      registrant: {
        name: registrantName,
        organization: registrantOrg,
        email: registrantEmail,
      },
      dates: {
        created: creationDate,
        expires: expirationDate,
      },
      registrar,
      nameservers,
      dnssec,
      intelligence: {
        domainAgeWarning,
        hostingProvider:
          nameservers.length > 0
            ? `Nameservers suggest hosting with: ${nameservers[0]}`
            : null,
      },
      raw: rawText,
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `WHOIS lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 5: osint_web_archive ───

async function osintWebArchive(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const url = args.url as string;
  const limit = (args.limit as number | undefined) ?? 50;
  const cacheKey = `osint_web_archive:${url}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const apiUrl = `https://web.archive.org/web/timemap/json?url=${encodeURIComponent(url)}&limit=${limit}&output=json`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return json({
        error: `Wayback Machine API error: ${response.status}`,
      });
    }

    const data = await response.json();

    // First row is headers: ["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
    if (!Array.isArray(data) || data.length < 2) {
      return json({
        url,
        found: false,
        snapshots: [],
        totalSnapshots: 0,
        message: "No archived snapshots found for this URL.",
      });
    }

    const headers = data[0] as string[];
    const rows = data.slice(1) as string[][];

    const timestampIdx = headers.indexOf("timestamp");
    const originalIdx = headers.indexOf("original");
    const mimetypeIdx = headers.indexOf("mimetype");
    const statusIdx = headers.indexOf("statuscode");

    const snapshots = rows.map((row) => ({
      timestamp: row[timestampIdx] ?? null,
      original: row[originalIdx] ?? null,
      mimetype: row[mimetypeIdx] ?? null,
      statusCode: row[statusIdx] ?? null,
      archiveUrl:
        row[timestampIdx]
          ? `https://web.archive.org/web/${row[timestampIdx]}/${row[originalIdx] ?? url}`
          : null,
    }));

    const timestamps = snapshots
      .map((s) => s.timestamp)
      .filter((t): t is string => t !== null)
      .sort();

    const result = {
      url,
      found: true,
      totalSnapshots: snapshots.length,
      oldestCapture: timestamps[0] ?? null,
      newestCapture: timestamps[timestamps.length - 1] ?? null,
      snapshots,
      intelligence: {
        note: "Historical snapshots may reveal removed pages, old technology stacks, exposed credentials, or development/staging content that was once public.",
        oldestArchiveUrl:
          timestamps[0]
            ? `https://web.archive.org/web/${timestamps[0]}/${url}`
            : null,
        newestArchiveUrl:
          timestamps.length > 0
            ? `https://web.archive.org/web/${timestamps[timestamps.length - 1]}/${url}`
            : null,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `Wayback Machine lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 6: osint_virustotal ───

async function osintVirustotal(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const target = args.target as string;
  let type = args.type as "domain" | "ip" | undefined;

  // Auto-detect type if not specified
  if (!type) {
    type = isIpAddress(target) ? "ip" : "domain";
  }

  const apiKey = requireApiKey(ctx.config.virustotalApiKey, "VirusTotal", "VIRUSTOTAL_API_KEY");
  const cacheKey = `osint_virustotal:${type}:${target}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  try {
    const endpoint =
      type === "ip"
        ? `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(target)}`
        : `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(target)}`;

    const response = await fetch(endpoint, {
      headers: {
        "x-apikey": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return json({
        error: `VirusTotal API error: ${response.status}`,
        details: errText,
      });
    }

    const data = await response.json();
    const attributes = data.data?.attributes ?? {};

    if (type === "domain") {
      const result = {
        target,
        type: "domain",
        reputation: attributes.reputation ?? null,
        categories: attributes.categories ?? {},
        lastAnalysisStats: attributes.last_analysis_stats ?? {},
        lastAnalysisDate: attributes.last_analysis_date
          ? new Date(attributes.last_analysis_date * 1000).toISOString()
          : null,
        whois: attributes.whois ?? null,
        lastDnsRecords: (attributes.last_dns_records ?? []).map((rec: any) => ({
          type: rec.type,
          value: rec.value,
          ttl: rec.ttl ?? null,
        })),
        lastHttpsCertificate: attributes.last_https_certificate
          ? {
              subject: attributes.last_https_certificate.subject ?? null,
              issuer: attributes.last_https_certificate.issuer ?? null,
              validity: attributes.last_https_certificate.validity ?? null,
              extensions: attributes.last_https_certificate.extensions
                ? {
                    subjectAlternativeName:
                      attributes.last_https_certificate.extensions.subject_alternative_name ?? [],
                  }
                : null,
            }
          : null,
        registrar: attributes.registrar ?? null,
        creationDate: attributes.creation_date
          ? new Date(attributes.creation_date * 1000).toISOString()
          : null,
        totalVotes: attributes.total_votes ?? {},
        tags: attributes.tags ?? [],
        popularity: attributes.popularity_ranks ?? {},
        intelligence: {
          malicious:
            (attributes.last_analysis_stats?.malicious ?? 0) > 0
              ? `${attributes.last_analysis_stats.malicious} security vendors flagged this domain as malicious.`
              : "No security vendors flagged this domain.",
          suspicious:
            (attributes.last_analysis_stats?.suspicious ?? 0) > 0
              ? `${attributes.last_analysis_stats.suspicious} vendors flagged as suspicious.`
              : null,
        },
      };

      cache.set(cacheKey, result);
      return json(result);
    }

    // IP address result
    const result = {
      target,
      type: "ip",
      reputation: attributes.reputation ?? null,
      asOwner: attributes.as_owner ?? null,
      asn: attributes.asn ?? null,
      continent: attributes.continent ?? null,
      country: attributes.country ?? null,
      network: attributes.network ?? null,
      lastAnalysisStats: attributes.last_analysis_stats ?? {},
      lastAnalysisDate: attributes.last_analysis_date
        ? new Date(attributes.last_analysis_date * 1000).toISOString()
        : null,
      whois: attributes.whois ?? null,
      totalVotes: attributes.total_votes ?? {},
      tags: attributes.tags ?? [],
      intelligence: {
        malicious:
          (attributes.last_analysis_stats?.malicious ?? 0) > 0
            ? `${attributes.last_analysis_stats.malicious} security vendors flagged this IP as malicious.`
            : "No security vendors flagged this IP.",
        suspicious:
          (attributes.last_analysis_stats?.suspicious ?? 0) > 0
            ? `${attributes.last_analysis_stats.suspicious} vendors flagged as suspicious.`
            : null,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `VirusTotal lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool Definitions ───

export const osintTools: ToolDef[] = [
  {
    name: "osint_shodan",
    description:
      "Shodan host lookup and search. Queries Shodan for open ports, services, banners, OS, hostnames, ASN, org, ISP, country, vulnerabilities, and tags. Supports both IP lookup and Shodan dork search queries (e.g., http.favicon.hash, ssl.jarm, ssh.fingerprint, http.title, ssl.cert.subject.cn).",
    schema: {
      ip: z.string().optional().describe("IP address to look up"),
      query: z
        .string()
        .optional()
        .describe("Shodan search query (e.g., http.favicon.hash:-586023785)"),
      page: z.number().optional().default(1).describe("Search results page"),
    },
    execute: osintShodan,
  },
  {
    name: "osint_censys",
    description:
      "Censys host lookup and search. Returns services with protocol details, certificates, JARM fingerprints, detected software, autonomous system info, and location data. Supports both direct IP lookup and Censys search queries (e.g., services.jarm.fingerprint:HASH).",
    schema: {
      ip: z.string().optional().describe("IP address to look up"),
      query: z.string().optional().describe("Censys search query"),
      perPage: z.number().optional().default(25).describe("Results per page"),
    },
    execute: osintCensys,
  },
  {
    name: "osint_reverse_ip",
    description:
      "Reverse IP lookup via HackerTarget. Finds all domains hosted on the same IP address for shared hosting discovery, related target identification, and co-hosted application enumeration. Free API, no key required.",
    schema: {
      ip: z.string().describe("IP address for reverse lookup"),
    },
    execute: (args) => osintReverseIp(args),
  },
  {
    name: "osint_whois",
    description:
      "WHOIS lookup via HackerTarget. Extracts registrant name, organization, email, creation/expiration dates, nameservers, registrar, and DNSSEC status. Flags domains created less than 6 months ago as potentially suspicious. Free API, no key required.",
    schema: {
      target: z.string().describe("Domain or IP for WHOIS lookup"),
    },
    execute: (args) => osintWhois(args),
  },
  {
    name: "osint_web_archive",
    description:
      "Wayback Machine historical snapshot lookup. Returns archived page captures with timestamps showing oldest/newest snapshots and direct archive URLs. Reveals technology changes over time, removed pages, and content that was once publicly accessible.",
    schema: {
      url: z.string().describe("URL to check in Wayback Machine"),
      limit: z
        .number()
        .optional()
        .default(50)
        .describe("Max snapshots to return"),
    },
    execute: (args) => osintWebArchive(args),
  },
  {
    name: "osint_virustotal",
    description:
      "VirusTotal domain and IP intelligence. Returns subdomains, DNS resolution history, WHOIS data, communicating files (malware associations), detection ratio across security vendors, categories, reputation score, and certificate details. Auto-detects domain vs IP if type is omitted.",
    schema: {
      target: z.string().describe("Domain or IP for VirusTotal lookup"),
      type: z
        .enum(["domain", "ip"])
        .optional()
        .describe("Target type (auto-detected if omitted)"),
    },
    execute: osintVirustotal,
  },
];
