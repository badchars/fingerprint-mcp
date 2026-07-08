import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import { requireApiKey } from "../utils/require-key.js";
import { json } from "../types/index.js";
import * as dns from "node:dns/promises";
import { randomUUID } from "node:crypto";

const limiter = new RateLimiter(500);
const cache = new TTLCache<unknown>(600_000);

// ─── Helpers ───

const IP_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function categorizeHostname(hostname: string): string {
  const h = hostname.toLowerCase();
  if (/^(dev|development)[\.-]/.test(h) || /[\.-](dev|development)\./.test(h)) return "development";
  if (/^(staging|stage|stg)[\.-]/.test(h) || /[\.-](staging|stage|stg)\./.test(h)) return "staging";
  if (/^(admin|administrator|panel)[\.-]/.test(h)) return "admin";
  if (/^(api|rest|graphql)[\.-]/.test(h)) return "api";
  if (/^(vpn|gateway|gw|tunnel)[\.-]/.test(h)) return "vpn";
  if (/^(mail|smtp|pop|imap|mx|webmail)[\.-]/.test(h)) return "mail";
  if (/^(internal|intranet|corp)[\.-]/.test(h)) return "internal";
  if (/^(test|testing|qa|uat)[\.-]/.test(h)) return "testing";
  if (/^(cdn|static|assets|media|img|images)[\.-]/.test(h)) return "cdn";
  if (/^(ci|cd|jenkins|gitlab|github|build|deploy)[\.-]/.test(h)) return "ci-cd";
  if (/^(db|database|mysql|postgres|redis|mongo|elastic)[\.-]/.test(h)) return "database";
  if (/^(ns\d*|dns\d*)\./.test(h)) return "nameserver";
  if (/^(www|web)\./.test(h)) return "web";
  return "other";
}

// ─── Tool 1: enum_subdomains ───

