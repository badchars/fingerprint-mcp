// smtp-signatures.ts — SMTP banner and EHLO extension patterns for mail server fingerprinting
// Used to identify mail transfer agents, hosted email providers, and relay services.

export interface SmtpSignature {
  /** Mail server / provider name */
  name: string;
  /** Regex strings to match against the SMTP 220 banner */
  bannerPatterns: string[];
  /** EHLO extensions commonly advertised by this server */
  ehloExtensions?: string[];
  /** Classification of the mail server */
  category: "provider" | "mta" | "relay";
}

export const SMTP_SIGNATURES: SmtpSignature[] = [
  // ── Postfix ────────────────────────────────────────────────────────────
  {
    name: "Postfix",
    bannerPatterns: [
      "220\\s+.*\\s+ESMTP\\s+Postfix",
      "220\\s+.*Postfix\\s*\\(",
      "220\\s+.*ESMTP\\s+Postfix\\s+\\(.*?\\)",
    ],
    ehloExtensions: [
      "PIPELINING",
      "SIZE",
      "VRFY",
      "ETRN",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "8BITMIME",
      "DSN",
      "SMTPUTF8",
      "CHUNKING",
    ],
    category: "mta",
  },

  // ── Sendmail ───────────────────────────────────────────────────────────
  {
    name: "Sendmail",
    bannerPatterns: [
      "220\\s+.*Sendmail\\s+[\\d.]+\\/",
      "220\\s+.*ESMTP\\s+Sendmail",
      "220\\s+.*Sendmail\\s+ready",
    ],
    ehloExtensions: [
      "ENHANCEDSTATUSCODES",
      "PIPELINING",
      "8BITMIME",
      "SIZE",
      "DSN",
      "ETRN",
      "STARTTLS",
      "DELIVERBY",
    ],
    category: "mta",
  },

  // ── Exim ───────────────────────────────────────────────────────────────
  {
    name: "Exim",
    bannerPatterns: [
      "220\\s+.*ESMTP\\s+Exim\\s+[\\d.]+",
      "220\\s+.*Exim\\s+[\\d.]+\\s+.*ready",
      "220-.*Exim",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "PIPELINING",
      "STARTTLS",
      "PRDR",
      "CHUNKING",
    ],
    category: "mta",
  },

  // ── Microsoft Exchange ─────────────────────────────────────────────────
  {
    name: "Microsoft Exchange",
    bannerPatterns: [
      "220\\s+.*Microsoft\\s+ESMTP\\s+MAIL\\s+Service",
      "220\\s+.*Microsoft\\s+Exchange",
      "220\\s+.*Exchange\\s+Server",
      "220\\s+.*Microsoft\\s+SMTP",
    ],
    ehloExtensions: [
      "SIZE",
      "PIPELINING",
      "DSN",
      "ENHANCEDSTATUSCODES",
      "STARTTLS",
      "8BITMIME",
      "BINARYMIME",
      "CHUNKING",
      "XEXCH50",
      "XRDST",
      "X-EXPS",
      "X-ANONYMOUSTLS",
    ],
    category: "mta",
  },

  // ── Gmail / Google ─────────────────────────────────────────────────────
  {
    name: "Gmail",
    bannerPatterns: [
      "220\\s+mx\\.google\\.com\\s+ESMTP",
      "220\\s+smtp\\.gmail\\.com\\s+ESMTP",
      "220\\s+smtp\\.google\\.com\\s+ESMTP",
      "220\\s+.*\\.google\\.com\\s+ESMTP\\s+[a-z0-9]+\\.[0-9]+\\s*-\\s*gsmtp",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "PIPELINING",
      "CHUNKING",
      "SMTPUTF8",
    ],
    category: "provider",
  },

  // ── Yahoo Mail ─────────────────────────────────────────────────────────
  {
    name: "Yahoo Mail",
    bannerPatterns: [
      "220\\s+mta.*\\.am0\\.yahoodns\\.net\\s+ESMTP",
      "220\\s+.*\\.yahoo\\.com\\s+ESMTP",
      "220\\s+.*Yahoo\\s+ESMTP",
      "220\\s+smtp\\.mail\\.yahoo\\.com",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "PIPELINING",
      "STARTTLS",
    ],
    category: "provider",
  },

  // ── ProtonMail ─────────────────────────────────────────────────────────
  {
    name: "ProtonMail",
    bannerPatterns: [
      "220\\s+mail\\.protonmail\\.ch\\s+ESMTP",
      "220\\s+.*\\.protonmail\\.ch\\s+ESMTP",
      "220\\s+.*Proton Mail",
      "220\\s+mail\\.proton\\.me\\s+ESMTP",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "CHUNKING",
    ],
    category: "provider",
  },

  // ── Amazon SES ─────────────────────────────────────────────────────────
  {
    name: "Amazon SES",
    bannerPatterns: [
      "220\\s+email-smtp\\..*\\.amazonaws\\.com\\s+ESMTP",
      "220\\s+.*\\.smtp\\.amazonaws\\.com",
      "220\\s+.*Amazon\\s+SES",
      "220\\s+inbound-smtp\\..*\\.amazonaws\\.com",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "PIPELINING",
    ],
    category: "relay",
  },

  // ── Outlook.com / Office 365 ───────────────────────────────────────────
  {
    name: "Outlook.com",
    bannerPatterns: [
      "220\\s+.*\\.mail\\.protection\\.outlook\\.com\\s+Microsoft\\s+ESMTP",
      "220\\s+.*\\.outlook\\.com\\s+ESMTP",
      "220\\s+.*\\.hotmail\\.com\\s+",
      "220\\s+.*\\.olc\\.protection\\.outlook\\.com",
    ],
    ehloExtensions: [
      "SIZE",
      "PIPELINING",
      "DSN",
      "ENHANCEDSTATUSCODES",
      "STARTTLS",
      "8BITMIME",
      "BINARYMIME",
      "CHUNKING",
      "SMTPUTF8",
    ],
    category: "provider",
  },

  // ── Zimbra ─────────────────────────────────────────────────────────────
  {
    name: "Zimbra",
    bannerPatterns: [
      "220\\s+.*Zimbra\\s+ESMTP",
      "220\\s+.*ESMTP\\s+Zimbra",
      "220\\s+.*Zimbra\\s+[\\d.]+",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "PIPELINING",
      "CHUNKING",
      "AUTH LOGIN PLAIN",
    ],
    category: "mta",
  },

  // ── hMailServer ────────────────────────────────────────────────────────
  {
    name: "hMailServer",
    bannerPatterns: [
      "220\\s+.*hMailServer\\s+[\\d.]+",
      "220\\s+.*ESMTP\\s+hMailServer",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "AUTH LOGIN PLAIN",
    ],
    category: "mta",
  },

  // ── Dovecot LMTP ───────────────────────────────────────────────────────
  {
    name: "Dovecot",
    bannerPatterns: [
      "220\\s+.*Dovecot\\s+ready",
      "220\\s+.*Dovecot\\s+LMTP",
      "220\\s+.*LMTP\\s+Dovecot",
    ],
    ehloExtensions: [
      "8BITMIME",
      "ENHANCEDSTATUSCODES",
      "PIPELINING",
      "CHUNKING",
      "STARTTLS",
    ],
    category: "mta",
  },

  // ── OpenSMTPD ──────────────────────────────────────────────────────────
  {
    name: "OpenSMTPD",
    bannerPatterns: [
      "220\\s+.*ESMTP\\s+OpenSMTPD",
      "220\\s+.*OpenSMTPD",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "ENHANCEDSTATUSCODES",
      "STARTTLS",
      "DSN",
      "AUTH PLAIN LOGIN",
    ],
    category: "mta",
  },

  // ── Haraka ─────────────────────────────────────────────────────────────
  {
    name: "Haraka",
    bannerPatterns: [
      "220\\s+.*ESMTP\\s+Haraka\\s+[\\d.]+",
      "220\\s+.*Haraka\\s+ready",
    ],
    ehloExtensions: [
      "PIPELINING",
      "8BITMIME",
      "SIZE",
      "STARTTLS",
    ],
    category: "mta",
  },

  // ── MailEnable ─────────────────────────────────────────────────────────
  {
    name: "MailEnable",
    bannerPatterns: [
      "220\\s+.*MailEnable",
      "220\\s+.*ESMTP\\s+MailEnable",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "AUTH LOGIN",
    ],
    category: "mta",
  },

  // ── Mailcow (Dockerized) ──────────────────────────────────────────────
  {
    name: "Mailcow",
    bannerPatterns: [
      "220\\s+.*ESMTP\\s+Postfix\\s+\\(Mailcow\\)",
      "220\\s+.*mailcow",
    ],
    ehloExtensions: [
      "PIPELINING",
      "SIZE",
      "ETRN",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "8BITMIME",
      "DSN",
      "CHUNKING",
    ],
    category: "mta",
  },

  // ── SendGrid ───────────────────────────────────────────────────────────
  {
    name: "SendGrid",
    bannerPatterns: [
      "220\\s+.*\\.sendgrid\\.net\\s+ESMTP",
      "220\\s+.*SendGrid",
      "220\\s+smtp\\.sendgrid\\.net",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "PIPELINING",
      "AUTH PLAIN LOGIN",
    ],
    category: "relay",
  },

  // ── Mailgun ────────────────────────────────────────────────────────────
  {
    name: "Mailgun",
    bannerPatterns: [
      "220\\s+.*\\.mailgun\\.org\\s+ESMTP",
      "220\\s+smtp\\.mailgun\\.org",
      "220\\s+.*Mailgun\\s+Influx",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "AUTH PLAIN LOGIN",
    ],
    category: "relay",
  },

  // ── Fastmail ───────────────────────────────────────────────────────────
  {
    name: "Fastmail",
    bannerPatterns: [
      "220\\s+.*\\.messagingengine\\.com\\s+ESMTP",
      "220\\s+.*\\.fastmail\\.com\\s+ESMTP",
    ],
    ehloExtensions: [
      "SIZE",
      "8BITMIME",
      "STARTTLS",
      "ENHANCEDSTATUSCODES",
      "PIPELINING",
    ],
    category: "provider",
  },
];
