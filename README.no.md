<p align="center">
  <a href="README.md">English</a> |
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
  <strong>Norsk</strong> |
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

<h3 align="center">Universell digital fingeravtrykksregistrering for AI-agenter.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, tjenestesondring, JARM, JA4X, favicon-hashing, infrastrukturtopologi, C2-deteksjon, OSINT-berikelse &mdash; samlet i en enkelt MCP-server.<br>
  AI-agenten din far <b>fullspektret fingeravtrykksregistrering pa forespursel</b>, ikke 11 frakoblede CLI-verktuy og manuell korrelering.
</p>

<br>

<p align="center">
  <a href="#problemet">Problemet</a> &bull;
  <a href="#hvordan-det-er-annerledes">Hvordan det er annerledes</a> &bull;
  <a href="#hurtigstart">Hurtigstart</a> &bull;
  <a href="#hva-ai-en-kan-gjore">Hva AI-en kan gjore</a> &bull;
  <a href="#verktoy-referanse-13-verktoy-103-teknikker">Verktoy (13)</a> &bull;
  <a href="#datakilder-21">Datakilder</a> &bull;
  <a href="#arkitektur">Arkitektur</a> &bull;
  <a href="CHANGELOG.md">Endringslogg</a> &bull;
  <a href="CONTRIBUTING.md">Bidra</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Lisens"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 verktoy">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 teknikker">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp demo" width="800">
</p>

---

## Problemet

A fingeravtrykksregistrere en server i dag betyr a sjonglere et dusin frakoblede verktoy. Du kjorer `nmap` for portskanning, `testssl.sh` for sertifikatanalyse, `curl -I` for HTTP-headere, `dig` for DNS, `wafw00f` for WAF-deteksjon, `ssh-audit` for SSH, et separat JARM-verktoy, Wappalyzer for teknologideteksjon &mdash; og sa bruker du 30 minutter pa a manuelt krysskjore alt i et regneark for a finne ut hva som faktisk kjorer.

```
Tradisjonell arbeidsflyt for fingeravtrykksregistrering:
  analyser TLS-sertifikater      ->  testssl.sh / openssl s_client
  hent HTTP-headere              ->  curl -I
  oppdage webteknologier         ->  wappalyzer CLI
  DNS-rekognosering              ->  dig / nslookup / dnsenum
  portskanning                   ->  nmap -sV
  WAF-deteksjon                  ->  wafw00f
  SSH-revisjon                   ->  ssh-audit
  tjenestefingeravtrykk           ->  nmap scripts
  JARM-fingeravtrykk             ->  jarm (separat verktoy)
  sjekk OSINT-databaser          ->  shodan CLI, censys CLI
  korreler alt                   ->  manuelt i et regneark
  ──────────────────────────────
  Totalt: 11 verktoy, 30+ minutter, manuell korrelering
```

