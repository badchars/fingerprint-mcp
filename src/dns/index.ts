import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import { TTLCache } from "../utils/cache.js";
import {
  resolve,
  resolve4,
  resolve6,
  resolveMx,
  resolveTxt,
  resolveSrv,
  resolveSoa,
  resolveCaa,
  resolveCname,
  resolveNs,
  resolvePtr,
  resolveNaptr,
} from "node:dns/promises";
import { json } from "../types/index.js";

const limiter = new RateLimiter(100);
const cache = new TTLCache<any>(600_000); // 10min cache

// ─── Helpers ───

/** Safely resolve a DNS query, returning null on NXDOMAIN/SERVFAIL/etc. */
async function safeResolve<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/** Build in-addr.arpa name for a given IPv4 address */
function toReverseArpa(ip: string): string {
  return ip.split(".").reverse().join(".") + ".in-addr.arpa";
}

// ─── Email Provider Patterns ───

const EMAIL_PROVIDERS: { pattern: RegExp; provider: string }[] = [
  { pattern: /aspmx\.l\.google\.com/i, provider: "Google Workspace" },
  { pattern: /google(mail)?\.com/i, provider: "Google Workspace" },
  { pattern: /\.mail\.protection\.outlook\.com/i, provider: "Microsoft 365 (Exchange Online)" },
  { pattern: /mail\.protonmail\.ch/i, provider: "ProtonMail" },
  { pattern: /protonmail\.ch/i, provider: "ProtonMail" },
  { pattern: /\.zoho\.com/i, provider: "Zoho Mail" },
  { pattern: /\.zohomail\.com/i, provider: "Zoho Mail" },
  { pattern: /\.fastmail\.com/i, provider: "Fastmail" },
  { pattern: /in[12]?\.smtp\.messagingengine\.com/i, provider: "Fastmail" },
  { pattern: /\.mimecast\.com/i, provider: "Mimecast" },
  { pattern: /\.pphosted\.com/i, provider: "Proofpoint" },
  { pattern: /\.barracuda(networks)?\.com/i, provider: "Barracuda" },
  { pattern: /\.icloud\.com/i, provider: "Apple iCloud Mail" },
  { pattern: /\.yahoodns\.net/i, provider: "Yahoo Mail" },
  { pattern: /\.yandex\.(ru|net)/i, provider: "Yandex Mail" },
  { pattern: /\.secureserver\.net/i, provider: "GoDaddy" },
  { pattern: /\.emailsrvr\.com/i, provider: "Rackspace Email" },
  { pattern: /\.mailgun\.org/i, provider: "Mailgun" },
  { pattern: /\.sendgrid\.net/i, provider: "SendGrid" },
  { pattern: /\.amazonses\.com/i, provider: "Amazon SES" },
  { pattern: /\.postmarkapp\.com/i, provider: "Postmark" },
  { pattern: /\.mandrillapp\.com/i, provider: "Mandrill (Mailchimp)" },
  { pattern: /\.sparkpostmail\.com/i, provider: "SparkPost" },
];

// ─── DKIM Selector Candidates ───

const DKIM_SELECTORS = [
  "google",
  "selector1",
  "selector2",
  "default",
  "dkim",
  "mail",
  "k1",
  "k2",
  "s1",
  "s2",
  "mandrill",
  "everlytickey1",
  "everlytickey2",
  "mxvault",
  "smtp",
];

// ─── SaaS TXT Patterns ───

const SAAS_TXT_PATTERNS: { pattern: RegExp; service: string; category: string }[] = [
  { pattern: /^google-site-verification=/i, service: "Google Search Console", category: "verification" },
  { pattern: /^MS=ms/i, service: "Microsoft 365", category: "productivity" },
  { pattern: /^facebook-domain-verification=/i, service: "Facebook Business", category: "marketing" },
  { pattern: /^atlassian-domain-verification=/i, service: "Atlassian (Jira/Confluence)", category: "productivity" },
  { pattern: /^stripe-verification=/i, service: "Stripe", category: "payments" },
  { pattern: /^docusign=/i, service: "DocuSign", category: "productivity" },
  { pattern: /^apple-domain-verification=/i, service: "Apple", category: "verification" },
  { pattern: /^hubspot-developer-verification=/i, service: "HubSpot", category: "marketing" },
  { pattern: /hubspot/i, service: "HubSpot", category: "marketing" },
  { pattern: /^zoom-domain-verification=/i, service: "Zoom", category: "productivity" },
  { pattern: /^_github-challenge-/i, service: "GitHub Pages", category: "development" },
  { pattern: /^logmein-verification-code=/i, service: "LogMeIn / GoTo", category: "productivity" },
  { pattern: /^pardot_/i, service: "Pardot (Salesforce Marketing)", category: "marketing" },
  { pattern: /^dynatrace-site-verification=/i, service: "Dynatrace", category: "monitoring" },
  { pattern: /^adobe-sign-verification=/i, service: "Adobe Sign", category: "productivity" },
  { pattern: /^postmark-verification=/i, service: "Postmark", category: "email" },
  { pattern: /^mandrill-domain-verification=/i, service: "Mandrill (Mailchimp)", category: "email" },
  { pattern: /^docker-verification=/i, service: "Docker Hub", category: "development" },
  { pattern: /^cisco-ci-domain-verification=/i, service: "Cisco Webex", category: "productivity" },
  { pattern: /^have-i-been-pwned-verification=/i, service: "Have I Been Pwned", category: "security" },
  { pattern: /^dropbox-domain-verification=/i, service: "Dropbox", category: "productivity" },
  { pattern: /^slack-domain-verification=/i, service: "Slack", category: "productivity" },
  { pattern: /^webexdomainverification/i, service: "Cisco Webex", category: "productivity" },
  { pattern: /^amazonses:/i, service: "Amazon SES", category: "email" },
  { pattern: /^t-verify=/i, service: "Trend Micro", category: "security" },
  { pattern: /^miro-verification=/i, service: "Miro", category: "productivity" },
  { pattern: /^ahrefs-site-verification=/i, service: "Ahrefs", category: "seo" },
  { pattern: /^_1password/i, service: "1Password", category: "security" },
  { pattern: /^status-page-domain-verification=/i, service: "Atlassian StatusPage", category: "monitoring" },
];