async function enumSubdomains(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const source = (args.source as "securitytrails" | "hackertarget" | "auto") ?? "auto";
  const cacheKey = `enum_subdomains:${domain}:${source}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  let subdomainList: string[] = [];
  let usedSource: string;

  // Determine which source to use
  const useSecurityTrails =
    source === "securitytrails" || (source === "auto" && ctx.config.securitytrailsApiKey);

  if (useSecurityTrails) {
    const apiKey = requireApiKey(
      ctx.config.securitytrailsApiKey,
      "SecurityTrails",
      "SECURITYTRAILS_API_KEY",
    );
    usedSource = "securitytrails";

    await limiter.acquire();

    try {
      const response = await fetch(
        `https://api.securitytrails.com/v1/domain/${encodeURIComponent(domain)}/subdomains`,
        {
          headers: { APIKEY: apiKey },
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        return json({
          error: `SecurityTrails API error: ${response.status}`,
          details: errText,
        });
      }

      const data = await response.json();
      const subs = (data.subdomains ?? []) as string[];
      subdomainList = subs.map((sub) => `${sub}.${domain}`);
    } catch (err) {
      return json({
        error: `SecurityTrails request failed: ${(err as Error).message}`,
      });
    }
  } else {
    // HackerTarget fallback
    usedSource = "hackertarget";

    await limiter.acquire();

    try {
      const response = await fetch(
        `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`,
        {
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        return json({
          error: `HackerTarget API error: ${response.status}`,
        });
      }

      const text = await response.text();

      if (text.startsWith("error") || text.startsWith("API count exceeded")) {
        return json({
          domain,
          error: text.trim(),
          subdomains: [],
          total: 0,
        });
      }

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const parts = line.split(",");
        if (parts.length >= 1 && parts[0]) {
          subdomainList.push(parts[0].trim());
        }
      }
    } catch (err) {
      return json({
        error: `HackerTarget request failed: ${(err as Error).message}`,
      });
    }
  }

  // Resolve IPs and categorize each subdomain
  const subdomains: { hostname: string; ips: string[]; category: string }[] = [];
  const categories: Record<string, number> = {};

  for (const hostname of subdomainList) {
    let ips: string[] = [];
    try {
      await limiter.acquire();
      ips = await dns.resolve4(hostname);
    } catch {
      // DNS resolution failed — no IPs
    }

    const category = categorizeHostname(hostname);
    categories[category] = (categories[category] ?? 0) + 1;

    subdomains.push({ hostname, ips, category });
  }

  const result = {
    domain,
    source: usedSource,
    subdomains,
    total: subdomains.length,
    categories,
    intelligence: {
      note: `Discovered ${subdomains.length} subdomains via ${usedSource}.`,
      interestingCategories: Object.entries(categories)
        .filter(([cat]) =>
          ["admin", "staging", "development", "internal", "database", "vpn", "ci-cd", "testing"].includes(cat),
        )
        .map(([cat, count]) => `${cat}: ${count}`),
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 2: enum_asn_neighbors ───

async function enumAsnNeighbors(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const target = args.target as string;
  const limit = (args.limit as number) ?? 100;
  const cacheKey = `enum_asn_neighbors:${target}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  // Resolve domain to IP if needed
  let ip: string;
  if (IP_REGEX.test(target)) {
    ip = target;
  } else {
    try {
      await limiter.acquire();
      const ips = await dns.resolve4(target);
      if (!ips || ips.length === 0) {
        return json({ error: `Could not resolve ${target} to an IP address` });
      }
      ip = ips[0];
    } catch (err) {
      return json({ error: `DNS resolution failed for ${target}: ${(err as Error).message}` });
    }
  }

  // Get ASN for this IP
  await limiter.acquire();

  try {
    const response = await fetch(
      `https://api.hackertarget.com/aslookup/?q=${encodeURIComponent(ip)}`,
      {
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!response.ok) {
      return json({ error: `HackerTarget ASN lookup error: ${response.status}` });
    }

    const text = await response.text();

    if (text.startsWith("error") || text.startsWith("API count exceeded")) {
      return json({ target, ip, error: text.trim() });
    }

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 0) {
      return json({ target, ip, error: "No ASN data returned" });
    }

    // First line: "ip,asn_number,org_name" or similar
    const firstLineParts = lines[0].split(",");
    let asnNumber: string | null = null;
    let orgName: string | null = null;

    if (firstLineParts.length >= 2) {
      // Extract ASN number — might be like "AS12345" or just "12345"
      const rawAsn = firstLineParts[1].trim().replace(/^AS/i, "");
      asnNumber = rawAsn;
      orgName = firstLineParts.slice(2).join(",").trim() || null;
    }

    if (!asnNumber) {
      return json({ target, ip, error: "Could not parse ASN number from response" });
    }

    // Get all prefixes for this ASN
    await limiter.acquire();

    const asnResponse = await fetch(
      `https://api.hackertarget.com/aslookup/?q=AS${asnNumber}`,
      {
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!asnResponse.ok) {
      return json({ error: `HackerTarget ASN prefix lookup error: ${asnResponse.status}` });
    }

    const asnText = await asnResponse.text();
    const asnLines = asnText.split("\n").map((l) => l.trim()).filter(Boolean);

    // Parse CIDR ranges from the response
    const prefixes: string[] = [];
    for (const line of asnLines) {
      // CIDR pattern: x.x.x.x/xx or x:x:x::/xx
      const cidrMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2})/);
      if (cidrMatch) {
        prefixes.push(cidrMatch[1]);
      }
      // Also check for IPv6 CIDR
      const ipv6CidrMatch = line.match(/([0-9a-fA-F:]+\/\d{1,3})/);
      if (ipv6CidrMatch && !cidrMatch) {
        prefixes.push(ipv6CidrMatch[1]);
      }
    }

    const limitedPrefixes = prefixes.slice(0, limit);

    const result = {
      target,
      ip,
      asn: {
        number: `AS${asnNumber}`,
        org: orgName,
      },
      prefixes: limitedPrefixes,
      totalPrefixes: prefixes.length,
      intelligence: {
        note: `ASN AS${asnNumber} (${orgName ?? "unknown"}) announces ${prefixes.length} prefix(es).`,
        networkSize: prefixes.length > 50
          ? "Large network — likely a hosting provider, ISP, or major organization."
          : prefixes.length > 10
            ? "Medium-sized network — could be a mid-size company or regional ISP."
            : "Small network — likely a single organization with limited IP space.",
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `ASN neighbor lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 3: enum_passive_dns ───

async function enumPassiveDns(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const type = (args.type as "a" | "aaaa" | "mx" | "ns" | "soa") ?? "a";
  const cacheKey = `enum_passive_dns:${domain}:${type}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  let apiKey: string;
  try {
    apiKey = requireApiKey(
      ctx.config.securitytrailsApiKey,
      "SecurityTrails",
      "SECURITYTRAILS_API_KEY",
    );
  } catch {
    return json({
      error: "SecurityTrails API key required for passive DNS history.",
      hint: "Set SECURITYTRAILS_API_KEY environment variable",
    });
  }

  await limiter.acquire();

  try {
    const response = await fetch(
      `https://api.securitytrails.com/v1/history/${encodeURIComponent(domain)}/dns/${type}`,
      {
        headers: { APIKEY: apiKey },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      return json({
        error: `SecurityTrails API error: ${response.status}`,
        details: errText,
      });
    }

    const data = await response.json();
    const records: {
      first_seen: string;
      last_seen: string;
      values: { ip?: string; ip_count?: number; host?: string }[];
    }[] = [];

    for (const record of data.records ?? []) {
      records.push({
        first_seen: record.first_seen ?? "unknown",
        last_seen: record.last_seen ?? "unknown",
        values: (record.values ?? []).map((v: any) => ({
          ip: v.ip ?? v.host ?? v.ip_count ?? null,
          ip_count: v.ip_count ?? null,
          host: v.host ?? null,
        })),
      });
    }

    // Detect infrastructure changes
    const changes: string[] = [];
    if (records.length > 1) {
      changes.push(`${records.length} historical DNS record sets found — infrastructure has changed over time.`);

      // Check for IP changes in A records
      if (type === "a") {
        const uniqueIps = new Set<string>();
        for (const rec of records) {
          for (const v of rec.values) {
            if (v.ip) uniqueIps.add(v.ip as string);
          }
        }
        if (uniqueIps.size > 1) {
          changes.push(`${uniqueIps.size} unique IP addresses observed — domain has migrated between hosts.`);
        }
      }
    }

    const result = {
      domain,
      type,
      records,
      total_records: records.length,
      intelligence: {
        note: records.length > 0
          ? `Found ${records.length} historical ${type.toUpperCase()} record(s) for ${domain}.`
          : `No historical ${type.toUpperCase()} records found for ${domain}.`,
        changes,
      },
    };

    cache.set(cacheKey, result);
    return json(result);
  } catch (err) {
    return json({ error: `Passive DNS lookup failed: ${(err as Error).message}` });
  }
}

// ─── Tool 4: enum_tld_expansion ───

async function enumTldExpansion(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const basename = args.basename as string;
  const tlds = (args.tlds as string[] | undefined) ?? [
    "com", "net", "org", "io", "dev", "co", "app", "ai", "xyz", "info",
    "biz", "us", "uk", "de", "fr", "eu", "ca", "au", "nl", "ru",
    "cn", "jp", "in", "com.tr", "me",
  ];
  const cacheKey = `enum_tld_expansion:${basename}:${tlds.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  const results: {
    domain: string;
    tld: string;
    active: boolean;
    ips: string[];
    nameservers: string[];
  }[] = [];

  for (const tld of tlds) {
    const domain = `${basename}.${tld}`;
    await limiter.acquire();

    let ips: string[] = [];
    let active = false;

    try {
      ips = await dns.resolve4(domain);
      active = ips.length > 0;
    } catch {
      // Domain does not resolve — inactive
    }

    let nameservers: string[] = [];
    if (active) {
      try {
        await limiter.acquire();
        nameservers = await dns.resolveNs(domain);
      } catch {
        // NS resolution failed
      }
    }

    results.push({ domain, tld, active, ips, nameservers });
  }

  const activeResults = results.filter((r) => r.active);
  const inactiveResults = results.filter((r) => !r.active);

  // Group by shared NS
  const nsGroups: Record<string, string[]> = {};
  for (const r of activeResults) {
    if (r.nameservers.length > 0) {
      const nsKey = [...r.nameservers].sort().join(",");
      if (!nsGroups[nsKey]) nsGroups[nsKey] = [];
      nsGroups[nsKey].push(r.domain);
    }
  }

  // Filter groups with more than one domain (same owner signals)
  const sameNsGroups: Record<string, string[]> = {};
  for (const [ns, domains] of Object.entries(nsGroups)) {
    if (domains.length > 1) {
      sameNsGroups[ns] = domains;
    }
  }

  const result = {
    basename,
    results,
    active_count: activeResults.length,
    inactive_count: inactiveResults.length,
    same_ns_groups: sameNsGroups,
    intelligence: {
      note: `${activeResults.length} of ${tlds.length} TLD variations are active for "${basename}".`,
      sameOwnerHint: Object.keys(sameNsGroups).length > 0
        ? "Domains sharing the same nameservers likely belong to the same organization."
        : "No domains share the same nameservers — ownership may differ.",
      activeTlds: activeResults.map((r) => r.tld),
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 5: enum_related_domains ───

async function enumRelatedDomains(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const analyticsId = args.analyticsId as string | undefined;
  const nameserversParam = args.nameservers as string[] | undefined;
  const cacheKey = `enum_related_domains:${domain}:${analyticsId ?? ""}:${(nameserversParam ?? []).join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  // Query crt.sh for certificate SANs
  let certSANs: string[] = [];
  let relatedRootDomains: string[] = [];

  try {
    const response = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
      {
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (response.ok) {
      const data = await response.json();
      const allNames = new Set<string>();

      for (const entry of data as any[]) {
        const nameValue = entry.name_value ?? "";
        const names = nameValue.split("\n").map((n: string) => n.trim().toLowerCase()).filter(Boolean);
        for (const name of names) {
          // Remove wildcard prefix
          const cleanName = name.replace(/^\*\./, "");
          allNames.add(cleanName);
        }
      }

      certSANs = [...allNames];

      // Extract unique root domains
      const rootDomains = new Set<string>();
      for (const name of allNames) {
        const parts = name.split(".");
        if (parts.length >= 2) {
          // Handle multi-level TLDs like co.uk, com.tr
          const possibleRoots: string[] = [];
          if (parts.length >= 3) {
            // Try 2-level root: domain.tld
            possibleRoots.push(parts.slice(-2).join("."));
            // Try 3-level root: domain.co.uk
            possibleRoots.push(parts.slice(-3).join("."));
          } else {
            possibleRoots.push(parts.join("."));
          }
          // Use the 2-level root domain as default
          rootDomains.add(parts.slice(-2).join("."));
        }
      }

      relatedRootDomains = [...rootDomains].filter((d) => d !== domain);
    }
  } catch {
    // crt.sh query failed
  }

  // For each unique root domain, get NS records
  const relatedDomains: {
    domain: string;
    source: string;
    sharedNs: boolean;
  }[] = [];

  // Get NS for primary domain
  let primaryNs: string[] = [];
  try {
    await limiter.acquire();
    primaryNs = await dns.resolveNs(domain);
  } catch {
    // NS resolution failed
  }

  const nsToMatch = nameserversParam ?? primaryNs;

  for (const relDomain of relatedRootDomains) {
    await limiter.acquire();

    let relNs: string[] = [];
    try {
      relNs = await dns.resolveNs(relDomain);
    } catch {
      // NS resolution failed
    }

    const sharedNs =
      nsToMatch.length > 0 &&
      relNs.length > 0 &&
      relNs.some((ns) => nsToMatch.includes(ns));

    relatedDomains.push({
      domain: relDomain,
      source: "certificate_transparency",
      sharedNs,
    });
  }

  const intelligenceNotes: string[] = [];
  intelligenceNotes.push(
    `Found ${certSANs.length} unique names in certificate transparency logs.`,
  );
  intelligenceNotes.push(
    `${relatedRootDomains.length} unique root domain(s) discovered beyond ${domain}.`,
  );

  if (analyticsId) {
    intelligenceNotes.push(
      `Analytics ID "${analyticsId}" provided — cross-referencing requires fetching page content (not performed here). Use tools like BuiltWith or PublicWWW for verification.`,
    );
  }

  const sharedNsDomains = relatedDomains.filter((d) => d.sharedNs);
  if (sharedNsDomains.length > 0) {
    intelligenceNotes.push(
      `${sharedNsDomains.length} related domain(s) share nameservers with ${domain} — likely same owner.`,
    );
  }

  const result = {
    domain,
    relatedDomains,
    totalFound: relatedDomains.length,
    certSANs,
    intelligence: {
      notes: intelligenceNotes,
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 6: enum_wildcard_detect ───

async function enumWildcardDetect(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const cacheKey = `enum_wildcard_detect:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  // Generate 5 random subdomain names
  const randomSubs = Array.from({ length: 5 }, () =>
    `${randomUUID().slice(0, 8)}.${domain}`,
  );

  const resolvedResults: { subdomain: string; ips: string[] | null }[] = [];

  for (const sub of randomSubs) {
    await limiter.acquire();

    try {
      const ips = await dns.resolve4(sub);
      resolvedResults.push({ subdomain: sub, ips });
    } catch {
      resolvedResults.push({ subdomain: sub, ips: null });
    }
  }

  // Analyze results
  const resolvedCount = resolvedResults.filter((r) => r.ips !== null && r.ips.length > 0).length;
  const unresolvedCount = resolvedResults.filter((r) => r.ips === null || r.ips.length === 0).length;

  let wildcard: boolean | "partial" = false;
  let wildcardIps: string[] = [];

  if (resolvedCount === randomSubs.length) {
    // All resolved — check if they all point to the same IP(s)
    const allIps = resolvedResults
      .filter((r) => r.ips !== null)
      .map((r) => (r.ips as string[]).sort().join(","));
    const uniqueIpSets = new Set(allIps);

    if (uniqueIpSets.size === 1) {
      wildcard = true;
      wildcardIps = resolvedResults[0].ips ?? [];
    } else {
      wildcard = "partial";
      const ipSet = new Set<string>();
      for (const r of resolvedResults) {
        if (r.ips) {
          for (const ip of r.ips) ipSet.add(ip);
        }
      }
      wildcardIps = [...ipSet];
    }
  } else if (resolvedCount > 0 && unresolvedCount > 0) {
    wildcard = "partial";
    const ipSet = new Set<string>();
    for (const r of resolvedResults) {
      if (r.ips) {
        for (const ip of r.ips) ipSet.add(ip);
      }
    }
    wildcardIps = [...ipSet];
  }

  // Check for wildcard CNAME
  let wildcardCname: string | null = null;
  try {
    await limiter.acquire();
    const cnames = await dns.resolveCname(`*.${domain}`);
    if (cnames && cnames.length > 0) {
      wildcardCname = cnames[0];
    }
  } catch {
    // No wildcard CNAME
  }

  const result = {
    domain,
    wildcard,
    wildcardIps,
    wildcardCname,
    testedSubdomains: resolvedResults.map((r) => ({
      subdomain: r.subdomain,
      resolved: r.ips !== null && r.ips.length > 0,
      ips: r.ips ?? [],
    })),
    intelligence: {
      note: wildcard === true
        ? `Wildcard DNS confirmed for ${domain} — all random subdomains resolve to ${wildcardIps.join(", ")}. Subdomain brute-forcing will produce false positives unless wildcard IPs are filtered.`
        : wildcard === "partial"
          ? `Partial wildcard DNS detected for ${domain} — some random subdomains resolve. Results may be inconsistent; consider filtering known wildcard IPs during enumeration.`
          : `No wildcard DNS detected for ${domain} — subdomain enumeration results should be reliable.`,
      wildcardCname: wildcardCname
        ? `Wildcard CNAME record found pointing to ${wildcardCname}.`
        : null,
      recommendation: wildcard
        ? "Filter wildcard IPs from subdomain enumeration results to avoid false positives."
        : "No filtering needed — proceed with standard subdomain enumeration.",
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 7: enum_scope_summary ───

async function enumScopeSummary(
  args: Record<string, unknown>,
): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const subdomains = (args.subdomains as string[] | undefined) ?? [];
  const ips = (args.ips as string[] | undefined) ?? [];
  const asns = (args.asns as string[] | undefined) ?? [];
  const wildcardZones = (args.wildcardZones as string[] | undefined) ?? [];

  // Categorize subdomains
  const categories: Record<string, string[]> = {};
  for (const sub of subdomains) {
    const category = categorizeHostname(sub);
    if (!categories[category]) categories[category] = [];
    categories[category].push(sub);
  }

  // Group IPs into /24 ranges
  const ipRanges: Record<string, string[]> = {};
  for (const ip of ips) {
    if (IP_REGEX.test(ip)) {
      const octets = ip.split(".");
      const range = `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
      if (!ipRanges[range]) ipRanges[range] = [];
      ipRanges[range].push(ip);
    }
  }

  // Identify interesting findings
  const interestingCategories = [
    "admin", "staging", "development", "internal", "database", "vpn", "ci-cd", "testing",
  ];
  const interestingFindings: { category: string; hosts: string[] }[] = [];

  for (const cat of interestingCategories) {
    if (categories[cat] && categories[cat].length > 0) {
      interestingFindings.push({
        category: cat,
        hosts: categories[cat],
      });
    }
  }

  // Generate recommended actions
  const recommendedActions: string[] = [];

  if (interestingFindings.length > 0) {
    recommendedActions.push(
      `Investigate ${interestingFindings.length} interesting subdomain categories: ${interestingFindings.map((f) => f.category).join(", ")}.`,
    );
  }

  if (categories["admin"]) {
    recommendedActions.push(
      "Admin panels found — test for default credentials, brute-force protection, and authentication bypasses.",
    );
  }

  if (categories["staging"] || categories["development"]) {
    recommendedActions.push(
      "Staging/dev environments found — these often have weaker security controls. Check for debug modes, exposed source, and unpatched software.",
    );
  }

  if (categories["internal"]) {
    recommendedActions.push(
      "Internal/intranet subdomains found — verify they are not publicly accessible and test for information leakage.",
    );
  }

  if (categories["database"]) {
    recommendedActions.push(
      "Database-related subdomains found — check for exposed database management interfaces (phpMyAdmin, Adminer, etc.).",
    );
  }

  if (categories["vpn"]) {
    recommendedActions.push(
      "VPN endpoints found — test for known VPN vulnerabilities (CVEs for Fortinet, Pulse Secure, etc.).",
    );
  }

  if (categories["ci-cd"]) {
    recommendedActions.push(
      "CI/CD systems found — check for unauthenticated access to Jenkins, GitLab, or build pipelines.",
    );
  }

  if (wildcardZones.length > 0) {
    recommendedActions.push(
      `${wildcardZones.length} wildcard DNS zone(s) detected — filter wildcard IPs during enumeration to avoid false positives.`,
    );
  }

  if (Object.keys(ipRanges).length > 3) {
    recommendedActions.push(
      `Infrastructure spans ${Object.keys(ipRanges).length} /24 ranges — consider port scanning key ranges for additional service discovery.`,
    );
  }

  if (asns.length > 1) {
    recommendedActions.push(
      `${asns.length} ASNs discovered — multi-ASN presence suggests cloud/CDN usage or geographically distributed infrastructure.`,
    );
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push(
      "Run enum_subdomains, enum_tld_expansion, and enum_asn_neighbors to expand scope before summarizing.",
    );
  }

  const result = {
    domain,
    summary: {
      totalSubdomains: subdomains.length,
      totalIps: ips.length,
      totalAsns: asns.length,
      wildcardZones: wildcardZones.length,
    },
    categories,
    ipRanges,
    interestingFindings,
    recommendedActions,
    intelligence: {
      attackSurface: {
        uniqueHosts: subdomains.length,
        ipDiversity: Object.keys(ipRanges).length,
        asnDiversity: asns.length,
        interestingCategoryCount: interestingFindings.length,
      },
      riskLevel: interestingFindings.length > 3
        ? "high"
        : interestingFindings.length > 0
          ? "medium"
          : "low",
      note: `Attack surface includes ${subdomains.length} hosts across ${Object.keys(ipRanges).length} /24 range(s) and ${asns.length} ASN(s). ${interestingFindings.length} interesting subdomain categories identified for further investigation.`,
    },
  };

  return json(result);
}

// ─── Tool Definitions ───

export const enumTools: ToolDef[] = [
  {
    name: "enum_subdomains",
    description:
      "Subdomain enumeration via SecurityTrails or HackerTarget. Discovers subdomains, resolves their current IPs, and categorizes each hostname (admin, staging, api, vpn, database, ci-cd, etc.). Uses SecurityTrails when API key is available, falls back to HackerTarget (free, no key required).",
    schema: {
      domain: z.string().describe("Target domain for subdomain enumeration"),
      source: z
        .enum(["securitytrails", "hackertarget", "auto"])
        .optional()
        .default("auto")
        .describe("Enumeration source (auto = SecurityTrails if key available, else HackerTarget)"),
    },
    execute: enumSubdomains,
  },
  {
    name: "enum_asn_neighbors",
    description:
      "ASN neighbor discovery. Finds the ASN for a given IP or domain, then enumerates all IP prefixes (CIDR ranges) announced by that ASN. Reveals the full network footprint of an organization and helps identify other IP ranges that may host related services.",
    schema: {
      target: z.string().describe("IP address or domain to find ASN neighbors"),
      limit: z
        .number()
        .optional()
        .default(100)
        .describe("Max results to return (default: 100)"),
    },
    execute: (args) => enumAsnNeighbors(args),
  },
  {
    name: "enum_passive_dns",
    description:
      "Passive DNS history via SecurityTrails. Retrieves historical DNS records showing infrastructure changes over time — IP migrations, hosting provider switches, and DNS configuration evolution. Requires SecurityTrails API key.",
    schema: {
      domain: z.string().describe("Domain for passive DNS history"),
      type: z
        .enum(["a", "aaaa", "mx", "ns", "soa"])
        .optional()
        .default("a")
        .describe("Record type (default: a)"),
    },
    execute: enumPassiveDns,
  },
  {
    name: "enum_tld_expansion",
    description:
      "TLD/ccTLD expansion check. Tests whether the same base domain name exists on other TLDs (.com, .net, .org, .io, .dev, .ai, etc.). Identifies active variations, compares nameservers to detect same-owner domains, and flags domains that may be related or brand-squatted.",
    schema: {
      basename: z.string().describe("Base domain name without TLD (e.g., 'example')"),
      tlds: z
        .array(z.string())
        .optional()
        .describe("TLDs to check (default: 25 common TLDs including com, net, org, io, dev, co, app, ai, xyz, info, biz, us, uk, de, fr, eu, ca, au, nl, ru, cn, jp, in, com.tr, me)"),
    },
    execute: (args) => enumTldExpansion(args),
  },
  {
    name: "enum_related_domains",
    description:
      "Find domains related by shared infrastructure signals. Queries certificate transparency logs (crt.sh) for certificate SANs, extracts unique root domains, and compares nameservers to identify domains likely owned by the same organization. Optionally accepts analytics IDs for cross-reference hints.",
    schema: {
      domain: z.string().describe("Primary domain to find related domains"),
      analyticsId: z
        .string()
        .optional()
        .describe("Google Analytics/GTM ID for cross-reference"),
      nameservers: z
        .array(z.string())
        .optional()
        .describe("Known NS records to match against"),
    },
    execute: (args) => enumRelatedDomains(args),
  },
  {
    name: "enum_wildcard_detect",
    description:
      "Detect wildcard DNS records. Tests random non-existent subdomains to determine if a domain has wildcard DNS configured. Reports whether wildcard is confirmed, partial, or absent, along with wildcard IPs and CNAME targets. Essential before subdomain brute-forcing to avoid false positives.",
    schema: {
      domain: z.string().describe("Domain to check for wildcard DNS"),
    },
    execute: (args) => enumWildcardDetect(args),
  },
  {
    name: "enum_scope_summary",
    description:
      "Aggregate scope expansion data into an attack surface summary. Categorizes subdomains, groups IPs into /24 ranges, identifies interesting targets (admin panels, staging/dev environments, databases, VPNs, CI/CD), and generates prioritized recommended actions. Pure local computation, no network requests.",
    schema: {
      domain: z.string().describe("Primary target domain"),
      subdomains: z
        .array(z.string())
        .optional()
        .describe("Discovered subdomains"),
      ips: z
        .array(z.string())
        .optional()
        .describe("Discovered IP addresses"),
      asns: z
        .array(z.string())
        .optional()
        .describe("Discovered ASN numbers"),
      wildcardZones: z
        .array(z.string())
        .optional()
        .describe("Zones with wildcard DNS"),
    },
    execute: (args) => enumScopeSummary(args),
  },
];