**fingerprint-mcp** gir AI-agenten din 13 sammensatte verktoy som innkapsler 103 fingeravtrykksteknikker pa tvers av 21 leverandorer via [Model Context Protocol](https://modelcontextprotocol.io). Agenten kjorer flerlags fingeravtrykksregistrering parallelt, korrelerer signaler pa tvers av TCP/TLS/HTTP/DNS/SSH-lag, oppdager honningfeller og C2-infrastruktur, og presenterer et samlet etterretningsbilde &mdash; i en enkelt samtale.

```
Med fingerprint-mcp:
  Du: "Gjor en dyp rekognosering pa target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
            Let's Encrypt-sertifikat, 2 SANs, TLS 1.2+1.3
         -> HTTP: Express.js bak Cloudflare WAF,
            React SPA, Google Analytics, 14 sikkerhetsheadere analysert
         -> DNS: A/AAAA/MX/TXT-poster, SPF/DKIM/DMARC konfigurert,
            Slack + Google Workspace oppdaget via CNAME/MX
         -> Porter: 80, 443, 22 (OpenSSH 9.6), 8080 (utviklingsserver)
         -> WAF: Cloudflare oppdaget, opprinnelig IP funnet via direkte tilkobling
         -> Oppregning: 12 underdomener via CT-logger, wildcard DNS oppdaget
         -> "target.com kjorer nginx/1.24.0 med Express.js bak
            Cloudflare WAF. Opprinnelig IP 203.0.113.42 er eksponert pa port 8080.
            TLS er riktig konfigurert (tilsvarende A+), men utviklingsserveren
            pa 8080 har ingen WAF-beskyttelse. 3 underdomener peker til
            avviklet infrastruktur — potensiell overtakelsesrisiko."
```

---

## Hvordan det er annerledes

Eksisterende verktoy gir deg radata ett lag om gangen. fingerprint-mcp gir AI-agenten din muligheten til a **resonnere pa tvers av alle fingeravtrykkslag samtidig**.

<table>
<thead>
<tr>
<th></th>
<th>Tradisjonell tilnarming</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Grensesnitt</b></td>
<td>11 forskjellige CLI-verktoy med ulike utdataformater</td>
<td>MCP &mdash; AI-agenten kaller verktoy i samtaleform</td>
</tr>
<tr>
<td><b>Teknikker</b></td>
<td>Ett verktoy, ett lag om gangen</td>
<td>103 teknikker pa tvers av 21 leverandorer, kjort parallelt</td>
</tr>
<tr>
<td><b>TLS-analyse</b></td>
<td>testssl.sh-utdata, manuelt parse JARM separat</td>
<td>Agenten kombinerer sertifikat + JARM + JA4X + chiffreringssuiter + SNI + CT-logger i ett kall</td>
</tr>
<tr>
<td><b>Korrelering</b></td>
<td>Kopier og lim inn resultater i et regneark</td>
<td>Agenten krysskorrelerer: "JARM matcher kjent C2-rammeverk, HTTP-timing bekrefter honningfelle"</td>
</tr>
<tr>
<td><b>WAF-omgaelse</b></td>
<td>wafw00f oppdager WAF, du jakter manuelt pa opprinnelsen</td>
<td>Agenten oppdager WAF, finner opprinnelig IP, og verifiserer at den serverer samme innhold</td>
</tr>
<tr>
<td><b>API-nokler</b></td>
<td>Pavkrevd for Shodan, Censys, osv.</td>
<td>80+ aktive teknikker fungerer uten noen API-nokler; nokler laser opp OSINT-berikelse</td>
</tr>
<tr>
<td><b>Oppsett</b></td>
<td>Installer nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; en kommando, null konfigurasjon</td>
</tr>
</tbody>
</table>

---

## Hurtigstart

### Alternativ 1: npx (ingen installasjon)

```bash
npx fingerprint-mcp
```

Alle 80+ aktive fingeravtrykksteknikker fungerer umiddelbart. Ingen API-nokler kreves for TCP, TLS, SSH, HTTP, DNS, WAF, sti, tjeneste, timing, IoT, SMTP, infrastruktur og applikasjonsfingeravtrykk.

### Alternativ 2: Klon

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Miljovariabler (valgfritt)

```bash
# OSINT-berikelse (alle valgfrie — aktiv fingeravtrykksregistrering fungerer uten noen nokler)
export SHODAN_API_KEY=your-key           # Aktiverer osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Aktiverer osint_censys (gratis: 250 sporringer/maned)
export CENSYS_API_SECRET=your-secret     # Censys API-hemmelighet
export SECURITYTRAILS_API_KEY=your-key   # Aktiverer waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Aktiverer osint_virustotal (gratis: 500 sporringer/dag)
```

Alle API-nokler er valgfrie. Uten dem far du fortsatt full TCP/TLS/SSH/HTTP/DNS/WAF/sti/tjeneste/timing/IoT/SMTP/infrastruktur/applikasjons-fingeravtrykksregistrering, korrelering, passiv analyse, oppregning og meta-verktoy &mdash; 80+ teknikker som fungerer ved a sondere malet direkte.

### Koble til AI-agenten din

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Med npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Med lokal klone
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Legg til i `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Samme JSON-konfigurasjonsformat. Pek kommandoen til `npx fingerprint-mcp` eller din lokale installasjonssti.

</details>

### Begynn a sporr

```
Du: "Fingeravtrykksregistrer alt om target.com — TLS, HTTP-stakk, WAF, DNS, apne porter"
```

Det er alt. Agenten handterer flerlags fingeravtrykksregistrering, signalkorrelering og infrastrukturanalyse automatisk.

---

## Hva AI-en kan gjore

### Rask rekognosering

```
Du: "Rask rekognosering pa target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: porter 80, 443, 22 apne
       -> TLS: Let's Encrypt RSA-sertifikat, TLS 1.2+1.3, nginx JARM-signatur
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM konfigurert
       -> WAF: Cloudflare oppdaget (cf-ray header)
       -> "target.com er en React SPA pa Express.js bak nginx/1.24.0,
          servert gjennom Cloudflare CDN. TLS riktig konfigurert med
          Let's Encrypt. SSH pa port 22 kjorer OpenSSH 9.6. E-post
          handtert av Google Workspace med full SPF/DKIM/DMARC."
```

### Dyp TLS-undersokelse

```
Du: "Analyser TLS-konfigurasjonen til suspicious-server.com i detalj"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Sertifikat: selvsignert, CN=localhost, utlopt for 47 dager siden
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (matcher Cobalt Strike standard profil)
       -> JA4X: fingeravtrykk matcher kjent C2-rammeverkmonster
       -> Chiffreringssuiter: aksepterer svake chifferinger (RC4, 3DES)
       -> SNI: svarer identisk pa enhver SNI-verdi
       -> CT-logger: sertifikat ikke logget (ikke offentlig betrodd)
       -> "HOY RISIKO: TLS-konfigurasjon indikerer sterkt C2-infrastruktur.
          Selvsignert utlopt sertifikat, JARM-fingeravtrykk matcher Cobalt Strike,
          aksepterer svake chifferinger, og svarer pa vilkarlige SNI-verdier.
          Anbefaler umiddelbar undersokelse og blokkering."
```

### WAF-omgaelse og opprinnelsesoppdagelse

```
Du: "target.com er bak en WAF. Kan du finne opprinnelsesserveren?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), utfordringsside pa mistenkelige foresporsler
       -> DNS: A-post peker til Cloudflare IP 104.21.x.x
       -> Underdomener: dev.target.com luser opp til 203.0.113.42 (ikke-Cloudflare)
       -> Direkte tilkobling til 203.0.113.42:443 returnerer samme TLS-sertifikat
       -> SecurityTrails historisk: opprinnelsen var 203.0.113.42 for Cloudflare
       -> "Opprinnelig IP funnet: 203.0.113.42. Oppdaget via dev.target.com
          underdomene som omgar Cloudflare. Opprinnelsen serverer det samme
          TLS-sertifikatet og svarer pa target.com Host-headeren.
          Opprinnelsen har ingen WAF-beskyttelse — direkte tilgang mulig."
```

### Tjenesteoppdagelse pa en vert

```
Du: "Hvilke tjenester kjorer pa 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519 vertsnokkel
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, autentisering pavkrevd
       -> Port 5432: PostgreSQL 16.1, SSL pavkrevd
       -> Port 6379: Redis 7.2.4, INGEN autentisering (apen)
       -> Port 8080: Node.js Express utviklingsserver, CORS: *
       -> "KRITISK: Redis pa port 6379 har ingen autentisering — hvem som helst pa
          nettverket kan lese/skrive data. Express utviklingsserveren pa 8080
          har wildcard CORS. MySQL og PostgreSQL krever autentisering korrekt.
          WordPress er 2 mindre versjoner bak. Umiddelbar handling nodvendig
          for Redis og utviklingsservereksponering."
```

---

## Verktoy-referanse (13 verktoy, 103 teknikker)

<details open>
<summary><b>recon &mdash; Full rekognosering med dybdebasert teknikkvalg</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL for fingeravtrykksregistrering |
| `depth` | `quick` \| `standard` \| `deep` | Skannedybde: quick=5 teknikker, standard=20, deep=50+ |

Orkestrerer teknikker fra alle leverandorer basert pa dybdeniva. Hurtigmodus gir en rask oversikt; dyp modus kjorer uttommende fingeravtrykksregistrering inkludert oppregning, OSINT og korrelering.

</details>

<details>
<summary><b>scan_ports &mdash; TCP-portskanning med tjenestedeteksjon (3 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvert (IP eller domene) |
| `ports` | number[] | Valgfritt &mdash; spesifikke porter a skanne (standard er vanlige porter) |

| Teknikk | Beskrivelse |
|---------|-------------|
| `tcp_probe` | TCP connect-skanning for a oppdage apne porter |
| `tcp_banner` | Bannerhenting pa apne porter for tjenesteidentifikasjon |
| `tcp_analysis` | Portkombmasjonsanalyse og tjenesteslutning |

</details>

<details>
<summary><b>scan_tls &mdash; Komplett TLS/SSL-analyse (8 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvert (IP eller domene) |
| `port` | number | Valgfritt &mdash; TLS-port (standard: 443) |

| Teknikk | Beskrivelse |
|---------|-------------|
| `tls_certificate` | X.509-sertifikatparsing &mdash; emne, utsteder, SANs, gyldighet, kjede |
| `tls_jarm` | JARM aktiv fingeravtrykksregistrering &mdash; 10 TLS Client Hello-sonder, 62-tegns hash |
| `tls_ja4x` | JA4X passiv TLS-fingeravtrykksregistrering fra sertifikategenskaper |
| `tls_ciphers` | Chiffreringssuiteoppregning og styrkeanalyse |
| `tls_protocols` | Deteksjon av stottede TLS-protokollversjoner (SSLv3 til TLS 1.3) |
| `tls_sni` | SNI-atferdstesting &mdash; standardsertifikat vs. forespurt vertsnavn |
| `tls_ct_logs` | Certificate Transparency-loggsok via crt.sh |
| `tls_ocsp` | OCSP-stifting og tilbakekallingsstatus-sjekk |

</details>

<details>
<summary><b>scan_dns &mdash; DNS-etterretning (7 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `domain` | string | Maldomene |

| Teknikk | Beskrivelse |
|---------|-------------|
| `dns_records` | Full postoppregning &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF-, DKIM- og DMARC-postanalyse |
| `dns_saas` | SaaS/tjenestedeteksjon via CNAME- og MX-monstre (Slack, Zendesk, osv.) |
| `dns_server` | DNS-serverfingeravtrykk (BIND, PowerDNS, Cloudflare, osv.) |
| `dns_takeover` | Underdomene-overtakelsesdeteksjon via hengende CNAME-analyse |
| `dns_zone` | Soneoverforslingsforsok (AXFR) |
| `dns_caa` | CAA-postanalyse for sertifiseringsinstansbegrensninger |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/web-fingeravtrykksregistrering (29 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |

| Teknikk | Leverandor | Beskrivelse |
|---------|-----------|-------------|
| `http_headers` | HTTP | Svarheaderanalyse og serveridentifikasjon |
| `http_header_order` | HTTP | Header-rekkefolgefingeravtrykk (serverprogramvaresignatur) |
| `http_security_headers` | HTTP | Sikkerhetsheader-revisjon (CSP, HSTS, X-Frame-Options, osv.) |
| `http_cookies` | HTTP | Informasjonskapselanalyse &mdash; flagg, prefikser, rammeverkdeteksjon |
| `http_methods` | HTTP | Tillatt HTTP-metodeoppregning (OPTIONS) |
| `http_cors` | HTTP | CORS-policyanalyse og feilkonfigurasjonsdeteksjon |
| `http_compression` | HTTP | Stottede komprimeringsalgoritmer (gzip, br, zstd) |
| `http_caching` | HTTP | Cache-headeranalyse (CDN, reversproxy-deteksjon) |
| `http_etag` | HTTP | ETag-formatanalyse for backend-identifikasjon |
| `http_error` | HTTP | Feilsidefingeravtrykk (tilpassede vs. standardfeilsider) |
| `http_redirect` | HTTP | Omdirigeringskjedeanalyse |
| `http_timing` | HTTP | Svartidings-grunnlinje for serverytelsesprofilering |
| `http_favicon` | HTTP | Favicon-hash (MurmurHash3) for teknologiidentifikasjon |
| `http_robots` | HTTP | robots.txt-parsing og ekstraksjon av forbudte stier |
| `http_sitemap` | HTTP | Sitemap-oppdagelse og URL-ekstraksjon |
| `http_wellknown` | HTTP | .well-known endepunktoppdagelse (security.txt, openid, osv.) |
| `web_tech` | Web | Teknologideteksjon via HTML/JS/CSS-monstre |
| `web_analytics` | Web | Analyse- og sporingstjenestedeteksjon |
| `web_sourcemaps` | Web | Kildekartfiloppdagelse |
| `web_websocket` | Web | WebSocket-endepunktdeteksjon |
| `web_graphql` | Web | GraphQL-endepunktdeteksjon og introspeksjon |
| `web_spa` | Web | Enkeltsideapplikasjons-rammeverkdeteksjon |
| `web_cdn` | Web | CDN-deteksjon via svarheadere og DNS |
| `web_meta` | Web | HTML meta-tag-analyse (generator, rammeverkhint) |
| `web_feed` | Web | RSS/Atom feed-oppdagelse |
| `h2_detect` | HTTP/2 | HTTP/2-protokollstottedeteksjon |
| `h2_fingerprint` | HTTP/2 | HTTP/2-serverfingeravtrykk (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | HTTP/3 (QUIC)-stottedeteksjon via Alt-Svc-header |
| `app_cms` | Application | CMS-deteksjon (WordPress, Drupal, Joomla, osv.) |

</details>

<details>
<summary><b>scan_paths &mdash; Stietterretning (5 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |
| `categories` | string[] | Valgfritt &mdash; kategorier a sjekke (sensitive, git, debug, api, config) |

| Teknikk | Beskrivelse |
|---------|-------------|
| `path_sensitive` | Sensitiv filoppdagelse (sikkerhetskopifiler, konfigurasjonsfiler, databasedumper) |
| `path_robots` | robots.txt- og sitemap.xml-analyse for skjulte stier |
| `path_git` | Git-repository-lekkasjedeteksjon (.git/HEAD, .git/config) |
| `path_debug` | Feilsokingsendepunktoppdagelse (phpinfo, server-status, feilsokingskonsoller) |
| `path_api` | API-versjon og dokumentasjonsendepunktoppdagelse |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN-deteksjon og fingeravtrykksregistrering (4 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `url` | string | Mal-URL |

| Teknikk | Beskrivelse |
|---------|-------------|
| `waf_detect` | WAF-tilstedevarlsesdeteksjon via svarheader- og atferdsanalyse |
| `waf_cdn` | CDN-leverandoridentifikasjon (Cloudflare, Akamai, Fastly, osv.) |
| `waf_fingerprint` | WAF-produktidentifikasjon og versjonsdeteksjon |
| `waf_origin` | Opprinnelig IP-oppdagelse bak WAF/CDN (krever `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Tjenesteniva-sondering (12 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `host` | string | Malvert (IP eller domene) |
| `ports` | number[] | Valgfritt &mdash; spesifikke porter a sondere |
| `service` | string | Valgfritt &mdash; spesifikk tjeneste a sondere (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Teknikk | Leverandor | Beskrivelse |
|---------|-----------|-------------|
| `ssh_probe` | SSH | SSH-protokollversjon og programvaredeteksjon |
| `ssh_algorithms` | SSH | SSH-algoritmerevisjon (KEX, chifferinger, MACs, vertsnokkeltyper) |
| `ssh_hostkey_lookup` | SSH | SSH-vertsnokkeloppslag via Shodan (krever `SHODAN_API_KEY`) |
| `svc_mysql` | Service | MySQL-versjonsdeteksjon og kapabilitetsfingeravtrykk |
| `svc_postgres` | Service | PostgreSQL-versjonsdeteksjon og SSL-stottesjekk |
| `svc_redis` | Service | Redis-versjonsdeteksjon og autentiseringsstatus |
| `svc_ftp` | Service | FTP-banneranalyse og anonym innloggingssjekk |
| `svc_vnc_rdp` | Service | VNC/RDP-tjenestedeteksjon og sikkerhetsvurdering |
| `smtp_banner` | SMTP | SMTP-banneranalyse og MTA-identifikasjon |
| `smtp_starttls` | SMTP | SMTP STARTTLS-stotte og sertifikatinspeksjon |
| `iot_detect` | IoT | IoT-enhetsdeteksjon via bannermonstre og standardsider |
| `iot_upnp` | IoT | UPnP/SSDP-enhetsoppdagelse pa lokalt nettverk |

</details>

<details>
<summary><b>enumerate &mdash; Omfangsutvidelse (8 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `domain` | string | Maldomene |

| Teknikk | Beskrivelse |
|---------|-------------|
| `enum_subdomains` | Underdomeneoppregning via flere metoder |
| `enum_wildcard` | Wildcard DNS-deteksjon |
| `enum_tld` | TLD-utvidelse (target.com -> target.net, target.org, osv.) |
| `enum_related` | Relatert domeneoppdagelse via delt infrastruktur |
| `enum_asn` | ASN-naboopdagelse &mdash; andre domener pa samme nettverk |
| `enum_ct` | Certificate Transparency-logg underdomeneekstraksjon |
| `enum_passive_dns` | Passiv DNS-historikk (krever `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Omfangssammendrag og angrepsflateoversikt |

</details>

<details>
<summary><b>osint &mdash; OSINT-berikelse (6 teknikker)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `target` | string | IP-adresse eller domene a berike |
| `type` | `ip` \| `domain` | Valgfritt &mdash; maltype (automatisk oppdaget hvis utelatt) |

| Teknikk | Autentisering | Beskrivelse |
|---------|---------------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan-vertsoppslag &mdash; apne porter, bannere, saarbarheter, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys-vertsdata &mdash; tjenester, TLS, autonomt system |
| `osint_reverse_ip` | Ingen | Omvendt IP-oppslag &mdash; andre domener pa samme IP |
| `osint_whois` | Ingen | WHOIS-registreringsdata &mdash; registrar, datoer, navneservere |
| `osint_webarchive` | Ingen | Web Archive-historikk &mdash; forste/siste ovelsbilde, endringsfrekvens |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal domene/IP-rapport &mdash; deteksjoner, kategorier, DNS |

</details>

<details>
<summary><b>analyze &mdash; Passiv fingeravtrykksanalyse (3 moduser)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Type data a analysere |
| `data` | string | Radata a analysere (lim inn headere, HTML eller bannerutdata) |

| Modus | Beskrivelse |
|-------|-------------|
| `fp_analyze_headers` | Passiv HTTP-headeranalyse &mdash; server-, rammeverk-, proxy-deteksjon uten a sende trafikk |
| `fp_analyze_html` | Passiv HTML-analyse &mdash; teknologideteksjon, rammeverkidentifikasjon fra kilde |
| `fp_analyze_banner` | Passiv banneranalyse &mdash; tjenesteidentifikasjon fra ra bannertekst |

</details>

<details>
<summary><b>correlate &mdash; Flersignalkorrelasjonsmotor (7 moduser)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Korrelasjonsmodusmodus |
| `signals` | object | Fingeravtrykkssignaler a korrelere (varierer etter modus) |

| Modus | Beskrivelse |
|-------|-------------|
| `fp_consistency` | Krysslags signalkonsistenssjekk &mdash; stemmer TCP-, TLS-, HTTP- og DNS-fingeravtrykk overens? |
| `fp_honeypot` | Honningfelledeteksjon &mdash; sjekker for umulige tjenestekombinasjoner og atferdsanomalier |
| `fp_spoofing` | Forfalskninsdeteksjon &mdash; identifiserer feiltilpassede serverheadere vs. faktisk atferd |
| `fp_compare` | Side-ved-side sammenligning av to verters fingeravtrykksprofiler |
| `fp_topology` | Infrastrukturtopologikartlegging &mdash; CDN, lastbalanserer, reversproxykjede |
| `fp_c2` | C2-rammeverkdeteksjon via JARM-, TLS-, HTTP- og timingkorrelasjon |
| `fp_identify` | Hash-basert identifikasjon mot kjent signaturdatabase |

</details>

<details>
<summary><b>meta &mdash; Serverkonfigurasjon og data (3 moduser)</b></summary>

| Parameter | Type | Beskrivelse |
|-----------|------|-------------|
| `category` | string | Valgfritt &mdash; filtrer etter kategori |

| Modus | Beskrivelse |
|-------|-------------|
| `fp_sources` | List alle tilgjengelige datakilder med konfigurasjon og API-nokkelstatus |
| `fp_config` | Serverkonfigurasjon &mdash; versjon, lastede leverandorer, antall teknikker |
| `fp_signatures` | Signaturdatabasoppforing &mdash; JARM, banner, WAF, applikasjonssignaturer |

</details>

---

### CLI-bruk

```bash
# List alle tilgjengelige verktoy og teknikker
npx fingerprint-mcp --list

# Kjor et hvilket som helst verktoy direkte
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

# OSINT-verktoy (krever API-nokler)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Datakilder (21)

| Kilde | Autentisering | Hva den gir |
|-------|---------------|-------------|
| TCP-sondering | Ingen | Portskanning, bannerhenting, tjenestedeteksjon |
| TLS/SSL-analyse | Ingen | Sertifikatparsing, JARM-fingeravtrykk, JA4X, chiffreringsoppregning, SNI-testing |
| SSH-sondering | Ingen | Protokollversjon, algoritmerevisjon, programvaredeteksjon |
| HTTP-analyse | Ingen | Header-fingeravtrykk, favicon-hashing, informasjonskapselanalyse, metodeoppregning, CORS |
| Webdeteksjon | Ingen | Teknologideteksjon, analyse, kildekart, WebSocket, GraphQL, SPA-rammeverk |
| Stioppdagelse | Ingen | Sensitive filer, git-lekkasjer, feilsokingsendepunkter, API-versjoner, robots.txt |
| DNS-opplosning | Ingen | Postoppregning, e-postautentiseringsanalyse, SaaS-deteksjon, serverfingeravtrykk |
| WAF/CDN-deteksjon | Ingen | WAF-identifikasjon, CDN-deteksjon, WAF-fingeravtrykk |
| Timinganalyse | Ingen | Svartidsgrunnlinje, klokkeforskyvningsdeteksjon |
| HTTP/2 og HTTP/3 | Ingen | HTTP/2-deteksjon og fingeravtrykk, HTTP/3 Alt-Svc-oppdagelse |
| SMTP-sondering | Ingen | SMTP-banneranalyse, STARTTLS-inspeksjon |
| IoT/innebygd | Ingen | IoT-enhetsdeteksjon, UPnP/SSDP-oppdagelse |
| Applikasjonsdeteksjon | Ingen | CMS-, rammeverk- og e-handelsplattformidentifikasjon |
| Tjenestsondering | Ingen | MySQL, PostgreSQL, Redis, FTP, VNC/RDP-fingeravtrykk |
| Infrastrukturdeteksjon | Ingen | Skyleverandor-, hostingleverandor-, CDN-identifikasjon |
| Korrelasjonsmotor | Ingen | Signalkonsistens, honningfelledeteksjon, forfalskninsdeteksjon, topologikartlegging |
| Identifikasjonsmotor | Ingen | Hash-basert identifikasjon, C2-deteksjon, signaturmatching |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Vertsetterretning &mdash; apne porter, bannere, saarbarheter, OS-deteksjon |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Vertsdata &mdash; tjenester, TLS-sertifikater, autonomt systeminformasjon |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF-opprinnelsesoppdagelse, passiv DNS-historikk, historiske poster |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Domene/IP-omdumme, deteksjonsresultater, DNS-historikk, kategorier |

---

## Arkitektur

```
src/
  index.ts                # CLI-inngangspunkt (--help, --list, --tool, stdio-server)
  protocol/
    mcp-server.ts         # MCP-serveroppsett (stdio-transport)
    tools.ts              # Verktoyregister — alle 13 sammensatte verktoy registrert her
  types/
    index.ts              # Delte typer (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Hastighetsbegrenser per leverandor
    cache.ts              # TTL-cache for API-svar
    require-key.ts        # API-nokkelvalideringshjelper
    murmurhash3.ts        # MurmurHash3 for favicon-hashing
  composite/              # 13 sammensatte verktoyorkestratorer
    recon.ts              # Full rekognoseringsorkestreror (quick/standard/deep)
    scan-ports.ts         # Portskanning sammensatt
    scan-tls.ts           # TLS-analyse sammensatt
    scan-dns.ts           # DNS-etterretning sammensatt
    scan-http.ts          # HTTP-fingeravtrykk sammensatt
    scan-paths.ts         # Stioppdagelse sammensatt
    scan-waf.ts           # WAF/CDN-deteksjon sammensatt
    scan-services.ts      # Tjenestsondering sammensatt
    analyze.ts            # Passiv analyse sammensatt
    correlate.ts          # Korrelasjonsmotor sammensatt
    enumerate.ts          # Omfangsutvidelse sammensatt
    osint.ts              # OSINT-berikelse sammensatt
    meta.ts               # Server-meta sammensatt
    helpers.ts            # Delte sammensatte hjelpere
  tcp/                    # TCP-sonderingsteknikker (3)
  tls/                    # TLS/SSL-analyseteknikker (8)
  ssh/                    # SSH-sonderingsteknikker (3)
  http/                   # HTTP-fingeravtrykksteknikker (16)
  web/                    # Webteknologideteksjonsteknikker (9)
  path/                   # Stioppdagelsesteknikker (5)
  dns/                    # DNS-etterretningsteknikker (7)
  waf/                    # WAF/CDN-deteksjonsteknikker (4)
  timing/                 # Timinganalyseteknikker (2)
  h2/                     # HTTP/2 og HTTP/3-teknikker (3)
  smtp/                   # SMTP-sonderingsteknikker (2)
  iot/                    # IoT/innebygd deteksjonsteknikker (2)
  app/                    # Applikasjonsdeteksjonsteknikker (3)
  service/                # Tjenestsonderingsteknikker (5)
  infra/                  # Infrastrukturdeteksjonsteknikker (3)
  correlation/            # Korrelasjonsmotor (5)
  identify/               # Identifikasjonsmotor (3)
  passive/                # Passiv analyse (3)
  osint/                  # OSINT-berikelsesteknikker (6)
  enum/                   # Oppregningseknikker (8)
  meta/                   # Meta-verktoy (3)
  data/                   # Signaturdatabaser og monsterbiblioteker
    jarm-signatures.ts    # Kjente JARM-fingeravtrykk (C2, servere, CDNs)
    waf-signatures.ts     # WAF-deteksjonssignaturer
    service-banners.ts    # Tjenestebannermonstre
    tech-patterns.ts      # Teknologideteksjonsmonstre
    favicon-hashes.ts     # Kjente favicon MurmurHash3-verdier
    c2-signatures.ts      # C2-rammeverksignaturer
    ...                   # 15+ signatur/monsterdatabaser
```

**Designvalg:**

- **13 sammensatte verktoy, 103 teknikker** &mdash; Agenten kaller hoyniva-verktoy (`recon`, `scan_tls`, `scan_http`). Hvert sammensatt verktoy orkestrerer flere lavniva-teknikker og returnerer korrelerte resultater. Dette reduserer verktoy-kalloverhead samtidig som granulariteten opprettholdes.
- **21 leverandorer, 1 server** &mdash; Hvert fingeravtrykkslag er en uavhengig modul. Den sammensatte orkestratoren velger teknikker basert pa kontekst og dybde.
- **Aktiv forst, OSINT valgfritt** &mdash; 80+ teknikker fungerer ved a sondere malet direkte med null API-nokler. OSINT-leverandorer (Shodan, Censys, VirusTotal, SecurityTrails) legger til berikelse, men er aldri pavkrevd.
- **Hastighetsbegrensere per leverandor** &mdash; Hver leverandor har sin egen `RateLimiter`-instans. Aktiv sondering er hastighetsbegrenset for a unnga deteksjon; OSINT-APIer er kalibrert til sine kvoter.
- **TTL-caching** &mdash; DNS-poster (10 min), OSINT-resultater (15 min), CT-logger (30 min) caches for a unnga overflodige oppslag under flerverktoys arbeidsflyter.
- **Elegant degradering** &mdash; Manglende API-nokler krasjer ikke serveren. OSINT-verktoy returnerer beskrivende meldinger: "Sett SHODAN_API_KEY for a aktivere Shodan-vertsoppslag."
- **3 avhengigheter** &mdash; `@modelcontextprotocol/sdk`, `zod` og `cheerio`. All nettverks-I/O via innebygd `fetch()` og Node.js `net`/`tls`/`dns`-moduler. Ingen nmap, ingen eksterne binarfiler.

---

## Begrensninger

- OSINT-verktoy (Shodan, Censys, VirusTotal, SecurityTrails) krever API-nokler for sine respektive teknikker
- Censys gratisniva begrenset til 250 sporringer/maned
- VirusTotal gratisniva begrenset til 500 sporringer/dag
- Portskanning bruker TCP connect (ikke SYN-skanning) &mdash; mindre skjult enn nmap, men krever ingen root-privilegier
- JARM-fingeravtrykksregistrering krever direkte TCP-tilgang til malet (kan bli blokkert av brannmurer)
- UPnP/SSDP-oppdagelse fungerer kun pa lokale nettverk
- Tjenestsondering (MySQL, PostgreSQL, Redis) kobler til men autentiserer ikke
- Underdomeneoppregning baserer seg pa CT-logger og passive kilder (ingen brute-force)
- macOS / Linux testet (Windows ikke testet)

---

## Del av MCP-sikkerhetssuiten

| Prosjekt | Domene | Verktoy |
|----------|--------|---------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Nettleserbasert sikkerhetstesting | 39 verktoy, Firefox, injeksjonstesting |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Skysikkerhet (AWS/Azure/GCP) | 38 verktoy, 60+ sjekker |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub-sikkerhetsstilling | 39 verktoy, 45 sjekker |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Saarbarhetsetterretning | 23 verktoy, 5 kilder |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT og rekognosering | 37 verktoy, 12 kilder |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Morkenettet og trusseletterretning | 66 verktoy, 16 kilder |
| **fingerprint-mcp** | **Universell digital fingeravtrykksregistrering** | **13 verktoy, 103 teknikker, 21 leverandorer** |

---

<p align="center">
<b>Kun for autorisert sikkerhetstesting og vurdering.</b><br>
Sorg alltid for at du har riktig autorisasjon for du utforer fingeravtrykksregistrering pa et mal.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0-lisens</a> &bull; Bygget med Bun + TypeScript
</p>
