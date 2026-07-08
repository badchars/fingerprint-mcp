<p align="center">
  <strong>English</strong> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.pt-BR.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.el.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-light.svg">
    <img alt="fingerprint-mcp" src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-dark.svg" width="700">
  </picture>
</p>

<h3 align="center">Universal digital fingerprinting for AI agents.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, service probing, JARM, JA4X, favicon hashing, infrastructure topology, C2 detection, OSINT enrichment &mdash; unified into a single MCP server.<br>
  Your AI agent gets <b>full-spectrum fingerprinting on demand</b>, not 11 disconnected CLI tools and manual correlation.
</p>

<br>

<p align="center">
  <a href="#the-problem">The Problem</a> &bull;
  <a href="#how-its-different">How It's Different</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#what-the-ai-can-do">What The AI Can Do</a> &bull;
  <a href="#tools-reference-13-tools-103-techniques">Tools (13)</a> &bull;
  <a href="#data-sources-21">Data Sources</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Tools">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Techniques">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp demo" width="800">
</p>

---

## The Problem

Fingerprinting a server today means juggling a dozen disconnected tools. You run `nmap` for port scanning, `testssl.sh` for certificate analysis, `curl -I` for HTTP headers, `dig` for DNS, `wafw00f` for WAF detection, `ssh-audit` for SSH, a separate JARM tool, Wappalyzer for tech detection &mdash; and then you spend 30 minutes manually cross-referencing everything in a spreadsheet to figure out what's actually running.

```
Traditional fingerprinting workflow:
  analyze TLS certificates     ->  testssl.sh / openssl s_client
  grab HTTP headers            ->  curl -I
  detect web technologies      ->  wappalyzer CLI
  DNS reconnaissance           ->  dig / nslookup / dnsenum
  port scanning                ->  nmap -sV
  WAF detection                ->  wafw00f
  SSH audit                    ->  ssh-audit
  service fingerprinting       ->  nmap scripts
  JARM fingerprint             ->  jarm (separate tool)
  check OSINT databases        ->  shodan CLI, censys CLI
  correlate everything         ->  manually in a spreadsheet
  ──────────────────────────────
  Total: 11 tools, 30+ minutes, manual correlation
```

