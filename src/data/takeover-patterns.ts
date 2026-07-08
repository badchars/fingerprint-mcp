/**
 * Subdomain takeover detection patterns.
 *
 * When a DNS CNAME record points to a third-party service (e.g., Heroku,
 * GitHub Pages, S3) but the resource on that service has been deleted or never
 * provisioned, an attacker can register the same resource and serve arbitrary
 * content on the victim's subdomain.
 *
 * Each entry contains CNAME target regex patterns and response fingerprints
 * (body text, HTTP status, headers) that confirm the resource is unclaimed.
 *
 * References:
 *  - https://github.com/EdOverflow/can-i-take-over-xyz
 *  - https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/10-Test_for_Subdomain_Takeover
 */

/** A subdomain takeover detection entry for a specific hosting service. */
export interface TakeoverPattern {
  /** Name of the hosting / SaaS service */
  service: string;
  /** Regex patterns that match the CNAME target hostname */
  cnamePatterns: string[];
  /** Response fingerprints that confirm the resource is unclaimed */
  fingerprints: {
    /** Body content patterns (regex) indicating an unclaimed resource */
    body?: string[];
    /** Expected HTTP status code for unclaimed resources */
    status?: number;
    /** Header patterns (name → regex) on the error response */
    headers?: Record<string, string>;
  };
  /** Risk severity — high means trivially exploitable with no auth */
  severity: "high" | "medium" | "low";
  /** Reference URL for takeover documentation / proof-of-concept */
  documentation?: string;
}

