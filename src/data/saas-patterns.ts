/**
 * DNS TXT record patterns that reveal SaaS and third-party service usage.
 *
 * Organizations add TXT records to prove domain ownership or configure email
 * delivery. These records inadvertently disclose which SaaS products an
 * organization subscribes to — useful for attack surface mapping, phishing
 * pretexts, and supply-chain risk assessment.
 *
 * Each pattern is a regex string matched against the full TXT record value.
 */

/** A SaaS/service detection pattern derived from DNS TXT records. */
export interface SaasPattern {
  /** Regex string to match against the TXT record value */
  pattern: string;
  /** Human-readable name of the detected service */
  name: string;
  /** Functional category of the service */
  category:
    | "verification"
    | "email"
    | "marketing"
    | "security"
    | "productivity"
    | "development";
  /** Brief description of what the TXT record indicates */
  description: string;
}

export const SAAS_PATTERNS: SaasPattern[] = [
  // ──────────────────────────────────────────────────
  // Domain Verification Records
  // ──────────────────────────────────────────────────
  {
    pattern: "^google-site-verification=",
    name: "Google Search Console",
    category: "verification",
    description:
      "Domain verified with Google Search Console; indicates SEO tooling or Google Workspace setup.",
  },
  {
    pattern: "^MS=ms\\d+",
    name: "Microsoft 365",
    category: "productivity",
    description:
      "Domain verified with Microsoft 365 / Azure AD tenant; organization likely uses Exchange Online, Teams, and SharePoint.",
  },
  {
    pattern: "^facebook-domain-verification=",
    name: "Facebook Business",
    category: "marketing",
    description:
      "Domain verified with Meta Business Suite; organization runs Facebook/Instagram advertising.",
  },
  {
    pattern: "^atlassian-domain-verification=",
    name: "Atlassian (Jira/Confluence)",
    category: "productivity",
    description:
      "Domain verified with Atlassian Cloud; organization uses Jira, Confluence, or Bitbucket.",
  },
  {
    pattern: "^stripe-verification=",
    name: "Stripe",
    category: "verification",
    description:
      "Domain verified with Stripe; organization processes payments through Stripe.",
  },
  {
    pattern: "^docusign=",
    name: "DocuSign",
    category: "productivity",
    description:
      "Domain verified with DocuSign; organization uses electronic signature workflows.",
  },
  {
    pattern: "^apple-domain-verification=",
    name: "Apple",
    category: "verification",
    description:
      "Domain verified with Apple; may indicate Apple Business Manager, Pay, or developer program enrollment.",
  },
  {
    pattern: "^hubspot-developer-verification=",
    name: "HubSpot",
    category: "marketing",
    description:
      "Domain verified with HubSpot; organization uses HubSpot CRM, marketing automation, or CMS.",
  },
  {
    pattern: "^zoom-domain-verification=",
    name: "Zoom",
    category: "productivity",
    description:
      "Domain verified with Zoom; organization manages Zoom accounts at the domain level.",
  },
  {
    pattern: "^_github-challenge-",
    name: "GitHub Pages",
    category: "development",
    description:
      "GitHub organization/user challenge for custom domain on GitHub Pages.",
  },
  {
    pattern: "^logmein-verification-code=",
    name: "LogMeIn / GoTo",
    category: "productivity",
    description:
      "Domain verified with LogMeIn (GoTo suite); organization uses GoToMeeting, GoToWebinar, or remote access products.",
  },
  {
    pattern: "^pardot_",
    name: "Pardot (Salesforce Marketing)",
    category: "marketing",
    description:
      "Pardot domain key for Salesforce Marketing Cloud; indicates B2B marketing automation.",
  },
  {
    pattern: "^dynatrace-site-verification=",
    name: "Dynatrace",
    category: "security",
    description:
      "Domain verified with Dynatrace; organization uses application performance monitoring.",
  },
  {
    pattern: "^adobe-sign-verification=",
    name: "Adobe Sign",
    category: "productivity",
    description:
      "Domain verified with Adobe Sign (Acrobat Sign); organization uses Adobe electronic signatures.",
  },

  // ──────────────────────────────────────────────────
  // Email Infrastructure (SPF includes)
  // ──────────────────────────────────────────────────
  {
    pattern: "v=spf1.*include:sendgrid\\.net",
    name: "SendGrid (Twilio)",
    category: "email",
    description:
      "SPF record includes SendGrid; organization sends transactional or marketing email via SendGrid.",
  },
  {
    pattern: "v=spf1.*include:amazonses\\.com",
    name: "Amazon SES",
    category: "email",
    description:
      "SPF record includes Amazon SES; organization sends email through AWS Simple Email Service.",
  },
  {
    pattern: "v=spf1.*include:mailgun\\.org",
    name: "Mailgun",
    category: "email",
    description:
      "SPF record includes Mailgun; organization uses Mailgun for transactional email delivery.",
  },
  {
    pattern: "^v=DMARC1",
    name: "DMARC Policy",
    category: "security",
    description:
      "DMARC record present (queried at _dmarc subdomain); defines email authentication and reporting policy.",
  },
  {
    pattern: "^postmark-verification=",
    name: "Postmark",
    category: "email",
    description:
      "Domain verified with Postmark (ActiveCampaign); organization uses Postmark for transactional email.",
  },
  {
    pattern: "^mandrill-domain-verification=",
    name: "Mandrill (Mailchimp)",
    category: "email",
    description:
      "Domain verified with Mandrill; organization uses Mailchimp's transactional email API.",
  },
];
