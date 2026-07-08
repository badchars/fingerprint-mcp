<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <strong>Italiano</strong> |
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

<h3 align="center">Fingerprinting digitale universale per agenti AI.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondaggio servizi, JARM, JA4X, hashing favicon, topologia dell'infrastruttura, rilevamento C2, arricchimento OSINT &mdash; unificati in un unico server MCP.<br>
  Il tuo agente AI ottiene il <b>fingerprinting a spettro completo su richiesta</b>, non 11 strumenti CLI scollegati e correlazione manuale.
</p>

<br>

<p align="center">
  <a href="#il-problema">Il Problema</a> &bull;
  <a href="#in-cosa-%C3%A8-diverso">In Cosa è Diverso</a> &bull;
  <a href="#avvio-rapido">Avvio Rapido</a> &bull;
  <a href="#cosa-pu%C3%B2-fare-lai">Cosa Può Fare l'AI</a> &bull;
  <a href="#riferimento-strumenti-13-strumenti-103-tecniche">Strumenti (13)</a> &bull;
  <a href="#fonti-dati-21">Fonti Dati</a> &bull;
  <a href="#architettura">Architettura</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Contribuire</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licenza"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Strumenti">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Tecniche">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Demo di fingerprint-mcp" width="800">
</p>

---

## Il Problema

Fare il fingerprinting di un server oggi significa destreggiarsi tra una dozzina di strumenti scollegati. Esegui `nmap` per la scansione delle porte, `testssl.sh` per l'analisi dei certificati, `curl -I` per gli header HTTP, `dig` per il DNS, `wafw00f` per il rilevamento WAF, `ssh-audit` per SSH, uno strumento JARM separato, Wappalyzer per il rilevamento delle tecnologie &mdash; e poi passi 30 minuti a correlare manualmente tutto in un foglio di calcolo per capire cosa sta realmente girando.

```
Flusso di lavoro tradizionale del fingerprinting:
  analisi certificati TLS        ->  testssl.sh / openssl s_client
  cattura header HTTP            ->  curl -I
  rilevamento tecnologie web     ->  wappalyzer CLI
  ricognizione DNS               ->  dig / nslookup / dnsenum
  scansione porte                ->  nmap -sV
  rilevamento WAF                ->  wafw00f
  audit SSH                      ->  ssh-audit
  fingerprinting servizi         ->  nmap scripts
  fingerprint JARM               ->  jarm (strumento separato)
  verifica database OSINT        ->  shodan CLI, censys CLI
  correlazione di tutto          ->  manualmente in un foglio di calcolo
  ──────────────────────────────
  Totale: 11 strumenti, 30+ minuti, correlazione manuale
```

