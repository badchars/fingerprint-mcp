<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <strong>Français</strong> |
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

<h3 align="center">Empreinte numerique universelle pour agents IA.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondage de services, JARM, JA4X, hachage de favicon, topologie d'infrastructure, detection C2, enrichissement OSINT &mdash; unifies dans un seul serveur MCP.<br>
  Votre agent IA obtient <b>une empreinte numerique a spectre complet a la demande</b>, pas 11 outils CLI deconnectes et une correlation manuelle.
</p>

<br>

<p align="center">
  <a href="#le-probleme">Le probleme</a> &bull;
  <a href="#ce-qui-le-differencie">Ce qui le differencie</a> &bull;
  <a href="#demarrage-rapide">Demarrage rapide</a> &bull;
  <a href="#ce-que-lia-peut-faire">Ce que l'IA peut faire</a> &bull;
  <a href="#reference-des-outils-13-outils-103-techniques">Outils (13)</a> &bull;
  <a href="#sources-de-donnees-21">Sources de donnees</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="CHANGELOG.md">Journal des modifications</a> &bull;
  <a href="CONTRIBUTING.md">Contribuer</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licence"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 outils">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 techniques">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Demo de fingerprint-mcp" width="800">
</p>

---

## Le probleme

Faire l'empreinte d'un serveur aujourd'hui signifie jongler avec une douzaine d'outils deconnectes. Vous executez `nmap` pour le scan de ports, `testssl.sh` pour l'analyse de certificats, `curl -I` pour les en-tetes HTTP, `dig` pour le DNS, `wafw00f` pour la detection WAF, `ssh-audit` pour SSH, un outil JARM separe, Wappalyzer pour la detection de technologies &mdash; et ensuite vous passez 30 minutes a croiser manuellement tout dans un tableur pour comprendre ce qui tourne reellement.

```
Flux de travail traditionnel d'empreinte :
  analyser les certificats TLS   ->  testssl.sh / openssl s_client
  capturer les en-tetes HTTP     ->  curl -I
  detecter les technologies web  ->  wappalyzer CLI
  reconnaissance DNS             ->  dig / nslookup / dnsenum
  scan de ports                  ->  nmap -sV
  detection WAF                  ->  wafw00f
  audit SSH                      ->  ssh-audit
  empreinte de services          ->  nmap scripts
  empreinte JARM                 ->  jarm (outil separe)
  consulter les bases OSINT      ->  shodan CLI, censys CLI
  correler le tout               ->  manuellement dans un tableur
  ──────────────────────────────
  Total : 11 outils, 30+ minutes, correlation manuelle
```

**fingerprint-mcp** fournit a votre agent IA 13 outils composites encapsulant 103 techniques d'empreinte provenant de 21 fournisseurs via le [Model Context Protocol](https://modelcontextprotocol.io). L'agent execute l'empreinte multicouche en parallele, correle les signaux entre les couches TCP/TLS/HTTP/DNS/SSH, detecte les pots de miel et l'infrastructure C2, et presente une image de renseignement unifiee &mdash; le tout en une seule conversation.

```
Avec fingerprint-mcp :
  Vous : "Fais une reconnaissance approfondie de target.com"

  Agent : -> recon {url: "https://target.com", depth: "deep"}

          -> TLS : nginx/1.24.0 via JARM (3fd21b20d00000...),
             certificat Let's Encrypt, 2 SANs, TLS 1.2+1.3
          -> HTTP : Express.js derriere Cloudflare WAF,
             React SPA, Google Analytics, 14 en-tetes de securite analyses
          -> DNS : enregistrements A/AAAA/MX/TXT, SPF/DKIM/DMARC configures,
             Slack + Google Workspace detectes via CNAME/MX
          -> Ports : 80, 443, 22 (OpenSSH 9.6), 8080 (serveur de developpement)
          -> WAF : Cloudflare detecte, IP d'origine decouverte via connexion directe
          -> Enumeration : 12 sous-domaines via journaux CT, DNS generique detecte
          -> "target.com execute nginx/1.24.0 avec Express.js derriere
             Cloudflare WAF. L'IP d'origine 203.0.113.42 est exposee sur
             le port 8080. TLS est correctement configure (equivalent A+)
             mais le serveur de developpement sur 8080 n'a pas de protection
             WAF. 3 sous-domaines pointent vers une infrastructure
             desaffectee — risque potentiel de prise de controle."
```