export const TAKEOVER_PATTERNS: TakeoverPattern[] = [
  // ──────────────────────────────────────────────────
  // PaaS / Hosting
  // ──────────────────────────────────────────────────
  {
    service: "Heroku",
    cnamePatterns: ["\\.herokuapp\\.com$", "\\.herokussl\\.com$"],
    fingerprints: {
      body: ["No such app", "no-hierarchical-app-detected"],
      status: 404,
      headers: { server: "^heroku-router$" },
    },
    severity: "high",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#heroku",
  },
  {
    service: "GitHub Pages",
    cnamePatterns: ["\\.github\\.io$"],
    fingerprints: {
      body: [
        "There isn't a GitHub Pages site here",
        "For root URLs \\(like http://example\\.com/\\) you must provide an index\\.html file",
      ],
      status: 404,
    },
    severity: "high",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#github-pages",
  },
  {
    service: "AWS S3",
    cnamePatterns: [
      "\\.s3\\.amazonaws\\.com$",
      "\\.s3-website[-.].+\\.amazonaws\\.com$",
      "\\.s3\\..+\\.amazonaws\\.com$",
    ],
    fingerprints: {
      body: ["NoSuchBucket", "The specified bucket does not exist"],
      status: 404,
    },
    severity: "high",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#aws-s3",
  },
  {
    service: "Microsoft Azure",
    cnamePatterns: [
      "\\.azurewebsites\\.net$",
      "\\.cloudapp\\.azure\\.com$",
      "\\.azure-api\\.net$",
      "\\.azurefd\\.net$",
      "\\.trafficmanager\\.net$",
    ],
    fingerprints: {
      body: ["404 Web Site not found", "Web App - Pair Not Found"],
      status: 404,
    },
    severity: "high",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#azure",
  },
  {
    service: "Shopify",
    cnamePatterns: ["shops\\.myshopify\\.com$"],
    fingerprints: {
      body: [
        "Sorry, this shop is currently unavailable",
        "Only one step left!",
      ],
      status: 404,
    },
    severity: "high",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#shopify",
  },
  {
    service: "Fastly",
    cnamePatterns: ["\\.fastly\\.net$", "\\.fastlylb\\.net$"],
    fingerprints: {
      body: ["Fastly error: unknown domain"],
      status: 500,
    },
    severity: "high",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#fastly",
  },
  {
    service: "Ghost",
    cnamePatterns: ["\\.ghost\\.io$"],
    fingerprints: {
      body: ["The thing you were looking for is no longer here"],
      status: 404,
    },
    severity: "medium",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#ghost",
  },
  {
    service: "Pantheon",
    cnamePatterns: ["\\.pantheonsite\\.io$", "\\.pantheon\\.io$"],
    fingerprints: {
      body: [
        "404 error unknown site",
        "The gods are wise, but do not know of the site",
      ],
      status: 404,
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#pantheon",
  },
  {
    service: "Tumblr",
    cnamePatterns: ["\\.tumblr\\.com$", "domains\\.tumblr\\.com$"],
    fingerprints: {
      body: [
        "There's nothing here",
        "Whatever you were looking for doesn't currently exist",
      ],
      status: 404,
    },
    severity: "medium",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#tumblr",
  },
  {
    service: "Zendesk",
    cnamePatterns: ["\\.zendesk\\.com$"],
    fingerprints: {
      body: ["Help Center Closed", "This help center no longer exists"],
      status: 404,
      headers: { "x-zendesk-request-id": "." },
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#zendesk",
  },

  // ──────────────────────────────────────────────────
  // Static Hosting / Portfolios
  // ──────────────────────────────────────────────────
  {
    service: "Cargo Collective",
    cnamePatterns: ["\\.cargocollective\\.com$"],
    fingerprints: {
      body: ["404 Not Found"],
      status: 404,
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#cargo",
  },
  {
    service: "StatusPage (Atlassian)",
    cnamePatterns: ["\\.statuspage\\.io$"],
    fingerprints: {
      body: ["Status page launch  is imminent", "You are being redirected"],
      status: 302,
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#statuspage",
  },
  {
    service: "Surge.sh",
    cnamePatterns: ["\\.surge\\.sh$"],
    fingerprints: {
      body: ["project not found"],
      status: 404,
    },
    severity: "high",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#surge",
  },
  {
    service: "Fly.io",
    cnamePatterns: ["\\.fly\\.dev$"],
    fingerprints: {
      body: ["Could not find the app", "404 Not Found"],
      status: 404,
    },
    severity: "medium",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#fly",
  },
  {
    service: "Netlify",
    cnamePatterns: ["\\.netlify\\.app$", "\\.netlify\\.com$"],
    fingerprints: {
      body: ["Not Found - Request ID"],
      status: 404,
    },
    severity: "high",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#netlify",
  },
  {
    service: "Vercel",
    cnamePatterns: ["cname\\.vercel-dns\\.com$", "\\.vercel\\.app$"],
    fingerprints: {
      body: ["The deployment could not be found", "DEPLOYMENT_NOT_FOUND"],
      status: 404,
      headers: { server: "^Vercel$" },
    },
    severity: "high",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#vercel",
  },
  {
    service: "ReadMe",
    cnamePatterns: ["\\.readme\\.io$"],
    fingerprints: {
      body: ["Project doesnt exist"],
      status: 404,
    },
    severity: "medium",
    documentation: "https://github.com/EdOverflow/can-i-take-over-xyz#readme",
  },
  {
    service: "GitBook",
    cnamePatterns: ["\\.gitbook\\.io$"],
    fingerprints: {
      body: ["If you need specifics"],
      status: 404,
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#gitbook",
  },
  {
    service: "WordPress.com",
    cnamePatterns: ["\\.wordpress\\.com$"],
    fingerprints: {
      body: ["Do you want to register"],
      status: 404,
    },
    severity: "low",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#wordpress",
  },
  {
    service: "Unbounce",
    cnamePatterns: ["\\.unbouncepages\\.com$"],
    fingerprints: {
      body: ["The requested URL was not found on this server"],
      status: 404,
    },
    severity: "medium",
    documentation:
      "https://github.com/EdOverflow/can-i-take-over-xyz#unbounce",
  },
];