**fingerprint-mcp** gives your AI agent 13 composite tools wrapping 103 fingerprinting techniques across 21 providers via the [Model Context Protocol](https://modelcontextprotocol.io). The agent runs multi-layer fingerprinting in parallel, correlates signals across TCP/TLS/HTTP/DNS/SSH layers, detects honeypots and C2 infrastructure, and presents a unified intelligence picture &mdash; in a single conversation.

```
With fingerprint-mcp:
  You: "Do a deep recon on target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
            Let's Encrypt cert, 2 SANs, TLS 1.2+1.3
         -> HTTP: Express.js behind Cloudflare WAF,
            React SPA, Google Analytics, 14 security headers analyzed
         -> DNS: A/AAAA/MX/TXT records, SPF/DKIM/DMARC configured,
            Slack + Google Workspace detected via CNAME/MX
         -> Ports: 80, 443, 22 (OpenSSH 9.6), 8080 (dev server)
         -> WAF: Cloudflare detected, origin IP discovered via direct-connect
         -> Enumeration: 12 subdomains via CT logs, wildcard DNS detected
         -> "target.com runs nginx/1.24.0 with Express.js behind
            Cloudflare WAF. Origin IP 203.0.113.42 exposed on port 8080.
            TLS is properly configured (A+ equivalent) but the dev server
            on 8080 has no WAF protection. 3 subdomains point to
            decommissioned infrastructure — potential takeover risk."
```

---

## How It's Different

Existing tools give you raw data one layer at a time. fingerprint-mcp gives your AI agent the ability to **reason across all fingerprinting layers simultaneously**.

<table>
<thead>
<tr>
<th></th>
<th>Traditional Approach</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>11 different CLI tools with different output formats</td>
<td>MCP &mdash; AI agent calls tools conversationally</td>
</tr>
<tr>
<td><b>Techniques</b></td>
<td>One tool, one layer at a time</td>
<td>103 techniques across 21 providers, run in parallel</td>
</tr>
<tr>
<td><b>TLS analysis</b></td>
<td>testssl.sh output, manually parse JARM separately</td>
<td>Agent combines certificate + JARM + JA4X + cipher suites + SNI + CT logs in one call</td>
</tr>
<tr>
<td><b>Correlation</b></td>
<td>Copy-paste results into a spreadsheet</td>
<td>Agent cross-correlates: "JARM matches known C2 framework, HTTP timing confirms honeypot"</td>
</tr>
<tr>
<td><b>WAF bypass</b></td>
<td>wafw00f detects WAF, you manually hunt for origin</td>
<td>Agent detects WAF, discovers origin IP, and verifies it serves the same content</td>
</tr>
<tr>
<td><b>API keys</b></td>
<td>Required for Shodan, Censys, etc.</td>
<td>80+ active techniques work without any API keys; keys unlock OSINT enrichment</td>
</tr>
<tr>
<td><b>Setup</b></td>
<td>Install nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; one command, zero config</td>
</tr>
</tbody>
</table>

---

## Quick Start

### Option 1: npx (no install)

```bash
npx fingerprint-mcp
```

All 80+ active fingerprinting techniques work immediately. No API keys required for TCP, TLS, SSH, HTTP, DNS, WAF, path, service, timing, IoT, SMTP, infrastructure, and application fingerprinting.

### Option 2: Clone

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Environment variables (optional)

```bash
# OSINT enrichment (all optional — active fingerprinting works without any keys)
export SHODAN_API_KEY=your-key           # Enables osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Enables osint_censys (free: 250 queries/month)
export CENSYS_API_SECRET=your-secret     # Censys API secret
export SECURITYTRAILS_API_KEY=your-key   # Enables waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Enables osint_virustotal (free: 500 queries/day)
```

All API keys are optional. Without them, you still get full TCP/TLS/SSH/HTTP/DNS/WAF/path/service/timing/IoT/SMTP/infrastructure/application fingerprinting, correlation, passive analysis, enumeration, and meta tools &mdash; 80+ techniques that work by directly probing the target.

### Connect to your AI agent

<details open>
<summary><b>Claude Code</b></summary>

```bash
# With npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# With local clone
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fingerprint": {
      "command": "npx",
      "args": ["-y", "fingerprint-mcp"],
      "env": {
        "SHODAN_API_KEY": "optional",
        "CENSYS_API_ID": "optional",
        "CENSYS_API_SECRET": "optional",
        "SECURITYTRAILS_API_KEY": "optional",
        "VIRUSTOTAL_API_KEY": "optional"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor / Windsurf / other MCP clients</b></summary>

Same JSON config format. Point the command to `npx fingerprint-mcp` or your local installation path.

</details>

### Start querying

```
You: "Fingerprint everything about target.com — TLS, HTTP stack, WAF, DNS, open ports"
```

That's it. The agent handles multi-layer fingerprinting, signal correlation, and infrastructure analysis automatically.

---

## What The AI Can Do

### Quick Recon

```
You: "Quick recon on target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: ports 80, 443, 22 open
       -> TLS: Let's Encrypt RSA cert, TLS 1.2+1.3, nginx JARM signature
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM configured
       -> WAF: Cloudflare detected (cf-ray header)
       -> "target.com is a React SPA on Express.js behind nginx/1.24.0,
          served through Cloudflare CDN. TLS properly configured with
          Let's Encrypt. SSH on port 22 running OpenSSH 9.6. Email
          handled by Google Workspace with full SPF/DKIM/DMARC."
```

### Deep TLS Investigation

```
You: "Analyze the TLS configuration of suspicious-server.com in detail"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Certificate: self-signed, CN=localhost, expired 47 days ago
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (matches Cobalt Strike default profile)
       -> JA4X: fingerprint matches known C2 framework pattern
       -> Cipher suites: accepts weak ciphers (RC4, 3DES)
       -> SNI: responds identically to any SNI value
       -> CT logs: certificate not logged (not publicly trusted)
       -> "HIGH RISK: TLS configuration strongly indicates C2 infrastructure.
          Self-signed expired cert, JARM fingerprint matches Cobalt Strike,
          accepts weak ciphers, and responds to arbitrary SNI values.
          Recommend immediate investigation and blocking."
```

### WAF Bypass & Origin Discovery

```
You: "target.com is behind a WAF. Can you find the origin server?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), challenge page on suspicious requests
       -> DNS: A record points to Cloudflare IP 104.21.x.x
       -> Subdomains: dev.target.com resolves to 203.0.113.42 (non-Cloudflare)
       -> Direct connect to 203.0.113.42:443 returns same TLS cert
       -> SecurityTrails historical: origin was 203.0.113.42 before Cloudflare
       -> "Origin IP found: 203.0.113.42. Discovered via dev.target.com
          subdomain which bypasses Cloudflare. The origin serves the same
          TLS certificate and responds to the target.com Host header.
          Origin has no WAF protection — direct access possible."
```

### Service Discovery on a Host

```
You: "What services are running on 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519 host key
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, authentication required
       -> Port 5432: PostgreSQL 16.1, SSL required
       -> Port 6379: Redis 7.2.4, NO authentication (open)
       -> Port 8080: Node.js Express dev server, CORS: *
       -> "CRITICAL: Redis on port 6379 has no authentication — anyone on
          the network can read/write data. The Express dev server on 8080
          has wildcard CORS. MySQL and PostgreSQL properly require auth.
          WordPress is 2 minor versions behind. Immediate action needed
          on Redis and the dev server exposure."
```

---

## Tools Reference (13 tools, 103 techniques)

<details open>
<summary><b>recon &mdash; Full reconnaissance with depth-based technique selection</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Target URL to fingerprint |
| `depth` | `quick` \| `standard` \| `deep` | Scan depth: quick=5 techniques, standard=20, deep=50+ |

Orchestrates techniques from all providers based on depth level. Quick mode gives a fast overview; deep mode runs exhaustive fingerprinting including enumeration, OSINT, and correlation.

</details>

<details>
<summary><b>scan_ports &mdash; TCP port scanning with service detection (3 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `host` | string | Target host (IP or domain) |
| `ports` | number[] | Optional &mdash; specific ports to scan (defaults to common ports) |

| Technique | Description |
|-----------|-------------|
| `tcp_probe` | TCP connect scan to detect open ports |
| `tcp_banner` | Banner grabbing on open ports for service identification |
| `tcp_analysis` | Port combination analysis and service inference |

</details>

<details>
<summary><b>scan_tls &mdash; Complete TLS/SSL analysis (8 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `host` | string | Target host (IP or domain) |
| `port` | number | Optional &mdash; TLS port (default: 443) |

| Technique | Description |
|-----------|-------------|
| `tls_certificate` | X.509 certificate parsing &mdash; subject, issuer, SANs, validity, chain |
| `tls_jarm` | JARM active fingerprinting &mdash; 10 TLS Client Hello probes, 62-char hash |
| `tls_ja4x` | JA4X passive TLS fingerprinting from certificate properties |
| `tls_ciphers` | Cipher suite enumeration and strength analysis |
| `tls_protocols` | Supported TLS protocol version detection (SSLv3 through TLS 1.3) |
| `tls_sni` | SNI behavior testing &mdash; default cert vs. requested hostname |
| `tls_ct_logs` | Certificate Transparency log lookup via crt.sh |
| `tls_ocsp` | OCSP stapling and revocation status check |

</details>

<details>
<summary><b>scan_dns &mdash; DNS intelligence (7 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Target domain |

| Technique | Description |
|-----------|-------------|
| `dns_records` | Full record enumeration &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF, DKIM, and DMARC record analysis |
| `dns_saas` | SaaS/service detection via CNAME and MX patterns (Slack, Zendesk, etc.) |
| `dns_server` | DNS server fingerprinting (BIND, PowerDNS, Cloudflare, etc.) |
| `dns_takeover` | Subdomain takeover detection via dangling CNAME analysis |
| `dns_zone` | Zone transfer attempt (AXFR) |
| `dns_caa` | CAA record analysis for certificate authority restrictions |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/web fingerprinting (29 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Target URL |

| Technique | Provider | Description |
|-----------|----------|-------------|
| `http_headers` | HTTP | Response header analysis and server identification |
| `http_header_order` | HTTP | Header ordering fingerprint (server software signature) |
| `http_security_headers` | HTTP | Security header audit (CSP, HSTS, X-Frame-Options, etc.) |
| `http_cookies` | HTTP | Cookie analysis &mdash; flags, prefixes, framework detection |
| `http_methods` | HTTP | Allowed HTTP method enumeration (OPTIONS) |
| `http_cors` | HTTP | CORS policy analysis and misconfiguration detection |
| `http_compression` | HTTP | Supported compression algorithms (gzip, br, zstd) |
| `http_caching` | HTTP | Cache header analysis (CDN, reverse proxy detection) |
| `http_etag` | HTTP | ETag format analysis for backend identification |
| `http_error` | HTTP | Error page fingerprinting (custom vs. default error pages) |
| `http_redirect` | HTTP | Redirect chain analysis |
| `http_timing` | HTTP | Response timing baseline for server performance profiling |
| `http_favicon` | HTTP | Favicon hash (MurmurHash3) for technology identification |
| `http_robots` | HTTP | robots.txt parsing and disallowed path extraction |
| `http_sitemap` | HTTP | Sitemap discovery and URL extraction |
| `http_wellknown` | HTTP | .well-known endpoint discovery (security.txt, openid, etc.) |
| `web_tech` | Web | Technology detection via HTML/JS/CSS patterns |
| `web_analytics` | Web | Analytics and tracking service detection |
| `web_sourcemaps` | Web | Source map file discovery |
| `web_websocket` | Web | WebSocket endpoint detection |
| `web_graphql` | Web | GraphQL endpoint detection and introspection |
| `web_spa` | Web | Single-page application framework detection |
| `web_cdn` | Web | CDN detection via response headers and DNS |
| `web_meta` | Web | HTML meta tag analysis (generator, framework hints) |
| `web_feed` | Web | RSS/Atom feed discovery |
| `h2_detect` | HTTP/2 | HTTP/2 protocol support detection |
| `h2_fingerprint` | HTTP/2 | HTTP/2 server fingerprinting (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | HTTP/3 (QUIC) support detection via Alt-Svc header |
| `app_cms` | Application | CMS detection (WordPress, Drupal, Joomla, etc.) |

</details>

<details>
<summary><b>scan_paths &mdash; Path intelligence (5 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Target URL |
| `categories` | string[] | Optional &mdash; categories to check (sensitive, git, debug, api, config) |

| Technique | Description |
|-----------|-------------|
| `path_sensitive` | Sensitive file discovery (backup files, config files, database dumps) |
| `path_robots` | robots.txt and sitemap.xml analysis for hidden paths |
| `path_git` | Git repository leak detection (.git/HEAD, .git/config) |
| `path_debug` | Debug endpoint discovery (phpinfo, server-status, debug consoles) |
| `path_api` | API version and documentation endpoint discovery |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN detection and fingerprinting (4 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Target URL |

| Technique | Description |
|-----------|-------------|
| `waf_detect` | WAF presence detection via response header and behavior analysis |
| `waf_cdn` | CDN provider identification (Cloudflare, Akamai, Fastly, etc.) |
| `waf_fingerprint` | WAF product identification and version detection |
| `waf_origin` | Origin IP discovery behind WAF/CDN (requires `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Service-level probing (12 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `host` | string | Target host (IP or domain) |
| `ports` | number[] | Optional &mdash; specific ports to probe |
| `service` | string | Optional &mdash; specific service to probe (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Technique | Provider | Description |
|-----------|----------|-------------|
| `ssh_probe` | SSH | SSH protocol version and software detection |
| `ssh_algorithms` | SSH | SSH algorithm audit (KEX, ciphers, MACs, host key types) |
| `ssh_hostkey_lookup` | SSH | SSH host key lookup via Shodan (requires `SHODAN_API_KEY`) |
| `svc_mysql` | Service | MySQL version detection and capability fingerprinting |
| `svc_postgres` | Service | PostgreSQL version detection and SSL support check |
| `svc_redis` | Service | Redis version detection and authentication status |
| `svc_ftp` | Service | FTP banner analysis and anonymous login check |
| `svc_vnc_rdp` | Service | VNC/RDP service detection and security assessment |
| `smtp_banner` | SMTP | SMTP banner analysis and MTA identification |
| `smtp_starttls` | SMTP | SMTP STARTTLS support and certificate inspection |
| `iot_detect` | IoT | IoT device detection via banner patterns and default pages |
| `iot_upnp` | IoT | UPnP/SSDP device discovery on local network |

</details>

<details>
<summary><b>enumerate &mdash; Scope expansion (8 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Target domain |

| Technique | Description |
|-----------|-------------|
| `enum_subdomains` | Subdomain enumeration via multiple methods |
| `enum_wildcard` | Wildcard DNS detection |
| `enum_tld` | TLD expansion (target.com -> target.net, target.org, etc.) |
| `enum_related` | Related domain discovery via shared infrastructure |
| `enum_asn` | ASN neighbor discovery &mdash; other domains on same network |
| `enum_ct` | Certificate Transparency log subdomain extraction |
| `enum_passive_dns` | Passive DNS history (requires `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Scope summary and attack surface overview |

</details>

<details>
<summary><b>osint &mdash; OSINT enrichment (6 techniques)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | IP address or domain to enrich |
| `type` | `ip` \| `domain` | Optional &mdash; target type (auto-detected if omitted) |

| Technique | Auth | Description |
|-----------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan host lookup &mdash; open ports, banners, vulns, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys host data &mdash; services, TLS, autonomous system |
| `osint_reverse_ip` | None | Reverse IP lookup &mdash; other domains on same IP |
| `osint_whois` | None | WHOIS registration data &mdash; registrar, dates, nameservers |
| `osint_webarchive` | None | Web Archive history &mdash; first/last snapshot, change frequency |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal domain/IP report &mdash; detections, categories, DNS |

</details>

<details>
<summary><b>analyze &mdash; Passive fingerprint analysis (3 modes)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Type of data to analyze |
| `data` | string | Raw data to analyze (paste headers, HTML, or banner output) |

| Mode | Description |
|------|-------------|
| `fp_analyze_headers` | Passive HTTP header analysis &mdash; server, framework, proxy detection without sending traffic |
| `fp_analyze_html` | Passive HTML analysis &mdash; technology detection, framework identification from source |
| `fp_analyze_banner` | Passive banner analysis &mdash; service identification from raw banner text |

</details>

<details>
<summary><b>correlate &mdash; Multi-signal correlation engine (7 modes)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Correlation mode |
| `signals` | object | Fingerprint signals to correlate (varies by mode) |

| Mode | Description |
|------|-------------|
| `fp_consistency` | Cross-layer signal consistency check &mdash; do TCP, TLS, HTTP, and DNS fingerprints agree? |
| `fp_honeypot` | Honeypot detection &mdash; checks for impossible service combinations and behavioral anomalies |
| `fp_spoofing` | Spoofing detection &mdash; identifies mismatched server headers vs. actual behavior |
| `fp_compare` | Side-by-side comparison of two hosts' fingerprint profiles |
| `fp_topology` | Infrastructure topology mapping &mdash; CDN, load balancer, reverse proxy chain |
| `fp_c2` | C2 framework detection via JARM, TLS, HTTP, and timing correlation |
| `fp_identify` | Hash-based identification against known signature database |

</details>

<details>
<summary><b>meta &mdash; Server configuration and data (3 modes)</b></summary>

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Optional &mdash; filter by category |

| Mode | Description |
|------|-------------|
| `fp_sources` | List all available data sources with configuration and API key status |
| `fp_config` | Server configuration &mdash; version, loaded providers, technique count |
| `fp_signatures` | Signature database listing &mdash; JARM, banner, WAF, application signatures |

</details>

---

### CLI Usage

```bash
# List all available tools and techniques
npx fingerprint-mcp --list

# Run any tool directly
npx fingerprint-mcp --tool recon '{"url":"https://example.com","depth":"quick"}'
npx fingerprint-mcp --tool scan_tls '{"host":"example.com"}'
npx fingerprint-mcp --tool scan_ports '{"host":"10.0.1.50","ports":[22,80,443,3306,8080]}'
npx fingerprint-mcp --tool scan_dns '{"domain":"example.com"}'
npx fingerprint-mcp --tool scan_http '{"url":"https://example.com"}'
npx fingerprint-mcp --tool scan_waf '{"url":"https://example.com"}'
npx fingerprint-mcp --tool scan_services '{"host":"10.0.1.50","service":"redis"}'
npx fingerprint-mcp --tool enumerate '{"domain":"example.com"}'
npx fingerprint-mcp --tool analyze '{"type":"headers","data":"Server: nginx/1.24.0\nX-Powered-By: Express"}'
npx fingerprint-mcp --tool correlate '{"type":"honeypot","signals":{"jarm":"...","banner":"..."}}'
npx fingerprint-mcp --tool meta '{}'

# OSINT tools (require API keys)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Data Sources (21)

| Source | Auth | What it provides |
|--------|------|-----------------|
| TCP probing | None | Port scanning, banner grabbing, service detection |
| TLS/SSL analysis | None | Certificate parsing, JARM fingerprinting, JA4X, cipher enumeration, SNI testing |
| SSH probing | None | Protocol version, algorithm audit, software detection |
| HTTP analysis | None | Header fingerprinting, favicon hashing, cookie analysis, method enumeration, CORS |
| Web detection | None | Technology detection, analytics, source maps, WebSocket, GraphQL, SPA frameworks |
| Path discovery | None | Sensitive files, git leaks, debug endpoints, API versions, robots.txt |
| DNS resolution | None | Record enumeration, email auth analysis, SaaS detection, server fingerprinting |
| WAF/CDN detection | None | WAF identification, CDN detection, WAF fingerprinting |
| Timing analysis | None | Response timing baseline, clock skew detection |
| HTTP/2 & HTTP/3 | None | HTTP/2 detection and fingerprinting, HTTP/3 Alt-Svc discovery |
| SMTP probing | None | SMTP banner analysis, STARTTLS inspection |
| IoT/Embedded | None | IoT device detection, UPnP/SSDP discovery |
| Application detection | None | CMS, framework, and e-commerce platform identification |
| Service probing | None | MySQL, PostgreSQL, Redis, FTP, VNC/RDP fingerprinting |
| Infrastructure detection | None | Cloud provider, hosting provider, CDN identification |
| Correlation engine | None | Signal consistency, honeypot detection, spoofing detection, topology mapping |
| Identification engine | None | Hash-based identification, C2 detection, signature matching |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Host intelligence &mdash; open ports, banners, vulnerabilities, OS detection |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Host data &mdash; services, TLS certificates, autonomous system info |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF origin discovery, passive DNS history, historical records |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Domain/IP reputation, detection results, DNS history, categories |

---

## Architecture

```
src/
  index.ts                # CLI entrypoint (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts         # MCP server setup (stdio transport)
    tools.ts              # Tool registry — all 13 composite tools registered here
  types/
    index.ts              # Shared types (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Per-provider rate limiter
    cache.ts              # TTL cache for API responses
    require-key.ts        # API key validation helper
    murmurhash3.ts        # MurmurHash3 for favicon hashing
  composite/              # 13 composite tool orchestrators
    recon.ts              # Full recon orchestrator (quick/standard/deep)
    scan-ports.ts         # Port scanning composite
    scan-tls.ts           # TLS analysis composite
    scan-dns.ts           # DNS intelligence composite
    scan-http.ts          # HTTP fingerprinting composite
    scan-paths.ts         # Path discovery composite
    scan-waf.ts           # WAF/CDN detection composite
    scan-services.ts      # Service probing composite
    analyze.ts            # Passive analysis composite
    correlate.ts          # Correlation engine composite
    enumerate.ts          # Scope expansion composite
    osint.ts              # OSINT enrichment composite
    meta.ts               # Server meta composite
    helpers.ts            # Shared composite helpers
  tcp/                    # TCP probing techniques (3)
  tls/                    # TLS/SSL analysis techniques (8)
  ssh/                    # SSH probing techniques (3)
  http/                   # HTTP fingerprinting techniques (16)
  web/                    # Web technology detection techniques (9)
  path/                   # Path discovery techniques (5)
  dns/                    # DNS intelligence techniques (7)
  waf/                    # WAF/CDN detection techniques (4)
  timing/                 # Timing analysis techniques (2)
  h2/                     # HTTP/2 & HTTP/3 techniques (3)
  smtp/                   # SMTP probing techniques (2)
  iot/                    # IoT/embedded detection techniques (2)
  app/                    # Application detection techniques (3)
  service/                # Service probing techniques (5)
  infra/                  # Infrastructure detection techniques (3)
  correlation/            # Correlation engine (5)
  identify/               # Identification engine (3)
  passive/                # Passive analysis (3)
  osint/                  # OSINT enrichment techniques (6)
  enum/                   # Enumeration techniques (8)
  meta/                   # Meta tools (3)
  data/                   # Signature databases and pattern libraries
    jarm-signatures.ts    # Known JARM fingerprints (C2, servers, CDNs)
    waf-signatures.ts     # WAF detection signatures
    service-banners.ts    # Service banner patterns
    tech-patterns.ts      # Technology detection patterns
    favicon-hashes.ts     # Known favicon MurmurHash3 values
    c2-signatures.ts      # C2 framework signatures
    ...                   # 15+ signature/pattern databases
```

**Design decisions:**

- **13 composite tools, 103 techniques** &mdash; The agent calls high-level tools (`recon`, `scan_tls`, `scan_http`). Each composite orchestrates multiple low-level techniques and returns correlated results. This reduces tool-call overhead while maintaining granularity.
- **21 providers, 1 server** &mdash; Every fingerprinting layer is an independent module. The composite orchestrator selects techniques based on context and depth.
- **Active-first, OSINT-optional** &mdash; 80+ techniques work by directly probing the target with zero API keys. OSINT providers (Shodan, Censys, VirusTotal, SecurityTrails) add enrichment but are never required.
- **Per-provider rate limiters** &mdash; Each provider has its own `RateLimiter` instance. Active probing is rate-limited to avoid detection; OSINT APIs are calibrated to their quotas.
- **TTL caching** &mdash; DNS records (10min), OSINT results (15min), CT logs (30min) are cached to avoid redundant lookups during multi-tool workflows.
- **Graceful degradation** &mdash; Missing API keys don't crash the server. OSINT tools return descriptive messages: "Set SHODAN_API_KEY to enable Shodan host lookup."
- **3 dependencies** &mdash; `@modelcontextprotocol/sdk`, `zod`, and `cheerio`. All network I/O via native `fetch()` and Node.js `net`/`tls`/`dns` modules. No nmap, no external binaries.

---

## Limitations

- OSINT tools (Shodan, Censys, VirusTotal, SecurityTrails) require API keys for their respective techniques
- Censys free tier limited to 250 queries/month
- VirusTotal free tier limited to 500 queries/day
- Port scanning uses TCP connect (not SYN scan) &mdash; less stealthy than nmap but requires no root privileges
- JARM fingerprinting requires direct TCP access to the target (may be blocked by firewalls)
- UPnP/SSDP discovery only works on local networks
- Service probing (MySQL, PostgreSQL, Redis) connects but does not authenticate
- Subdomain enumeration relies on CT logs and passive sources (no brute-force)
- macOS / Linux tested (Windows not tested)

---

## Part of the MCP Security Suite

| Project | Domain | Tools |
|---|---|---|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Browser-based security testing | 39 tools, Firefox, injection testing |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud security (AWS/Azure/GCP) | 38 tools, 60+ checks |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub security posture | 39 tools, 45 checks |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Vulnerability intelligence | 23 tools, 5 sources |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & reconnaissance | 37 tools, 12 sources |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & threat intelligence | 66 tools, 16 sources |
| **fingerprint-mcp** | **Universal digital fingerprinting** | **13 tools, 103 techniques, 21 providers** |

---

<p align="center">
<b>For authorized security testing and assessment only.</b><br>
Always ensure you have proper authorization before performing fingerprinting on any target.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 License</a> &bull; Built with Bun + TypeScript
</p>