---

## Ce qui le differencie

Les outils existants vous donnent des donnees brutes une couche a la fois. fingerprint-mcp donne a votre agent IA la capacite de **raisonner simultanement a travers toutes les couches d'empreinte**.

<table>
<thead>
<tr>
<th></th>
<th>Approche traditionnelle</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>11 outils CLI differents avec des formats de sortie differents</td>
<td>MCP &mdash; l'agent IA appelle les outils de maniere conversationnelle</td>
</tr>
<tr>
<td><b>Techniques</b></td>
<td>Un outil, une couche a la fois</td>
<td>103 techniques de 21 fournisseurs, executees en parallele</td>
</tr>
<tr>
<td><b>Analyse TLS</b></td>
<td>Sortie testssl.sh, analyser JARM separement manuellement</td>
<td>L'agent combine certificat + JARM + JA4X + suites de chiffrement + SNI + journaux CT en un seul appel</td>
</tr>
<tr>
<td><b>Correlation</b></td>
<td>Copier-coller les resultats dans un tableur</td>
<td>L'agent correle : "JARM correspond a un framework C2 connu, le timing HTTP confirme un pot de miel"</td>
</tr>
<tr>
<td><b>Contournement WAF</b></td>
<td>wafw00f detecte le WAF, vous cherchez l'origine manuellement</td>
<td>L'agent detecte le WAF, decouvre l'IP d'origine et verifie qu'elle sert le meme contenu</td>
</tr>
<tr>
<td><b>Cles API</b></td>
<td>Requises pour Shodan, Censys, etc.</td>
<td>80+ techniques actives fonctionnent sans cle API ; les cles debloquent l'enrichissement OSINT</td>
</tr>
<tr>
<td><b>Installation</b></td>
<td>Installer nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; une commande, zero configuration</td>
</tr>
</tbody>
</table>

---

## Demarrage rapide

### Option 1 : npx (sans installation)

```bash
npx fingerprint-mcp
```

Les 80+ techniques actives d'empreinte fonctionnent immediatement. Aucune cle API requise pour TCP, TLS, SSH, HTTP, DNS, WAF, chemins, services, temporisation, IoT, SMTP, infrastructure et empreinte d'applications.

### Option 2 : Cloner

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Variables d'environnement (optionnelles)

```bash
# Enrichissement OSINT (toutes optionnelles — l'empreinte active fonctionne sans cles)
export SHODAN_API_KEY=your-key           # Active osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Active osint_censys (gratuit : 250 requetes/mois)
export CENSYS_API_SECRET=your-secret     # Secret API Censys
export SECURITYTRAILS_API_KEY=your-key   # Active waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Active osint_virustotal (gratuit : 500 requetes/jour)
```

Toutes les cles API sont optionnelles. Sans elles, vous obtenez toujours l'empreinte complete TCP/TLS/SSH/HTTP/DNS/WAF/chemins/services/temporisation/IoT/SMTP/infrastructure/applications, la correlation, l'analyse passive, l'enumeration et les outils meta &mdash; 80+ techniques qui fonctionnent en sondant directement la cible.

### Connecter a votre agent IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Avec npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Avec un clone local
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Ajouter a `~/Library/Application Support/Claude/claude_desktop_config.json` :

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
<summary><b>Cursor / Windsurf / autres clients MCP</b></summary>

Meme format de configuration JSON. Pointez la commande vers `npx fingerprint-mcp` ou votre chemin d'installation local.

</details>

### Commencer les requetes

```
Vous : "Fais l'empreinte de tout sur target.com — TLS, pile HTTP, WAF, DNS, ports ouverts"
```

C'est tout. L'agent gere automatiquement l'empreinte multicouche, la correlation des signaux et l'analyse d'infrastructure.

---

## Ce que l'IA peut faire

### Reconnaissance rapide

