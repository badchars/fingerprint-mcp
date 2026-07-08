<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <strong>Dansk</strong> |
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

<h3 align="center">Universel digital fingerprinting til AI-agenter.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, servicesondering, JARM, JA4X, favicon-hashing, infrastrukturtopologi, C2-detektion, OSINT-berigelse &mdash; samlet i en enkelt MCP-server.<br>
  Din AI-agent far <b>fingerprinting i fuldt spektrum pa forlangende</b>, ikke 11 adskilte CLI-vaerktoejer og manuel korrelation.
</p>

<br>

<p align="center">
  <a href="#problemet">Problemet</a> &bull;
  <a href="#hvordan-det-er-anderledes">Hvordan Det Er Anderledes</a> &bull;
  <a href="#hurtig-start">Hurtig Start</a> &bull;
  <a href="#hvad-aien-kan-goere">Hvad AI'en Kan Gore</a> &bull;
  <a href="#vaerktoejsreference-13-vaerktojer-103-teknikker">Vaerktojer (13)</a> &bull;
  <a href="#datakilder-21">Datakilder</a> &bull;
  <a href="#arkitektur">Arkitektur</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Bidrag</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licens"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Vaerktojer">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Teknikker">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp demo" width="800">
</p>

---

## Problemet

At fingerprinte en server i dag betyder at jonglere med et dusin adskilte vaerktojer. Du koerer `nmap` til portscanning, `testssl.sh` til certifikatanalyse, `curl -I` til HTTP-headere, `dig` til DNS, `wafw00f` til WAF-detektion, `ssh-audit` til SSH, et separat JARM-vaerktoj, Wappalyzer til teknologidetektion &mdash; og sa bruger du 30 minutter pa manuelt at krydsreferere alt i et regneark for at finde ud af, hvad der rent faktisk koerer.

```
Traditionel fingerprinting-arbejdsgang:
  analyser TLS-certifikater      ->  testssl.sh / openssl s_client
  hent HTTP-headere              ->  curl -I
  detekter webteknologier        ->  wappalyzer CLI
  DNS-rekognoscering             ->  dig / nslookup / dnsenum
  portscanning                   ->  nmap -sV
  WAF-detektion                  ->  wafw00f
  SSH-audit                      ->  ssh-audit
  servicefingerprinting          ->  nmap scripts
  JARM-fingerprint               ->  jarm (separat vaerktoj)
  tjek OSINT-databaser           ->  shodan CLI, censys CLI
  korreler alt                   ->  manuelt i et regneark
  ──────────────────────────────
  Total: 11 vaerktojer, 30+ minutter, manuel korrelation
```