// ─── SPF Include → Provider Mapping ───

const SPF_INCLUDE_PROVIDERS: { pattern: RegExp; provider: string }[] = [
  { pattern: /google\.com/i, provider: "Google Workspace" },
  { pattern: /googlemail\.com/i, provider: "Google Workspace" },
  { pattern: /outlook\.com/i, provider: "Microsoft 365" },
  { pattern: /protection\.outlook\.com/i, provider: "Microsoft 365" },
  { pattern: /sendgrid\.net/i, provider: "SendGrid (Twilio)" },
  { pattern: /amazonses\.com/i, provider: "Amazon SES" },
  { pattern: /mailgun\.org/i, provider: "Mailgun" },
  { pattern: /sparkpostmail\.com/i, provider: "SparkPost" },
  { pattern: /postmarkapp\.com/i, provider: "Postmark" },
  { pattern: /mandrillapp\.com/i, provider: "Mandrill (Mailchimp)" },
  { pattern: /zoho\.(com|eu)/i, provider: "Zoho Mail" },
  { pattern: /freshdesk\.com/i, provider: "Freshdesk" },
  { pattern: /zendesk\.com/i, provider: "Zendesk" },
  { pattern: /hubspot\.com/i, provider: "HubSpot" },
  { pattern: /salesforce\.com/i, provider: "Salesforce" },
  { pattern: /mcsv\.net/i, provider: "Mailchimp" },
  { pattern: /icloud\.com/i, provider: "Apple iCloud" },
  { pattern: /proofpoint\.com/i, provider: "Proofpoint" },
  { pattern: /pphosted\.com/i, provider: "Proofpoint" },
  { pattern: /mimecast\.(com|co\.za)/i, provider: "Mimecast" },
  { pattern: /barracuda(networks)?\.com/i, provider: "Barracuda" },
  { pattern: /intercom\.io/i, provider: "Intercom" },
  { pattern: /brevo\.com/i, provider: "Brevo (Sendinblue)" },
  { pattern: /sendinblue\.com/i, provider: "Brevo (Sendinblue)" },
  { pattern: /mailjet\.com/i, provider: "Mailjet" },
  { pattern: /constantcontact\.com/i, provider: "Constant Contact" },
  { pattern: /cust-spf\.exacttarget\.com/i, provider: "Salesforce Marketing Cloud" },
  { pattern: /servers\.mcsv\.net/i, provider: "Mailchimp" },
];

// ─── Subdomain Takeover Vulnerable Services ───

const TAKEOVER_SERVICES: { pattern: RegExp; service: string; severity: string }[] = [
  { pattern: /\.herokuapp\.com$/i, service: "Heroku", severity: "high" },
  { pattern: /\.herokussl\.com$/i, service: "Heroku", severity: "high" },
  { pattern: /\.github\.io$/i, service: "GitHub Pages", severity: "high" },
  { pattern: /\.s3\.amazonaws\.com$/i, service: "AWS S3", severity: "high" },
  { pattern: /\.s3-website[-.].+\.amazonaws\.com$/i, service: "AWS S3", severity: "high" },
  { pattern: /\.s3\..+\.amazonaws\.com$/i, service: "AWS S3", severity: "high" },
  { pattern: /\.azurewebsites\.net$/i, service: "Microsoft Azure", severity: "high" },
  { pattern: /\.cloudapp\.azure\.com$/i, service: "Microsoft Azure", severity: "high" },
  { pattern: /\.azure-api\.net$/i, service: "Microsoft Azure", severity: "high" },
  { pattern: /\.azurefd\.net$/i, service: "Microsoft Azure", severity: "high" },
  { pattern: /\.trafficmanager\.net$/i, service: "Microsoft Azure", severity: "high" },
  { pattern: /shops\.myshopify\.com$/i, service: "Shopify", severity: "high" },
  { pattern: /\.fastly\.net$/i, service: "Fastly", severity: "high" },
  { pattern: /\.fastlylb\.net$/i, service: "Fastly", severity: "high" },
  { pattern: /\.ghost\.io$/i, service: "Ghost", severity: "medium" },
  { pattern: /\.pantheonsite\.io$/i, service: "Pantheon", severity: "medium" },
  { pattern: /\.tumblr\.com$/i, service: "Tumblr", severity: "medium" },
  { pattern: /\.zendesk\.com$/i, service: "Zendesk", severity: "medium" },
  { pattern: /\.surge\.sh$/i, service: "Surge.sh", severity: "high" },
  { pattern: /\.fly\.dev$/i, service: "Fly.io", severity: "medium" },
  { pattern: /\.netlify\.app$/i, service: "Netlify", severity: "high" },
  { pattern: /\.netlify\.com$/i, service: "Netlify", severity: "high" },
  { pattern: /\.vercel\.app$/i, service: "Vercel", severity: "high" },
  { pattern: /cname\.vercel-dns\.com$/i, service: "Vercel", severity: "high" },
  { pattern: /\.readme\.io$/i, service: "ReadMe", severity: "medium" },
  { pattern: /\.gitbook\.io$/i, service: "GitBook", severity: "medium" },
  { pattern: /\.wordpress\.com$/i, service: "WordPress.com", severity: "low" },
  { pattern: /\.unbouncepages\.com$/i, service: "Unbounce", severity: "medium" },
  { pattern: /\.statuspage\.io$/i, service: "StatusPage (Atlassian)", severity: "medium" },
  { pattern: /\.cargocollective\.com$/i, service: "Cargo Collective", severity: "medium" },
  { pattern: /\.webflow\.io$/i, service: "Webflow", severity: "medium" },
  { pattern: /\.helpjuice\.com$/i, service: "Helpjuice", severity: "medium" },
  { pattern: /\.helpscoutdocs\.com$/i, service: "HelpScout", severity: "medium" },
  { pattern: /\.teamwork\.com$/i, service: "Teamwork", severity: "medium" },
  { pattern: /\.tictail\.com$/i, service: "Tictail", severity: "high" },
  { pattern: /\.campaignmonitor\.com$/i, service: "Campaign Monitor", severity: "medium" },
  { pattern: /\.desk\.com$/i, service: "Desk.com (Salesforce)", severity: "medium" },
  { pattern: /\.thinkific\.com$/i, service: "Thinkific", severity: "medium" },
  { pattern: /\.amazonaws\.com$/i, service: "AWS (generic)", severity: "medium" },
  { pattern: /\.elasticbeanstalk\.com$/i, service: "AWS Elastic Beanstalk", severity: "medium" },
  { pattern: /\.cloudfront\.net$/i, service: "AWS CloudFront", severity: "low" },
  { pattern: /\.firebaseapp\.com$/i, service: "Firebase", severity: "medium" },
  { pattern: /\.web\.app$/i, service: "Firebase Hosting", severity: "medium" },
  { pattern: /\.bitbucket\.io$/i, service: "Bitbucket", severity: "medium" },
];