```
Vous : "Reconnaissance rapide de target.com"

Agent : -> recon {url: "https://target.com", depth: "quick"}

        -> TCP : ports 80, 443, 22 ouverts
        -> TLS : certificat RSA Let's Encrypt, TLS 1.2+1.3, signature JARM nginx
        -> HTTP : nginx/1.24.0, Express.js, React, Cloudflare CDN
        -> DNS : A 203.0.113.42, MX Google Workspace, SPF/DKIM configures
        -> WAF : Cloudflare detecte (en-tete cf-ray)
        -> "target.com est une SPA React sur Express.js derriere nginx/1.24.0,
           servie via Cloudflare CDN. TLS correctement configure avec
           Let's Encrypt. SSH sur le port 22 executant OpenSSH 9.6. Email
           gere par Google Workspace avec SPF/DKIM/DMARC complet."
```

### Investigation TLS approfondie

```
Vous : "Analyse la configuration TLS de suspicious-server.com en detail"

Agent : -> scan_tls {host: "suspicious-server.com"}

        -> Certificat : auto-signe, CN=localhost, expire depuis 47 jours
        -> JARM : 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
           (correspond au profil par defaut de Cobalt Strike)
        -> JA4X : empreinte correspond a un modele de framework C2 connu
        -> Suites de chiffrement : accepte des chiffrements faibles (RC4, 3DES)
        -> SNI : repond de maniere identique a toute valeur SNI
        -> Journaux CT : certificat non enregistre (non approuve publiquement)
        -> "HAUT RISQUE : La configuration TLS indique fortement une infrastructure C2.
           Certificat auto-signe expire, empreinte JARM correspond a Cobalt Strike,
           accepte des chiffrements faibles et repond a des valeurs SNI arbitraires.
           Investigation immediate et blocage recommandes."
```

### Contournement WAF et decouverte de l'origine

```
Vous : "target.com est derriere un WAF. Peux-tu trouver le serveur d'origine ?"

Agent : -> scan_waf {url: "https://target.com"}
        -> scan_dns {domain: "target.com"}
        -> enumerate {domain: "target.com"}

        -> WAF : Cloudflare (AS13335), page de defi sur les requetes suspectes
        -> DNS : enregistrement A pointe vers l'IP Cloudflare 104.21.x.x
        -> Sous-domaines : dev.target.com resout vers 203.0.113.42 (non Cloudflare)
        -> Connexion directe a 203.0.113.42:443 renvoie le meme certificat TLS
        -> Historique SecurityTrails : l'origine etait 203.0.113.42 avant Cloudflare
        -> "IP d'origine trouvee : 203.0.113.42. Decouverte via le sous-domaine
           dev.target.com qui contourne Cloudflare. L'origine sert le meme
           certificat TLS et repond a l'en-tete Host de target.com.
           L'origine n'a pas de protection WAF — acces direct possible."
```

### Decouverte de services sur un hote

```
Vous : "Quels services tournent sur 10.0.1.50 ?"

Agent : -> scan_ports {host: "10.0.1.50"}
        -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

        -> Port 22 : OpenSSH 8.9p1 Ubuntu, cle d'hote ED25519
        -> Port 80 : Apache/2.4.57, PHP/8.2, WordPress 6.4
        -> Port 3306 : MySQL 8.0.36, authentification requise
        -> Port 5432 : PostgreSQL 16.1, SSL requis
        -> Port 6379 : Redis 7.2.4, SANS authentification (ouvert)
        -> Port 8080 : serveur de developpement Node.js Express, CORS: *
        -> "CRITIQUE : Redis sur le port 6379 n'a pas d'authentification — n'importe
           qui sur le reseau peut lire/ecrire des donnees. Le serveur de developpement
           Express sur 8080 a un CORS generique. MySQL et PostgreSQL requierent
           correctement l'authentification. WordPress est en retard de 2 versions
           mineures. Action immediate necessaire sur Redis et l'exposition du
           serveur de developpement."
```

---

## Reference des outils (13 outils, 103 techniques)

<details open>
<summary><b>recon &mdash; Reconnaissance complete avec selection de techniques basee sur la profondeur</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `url` | string | URL cible pour l'empreinte |
| `depth` | `quick` \| `standard` \| `deep` | Profondeur de scan : quick=5 techniques, standard=20, deep=50+ |

Orchestre les techniques de tous les fournisseurs selon le niveau de profondeur. Le mode rapide donne un apercu rapide ; le mode profond execute une empreinte exhaustive incluant enumeration, OSINT et correlation.

</details>