**fingerprint-mcp** fornisce al tuo agente AI 13 strumenti compositi che racchiudono 103 tecniche di fingerprinting attraverso 21 provider tramite il [Model Context Protocol](https://modelcontextprotocol.io). L'agente esegue fingerprinting multi-livello in parallelo, correla i segnali tra i livelli TCP/TLS/HTTP/DNS/SSH, rileva honeypot e infrastrutture C2, e presenta un quadro di intelligence unificato &mdash; in una singola conversazione.

```
Con fingerprint-mcp:
  Tu: "Fai una ricognizione approfondita su target.com"

  Agente: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 tramite JARM (3fd21b20d00000...),
            certificato Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js dietro Cloudflare WAF,
            React SPA, Google Analytics, 14 header di sicurezza analizzati
         -> DNS: record A/AAAA/MX/TXT, SPF/DKIM/DMARC configurati,
            Slack + Google Workspace rilevati tramite CNAME/MX
         -> Porte: 80, 443, 22 (OpenSSH 9.6), 8080 (server di sviluppo)
         -> WAF: Cloudflare rilevato, IP di origine scoperto tramite connessione diretta
         -> Enumerazione: 12 sottodomini tramite log CT, DNS wildcard rilevato
         -> "target.com esegue nginx/1.24.0 con Express.js dietro
            Cloudflare WAF. IP di origine 203.0.113.42 esposto sulla porta 8080.
            TLS è configurato correttamente (equivalente A+) ma il server
            di sviluppo sulla 8080 non ha protezione WAF. 3 sottodomini puntano a
            infrastruttura dismessa — potenziale rischio di takeover."
```

---

## In Cosa è Diverso

Gli strumenti esistenti ti danno dati grezzi un livello alla volta. fingerprint-mcp dà al tuo agente AI la capacità di **ragionare su tutti i livelli di fingerprinting simultaneamente**.

<table>
<thead>
<tr>
<th></th>
<th>Approccio Tradizionale</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfaccia</b></td>
<td>11 strumenti CLI diversi con formati di output diversi</td>
<td>MCP &mdash; l'agente AI chiama gli strumenti in modo conversazionale</td>
</tr>
<tr>
<td><b>Tecniche</b></td>
<td>Uno strumento, un livello alla volta</td>
<td>103 tecniche su 21 provider, eseguite in parallelo</td>
</tr>
<tr>
<td><b>Analisi TLS</b></td>
<td>Output di testssl.sh, analisi JARM manuale separata</td>
<td>L'agente combina certificato + JARM + JA4X + suite di cifratura + SNI + log CT in una sola chiamata</td>
</tr>
<tr>
<td><b>Correlazione</b></td>
<td>Copia-incolla dei risultati in un foglio di calcolo</td>
<td>L'agente correla incrociando: "JARM corrisponde a un framework C2 noto, il timing HTTP conferma un honeypot"</td>
</tr>
<tr>
<td><b>Bypass WAF</b></td>
<td>wafw00f rileva il WAF, cerchi manualmente l'origine</td>
<td>L'agente rileva il WAF, scopre l'IP di origine e verifica che serva lo stesso contenuto</td>
</tr>
<tr>
<td><b>Chiavi API</b></td>
<td>Richieste per Shodan, Censys, ecc.</td>
<td>80+ tecniche attive funzionano senza alcuna chiave API; le chiavi sbloccano l'arricchimento OSINT</td>
</tr>
<tr>
<td><b>Configurazione</b></td>
<td>Installa nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; un comando, zero configurazione</td>
</tr>
</tbody>
</table>

---

## Avvio Rapido

### Opzione 1: npx (senza installazione)

```bash
npx fingerprint-mcp
```

Tutte le 80+ tecniche di fingerprinting attivo funzionano immediatamente. Non sono richieste chiavi API per il fingerprinting TCP, TLS, SSH, HTTP, DNS, WAF, percorsi, servizi, timing, IoT, SMTP e applicazioni.

### Opzione 2: Clone

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Variabili d'ambiente (opzionali)

```bash
# Arricchimento OSINT (tutte opzionali — il fingerprinting attivo funziona senza alcuna chiave)
export SHODAN_API_KEY=your-key           # Abilita osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Abilita osint_censys (gratuito: 250 query/mese)
export CENSYS_API_SECRET=your-secret     # Segreto API Censys
export SECURITYTRAILS_API_KEY=your-key   # Abilita waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Abilita osint_virustotal (gratuito: 500 query/giorno)
```

Tutte le chiavi API sono opzionali. Senza di esse, ottieni comunque il fingerprinting completo TCP/TLS/SSH/HTTP/DNS/WAF/percorsi/servizi/timing/IoT/SMTP/infrastruttura/applicazioni, correlazione, analisi passiva, enumerazione e strumenti meta &mdash; 80+ tecniche che funzionano sondando direttamente il target.

### Connetti al tuo agente AI

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Con npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Con clone locale
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Aggiungi a `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / altri client MCP</b></summary>

Stesso formato di configurazione JSON. Punta il comando a `npx fingerprint-mcp` o al tuo percorso di installazione locale.

</details>

### Inizia a interrogare

```
Tu: "Fai il fingerprinting completo di target.com — TLS, stack HTTP, WAF, DNS, porte aperte"
```

Tutto qui. L'agente gestisce automaticamente il fingerprinting multi-livello, la correlazione dei segnali e l'analisi dell'infrastruttura.

---

## Cosa Può Fare l'AI

### Ricognizione Rapida

```
Tu: "Ricognizione rapida su target.com"

Agente: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: porte 80, 443, 22 aperte
       -> TLS: certificato RSA Let's Encrypt, TLS 1.2+1.3, firma JARM nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM configurati
       -> WAF: Cloudflare rilevato (header cf-ray)
       -> "target.com è una React SPA su Express.js dietro nginx/1.24.0,
          servita tramite Cloudflare CDN. TLS configurato correttamente con
          Let's Encrypt. SSH sulla porta 22 con OpenSSH 9.6. Email
          gestita da Google Workspace con SPF/DKIM/DMARC completi."
```

### Indagine TLS Approfondita

```
Tu: "Analizza nel dettaglio la configurazione TLS di suspicious-server.com"

Agente: -> scan_tls {host: "suspicious-server.com"}

       -> Certificato: auto-firmato, CN=localhost, scaduto 47 giorni fa
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (corrisponde al profilo predefinito di Cobalt Strike)
       -> JA4X: fingerprint corrispondente a pattern noto di framework C2
       -> Suite di cifratura: accetta cifrari deboli (RC4, 3DES)
       -> SNI: risponde identicamente a qualsiasi valore SNI
       -> Log CT: certificato non registrato (non pubblicamente attendibile)
       -> "ALTO RISCHIO: La configurazione TLS indica fortemente un'infrastruttura C2.
          Certificato auto-firmato scaduto, fingerprint JARM corrispondente a Cobalt Strike,
          accetta cifrari deboli e risponde a valori SNI arbitrari.
          Si raccomanda indagine immediata e blocco."
```

### Bypass WAF e Scoperta dell'Origine

```
Tu: "target.com è dietro un WAF. Riesci a trovare il server di origine?"

Agente: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), pagina di verifica su richieste sospette
       -> DNS: il record A punta all'IP Cloudflare 104.21.x.x
       -> Sottodomini: dev.target.com risolve a 203.0.113.42 (non-Cloudflare)
       -> Connessione diretta a 203.0.113.42:443 restituisce lo stesso certificato TLS
       -> Storico SecurityTrails: l'origine era 203.0.113.42 prima di Cloudflare
       -> "IP di origine trovato: 203.0.113.42. Scoperto tramite il sottodominio
          dev.target.com che bypassa Cloudflare. L'origine serve lo stesso
          certificato TLS e risponde all'header Host target.com.
          L'origine non ha protezione WAF — accesso diretto possibile."