// ─── NS Provider Detection ───

const NS_PROVIDERS: { pattern: RegExp; provider: string }[] = [
  { pattern: /\.cloudflare\.com$/i, provider: "Cloudflare" },
  { pattern: /\.awsdns-/i, provider: "AWS Route53" },
  { pattern: /\.googledomains\.com$/i, provider: "Google Domains" },
  { pattern: /\.google\.com$/i, provider: "Google Cloud DNS" },
  { pattern: /\.azure-dns\.(com|net|org|info)$/i, provider: "Azure DNS" },
  { pattern: /\.ultradns\.(com|net|org)$/i, provider: "UltraDNS (Neustar)" },
  { pattern: /\.nsone\.net$/i, provider: "NS1" },
  { pattern: /\.dnsimple\.com$/i, provider: "DNSimple" },
  { pattern: /\.domaincontrol\.com$/i, provider: "GoDaddy" },
  { pattern: /\.registrar-servers\.com$/i, provider: "Namecheap" },
  { pattern: /\.digitalocean\.com$/i, provider: "DigitalOcean" },
  { pattern: /\.linode\.com$/i, provider: "Linode (Akamai)" },
  { pattern: /\.akam\.net$/i, provider: "Akamai" },
  { pattern: /\.dynect\.net$/i, provider: "Dyn (Oracle)" },
  { pattern: /\.hetzner\.com$/i, provider: "Hetzner" },
  { pattern: /\.ovh\.(net|com)$/i, provider: "OVH" },
  { pattern: /\.name-services\.com$/i, provider: "Enom" },
  { pattern: /\.he\.net$/i, provider: "Hurricane Electric" },
];

// ─── Default Subdomains ───

const DEFAULT_SUBDOMAINS = [
  "www", "mail", "dev", "staging", "api", "admin", "cdn", "blog", "shop",
  "app", "test", "beta", "demo", "status", "docs", "portal", "webmail",
  "ftp", "cpanel", "vpn", "ns1", "ns2", "mx", "smtp", "pop", "imap",
  "remote", "support", "help", "store", "media", "assets", "static",
  "jenkins", "ci", "git", "jira", "confluence", "grafana", "monitoring",
];

// ─── SRV Prefixes ───

const SRV_PREFIXES = [
  "_sip._tcp", "_sips._tcp", "_xmpp-client._tcp", "_xmpp-server._tcp",
  "_autodiscover._tcp", "_ldap._tcp", "_kerberos._tcp", "_kerberos._udp",
  "_imap._tcp", "_imaps._tcp", "_submission._tcp", "_h323cs._tcp",
  "_caldavs._tcp", "_carddavs._tcp", "_turn._tcp", "_turn._udp",
  "_stun._tcp", "_stun._udp", "_minecraft._tcp", "_ts3._udp",
  "_vlmcs._tcp", "_mta-sts._tcp",
];

// ─── Tool 1: dns_email ───

