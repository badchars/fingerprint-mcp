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
  <strong>Bosanski</strong> |
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

<h3 align="center">Univerzalni digitalni fingerprinting za AI agente.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondiranje servisa, JARM, JA4X, hashiranje favicona, topologija infrastrukture, detekcija C2, OSINT obogacivanje &mdash; ujedinjeni u jednom MCP serveru.<br>
  Vas AI agent dobija <b>fingerprinting punog spektra na zahtjev</b>, a ne 11 nepovezanih CLI alata i rucnu korelaciju.
</p>

<br>

<p align="center">
  <a href="#problem">Problem</a> &bull;
  <a href="#po-cemu-se-razlikuje">Po Cemu Se Razlikuje</a> &bull;
  <a href="#brzi-pocetak">Brzi Pocetak</a> &bull;
  <a href="#sta-ai-moze-uraditi">Sta AI Moze Uraditi</a> &bull;
  <a href="#referenca-alata-13-alata-103-tehnike">Alati (13)</a> &bull;
  <a href="#izvori-podataka-21">Izvori Podataka</a> &bull;
  <a href="#arhitektura">Arhitektura</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Doprinos</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licenca"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Alata">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Tehnike">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp demo" width="800">
</p>

---

## Problem

Fingerprinting servera danas znaci zongliranje s tucetom nepovezanih alata. Pokrecete `nmap` za skeniranje portova, `testssl.sh` za analizu certifikata, `curl -I` za HTTP zaglavlja, `dig` za DNS, `wafw00f` za detekciju WAF-a, `ssh-audit` za SSH, poseban JARM alat, Wappalyzer za detekciju tehnologija &mdash; a zatim provedete 30 minuta rucno ukrstajuci sve u tabeli da biste shvatili sta zapravo radi.

```
Tradicionalni tok rada fingerprintinga:
  analiza TLS certifikata        ->  testssl.sh / openssl s_client
  dohvatanje HTTP zaglavlja      ->  curl -I
  detekcija web tehnologija      ->  wappalyzer CLI
  DNS izvidanje                  ->  dig / nslookup / dnsenum
  skeniranje portova             ->  nmap -sV
  detekcija WAF-a                ->  wafw00f
  SSH revizija                   ->  ssh-audit
  fingerprinting servisa         ->  nmap scripts
  JARM fingerprint               ->  jarm (poseban alat)
  provjera OSINT baza            ->  shodan CLI, censys CLI
  korelacija svega               ->  rucno u tabeli
  ──────────────────────────────
  Ukupno: 11 alata, 30+ minuta, rucna korelacija
```

