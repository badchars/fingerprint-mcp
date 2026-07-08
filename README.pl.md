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
  <strong>Polski</strong> |
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

<h3 align="center">Uniwersalny cyfrowy fingerprinting dla agentow AI.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondowanie uslug, JARM, JA4X, hashowanie favicon, topologia infrastruktury, wykrywanie C2, wzbogacanie OSINT &mdash; zunifikowane w jednym serwerze MCP.<br>
  Twoj agent AI otrzymuje <b>fingerprinting pelnego spektrum na zadanie</b>, a nie 11 odlaczonych narzedzi CLI i reczna korelacje.
</p>

<br>

<p align="center">
  <a href="#problem">Problem</a> &bull;
  <a href="#czym-si%C4%99-rozni">Czym Sie Rozni</a> &bull;
  <a href="#szybki-start">Szybki Start</a> &bull;
  <a href="#co-moze-ai">Co Moze AI</a> &bull;
  <a href="#dokumentacja-narzedzi-13-narzedzi-103-techniki">Narzedzia (13)</a> &bull;
  <a href="#zrodla-danych-21">Zrodla Danych</a> &bull;
  <a href="#architektura">Architektura</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Wspoltworz</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licencja"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Narzedzi">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Techniki">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Demo fingerprint-mcp" width="800">
</p>

---

## Problem

Fingerprinting serwera dzisiaj oznacza zonglowanie tuzinem odlaczonych narzedzi. Uruchamiasz `nmap` do skanowania portow, `testssl.sh` do analizy certyfikatow, `curl -I` do naglowkow HTTP, `dig` do DNS, `wafw00f` do wykrywania WAF, `ssh-audit` do SSH, oddzielne narzedzie JARM, Wappalyzer do wykrywania technologii &mdash; a potem spedzasz 30 minut na recznym krizowym odniesieniu wszystkiego w arkuszu kalkulacyjnym, zeby dowiedziec sie, co naprawde dziala.

```
Tradycyjny przeplyw pracy fingerprintingu:
  analiza certyfikatow TLS       ->  testssl.sh / openssl s_client
  przechwytywanie naglowkow HTTP ->  curl -I
  wykrywanie technologii web     ->  wappalyzer CLI
  rekonesans DNS                 ->  dig / nslookup / dnsenum
  skanowanie portow              ->  nmap -sV
  wykrywanie WAF                 ->  wafw00f
  audyt SSH                      ->  ssh-audit
  fingerprinting uslug           ->  nmap scripts
  fingerprint JARM               ->  jarm (oddzielne narzedzie)
  sprawdzanie baz OSINT          ->  shodan CLI, censys CLI
  korelacja wszystkiego          ->  recznie w arkuszu kalkulacyjnym
  ──────────────────────────────
  Razem: 11 narzedzi, 30+ minut, reczna korelacja
```