```

### Scoperta Servizi su un Host

```
Tu: "Quali servizi sono in esecuzione su 10.0.1.50?"

Agente: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Porta 22: OpenSSH 8.9p1 Ubuntu, chiave host ED25519
       -> Porta 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Porta 3306: MySQL 8.0.36, autenticazione richiesta
       -> Porta 5432: PostgreSQL 16.1, SSL richiesto
       -> Porta 6379: Redis 7.2.4, NESSUNA autenticazione (aperto)
       -> Porta 8080: server di sviluppo Node.js Express, CORS: *
       -> "CRITICO: Redis sulla porta 6379 non ha autenticazione — chiunque sulla
          rete può leggere/scrivere dati. Il server di sviluppo Express sulla 8080
          ha CORS wildcard. MySQL e PostgreSQL richiedono correttamente l'autenticazione.
          WordPress è indietro di 2 versioni minori. Azione immediata necessaria
          su Redis e l'esposizione del server di sviluppo."
```

---

## Riferimento Strumenti (13 strumenti, 103 tecniche)

<details open>
<summary><b>recon &mdash; Ricognizione completa con selezione delle tecniche basata sulla profondità</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `url` | string | URL del target da analizzare |
| `depth` | `quick` \| `standard` \| `deep` | Profondità di scansione: quick=5 tecniche, standard=20, deep=50+ |

Orchestra le tecniche di tutti i provider in base al livello di profondità. La modalità quick fornisce una panoramica rapida; la modalità deep esegue un fingerprinting esaustivo inclusi enumerazione, OSINT e correlazione.

</details>

<details>
<summary><b>scan_ports &mdash; Scansione porte TCP con rilevamento servizi (3 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `host` | string | Host target (IP o dominio) |
| `ports` | number[] | Opzionale &mdash; porte specifiche da scansionare (predefinito: porte comuni) |

| Tecnica | Descrizione |
|---------|-------------|
| `tcp_probe` | Scansione TCP connect per rilevare porte aperte |
| `tcp_banner` | Cattura banner sulle porte aperte per l'identificazione dei servizi |
| `tcp_analysis` | Analisi delle combinazioni di porte e inferenza dei servizi |

</details>

<details>
<summary><b>scan_tls &mdash; Analisi TLS/SSL completa (8 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `host` | string | Host target (IP o dominio) |
| `port` | number | Opzionale &mdash; porta TLS (predefinito: 443) |

| Tecnica | Descrizione |
|---------|-------------|
| `tls_certificate` | Analisi certificato X.509 &mdash; soggetto, emittente, SAN, validità, catena |
| `tls_jarm` | Fingerprinting attivo JARM &mdash; 10 probe TLS Client Hello, hash di 62 caratteri |
| `tls_ja4x` | Fingerprinting TLS passivo JA4X dalle proprietà del certificato |
| `tls_ciphers` | Enumerazione suite di cifratura e analisi della robustezza |
| `tls_protocols` | Rilevamento versioni del protocollo TLS supportate (SSLv3 fino a TLS 1.3) |
| `tls_sni` | Test comportamento SNI &mdash; certificato predefinito vs. hostname richiesto |
| `tls_ct_logs` | Ricerca nei log Certificate Transparency tramite crt.sh |
| `tls_ocsp` | Verifica stapling OCSP e stato di revoca |

</details>

<details>
<summary><b>scan_dns &mdash; Intelligence DNS (7 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `domain` | string | Dominio target |

| Tecnica | Descrizione |
|---------|-------------|
| `dns_records` | Enumerazione completa dei record &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analisi record SPF, DKIM e DMARC |
| `dns_saas` | Rilevamento SaaS/servizi tramite pattern CNAME e MX (Slack, Zendesk, ecc.) |
| `dns_server` | Fingerprinting server DNS (BIND, PowerDNS, Cloudflare, ecc.) |
| `dns_takeover` | Rilevamento subdomain takeover tramite analisi CNAME pendenti |
| `dns_zone` | Tentativo di trasferimento di zona (AXFR) |
| `dns_caa` | Analisi record CAA per restrizioni sulle autorità di certificazione |

</details>

<details>
<summary><b>scan_http &mdash; Fingerprinting HTTP/web (29 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `url` | string | URL target |

| Tecnica | Provider | Descrizione |
|---------|----------|-------------|
| `http_headers` | HTTP | Analisi header di risposta e identificazione del server |
| `http_header_order` | HTTP | Fingerprint dell'ordine degli header (firma del software server) |
| `http_security_headers` | HTTP | Audit header di sicurezza (CSP, HSTS, X-Frame-Options, ecc.) |
| `http_cookies` | HTTP | Analisi cookie &mdash; flag, prefissi, rilevamento framework |
| `http_methods` | HTTP | Enumerazione metodi HTTP consentiti (OPTIONS) |
| `http_cors` | HTTP | Analisi policy CORS e rilevamento misconfigurazioni |
| `http_compression` | HTTP | Algoritmi di compressione supportati (gzip, br, zstd) |
| `http_caching` | HTTP | Analisi header cache (rilevamento CDN, reverse proxy) |
| `http_etag` | HTTP | Analisi formato ETag per identificazione backend |
| `http_error` | HTTP | Fingerprinting pagine di errore (personalizzate vs. predefinite) |
| `http_redirect` | HTTP | Analisi catena di redirect |
| `http_timing` | HTTP | Baseline timing di risposta per profilazione delle prestazioni del server |
| `http_favicon` | HTTP | Hash favicon (MurmurHash3) per identificazione tecnologie |
| `http_robots` | HTTP | Analisi robots.txt ed estrazione percorsi non consentiti |
| `http_sitemap` | HTTP | Scoperta sitemap ed estrazione URL |
| `http_wellknown` | HTTP | Scoperta endpoint .well-known (security.txt, openid, ecc.) |
| `web_tech` | Web | Rilevamento tecnologie tramite pattern HTML/JS/CSS |
| `web_analytics` | Web | Rilevamento servizi di analisi e tracciamento |
| `web_sourcemaps` | Web | Scoperta file source map |
| `web_websocket` | Web | Rilevamento endpoint WebSocket |
| `web_graphql` | Web | Rilevamento endpoint GraphQL e introspezione |
| `web_spa` | Web | Rilevamento framework applicazioni single-page |
| `web_cdn` | Web | Rilevamento CDN tramite header di risposta e DNS |
| `web_meta` | Web | Analisi meta tag HTML (generatore, indizi sul framework) |
| `web_feed` | Web | Scoperta feed RSS/Atom |
| `h2_detect` | HTTP/2 | Rilevamento supporto protocollo HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Fingerprinting server HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Rilevamento supporto HTTP/3 (QUIC) tramite header Alt-Svc |
| `app_cms` | Application | Rilevamento CMS (WordPress, Drupal, Joomla, ecc.) |

</details>

<details>
<summary><b>scan_paths &mdash; Intelligence sui percorsi (5 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `url` | string | URL target |
| `categories` | string[] | Opzionale &mdash; categorie da verificare (sensitive, git, debug, api, config) |

| Tecnica | Descrizione |
|---------|-------------|
| `path_sensitive` | Scoperta file sensibili (file di backup, file di configurazione, dump database) |
| `path_robots` | Analisi robots.txt e sitemap.xml per percorsi nascosti |
| `path_git` | Rilevamento leak repository Git (.git/HEAD, .git/config) |
| `path_debug` | Scoperta endpoint di debug (phpinfo, server-status, console di debug) |
| `path_api` | Scoperta versioni API e endpoint di documentazione |

</details>

<details>
<summary><b>scan_waf &mdash; Rilevamento e fingerprinting WAF/CDN (4 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `url` | string | URL target |

| Tecnica | Descrizione |
|---------|-------------|
| `waf_detect` | Rilevamento presenza WAF tramite analisi header di risposta e comportamento |
| `waf_cdn` | Identificazione provider CDN (Cloudflare, Akamai, Fastly, ecc.) |
| `waf_fingerprint` | Identificazione prodotto WAF e rilevamento versione |
| `waf_origin` | Scoperta IP di origine dietro WAF/CDN (richiede `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondaggio a livello di servizio (12 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `host` | string | Host target (IP o dominio) |
| `ports` | number[] | Opzionale &mdash; porte specifiche da sondare |
| `service` | string | Opzionale &mdash; servizio specifico da sondare (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Tecnica | Provider | Descrizione |
|---------|----------|-------------|
| `ssh_probe` | SSH | Rilevamento versione protocollo SSH e software |
| `ssh_algorithms` | SSH | Audit algoritmi SSH (KEX, cifrari, MAC, tipi di chiave host) |
| `ssh_hostkey_lookup` | SSH | Ricerca chiave host SSH tramite Shodan (richiede `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Rilevamento versione MySQL e fingerprinting delle capacità |
| `svc_postgres` | Service | Rilevamento versione PostgreSQL e verifica supporto SSL |
| `svc_redis` | Service | Rilevamento versione Redis e stato dell'autenticazione |
| `svc_ftp` | Service | Analisi banner FTP e verifica login anonimo |
| `svc_vnc_rdp` | Service | Rilevamento servizi VNC/RDP e valutazione della sicurezza |
| `smtp_banner` | SMTP | Analisi banner SMTP e identificazione MTA |
| `smtp_starttls` | SMTP | Supporto SMTP STARTTLS e ispezione certificato |
| `iot_detect` | IoT | Rilevamento dispositivi IoT tramite pattern banner e pagine predefinite |
| `iot_upnp` | IoT | Scoperta dispositivi UPnP/SSDP sulla rete locale |

</details>

<details>
<summary><b>enumerate &mdash; Espansione dello scope (8 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `domain` | string | Dominio target |

| Tecnica | Descrizione |
|---------|-------------|
| `enum_subdomains` | Enumerazione sottodomini tramite metodi multipli |
| `enum_wildcard` | Rilevamento DNS wildcard |
| `enum_tld` | Espansione TLD (target.com -> target.net, target.org, ecc.) |
| `enum_related` | Scoperta domini correlati tramite infrastruttura condivisa |
| `enum_asn` | Scoperta vicini ASN &mdash; altri domini sulla stessa rete |
| `enum_ct` | Estrazione sottodomini dai log Certificate Transparency |
| `enum_passive_dns` | Storico DNS passivo (richiede `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Riepilogo scope e panoramica della superficie di attacco |

</details>

<details>
<summary><b>osint &mdash; Arricchimento OSINT (6 tecniche)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `target` | string | Indirizzo IP o dominio da arricchire |
| `type` | `ip` \| `domain` | Opzionale &mdash; tipo di target (rilevato automaticamente se omesso) |

| Tecnica | Auth | Descrizione |
|---------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Ricerca host Shodan &mdash; porte aperte, banner, vulnerabilità, SO |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Dati host Censys &mdash; servizi, TLS, sistema autonomo |
| `osint_reverse_ip` | Nessuno | Ricerca IP inverso &mdash; altri domini sullo stesso IP |
| `osint_whois` | Nessuno | Dati registrazione WHOIS &mdash; registrar, date, nameserver |
| `osint_webarchive` | Nessuno | Storico Web Archive &mdash; primo/ultimo snapshot, frequenza modifiche |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Report VirusTotal dominio/IP &mdash; rilevamenti, categorie, DNS |

</details>

<details>
<summary><b>analyze &mdash; Analisi passiva del fingerprint (3 modalità)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Tipo di dati da analizzare |
| `data` | string | Dati grezzi da analizzare (incolla header, HTML o output banner) |

| Modalità | Descrizione |
|----------|-------------|
| `fp_analyze_headers` | Analisi passiva header HTTP &mdash; rilevamento server, framework, proxy senza inviare traffico |
| `fp_analyze_html` | Analisi passiva HTML &mdash; rilevamento tecnologie, identificazione framework dal sorgente |
| `fp_analyze_banner` | Analisi passiva banner &mdash; identificazione servizi dal testo grezzo del banner |

</details>

<details>
<summary><b>correlate &mdash; Motore di correlazione multi-segnale (7 modalità)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Modalità di correlazione |
| `signals` | object | Segnali fingerprint da correlare (variano per modalità) |

| Modalità | Descrizione |
|----------|-------------|
| `fp_consistency` | Verifica coerenza segnali cross-layer &mdash; i fingerprint TCP, TLS, HTTP e DNS concordano? |
| `fp_honeypot` | Rilevamento honeypot &mdash; verifica combinazioni di servizi impossibili e anomalie comportamentali |
| `fp_spoofing` | Rilevamento spoofing &mdash; identifica discrepanze tra header server e comportamento effettivo |
| `fp_compare` | Confronto affiancato dei profili fingerprint di due host |
| `fp_topology` | Mappatura topologia dell'infrastruttura &mdash; catena CDN, load balancer, reverse proxy |
| `fp_c2` | Rilevamento framework C2 tramite correlazione JARM, TLS, HTTP e timing |
| `fp_identify` | Identificazione basata su hash contro database di firme conosciute |

</details>

<details>
<summary><b>meta &mdash; Configurazione server e dati (3 modalità)</b></summary>

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `category` | string | Opzionale &mdash; filtra per categoria |

| Modalità | Descrizione |
|----------|-------------|
| `fp_sources` | Elenco di tutte le fonti dati disponibili con configurazione e stato chiavi API |
| `fp_config` | Configurazione server &mdash; versione, provider caricati, conteggio tecniche |
| `fp_signatures` | Elenco database firme &mdash; firme JARM, banner, WAF, applicazioni |

</details>

---

### Utilizzo CLI

```bash
# Elenca tutti gli strumenti e le tecniche disponibili
npx fingerprint-mcp --list

# Esegui qualsiasi strumento direttamente
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

# Strumenti OSINT (richiedono chiavi API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Fonti Dati (21)

| Fonte | Auth | Cosa fornisce |
|-------|------|---------------|
| Sondaggio TCP | Nessuno | Scansione porte, cattura banner, rilevamento servizi |
| Analisi TLS/SSL | Nessuno | Analisi certificati, fingerprinting JARM, JA4X, enumerazione cifrari, test SNI |
| Sondaggio SSH | Nessuno | Versione protocollo, audit algoritmi, rilevamento software |
| Analisi HTTP | Nessuno | Fingerprinting header, hashing favicon, analisi cookie, enumerazione metodi, CORS |
| Rilevamento web | Nessuno | Rilevamento tecnologie, analytics, source map, WebSocket, GraphQL, framework SPA |
| Scoperta percorsi | Nessuno | File sensibili, leak git, endpoint di debug, versioni API, robots.txt |
| Risoluzione DNS | Nessuno | Enumerazione record, analisi autenticazione email, rilevamento SaaS, fingerprinting server |
| Rilevamento WAF/CDN | Nessuno | Identificazione WAF, rilevamento CDN, fingerprinting WAF |
| Analisi timing | Nessuno | Baseline timing di risposta, rilevamento sfasamento orologio |
| HTTP/2 e HTTP/3 | Nessuno | Rilevamento e fingerprinting HTTP/2, scoperta HTTP/3 Alt-Svc |
| Sondaggio SMTP | Nessuno | Analisi banner SMTP, ispezione STARTTLS |
| IoT/Embedded | Nessuno | Rilevamento dispositivi IoT, scoperta UPnP/SSDP |
| Rilevamento applicazioni | Nessuno | Identificazione CMS, framework e piattaforme e-commerce |
| Sondaggio servizi | Nessuno | Fingerprinting MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Rilevamento infrastruttura | Nessuno | Identificazione provider cloud, hosting, CDN |
| Motore di correlazione | Nessuno | Coerenza segnali, rilevamento honeypot, rilevamento spoofing, mappatura topologia |
| Motore di identificazione | Nessuno | Identificazione basata su hash, rilevamento C2, corrispondenza firme |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Intelligence host &mdash; porte aperte, banner, vulnerabilità, rilevamento SO |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Dati host &mdash; servizi, certificati TLS, informazioni sistema autonomo |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Scoperta origine WAF, storico DNS passivo, record storici |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputazione dominio/IP, risultati rilevamento, storico DNS, categorie |

---

## Architettura

```
src/
  index.ts                # Punto di ingresso CLI (--help, --list, --tool, server stdio)
  protocol/
    mcp-server.ts         # Configurazione server MCP (trasporto stdio)
    tools.ts              # Registro strumenti — tutti i 13 strumenti compositi registrati qui
  types/
    index.ts              # Tipi condivisi (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Rate limiter per provider
    cache.ts              # Cache TTL per risposte API
    require-key.ts        # Helper validazione chiavi API
    murmurhash3.ts        # MurmurHash3 per hashing favicon
  composite/              # 13 orchestratori di strumenti compositi
    recon.ts              # Orchestratore ricognizione completa (quick/standard/deep)
    scan-ports.ts         # Composito scansione porte
    scan-tls.ts           # Composito analisi TLS
    scan-dns.ts           # Composito intelligence DNS
    scan-http.ts          # Composito fingerprinting HTTP
    scan-paths.ts         # Composito scoperta percorsi
    scan-waf.ts           # Composito rilevamento WAF/CDN
    scan-services.ts      # Composito sondaggio servizi
    analyze.ts            # Composito analisi passiva
    correlate.ts          # Composito motore di correlazione
    enumerate.ts          # Composito espansione scope
    osint.ts              # Composito arricchimento OSINT
    meta.ts               # Composito meta server
    helpers.ts            # Helper compositi condivisi
  tcp/                    # Tecniche sondaggio TCP (3)
  tls/                    # Tecniche analisi TLS/SSL (8)
  ssh/                    # Tecniche sondaggio SSH (3)
  http/                   # Tecniche fingerprinting HTTP (16)
  web/                    # Tecniche rilevamento tecnologie web (9)
  path/                   # Tecniche scoperta percorsi (5)
  dns/                    # Tecniche intelligence DNS (7)
  waf/                    # Tecniche rilevamento WAF/CDN (4)
  timing/                 # Tecniche analisi timing (2)
  h2/                     # Tecniche HTTP/2 e HTTP/3 (3)
  smtp/                   # Tecniche sondaggio SMTP (2)
  iot/                    # Tecniche rilevamento IoT/embedded (2)
  app/                    # Tecniche rilevamento applicazioni (3)
  service/                # Tecniche sondaggio servizi (5)
  infra/                  # Tecniche rilevamento infrastruttura (3)
  correlation/            # Motore di correlazione (5)
  identify/               # Motore di identificazione (3)
  passive/                # Analisi passiva (3)
  osint/                  # Tecniche arricchimento OSINT (6)
  enum/                   # Tecniche enumerazione (8)
  meta/                   # Strumenti meta (3)
  data/                   # Database di firme e librerie di pattern
    jarm-signatures.ts    # Fingerprint JARM conosciuti (C2, server, CDN)
    waf-signatures.ts     # Firme rilevamento WAF
    service-banners.ts    # Pattern banner servizi
    tech-patterns.ts      # Pattern rilevamento tecnologie
    favicon-hashes.ts     # Valori MurmurHash3 favicon conosciuti
    c2-signatures.ts      # Firme framework C2
    ...                   # 15+ database di firme/pattern
```

**Decisioni di design:**

- **13 strumenti compositi, 103 tecniche** &mdash; L'agente chiama strumenti di alto livello (`recon`, `scan_tls`, `scan_http`). Ogni composito orchestra molteplici tecniche di basso livello e restituisce risultati correlati. Questo riduce l'overhead delle chiamate mantenendo la granularità.
- **21 provider, 1 server** &mdash; Ogni livello di fingerprinting è un modulo indipendente. L'orchestratore composito seleziona le tecniche in base al contesto e alla profondità.
- **Prima l'attivo, OSINT opzionale** &mdash; 80+ tecniche funzionano sondando direttamente il target senza alcuna chiave API. I provider OSINT (Shodan, Censys, VirusTotal, SecurityTrails) aggiungono arricchimento ma non sono mai necessari.
- **Rate limiter per provider** &mdash; Ogni provider ha la propria istanza `RateLimiter`. Il sondaggio attivo è limitato per evitare il rilevamento; le API OSINT sono calibrate sulle loro quote.
- **Cache TTL** &mdash; I record DNS (10min), i risultati OSINT (15min), i log CT (30min) sono memorizzati in cache per evitare ricerche ridondanti durante flussi di lavoro multi-strumento.
- **Degradazione graduale** &mdash; Le chiavi API mancanti non fanno crashare il server. Gli strumenti OSINT restituiscono messaggi descrittivi: "Imposta SHODAN_API_KEY per abilitare la ricerca host Shodan."
- **3 dipendenze** &mdash; `@modelcontextprotocol/sdk`, `zod` e `cheerio`. Tutto l'I/O di rete tramite `fetch()` nativo e i moduli Node.js `net`/`tls`/`dns`. Nessun nmap, nessun binario esterno.

---

## Limitazioni

- Gli strumenti OSINT (Shodan, Censys, VirusTotal, SecurityTrails) richiedono chiavi API per le rispettive tecniche
- Il piano gratuito Censys è limitato a 250 query/mese
- Il piano gratuito VirusTotal è limitato a 500 query/giorno
- La scansione porte usa TCP connect (non scansione SYN) &mdash; meno furtivo di nmap ma non richiede privilegi root
- Il fingerprinting JARM richiede accesso TCP diretto al target (potrebbe essere bloccato dai firewall)
- La scoperta UPnP/SSDP funziona solo su reti locali
- Il sondaggio servizi (MySQL, PostgreSQL, Redis) si connette ma non si autentica
- L'enumerazione dei sottodomini si basa su log CT e fonti passive (nessun brute-force)
- Testato su macOS / Linux (Windows non testato)

---

## Parte della Suite di Sicurezza MCP

| Progetto | Dominio | Strumenti |
|----------|---------|-----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Test di sicurezza basati su browser | 39 strumenti, Firefox, test di injection |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Sicurezza cloud (AWS/Azure/GCP) | 38 strumenti, 60+ controlli |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura di sicurezza GitHub | 39 strumenti, 45 controlli |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Intelligence sulle vulnerabilità | 23 strumenti, 5 fonti |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT e ricognizione | 37 strumenti, 12 fonti |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web e threat intelligence | 66 strumenti, 16 fonti |
| **fingerprint-mcp** | **Fingerprinting digitale universale** | **13 strumenti, 103 tecniche, 21 provider** |

---

<p align="center">
<b>Solo per test di sicurezza e valutazioni autorizzate.</b><br>
Assicurati sempre di avere l'autorizzazione adeguata prima di eseguire il fingerprinting su qualsiasi target.
</p>

<p align="center">
  <a href="LICENSE">Licenza AGPL-3.0</a> &bull; Realizzato con Bun + TypeScript
</p>
