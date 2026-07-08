// analytics-patterns.ts — Analytics and tracking code detection patterns
// Identifies analytics services, tag managers, advertising pixels, and heatmap tools
// embedded in HTML/JavaScript responses. Supports tracking ID extraction for cross-domain correlation.

export interface AnalyticsPattern {
  /** Service name */
  name: string;
  /** Functional category */
  category: "analytics" | "tag-manager" | "advertising" | "heatmap" | "ab-testing" | "error-tracking";
  /** Detection patterns across different embedding methods */
  patterns: {
    /** Regex patterns to match <script src="..."> attributes */
    script?: string[];
    /** Regex patterns to match inline JavaScript code */
    inline?: string[];
    /** Global variable names set on `window` */
    global?: string[];
  };
  /** Regex to extract the tracking / account ID (first capture group) */
  idExtract?: string;
  /** Whether the extracted ID can link to the same owner across different domains */
  crossRefValue: boolean;
}

export const ANALYTICS_PATTERNS: AnalyticsPattern[] = [
  // ── Google Analytics (Universal Analytics — UA) ────────────────────────
  {
    name: "Google Analytics (Universal)",
    category: "analytics",
    patterns: {
      script: [
        "google-analytics\\.com\\/analytics\\.js",
        "google-analytics\\.com\\/ga\\.js",
      ],
      inline: [
        "ga\\s*\\(\\s*['\"]create['\"]\\s*,\\s*['\"]UA-",
        "ga\\s*\\(\\s*['\"]send['\"]\\s*,\\s*['\"]pageview['\"]\\s*\\)",
        "_gaq\\.push\\(",
      ],
      global: ["ga", "_gaq", "GoogleAnalyticsObject"],
    },
    idExtract: "(UA-\\d{4,10}-\\d{1,4})",
    crossRefValue: true,
  },

  // ── Google Analytics 4 (GA4) ───────────────────────────────────────────
  {
    name: "Google Analytics 4",
    category: "analytics",
    patterns: {
      script: [
        "googletagmanager\\.com\\/gtag\\/js\\?id=G-",
        "google-analytics\\.com\\/g\\/collect",
      ],
      inline: [
        "gtag\\s*\\(\\s*['\"]config['\"]\\s*,\\s*['\"]G-",
        "gtag\\s*\\(\\s*['\"]event['\"]",
      ],
      global: ["gtag", "dataLayer"],
    },
    idExtract: "(G-[A-Z0-9]{4,15})",
    crossRefValue: true,
  },

  // ── Google Tag Manager ─────────────────────────────────────────────────
  {
    name: "Google Tag Manager",
    category: "tag-manager",
    patterns: {
      script: [
        "googletagmanager\\.com\\/gtm\\.js\\?id=GTM-",
      ],
      inline: [
        "GTM-[A-Z0-9]{4,10}",
        "google_tag_manager",
        "\\(function\\s*\\(w,d,s,l,i\\)\\{",
      ],
      global: ["google_tag_manager", "dataLayer"],
    },
    idExtract: "(GTM-[A-Z0-9]{4,10})",
    crossRefValue: true,
  },

  // ── Google AdSense ─────────────────────────────────────────────────────
  {
    name: "Google AdSense",
    category: "advertising",
    patterns: {
      script: [
        "pagead2\\.googlesyndication\\.com\\/pagead\\/js\\/adsbygoogle\\.js",
      ],
      inline: [
        "adsbygoogle",
        'data-ad-client\\s*=\\s*["\']ca-pub-',
        "ca-pub-\\d{10,16}",
      ],
      global: ["adsbygoogle"],
    },
    idExtract: "(ca-pub-\\d{10,16})",
    crossRefValue: true,
  },

  // ── Facebook Pixel (Meta Pixel) ────────────────────────────────────────
  {
    name: "Facebook Pixel",
    category: "advertising",
    patterns: {
      script: [
        "connect\\.facebook\\.net\\/[a-z_]+\\/fbevents\\.js",
      ],
      inline: [
        "fbq\\s*\\(\\s*['\"]init['\"]\\s*,\\s*['\"]\\d+['\"]",
        "fbq\\s*\\(\\s*['\"]track['\"]",
        "_fbq",
      ],
      global: ["fbq", "_fbq"],
    },
    idExtract: "fbq\\s*\\(\\s*['\"]init['\"]\\s*,\\s*['\"]?(\\d{10,20})",
    crossRefValue: true,
  },

  // ── Hotjar ─────────────────────────────────────────────────────────────
  {
    name: "Hotjar",
    category: "heatmap",
    patterns: {
      script: [
        "static\\.hotjar\\.com\\/c\\/hotjar-",
      ],
      inline: [
        "hj\\s*\\(\\s*['\"]init['\"]",
        "hotjar\\.com",
        "hjSiteSettings",
      ],
      global: ["hj", "hjSiteSettings"],
    },
    idExtract: "hjid\\s*:\\s*(\\d+)|hotjar-(\\d+)",
    crossRefValue: true,
  },

  // ── Segment ────────────────────────────────────────────────────────────
  {
    name: "Segment",
    category: "analytics",
    patterns: {
      script: [
        "cdn\\.segment\\.com\\/analytics\\.js",
        "cdn\\.segment\\.io\\/",
      ],
      inline: [
        "analytics\\.load\\s*\\(",
        "analytics\\.identify\\s*\\(",
        "analytics\\.track\\s*\\(",
        "analytics\\.page\\s*\\(",
      ],
      global: ["analytics"],
    },
    idExtract: "analytics\\.load\\s*\\(\\s*['\"]([A-Za-z0-9]+)['\"]",
    crossRefValue: true,
  },

  // ── Mixpanel ───────────────────────────────────────────────────────────
  {
    name: "Mixpanel",
    category: "analytics",
    patterns: {
      script: [
        "cdn\\.mxpnl\\.com\\/libs\\/",
        "cdn4?\\.mxpnl\\.com",
      ],
      inline: [
        "mixpanel\\.init\\s*\\(",
        "mixpanel\\.track\\s*\\(",
        "mixpanel\\.identify\\s*\\(",
      ],
      global: ["mixpanel"],
    },
    idExtract: "mixpanel\\.init\\s*\\(\\s*['\"]([a-f0-9]{32})['\"]",
    crossRefValue: true,
  },

  // ── Amplitude ──────────────────────────────────────────────────────────
  {
    name: "Amplitude",
    category: "analytics",
    patterns: {
      script: [
        "cdn\\.amplitude\\.com\\/libs\\/",
        "cdn\\.amplitude\\.com\\/script\\/",
      ],
      inline: [
        "amplitude\\.getInstance\\s*\\(",
        "amplitude\\.init\\s*\\(",
        "amplitude\\.logEvent\\s*\\(",
      ],
      global: ["amplitude"],
    },
    idExtract: "amplitude\\.init\\s*\\(\\s*['\"]([a-f0-9]{32})['\"]",
    crossRefValue: true,
  },

  // ── PostHog ────────────────────────────────────────────────────────────
  {
    name: "PostHog",
    category: "analytics",
    patterns: {
      script: [
        "app\\.posthog\\.com\\/static\\/array\\.js",
        "us\\.posthog\\.com\\/static\\/array\\.js",
        "eu\\.posthog\\.com\\/static\\/array\\.js",
      ],
      inline: [
        "posthog\\.init\\s*\\(",
        "posthog\\.capture\\s*\\(",
        "posthog\\.identify\\s*\\(",
      ],
      global: ["posthog"],
    },
    idExtract: "posthog\\.init\\s*\\(\\s*['\"]([a-zA-Z0-9_-]+)['\"]",
    crossRefValue: true,
  },

  // ── Plausible ──────────────────────────────────────────────────────────
  {
    name: "Plausible",
    category: "analytics",
    patterns: {
      script: [
        "plausible\\.io\\/js\\/script\\.js",
        "plausible\\.io\\/js\\/plausible\\.js",
      ],
      inline: [
        "data-domain\\s*=.*plausible",
      ],
      global: ["plausible"],
    },
    idExtract: 'data-domain\\s*=\\s*["\']([^"\']+)["\']',
    crossRefValue: false,
  },

  // ── Matomo / Piwik ─────────────────────────────────────────────────────
  {
    name: "Matomo",
    category: "analytics",
    patterns: {
      script: [
        "matomo\\.js",
        "piwik\\.js",
        "matomo\\.php",
        "piwik\\.php",
      ],
      inline: [
        "_paq\\.push\\s*\\(",
        "Matomo\\.getTracker\\s*\\(",
        "Piwik\\.getTracker\\s*\\(",
      ],
      global: ["_paq", "Matomo", "Piwik"],
    },
    idExtract: "setSiteId['\",\\s]+(\\d+)",
    crossRefValue: false,
  },

  // ── Heap ───────────────────────────────────────────────────────────────
  {
    name: "Heap",
    category: "analytics",
    patterns: {
      script: [
        "cdn\\.heapanalytics\\.com\\/js\\/heap-",
        "heapanalytics\\.com",
      ],
      inline: [
        "heap\\.load\\s*\\(",
        "heap\\.track\\s*\\(",
        "heap\\.identify\\s*\\(",
      ],
      global: ["heap"],
    },
    idExtract: "heap\\.load\\s*\\(\\s*['\"]?(\\d{8,12})",
    crossRefValue: true,
  },

  // ── FullStory ──────────────────────────────────────────────────────────
  {
    name: "FullStory",
    category: "heatmap",
    patterns: {
      script: [
        "fullstory\\.com\\/s\\/fs\\.js",
        "edge\\.fullstory\\.com",
      ],
      inline: [
        "_fs_host",
        "_fs_org",
        "FS\\.identify\\s*\\(",
        "FS\\.setUserVars\\s*\\(",
      ],
      global: ["FS", "_fs_host", "_fs_org"],
    },
    idExtract: "_fs_org\\s*[=:]\\s*['\"]([A-Z0-9]+)['\"]",
    crossRefValue: true,
  },

  // ── Microsoft Clarity ──────────────────────────────────────────────────
  {
    name: "Microsoft Clarity",
    category: "heatmap",
    patterns: {
      script: [
        "clarity\\.ms\\/tag\\/",
      ],
      inline: [
        "clarity\\s*\\(\\s*['\"]set['\"]",
        'function\\s*\\(c,l,a,r,i,t,y\\)',
      ],
      global: ["clarity"],
    },
    idExtract: "clarity\\.ms\\/tag\\/([a-z0-9]+)",
    crossRefValue: true,
  },

  // ── Criteo ─────────────────────────────────────────────────────────────
  {
    name: "Criteo",
    category: "advertising",
    patterns: {
      script: [
        "static\\.criteo\\.net\\/js\\/",
        "dynamic\\.criteo\\.com",
      ],
      inline: [
        "criteo_q\\.push\\s*\\(",
        "window\\.criteo_q",
      ],
      global: ["criteo_q"],
    },
    idExtract: "['\"]account['\"]\\s*:\\s*(\\d+)",
    crossRefValue: true,
  },

  // ── Amazon Associates ──────────────────────────────────────────────────
  {
    name: "Amazon Associates",
    category: "advertising",
    patterns: {
      script: [
        "amazon-adsystem\\.com",
        "assoc-amazon\\.com",
        "ws-na\\.amazon-adsystem\\.com",
      ],
      inline: [
        "amzn_assoc_",
        "amazon_ad_tag",
      ],
      global: ["amzn_assoc_ad_type", "amzn_assoc_tracking_id"],
    },
    idExtract: "amzn_assoc_tracking_id\\s*=\\s*['\"]([^'\"]+)['\"]",
    crossRefValue: true,
  },

  // ── Pinterest Tag ──────────────────────────────────────────────────────
  {
    name: "Pinterest Tag",
    category: "advertising",
    patterns: {
      script: [
        "s\\.pinimg\\.com\\/ct\\/",
        "ct\\.pinterest\\.com",
      ],
      inline: [
        "pintrk\\s*\\(\\s*['\"]load['\"]",
        "pintrk\\s*\\(\\s*['\"]page['\"]",
      ],
      global: ["pintrk"],
    },
    idExtract: "pintrk\\s*\\(\\s*['\"]load['\"]\\s*,\\s*['\"]?(\\d+)",
    crossRefValue: true,
  },

  // ── Twitter / X Pixel ──────────────────────────────────────────────────
  {
    name: "Twitter Pixel",
    category: "advertising",
    patterns: {
      script: [
        "static\\.ads-twitter\\.com\\/uwt\\.js",
        "platform\\.twitter\\.com\\/oct\\.js",
      ],
      inline: [
        "twq\\s*\\(\\s*['\"]init['\"]",
        "twq\\s*\\(\\s*['\"]track['\"]",
      ],
      global: ["twq"],
    },
    idExtract: "twq\\s*\\(\\s*['\"]init['\"]\\s*,\\s*['\"]([a-z0-9]+)['\"]",
    crossRefValue: true,
  },

  // ── LinkedIn Insight Tag ───────────────────────────────────────────────
  {
    name: "LinkedIn Insight Tag",
    category: "advertising",
    patterns: {
      script: [
        "snap\\.licdn\\.com\\/li\\.lms-analytics\\/insight\\.min\\.js",
      ],
      inline: [
        "_linkedin_partner_id\\s*=",
        "_linkedin_data_partner_ids\\.push\\s*\\(",
      ],
      global: ["_linkedin_partner_id", "_linkedin_data_partner_ids"],
    },
    idExtract: "_linkedin_partner_id\\s*=\\s*['\"]?(\\d+)",
    crossRefValue: true,
  },

  // ── TikTok Pixel ───────────────────────────────────────────────────────
  {
    name: "TikTok Pixel",
    category: "advertising",
    patterns: {
      script: [
        "analytics\\.tiktok\\.com\\/i18n\\/pixel\\/",
      ],
      inline: [
        "ttq\\.load\\s*\\(",
        "ttq\\.track\\s*\\(",
        "ttq\\.page\\s*\\(",
      ],
      global: ["ttq", "TiktokAnalyticsObject"],
    },
    idExtract: "ttq\\.load\\s*\\(\\s*['\"]([A-Z0-9]+)['\"]",
    crossRefValue: true,
  },

  // ── Snap Pixel (Snapchat) ──────────────────────────────────────────────
  {
    name: "Snap Pixel",
    category: "advertising",
    patterns: {
      script: [
        "sc-static\\.net\\/scevent\\.min\\.js",
      ],
      inline: [
        "snaptr\\s*\\(\\s*['\"]init['\"]",
        "snaptr\\s*\\(\\s*['\"]track['\"]",
      ],
      global: ["snaptr"],
    },
    idExtract: "snaptr\\s*\\(\\s*['\"]init['\"]\\s*,\\s*['\"]([a-f0-9-]+)['\"]",
    crossRefValue: true,
  },

  // ── Sentry (Error Tracking) ────────────────────────────────────────────
  {
    name: "Sentry",
    category: "error-tracking",
    patterns: {
      script: [
        "browser\\.sentry-cdn\\.com\\/",
        "js\\.sentry-cdn\\.com\\/",
      ],
      inline: [
        "Sentry\\.init\\s*\\(",
        "dsn\\s*:\\s*['\"]https:\\/\\/[a-f0-9]+@[a-z0-9.]+\\.ingest\\.sentry\\.io",
      ],
      global: ["Sentry", "__SENTRY__"],
    },
    idExtract: "dsn\\s*:\\s*['\"]https:\\/\\/([a-f0-9]+)@",
    crossRefValue: false,
  },

  // ── Optimizely ─────────────────────────────────────────────────────────
  {
    name: "Optimizely",
    category: "ab-testing",
    patterns: {
      script: [
        "cdn\\.optimizely\\.com\\/js\\/",
        "cdn\\.optimizely\\.com\\/public\\/",
      ],
      inline: [
        "optimizely\\.push\\s*\\(",
        "window\\.optimizely",
        "window\\[\"optimizely\"\\]",
      ],
      global: ["optimizely", "optimizelyEdge"],
    },
    idExtract: "cdn\\.optimizely\\.com\\/js\\/(\\d+)\\.js",
    crossRefValue: true,
  },
];
