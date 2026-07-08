# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-08

### Added

- Initial release with 13 composite tools orchestrating 103 fingerprinting techniques across 21 providers
- MCP server with stdio transport for AI agent integration
- **TCP Fingerprint** (3 techniques) -- TCP probing, banner grabbing, port analysis
- **TLS/SSL Analysis** (8 techniques) -- certificate analysis, JARM hash, JA4X fingerprint, cipher enumeration, SNI probing, certificate cross-reference, CT log subdomains
- **SSH Fingerprint** (3 techniques) -- protocol probing, algorithm audit, host key lookup via Shodan
- **HTTP Fingerprint** (16 techniques) -- header analysis, favicon hash, ETag tracking, error page fingerprint, cookie analysis, method enumeration, CORS, compression, cache, security headers, timing, redirect chain, keep-alive, resource hints, Server-Timing, NEL
- **Web Technology** (9 techniques) -- technology stack detection, analytics detection, source map discovery, API discovery, SRI analysis, WebSocket detection, GraphQL detection, multi-fingerprint
- **Path Intelligence** (5 techniques) -- sensitive file discovery, robots.txt analysis, git leak detection, debug endpoint discovery, API version enumeration
- **DNS Intelligence** (7 techniques) -- record enumeration, email auth (SPF/DKIM/DMARC), SaaS detection, server fingerprinting, MTA-STS, subdomain takeover check, reverse DNS
- **WAF/CDN Detection** (4 techniques) -- WAF detection, CDN detection, WAF fingerprinting, origin IP discovery
- **Timing Analysis** (2 techniques) -- timing baseline, clock skew detection
- **HTTP/2 & HTTP/3** (3 techniques) -- HTTP/2 detection, server fingerprinting, HTTP/3 Alt-Svc discovery
- **SMTP Fingerprint** (2 techniques) -- banner analysis, STARTTLS inspection
- **IoT/Embedded** (2 techniques) -- IoT device detection, UPnP/SSDP discovery
- **Application Detection** (3 techniques) -- CMS detection, framework detection, e-commerce platform detection
- **Service Probing** (5 techniques) -- MySQL, PostgreSQL, Redis, FTP, VNC/RDP probing
- **Correlation Engine** (5 techniques) -- signal consistency analysis, honeypot detection, spoofing detection, fingerprint comparison, network topology mapping
- **Fingerprint Identification** (3 techniques) -- hash-based identification, C2 detection, signature listing
- **Passive Analysis** (3 techniques) -- header analysis, HTML analysis, banner analysis (offline)
- **OSINT Enrichment** (6 techniques) -- Shodan lookup, Censys lookup, reverse IP, WHOIS, Web Archive, VirusTotal
- **Scope Expansion** (8 techniques) -- subdomain enumeration, wildcard detection, TLD expansion, related domains, ASN neighbors, passive DNS, CT log subdomains, scope summary
- **Infrastructure Detection** (3 techniques) -- cloud provider detection, hosting provider detection, CDN identification
- **Meta** (3 techniques) -- data source listing, server configuration, signature database
- Composite tool architecture: 13 MCP-registered tools orchestrating 103 individual techniques
- Depth-based recon: quick (5 techniques), standard (20), deep (50+)
- CLI with `--list`, `--list-all`, `--help`, `--tool` flags
- Per-provider rate limiting and TTL caching
- README translations in 23 languages
- Dark/light mode SVG banners
- Social preview image