<details>
<summary><b>scan_ports &mdash; Scan de ports TCP avec detection de services (3 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `host` | string | Hote cible (IP ou domaine) |
| `ports` | number[] | Optionnel &mdash; ports specifiques a scanner (par defaut : ports courants) |

| Technique | Description |
|-----------|-------------|
| `tcp_probe` | Scan de connexion TCP pour detecter les ports ouverts |
| `tcp_banner` | Capture de banniere sur les ports ouverts pour l'identification de services |
| `tcp_analysis` | Analyse de combinaison de ports et inference de services |

</details>

<details>
<summary><b>scan_tls &mdash; Analyse TLS/SSL complete (8 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `host` | string | Hote cible (IP ou domaine) |
| `port` | number | Optionnel &mdash; port TLS (par defaut : 443) |

| Technique | Description |
|-----------|-------------|
| `tls_certificate` | Analyse de certificat X.509 &mdash; sujet, emetteur, SANs, validite, chaine |
| `tls_jarm` | Empreinte active JARM &mdash; 10 sondes TLS Client Hello, hash de 62 caracteres |
| `tls_ja4x` | Empreinte TLS passive JA4X a partir des proprietes du certificat |
| `tls_ciphers` | Enumeration des suites de chiffrement et analyse de robustesse |
| `tls_protocols` | Detection des versions de protocole TLS supportees (SSLv3 a TLS 1.3) |
| `tls_sni` | Test de comportement SNI &mdash; certificat par defaut vs. nom d'hote demande |
| `tls_ct_logs` | Consultation des journaux Certificate Transparency via crt.sh |
| `tls_ocsp` | Agrafage OCSP et verification du statut de revocation |

</details>

<details>
<summary><b>scan_dns &mdash; Renseignement DNS (7 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `domain` | string | Domaine cible |

| Technique | Description |
|-----------|-------------|
| `dns_records` | Enumeration complete des enregistrements &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analyse des enregistrements SPF, DKIM et DMARC |
| `dns_saas` | Detection SaaS/services via les modeles CNAME et MX (Slack, Zendesk, etc.) |
| `dns_server` | Empreinte de serveur DNS (BIND, PowerDNS, Cloudflare, etc.) |
| `dns_takeover` | Detection de prise de controle de sous-domaine via analyse de CNAME pendants |
| `dns_zone` | Tentative de transfert de zone (AXFR) |
| `dns_caa` | Analyse des enregistrements CAA pour les restrictions d'autorite de certification |

</details>

<details>
<summary><b>scan_http &mdash; Empreinte HTTP/web (29 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `url` | string | URL cible |

| Technique | Fournisseur | Description |
|-----------|-------------|-------------|
| `http_headers` | HTTP | Analyse des en-tetes de reponse et identification du serveur |
| `http_header_order` | HTTP | Empreinte d'ordre des en-tetes (signature du logiciel serveur) |
| `http_security_headers` | HTTP | Audit des en-tetes de securite (CSP, HSTS, X-Frame-Options, etc.) |
| `http_cookies` | HTTP | Analyse des cookies &mdash; drapeaux, prefixes, detection de framework |
| `http_methods` | HTTP | Enumeration des methodes HTTP autorisees (OPTIONS) |
| `http_cors` | HTTP | Analyse de politique CORS et detection de mauvaise configuration |
| `http_compression` | HTTP | Algorithmes de compression supportes (gzip, br, zstd) |
| `http_caching` | HTTP | Analyse des en-tetes de cache (detection CDN, proxy inverse) |
| `http_etag` | HTTP | Analyse du format ETag pour identification du backend |
| `http_error` | HTTP | Empreinte de pages d'erreur (personnalisees vs. par defaut) |
| `http_redirect` | HTTP | Analyse de chaine de redirection |
| `http_timing` | HTTP | Ligne de base de temporisation de reponse pour le profilage de performance |
| `http_favicon` | HTTP | Hash de favicon (MurmurHash3) pour identification de technologie |
| `http_robots` | HTTP | Analyse de robots.txt et extraction des chemins interdits |
| `http_sitemap` | HTTP | Decouverte de sitemap et extraction d'URLs |
| `http_wellknown` | HTTP | Decouverte de points d'acces .well-known (security.txt, openid, etc.) |
| `web_tech` | Web | Detection de technologie via les modeles HTML/JS/CSS |
| `web_analytics` | Web | Detection de services d'analyse et de suivi |
| `web_sourcemaps` | Web | Decouverte de fichiers source map |
| `web_websocket` | Web | Detection de points d'acces WebSocket |
| `web_graphql` | Web | Detection de points d'acces GraphQL et introspection |
| `web_spa` | Web | Detection de frameworks d'application monopage |
| `web_cdn` | Web | Detection CDN via en-tetes de reponse et DNS |
| `web_meta` | Web | Analyse des balises meta HTML (generateur, indices de framework) |
| `web_feed` | Web | Decouverte de flux RSS/Atom |
| `h2_detect` | HTTP/2 | Detection du support du protocole HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Empreinte de serveur HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Detection du support HTTP/3 (QUIC) via en-tete Alt-Svc |
| `app_cms` | Application | Detection CMS (WordPress, Drupal, Joomla, etc.) |

</details>

<details>
<summary><b>scan_paths &mdash; Renseignement de chemins (5 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `url` | string | URL cible |
| `categories` | string[] | Optionnel &mdash; categories a verifier (sensitive, git, debug, api, config) |

| Technique | Description |
|-----------|-------------|
| `path_sensitive` | Decouverte de fichiers sensibles (fichiers de sauvegarde, fichiers de configuration, exports de base de donnees) |
| `path_robots` | Analyse de robots.txt et sitemap.xml pour decouvrir les chemins caches |
| `path_git` | Detection de fuite de depot Git (.git/HEAD, .git/config) |
| `path_debug` | Decouverte de points d'acces de debogage (phpinfo, server-status, consoles de debogage) |
| `path_api` | Decouverte de versions d'API et de points d'acces de documentation |

</details>

<details>
<summary><b>scan_waf &mdash; Detection et empreinte WAF/CDN (4 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `url` | string | URL cible |

| Technique | Description |
|-----------|-------------|
| `waf_detect` | Detection de presence WAF via analyse des en-tetes de reponse et du comportement |
| `waf_cdn` | Identification du fournisseur CDN (Cloudflare, Akamai, Fastly, etc.) |
| `waf_fingerprint` | Identification du produit WAF et detection de version |
| `waf_origin` | Decouverte de l'IP d'origine derriere WAF/CDN (necessite `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondage au niveau service (12 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `host` | string | Hote cible (IP ou domaine) |
| `ports` | number[] | Optionnel &mdash; ports specifiques a sonder |
| `service` | string | Optionnel &mdash; service specifique a sonder (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Technique | Fournisseur | Description |
|-----------|-------------|-------------|
| `ssh_probe` | SSH | Detection de version de protocole SSH et de logiciel |
| `ssh_algorithms` | SSH | Audit d'algorithmes SSH (KEX, chiffrements, MACs, types de cle d'hote) |
| `ssh_hostkey_lookup` | SSH | Recherche de cle d'hote SSH via Shodan (necessite `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Detection de version MySQL et empreinte de capacites |
| `svc_postgres` | Service | Detection de version PostgreSQL et verification du support SSL |
| `svc_redis` | Service | Detection de version Redis et statut d'authentification |
| `svc_ftp` | Service | Analyse de banniere FTP et verification de connexion anonyme |
| `svc_vnc_rdp` | Service | Detection de service VNC/RDP et evaluation de securite |
| `smtp_banner` | SMTP | Analyse de banniere SMTP et identification MTA |
| `smtp_starttls` | SMTP | Support SMTP STARTTLS et inspection de certificat |
| `iot_detect` | IoT | Detection de peripheriques IoT via modeles de banniere et pages par defaut |
| `iot_upnp` | IoT | Decouverte de peripheriques UPnP/SSDP sur le reseau local |

</details>

<details>
<summary><b>enumerate &mdash; Expansion du perimetre (8 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `domain` | string | Domaine cible |

| Technique | Description |
|-----------|-------------|
| `enum_subdomains` | Enumeration de sous-domaines via plusieurs methodes |
| `enum_wildcard` | Detection DNS generique |
| `enum_tld` | Expansion TLD (target.com -> target.net, target.org, etc.) |
| `enum_related` | Decouverte de domaines associes via infrastructure partagee |
| `enum_asn` | Decouverte de voisins ASN &mdash; autres domaines sur le meme reseau |
| `enum_ct` | Extraction de sous-domaines des journaux Certificate Transparency |
| `enum_passive_dns` | Historique DNS passif (necessite `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Resume du perimetre et vue d'ensemble de la surface d'attaque |

</details>

<details>
<summary><b>osint &mdash; Enrichissement OSINT (6 techniques)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `target` | string | Adresse IP ou domaine a enrichir |
| `type` | `ip` \| `domain` | Optionnel &mdash; type de cible (auto-detecte si omis) |

| Technique | Auth | Description |
|-----------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Consultation d'hote Shodan &mdash; ports ouverts, bannieres, vulnerabilites, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Donnees d'hote Censys &mdash; services, TLS, systeme autonome |
| `osint_reverse_ip` | Aucune | Recherche IP inverse &mdash; autres domaines sur la meme IP |
| `osint_whois` | Aucune | Donnees d'enregistrement WHOIS &mdash; registrar, dates, serveurs de noms |
| `osint_webarchive` | Aucune | Historique Web Archive &mdash; premier/dernier instantane, frequence de modification |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Rapport VirusTotal domaine/IP &mdash; detections, categories, DNS |

</details>

<details>
<summary><b>analyze &mdash; Analyse passive d'empreinte (3 modes)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Type de donnees a analyser |
| `data` | string | Donnees brutes a analyser (coller en-tetes, HTML ou sortie de banniere) |

| Mode | Description |
|------|-------------|
| `fp_analyze_headers` | Analyse passive d'en-tetes HTTP &mdash; detection de serveur, framework, proxy sans envoyer de trafic |
| `fp_analyze_html` | Analyse passive HTML &mdash; detection de technologie, identification de framework a partir du source |
| `fp_analyze_banner` | Analyse passive de banniere &mdash; identification de service a partir du texte brut de la banniere |

</details>

<details>
<summary><b>correlate &mdash; Moteur de correlation multi-signaux (7 modes)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Mode de correlation |
| `signals` | object | Signaux d'empreinte a correler (varie selon le mode) |

| Mode | Description |
|------|-------------|
| `fp_consistency` | Verification de coherence des signaux inter-couches &mdash; les empreintes TCP, TLS, HTTP et DNS concordent-elles ? |
| `fp_honeypot` | Detection de pot de miel &mdash; verifie les combinaisons de services impossibles et les anomalies comportementales |
| `fp_spoofing` | Detection d'usurpation &mdash; identifie les discordances entre les en-tetes serveur et le comportement reel |
| `fp_compare` | Comparaison cote a cote des profils d'empreinte de deux hotes |
| `fp_topology` | Cartographie de la topologie d'infrastructure &mdash; CDN, repartiteur de charge, chaine de proxy inverse |
| `fp_c2` | Detection de framework C2 via correlation JARM, TLS, HTTP et temporisation |
| `fp_identify` | Identification basee sur le hash contre une base de donnees de signatures connues |

</details>

<details>
<summary><b>meta &mdash; Configuration et donnees du serveur (3 modes)</b></summary>

| Parametre | Type | Description |
|-----------|------|-------------|
| `category` | string | Optionnel &mdash; filtrer par categorie |

| Mode | Description |
|------|-------------|
| `fp_sources` | Lister toutes les sources de donnees disponibles avec configuration et statut des cles API |
| `fp_config` | Configuration du serveur &mdash; version, fournisseurs charges, nombre de techniques |
| `fp_signatures` | Liste de la base de donnees de signatures &mdash; signatures JARM, banniere, WAF, application |

</details>

---

### Utilisation CLI

```bash
# Lister tous les outils et techniques disponibles
npx fingerprint-mcp --list

# Executer n'importe quel outil directement
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

# Outils OSINT (necessitent des cles API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Sources de donnees (21)

| Source | Auth | Ce qu'elle fournit |
|--------|------|-------------------|
| Sondage TCP | Aucune | Scan de ports, capture de banniere, detection de services |
| Analyse TLS/SSL | Aucune | Analyse de certificats, empreinte JARM, JA4X, enumeration de chiffrements, tests SNI |
| Sondage SSH | Aucune | Version de protocole, audit d'algorithmes, detection de logiciel |
| Analyse HTTP | Aucune | Empreinte d'en-tetes, hachage de favicon, analyse de cookies, enumeration de methodes, CORS |
| Detection web | Aucune | Detection de technologie, analyse, source maps, WebSocket, GraphQL, frameworks SPA |
| Decouverte de chemins | Aucune | Fichiers sensibles, fuites Git, points d'acces de debogage, versions d'API, robots.txt |
| Resolution DNS | Aucune | Enumeration d'enregistrements, analyse d'authentification email, detection SaaS, empreinte de serveur |
| Detection WAF/CDN | Aucune | Identification WAF, detection CDN, empreinte WAF |
| Analyse de temporisation | Aucune | Ligne de base de temporisation de reponse, detection d'ecart d'horloge |
| HTTP/2 & HTTP/3 | Aucune | Detection et empreinte HTTP/2, decouverte HTTP/3 Alt-Svc |
| Sondage SMTP | Aucune | Analyse de banniere SMTP, inspection STARTTLS |
| IoT/Embarque | Aucune | Detection de peripheriques IoT, decouverte UPnP/SSDP |
| Detection d'applications | Aucune | Identification de CMS, framework et plateforme e-commerce |
| Sondage de services | Aucune | Empreinte MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Detection d'infrastructure | Aucune | Identification de fournisseur cloud, fournisseur d'hebergement, CDN |
| Moteur de correlation | Aucune | Coherence des signaux, detection de pot de miel, detection d'usurpation, cartographie de topologie |
| Moteur d'identification | Aucune | Identification basee sur le hash, detection C2, correspondance de signatures |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Renseignement d'hote &mdash; ports ouverts, bannieres, vulnerabilites, detection d'OS |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Donnees d'hote &mdash; services, certificats TLS, informations de systeme autonome |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Decouverte d'origine WAF, historique DNS passif, enregistrements historiques |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputation domaine/IP, resultats de detection, historique DNS, categories |

---

## Architecture

```
src/
  index.ts                # Point d'entree CLI (--help, --list, --tool, serveur stdio)
  protocol/
    mcp-server.ts         # Configuration du serveur MCP (transport stdio)
    tools.ts              # Registre des outils — les 13 outils composites enregistres ici
  types/
    index.ts              # Types partages (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Limiteur de debit par fournisseur
    cache.ts              # Cache TTL pour les reponses API
    require-key.ts        # Assistant de validation de cle API
    murmurhash3.ts        # MurmurHash3 pour le hachage de favicon
  composite/              # 13 orchestrateurs d'outils composites
    recon.ts              # Orchestrateur de reconnaissance complete (quick/standard/deep)
    scan-ports.ts         # Composite de scan de ports
    scan-tls.ts           # Composite d'analyse TLS
    scan-dns.ts           # Composite de renseignement DNS
    scan-http.ts          # Composite d'empreinte HTTP
    scan-paths.ts         # Composite de decouverte de chemins
    scan-waf.ts           # Composite de detection WAF/CDN
    scan-services.ts      # Composite de sondage de services
    analyze.ts            # Composite d'analyse passive
    correlate.ts          # Composite du moteur de correlation
    enumerate.ts          # Composite d'expansion du perimetre
    osint.ts              # Composite d'enrichissement OSINT
    meta.ts               # Composite meta du serveur
    helpers.ts            # Assistants partages des composites
  tcp/                    # Techniques de sondage TCP (3)
  tls/                    # Techniques d'analyse TLS/SSL (8)
  ssh/                    # Techniques de sondage SSH (3)
  http/                   # Techniques d'empreinte HTTP (16)
  web/                    # Techniques de detection de technologie web (9)
  path/                   # Techniques de decouverte de chemins (5)
  dns/                    # Techniques de renseignement DNS (7)
  waf/                    # Techniques de detection WAF/CDN (4)
  timing/                 # Techniques d'analyse de temporisation (2)
  h2/                     # Techniques HTTP/2 & HTTP/3 (3)
  smtp/                   # Techniques de sondage SMTP (2)
  iot/                    # Techniques de detection IoT/embarque (2)
  app/                    # Techniques de detection d'applications (3)
  service/                # Techniques de sondage de services (5)
  infra/                  # Techniques de detection d'infrastructure (3)
  correlation/            # Moteur de correlation (5)
  identify/               # Moteur d'identification (3)
  passive/                # Analyse passive (3)
  osint/                  # Techniques d'enrichissement OSINT (6)
  enum/                   # Techniques d'enumeration (8)
  meta/                   # Outils meta (3)
  data/                   # Bases de donnees de signatures et bibliotheques de modeles
    jarm-signatures.ts    # Empreintes JARM connues (C2, serveurs, CDNs)
    waf-signatures.ts     # Signatures de detection WAF
    service-banners.ts    # Modeles de banniere de services
    tech-patterns.ts      # Modeles de detection de technologie
    favicon-hashes.ts     # Valeurs MurmurHash3 de favicon connues
    c2-signatures.ts      # Signatures de framework C2
    ...                   # 15+ bases de donnees de signatures/modeles
```

**Decisions de conception :**

- **13 outils composites, 103 techniques** &mdash; L'agent appelle des outils de haut niveau (`recon`, `scan_tls`, `scan_http`). Chaque composite orchestre plusieurs techniques de bas niveau et retourne des resultats correles. Cela reduit la surcharge d'appels d'outils tout en maintenant la granularite.
- **21 fournisseurs, 1 serveur** &mdash; Chaque couche d'empreinte est un module independant. L'orchestrateur composite selectionne les techniques en fonction du contexte et de la profondeur.
- **Actif d'abord, OSINT optionnel** &mdash; 80+ techniques fonctionnent en sondant directement la cible sans aucune cle API. Les fournisseurs OSINT (Shodan, Censys, VirusTotal, SecurityTrails) ajoutent un enrichissement mais ne sont jamais requis.
- **Limiteurs de debit par fournisseur** &mdash; Chaque fournisseur a sa propre instance `RateLimiter`. Le sondage actif est limite en debit pour eviter la detection ; les APIs OSINT sont calibrees selon leurs quotas.
- **Cache TTL** &mdash; Les enregistrements DNS (10 min), les resultats OSINT (15 min), les journaux CT (30 min) sont mis en cache pour eviter les requetes redondantes dans les flux de travail multi-outils.
- **Degradation gracieuse** &mdash; L'absence de cles API ne fait pas planter le serveur. Les outils OSINT retournent des messages descriptifs : "Definissez SHODAN_API_KEY pour activer la consultation d'hote Shodan."
- **3 dependances** &mdash; `@modelcontextprotocol/sdk`, `zod` et `cheerio`. Toutes les E/S reseau via `fetch()` natif et les modules `net`/`tls`/`dns` de Node.js. Pas de nmap, pas de binaires externes.

---

## Limitations

- Les outils OSINT (Shodan, Censys, VirusTotal, SecurityTrails) necessitent des cles API pour leurs techniques respectives
- Le niveau gratuit de Censys est limite a 250 requetes/mois
- Le niveau gratuit de VirusTotal est limite a 500 requetes/jour
- Le scan de ports utilise TCP connect (pas de scan SYN) &mdash; moins furtif que nmap mais ne necessite pas de privileges root
- L'empreinte JARM necessite un acces TCP direct a la cible (peut etre bloque par des pare-feu)
- La decouverte UPnP/SSDP ne fonctionne que sur les reseaux locaux
- Le sondage de services (MySQL, PostgreSQL, Redis) se connecte mais ne s'authentifie pas
- L'enumeration de sous-domaines repose sur les journaux CT et les sources passives (pas de force brute)
- macOS / Linux testes (Windows non teste)

---

## Fait partie de la suite de securite MCP

| Projet | Domaine | Outils |
|--------|---------|--------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Tests de securite bases sur navigateur | 39 outils, Firefox, tests d'injection |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Securite cloud (AWS/Azure/GCP) | 38 outils, 60+ verifications |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Posture de securite GitHub | 39 outils, 45 verifications |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Renseignement sur les vulnerabilites | 23 outils, 5 sources |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT et reconnaissance | 37 outils, 12 sources |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web et renseignement sur les menaces | 66 outils, 16 sources |
| **fingerprint-mcp** | **Empreinte numerique universelle** | **13 outils, 103 techniques, 21 fournisseurs** |

---

<p align="center">
<b>Pour les tests et evaluations de securite autorises uniquement.</b><br>
Assurez-vous toujours d'avoir une autorisation appropriee avant d'effectuer une empreinte sur une cible.
</p>

<p align="center">
  <a href="LICENSE">Licence AGPL-3.0</a> &bull; Construit avec Bun + TypeScript
</p>