**fingerprint-mcp** daje Twojemu agentowi AI 13 zlozonych narzedzi opakowujacych 103 techniki fingerprintingu w 21 dostawcach przez [Model Context Protocol](https://modelcontextprotocol.io). Agent uruchamia wielowarstwowy fingerprinting rownolegle, koreluje sygnaly miedzy warstwami TCP/TLS/HTTP/DNS/SSH, wykrywa honeypoty i infrastrukture C2 oraz przedstawia zunifikowany obraz wywiadowczy &mdash; w jednej rozmowie.

```
Z fingerprint-mcp:
  Ty: "Zrob glebokie rozpoznanie target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 przez JARM (3fd21b20d00000...),
            certyfikat Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js za Cloudflare WAF,
            React SPA, Google Analytics, 14 naglowkow bezpieczenstwa przeanalizowanych
         -> DNS: rekordy A/AAAA/MX/TXT, SPF/DKIM/DMARC skonfigurowane,
            Slack + Google Workspace wykryte przez CNAME/MX
         -> Porty: 80, 443, 22 (OpenSSH 9.6), 8080 (serwer deweloperski)
         -> WAF: Cloudflare wykryty, IP zrodla odkryty przez bezposrednie polaczenie
         -> Enumeracja: 12 subdomen przez logi CT, wildcard DNS wykryty
         -> "target.com uruchamia nginx/1.24.0 z Express.js za
            Cloudflare WAF. IP zrodla 203.0.113.42 wystawiony na porcie 8080.
            TLS jest poprawnie skonfigurowany (rownowaznik A+), ale serwer
            deweloperski na 8080 nie ma ochrony WAF. 3 subdomeny wskazuja
            na wycofana infrastrukture — potencjalne ryzyko przejecia."
```

---

## Czym Sie Rozni

Istniejace narzedzia daja surowe dane po jednej warstwie na raz. fingerprint-mcp daje Twojemu agentowi AI mozliwosc **wnioskowania na wszystkich warstwach fingerprintingu jednoczesnie**.

<table>
<thead>
<tr>
<th></th>
<th>Tradycyjne Podejscie</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfejs</b></td>
<td>11 roznych narzedzi CLI z roznymi formatami wyjscia</td>
<td>MCP &mdash; agent AI wywoluje narzedzia konwersacyjnie</td>
</tr>
<tr>
<td><b>Techniki</b></td>
<td>Jedno narzedzie, jedna warstwa na raz</td>
<td>103 techniki w 21 dostawcach, uruchamiane rownolegle</td>
</tr>
<tr>
<td><b>Analiza TLS</b></td>
<td>Wyjscie testssl.sh, reczna analiza JARM oddzielnie</td>
<td>Agent laczy certyfikat + JARM + JA4X + zestawy szyfrow + SNI + logi CT w jednym wywolaniu</td>
</tr>
<tr>
<td><b>Korelacja</b></td>
<td>Kopiuj-wklej wyniki do arkusza kalkulacyjnego</td>
<td>Agent koreluje krzyzowo: "JARM pasuje do znanego frameworka C2, timing HTTP potwierdza honeypot"</td>
</tr>
<tr>
<td><b>Obejscie WAF</b></td>
<td>wafw00f wykrywa WAF, recznie szukasz zrodla</td>
<td>Agent wykrywa WAF, odkrywa IP zrodla i weryfikuje, ze serwuje ta sama zawartosc</td>
</tr>
<tr>
<td><b>Klucze API</b></td>
<td>Wymagane do Shodan, Censys itp.</td>
<td>80+ aktywnych technik dziala bez jakichkolwiek kluczy API; klucze odblokowuja wzbogacanie OSINT</td>
</tr>
<tr>
<td><b>Konfiguracja</b></td>
<td>Zainstaluj nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; jedno polecenie, zero konfiguracji</td>
</tr>
</tbody>
</table>

---

## Szybki Start

### Opcja 1: npx (bez instalacji)

```bash
npx fingerprint-mcp
```

Wszystkie 80+ aktywnych technik fingerprintingu dzialaja natychmiast. Klucze API nie sa wymagane do fingerprintingu TCP, TLS, SSH, HTTP, DNS, WAF, sciezek, uslug, timingu, IoT, SMTP i aplikacji.

### Opcja 2: Klonowanie

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Zmienne srodowiskowe (opcjonalne)

```bash
# Wzbogacanie OSINT (wszystkie opcjonalne — aktywny fingerprinting dziala bez jakichkolwiek kluczy)
export SHODAN_API_KEY=your-key           # Wlacza osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Wlacza osint_censys (darmowy: 250 zapytan/miesiac)
export CENSYS_API_SECRET=your-secret     # Sekret API Censys
export SECURITYTRAILS_API_KEY=your-key   # Wlacza waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Wlacza osint_virustotal (darmowy: 500 zapytan/dzien)
```

Wszystkie klucze API sa opcjonalne. Bez nich nadal otrzymujesz pelny fingerprinting TCP/TLS/SSH/HTTP/DNS/WAF/sciezek/uslug/timingu/IoT/SMTP/infrastruktury/aplikacji, korelacje, analize pasywna, enumeracje i narzedzia meta &mdash; 80+ technik dzialajacych przez bezposrednie sondowanie celu.

### Polacz z agentem AI

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Z npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Z lokalnym klonem
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Dodaj do `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / inni klienci MCP</b></summary>

Ten sam format konfiguracji JSON. Skieruj polecenie na `npx fingerprint-mcp` lub sciezke lokalnej instalacji.

</details>

### Zacznij pytac

```
Ty: "Zrob fingerprinting wszystkiego o target.com — TLS, stos HTTP, WAF, DNS, otwarte porty"
```

To wszystko. Agent automatycznie obsluguje wielowarstwowy fingerprinting, korelacje sygnalow i analize infrastruktury.

---

## Co Moze AI

### Szybki Rekonesans

```
Ty: "Szybki rekonesans target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: porty 80, 443, 22 otwarte
       -> TLS: certyfikat RSA Let's Encrypt, TLS 1.2+1.3, sygnatura JARM nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM skonfigurowane
       -> WAF: Cloudflare wykryty (naglowek cf-ray)
       -> "target.com to React SPA na Express.js za nginx/1.24.0,
          serwowana przez Cloudflare CDN. TLS poprawnie skonfigurowany z
          Let's Encrypt. SSH na porcie 22 z OpenSSH 9.6. Poczta
          obslugiwana przez Google Workspace z pelnym SPF/DKIM/DMARC."
```

### Doglebne Badanie TLS

```
Ty: "Przeanalizuj szczegolowo konfiguracje TLS suspicious-server.com"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Certyfikat: samopodpisany, CN=localhost, wygasl 47 dni temu
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (pasuje do domyslnego profilu Cobalt Strike)
       -> JA4X: fingerprint pasuje do znanego wzorca frameworka C2
       -> Zestawy szyfrow: akceptuje slabe szyfry (RC4, 3DES)
       -> SNI: odpowiada identycznie na kazda wartosc SNI
       -> Logi CT: certyfikat nie jest zarejestrowany (nie jest publicznie zaufany)
       -> "WYSOKIE RYZYKO: Konfiguracja TLS silnie wskazuje na infrastrukture C2.
          Samopodpisany wygasly certyfikat, fingerprint JARM pasuje do Cobalt Strike,
          akceptuje slabe szyfry i odpowiada na dowolne wartosci SNI.
          Zalecane natychmiastowe zbadanie i zablokowanie."
```

### Obejscie WAF i Odkrywanie Zrodla

```
Ty: "target.com jest za WAF. Czy mozesz znalezc serwer zrodlowy?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), strona wyzwania na podejrzane zadania
       -> DNS: rekord A wskazuje na IP Cloudflare 104.21.x.x
       -> Subdomeny: dev.target.com rozwiazuje do 203.0.113.42 (nie-Cloudflare)
       -> Bezposrednie polaczenie z 203.0.113.42:443 zwraca ten sam certyfikat TLS
       -> Historia SecurityTrails: zrodlo to 203.0.113.42 przed Cloudflare
       -> "Znaleziono IP zrodla: 203.0.113.42. Odkryty przez subdomene
          dev.target.com, ktora omija Cloudflare. Zrodlo serwuje ten sam
          certyfikat TLS i odpowiada na naglowek Host target.com.
          Zrodlo nie ma ochrony WAF — mozliwy bezposredni dostep."
```

### Wykrywanie Uslug na Hoscie

```
Ty: "Jakie uslugi dzialaja na 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, klucz hosta ED25519
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, wymagane uwierzytelnienie
       -> Port 5432: PostgreSQL 16.1, wymagany SSL
       -> Port 6379: Redis 7.2.4, BRAK uwierzytelnienia (otwarty)
       -> Port 8080: serwer deweloperski Node.js Express, CORS: *
       -> "KRYTYCZNE: Redis na porcie 6379 nie ma uwierzytelnienia — kazdy w
          sieci moze czytac/zapisywac dane. Serwer deweloperski Express na 8080
          ma wildcard CORS. MySQL i PostgreSQL prawidlowo wymagaja uwierzytelnienia.
          WordPress jest o 2 mniejsze wersje w tyle. Wymagane natychmiastowe
          dzialanie w sprawie Redisa i ekspozycji serwera deweloperskiego."
```

---

## Dokumentacja Narzedzi (13 narzedzi, 103 techniki)

<details open>
<summary><b>recon &mdash; Pelny rekonesans z wyborem technik opartym na glebokosci</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `url` | string | Docelowy URL do fingerprintingu |
| `depth` | `quick` \| `standard` \| `deep` | Glebokosc skanowania: quick=5 technik, standard=20, deep=50+ |

Orkiestruje techniki ze wszystkich dostawcow na podstawie poziomu glebokosci. Tryb quick daje szybki przeglad; tryb deep uruchamia wyczerpujacy fingerprinting wlaczajac enumeracje, OSINT i korelacje.

</details>

<details>
<summary><b>scan_ports &mdash; Skanowanie portow TCP z wykrywaniem uslug (3 techniki)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `host` | string | Host docelowy (IP lub domena) |
| `ports` | number[] | Opcjonalny &mdash; konkretne porty do skanowania (domyslnie: popularne porty) |

| Technika | Opis |
|----------|------|
| `tcp_probe` | Skanowanie TCP connect do wykrywania otwartych portow |
| `tcp_banner` | Przechwytywanie bannerow na otwartych portach do identyfikacji uslug |
| `tcp_analysis` | Analiza kombinacji portow i wnioskowanie uslug |

</details>

<details>
<summary><b>scan_tls &mdash; Kompletna analiza TLS/SSL (8 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `host` | string | Host docelowy (IP lub domena) |
| `port` | number | Opcjonalny &mdash; port TLS (domyslnie: 443) |

| Technika | Opis |
|----------|------|
| `tls_certificate` | Parsowanie certyfikatu X.509 &mdash; podmiot, wydawca, SAN, waznosc, lancuch |
| `tls_jarm` | Aktywny fingerprinting JARM &mdash; 10 sond TLS Client Hello, 62-znakowy hash |
| `tls_ja4x` | Pasywny fingerprinting TLS JA4X z wlasciwosci certyfikatu |
| `tls_ciphers` | Enumeracja zestawow szyfrow i analiza sily |
| `tls_protocols` | Wykrywanie obslugiwanych wersji protokolu TLS (SSLv3 do TLS 1.3) |
| `tls_sni` | Testowanie zachowania SNI &mdash; domyslny certyfikat vs. zadana nazwa hosta |
| `tls_ct_logs` | Wyszukiwanie w logach Certificate Transparency przez crt.sh |
| `tls_ocsp` | Sprawdzanie staplingu OCSP i statusu uniewaznien |

</details>

<details>
<summary><b>scan_dns &mdash; Wywiad DNS (7 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `domain` | string | Domena docelowa |

| Technika | Opis |
|----------|------|
| `dns_records` | Pelna enumeracja rekordow &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analiza rekordow SPF, DKIM i DMARC |
| `dns_saas` | Wykrywanie SaaS/uslug przez wzorce CNAME i MX (Slack, Zendesk itp.) |
| `dns_server` | Fingerprinting serwera DNS (BIND, PowerDNS, Cloudflare itp.) |
| `dns_takeover` | Wykrywanie przejecia subdomeny przez analize wiszacych CNAME |
| `dns_zone` | Proba transferu strefy (AXFR) |
| `dns_caa` | Analiza rekordow CAA dla ograniczen urzedow certyfikacji |

</details>

<details>
<summary><b>scan_http &mdash; Fingerprinting HTTP/web (29 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `url` | string | Docelowy URL |

| Technika | Dostawca | Opis |
|----------|---------|------|
| `http_headers` | HTTP | Analiza naglowkow odpowiedzi i identyfikacja serwera |
| `http_header_order` | HTTP | Fingerprint kolejnosci naglowkow (sygnatura oprogramowania serwera) |
| `http_security_headers` | HTTP | Audyt naglowkow bezpieczenstwa (CSP, HSTS, X-Frame-Options itp.) |
| `http_cookies` | HTTP | Analiza cookies &mdash; flagi, prefiksy, wykrywanie frameworka |
| `http_methods` | HTTP | Enumeracja dozwolonych metod HTTP (OPTIONS) |
| `http_cors` | HTTP | Analiza polityki CORS i wykrywanie blednej konfiguracji |
| `http_compression` | HTTP | Obslugiwane algorytmy kompresji (gzip, br, zstd) |
| `http_caching` | HTTP | Analiza naglowkow cache (wykrywanie CDN, reverse proxy) |
| `http_etag` | HTTP | Analiza formatu ETag do identyfikacji backendu |
| `http_error` | HTTP | Fingerprinting stron bledow (niestandardowe vs. domyslne strony bledow) |
| `http_redirect` | HTTP | Analiza lancucha przekierowan |
| `http_timing` | HTTP | Bazowy czas odpowiedzi do profilowania wydajnosci serwera |
| `http_favicon` | HTTP | Hash favicon (MurmurHash3) do identyfikacji technologii |
| `http_robots` | HTTP | Parsowanie robots.txt i ekstrakcja zabronionych sciezek |
| `http_sitemap` | HTTP | Odkrywanie mapy witryny i ekstrakcja URL |
| `http_wellknown` | HTTP | Odkrywanie endpointow .well-known (security.txt, openid itp.) |
| `web_tech` | Web | Wykrywanie technologii przez wzorce HTML/JS/CSS |
| `web_analytics` | Web | Wykrywanie uslug analityki i sledzenia |
| `web_sourcemaps` | Web | Odkrywanie plikow source map |
| `web_websocket` | Web | Wykrywanie endpointow WebSocket |
| `web_graphql` | Web | Wykrywanie endpointow GraphQL i introspekcja |
| `web_spa` | Web | Wykrywanie frameworkow aplikacji single-page |
| `web_cdn` | Web | Wykrywanie CDN przez naglowki odpowiedzi i DNS |
| `web_meta` | Web | Analiza metatagow HTML (generator, wskazowki frameworka) |
| `web_feed` | Web | Odkrywanie kanalow RSS/Atom |
| `h2_detect` | HTTP/2 | Wykrywanie obslugi protokolu HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Fingerprinting serwera HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Wykrywanie obslugi HTTP/3 (QUIC) przez naglowek Alt-Svc |
| `app_cms` | Application | Wykrywanie CMS (WordPress, Drupal, Joomla itp.) |

</details>

<details>
<summary><b>scan_paths &mdash; Wywiad sciezkowy (5 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `url` | string | Docelowy URL |
| `categories` | string[] | Opcjonalny &mdash; kategorie do sprawdzenia (sensitive, git, debug, api, config) |

| Technika | Opis |
|----------|------|
| `path_sensitive` | Odkrywanie wrazliwych plikow (pliki kopii zapasowych, pliki konfiguracyjne, zrzuty baz danych) |
| `path_robots` | Analiza robots.txt i sitemap.xml dla ukrytych sciezek |
| `path_git` | Wykrywanie wycieku repozytorium Git (.git/HEAD, .git/config) |
| `path_debug` | Odkrywanie endpointow debug (phpinfo, server-status, konsole debug) |
| `path_api` | Odkrywanie wersji API i endpointow dokumentacji |

</details>

<details>
<summary><b>scan_waf &mdash; Wykrywanie i fingerprinting WAF/CDN (4 techniki)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `url` | string | Docelowy URL |

| Technika | Opis |
|----------|------|
| `waf_detect` | Wykrywanie obecnosci WAF przez analize naglowkow odpowiedzi i zachowania |
| `waf_cdn` | Identyfikacja dostawcy CDN (Cloudflare, Akamai, Fastly itp.) |
| `waf_fingerprint` | Identyfikacja produktu WAF i wykrywanie wersji |
| `waf_origin` | Odkrywanie IP zrodla za WAF/CDN (wymaga `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondowanie na poziomie uslug (12 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `host` | string | Host docelowy (IP lub domena) |
| `ports` | number[] | Opcjonalny &mdash; konkretne porty do sondowania |
| `service` | string | Opcjonalny &mdash; konkretna usluga do sondowania (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Technika | Dostawca | Opis |
|----------|---------|------|
| `ssh_probe` | SSH | Wykrywanie wersji protokolu SSH i oprogramowania |
| `ssh_algorithms` | SSH | Audyt algorytmow SSH (KEX, szyfry, MAC, typy kluczy hosta) |
| `ssh_hostkey_lookup` | SSH | Wyszukiwanie klucza hosta SSH przez Shodan (wymaga `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Wykrywanie wersji MySQL i fingerprinting mozliwosci |
| `svc_postgres` | Service | Wykrywanie wersji PostgreSQL i sprawdzanie obslugi SSL |
| `svc_redis` | Service | Wykrywanie wersji Redis i status uwierzytelniania |
| `svc_ftp` | Service | Analiza bannera FTP i sprawdzanie anonimowego logowania |
| `svc_vnc_rdp` | Service | Wykrywanie uslug VNC/RDP i ocena bezpieczenstwa |
| `smtp_banner` | SMTP | Analiza bannera SMTP i identyfikacja MTA |
| `smtp_starttls` | SMTP | Obsluga SMTP STARTTLS i inspekcja certyfikatu |
| `iot_detect` | IoT | Wykrywanie urzadzen IoT przez wzorce bannerow i domyslne strony |
| `iot_upnp` | IoT | Odkrywanie urzadzen UPnP/SSDP w sieci lokalnej |

</details>

<details>
<summary><b>enumerate &mdash; Rozszerzanie zakresu (8 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `domain` | string | Domena docelowa |

| Technika | Opis |
|----------|------|
| `enum_subdomains` | Enumeracja subdomen przez wiele metod |
| `enum_wildcard` | Wykrywanie wildcard DNS |
| `enum_tld` | Rozszerzenie TLD (target.com -> target.net, target.org itp.) |
| `enum_related` | Odkrywanie powiazanych domen przez wspolna infrastrukture |
| `enum_asn` | Odkrywanie sasiadow ASN &mdash; inne domeny w tej samej sieci |
| `enum_ct` | Ekstrakcja subdomen z logow Certificate Transparency |
| `enum_passive_dns` | Historia pasywnego DNS (wymaga `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Podsumowanie zakresu i przeglad powierzchni ataku |

</details>

<details>
<summary><b>osint &mdash; Wzbogacanie OSINT (6 technik)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `target` | string | Adres IP lub domena do wzbogacenia |
| `type` | `ip` \| `domain` | Opcjonalny &mdash; typ celu (wykrywany automatycznie jesli pominieto) |

| Technika | Auth | Opis |
|----------|------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Wyszukiwanie hosta Shodan &mdash; otwarte porty, bannery, podatnosci, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Dane hosta Censys &mdash; uslugi, TLS, system autonomiczny |
| `osint_reverse_ip` | Brak | Odwrocone wyszukiwanie IP &mdash; inne domeny na tym samym IP |
| `osint_whois` | Brak | Dane rejestracji WHOIS &mdash; rejestrator, daty, serwery nazw |
| `osint_webarchive` | Brak | Historia Web Archive &mdash; pierwszy/ostatni snapshot, czestotliwosc zmian |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Raport VirusTotal domena/IP &mdash; wykrycia, kategorie, DNS |

</details>

<details>
<summary><b>analyze &mdash; Pasywna analiza fingerprinta (3 tryby)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `type` | `headers` \| `html` \| `banner` | Typ danych do analizy |
| `data` | string | Surowe dane do analizy (wklej naglowki, HTML lub wyjscie bannera) |

| Tryb | Opis |
|------|------|
| `fp_analyze_headers` | Pasywna analiza naglowkow HTTP &mdash; wykrywanie serwera, frameworka, proxy bez wysylania ruchu |
| `fp_analyze_html` | Pasywna analiza HTML &mdash; wykrywanie technologii, identyfikacja frameworka ze zrodla |
| `fp_analyze_banner` | Pasywna analiza bannera &mdash; identyfikacja uslug z surowego tekstu bannera |

</details>

<details>
<summary><b>correlate &mdash; Silnik korelacji wielu sygnalow (7 trybow)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Tryb korelacji |
| `signals` | object | Sygnaly fingerprinta do korelacji (roznia sie w zaleznosci od trybu) |

| Tryb | Opis |
|------|------|
| `fp_consistency` | Sprawdzenie spojnosci sygnalow miedzywarstwowych &mdash; czy fingerprinty TCP, TLS, HTTP i DNS sa zgodne? |
| `fp_honeypot` | Wykrywanie honeypotow &mdash; sprawdzanie niemozliwych kombinacji uslug i anomalii behawioralnych |
| `fp_spoofing` | Wykrywanie spoofingu &mdash; identyfikacja niespojnosci naglowkow serwera vs. faktyczne zachowanie |
| `fp_compare` | Porownanie obok siebie profili fingerprintow dwoch hostow |
| `fp_topology` | Mapowanie topologii infrastruktury &mdash; lancuch CDN, load balancer, reverse proxy |
| `fp_c2` | Wykrywanie frameworka C2 przez korelacje JARM, TLS, HTTP i timingu |
| `fp_identify` | Identyfikacja oparta na hashach wobec bazy znanych sygnatur |

</details>

<details>
<summary><b>meta &mdash; Konfiguracja serwera i dane (3 tryby)</b></summary>

| Parametr | Typ | Opis |
|----------|-----|------|
| `category` | string | Opcjonalny &mdash; filtruj wedlug kategorii |

| Tryb | Opis |
|------|------|
| `fp_sources` | Lista wszystkich dostepnych zrodel danych z konfiguracja i statusem kluczy API |
| `fp_config` | Konfiguracja serwera &mdash; wersja, zaladowani dostawcy, liczba technik |
| `fp_signatures` | Lista bazy sygnatur &mdash; sygnatury JARM, bannerow, WAF, aplikacji |

</details>

---

### Uzycie CLI

```bash
# Wyswietl wszystkie dostepne narzedzia i techniki
npx fingerprint-mcp --list

# Uruchom dowolne narzedzie bezposrednio
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

# Narzedzia OSINT (wymagaja kluczy API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Zrodla Danych (21)

| Zrodlo | Auth | Co zapewnia |
|--------|------|-------------|
| Sondowanie TCP | Brak | Skanowanie portow, przechwytywanie bannerow, wykrywanie uslug |
| Analiza TLS/SSL | Brak | Parsowanie certyfikatow, fingerprinting JARM, JA4X, enumeracja szyfrow, testowanie SNI |
| Sondowanie SSH | Brak | Wersja protokolu, audyt algorytmow, wykrywanie oprogramowania |
| Analiza HTTP | Brak | Fingerprinting naglowkow, hashowanie favicon, analiza cookies, enumeracja metod, CORS |
| Wykrywanie web | Brak | Wykrywanie technologii, analityka, source mapy, WebSocket, GraphQL, frameworki SPA |
| Odkrywanie sciezek | Brak | Wrazliwe pliki, wycieki git, endpointy debug, wersje API, robots.txt |
| Rozwiazywanie DNS | Brak | Enumeracja rekordow, analiza uwierzytelniania email, wykrywanie SaaS, fingerprinting serwera |
| Wykrywanie WAF/CDN | Brak | Identyfikacja WAF, wykrywanie CDN, fingerprinting WAF |
| Analiza timingu | Brak | Bazowy czas odpowiedzi, wykrywanie przesuniecia zegara |
| HTTP/2 i HTTP/3 | Brak | Wykrywanie i fingerprinting HTTP/2, odkrywanie HTTP/3 Alt-Svc |
| Sondowanie SMTP | Brak | Analiza bannera SMTP, inspekcja STARTTLS |
| IoT/Embedded | Brak | Wykrywanie urzadzen IoT, odkrywanie UPnP/SSDP |
| Wykrywanie aplikacji | Brak | Identyfikacja CMS, frameworkow i platform e-commerce |
| Sondowanie uslug | Brak | Fingerprinting MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Wykrywanie infrastruktury | Brak | Identyfikacja dostawcy chmury, hostingu, CDN |
| Silnik korelacji | Brak | Spojnosc sygnalow, wykrywanie honeypotow, wykrywanie spoofingu, mapowanie topologii |
| Silnik identyfikacji | Brak | Identyfikacja oparta na hashach, wykrywanie C2, dopasowywanie sygnatur |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Wywiad o hoscie &mdash; otwarte porty, bannery, podatnosci, wykrywanie OS |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Dane hosta &mdash; uslugi, certyfikaty TLS, informacje o systemie autonomicznym |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Odkrywanie zrodla WAF, historia pasywnego DNS, rekordy historyczne |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputacja domeny/IP, wyniki wykrywania, historia DNS, kategorie |

---

## Architektura

```
src/
  index.ts                # Punkt wejscia CLI (--help, --list, --tool, serwer stdio)
  protocol/
    mcp-server.ts         # Konfiguracja serwera MCP (transport stdio)
    tools.ts              # Rejestr narzedzi — wszystkie 13 zlozonych narzedzi zarejestrowanych tutaj
  types/
    index.ts              # Wspoldzielone typy (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Rate limiter per dostawca
    cache.ts              # Cache TTL dla odpowiedzi API
    require-key.ts        # Helper walidacji kluczy API
    murmurhash3.ts        # MurmurHash3 do hashowania favicon
  composite/              # 13 orkiestratorow zlozonych narzedzi
    recon.ts              # Orkiestrator pelnego rekonesansu (quick/standard/deep)
    scan-ports.ts         # Zlozony skan portow
    scan-tls.ts           # Zlozona analiza TLS
    scan-dns.ts           # Zlozony wywiad DNS
    scan-http.ts          # Zlozony fingerprinting HTTP
    scan-paths.ts         # Zlozone odkrywanie sciezek
    scan-waf.ts           # Zlozone wykrywanie WAF/CDN
    scan-services.ts      # Zlozone sondowanie uslug
    analyze.ts            # Zlozona analiza pasywna
    correlate.ts          # Zlozony silnik korelacji
    enumerate.ts          # Zlozone rozszerzanie zakresu
    osint.ts              # Zlozone wzbogacanie OSINT
    meta.ts               # Zlozony meta serwera
    helpers.ts            # Wspoldzielone helpery zlozonych
  tcp/                    # Techniki sondowania TCP (3)
  tls/                    # Techniki analizy TLS/SSL (8)
  ssh/                    # Techniki sondowania SSH (3)
  http/                   # Techniki fingerprintingu HTTP (16)
  web/                    # Techniki wykrywania technologii web (9)
  path/                   # Techniki odkrywania sciezek (5)
  dns/                    # Techniki wywiadu DNS (7)
  waf/                    # Techniki wykrywania WAF/CDN (4)
  timing/                 # Techniki analizy timingu (2)
  h2/                     # Techniki HTTP/2 i HTTP/3 (3)
  smtp/                   # Techniki sondowania SMTP (2)
  iot/                    # Techniki wykrywania IoT/embedded (2)
  app/                    # Techniki wykrywania aplikacji (3)
  service/                # Techniki sondowania uslug (5)
  infra/                  # Techniki wykrywania infrastruktury (3)
  correlation/            # Silnik korelacji (5)
  identify/               # Silnik identyfikacji (3)
  passive/                # Analiza pasywna (3)
  osint/                  # Techniki wzbogacania OSINT (6)
  enum/                   # Techniki enumeracji (8)
  meta/                   # Narzedzia meta (3)
  data/                   # Bazy sygnatur i biblioteki wzorcow
    jarm-signatures.ts    # Znane fingerprinty JARM (C2, serwery, CDN)
    waf-signatures.ts     # Sygnatury wykrywania WAF
    service-banners.ts    # Wzorce bannerow uslug
    tech-patterns.ts      # Wzorce wykrywania technologii
    favicon-hashes.ts     # Znane wartosci MurmurHash3 favicon
    c2-signatures.ts      # Sygnatury frameworkow C2
    ...                   # 15+ baz sygnatur/wzorcow
```

**Decyzje projektowe:**

- **13 zlozonych narzedzi, 103 techniki** &mdash; Agent wywoluje narzedzia wysokiego poziomu (`recon`, `scan_tls`, `scan_http`). Kazde zlozone narzedzie orkiestruje wiele technik niskiego poziomu i zwraca skorelowane wyniki. To redukuje narzut wywolan narzedzi zachowujac granularnosc.
- **21 dostawcow, 1 serwer** &mdash; Kazda warstwa fingerprintingu jest niezaleznym modulem. Zlozony orkiestrator wybiera techniki na podstawie kontekstu i glebokosci.
- **Najpierw aktywne, OSINT opcjonalnie** &mdash; 80+ technik dziala przez bezposrednie sondowanie celu bez jakichkolwiek kluczy API. Dostawcy OSINT (Shodan, Censys, VirusTotal, SecurityTrails) dodaja wzbogacenie, ale nigdy nie sa wymagani.
- **Rate limitery per dostawca** &mdash; Kazdy dostawca ma wlasna instancje `RateLimiter`. Aktywne sondowanie jest ograniczone szybkoscia, aby uniknac wykrycia; API OSINT sa skalibrowane do swoich limitow.
- **Cache TTL** &mdash; Rekordy DNS (10min), wyniki OSINT (15min), logi CT (30min) sa cachowane, aby uniknac nadmiarowych wyszukiwan podczas wielonarzedziowych przeplywow pracy.
- **Lagodna degradacja** &mdash; Brakujace klucze API nie powoduja awarii serwera. Narzedzia OSINT zwracaja opisowe komunikaty: "Ustaw SHODAN_API_KEY, aby wlaczyc wyszukiwanie hostow Shodan."
- **3 zaleznosci** &mdash; `@modelcontextprotocol/sdk`, `zod` i `cheerio`. Cale sieciowe I/O przez natywne `fetch()` i moduly Node.js `net`/`tls`/`dns`. Bez nmap, bez zewnetrznych plikow binarnych.

---

## Ograniczenia

- Narzedzia OSINT (Shodan, Censys, VirusTotal, SecurityTrails) wymagaja kluczy API dla swoich odpowiednich technik
- Darmowy plan Censys ograniczony do 250 zapytan/miesiac
- Darmowy plan VirusTotal ograniczony do 500 zapytan/dzien
- Skanowanie portow uzywa TCP connect (nie skanowania SYN) &mdash; mniej ukradkowe niz nmap, ale nie wymaga uprawnien root
- Fingerprinting JARM wymaga bezposredniego dostepu TCP do celu (moze byc blokowany przez zapory sieciowe)
- Odkrywanie UPnP/SSDP dziala tylko w sieciach lokalnych
- Sondowanie uslug (MySQL, PostgreSQL, Redis) laczy sie, ale nie uwierzytelnia
- Enumeracja subdomen opiera sie na logach CT i zrodlach pasywnych (bez brute-force)
- Testowane na macOS / Linux (Windows nie testowany)

---

## Czesc Pakietu Bezpieczenstwa MCP

| Projekt | Domena | Narzedzia |
|---------|--------|-----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Testy bezpieczenstwa oparte na przegladarce | 39 narzedzi, Firefox, testy iniekcji |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bezpieczenstwo chmury (AWS/Azure/GCP) | 38 narzedzi, 60+ kontroli |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postawa bezpieczenstwa GitHub | 39 narzedzi, 45 kontroli |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Wywiad o podatnosciach | 23 narzedzia, 5 zrodel |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT i rekonesans | 37 narzedzi, 12 zrodel |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web i wywiad o zagrozeniach | 66 narzedzi, 16 zrodel |
| **fingerprint-mcp** | **Uniwersalny cyfrowy fingerprinting** | **13 narzedzi, 103 techniki, 21 dostawcow** |

---

<p align="center">
<b>Wylacznie do autoryzowanych testow bezpieczenstwa i ocen.</b><br>
Zawsze upewnij sie, ze masz odpowiednia autoryzacje przed wykonaniem fingerprintingu na jakimkolwiek celu.
</p>

<p align="center">
  <a href="LICENSE">Licencja AGPL-3.0</a> &bull; Zbudowane z Bun + TypeScript
</p>