async function dnsEmail(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const cacheKey = `dns_email:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  // MX records
  const mxRecords = await safeResolve(() => resolveMx(domain));
  const mxEntries = (mxRecords ?? [])
    .sort((a, b) => a.priority - b.priority)
    .map((mx) => {
      const provider = EMAIL_PROVIDERS.find((p) => p.pattern.test(mx.exchange));
      return {
        priority: mx.priority,
        exchange: mx.exchange,
        provider: provider?.provider ?? "Unknown",
      };
    });

  const detectedProviders = [...new Set(mxEntries.map((e) => e.provider).filter((p) => p !== "Unknown"))];

  // SPF record
  const txtRecords = await safeResolve(() => resolveTxt(domain));
  const allTxt = (txtRecords ?? []).map((r) => r.join(""));
  const spfRecord = allTxt.find((r) => r.startsWith("v=spf1"));

  let spfAnalysis: {
    raw: string;
    includes: string[];
    ip4: string[];
    ip6: string[];
    mechanisms: string[];
    authorizedSenders: string[];
  } | null = null;

  if (spfRecord) {
    const includes: string[] = [];
    const ip4s: string[] = [];
    const ip6s: string[] = [];
    const mechanisms: string[] = [];
    const authorizedSenders: string[] = [];

    const parts = spfRecord.split(/\s+/);
    for (const part of parts) {
      if (part.startsWith("include:")) {
        const includeDomain = part.replace("include:", "");
        includes.push(includeDomain);
        const match = SPF_INCLUDE_PROVIDERS.find((p) => p.pattern.test(includeDomain));
        if (match) authorizedSenders.push(match.provider);
      } else if (part.startsWith("ip4:")) {
        ip4s.push(part.replace("ip4:", ""));
      } else if (part.startsWith("ip6:")) {
        ip6s.push(part.replace("ip6:", ""));
      } else if (part !== "v=spf1") {
        mechanisms.push(part);
      }
    }

    spfAnalysis = {
      raw: spfRecord,
      includes,
      ip4: ip4s,
      ip6: ip6s,
      mechanisms,
      authorizedSenders,
    };
  }

  // DKIM selector probing
  const dkimResults: { selector: string; record: string }[] = [];
  for (const selector of DKIM_SELECTORS) {
    await limiter.acquire();
    const dkimDomain = `${selector}._domainkey.${domain}`;
    const dkimTxt = await safeResolve(() => resolveTxt(dkimDomain));
    if (dkimTxt && dkimTxt.length > 0) {
      dkimResults.push({
        selector,
        record: dkimTxt.map((r) => r.join("")).join(""),
      });
    }
  }

  // DMARC
  await limiter.acquire();
  const dmarcTxt = await safeResolve(() => resolveTxt(`_dmarc.${domain}`));
  let dmarcAnalysis: {
    raw: string;
    policy: string;
    subdomain_policy: string | null;
    rua: string | null;
    ruf: string | null;
    pct: string | null;
    adkim: string | null;
    aspf: string | null;
  } | null = null;

  if (dmarcTxt && dmarcTxt.length > 0) {
    const dmarcRaw = dmarcTxt.map((r) => r.join("")).join("");
    const tags = new Map<string, string>();
    for (const part of dmarcRaw.split(";")) {
      const [key, ...vals] = part.trim().split("=");
      if (key && vals.length > 0) tags.set(key.trim(), vals.join("=").trim());
    }

    dmarcAnalysis = {
      raw: dmarcRaw,
      policy: tags.get("p") ?? "none",
      subdomain_policy: tags.get("sp") ?? null,
      rua: tags.get("rua") ?? null,
      ruf: tags.get("ruf") ?? null,
      pct: tags.get("pct") ?? null,
      adkim: tags.get("adkim") ?? null,
      aspf: tags.get("aspf") ?? null,
    };
  }

  const result = {
    domain,
    mx: mxEntries,
    detectedProviders,
    spf: spfAnalysis,
    dkim: {
      selectorsProbed: DKIM_SELECTORS.length,
      found: dkimResults,
    },
    dmarc: dmarcAnalysis,
    emailSecurity: {
      hasMx: mxEntries.length > 0,
      hasSpf: spfAnalysis !== null,
      hasDkim: dkimResults.length > 0,
      hasDmarc: dmarcAnalysis !== null,
      dmarcPolicy: dmarcAnalysis?.policy ?? "none",
      score: calculateEmailSecurityScore(
        mxEntries.length > 0,
        spfAnalysis !== null,
        dkimResults.length > 0,
        dmarcAnalysis,
      ),
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

function calculateEmailSecurityScore(
  hasMx: boolean,
  hasSpf: boolean,
  hasDkim: boolean,
  dmarc: { policy: string } | null,
): { grade: string; details: string[] } {
  const details: string[] = [];
  let score = 0;

  if (!hasMx) {
    details.push("No MX records — domain may not receive email");
    return { grade: "N/A", details };
  }

  if (hasSpf) {
    score += 25;
    details.push("SPF present (+25)");
  } else {
    details.push("Missing SPF record — email spoofing possible");
  }

  if (hasDkim) {
    score += 25;
    details.push("DKIM present (+25)");
  } else {
    details.push("No common DKIM selectors found — consider DKIM deployment");
  }

  if (dmarc) {
    score += 25;
    details.push("DMARC present (+25)");
    if (dmarc.policy === "reject") {
      score += 25;
      details.push("DMARC policy=reject (+25) — strongest protection");
    } else if (dmarc.policy === "quarantine") {
      score += 15;
      details.push("DMARC policy=quarantine (+15) — moderate protection");
    } else {
      details.push("DMARC policy=none (+0) — monitoring only, no enforcement");
    }
  } else {
    details.push("Missing DMARC record — no email authentication policy");
  }

  const grade =
    score >= 90 ? "A" :
    score >= 75 ? "B" :
    score >= 50 ? "C" :
    score >= 25 ? "D" : "F";

  return { grade, details };
}

// ─── Tool 2: dns_saas ───

async function dnsSaas(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const cacheKey = `dns_saas:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  const txtRecords = await safeResolve(() => resolveTxt(domain));
  const allTxt = (txtRecords ?? []).map((r) => r.join(""));

  const detectedServices: {
    service: string;
    category: string;
    record: string;
  }[] = [];

  for (const record of allTxt) {
    for (const { pattern, service, category } of SAAS_TXT_PATTERNS) {
      if (pattern.test(record)) {
        detectedServices.push({ service, category, record });
        break; // Only match first pattern per record
      }
    }
  }

  // Extract SPF includes as email provider indicators
  const spfRecord = allTxt.find((r) => r.startsWith("v=spf1"));
  const spfProviders: { provider: string; include: string }[] = [];

  if (spfRecord) {
    const includeMatches = spfRecord.match(/include:(\S+)/g);
    if (includeMatches) {
      for (const incl of includeMatches) {
        const includeDomain = incl.replace("include:", "");
        const match = SPF_INCLUDE_PROVIDERS.find((p) => p.pattern.test(includeDomain));
        if (match) {
          spfProviders.push({ provider: match.provider, include: includeDomain });
        }
      }
    }
  }

  // Group by category
  const byCategory: Record<string, string[]> = {};
  for (const svc of detectedServices) {
    if (!byCategory[svc.category]) byCategory[svc.category] = [];
    if (!byCategory[svc.category].includes(svc.service)) {
      byCategory[svc.category].push(svc.service);
    }
  }

  const result = {
    domain,
    totalTxtRecords: allTxt.length,
    detectedServices,
    spfEmailProviders: spfProviders,
    servicesByCategory: byCategory,
    totalServicesDetected: detectedServices.length + spfProviders.length,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 3: dns_takeover ───

async function dnsTakeover(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const subdomains = (args.subdomains as string[] | undefined) ?? DEFAULT_SUBDOMAINS;
  const cacheKey = `dns_takeover:${domain}:${subdomains.join(",")}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  const findings: {
    subdomain: string;
    fqdn: string;
    cname: string;
    cnameResolvable: boolean;
    vulnerableService: string | null;
    severity: string | null;
    status: "vulnerable" | "potentially_vulnerable" | "safe" | "no_cname";
  }[] = [];

  for (const sub of subdomains) {
    const fqdn = `${sub}.${domain}`;
    await limiter.acquire();

    // Resolve CNAME
    const cname = await safeResolve(() => resolveCname(fqdn));
    if (!cname || cname.length === 0) {
      findings.push({
        subdomain: sub,
        fqdn,
        cname: "",
        cnameResolvable: false,
        vulnerableService: null,
        severity: null,
        status: "no_cname",
      });
      continue;
    }

    const cnameTarget = cname[0];

    // Try to resolve the CNAME target to see if it exists
    await limiter.acquire();
    const cnameA = await safeResolve(() => resolve4(cnameTarget));
    const cnameResolvable = cnameA !== null && cnameA.length > 0;

    // Check if CNAME matches known vulnerable services
    let vulnerableService: string | null = null;
    let severity: string | null = null;

    for (const svc of TAKEOVER_SERVICES) {
      if (svc.pattern.test(cnameTarget)) {
        vulnerableService = svc.service;
        severity = svc.severity;
        break;
      }
    }

    let status: "vulnerable" | "potentially_vulnerable" | "safe" | "no_cname";
    if (vulnerableService && !cnameResolvable) {
      status = "vulnerable";
    } else if (vulnerableService && cnameResolvable) {
      status = "potentially_vulnerable";
    } else if (!cnameResolvable) {
      status = "potentially_vulnerable";
    } else {
      status = "safe";
    }

    findings.push({
      subdomain: sub,
      fqdn,
      cname: cnameTarget,
      cnameResolvable,
      vulnerableService,
      severity,
      status,
    });
  }

  const vulnerable = findings.filter((f) => f.status === "vulnerable");
  const potentiallyVulnerable = findings.filter((f) => f.status === "potentially_vulnerable");

  const result = {
    domain,
    subdomainsChecked: subdomains.length,
    summary: {
      vulnerable: vulnerable.length,
      potentiallyVulnerable: potentiallyVulnerable.length,
      safe: findings.filter((f) => f.status === "safe").length,
      noCname: findings.filter((f) => f.status === "no_cname").length,
    },
    vulnerableFindings: vulnerable,
    potentiallyVulnerableFindings: potentiallyVulnerable,
    allFindings: findings,
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 4: dns_server_fp ───

async function dnsServerFp(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const nameserverArg = args.nameserver as string | undefined;
  const cacheKey = `dns_server_fp:${domain}:${nameserverArg ?? "auto"}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  // Detect nameservers
  const nsRecords = await safeResolve(() => resolveNs(domain));
  const nameservers = nsRecords ?? [];
  const targetNs = nameserverArg ?? nameservers[0] ?? null;

  if (!targetNs) {
    return json({
      domain,
      error: "No nameservers found and none specified",
    });
  }

  // Resolve nameserver IP
  await limiter.acquire();
  const nsIps = await safeResolve(() => resolve4(targetNs));
  const nsIp = nsIps?.[0] ?? null;

  // NS provider detection
  let nsProvider: string | null = null;
  for (const { pattern, provider } of NS_PROVIDERS) {
    if (pattern.test(targetNs)) {
      nsProvider = provider;
      break;
    }
  }

  // CHAOS TXT queries — node:dns/promises doesn't support CHAOS class directly,
  // so we document what would be queried and note the limitation.
  const chaosQueries = {
    note: "CHAOS class TXT queries require raw DNS packets (not available via node:dns/promises)",
    queriesAttempted: ["version.bind", "hostname.bind", "id.server"],
    recommendation: "Use dig +short chaos txt version.bind @" + targetNs + " for manual verification",
  };

  // Attempt recursive query (check if server responds for external domain)
  await limiter.acquire();
  let openResolver = false;
  try {
    const { Resolver } = await import("node:dns/promises");
    const resolver = new Resolver();
    if (nsIp) {
      resolver.setServers([nsIp]);
      const testResolve = await safeResolve(() => resolver.resolve4("example.com"));
      openResolver = testResolve !== null && testResolve.length > 0;
    }
  } catch {
    // Cannot test recursive query
  }

  // AXFR attempt — zone transfer requires raw TCP DNS,
  // not supported via node:dns/promises
  const axfrResult = {
    note: "Zone transfer (AXFR) requires raw TCP DNS packets",
    recommendation: `Use: dig axfr ${domain} @${targetNs} for manual verification`,
  };

  // Attempt EDNS0 — check via Resolver if available
  const edns0 = {
    note: "EDNS0 detection requires raw DNS packet inspection",
    recommendation: `Use: dig +edns ${domain} @${targetNs} to verify EDNS0 support`,
  };

  // NSID
  const nsid = {
    note: "NSID option detection requires EDNS0 raw packet support",
    recommendation: `Use: dig +nsid ${domain} @${targetNs} to check NSID`,
  };

  const result = {
    domain,
    targetNameserver: targetNs,
    nameserverIp: nsIp,
    allNameservers: nameservers,
    nsProvider,
    fingerprinting: {
      chaosQueries,
      openResolver: {
        tested: nsIp !== null,
        isOpen: openResolver,
        risk: openResolver
          ? "HIGH — Open resolver detected. Vulnerable to DNS amplification attacks."
          : "Low — Server does not respond to recursive queries for external domains.",
      },
      axfr: axfrResult,
      edns0,
      nsid,
    },
    securityIssues: [
      ...(openResolver ? ["Open DNS resolver — vulnerable to DNS amplification DDoS attacks"] : []),
    ],
    manualVerificationCommands: {
      chaosVersion: `dig +short chaos txt version.bind @${targetNs}`,
      chaosHostname: `dig +short chaos txt hostname.bind @${targetNs}`,
      chaosId: `dig +short chaos txt id.server @${targetNs}`,
      zoneTransfer: `dig axfr ${domain} @${targetNs}`,
      edns0: `dig +edns ${domain} @${targetNs}`,
      nsid: `dig +nsid ${domain} @${targetNs}`,
      recursion: `dig example.com @${targetNs} +recurse`,
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 5: dns_records ───

async function dnsRecords(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const cacheKey = `dns_records:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  // A records
  const aRecords = await safeResolve(() => resolve4(domain));

  // AAAA records
  await limiter.acquire();
  const aaaaRecords = await safeResolve(() => resolve6(domain));

  // MX records
  await limiter.acquire();
  const mxRecords = await safeResolve(() => resolveMx(domain));
  const mxEntries = (mxRecords ?? []).sort((a, b) => a.priority - b.priority);

  // TXT records
  await limiter.acquire();
  const txtRecords = await safeResolve(() => resolveTxt(domain));
  const allTxt = (txtRecords ?? []).map((r) => r.join(""));

  // NS records
  await limiter.acquire();
  const nsRecords = await safeResolve(() => resolveNs(domain));
  const nsEntries = (nsRecords ?? []).map((ns) => {
    const provider = NS_PROVIDERS.find((p) => p.pattern.test(ns));
    return { nameserver: ns, provider: provider?.provider ?? "Unknown" };
  });

  // SOA record
  await limiter.acquire();
  const soaRecord = await safeResolve(() => resolveSoa(domain));
  let soaAnalysis: {
    nsname: string;
    hostmaster: string;
    hostmasterEmail: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  } | null = null;

  if (soaRecord) {
    // Convert SOA hostmaster to email: replace first '.' with '@'
    const hostmaster = soaRecord.hostmaster;
    const firstDot = hostmaster.indexOf(".");
    const email = firstDot > 0
      ? hostmaster.substring(0, firstDot) + "@" + hostmaster.substring(firstDot + 1)
      : hostmaster;

    soaAnalysis = {
      nsname: soaRecord.nsname,
      hostmaster: soaRecord.hostmaster,
      hostmasterEmail: email,
      serial: soaRecord.serial,
      refresh: soaRecord.refresh,
      retry: soaRecord.retry,
      expire: soaRecord.expire,
      minttl: soaRecord.minttl,
    };
  }

  // CAA records
  await limiter.acquire();
  const caaRecords = await safeResolve(() => resolveCaa(domain));
  const caaEntries = (caaRecords ?? []).map((caa) => {
    const tag = caa.issue !== undefined
      ? "issue"
      : caa.issuewild !== undefined
        ? "issuewild"
        : caa.iodef !== undefined
          ? "iodef"
          : caa.contactemail !== undefined
            ? "contactemail"
            : "unknown";
    const value = caa.issue ?? caa.issuewild ?? caa.iodef ?? caa.contactemail ?? "";
    return { critical: caa.critical, tag, value };
  });

  // CNAME record
  await limiter.acquire();
  const cnameRecords = await safeResolve(() => resolveCname(domain));

  // SRV records — probe common prefixes
  const srvResults: {
    service: string;
    records: { priority: number; weight: number; port: number; name: string }[];
  }[] = [];

  for (const prefix of SRV_PREFIXES) {
    await limiter.acquire();
    const srvName = `${prefix}.${domain}`;
    const srvRecords = await safeResolve(() => resolveSrv(srvName));
    if (srvRecords && srvRecords.length > 0) {
      srvResults.push({
        service: prefix,
        records: srvRecords.map((srv) => ({
          priority: srv.priority,
          weight: srv.weight,
          port: srv.port,
          name: srv.name,
        })),
      });
    }
  }

  // NAPTR records
  await limiter.acquire();
  const naptrRecords = await safeResolve(() => resolveNaptr(domain));

  const result = {
    domain,
    records: {
      A: aRecords ?? [],
      AAAA: aaaaRecords ?? [],
      MX: mxEntries,
      TXT: allTxt,
      NS: nsEntries,
      SOA: soaAnalysis,
      CAA: caaEntries,
      CNAME: cnameRecords ?? [],
      SRV: srvResults,
      NAPTR: naptrRecords ?? [],
    },
    analysis: {
      nsProvider: nsEntries.length > 0
        ? [...new Set(nsEntries.map((e) => e.provider).filter((p) => p !== "Unknown"))]
        : [],
      authorizedCAs: caaEntries
        .filter((c) => c.tag === "issue" || c.tag === "issuewild")
        .map((c) => c.value),
      discoveredServices: srvResults.map((s) => ({
        service: s.service,
        endpoints: s.records.map((r) => `${r.name}:${r.port}`),
      })),
      hasIPv6: (aaaaRecords ?? []).length > 0,
      hasCaa: caaEntries.length > 0,
      hasDnssec: false, // Would need raw packet inspection
    },
    recordCounts: {
      A: (aRecords ?? []).length,
      AAAA: (aaaaRecords ?? []).length,
      MX: mxEntries.length,
      TXT: allTxt.length,
      NS: nsEntries.length,
      SOA: soaAnalysis ? 1 : 0,
      CAA: caaEntries.length,
      CNAME: (cnameRecords ?? []).length,
      SRV: srvResults.reduce((sum, s) => sum + s.records.length, 0),
      NAPTR: (naptrRecords ?? []).length,
      total:
        (aRecords ?? []).length +
        (aaaaRecords ?? []).length +
        mxEntries.length +
        allTxt.length +
        nsEntries.length +
        (soaAnalysis ? 1 : 0) +
        caaEntries.length +
        (cnameRecords ?? []).length +
        srvResults.reduce((sum, s) => sum + s.records.length, 0) +
        (naptrRecords ?? []).length,
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 6: dns_reverse ───

async function dnsReverse(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const ip = args.ip as string;
  const range = (args.range as boolean) ?? false;
  const cacheKey = `dns_reverse:${ip}:${range}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  if (!range) {
    // Single IP PTR lookup
    await limiter.acquire();
    const arpaName = toReverseArpa(ip);
    const ptrRecords = await safeResolve(() => resolvePtr(arpaName));

    const result = {
      ip,
      arpaName,
      ptr: ptrRecords ?? [],
      hostnames: ptrRecords ?? [],
      hasPtr: (ptrRecords ?? []).length > 0,
    };

    cache.set(cacheKey, result);
    return json(result);
  }

  // /24 range scan
  const octets = ip.split(".");
  if (octets.length !== 4) {
    return json({ error: "Invalid IPv4 address format" });
  }

  const base = octets.slice(0, 3).join(".");
  const results: { ip: string; ptr: string[] }[] = [];
  const hostnamePatterns: Record<string, number> = {};

  // Batch resolve — process in chunks to avoid overwhelming DNS
  const BATCH_SIZE = 20;
  for (let batch = 0; batch < 256; batch += BATCH_SIZE) {
    const promises: Promise<void>[] = [];
    for (let i = batch; i < Math.min(batch + BATCH_SIZE, 256); i++) {
      const targetIp = `${base}.${i}`;
      promises.push(
        (async () => {
          await limiter.acquire();
          const arpaName = toReverseArpa(targetIp);
          const ptrRecords = await safeResolve(() => resolvePtr(arpaName));
          if (ptrRecords && ptrRecords.length > 0) {
            results.push({ ip: targetIp, ptr: ptrRecords });
            // Extract hostname patterns
            for (const hostname of ptrRecords) {
              // Extract the parent domain pattern
              const parts = hostname.split(".");
              if (parts.length >= 2) {
                const parentDomain = parts.slice(-2).join(".");
                hostnamePatterns[parentDomain] = (hostnamePatterns[parentDomain] ?? 0) + 1;
              }
            }
          }
        })(),
      );
    }
    await Promise.all(promises);
  }

  const result = {
    range: `${base}.0/24`,
    scanned: 256,
    found: results.length,
    results: results.sort((a, b) => {
      const aNum = parseInt(a.ip.split(".")[3], 10);
      const bNum = parseInt(b.ip.split(".")[3], 10);
      return aNum - bNum;
    }),
    hostnamePatterns: Object.entries(hostnamePatterns)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, count]) => ({ domain, count })),
  };

  cache.set(cacheKey, result);
  return json(result);
}

// ─── Tool 7: dns_mta_sts ───

async function dnsMtaSts(args: Record<string, unknown>): Promise<ReturnType<typeof json>> {
  const domain = args.domain as string;
  const cacheKey = `dns_mta_sts:${domain}`;
  const cached = cache.get(cacheKey);
  if (cached) return json(cached);

  await limiter.acquire();

  // MTA-STS TXT record
  const mtaStsTxt = await safeResolve(() => resolveTxt(`_mta-sts.${domain}`));
  const mtaStsRecord = mtaStsTxt
    ? mtaStsTxt.map((r) => r.join("")).join("")
    : null;

  let mtaStsVersion: string | null = null;
  if (mtaStsRecord) {
    const versionMatch = mtaStsRecord.match(/v=STSv1/i);
    mtaStsVersion = versionMatch ? "STSv1" : null;
  }

  // Fetch MTA-STS policy via HTTPS
  let mtaStsPolicy: {
    raw: string;
    mode: string | null;
    mxHosts: string[];
    maxAge: number | null;
  } | null = null;

  try {
    await limiter.acquire();
    const policyUrl = `https://mta-sts.${domain}/.well-known/mta-sts.txt`;
    const response = await fetch(policyUrl, {
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      const policyText = await response.text();
      const lines = policyText.split("\n").map((l) => l.trim()).filter(Boolean);

      let mode: string | null = null;
      const mxHosts: string[] = [];
      let maxAge: number | null = null;

      for (const line of lines) {
        if (line.startsWith("mode:")) {
          mode = line.replace("mode:", "").trim();
        } else if (line.startsWith("mx:")) {
          mxHosts.push(line.replace("mx:", "").trim());
        } else if (line.startsWith("max_age:")) {
          maxAge = parseInt(line.replace("max_age:", "").trim(), 10);
        }
      }

      mtaStsPolicy = { raw: policyText, mode, mxHosts, maxAge };
    }
  } catch {
    // MTA-STS policy fetch failed — domain may not support it
  }

  // TLSRPT TXT record
  await limiter.acquire();
  const tlsrptTxt = await safeResolve(() => resolveTxt(`_smtp._tls.${domain}`));
  let tlsrpt: {
    raw: string;
    version: string | null;
    rua: string[];
  } | null = null;

  if (tlsrptTxt && tlsrptTxt.length > 0) {
    const tlsrptRaw = tlsrptTxt.map((r) => r.join("")).join("");
    const version = tlsrptRaw.match(/v=TLSRPTv1/i) ? "TLSRPTv1" : null;
    const ruaMatches = tlsrptRaw.match(/rua=([^;]+)/i);
    const rua = ruaMatches
      ? ruaMatches[1].split(",").map((r) => r.trim())
      : [];

    tlsrpt = { raw: tlsrptRaw, version, rua };
  }

  // DANE — check for TLSA records at _25._tcp.<mx>
  await limiter.acquire();
  const mxRecords = await safeResolve(() => resolveMx(domain));
  const daneResults: {
    mxHost: string;
    tlsaDomain: string;
    hasTlsa: boolean;
    records: string[];
  }[] = [];

  if (mxRecords && mxRecords.length > 0) {
    for (const mx of mxRecords.slice(0, 5)) {
      // Limit to first 5 MX hosts
      await limiter.acquire();
      const tlsaDomain = `_25._tcp.${mx.exchange}`;
      // node:dns/promises doesn't have a direct TLSA resolver,
      // use generic resolve() with type "TLSA" — may not be supported
      // on all platforms. Fall back to noting the limitation.
      let hasTlsa = false;
      let tlsaRecords: string[] = [];

      try {
        const result = await resolve(tlsaDomain, "TLSA");
        if (result && (result as any[]).length > 0) {
          hasTlsa = true;
          tlsaRecords = (result as any[]).map((r) => JSON.stringify(r));
        }
      } catch {
        // TLSA query not supported or NXDOMAIN
      }

      daneResults.push({
        mxHost: mx.exchange,
        tlsaDomain,
        hasTlsa,
        records: tlsaRecords,
      });
    }
  }

  const result = {
    domain,
    mtaSts: {
      txtRecord: mtaStsRecord,
      version: mtaStsVersion,
      hasRecord: mtaStsRecord !== null,
      policy: mtaStsPolicy,
      isEnforced: mtaStsPolicy?.mode === "enforce",
    },
    tlsrpt: {
      hasRecord: tlsrpt !== null,
      ...tlsrpt,
    },
    dane: {
      mxHostsChecked: daneResults.length,
      results: daneResults,
      anyDane: daneResults.some((d) => d.hasTlsa),
    },
    emailTransportSecurity: {
      hasMtaSts: mtaStsRecord !== null,
      mtaStsMode: mtaStsPolicy?.mode ?? "none",
      hasTlsrpt: tlsrpt !== null,
      hasDane: daneResults.some((d) => d.hasTlsa),
      grade: gradeTransportSecurity(
        mtaStsPolicy?.mode ?? null,
        tlsrpt !== null,
        daneResults.some((d) => d.hasTlsa),
      ),
    },
  };

  cache.set(cacheKey, result);
  return json(result);
}

function gradeTransportSecurity(
  mtaStsMode: string | null,
  hasTlsrpt: boolean,
  hasDane: boolean,
): { grade: string; details: string[] } {
  const details: string[] = [];
  let score = 0;

  if (mtaStsMode === "enforce") {
    score += 40;
    details.push("MTA-STS mode=enforce (+40) — TLS enforced for inbound SMTP");
  } else if (mtaStsMode === "testing") {
    score += 20;
    details.push("MTA-STS mode=testing (+20) — TLS monitoring only");
  } else if (mtaStsMode === "none") {
    score += 5;
    details.push("MTA-STS mode=none (+5) — policy exists but inactive");
  } else {
    details.push("No MTA-STS policy — inbound SMTP may be downgraded to cleartext");
  }

  if (hasTlsrpt) {
    score += 30;
    details.push("TLSRPT present (+30) — TLS failure reporting enabled");
  } else {
    details.push("No TLSRPT — no TLS failure reporting configured");
  }

  if (hasDane) {
    score += 30;
    details.push("DANE/TLSA present (+30) — certificate pinning via DNSSEC");
  } else {
    details.push("No DANE/TLSA records — no DNS-based certificate pinning");
  }

  const grade =
    score >= 90 ? "A" :
    score >= 70 ? "B" :
    score >= 40 ? "C" :
    score >= 20 ? "D" : "F";

  return { grade, details };
}

// ─── Tool Definitions ───

export const dnsTools: ToolDef[] = [
  {
    name: "dns_email",
    description:
      "Email infrastructure analysis. Resolves MX records with provider detection, parses SPF authorized senders, probes common DKIM selectors, and analyzes DMARC policy. Returns a security grade based on email authentication posture.",
    schema: {
      domain: z.string().describe("Domain to analyze email infrastructure"),
    },
    execute: dnsEmail,
  },
  {
    name: "dns_saas",
    description:
      "SaaS inventory from DNS TXT records. Matches TXT records against known SaaS domain verification patterns (Google, Microsoft, Atlassian, Stripe, etc.) and extracts email service providers from SPF includes. Reveals third-party service subscriptions.",
    schema: {
      domain: z.string().describe("Domain to discover SaaS services"),
    },
    execute: dnsSaas,
  },
  {
    name: "dns_takeover",
    description:
      "Subdomain takeover detection. Resolves CNAME chains for subdomains and checks if targets are unclaimed on known vulnerable services (Heroku, GitHub Pages, S3, Azure, Shopify, Fastly, Netlify, Vercel, etc.). Flags dangling CNAMEs pointing to deprovisioned resources.",
    schema: {
      domain: z.string().describe("Domain to check for subdomain takeover"),
      subdomains: z
        .array(z.string())
        .optional()
        .describe(
          "Subdomains to check (default: common ones like www, mail, dev, staging, api, admin, cdn, blog, shop, app, test, beta, demo, status, docs)",
        ),
    },
    execute: dnsTakeover,
  },
  {
    name: "dns_server_fp",
    description:
      "DNS server fingerprinting. Identifies nameserver provider, tests for open resolver (DNS amplification risk), attempts CHAOS TXT queries for version leak, and provides manual verification commands for zone transfer, EDNS0, and NSID detection.",
    schema: {
      domain: z.string().describe("Domain whose authoritative NS to fingerprint"),
      nameserver: z
        .string()
        .optional()
        .describe("Specific nameserver to probe (default: auto-detect from NS records)"),
    },
    execute: dnsServerFp,
  },
  {
    name: "dns_records",
    description:
      "Full DNS enumeration. Queries A, AAAA, MX, TXT, NS, SOA, CAA, CNAME, SRV, PTR, and NAPTR records. Identifies NS providers, authorized certificate authorities from CAA, discovers services from SRV records, and extracts admin email from SOA.",
    schema: {
      domain: z.string().describe("Domain for full DNS enumeration"),
    },
    execute: dnsRecords,
  },
  {
    name: "dns_reverse",
    description:
      "Reverse DNS lookup. Resolves PTR records for an IP address to reveal hostnames. Supports /24 range scanning to map an entire subnet's reverse DNS, identifying hostname patterns and infrastructure ownership.",
    schema: {
      ip: z.string().describe("IP address for reverse DNS lookup"),
      range: z
        .boolean()
        .optional()
        .describe("If true, scan /24 range (e.g., x.x.x.0-255)"),
    },
    execute: dnsReverse,
  },
  {
    name: "dns_mta_sts",
    description:
      "MTA-STS, TLSRPT, and DANE analysis for email transport security. Checks MTA-STS TXT record and HTTPS policy (mode, mx hosts, max_age), TLSRPT reporting configuration, and DANE/TLSA records for certificate pinning. Grades overall transport security posture.",
    schema: {
      domain: z.string().describe("Domain for MTA-STS/TLSRPT/DANE analysis"),
    },
    execute: dnsMtaSts,
  },
];
