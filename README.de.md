<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <strong>Deutsch</strong> |
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

<h3 align="center">Universelles digitales Fingerprinting fuer KI-Agenten.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, Service-Probing, JARM, JA4X, Favicon-Hashing, Infrastruktur-Topologie, C2-Erkennung, OSINT-Anreicherung &mdash; vereint in einem einzigen MCP-Server.<br>
  Ihr KI-Agent erhaelt <b>Vollspektrum-Fingerprinting auf Abruf</b>, nicht 11 getrennte CLI-Tools und manuelle Korrelation.
</p>

<br>

<p align="center">
  <a href="#das-problem">Das Problem</a> &bull;
  <a href="#der-unterschied">Der Unterschied</a> &bull;
  <a href="#schnellstart">Schnellstart</a> &bull;
  <a href="#was-die-ki-kann">Was die KI kann</a> &bull;
  <a href="#tool-referenz-13-tools-103-techniken">Tools (13)</a> &bull;
  <a href="#datenquellen-21">Datenquellen</a> &bull;
  <a href="#architektur">Architektur</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Mitwirken</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Lizenz"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Tools">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Techniken">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp Demo" width="800">
</p>

---

## Das Problem

Einen Server heute zu fingerprinting bedeutet, ein Dutzend getrennter Tools gleichzeitig zu verwenden. Man startet `nmap` fuer Port-Scanning, `testssl.sh` fuer Zertifikatsanalyse, `curl -I` fuer HTTP-Header, `dig` fuer DNS, `wafw00f` fuer WAF-Erkennung, `ssh-audit` fuer SSH, ein separates JARM-Tool, Wappalyzer fuer Technologie-Erkennung &mdash; und verbringt dann 30 Minuten damit, alles manuell in einer Tabelle abzugleichen, um herauszufinden, was tatsaechlich laeuft.

```
Traditioneller Fingerprinting-Workflow:
  TLS-Zertifikate analysieren   ->  testssl.sh / openssl s_client
  HTTP-Header abfragen          ->  curl -I
  Web-Technologien erkennen     ->  wappalyzer CLI
  DNS-Aufklaerung               ->  dig / nslookup / dnsenum
  Port-Scanning                 ->  nmap -sV
  WAF-Erkennung                 ->  wafw00f
  SSH-Audit                     ->  ssh-audit
  Service-Fingerprinting        ->  nmap scripts
  JARM-Fingerprint              ->  jarm (separates Tool)
  OSINT-Datenbanken pruefen     ->  shodan CLI, censys CLI
  Alles korrelieren             ->  manuell in einer Tabelle
  ──────────────────────────────
  Gesamt: 11 Tools, 30+ Minuten, manuelle Korrelation
```