**fingerprint-mcp** giver din AI-agent 13 sammensatte vaerktojer, der omslutter 103 fingerprinting-teknikker pa tvaers af 21 udbydere via [Model Context Protocol](https://modelcontextprotocol.io). Agenten koerer multi-lag fingerprinting parallelt, korrelerer signaler pa tvaers af TCP/TLS/HTTP/DNS/SSH-lag, detekterer honeypots og C2-infrastruktur og praesenterer et samlet efterretningsbillede &mdash; i en enkelt samtale.

```
Med fingerprint-mcp:
  Du: "Lav en dyb rekognoscering pa target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
            Let's Encrypt-certifikat, 2 SAN'er, TLS 1.2+1.3
         -> HTTP: Express.js bag Cloudflare WAF,
            React SPA, Google Analytics, 14 sikkerhedsheadere analyseret
         -> DNS: A/AAAA/MX/TXT-poster, SPF/DKIM/DMARC konfigureret,
            Slack + Google Workspace detekteret via CNAME/MX
         -> Porte: 80, 443, 22 (OpenSSH 9.6), 8080 (udviklingsserver)
         -> WAF: Cloudflare detekteret, oprindelse-IP opdaget via direkte forbindelse
         -> Optaelling: 12 underdomaener via CT-logfiler, wildcard-DNS detekteret
         -> "target.com koerer nginx/1.24.0 med Express.js bag
            Cloudflare WAF. Oprindelse-IP 203.0.113.42 eksponeret pa port 8080.
            TLS er korrekt konfigureret (A+ aequivalent), men udviklingsserveren
            pa 8080 har ingen WAF-beskyttelse. 3 underdomaener peger pa
            nedlagt infrastruktur — potentiel overtagelsesrisiko."
```

---

## Hvordan Det Er Anderledes

Eksisterende vaerktojer giver dig ra data et lag ad gangen. fingerprint-mcp giver din AI-agent evnen til at **raesonnere pa tvaers af alle fingerprinting-lag samtidigt**.

<table>
<thead>
<tr>
<th></th>
<th>Traditionel Tilgang</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Graenseflade</b></td>
<td>11 forskellige CLI-vaerktojer med forskellige outputformater</td>
<td>MCP &mdash; AI-agenten kalder vaerktojer konversationelt</td>
</tr>
<tr>
<td><b>Teknikker</b></td>
<td>Et vaerktoj, et lag ad gangen</td>
<td>103 teknikker pa tvaers af 21 udbydere, koert parallelt</td>
</tr>
<tr>
<td><b>TLS-analyse</b></td>
<td>testssl.sh-output, manuel JARM-parsing separat</td>
<td>Agenten kombinerer certifikat + JARM + JA4X + cipher suites + SNI + CT-logfiler i et kald</td>
</tr>
<tr>
<td><b>Korrelation</b></td>
<td>Kopier-indsaet resultater i et regneark</td>
<td>Agenten krydskorrelerer: "JARM matcher kendt C2-framework, HTTP-timing bekraefter honeypot"</td>
</tr>
<tr>
<td><b>WAF-bypass</b></td>
<td>wafw00f detekterer WAF, du leder manuelt efter oprindelse</td>
<td>Agenten detekterer WAF, opdager oprindelse-IP og verificerer, at den serverer det samme indhold</td>
</tr>
<tr>
<td><b>API-noegler</b></td>
<td>Kraevet til Shodan, Censys osv.</td>
<td>80+ aktive teknikker virker uden nogen API-noegler; noegler laaser OSINT-berigelse op</td>
</tr>
<tr>
<td><b>Opsaetning</b></td>
<td>Installer nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; en kommando, nul konfiguration</td>
</tr>
</tbody>
</table>

---

## Hurtig Start

### Mulighed 1: npx (ingen installation)

```bash
npx fingerprint-mcp
```

Alle 80+ aktive fingerprinting-teknikker virker med det samme. Ingen API-noegler kraevet til TCP, TLS, SSH, HTTP, DNS, WAF, sti-, service-, timing-, IoT-, SMTP- og applikationsfingerprinting.

### Mulighed 2: Klon

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Miljovariabler (valgfrie)

```bash
# OSINT-berigelse (alle valgfrie — aktiv fingerprinting virker uden nogen noegler)
export SHODAN_API_KEY=your-key           # Aktiverer osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Aktiverer osint_censys (gratis: 250 forepoergsler/maned)
export CENSYS_API_SECRET=your-secret     # Censys API-hemmelighed
export SECURITYTRAILS_API_KEY=your-key   # Aktiverer waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Aktiverer osint_virustotal (gratis: 500 forepoergsler/dag)
```

Alle API-noegler er valgfrie. Uden dem far du stadig fuld TCP/TLS/SSH/HTTP/DNS/WAF/sti/service/timing/IoT/SMTP/infrastruktur/applikations-fingerprinting, korrelation, passiv analyse, optaelling og metavaerktojer &mdash; 80+ teknikker der virker ved direkte at sondere malet.

### Forbind til din AI-agent

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Med npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Med lokal klon
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Tilfoej til `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / andre MCP-klienter</b></summary>

Samme JSON-konfigurationsformat. Peg kommandoen til `npx fingerprint-mcp` eller din lokale installationssti.

</details>

### Begynd at forepoerge

```
Du: "Fingerprint alt om target.com — TLS, HTTP-stak, WAF, DNS, abne porte"
```

Det er det. Agenten handterer multi-lag fingerprinting, signalkorrelation og infrastrukturanalyse automatisk.

---

## Hvad AI'en Kan Gore

### Hurtig Rekognoscering

```
Du: "Hurtig rekognoscering pa target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: porte 80, 443, 22 abne
       -> TLS: Let's Encrypt RSA-certifikat, TLS 1.2+1.3, nginx JARM-signatur
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM konfigureret
       -> WAF: Cloudflare detekteret (cf-ray header)
       -> "target.com er en React SPA pa Express.js bag nginx/1.24.0,
          serveret gennem Cloudflare CDN. TLS korrekt konfigureret med
          Let's Encrypt. SSH pa port 22 koerer OpenSSH 9.6. E-mail
          handteret af Google Workspace med fuld SPF/DKIM/DMARC."
```

### Dybdegaende TLS-Undersogelse

```
Du: "Analyser TLS-konfigurationen af suspicious-server.com i detaljer"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Certifikat: selvsigneret, CN=localhost, udlobet for 47 dage siden
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (matcher Cobalt Strike standardprofil)
       -> JA4X: fingerprint matcher kendt C2-framework-monster
       -> Cipher suites: accepterer svage ciphers (RC4, 3DES)
       -> SNI: svarer identisk pa enhver SNI-vaerdi
       -> CT-logfiler: certifikat ikke logget (ikke offentligt betroet)
       -> "HOJ RISIKO: TLS-konfiguration indikerer staerkt C2-infrastruktur.
          Selvsigneret udlobet certifikat, JARM-fingerprint matcher Cobalt Strike,
          accepterer svage ciphers og svarer pa vilkarlige SNI-vaerdier.
          Anbefaler ojebliklig undersogelse og blokering."
```

### WAF-Bypass og Oprindelsesopdagelse

```
Du: "target.com er bag en WAF. Kan du finde oprindelsesserveren?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), udfordringsside pa mistanksomme anmodninger
       -> DNS: A-post peger pa Cloudflare IP 104.21.x.x
       -> Underdomaener: dev.target.com resolver til 203.0.113.42 (ikke-Cloudflare)
       -> Direkte forbindelse til 203.0.113.42:443 returnerer samme TLS-certifikat
       -> SecurityTrails historik: oprindelse var 203.0.113.42 for Cloudflare
       -> "Oprindelse-IP fundet: 203.0.113.42. Opdaget via dev.target.com
          underdomaene som omgar Cloudflare. Oprindelsen serverer det samme
          TLS-certifikat og svarer pa target.com Host-headeren.
          Oprindelsen har ingen WAF-beskyttelse — direkte adgang mulig."
```

### Serviceopdagelse pa en Vaert

```
Du: "Hvilke services koerer pa 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519 vaertsnogle
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, godkendelse kraevet
       -> Port 5432: PostgreSQL 16.1, SSL kraevet
       -> Port 6379: Redis 7.2.4, INGEN godkendelse (aben)
       -> Port 8080: Node.js Express udviklingsserver, CORS: *
       -> "KRITISK: Redis pa port 6379 har ingen godkendelse — enhver pa
          netvaerket kan laese/skrive data. Express udviklingsserveren pa 8080
          har wildcard CORS. MySQL og PostgreSQL kraever korrekt godkendelse.
          WordPress er 2 mindre versioner bagud. Ojebliklig handling nodvendig
          pa Redis og udviklingsservereksponering."
```

---

## Vaerktoejsreference (13 vaerktojer, 103 teknikker)

<details open>
<summary><b>recon &mdash; Fuld rekognoscering med dybdebaseret teknikvalg</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL til fingerprinting |
| `depth` | `quick` \| `standard` \| `deep` | Scanningsdybde: quick=5 teknikker, standard=20, deep=50+ |

Orkestrerer teknikker fra alle udbydere baseret pa dybdeniveau. Hurtig tilstand giver et hurtigt overblik; dyb tilstand koerer udtommende fingerprinting inklusive optaelling, OSINT og korrelation.

</details>

<details>
<summary><b>scan_ports &mdash; TCP-portscanning med servicedetektion (3 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvaert (IP eller domaene) |
| `ports` | number[] | Valgfri &mdash; specifikke porte at scanne (standard: almindelige porte) |

| Teknik | Beskrivelse |
|--------|-------------|
| `tcp_probe` | TCP connect-scanning til at detektere abne porte |
| `tcp_banner` | Banner-opsamling pa abne porte til serviceidentifikation |
| `tcp_analysis` | Portkombinationsanalyse og serviceinferens |

</details>

<details>
<summary><b>scan_tls &mdash; Komplet TLS/SSL-analyse (8 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvaert (IP eller domaene) |
| `port` | number | Valgfri &mdash; TLS-port (standard: 443) |

| Teknik | Beskrivelse |
|--------|-------------|
| `tls_certificate` | X.509-certifikatparsing &mdash; emne, udsteder, SAN'er, gyldighed, kaede |
| `tls_jarm` | JARM aktiv fingerprinting &mdash; 10 TLS Client Hello-sonder, 62-tegns hash |
| `tls_ja4x` | JA4X passiv TLS-fingerprinting fra certifikategenskaber |
| `tls_ciphers` | Cipher suite-optaelling og styrkeanalyse |
| `tls_protocols` | Understottet TLS-protokolversionsdetektion (SSLv3 til TLS 1.3) |
| `tls_sni` | SNI-adfaerdstest &mdash; standardcertifikat vs. anmodet vaertsnavn |
| `tls_ct_logs` | Certificate Transparency-logopslag via crt.sh |
| `tls_ocsp` | OCSP-stapling og tilbagekaldelsesstatustjek |

</details>

<details>
<summary><b>scan_dns &mdash; DNS-efterretning (7 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `domain` | string | Maldomaene |

| Teknik | Beskrivelse |
|--------|-------------|
| `dns_records` | Fuld postoptaelling &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF-, DKIM- og DMARC-postanalyse |
| `dns_saas` | SaaS/servicedetektion via CNAME- og MX-monstre (Slack, Zendesk osv.) |
| `dns_server` | DNS-serverfingerprinting (BIND, PowerDNS, Cloudflare osv.) |
| `dns_takeover` | Underdomaene-overtagelsesdetektion via dinglende CNAME-analyse |
| `dns_zone` | Zoneoverforselsforsoeg (AXFR) |
| `dns_caa` | CAA-postanalyse for certifikatmyndighedsrestriktioner |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/web-fingerprinting (29 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |

| Teknik | Udbyder | Beskrivelse |
|--------|---------|-------------|
| `http_headers` | HTTP | Svarheaderanalyse og serveridentifikation |
| `http_header_order` | HTTP | Header-rae kkefoelge-fingerprint (serversoftwaresignatur) |
| `http_security_headers` | HTTP | Sikkerhedsheaderaudit (CSP, HSTS, X-Frame-Options osv.) |
| `http_cookies` | HTTP | Cookieanalyse &mdash; flag, praefikser, frameworkdetektion |
| `http_methods` | HTTP | Tilladte HTTP-metodeoptaelling (OPTIONS) |
| `http_cors` | HTTP | CORS-politikanalyse og fejlkonfigurationsdetektion |
| `http_compression` | HTTP | Understoettede komprimeringsalgoritmer (gzip, br, zstd) |
| `http_caching` | HTTP | Cache-headeranalyse (CDN, reverse proxy-detektion) |
| `http_etag` | HTTP | ETag-formatanalyse til backendidentifikation |
| `http_error` | HTTP | Fejlsidefingerprinting (brugerdefinerede vs. standardfejlsider) |
| `http_redirect` | HTTP | Omdirigeringskaedeanalyse |
| `http_timing` | HTTP | Svartimingbaseline til serverydelsesprofilering |
| `http_favicon` | HTTP | Favicon-hash (MurmurHash3) til teknologiidentifikation |
| `http_robots` | HTTP | robots.txt-parsing og ekstraktion af forbudte stier |
| `http_sitemap` | HTTP | Sitemap-opdagelse og URL-ekstraktion |
| `http_wellknown` | HTTP | .well-known-endpunktsopdagelse (security.txt, openid osv.) |
| `web_tech` | Web | Teknologidetektion via HTML/JS/CSS-monstre |
| `web_analytics` | Web | Analyse- og sporingsservicedetektion |
| `web_sourcemaps` | Web | Source map-filopdagelse |
| `web_websocket` | Web | WebSocket-endpunktsdetektion |
| `web_graphql` | Web | GraphQL-endpunktsdetektion og introspektion |
| `web_spa` | Web | Single-page applikations-frameworkdetektion |
| `web_cdn` | Web | CDN-detektion via svarheadere og DNS |
| `web_meta` | Web | HTML-metatagsanalyse (generator, framework-hints) |
| `web_feed` | Web | RSS/Atom-feedopdagelse |
| `h2_detect` | HTTP/2 | HTTP/2-protokolunderstoettelsesdetektion |
| `h2_fingerprint` | HTTP/2 | HTTP/2-serverfingerprinting (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | HTTP/3 (QUIC)-understottelsesdetektion via Alt-Svc-header |
| `app_cms` | Application | CMS-detektion (WordPress, Drupal, Joomla osv.) |

</details>

<details>
<summary><b>scan_paths &mdash; Stiefterretning (5 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |
| `categories` | string[] | Valgfri &mdash; kategorier at tjekke (sensitive, git, debug, api, config) |

| Teknik | Beskrivelse |
|--------|-------------|
| `path_sensitive` | Opdagelse af folsomme filer (backupfiler, konfigurationsfiler, databasedumps) |
| `path_robots` | robots.txt- og sitemap.xml-analyse for skjulte stier |
| `path_git` | Git-repositorylaekdetektion (.git/HEAD, .git/config) |
| `path_debug` | Debugendpunktsopdagelse (phpinfo, server-status, debugkonsoller) |
| `path_api` | API-version og dokumentationsendpunktsopdagelse |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN-detektion og fingerprinting (4 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |

| Teknik | Beskrivelse |
|--------|-------------|
| `waf_detect` | WAF-tilstedevaerelsedetektionen via svarheader- og adfaerdsanalyse |
| `waf_cdn` | CDN-udbyderidentifikation (Cloudflare, Akamai, Fastly osv.) |
| `waf_fingerprint` | WAF-produktidentifikation og versionsdetektion |
| `waf_origin` | Oprindelse-IP-opdagelse bag WAF/CDN (kraever `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Serviceniveausondering (12 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvaert (IP eller domaene) |
| `ports` | number[] | Valgfri &mdash; specifikke porte at sondere |
| `service` | string | Valgfri &mdash; specifik service at sondere (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Teknik | Udbyder | Beskrivelse |
|--------|---------|-------------|
| `ssh_probe` | SSH | SSH-protokolversion og softwaaredetektion |
| `ssh_algorithms` | SSH | SSH-algoritmeaudit (KEX, ciphers, MAC'er, vaertsnogletyper) |
| `ssh_hostkey_lookup` | SSH | SSH-vaertsnogleopslag via Shodan (kraever `SHODAN_API_KEY`) |
| `svc_mysql` | Service | MySQL-versionsdetektion og kapabilitetsfingerprinting |
| `svc_postgres` | Service | PostgreSQL-versionsdetektion og SSL-understo ttelsetjek |
| `svc_redis` | Service | Redis-versionsdetektion og godkendelsesstatus |
| `svc_ftp` | Service | FTP-banneranalyse og anonymt logintjek |
| `svc_vnc_rdp` | Service | VNC/RDP-servicedetektion og sikkerhedsvurdering |
| `smtp_banner` | SMTP | SMTP-banneranalyse og MTA-identifikation |
| `smtp_starttls` | SMTP | SMTP STARTTLS-understoettelse og certifikatinspektion |
| `iot_detect` | IoT | IoT-enhedsdetektion via bannermonstre og standardsider |
| `iot_upnp` | IoT | UPnP/SSDP-enhedsopdagelse pa lokalt netvaerk |

</details>

<details>
<summary><b>enumerate &mdash; Omfangsudvidelse (8 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `domain` | string | Maldomaene |

| Teknik | Beskrivelse |
|--------|-------------|
| `enum_subdomains` | Underdomaeneoptaelling via flere metoder |
| `enum_wildcard` | Wildcard-DNS-detektion |
| `enum_tld` | TLD-udvidelse (target.com -> target.net, target.org osv.) |
| `enum_related` | Relateret domaeneopdagelse via delt infrastruktur |
| `enum_asn` | ASN-naboopdagelse &mdash; andre domaener pa samme netvaerk |
| `enum_ct` | Certificate Transparency-logunderdomaeneedstraktion |
| `enum_passive_dns` | Passiv DNS-historik (kraever `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Omfangsresume og angrebsoverfladeoverblik |

</details>

<details>
<summary><b>osint &mdash; OSINT-berigelse (6 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `target` | string | IP-adresse eller domaene at berige |
| `type` | `ip` \| `domain` | Valgfri &mdash; maltype (automatisk detekteret hvis udeladt) |

| Teknik | Auth | Beskrivelse |
|--------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan-vaertopslag &mdash; abne porte, bannere, sarbarheder, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys-vaertdata &mdash; services, TLS, autonomt system |
| `osint_reverse_ip` | Ingen | Omvendt IP-opslag &mdash; andre domaener pa samme IP |
| `osint_whois` | Ingen | WHOIS-registreringsdata &mdash; registrar, datoer, navneservere |
| `osint_webarchive` | Ingen | Web Archive-historik &mdash; forste/sidste snapshot, aendringsfrekvens |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal domaene/IP-rapport &mdash; detektioner, kategorier, DNS |

</details>

<details>
<summary><b>analyze &mdash; Passiv fingerprintanalyse (3 tilstande)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Type data at analysere |
| `data` | string | Ra data at analysere (indsaet headere, HTML eller banneroutput) |

| Tilstand | Beskrivelse |
|----------|-------------|
| `fp_analyze_headers` | Passiv HTTP-headeranalyse &mdash; server-, framework-, proxydetektion uden at sende trafik |
| `fp_analyze_html` | Passiv HTML-analyse &mdash; teknologidetektion, frameworkidentifikation fra kilde |
| `fp_analyze_banner` | Passiv banneranalyse &mdash; serviceidentifikation fra ra bannertekst |

</details>

<details>
<summary><b>correlate &mdash; Multi-signal korrelationsmotor (7 tilstande)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Korrelationstilstand |
| `signals` | object | Fingerprintsignaler at korrelere (varierer efter tilstand) |

| Tilstand | Beskrivelse |
|----------|-------------|
| `fp_consistency` | Kryds-lag signalkonsistenstjek &mdash; stemmer TCP-, TLS-, HTTP- og DNS-fingerprints overens? |
| `fp_honeypot` | Honeypotdetektion &mdash; tjekker for umulige servicekombinationer og adfaerdsanomalier |
| `fp_spoofing` | Spoofingdetektion &mdash; identificerer uoverensstemmende serverheadere vs. faktisk adfaerd |
| `fp_compare` | Side-om-side sammenligning af to vaerters fingerprintprofiler |
| `fp_topology` | Infrastrukturtopologikortlaegning &mdash; CDN, load balancer, reverse proxy-kaede |
| `fp_c2` | C2-frameworkdetektion via JARM, TLS, HTTP og timingkorrelation |
| `fp_identify` | Hash-baseret identifikation mod kendt signaturdatabase |

</details>

<details>
<summary><b>meta &mdash; Serverkonfiguration og data (3 tilstande)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `category` | string | Valgfri &mdash; filtrer efter kategori |

| Tilstand | Beskrivelse |
|----------|-------------|
| `fp_sources` | Liste over alle tilgaengelige datakilder med konfiguration og API-noglestatus |
| `fp_config` | Serverkonfiguration &mdash; version, indlaeste udbydere, teknikantal |
| `fp_signatures` | Signaturdatabaseliste &mdash; JARM-, banner-, WAF-, applikationssignaturer |

</details>

---

### CLI-brug

```bash
# List alle tilgaengelige vaerktojer og teknikker
npx fingerprint-mcp --list

# Koer et vilkarligt vaerktoj direkte
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

# OSINT-vaerktojer (kraever API-noegler)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Datakilder (21)

| Kilde | Auth | Hvad den giver |
|-------|------|----------------|
| TCP-sondering | Ingen | Portscanning, banneropsamling, servicedetektion |
| TLS/SSL-analyse | Ingen | Certifikatparsing, JARM-fingerprinting, JA4X, cipheroptaelling, SNI-test |
| SSH-sondering | Ingen | Protokolversion, algoritmeaudit, softwaredetektion |
| HTTP-analyse | Ingen | Headerfingerprinting, favicon-hashing, cookieanalyse, metodeoptaelling, CORS |
| Webdetektion | Ingen | Teknologidetektion, analytics, source maps, WebSocket, GraphQL, SPA-frameworks |
| Stiopdagelse | Ingen | Folsomme filer, git-laek, debugendpunkter, API-versioner, robots.txt |
| DNS-oplosning | Ingen | Postoptaelling, e-mail-auth-analyse, SaaS-detektion, serverfingerprinting |
| WAF/CDN-detektion | Ingen | WAF-identifikation, CDN-detektion, WAF-fingerprinting |
| Timinganalyse | Ingen | Svartimingbaseline, urafvigelsesdetektion |
| HTTP/2 og HTTP/3 | Ingen | HTTP/2-detektion og fingerprinting, HTTP/3 Alt-Svc-opdagelse |
| SMTP-sondering | Ingen | SMTP-banneranalyse, STARTTLS-inspektion |
| IoT/Embedded | Ingen | IoT-enhedsdetektion, UPnP/SSDP-opdagelse |
| Applikationsdetektion | Ingen | CMS-, framework- og e-handelsplatformidentifikation |
| Servicesondering | Ingen | MySQL, PostgreSQL, Redis, FTP, VNC/RDP-fingerprinting |
| Infrastrukturdetektion | Ingen | Cloudprovider-, hostingprovider-, CDN-identifikation |
| Korrelationsmotor | Ingen | Signalkonsistens, honeypotdetektion, spoofingdetektion, topologikortlaegning |
| Identifikationsmotor | Ingen | Hash-baseret identifikation, C2-detektion, signaturmatchning |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Vaertefterretning &mdash; abne porte, bannere, sarbarheder, OS-detektion |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Vaertdata &mdash; services, TLS-certifikater, autonomt systeminfo |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF-oprindelsesopdagelse, passiv DNS-historik, historiske poster |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Domaene/IP-omdoemme, detektionsresultater, DNS-historik, kategorier |

---

## Arkitektur

```
src/
  index.ts                # CLI-indgangspunkt (--help, --list, --tool, stdio-server)
  protocol/
    mcp-server.ts         # MCP-serveropsaetning (stdio-transport)
    tools.ts              # Vaerktoejsregister — alle 13 sammensatte vaerktojer registreret her
  types/
    index.ts              # Delte typer (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Rate limiter per udbyder
    cache.ts              # TTL-cache til API-svar
    require-key.ts        # API-noglevalideringshelper
    murmurhash3.ts        # MurmurHash3 til favicon-hashing
  composite/              # 13 sammensatte vaerktoejsorkestrorer
    recon.ts              # Fuld rekognosceringsorkestrorer (quick/standard/deep)
    scan-ports.ts         # Portscanning sammensat
    scan-tls.ts           # TLS-analyse sammensat
    scan-dns.ts           # DNS-efterretning sammensat
    scan-http.ts          # HTTP-fingerprinting sammensat
    scan-paths.ts         # Stiopdagelse sammensat
    scan-waf.ts           # WAF/CDN-detektion sammensat
    scan-services.ts      # Servicesondering sammensat
    analyze.ts            # Passiv analyse sammensat
    correlate.ts          # Korrelationsmotor sammensat
    enumerate.ts          # Omfangsudvidelse sammensat
    osint.ts              # OSINT-berigelse sammensat
    meta.ts               # Server-meta sammensat
    helpers.ts            # Delte sammensatte hjelpere
  tcp/                    # TCP-sonderingsteknikker (3)
  tls/                    # TLS/SSL-analyseteknikker (8)
  ssh/                    # SSH-sonderingsteknikker (3)
  http/                   # HTTP-fingerprintingteknikker (16)
  web/                    # Webteknologidetektionsteknikker (9)
  path/                   # Stiopdagelsesteknikker (5)
  dns/                    # DNS-efterretningsteknikker (7)
  waf/                    # WAF/CDN-detektionsteknikker (4)
  timing/                 # Timinganalyseteknikker (2)
  h2/                     # HTTP/2 og HTTP/3-teknikker (3)
  smtp/                   # SMTP-sonderingsteknikker (2)
  iot/                    # IoT/embedded-detektionsteknikker (2)
  app/                    # Applikationsdetektionsteknikker (3)
  service/                # Servicesonderingsteknikker (5)
  infra/                  # Infrastrukturdetektionsteknikker (3)
  correlation/            # Korrelationsmotor (5)
  identify/               # Identifikationsmotor (3)
  passive/                # Passiv analyse (3)
  osint/                  # OSINT-berigelsesteknikker (6)
  enum/                   # Optaellingsteknikker (8)
  meta/                   # Metavaerktojer (3)
  data/                   # Signaturdatabaser og monsterbiblioteker
    jarm-signatures.ts    # Kendte JARM-fingerprints (C2, servere, CDN'er)
    waf-signatures.ts     # WAF-detektionssignaturer
    service-banners.ts    # Servicebannermonstre
    tech-patterns.ts      # Teknologidetektionsmonstre
    favicon-hashes.ts     # Kendte favicon MurmurHash3-vaerdier
    c2-signatures.ts      # C2-frameworksignaturer
    ...                   # 15+ signatur-/monsterdatabaser
```

**Designbeslutninger:**

- **13 sammensatte vaerktojer, 103 teknikker** &mdash; Agenten kalder hoejniveauvaerktojer (`recon`, `scan_tls`, `scan_http`). Hvert sammensat vaerktoj orkestrerer flere lavniveauteknikker og returnerer korrelerede resultater. Dette reducerer overhead for vaerktoejskald, mens granulariteten bevares.
- **21 udbydere, 1 server** &mdash; Hvert fingerprinting-lag er et uafhaengigt modul. Den sammensatte orkestrator vaelger teknikker baseret pa kontekst og dybde.
- **Aktiv forst, OSINT valgfri** &mdash; 80+ teknikker virker ved direkte at sondere malet uden nogen API-noegler. OSINT-udbydere (Shodan, Censys, VirusTotal, SecurityTrails) tilfojer berigelse, men er aldrig paakraevet.
- **Rate limiters per udbyder** &mdash; Hver udbyder har sin egen `RateLimiter`-instans. Aktiv sondering er hastighedsbegraenset for at undga detektion; OSINT API'er er kalibreret til deres kvoter.
- **TTL-caching** &mdash; DNS-poster (10min), OSINT-resultater (15min), CT-logfiler (30min) caches for at undga overflodige opslag under multi-vaerktoejs arbejdsgange.
- **Graceful degradation** &mdash; Manglende API-noegler crasher ikke serveren. OSINT-vaerktojer returnerer beskrivende meddelelser: "Indstil SHODAN_API_KEY for at aktivere Shodan-vaertopslag."
- **3 afhaengigheder** &mdash; `@modelcontextprotocol/sdk`, `zod` og `cheerio`. Alt netvaerks-I/O via native `fetch()` og Node.js `net`/`tls`/`dns`-moduler. Ingen nmap, ingen eksterne binaerer.

---

## Begraensninger

- OSINT-vaerktojer (Shodan, Censys, VirusTotal, SecurityTrails) kraever API-noegler til deres respektive teknikker
- Censys gratis niveau er begraenset til 250 forepoergsler/maned
- VirusTotal gratis niveau er begraenset til 500 forepoergsler/dag
- Portscanning bruger TCP connect (ikke SYN-scanning) &mdash; mindre diskret end nmap, men kraever ingen root-privilegier
- JARM-fingerprinting kraever direkte TCP-adgang til malet (kan vaere blokeret af firewalls)
- UPnP/SSDP-opdagelse virker kun pa lokale netvaerk
- Servicesondering (MySQL, PostgreSQL, Redis) forbinder, men autentificerer ikke
- Underdomaeneoptaelling er baseret pa CT-logfiler og passive kilder (ingen brute-force)
- macOS / Linux testet (Windows ikke testet)

---

## Del af MCP-sikkerhedspakken

| Projekt | Domaene | Vaerktojer |
|---------|---------|------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Browserbaseret sikkerhedstest | 39 vaerktojer, Firefox, injektionstest |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloudsikkerhed (AWS/Azure/GCP) | 38 vaerktojer, 60+ tjek |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub sikkerhedsposition | 39 vaerktojer, 45 tjek |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Sarbarhedsefterretning | 23 vaerktojer, 5 kilder |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT og rekognoscering | 37 vaerktojer, 12 kilder |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web og trusselefterretning | 66 vaerktojer, 16 kilder |
| **fingerprint-mcp** | **Universel digital fingerprinting** | **13 vaerktojer, 103 teknikker, 21 udbydere** |

---

<p align="center">
<b>Kun til autoriseret sikkerhedstest og vurdering.</b><br>
Soerg altid for at have korrekt autorisation, for du udforer fingerprinting pa et mal.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0-licens</a> &bull; Bygget med Bun + TypeScript
</p>
