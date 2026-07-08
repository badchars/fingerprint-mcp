/**
 * Network service banner patterns for protocol-level fingerprinting.
 *
 * Many network services announce themselves with distinctive banners upon connection.
 * By matching these banners against known patterns we can identify the service software,
 * extract version numbers, and infer OS/platform information without active scanning.
 *
 * Additional lookup tables map protocol-specific identifiers (SMB dialects, NTLM
 * challenge versions, MySQL auth plugins) to OS and software versions.
 *
 * References:
 *  - Nmap service detection probes (nmap-service-probes)
 *  - https://svn.nmap.org/nmap/nmap-service-probes
 *  - MySQL protocol documentation
 *  - MS-SMB2 specification
 */

/** A known service banner pattern entry. */
export interface ServiceBanner {
  /** The network service / protocol name */
  service: string;
  /** Regex string to match against the raw banner bytes (as UTF-8 string) */
  pattern: string;
  /** Human-readable name for the identified software */
  name: string;
  /** Description of how to extract the version from the regex capture groups */
  version_extract?: string;
}

export const SERVICE_BANNERS: ServiceBanner[] = [
  // ──────────────────────────────────────────────────
  // MySQL / MariaDB
  // ──────────────────────────────────────────────────
  {
    service: "mysql",
    pattern: "^.\\x00\\x00\\x00\\x0a(5\\.\\d+\\.\\d+[\\w.-]*)",
    name: "MySQL 5.x",
    version_extract: "Capture group 1 contains the full version string (e.g. 5.7.42-log)",
  },
  {
    service: "mysql",
    pattern: "^.\\x00\\x00\\x00\\x0a(8\\.\\d+\\.\\d+[\\w.-]*)",
    name: "MySQL 8.x",
    version_extract: "Capture group 1 contains the full version string (e.g. 8.0.35)",
  },
  {
    service: "mysql",
    pattern: "^.\\x00\\x00\\x00\\x0a(\\d+\\.\\d+\\.\\d+-MariaDB[\\w.-]*)",
    name: "MariaDB",
    version_extract: "Capture group 1 contains the full version string (e.g. 10.11.6-MariaDB)",
  },
  {
    service: "mysql",
    pattern: "^.\\x00\\x00\\x00\\x0a.*Percona",
    name: "Percona Server",
    version_extract: "Version follows the Percona keyword in the greeting packet",
  },

  // ──────────────────────────────────────────────────
  // PostgreSQL
  // ──────────────────────────────────────────────────
  {
    service: "postgresql",
    pattern: "server_version\\x00(\\d+\\.\\d+(?:\\.\\d+)?)",
    name: "PostgreSQL",
    version_extract: "Capture group 1 from the ParameterStatus 'server_version' message",
  },
  {
    service: "postgresql",
    pattern: "server_encoding\\x00(\\w+)",
    name: "PostgreSQL (encoding)",
    version_extract: "Capture group 1 contains the server encoding (e.g. UTF8, SQL_ASCII)",
  },

  // ──────────────────────────────────────────────────
  // Redis
  // ──────────────────────────────────────────────────
  {
    service: "redis",
    pattern: "redis_version:(\\d+\\.\\d+\\.\\d+)",
    name: "Redis",
    version_extract: "Capture group 1 from INFO server output (e.g. 7.2.4)",
  },
  {
    service: "redis",
    pattern: "^-NOAUTH Authentication required",
    name: "Redis (auth required)",
  },
  {
    service: "redis",
    pattern: "^-DENIED Redis is running in protected mode",
    name: "Redis (protected mode)",
  },

  // ──────────────────────────────────────────────────
  // SSH
  // ──────────────────────────────────────────────────
  {
    service: "ssh",
    pattern: "^SSH-(\\d+\\.\\d+)-OpenSSH_(\\d+\\.\\d+(?:p\\d+)?)",
    name: "OpenSSH",
    version_extract: "Group 1 = SSH protocol version, Group 2 = OpenSSH version (e.g. 9.6p1)",
  },
  {
    service: "ssh",
    pattern: "^SSH-(\\d+\\.\\d+)-dropbear_(\\d+\\.\\d+)",
    name: "Dropbear SSH",
    version_extract: "Group 1 = SSH protocol version, Group 2 = Dropbear version",
  },
  {
    service: "ssh",
    pattern: "^SSH-(\\d+\\.\\d+)-libssh[_-](\\d+\\.\\d+\\.\\d+)",
    name: "libssh",
    version_extract: "Group 1 = SSH protocol version, Group 2 = libssh version",
  },
  {
    service: "ssh",
    pattern: "^SSH-(\\d+\\.\\d+)-paramiko_(\\d+\\.\\d+\\.\\d+)",
    name: "Paramiko SSH (Python)",
    version_extract: "Group 1 = SSH protocol version, Group 2 = Paramiko version",
  },

  // ──────────────────────────────────────────────────
  // FTP
  // ──────────────────────────────────────────────────
  {
    service: "ftp",
    pattern: "^220[- ].*\\(vsFTPd (\\d+\\.\\d+\\.\\d+)\\)",
    name: "vsftpd",
    version_extract: "Capture group 1 contains the vsftpd version (e.g. 3.0.5)",
  },
  {
    service: "ftp",
    pattern: "^220[- ]ProFTPD (\\d+\\.\\d+\\.\\d+\\w*)",
    name: "ProFTPD",
    version_extract: "Capture group 1 contains the ProFTPD version (e.g. 1.3.8b)",
  },
  {
    service: "ftp",
    pattern: "^220[- ].*Pure-FTPd",
    name: "Pure-FTPd",
    version_extract: "Version may follow in brackets if compiled with --with-altlog",
  },
  {
    service: "ftp",
    pattern: "^220[- ]Microsoft FTP Service",
    name: "Microsoft IIS FTP",
    version_extract: "Version is not typically disclosed in the banner; infer from IIS version",
  },
  {
    service: "ftp",
    pattern: "^220[- ]FileZilla Server (\\d+\\.\\d+\\.\\d+)",
    name: "FileZilla Server",
    version_extract: "Capture group 1 contains the FileZilla Server version",
  },
  {
    service: "ftp",
    pattern: "^220[- ].*wu-(\\d+\\.\\d+\\.\\d+)",
    name: "WU-FTPD",
    version_extract: "Capture group 1 contains the WU-FTPD version",
  },

  // ──────────────────────────────────────────────────
  // SMTP
  // ──────────────────────────────────────────────────
  {
    service: "smtp",
    pattern: "^220[- ].*Postfix",
    name: "Postfix SMTP",
  },
  {
    service: "smtp",
    pattern: "^220[- ].*Microsoft ESMTP MAIL Service",
    name: "Microsoft Exchange SMTP",
  },
  {
    service: "smtp",
    pattern: "^220[- ].*Exim (\\d+\\.\\d+(?:\\.\\d+)?)",
    name: "Exim",
    version_extract: "Capture group 1 contains the Exim version",
  },
  {
    service: "smtp",
    pattern: "^220[- ].*Sendmail (\\d+\\.\\d+\\.\\d+)",
    name: "Sendmail",
    version_extract: "Capture group 1 contains the Sendmail version",
  },

  // ──────────────────────────────────────────────────
  // HTTP (banner-style identification)
  // ──────────────────────────────────────────────────
  {
    service: "http",
    pattern: "Server:\\s*Apache/(\\d+\\.\\d+\\.\\d+)",
    name: "Apache httpd",
    version_extract: "Capture group 1 contains the Apache version (e.g. 2.4.58)",
  },
  {
    service: "http",
    pattern: "Server:\\s*nginx/(\\d+\\.\\d+\\.\\d+)",
    name: "Nginx",
    version_extract: "Capture group 1 contains the Nginx version (e.g. 1.25.4)",
  },
  {
    service: "http",
    pattern: "Server:\\s*Microsoft-IIS/(\\d+\\.\\d+)",
    name: "Microsoft IIS",
    version_extract: "Capture group 1 contains the IIS version (e.g. 10.0)",
  },
  {
    service: "http",
    pattern: "Server:\\s*LiteSpeed",
    name: "LiteSpeed Web Server",
    version_extract: "Version may or may not follow the LiteSpeed identifier",
  },
  {
    service: "http",
    pattern: "Server:\\s*openresty/(\\d+\\.\\d+\\.\\d+\\.\\d+)",
    name: "OpenResty",
    version_extract: "Capture group 1 contains the OpenResty version",
  },
  {
    service: "http",
    pattern: "Server:\\s*Caddy",
    name: "Caddy",
  },
  {
    service: "http",
    pattern: "Server:\\s*cloudflare",
    name: "Cloudflare",
  },

  // ──────────────────────────────────────────────────
  // IMAP / POP3
  // ──────────────────────────────────────────────────
  {
    service: "imap",
    pattern: "^\\* OK.*Dovecot",
    name: "Dovecot IMAP",
  },
  {
    service: "imap",
    pattern: "^\\* OK.*Cyrus IMAP (\\d+\\.\\d+\\.\\d+)",
    name: "Cyrus IMAP",
    version_extract: "Capture group 1 contains the Cyrus IMAP version",
  },
  {
    service: "pop3",
    pattern: "^\\+OK.*Dovecot",
    name: "Dovecot POP3",
  },

  // ──────────────────────────────────────────────────
  // MongoDB
  // ──────────────────────────────────────────────────
  {
    service: "mongodb",
    pattern: '"version"\\s*:\\s*"(\\d+\\.\\d+\\.\\d+)"',
    name: "MongoDB",
    version_extract: "Capture group 1 from the isMaster/hello response JSON",
  },

  // ──────────────────────────────────────────────────
  // Memcached
  // ──────────────────────────────────────────────────
  {
    service: "memcached",
    pattern: "^STAT version (\\d+\\.\\d+\\.\\d+)",
    name: "Memcached",
    version_extract: "Capture group 1 from the 'stats' command output",
  },

  // ──────────────────────────────────────────────────
  // DNS
  // ──────────────────────────────────────────────────
  {
    service: "dns",
    pattern: "version\\.bind.*\"(\\d+\\.\\d+\\.\\d+[\\w.-]*)\"",
    name: "BIND (ISC)",
    version_extract: "Capture group 1 from the version.bind CHAOS TXT response",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// SMB Dialect to OS/Windows Version Mapping
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps SMB dialect version strings to the Windows OS version that introduced them.
 *
 * During SMB2 negotiation, the server and client agree on the highest mutually supported
 * dialect. The selected dialect reveals the minimum Windows version running on the server.
 *
 * Reference: MS-SMB2 Section 2.2.3 (NEGOTIATE Request)
 */
export const SMB_DIALECT_MAP: Record<string, string> = {
  "3.1.1": "Windows 10 / Server 2016+",
  "3.0.2": "Windows 8.1 / Server 2012 R2",
  "3.0": "Windows 8 / Server 2012",
  "2.1": "Windows 7 / Server 2008 R2",
  "2.0.2": "Windows Vista / Server 2008",
  "NT LM 0.12": "Windows NT / 2000 / XP / Server 2003 (SMB1)",
};

// ──────────────────────────────────────────────────────────────────────────────
// NTLM Type 2 Challenge — OS Version Mapping
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps the "MajorVersion.MinorVersion" extracted from an NTLM Type 2 challenge
 * message (NTLMSSP_CHALLENGE) to a Windows OS version.
 *
 * The NTLM Type 2 message contains an 8-byte OS version structure at offset 48:
 *  - Byte 0: Major version
 *  - Byte 1: Minor version
 *  - Bytes 2-3: Build number (little-endian)
 *  - Bytes 4-7: NTLM revision
 *
 * Reference: MS-NLMP Section 2.2.2.1 (VERSION structure)
 */
export const NTLM_OS_MAP: Record<string, string> = {
  "10.0": "Windows 10 / 11 / Server 2016 / 2019 / 2022",
  "6.3": "Windows 8.1 / Server 2012 R2",
  "6.2": "Windows 8 / Server 2012",
  "6.1": "Windows 7 / Server 2008 R2",
  "6.0": "Windows Vista / Server 2008",
  "5.2": "Windows XP x64 / Server 2003",
  "5.1": "Windows XP",
  "5.0": "Windows 2000",
};

// ──────────────────────────────────────────────────────────────────────────────
// MySQL Authentication Plugin — Version Inference
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps MySQL authentication plugin names (from the initial handshake packet) to
 * the MySQL major version that uses them by default.
 *
 * Reference: MySQL Connection Phase documentation
 *  - https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_connection_phase.html
 */
export const MYSQL_AUTH_PLUGIN_MAP: Record<string, string> = {
  mysql_native_password: "MySQL 4.1 - 5.7 (default auth plugin for 5.x)",
  caching_sha2_password: "MySQL 8.0+ (default auth plugin since 8.0.4)",
  sha256_password: "MySQL 5.6+ (optional; default in some 5.7 configs)",
  mysql_old_password: "MySQL 3.x - 4.0 (insecure, deprecated)",
  mysql_clear_password: "MySQL 5.5+ (cleartext plugin, requires SSL)",
  authentication_ldap_sasl: "MySQL 8.0+ Enterprise (LDAP SASL authentication)",
  authentication_windows_client: "MySQL 5.5+ on Windows (Windows native auth)",
};