**fingerprint-mcp** bietet Ihrem KI-Agenten ueber das [Model Context Protocol](https://modelcontextprotocol.io) 13 zusammengesetzte Tools, die 103 Fingerprinting-Techniken von 21 Anbietern kapseln. Der Agent fuehrt mehrschichtiges Fingerprinting parallel aus, korreliert Signale ueber TCP/TLS/HTTP/DNS/SSH-Schichten, erkennt Honeypots und C2-Infrastruktur und praesentiert ein einheitliches Lagebild &mdash; alles in einer einzigen Konversation.

```
Mit fingerprint-mcp:
  Du: "Fuehre eine tiefe Aufklaerung auf target.com durch"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
            Let's Encrypt Zertifikat, 2 SANs, TLS 1.2+1.3
         -> HTTP: Express.js hinter Cloudflare WAF,
            React SPA, Google Analytics, 14 Sicherheitsheader analysiert
         -> DNS: A/AAAA/MX/TXT-Eintraege, SPF/DKIM/DMARC konfiguriert,
            Slack + Google Workspace via CNAME/MX erkannt
         -> Ports: 80, 443, 22 (OpenSSH 9.6), 8080 (Entwicklungsserver)
         -> WAF: Cloudflare erkannt, Ursprungs-IP durch Direktverbindung entdeckt
         -> Enumeration: 12 Subdomains via CT-Logs, Wildcard-DNS erkannt
         -> "target.com betreibt nginx/1.24.0 mit Express.js hinter
            Cloudflare WAF. Ursprungs-IP 203.0.113.42 ist auf Port 8080
            exponiert. TLS ist korrekt konfiguriert (A+-Aequivalent),
            aber der Entwicklungsserver auf 8080 hat keinen WAF-Schutz.
            3 Subdomains zeigen auf stillgelegte Infrastruktur —
            potenzielles Uebernahmerisiko."
```

---

## Der Unterschied

Bestehende Tools liefern Rohdaten jeweils nur auf einer Ebene. fingerprint-mcp gibt Ihrem KI-Agenten die Faehigkeit, **ueber alle Fingerprinting-Ebenen gleichzeitig zu schlussfolgern**.

<table>
<thead>
<tr>
<th></th>
<th>Traditioneller Ansatz</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Schnittstelle</b></td>
<td>11 verschiedene CLI-Tools mit unterschiedlichen Ausgabeformaten</td>
<td>MCP &mdash; KI-Agent ruft Tools konversationell auf</td>
</tr>
<tr>
<td><b>Techniken</b></td>
<td>Ein Tool, eine Ebene auf einmal</td>
<td>103 Techniken von 21 Anbietern, parallel ausgefuehrt</td>
</tr>
<tr>
<td><b>TLS-Analyse</b></td>
<td>testssl.sh-Ausgabe, JARM separat manuell parsen</td>
<td>Agent kombiniert Zertifikat + JARM + JA4X + Cipher Suites + SNI + CT-Logs in einem Aufruf</td>
</tr>
<tr>
<td><b>Korrelation</b></td>
<td>Ergebnisse in eine Tabelle kopieren</td>
<td>Agent korreliert: "JARM stimmt mit bekanntem C2-Framework ueberein, HTTP-Timing bestaetigt Honeypot"</td>
</tr>
<tr>
<td><b>WAF-Umgehung</b></td>
<td>wafw00f erkennt WAF, manuelle Suche nach Ursprung</td>
<td>Agent erkennt WAF, entdeckt Ursprungs-IP und verifiziert, dass sie denselben Inhalt liefert</td>
</tr>
<tr>
<td><b>API-Schluessel</b></td>
<td>Erforderlich fuer Shodan, Censys usw.</td>
<td>80+ aktive Techniken funktionieren ohne API-Schluessel; Schluessel schalten OSINT-Anreicherung frei</td>
</tr>
<tr>
<td><b>Einrichtung</b></td>
<td>nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer installieren...</td>
<td><code>npx fingerprint-mcp</code> &mdash; ein Befehl, null Konfiguration</td>
</tr>
</tbody>
</table>

---

## Schnellstart

### Option 1: npx (keine Installation)

```bash
npx fingerprint-mcp
```

Alle 80+ aktiven Fingerprinting-Techniken funktionieren sofort. Keine API-Schluessel erforderlich fuer TCP, TLS, SSH, HTTP, DNS, WAF, Pfad, Service, Timing, IoT, SMTP, Infrastruktur und Anwendungs-Fingerprinting.

### Option 2: Klonen

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Umgebungsvariablen (optional)

```bash
# OSINT-Anreicherung (alle optional — aktives Fingerprinting funktioniert ohne Schluessel)
export SHODAN_API_KEY=your-key           # Aktiviert osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Aktiviert osint_censys (kostenlos: 250 Abfragen/Monat)
export CENSYS_API_SECRET=your-secret     # Censys API-Secret
export SECURITYTRAILS_API_KEY=your-key   # Aktiviert waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Aktiviert osint_virustotal (kostenlos: 500 Abfragen/Tag)
```

Alle API-Schluessel sind optional. Ohne sie erhalten Sie weiterhin vollstaendiges TCP/TLS/SSH/HTTP/DNS/WAF/Pfad/Service/Timing/IoT/SMTP/Infrastruktur/Anwendungs-Fingerprinting, Korrelation, passive Analyse, Enumeration und Meta-Tools &mdash; 80+ Techniken, die durch direktes Probing des Ziels funktionieren.

### Mit Ihrem KI-Agenten verbinden

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Mit npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Mit lokalem Klon
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Zu `~/Library/Application Support/Claude/claude_desktop_config.json` hinzufuegen:

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
<summary><b>Cursor / Windsurf / andere MCP-Clients</b></summary>

Dasselbe JSON-Konfigurationsformat. Richten Sie den Befehl auf `npx fingerprint-mcp` oder Ihren lokalen Installationspfad.

</details>

### Abfragen starten

```
Du: "Fingerprinte alles an target.com — TLS, HTTP-Stack, WAF, DNS, offene Ports"
```

Das war's. Der Agent uebernimmt automatisch mehrschichtiges Fingerprinting, Signalkorrelation und Infrastrukturanalyse.

---

## Was die KI kann

### Schnelle Aufklaerung

```
Du: "Schnelle Aufklaerung auf target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: Ports 80, 443, 22 offen
       -> TLS: Let's Encrypt RSA-Zertifikat, TLS 1.2+1.3, nginx JARM-Signatur
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM konfiguriert
       -> WAF: Cloudflare erkannt (cf-ray Header)
       -> "target.com ist eine React SPA auf Express.js hinter nginx/1.24.0,
          bereitgestellt ueber Cloudflare CDN. TLS korrekt konfiguriert mit
          Let's Encrypt. SSH auf Port 22 mit OpenSSH 9.6. E-Mail
          wird von Google Workspace verwaltet mit vollstaendigem
          SPF/DKIM/DMARC."
```

### Tiefe TLS-Untersuchung

```
Du: "Analysiere die TLS-Konfiguration von suspicious-server.com im Detail"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Zertifikat: selbstsigniert, CN=localhost, seit 47 Tagen abgelaufen
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (stimmt mit Cobalt Strike Standardprofil ueberein)
       -> JA4X: Fingerprint stimmt mit bekanntem C2-Framework-Muster ueberein
       -> Cipher Suites: akzeptiert schwache Cipher (RC4, 3DES)
       -> SNI: antwortet identisch auf jeden SNI-Wert
       -> CT-Logs: Zertifikat nicht protokolliert (nicht oeffentlich vertrauenswuerdig)
       -> "HOHES RISIKO: TLS-Konfiguration deutet stark auf C2-Infrastruktur hin.
          Selbstsigniertes abgelaufenes Zertifikat, JARM-Fingerprint stimmt mit
          Cobalt Strike ueberein, akzeptiert schwache Cipher und antwortet auf
          beliebige SNI-Werte. Sofortige Untersuchung und Sperrung empfohlen."
```

### WAF-Umgehung und Ursprungserkennung

```
Du: "target.com ist hinter einer WAF. Kannst du den Ursprungsserver finden?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), Challenge-Seite bei verdaechtigen Anfragen
       -> DNS: A-Eintrag zeigt auf Cloudflare-IP 104.21.x.x
       -> Subdomains: dev.target.com loest zu 203.0.113.42 auf (nicht Cloudflare)
       -> Direktverbindung zu 203.0.113.42:443 gibt dasselbe TLS-Zertifikat zurueck
       -> SecurityTrails Historie: Ursprung war 203.0.113.42 vor Cloudflare
       -> "Ursprungs-IP gefunden: 203.0.113.42. Entdeckt ueber die Subdomain
          dev.target.com, die Cloudflare umgeht. Der Ursprung liefert dasselbe
          TLS-Zertifikat und antwortet auf den target.com Host-Header.
          Der Ursprung hat keinen WAF-Schutz — direkter Zugriff moeglich."
```

### Service-Erkennung auf einem Host

```
Du: "Welche Dienste laufen auf 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519-Hostschluessel
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, Authentifizierung erforderlich
       -> Port 5432: PostgreSQL 16.1, SSL erforderlich
       -> Port 6379: Redis 7.2.4, KEINE Authentifizierung (offen)
       -> Port 8080: Node.js Express Entwicklungsserver, CORS: *
       -> "KRITISCH: Redis auf Port 6379 hat keine Authentifizierung — jeder
          im Netzwerk kann Daten lesen/schreiben. Der Express Entwicklungsserver
          auf 8080 hat Wildcard-CORS. MySQL und PostgreSQL erfordern korrekt
          Authentifizierung. WordPress ist 2 Minor-Versionen zurueck.
          Sofortiges Handeln bei Redis und der Entwicklungsserver-Exposition
          erforderlich."
```

---

## Tool-Referenz (13 Tools, 103 Techniken)

<details open>
<summary><b>recon &mdash; Vollstaendige Aufklaerung mit tiefenbasierter Technikauswahl</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `url` | string | Ziel-URL zum Fingerprinting |
| `depth` | `quick` \| `standard` \| `deep` | Scan-Tiefe: quick=5 Techniken, standard=20, deep=50+ |

Orchestriert Techniken aller Anbieter basierend auf der Tiefenstufe. Der schnelle Modus gibt einen schnellen Ueberblick; der tiefe Modus fuehrt umfassendes Fingerprinting einschliesslich Enumeration, OSINT und Korrelation durch.

</details>

<details>
<summary><b>scan_ports &mdash; TCP-Port-Scanning mit Service-Erkennung (3 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `host` | string | Zielhost (IP oder Domain) |
| `ports` | number[] | Optional &mdash; bestimmte Ports zum Scannen (Standard: gaengige Ports) |

| Technik | Beschreibung |
|---------|--------------|
| `tcp_probe` | TCP-Connect-Scan zur Erkennung offener Ports |
| `tcp_banner` | Banner-Grabbing auf offenen Ports zur Service-Identifikation |
| `tcp_analysis` | Port-Kombinationsanalyse und Service-Inferenz |

</details>

<details>
<summary><b>scan_tls &mdash; Vollstaendige TLS/SSL-Analyse (8 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `host` | string | Zielhost (IP oder Domain) |
| `port` | number | Optional &mdash; TLS-Port (Standard: 443) |

| Technik | Beschreibung |
|---------|--------------|
| `tls_certificate` | X.509-Zertifikatsanalyse &mdash; Subjekt, Aussteller, SANs, Gueltigkeit, Kette |
| `tls_jarm` | JARM aktives Fingerprinting &mdash; 10 TLS Client Hello Probes, 62-Zeichen-Hash |
| `tls_ja4x` | JA4X passives TLS-Fingerprinting aus Zertifikatseigenschaften |
| `tls_ciphers` | Cipher-Suite-Enumeration und Staerkeanalyse |
| `tls_protocols` | Erkennung unterstuetzter TLS-Protokollversionen (SSLv3 bis TLS 1.3) |
| `tls_sni` | SNI-Verhaltenstest &mdash; Standard-Zertifikat vs. angeforderter Hostname |
| `tls_ct_logs` | Certificate Transparency Log-Abfrage ueber crt.sh |
| `tls_ocsp` | OCSP-Stapling und Sperrstatus-Pruefung |

</details>

<details>
<summary><b>scan_dns &mdash; DNS-Intelligence (7 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `domain` | string | Zieldomain |

| Technik | Beschreibung |
|---------|--------------|
| `dns_records` | Vollstaendige Eintragsauflistung &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF-, DKIM- und DMARC-Eintragsanalyse |
| `dns_saas` | SaaS/Service-Erkennung ueber CNAME- und MX-Muster (Slack, Zendesk usw.) |
| `dns_server` | DNS-Server-Fingerprinting (BIND, PowerDNS, Cloudflare usw.) |
| `dns_takeover` | Subdomain-Uebernahme-Erkennung durch Dangling-CNAME-Analyse |
| `dns_zone` | Zonentransferversuch (AXFR) |
| `dns_caa` | CAA-Eintragsanalyse fuer Zertifizierungsstellen-Beschraenkungen |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/Web-Fingerprinting (29 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `url` | string | Ziel-URL |

| Technik | Anbieter | Beschreibung |
|---------|----------|--------------|
| `http_headers` | HTTP | Antwort-Header-Analyse und Server-Identifikation |
| `http_header_order` | HTTP | Header-Reihenfolge-Fingerprint (Server-Software-Signatur) |
| `http_security_headers` | HTTP | Sicherheitsheader-Audit (CSP, HSTS, X-Frame-Options usw.) |
| `http_cookies` | HTTP | Cookie-Analyse &mdash; Flags, Praefixe, Framework-Erkennung |
| `http_methods` | HTTP | Erlaubte HTTP-Methoden-Enumeration (OPTIONS) |
| `http_cors` | HTTP | CORS-Richtlinienanalyse und Fehlkonfigurationserkennung |
| `http_compression` | HTTP | Unterstuetzte Kompressionsalgorithmen (gzip, br, zstd) |
| `http_caching` | HTTP | Cache-Header-Analyse (CDN, Reverse-Proxy-Erkennung) |
| `http_etag` | HTTP | ETag-Formatanalyse zur Backend-Identifikation |
| `http_error` | HTTP | Fehlerseiten-Fingerprinting (benutzerdefinierte vs. Standard-Fehlerseiten) |
| `http_redirect` | HTTP | Weiterleitungsketten-Analyse |
| `http_timing` | HTTP | Antwortzeit-Baseline fuer Server-Performance-Profiling |
| `http_favicon` | HTTP | Favicon-Hash (MurmurHash3) zur Technologie-Identifikation |
| `http_robots` | HTTP | robots.txt-Analyse und Extraktion gesperrter Pfade |
| `http_sitemap` | HTTP | Sitemap-Erkennung und URL-Extraktion |
| `http_wellknown` | HTTP | .well-known Endpunkt-Erkennung (security.txt, openid usw.) |
| `web_tech` | Web | Technologie-Erkennung ueber HTML/JS/CSS-Muster |
| `web_analytics` | Web | Analytics- und Tracking-Service-Erkennung |
| `web_sourcemaps` | Web | Source-Map-Datei-Erkennung |
| `web_websocket` | Web | WebSocket-Endpunkt-Erkennung |
| `web_graphql` | Web | GraphQL-Endpunkt-Erkennung und Introspektion |
| `web_spa` | Web | Single-Page-Application-Framework-Erkennung |
| `web_cdn` | Web | CDN-Erkennung ueber Antwort-Header und DNS |
| `web_meta` | Web | HTML-Meta-Tag-Analyse (Generator, Framework-Hinweise) |
| `web_feed` | Web | RSS/Atom-Feed-Erkennung |
| `h2_detect` | HTTP/2 | HTTP/2-Protokollunterstuetzungs-Erkennung |
| `h2_fingerprint` | HTTP/2 | HTTP/2-Server-Fingerprinting (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | HTTP/3 (QUIC) Unterstuetzungserkennung ueber Alt-Svc-Header |
| `app_cms` | Application | CMS-Erkennung (WordPress, Drupal, Joomla usw.) |

</details>

<details>
<summary><b>scan_paths &mdash; Pfad-Intelligence (5 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `url` | string | Ziel-URL |
| `categories` | string[] | Optional &mdash; zu pruefende Kategorien (sensitive, git, debug, api, config) |

| Technik | Beschreibung |
|---------|--------------|
| `path_sensitive` | Erkennung sensibler Dateien (Backup-Dateien, Konfigurationsdateien, Datenbank-Dumps) |
| `path_robots` | robots.txt- und sitemap.xml-Analyse zur Erkennung versteckter Pfade |
| `path_git` | Git-Repository-Leak-Erkennung (.git/HEAD, .git/config) |
| `path_debug` | Debug-Endpunkt-Erkennung (phpinfo, server-status, Debug-Konsolen) |
| `path_api` | API-Version und Dokumentationsendpunkt-Erkennung |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN-Erkennung und Fingerprinting (4 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `url` | string | Ziel-URL |

| Technik | Beschreibung |
|---------|--------------|
| `waf_detect` | WAF-Praesenz-Erkennung ueber Antwort-Header- und Verhaltensanalyse |
| `waf_cdn` | CDN-Anbieter-Identifikation (Cloudflare, Akamai, Fastly usw.) |
| `waf_fingerprint` | WAF-Produkt-Identifikation und Versionserkennung |
| `waf_origin` | Ursprungs-IP-Erkennung hinter WAF/CDN (erfordert `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Service-Level-Probing (12 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `host` | string | Zielhost (IP oder Domain) |
| `ports` | number[] | Optional &mdash; bestimmte Ports zum Probing |
| `service` | string | Optional &mdash; bestimmter Service zum Probing (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Technik | Anbieter | Beschreibung |
|---------|----------|--------------|
| `ssh_probe` | SSH | SSH-Protokollversion und Software-Erkennung |
| `ssh_algorithms` | SSH | SSH-Algorithmus-Audit (KEX, Cipher, MACs, Hostschluesseltypen) |
| `ssh_hostkey_lookup` | SSH | SSH-Hostschluessel-Abfrage ueber Shodan (erfordert `SHODAN_API_KEY`) |
| `svc_mysql` | Service | MySQL-Versionserkennung und Faehigkeits-Fingerprinting |
| `svc_postgres` | Service | PostgreSQL-Versionserkennung und SSL-Unterstuetzungspruefung |
| `svc_redis` | Service | Redis-Versionserkennung und Authentifizierungsstatus |
| `svc_ftp` | Service | FTP-Banner-Analyse und anonymer Login-Check |
| `svc_vnc_rdp` | Service | VNC/RDP-Service-Erkennung und Sicherheitsbewertung |
| `smtp_banner` | SMTP | SMTP-Banner-Analyse und MTA-Identifikation |
| `smtp_starttls` | SMTP | SMTP STARTTLS-Unterstuetzung und Zertifikatspruefung |
| `iot_detect` | IoT | IoT-Geraeteerkennung ueber Banner-Muster und Standardseiten |
| `iot_upnp` | IoT | UPnP/SSDP-Geraeteerkennung im lokalen Netzwerk |

</details>

<details>
<summary><b>enumerate &mdash; Scope-Erweiterung (8 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `domain` | string | Zieldomain |

| Technik | Beschreibung |
|---------|--------------|
| `enum_subdomains` | Subdomain-Enumeration ueber mehrere Methoden |
| `enum_wildcard` | Wildcard-DNS-Erkennung |
| `enum_tld` | TLD-Erweiterung (target.com -> target.net, target.org usw.) |
| `enum_related` | Verwandte Domain-Erkennung ueber gemeinsame Infrastruktur |
| `enum_asn` | ASN-Nachbarerkennung &mdash; andere Domains im selben Netzwerk |
| `enum_ct` | Certificate Transparency Log Subdomain-Extraktion |
| `enum_passive_dns` | Passive DNS-Historie (erfordert `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Scope-Zusammenfassung und Angriffsflaechen-Uebersicht |

</details>

<details>
<summary><b>osint &mdash; OSINT-Anreicherung (6 Techniken)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `target` | string | Anzureichernde IP-Adresse oder Domain |
| `type` | `ip` \| `domain` | Optional &mdash; Zieltyp (automatisch erkannt wenn ausgelassen) |

| Technik | Auth | Beschreibung |
|---------|------|--------------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan Host-Abfrage &mdash; offene Ports, Banner, Schwachstellen, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys Host-Daten &mdash; Services, TLS, autonomes System |
| `osint_reverse_ip` | Keine | Reverse-IP-Abfrage &mdash; andere Domains auf derselben IP |
| `osint_whois` | Keine | WHOIS-Registrierungsdaten &mdash; Registrar, Daten, Nameserver |
| `osint_webarchive` | Keine | Web Archive Historie &mdash; erster/letzter Snapshot, Aenderungshaeufigkeit |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal Domain/IP-Bericht &mdash; Erkennungen, Kategorien, DNS |

</details>

<details>
<summary><b>analyze &mdash; Passive Fingerprint-Analyse (3 Modi)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `type` | `headers` \| `html` \| `banner` | Zu analysierender Datentyp |
| `data` | string | Rohdaten zur Analyse (Header, HTML oder Banner-Ausgabe einfuegen) |

| Modus | Beschreibung |
|-------|--------------|
| `fp_analyze_headers` | Passive HTTP-Header-Analyse &mdash; Server-, Framework-, Proxy-Erkennung ohne Datenverkehr |
| `fp_analyze_html` | Passive HTML-Analyse &mdash; Technologie-Erkennung, Framework-Identifikation aus Quelltext |
| `fp_analyze_banner` | Passive Banner-Analyse &mdash; Service-Identifikation aus rohem Banner-Text |

</details>

<details>
<summary><b>correlate &mdash; Multi-Signal-Korrelationsengine (7 Modi)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Korrelationsmodus |
| `signals` | object | Zu korrelierende Fingerprint-Signale (variiert nach Modus) |

| Modus | Beschreibung |
|-------|--------------|
| `fp_consistency` | Schichtuebergreifende Signal-Konsistenzpruefung &mdash; stimmen TCP-, TLS-, HTTP- und DNS-Fingerprints ueberein? |
| `fp_honeypot` | Honeypot-Erkennung &mdash; prueft auf unmoegliche Service-Kombinationen und Verhaltensanomalien |
| `fp_spoofing` | Spoofing-Erkennung &mdash; identifiziert Diskrepanzen zwischen Server-Headern und tatsaechlichem Verhalten |
| `fp_compare` | Nebeneinander-Vergleich der Fingerprint-Profile zweier Hosts |
| `fp_topology` | Infrastruktur-Topologie-Mapping &mdash; CDN, Load Balancer, Reverse-Proxy-Kette |
| `fp_c2` | C2-Framework-Erkennung ueber JARM-, TLS-, HTTP- und Timing-Korrelation |
| `fp_identify` | Hash-basierte Identifikation gegen bekannte Signaturdatenbank |

</details>

<details>
<summary><b>meta &mdash; Server-Konfiguration und Daten (3 Modi)</b></summary>

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `category` | string | Optional &mdash; nach Kategorie filtern |

| Modus | Beschreibung |
|-------|--------------|
| `fp_sources` | Alle verfuegbaren Datenquellen mit Konfiguration und API-Schluessel-Status auflisten |
| `fp_config` | Server-Konfiguration &mdash; Version, geladene Anbieter, Technikanzahl |
| `fp_signatures` | Signaturdatenbank-Auflistung &mdash; JARM-, Banner-, WAF-, Anwendungssignaturen |

</details>

---

### CLI-Verwendung

```bash
# Alle verfuegbaren Tools und Techniken auflisten
npx fingerprint-mcp --list

# Jedes Tool direkt ausfuehren
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

# OSINT-Tools (erfordern API-Schluessel)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Datenquellen (21)

| Quelle | Auth | Bereitgestellte Daten |
|--------|------|-----------------------|
| TCP-Probing | Keine | Port-Scanning, Banner-Grabbing, Service-Erkennung |
| TLS/SSL-Analyse | Keine | Zertifikatsanalyse, JARM-Fingerprinting, JA4X, Cipher-Enumeration, SNI-Tests |
| SSH-Probing | Keine | Protokollversion, Algorithmus-Audit, Software-Erkennung |
| HTTP-Analyse | Keine | Header-Fingerprinting, Favicon-Hashing, Cookie-Analyse, Methoden-Enumeration, CORS |
| Web-Erkennung | Keine | Technologie-Erkennung, Analytics, Source Maps, WebSocket, GraphQL, SPA-Frameworks |
| Pfad-Erkennung | Keine | Sensible Dateien, Git-Leaks, Debug-Endpunkte, API-Versionen, robots.txt |
| DNS-Aufloesung | Keine | Eintrags-Enumeration, E-Mail-Auth-Analyse, SaaS-Erkennung, Server-Fingerprinting |
| WAF/CDN-Erkennung | Keine | WAF-Identifikation, CDN-Erkennung, WAF-Fingerprinting |
| Timing-Analyse | Keine | Antwortzeit-Baseline, Taktabweichungs-Erkennung |
| HTTP/2 & HTTP/3 | Keine | HTTP/2-Erkennung und Fingerprinting, HTTP/3 Alt-Svc-Erkennung |
| SMTP-Probing | Keine | SMTP-Banner-Analyse, STARTTLS-Pruefung |
| IoT/Embedded | Keine | IoT-Geraeteerkennung, UPnP/SSDP-Erkennung |
| Anwendungserkennung | Keine | CMS-, Framework- und E-Commerce-Plattform-Identifikation |
| Service-Probing | Keine | MySQL-, PostgreSQL-, Redis-, FTP-, VNC/RDP-Fingerprinting |
| Infrastruktur-Erkennung | Keine | Cloud-Anbieter-, Hosting-Anbieter-, CDN-Identifikation |
| Korrelationsengine | Keine | Signal-Konsistenz, Honeypot-Erkennung, Spoofing-Erkennung, Topologie-Mapping |
| Identifikationsengine | Keine | Hash-basierte Identifikation, C2-Erkennung, Signatur-Matching |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Host-Intelligence &mdash; offene Ports, Banner, Schwachstellen, OS-Erkennung |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Host-Daten &mdash; Services, TLS-Zertifikate, autonome Systeminformationen |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF-Ursprungserkennung, passive DNS-Historie, historische Eintraege |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Domain/IP-Reputation, Erkennungsergebnisse, DNS-Historie, Kategorien |

---

## Architektur

```
src/
  index.ts                # CLI-Einstiegspunkt (--help, --list, --tool, stdio-Server)
  protocol/
    mcp-server.ts         # MCP-Server-Setup (stdio-Transport)
    tools.ts              # Tool-Registry — alle 13 zusammengesetzten Tools hier registriert
  types/
    index.ts              # Gemeinsame Typen (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Anbieter-spezifischer Rate Limiter
    cache.ts              # TTL-Cache fuer API-Antworten
    require-key.ts        # API-Schluessel-Validierungshelfer
    murmurhash3.ts        # MurmurHash3 fuer Favicon-Hashing
  composite/              # 13 zusammengesetzte Tool-Orchestratoren
    recon.ts              # Vollstaendiger Aufklaerungs-Orchestrator (quick/standard/deep)
    scan-ports.ts         # Port-Scanning-Komposit
    scan-tls.ts           # TLS-Analyse-Komposit
    scan-dns.ts           # DNS-Intelligence-Komposit
    scan-http.ts          # HTTP-Fingerprinting-Komposit
    scan-paths.ts         # Pfad-Erkennungs-Komposit
    scan-waf.ts           # WAF/CDN-Erkennungs-Komposit
    scan-services.ts      # Service-Probing-Komposit
    analyze.ts            # Passive Analyse-Komposit
    correlate.ts          # Korrelationsengine-Komposit
    enumerate.ts          # Scope-Erweiterungs-Komposit
    osint.ts              # OSINT-Anreicherungs-Komposit
    meta.ts               # Server-Meta-Komposit
    helpers.ts            # Gemeinsame Komposit-Helfer
  tcp/                    # TCP-Probing-Techniken (3)
  tls/                    # TLS/SSL-Analyse-Techniken (8)
  ssh/                    # SSH-Probing-Techniken (3)
  http/                   # HTTP-Fingerprinting-Techniken (16)
  web/                    # Web-Technologie-Erkennungstechniken (9)
  path/                   # Pfad-Erkennungstechniken (5)
  dns/                    # DNS-Intelligence-Techniken (7)
  waf/                    # WAF/CDN-Erkennungstechniken (4)
  timing/                 # Timing-Analyse-Techniken (2)
  h2/                     # HTTP/2 & HTTP/3-Techniken (3)
  smtp/                   # SMTP-Probing-Techniken (2)
  iot/                    # IoT/Embedded-Erkennungstechniken (2)
  app/                    # Anwendungserkennungstechniken (3)
  service/                # Service-Probing-Techniken (5)
  infra/                  # Infrastruktur-Erkennungstechniken (3)
  correlation/            # Korrelationsengine (5)
  identify/               # Identifikationsengine (3)
  passive/                # Passive Analyse (3)
  osint/                  # OSINT-Anreicherungstechniken (6)
  enum/                   # Enumerationstechniken (8)
  meta/                   # Meta-Tools (3)
  data/                   # Signaturdatenbanken und Musterbibliotheken
    jarm-signatures.ts    # Bekannte JARM-Fingerprints (C2, Server, CDNs)
    waf-signatures.ts     # WAF-Erkennungssignaturen
    service-banners.ts    # Service-Banner-Muster
    tech-patterns.ts      # Technologie-Erkennungsmuster
    favicon-hashes.ts     # Bekannte Favicon-MurmurHash3-Werte
    c2-signatures.ts      # C2-Framework-Signaturen
    ...                   # 15+ Signatur-/Musterdatenbanken
```

**Design-Entscheidungen:**

- **13 zusammengesetzte Tools, 103 Techniken** &mdash; Der Agent ruft High-Level-Tools auf (`recon`, `scan_tls`, `scan_http`). Jedes Komposit orchestriert mehrere Low-Level-Techniken und gibt korrelierte Ergebnisse zurueck. Dies reduziert den Tool-Aufruf-Overhead bei Beibehaltung der Granularitaet.
- **21 Anbieter, 1 Server** &mdash; Jede Fingerprinting-Ebene ist ein unabhaengiges Modul. Der Komposit-Orchestrator waehlt Techniken basierend auf Kontext und Tiefe.
- **Aktiv-zuerst, OSINT-optional** &mdash; 80+ Techniken funktionieren durch direktes Probing des Ziels ohne API-Schluessel. OSINT-Anbieter (Shodan, Censys, VirusTotal, SecurityTrails) fuegen Anreicherung hinzu, sind aber nie erforderlich.
- **Anbieter-spezifische Rate Limiter** &mdash; Jeder Anbieter hat seine eigene `RateLimiter`-Instanz. Aktives Probing ist ratenbegrenzt, um Erkennung zu vermeiden; OSINT-APIs sind auf ihre Kontingente kalibriert.
- **TTL-Caching** &mdash; DNS-Eintraege (10 Min.), OSINT-Ergebnisse (15 Min.), CT-Logs (30 Min.) werden gecacht, um redundante Abfragen in Multi-Tool-Workflows zu vermeiden.
- **Graceful Degradation** &mdash; Fehlende API-Schluessel bringen den Server nicht zum Absturz. OSINT-Tools geben beschreibende Meldungen zurueck: "Setzen Sie SHODAN_API_KEY, um die Shodan Host-Abfrage zu aktivieren."
- **3 Abhaengigkeiten** &mdash; `@modelcontextprotocol/sdk`, `zod` und `cheerio`. Alle Netzwerk-I/O ueber natives `fetch()` und Node.js `net`/`tls`/`dns`-Module. Kein nmap, keine externen Binaries.

---

## Einschraenkungen

- OSINT-Tools (Shodan, Censys, VirusTotal, SecurityTrails) erfordern API-Schluessel fuer ihre jeweiligen Techniken
- Censys Free-Tier auf 250 Abfragen/Monat begrenzt
- VirusTotal Free-Tier auf 500 Abfragen/Tag begrenzt
- Port-Scanning verwendet TCP Connect (kein SYN-Scan) &mdash; weniger heimlich als nmap, erfordert aber keine Root-Rechte
- JARM-Fingerprinting erfordert direkten TCP-Zugang zum Ziel (kann durch Firewalls blockiert werden)
- UPnP/SSDP-Erkennung funktioniert nur in lokalen Netzwerken
- Service-Probing (MySQL, PostgreSQL, Redis) verbindet, authentifiziert aber nicht
- Subdomain-Enumeration basiert auf CT-Logs und passiven Quellen (kein Brute-Force)
- macOS / Linux getestet (Windows nicht getestet)

---

## Teil der MCP-Sicherheitssuite

| Projekt | Bereich | Tools |
|---------|---------|-------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Browser-basierte Sicherheitstests | 39 Tools, Firefox, Injection-Tests |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud-Sicherheit (AWS/Azure/GCP) | 38 Tools, 60+ Checks |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub-Sicherheitslage | 39 Tools, 45 Checks |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Schwachstellen-Intelligence | 23 Tools, 5 Quellen |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & Aufklaerung | 37 Tools, 12 Quellen |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Darknet & Bedrohungsintelligenz | 66 Tools, 16 Quellen |
| **fingerprint-mcp** | **Universelles digitales Fingerprinting** | **13 Tools, 103 Techniken, 21 Anbieter** |

---

<p align="center">
<b>Nur fuer autorisierte Sicherheitstests und -bewertungen.</b><br>
Stellen Sie immer sicher, dass Sie eine ordnungsgemaesse Autorisierung haben, bevor Sie Fingerprinting auf einem Ziel durchfuehren.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0-Lizenz</a> &bull; Erstellt mit Bun + TypeScript
</p>