**fingerprint-mcp** daje vasem AI agentu 13 kompozitnih alata koji obuhvataju 103 tehnike fingerprintinga kroz 21 provajdera putem [Model Context Protocol](https://modelcontextprotocol.io)-a. Agent pokrece viseslojni fingerprinting paralelno, korelira signale kroz TCP/TLS/HTTP/DNS/SSH slojeve, detektuje honeypotove i C2 infrastrukturu i predstavlja objedinjenu obavjestajnu sliku &mdash; u jednom razgovoru.

```
Sa fingerprint-mcp:
  Vi: "Uradi duboko izvidanje na target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 putem JARM (3fd21b20d00000...),
            Let's Encrypt certifikat, 2 SAN-a, TLS 1.2+1.3
         -> HTTP: Express.js iza Cloudflare WAF-a,
            React SPA, Google Analytics, 14 sigurnosnih zaglavlja analizirano
         -> DNS: A/AAAA/MX/TXT zapisi, SPF/DKIM/DMARC konfigurirani,
            Slack + Google Workspace detektovani putem CNAME/MX
         -> Portovi: 80, 443, 22 (OpenSSH 9.6), 8080 (razvojni server)
         -> WAF: Cloudflare detektovan, izvorni IP otkriven putem direktne veze
         -> Enumeracija: 12 poddomena putem CT logova, wildcard DNS detektovan
         -> "target.com pokrece nginx/1.24.0 sa Express.js iza
            Cloudflare WAF-a. Izvorni IP 203.0.113.42 izlozen na portu 8080.
            TLS je pravilno konfiguriran (ekvivalent A+), ali razvojni server
            na 8080 nema WAF zastitu. 3 poddomena pokazuju na
            dekomisioniranu infrastrukturu — potencijalni rizik od preuzimanja."
```

---

## Po Cemu Se Razlikuje

Postojeci alati vam daju sirove podatke jedan sloj u isto vrijeme. fingerprint-mcp daje vasem AI agentu sposobnost da **razmislja preko svih slojeva fingerprintinga istovremeno**.

<table>
<thead>
<tr>
<th></th>
<th>Tradicionalni Pristup</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfejs</b></td>
<td>11 razlicitih CLI alata sa razlicitim formatima izlaza</td>
<td>MCP &mdash; AI agent poziva alate konverzacijski</td>
</tr>
<tr>
<td><b>Tehnike</b></td>
<td>Jedan alat, jedan sloj u isto vrijeme</td>
<td>103 tehnike kroz 21 provajdera, pokrenute paralelno</td>
</tr>
<tr>
<td><b>TLS analiza</b></td>
<td>Izlaz testssl.sh, rucno parsiranje JARM-a posebno</td>
<td>Agent kombinuje certifikat + JARM + JA4X + sifar-skupove + SNI + CT logove u jednom pozivu</td>
</tr>
<tr>
<td><b>Korelacija</b></td>
<td>Kopiraj-zalijepi rezultate u tabelu</td>
<td>Agent ukrsteno korelira: "JARM odgovara poznatom C2 okviru, HTTP tajming potvrdjuje honeypot"</td>
</tr>
<tr>
<td><b>WAF zaobilazenje</b></td>
<td>wafw00f detektuje WAF, vi rucno trazite izvor</td>
<td>Agent detektuje WAF, otkriva izvorni IP i verifikuje da servira isti sadrzaj</td>
</tr>
<tr>
<td><b>API kljucevi</b></td>
<td>Potrebni za Shodan, Censys itd.</td>
<td>80+ aktivnih tehnika radi bez ikakvih API kljuceva; kljucevi otkljucavaju OSINT obogacivanje</td>
</tr>
<tr>
<td><b>Podesavanje</b></td>
<td>Instalirajte nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; jedna komanda, nula konfiguracije</td>
</tr>
</tbody>
</table>

---

## Brzi Pocetak

### Opcija 1: npx (bez instalacije)

```bash
npx fingerprint-mcp
```

Svih 80+ aktivnih tehnika fingerprintinga radi odmah. API kljucevi nisu potrebni za TCP, TLS, SSH, HTTP, DNS, WAF, putanje, servise, tajming, IoT, SMTP i fingerprinting aplikacija.

### Opcija 2: Kloniranje

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Varijable okruzenja (opcione)

```bash
# OSINT obogacivanje (sve opcione — aktivni fingerprinting radi bez ikakvih kljuceva)
export SHODAN_API_KEY=your-key           # Omogucava osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Omogucava osint_censys (besplatno: 250 upita/mjesec)
export CENSYS_API_SECRET=your-secret     # Censys API tajni kljuc
export SECURITYTRAILS_API_KEY=your-key   # Omogucava waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Omogucava osint_virustotal (besplatno: 500 upita/dan)
```

Svi API kljucevi su opcioni. Bez njih i dalje dobijate puni TCP/TLS/SSH/HTTP/DNS/WAF/putanja/servis/tajming/IoT/SMTP/infrastruktura/aplikacija fingerprinting, korelaciju, pasivnu analizu, enumeraciju i meta alate &mdash; 80+ tehnika koje rade direktnim sondiranjem cilja.

### Povezivanje sa AI agentom

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Sa npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Sa lokalnim klonom
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Dodajte u `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / drugi MCP klijenti</b></summary>

Isti JSON format konfiguracije. Usmjerite komandu na `npx fingerprint-mcp` ili putanju vase lokalne instalacije.

</details>

### Pocnite sa upitima

```
Vi: "Fingerprintuj sve o target.com — TLS, HTTP stek, WAF, DNS, otvorene portove"
```

To je to. Agent automatski upravlja viseslojnim fingerprintingom, korelacijom signala i analizom infrastrukture.

---

## Sta AI Moze Uraditi

### Brzo Izvidanje

```
Vi: "Brzo izvidanje target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: portovi 80, 443, 22 otvoreni
       -> TLS: Let's Encrypt RSA certifikat, TLS 1.2+1.3, nginx JARM potpis
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM konfigurirani
       -> WAF: Cloudflare detektovan (cf-ray zaglavlje)
       -> "target.com je React SPA na Express.js iza nginx/1.24.0,
          serviran kroz Cloudflare CDN. TLS pravilno konfiguriran sa
          Let's Encrypt. SSH na portu 22 pokrece OpenSSH 9.6. E-mail
          upravlja Google Workspace sa punim SPF/DKIM/DMARC."
```

### Dubinska TLS Istraga

```
Vi: "Analiziraj detaljno TLS konfiguraciju suspicious-server.com"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Certifikat: samopotpisan, CN=localhost, istekao prije 47 dana
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (odgovara zadanom profilu Cobalt Strike)
       -> JA4X: fingerprint odgovara poznatom obrascu C2 okvira
       -> Sifar-skupovi: prihvata slabe sifre (RC4, 3DES)
       -> SNI: odgovara identicno na bilo koju SNI vrijednost
       -> CT logovi: certifikat nije evidentiran (nije javno pouzdan)
       -> "VISOK RIZIK: TLS konfiguracija snazno ukazuje na C2 infrastrukturu.
          Samopotpisan istekli certifikat, JARM fingerprint odgovara Cobalt Strike,
          prihvata slabe sifre i odgovara na proizvoljne SNI vrijednosti.
          Preporucuje se hitna istraga i blokiranje."
```

### WAF Zaobilazenje i Otkrivanje Izvora

```
Vi: "target.com je iza WAF-a. Mozes li pronaci izvorni server?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), stranica izazova na sumnjive zahtjeve
       -> DNS: A zapis pokazuje na Cloudflare IP 104.21.x.x
       -> Poddomene: dev.target.com razrjesava na 203.0.113.42 (ne-Cloudflare)
       -> Direktna veza na 203.0.113.42:443 vraca isti TLS certifikat
       -> SecurityTrails historija: izvor je bio 203.0.113.42 prije Cloudflarea
       -> "Izvorni IP pronadjen: 203.0.113.42. Otkriven putem poddomene
          dev.target.com koja zaobilazi Cloudflare. Izvor servira isti
          TLS certifikat i odgovara na target.com Host zaglavlje.
          Izvor nema WAF zastitu — moguc direktan pristup."
```

### Otkrivanje Servisa na Hostu

```
Vi: "Koji servisi rade na 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519 kljuc hosta
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, potrebna autentifikacija
       -> Port 5432: PostgreSQL 16.1, potreban SSL
       -> Port 6379: Redis 7.2.4, BEZ autentifikacije (otvoren)
       -> Port 8080: Node.js Express razvojni server, CORS: *
       -> "KRITICNO: Redis na portu 6379 nema autentifikaciju — bilo ko na
          mrezi moze citati/pisati podatke. Express razvojni server na 8080
          ima wildcard CORS. MySQL i PostgreSQL pravilno zahtijevaju autentifikaciju.
          WordPress zaostaje za 2 manje verzije. Hitna akcija potrebna
          za Redis i izlozenost razvojnog servera."
```

---

## Referenca Alata (13 alata, 103 tehnike)

<details open>
<summary><b>recon &mdash; Puno izvidanje sa odabirom tehnika baziranim na dubini</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `url` | string | Ciljni URL za fingerprinting |
| `depth` | `quick` \| `standard` \| `deep` | Dubina skeniranja: quick=5 tehnika, standard=20, deep=50+ |

Orkestrira tehnike svih provajdera na osnovu nivoa dubine. Brzi rezim daje brzi pregled; duboki rezim pokrece iscrpni fingerprinting ukljucujuci enumeraciju, OSINT i korelaciju.

</details>

<details>
<summary><b>scan_ports &mdash; TCP skeniranje portova sa detekcijom servisa (3 tehnike)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `host` | string | Ciljni host (IP ili domena) |
| `ports` | number[] | Opciono &mdash; specificni portovi za skeniranje (podrazumijevano: uobicajeni portovi) |

| Tehnika | Opis |
|---------|------|
| `tcp_probe` | TCP connect skeniranje za detekciju otvorenih portova |
| `tcp_banner` | Dohvatanje banera na otvorenim portovima za identifikaciju servisa |
| `tcp_analysis` | Analiza kombinacija portova i zakljucivanje o servisima |

</details>

<details>
<summary><b>scan_tls &mdash; Kompletna TLS/SSL analiza (8 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `host` | string | Ciljni host (IP ili domena) |
| `port` | number | Opciono &mdash; TLS port (podrazumijevano: 443) |

| Tehnika | Opis |
|---------|------|
| `tls_certificate` | Parsiranje X.509 certifikata &mdash; subjekt, izdavac, SAN-ovi, valjanost, lanac |
| `tls_jarm` | JARM aktivni fingerprinting &mdash; 10 TLS Client Hello sondi, 62-znakovni hash |
| `tls_ja4x` | JA4X pasivni TLS fingerprinting iz svojstava certifikata |
| `tls_ciphers` | Enumeracija sifar-skupova i analiza jacine |
| `tls_protocols` | Detekcija podrzanih verzija TLS protokola (SSLv3 do TLS 1.3) |
| `tls_sni` | Testiranje ponasanja SNI &mdash; podrazumijevani certifikat vs. zatrazeno ime hosta |
| `tls_ct_logs` | Pretraga Certificate Transparency logova putem crt.sh |
| `tls_ocsp` | Provjera OCSP staplinga i statusa opoziva |

</details>

<details>
<summary><b>scan_dns &mdash; DNS obavjestajni rad (7 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `domain` | string | Ciljna domena |

| Tehnika | Opis |
|---------|------|
| `dns_records` | Potpuna enumeracija zapisa &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analiza SPF, DKIM i DMARC zapisa |
| `dns_saas` | Detekcija SaaS/servisa putem CNAME i MX obrazaca (Slack, Zendesk itd.) |
| `dns_server` | Fingerprinting DNS servera (BIND, PowerDNS, Cloudflare itd.) |
| `dns_takeover` | Detekcija preuzimanja poddomene putem analize visecih CNAME-ova |
| `dns_zone` | Pokusaj prijenosa zone (AXFR) |
| `dns_caa` | Analiza CAA zapisa za ogranicenja certifikacijskih tijela |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/web fingerprinting (29 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `url` | string | Ciljni URL |

| Tehnika | Provajder | Opis |
|---------|-----------|------|
| `http_headers` | HTTP | Analiza zaglavlja odgovora i identifikacija servera |
| `http_header_order` | HTTP | Fingerprint redoslijeda zaglavlja (potpis serverskog softvera) |
| `http_security_headers` | HTTP | Revizija sigurnosnih zaglavlja (CSP, HSTS, X-Frame-Options itd.) |
| `http_cookies` | HTTP | Analiza kolacica &mdash; zastave, prefiksi, detekcija okvira |
| `http_methods` | HTTP | Enumeracija dozvoljenih HTTP metoda (OPTIONS) |
| `http_cors` | HTTP | Analiza CORS politike i detekcija pogresne konfiguracije |
| `http_compression` | HTTP | Podrzani algoritmi kompresije (gzip, br, zstd) |
| `http_caching` | HTTP | Analiza zaglavlja kesiranja (detekcija CDN-a, reverse proxyja) |
| `http_etag` | HTTP | Analiza formata ETag-a za identifikaciju backenda |
| `http_error` | HTTP | Fingerprinting stranica gresaka (prilagodene vs. podrazumijevane stranice gresaka) |
| `http_redirect` | HTTP | Analiza lanca preusmjeravanja |
| `http_timing` | HTTP | Bazno vrijeme odgovora za profiliranje performansi servera |
| `http_favicon` | HTTP | Hash favicona (MurmurHash3) za identifikaciju tehnologija |
| `http_robots` | HTTP | Parsiranje robots.txt i ekstrakcija zabranjenih putanja |
| `http_sitemap` | HTTP | Otkrivanje mape sajta i ekstrakcija URL-ova |
| `http_wellknown` | HTTP | Otkrivanje .well-known krajnjih tacaka (security.txt, openid itd.) |
| `web_tech` | Web | Detekcija tehnologija putem HTML/JS/CSS obrazaca |
| `web_analytics` | Web | Detekcija servisa analitike i pracenja |
| `web_sourcemaps` | Web | Otkrivanje source map fajlova |
| `web_websocket` | Web | Detekcija WebSocket krajnjih tacaka |
| `web_graphql` | Web | Detekcija GraphQL krajnjih tacaka i introspekcija |
| `web_spa` | Web | Detekcija okvira jednostranicnih aplikacija |
| `web_cdn` | Web | Detekcija CDN-a putem zaglavlja odgovora i DNS-a |
| `web_meta` | Web | Analiza HTML meta tagova (generator, naznake okvira) |
| `web_feed` | Web | Otkrivanje RSS/Atom feedova |
| `h2_detect` | HTTP/2 | Detekcija podrske HTTP/2 protokola |
| `h2_fingerprint` | HTTP/2 | Fingerprinting HTTP/2 servera (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Detekcija podrske HTTP/3 (QUIC) putem Alt-Svc zaglavlja |
| `app_cms` | Application | Detekcija CMS-a (WordPress, Drupal, Joomla itd.) |

</details>

<details>
<summary><b>scan_paths &mdash; Obavjestajni rad o putanjama (5 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `url` | string | Ciljni URL |
| `categories` | string[] | Opciono &mdash; kategorije za provjeru (sensitive, git, debug, api, config) |

| Tehnika | Opis |
|---------|------|
| `path_sensitive` | Otkrivanje osjetljivih fajlova (sigurnosne kopije, konfiguracijski fajlovi, dumpovi baza podataka) |
| `path_robots` | Analiza robots.txt i sitemap.xml za skrivene putanje |
| `path_git` | Detekcija curenja Git repozitorija (.git/HEAD, .git/config) |
| `path_debug` | Otkrivanje debug krajnjih tacaka (phpinfo, server-status, debug konzole) |
| `path_api` | Otkrivanje verzija API-ja i krajnjih tacaka dokumentacije |

</details>

<details>
<summary><b>scan_waf &mdash; Detekcija i fingerprinting WAF/CDN (4 tehnike)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `url` | string | Ciljni URL |

| Tehnika | Opis |
|---------|------|
| `waf_detect` | Detekcija prisustva WAF-a putem analize zaglavlja odgovora i ponasanja |
| `waf_cdn` | Identifikacija CDN provajdera (Cloudflare, Akamai, Fastly itd.) |
| `waf_fingerprint` | Identifikacija WAF proizvoda i detekcija verzije |
| `waf_origin` | Otkrivanje izvornog IP-a iza WAF/CDN (zahtijeva `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondiranje na nivou servisa (12 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `host` | string | Ciljni host (IP ili domena) |
| `ports` | number[] | Opciono &mdash; specificni portovi za sondiranje |
| `service` | string | Opciono &mdash; specifican servis za sondiranje (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Tehnika | Provajder | Opis |
|---------|-----------|------|
| `ssh_probe` | SSH | Detekcija verzije SSH protokola i softvera |
| `ssh_algorithms` | SSH | Revizija SSH algoritama (KEX, sifre, MAC-ovi, tipovi kljuca hosta) |
| `ssh_hostkey_lookup` | SSH | Pretraga SSH kljuca hosta putem Shodana (zahtijeva `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Detekcija verzije MySQL-a i fingerprinting mogucnosti |
| `svc_postgres` | Service | Detekcija verzije PostgreSQL-a i provjera podrske za SSL |
| `svc_redis` | Service | Detekcija verzije Redisa i status autentifikacije |
| `svc_ftp` | Service | Analiza FTP banera i provjera anonimne prijave |
| `svc_vnc_rdp` | Service | Detekcija VNC/RDP servisa i procjena sigurnosti |
| `smtp_banner` | SMTP | Analiza SMTP banera i identifikacija MTA |
| `smtp_starttls` | SMTP | Podrska SMTP STARTTLS i inspekcija certifikata |
| `iot_detect` | IoT | Detekcija IoT uredjaja putem obrazaca banera i podrazumijevanih stranica |
| `iot_upnp` | IoT | Otkrivanje UPnP/SSDP uredjaja na lokalnoj mrezi |

</details>

<details>
<summary><b>enumerate &mdash; Prosirenje obima (8 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `domain` | string | Ciljna domena |

| Tehnika | Opis |
|---------|------|
| `enum_subdomains` | Enumeracija poddomena putem visestrukih metoda |
| `enum_wildcard` | Detekcija wildcard DNS-a |
| `enum_tld` | Prosirenje TLD-a (target.com -> target.net, target.org itd.) |
| `enum_related` | Otkrivanje povezanih domena putem dijeljene infrastrukture |
| `enum_asn` | Otkrivanje ASN susjeda &mdash; druge domene na istoj mrezi |
| `enum_ct` | Ekstrakcija poddomena iz Certificate Transparency logova |
| `enum_passive_dns` | Historija pasivnog DNS-a (zahtijeva `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Sazetak obima i pregled povrsine napada |

</details>

<details>
<summary><b>osint &mdash; OSINT obogacivanje (6 tehnika)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `target` | string | IP adresa ili domena za obogacivanje |
| `type` | `ip` \| `domain` | Opciono &mdash; tip cilja (automatski detektovan ako je izostavljen) |

| Tehnika | Auth | Opis |
|---------|------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan pretraga hosta &mdash; otvoreni portovi, baneri, ranjivosti, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys podaci hosta &mdash; servisi, TLS, autonomni sistem |
| `osint_reverse_ip` | Nema | Obrnuta IP pretraga &mdash; druge domene na istom IP-u |
| `osint_whois` | Nema | WHOIS registracijski podaci &mdash; registrar, datumi, nameserveri |
| `osint_webarchive` | Nema | Web Archive historija &mdash; prvi/zadnji snimak, ucestalost promjena |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal izvjestaj domena/IP &mdash; detekcije, kategorije, DNS |

</details>

<details>
<summary><b>analyze &mdash; Pasivna analiza fingerprinta (3 rezima)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `type` | `headers` \| `html` \| `banner` | Tip podataka za analizu |
| `data` | string | Sirovi podaci za analizu (zalijepite zaglavlja, HTML ili izlaz banera) |

| Rezim | Opis |
|-------|------|
| `fp_analyze_headers` | Pasivna analiza HTTP zaglavlja &mdash; detekcija servera, okvira, proxyja bez slanja prometa |
| `fp_analyze_html` | Pasivna HTML analiza &mdash; detekcija tehnologija, identifikacija okvira iz izvornog koda |
| `fp_analyze_banner` | Pasivna analiza banera &mdash; identifikacija servisa iz sirovog teksta banera |

</details>

<details>
<summary><b>correlate &mdash; Motor za korelaciju visestrukih signala (7 rezima)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Rezim korelacije |
| `signals` | object | Signali fingerprinta za korelaciju (variraju prema rezimu) |

| Rezim | Opis |
|-------|------|
| `fp_consistency` | Provjera konzistentnosti medjuslojnih signala &mdash; slazu li se TCP, TLS, HTTP i DNS fingerprintovi? |
| `fp_honeypot` | Detekcija honeypota &mdash; provjera nemogucih kombinacija servisa i anomalija ponasanja |
| `fp_spoofing` | Detekcija spoofinga &mdash; identificiranje neslaganja zaglavlja servera vs. stvarnog ponasanja |
| `fp_compare` | Usporedba profila fingerprinta dva hosta jedan pored drugog |
| `fp_topology` | Mapiranje topologije infrastrukture &mdash; CDN, load balancer, lanac reverse proxyja |
| `fp_c2` | Detekcija C2 okvira putem JARM, TLS, HTTP i korelacije tajminga |
| `fp_identify` | Identifikacija bazirana na hashovima prema bazi poznatih potpisa |

</details>

<details>
<summary><b>meta &mdash; Konfiguracija servera i podaci (3 rezima)</b></summary>

| Parametar | Tip | Opis |
|-----------|-----|------|
| `category` | string | Opciono &mdash; filtrirajte po kategoriji |

| Rezim | Opis |
|-------|------|
| `fp_sources` | Lista svih dostupnih izvora podataka sa konfiguracijom i statusom API kljuceva |
| `fp_config` | Konfiguracija servera &mdash; verzija, ucitani provajderi, broj tehnika |
| `fp_signatures` | Lista baze potpisa &mdash; JARM, baner, WAF, potpisi aplikacija |

</details>

---

### CLI Koristenje

```bash
# Listajte sve dostupne alate i tehnike
npx fingerprint-mcp --list

# Pokrenite bilo koji alat direktno
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

# OSINT alati (zahtijevaju API kljuceve)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Izvori Podataka (21)

| Izvor | Auth | Sta pruza |
|-------|------|-----------|
| TCP sondiranje | Nema | Skeniranje portova, dohvatanje banera, detekcija servisa |
| TLS/SSL analiza | Nema | Parsiranje certifikata, JARM fingerprinting, JA4X, enumeracija sifara, SNI testiranje |
| SSH sondiranje | Nema | Verzija protokola, revizija algoritama, detekcija softvera |
| HTTP analiza | Nema | Fingerprinting zaglavlja, hashiranje favicona, analiza kolacica, enumeracija metoda, CORS |
| Web detekcija | Nema | Detekcija tehnologija, analitika, source mape, WebSocket, GraphQL, SPA okviri |
| Otkrivanje putanja | Nema | Osjetljivi fajlovi, curenje gita, debug krajnje tacke, API verzije, robots.txt |
| DNS razrjesavanje | Nema | Enumeracija zapisa, analiza autentifikacije e-maila, detekcija SaaS-a, fingerprinting servera |
| WAF/CDN detekcija | Nema | Identifikacija WAF-a, detekcija CDN-a, fingerprinting WAF-a |
| Analiza tajminga | Nema | Bazno vrijeme odgovora, detekcija odstupanja sata |
| HTTP/2 i HTTP/3 | Nema | Detekcija i fingerprinting HTTP/2, otkrivanje HTTP/3 Alt-Svc |
| SMTP sondiranje | Nema | Analiza SMTP banera, inspekcija STARTTLS |
| IoT/Embedded | Nema | Detekcija IoT uredjaja, otkrivanje UPnP/SSDP |
| Detekcija aplikacija | Nema | Identifikacija CMS-a, okvira i platformi za e-trgovinu |
| Sondiranje servisa | Nema | Fingerprinting MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Detekcija infrastrukture | Nema | Identifikacija cloud provajdera, hosting provajdera, CDN-a |
| Motor korelacije | Nema | Konzistentnost signala, detekcija honeypota, detekcija spoofinga, mapiranje topologije |
| Motor identifikacije | Nema | Identifikacija bazirana na hashovima, detekcija C2, podudaranje potpisa |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Obavjestajni podaci o hostu &mdash; otvoreni portovi, baneri, ranjivosti, detekcija OS-a |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Podaci hosta &mdash; servisi, TLS certifikati, informacije o autonomnom sistemu |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Otkrivanje izvornog WAF-a, historija pasivnog DNS-a, historijski zapisi |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputacija domene/IP-a, rezultati detekcije, DNS historija, kategorije |

---

## Arhitektura

```
src/
  index.ts                # CLI ulazna tacka (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts         # Podesavanje MCP servera (stdio transport)
    tools.ts              # Registar alata — svih 13 kompozitnih alata registrirano ovdje
  types/
    index.ts              # Dijeljeni tipovi (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Rate limiter po provajderu
    cache.ts              # TTL kes za API odgovore
    require-key.ts        # Helper za validaciju API kljuceva
    murmurhash3.ts        # MurmurHash3 za hashiranje favicona
  composite/              # 13 orkestratora kompozitnih alata
    recon.ts              # Orkestrator punog izvidanja (quick/standard/deep)
    scan-ports.ts         # Kompozitno skeniranje portova
    scan-tls.ts           # Kompozitna TLS analiza
    scan-dns.ts           # Kompozitni DNS obavjestajni rad
    scan-http.ts          # Kompozitni HTTP fingerprinting
    scan-paths.ts         # Kompozitno otkrivanje putanja
    scan-waf.ts           # Kompozitna WAF/CDN detekcija
    scan-services.ts      # Kompozitno sondiranje servisa
    analyze.ts            # Kompozitna pasivna analiza
    correlate.ts          # Kompozitni motor korelacije
    enumerate.ts          # Kompozitno prosirenje obima
    osint.ts              # Kompozitno OSINT obogacivanje
    meta.ts               # Kompozitni meta servera
    helpers.ts            # Dijeljeni kompozitni helperi
  tcp/                    # Tehnike TCP sondiranja (3)
  tls/                    # Tehnike TLS/SSL analize (8)
  ssh/                    # Tehnike SSH sondiranja (3)
  http/                   # Tehnike HTTP fingerprintinga (16)
  web/                    # Tehnike detekcije web tehnologija (9)
  path/                   # Tehnike otkrivanja putanja (5)
  dns/                    # Tehnike DNS obavjestajnog rada (7)
  waf/                    # Tehnike WAF/CDN detekcije (4)
  timing/                 # Tehnike analize tajminga (2)
  h2/                     # Tehnike HTTP/2 i HTTP/3 (3)
  smtp/                   # Tehnike SMTP sondiranja (2)
  iot/                    # Tehnike detekcije IoT/embedded (2)
  app/                    # Tehnike detekcije aplikacija (3)
  service/                # Tehnike sondiranja servisa (5)
  infra/                  # Tehnike detekcije infrastrukture (3)
  correlation/            # Motor korelacije (5)
  identify/               # Motor identifikacije (3)
  passive/                # Pasivna analiza (3)
  osint/                  # Tehnike OSINT obogacivanja (6)
  enum/                   # Tehnike enumeracije (8)
  meta/                   # Meta alati (3)
  data/                   # Baze potpisa i biblioteke obrazaca
    jarm-signatures.ts    # Poznati JARM fingerprintovi (C2, serveri, CDN-ovi)
    waf-signatures.ts     # Potpisi za detekciju WAF-a
    service-banners.ts    # Obrasci banera servisa
    tech-patterns.ts      # Obrasci detekcije tehnologija
    favicon-hashes.ts     # Poznate MurmurHash3 vrijednosti favicona
    c2-signatures.ts      # Potpisi C2 okvira
    ...                   # 15+ baza potpisa/obrazaca
```

**Projektne odluke:**

- **13 kompozitnih alata, 103 tehnike** &mdash; Agent poziva alate visokog nivoa (`recon`, `scan_tls`, `scan_http`). Svaki kompozit orkestrira visestruke tehnike niskog nivoa i vraca korelirane rezultate. Ovo smanjuje opterecenje poziva alata uz odrzavanje granularnosti.
- **21 provajder, 1 server** &mdash; Svaki sloj fingerprintinga je nezavisan modul. Kompozitni orkestrator bira tehnike na osnovu konteksta i dubine.
- **Prvo aktivno, OSINT opciono** &mdash; 80+ tehnika radi direktnim sondiranjem cilja bez ikakvih API kljuceva. OSINT provajderi (Shodan, Censys, VirusTotal, SecurityTrails) dodaju obogacivanje, ali nikada nisu obavezni.
- **Rate limiteri po provajderu** &mdash; Svaki provajder ima svoju instancu `RateLimiter`-a. Aktivno sondiranje je ograniceno brzinom kako bi se izbjegla detekcija; OSINT API-ji su kalibrirani prema svojim kvotama.
- **TTL kesiranje** &mdash; DNS zapisi (10min), OSINT rezultati (15min), CT logovi (30min) se kesiraju da bi se izbjegle suvisne pretrage tokom visealatnih tokova rada.
- **Graceful degradacija** &mdash; Nedostajuci API kljucevi ne ruse server. OSINT alati vracaju opisne poruke: "Postavite SHODAN_API_KEY da omogucite Shodan pretragu hosta."
- **3 zavisnosti** &mdash; `@modelcontextprotocol/sdk`, `zod` i `cheerio`. Sav mrezni I/O putem nativnog `fetch()` i Node.js `net`/`tls`/`dns` modula. Bez nmap-a, bez eksternih binarnih fajlova.

---

## Ogranicenja

- OSINT alati (Shodan, Censys, VirusTotal, SecurityTrails) zahtijevaju API kljuceve za svoje odgovarajuce tehnike
- Censys besplatni nivo ogranicen na 250 upita/mjesec
- VirusTotal besplatni nivo ogranicen na 500 upita/dan
- Skeniranje portova koristi TCP connect (ne SYN skeniranje) &mdash; manje skriveno od nmap-a, ali ne zahtijeva root privilegije
- JARM fingerprinting zahtijeva direktan TCP pristup cilju (moze biti blokiran od strane firewalla)
- UPnP/SSDP otkrivanje radi samo na lokalnim mrezama
- Sondiranje servisa (MySQL, PostgreSQL, Redis) se povezuje, ali se ne autentificira
- Enumeracija poddomena se oslanja na CT logove i pasivne izvore (bez brute-force-a)
- Testirano na macOS / Linux (Windows nije testiran)

---

## Dio MCP Sigurnosnog Paketa

| Projekat | Domena | Alati |
|----------|--------|-------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Testiranje sigurnosti bazirano na pregledacu | 39 alata, Firefox, testiranje injekcija |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Cloud sigurnost (AWS/Azure/GCP) | 38 alata, 60+ provjera |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub sigurnosna pozicija | 39 alata, 45 provjera |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Obavjestajni rad o ranjivostima | 23 alata, 5 izvora |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT i izvidanje | 37 alata, 12 izvora |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web i obavjestajni rad o prijetnjama | 66 alata, 16 izvora |
| **fingerprint-mcp** | **Univerzalni digitalni fingerprinting** | **13 alata, 103 tehnike, 21 provajder** |

---

<p align="center">
<b>Samo za ovlasteno testiranje sigurnosti i procjenu.</b><br>
Uvijek se uvjerite da imate odgovarajucu autorizaciju prije obavljanja fingerprintinga na bilo kojem cilju.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 Licenca</a> &bull; Izgradeno sa Bun + TypeScript
</p>
