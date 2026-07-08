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
  <a href="README.no.md">Norsk</a> |
  <a href="README.pt-BR.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <strong>Ελληνικά</strong> |
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

<h3 align="center">Καθολικό ψηφιακό αποτύπωμα για AI agents.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, ανίχνευση υπηρεσιών, JARM, JA4X, κατακερματισμός favicon, τοπολογία υποδομής, ανίχνευση C2, εμπλουτισμός OSINT &mdash; ενοποιημένα σε έναν ενιαίο MCP server.<br>
  Ο AI agent σας αποκτά <b>αποτύπωμα πλήρους φάσματος κατ' απαίτηση</b>, όχι 11 αποσυνδεδεμένα εργαλεία CLI και χειροκίνητη συσχέτιση.
</p>

<br>

<p align="center">
  <a href="#το-πρόβλημα">Το Πρόβλημα</a> &bull;
  <a href="#πώς-διαφέρει">Πώς Διαφέρει</a> &bull;
  <a href="#γρήγορη-εκκίνηση">Γρήγορη Εκκίνηση</a> &bull;
  <a href="#τι-μπορεί-να-κάνει-το-ai">Τι Μπορεί το AI</a> &bull;
  <a href="#αναφορά-εργαλείων-13-εργαλεία-103-τεχνικές">Εργαλεία (13)</a> &bull;
  <a href="#πηγές-δεδομένων-21">Πηγές Δεδομένων</a> &bull;
  <a href="#αρχιτεκτονική">Αρχιτεκτονική</a> &bull;
  <a href="CHANGELOG.md">Αρχείο Αλλαγών</a> &bull;
  <a href="CONTRIBUTING.md">Συνεισφορά</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Άδεια"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Εργαλεία">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Τεχνικές">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Επίδειξη fingerprint-mcp" width="800">
</p>

---

## Το Πρόβλημα

Η αποτύπωση ενός server σήμερα σημαίνει ζογκλαρισμό με μια ντουζίνα αποσυνδεδεμένα εργαλεία. Εκτελείτε `nmap` για σάρωση θυρών, `testssl.sh` για ανάλυση πιστοποιητικών, `curl -I` για HTTP headers, `dig` για DNS, `wafw00f` για ανίχνευση WAF, `ssh-audit` για SSH, ένα ξεχωριστό εργαλείο JARM, Wappalyzer για ανίχνευση τεχνολογιών &mdash; και μετά ξοδεύετε 30 λεπτά διασταυρώνοντας χειροκίνητα τα πάντα σε ένα υπολογιστικό φύλλο για να καταλάβετε τι πραγματικά τρέχει.

```
Παραδοσιακή ροή εργασίας αποτύπωσης:
  ανάλυση TLS πιστοποιητικών    ->  testssl.sh / openssl s_client
  λήψη HTTP headers             ->  curl -I
  ανίχνευση web τεχνολογιών     ->  wappalyzer CLI
  DNS αναγνώριση                ->  dig / nslookup / dnsenum
  σάρωση θυρών                  ->  nmap -sV
  ανίχνευση WAF                 ->  wafw00f
  έλεγχος SSH                   ->  ssh-audit
  αποτύπωση υπηρεσιών           ->  nmap scripts
  JARM αποτύπωμα                ->  jarm (ξεχωριστό εργαλείο)
  έλεγχος βάσεων OSINT          ->  shodan CLI, censys CLI
  συσχέτιση όλων                ->  χειροκίνητα σε υπολογιστικό φύλλο
  ──────────────────────────────
  Σύνολο: 11 εργαλεία, 30+ λεπτά, χειροκίνητη συσχέτιση
```

**fingerprint-mcp** δίνει στον AI agent σας 13 σύνθετα εργαλεία που καλύπτουν 103 τεχνικές αποτύπωσης σε 21 παρόχους μέσω του [Model Context Protocol](https://modelcontextprotocol.io). Ο agent εκτελεί πολυεπίπεδη αποτύπωση παράλληλα, συσχετίζει σήματα μεταξύ των επιπέδων TCP/TLS/HTTP/DNS/SSH, ανιχνεύει honeypots και υποδομή C2, και παρουσιάζει μια ενοποιημένη εικόνα πληροφοριών &mdash; σε μια μόνο συνομιλία.

```
Με fingerprint-mcp:
  Εσείς: "Κάνε βαθιά αναγνώριση στο target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 μέσω JARM (3fd21b20d00000...),
            πιστοποιητικό Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js πίσω από Cloudflare WAF,
            React SPA, Google Analytics, αναλύθηκαν 14 headers ασφαλείας
         -> DNS: εγγραφές A/AAAA/MX/TXT, ρυθμίστηκαν SPF/DKIM/DMARC,
            ανιχνεύτηκαν Slack + Google Workspace μέσω CNAME/MX
         -> Θύρες: 80, 443, 22 (OpenSSH 9.6), 8080 (dev server)
         -> WAF: ανιχνεύτηκε Cloudflare, βρέθηκε IP προέλευσης μέσω direct-connect
         -> Απαρίθμηση: 12 subdomains μέσω CT logs, ανιχνεύτηκε wildcard DNS
         -> "Το target.com τρέχει nginx/1.24.0 με Express.js πίσω από
            Cloudflare WAF. Η IP προέλευσης 203.0.113.42 εκτίθεται στη θύρα 8080.
            Το TLS είναι σωστά ρυθμισμένο (ισοδύναμο A+) αλλά ο dev server
            στη θύρα 8080 δεν έχει προστασία WAF. 3 subdomains δείχνουν σε
            αποσυρμένη υποδομή — πιθανός κίνδυνος κατάληψης."
```

---

## Πώς Διαφέρει

Τα υπάρχοντα εργαλεία σας δίνουν ακατέργαστα δεδομένα ένα επίπεδο τη φορά. Το fingerprint-mcp δίνει στον AI agent σας τη δυνατότητα να **συλλογίζεται ταυτόχρονα σε όλα τα επίπεδα αποτύπωσης**.

<table>
<thead>
<tr>
<th></th>
<th>Παραδοσιακή Προσέγγιση</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Διεπαφή</b></td>
<td>11 διαφορετικά εργαλεία CLI με διαφορετικές μορφές εξόδου</td>
<td>MCP &mdash; ο AI agent καλεί εργαλεία συνομιλητικά</td>
</tr>
<tr>
<td><b>Τεχνικές</b></td>
<td>Ένα εργαλείο, ένα επίπεδο τη φορά</td>
<td>103 τεχνικές σε 21 παρόχους, εκτελούνται παράλληλα</td>
</tr>
<tr>
<td><b>Ανάλυση TLS</b></td>
<td>Έξοδος testssl.sh, χειροκίνητη ανάλυση JARM ξεχωριστά</td>
<td>Ο agent συνδυάζει πιστοποιητικό + JARM + JA4X + cipher suites + SNI + CT logs σε μία κλήση</td>
</tr>
<tr>
<td><b>Συσχέτιση</b></td>
<td>Αντιγραφή-επικόλληση αποτελεσμάτων σε υπολογιστικό φύλλο</td>
<td>Ο agent διασταυρώνει: "Το JARM ταιριάζει με γνωστό C2 framework, ο χρονισμός HTTP επιβεβαιώνει honeypot"</td>
</tr>
<tr>
<td><b>Παράκαμψη WAF</b></td>
<td>Το wafw00f ανιχνεύει WAF, εσείς ψάχνετε χειροκίνητα για την προέλευση</td>
<td>Ο agent ανιχνεύει WAF, ανακαλύπτει την IP προέλευσης και επαληθεύει ότι εξυπηρετεί το ίδιο περιεχόμενο</td>
</tr>
<tr>
<td><b>API κλειδιά</b></td>
<td>Απαιτούνται για Shodan, Censys κλπ.</td>
<td>80+ ενεργές τεχνικές λειτουργούν χωρίς κανένα API κλειδί· τα κλειδιά ξεκλειδώνουν εμπλουτισμό OSINT</td>
</tr>
<tr>
<td><b>Εγκατάσταση</b></td>
<td>Εγκαταστήστε nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; μία εντολή, μηδέν ρύθμιση</td>
</tr>
</tbody>
</table>

---

## Γρήγορη Εκκίνηση

### Επιλογή 1: npx (χωρίς εγκατάσταση)

```bash
npx fingerprint-mcp
```

Όλες οι 80+ ενεργές τεχνικές αποτύπωσης λειτουργούν αμέσως. Δεν απαιτούνται API κλειδιά για TCP, TLS, SSH, HTTP, DNS, WAF, μονοπάτια, υπηρεσίες, χρονισμό, IoT, SMTP, αποτύπωση υποδομής και εφαρμογών.

### Επιλογή 2: Κλωνοποίηση

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Μεταβλητές περιβάλλοντος (προαιρετικά)

```bash
# Εμπλουτισμός OSINT (όλα προαιρετικά — η ενεργή αποτύπωση λειτουργεί χωρίς κανένα κλειδί)
export SHODAN_API_KEY=your-key           # Ενεργοποιεί osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Ενεργοποιεί osint_censys (δωρεάν: 250 ερωτήματα/μήνα)
export CENSYS_API_SECRET=your-secret     # Μυστικό Censys API
export SECURITYTRAILS_API_KEY=your-key   # Ενεργοποιεί waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Ενεργοποιεί osint_virustotal (δωρεάν: 500 ερωτήματα/ημέρα)
```

Όλα τα API κλειδιά είναι προαιρετικά. Χωρίς αυτά, εξακολουθείτε να έχετε πλήρη αποτύπωση TCP/TLS/SSH/HTTP/DNS/WAF/μονοπατιών/υπηρεσιών/χρονισμού/IoT/SMTP/υποδομής/εφαρμογών, συσχέτιση, παθητική ανάλυση, απαρίθμηση και meta εργαλεία &mdash; 80+ τεχνικές που λειτουργούν ανιχνεύοντας απευθείας τον στόχο.

### Σύνδεση με τον AI agent σας

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Με npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Με τοπικό κλώνο
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Προσθέστε στο `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / άλλοι MCP clients</b></summary>

Ίδια μορφή ρύθμισης JSON. Κατευθύνετε την εντολή στο `npx fingerprint-mcp` ή στη διαδρομή τοπικής εγκατάστασής σας.

</details>

### Ξεκινήστε ερωτήματα

```
Εσείς: "Αποτύπωσε τα πάντα στο target.com — TLS, HTTP stack, WAF, DNS, ανοιχτές θύρες"
```

Αυτό είναι. Ο agent χειρίζεται αυτόματα την πολυεπίπεδη αποτύπωση, τη συσχέτιση σημάτων και την ανάλυση υποδομής.

---

## Τι Μπορεί να Κάνει το AI

### Γρήγορη Αναγνώριση

```
Εσείς: "Γρήγορη αναγνώριση στο target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: θύρες 80, 443, 22 ανοιχτές
       -> TLS: πιστοποιητικό Let's Encrypt RSA, TLS 1.2+1.3, υπογραφή JARM nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM ρυθμισμένα
       -> WAF: ανιχνεύτηκε Cloudflare (header cf-ray)
       -> "Το target.com είναι ένα React SPA σε Express.js πίσω από nginx/1.24.0,
          που εξυπηρετείται μέσω Cloudflare CDN. Το TLS ρυθμίστηκε σωστά με
          Let's Encrypt. SSH στη θύρα 22 τρέχει OpenSSH 9.6. Τα email
          διαχειρίζεται το Google Workspace με πλήρες SPF/DKIM/DMARC."
```

### Βαθιά Έρευνα TLS

```
Εσείς: "Ανάλυσε λεπτομερώς τη ρύθμιση TLS του suspicious-server.com"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Πιστοποιητικό: αυτο-υπογεγραμμένο, CN=localhost, έληξε πριν 47 ημέρες
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (ταιριάζει με το προεπιλεγμένο προφίλ Cobalt Strike)
       -> JA4X: το αποτύπωμα ταιριάζει με γνωστό μοτίβο C2 framework
       -> Cipher suites: δέχεται αδύναμα ciphers (RC4, 3DES)
       -> SNI: απαντά ταυτόσημα σε οποιαδήποτε τιμή SNI
       -> CT logs: το πιστοποιητικό δεν καταγράφηκε (δεν είναι δημόσια αξιόπιστο)
       -> "ΥΨΗΛΟΣ ΚΙΝΔΥΝΟΣ: Η ρύθμιση TLS υποδεικνύει ισχυρά υποδομή C2.
          Αυτο-υπογεγραμμένο ληγμένο πιστοποιητικό, αποτύπωμα JARM ταιριάζει με Cobalt Strike,
          δέχεται αδύναμα ciphers, και απαντά σε αυθαίρετες τιμές SNI.
          Συνιστάται άμεση έρευνα και αποκλεισμός."
```

### Παράκαμψη WAF & Ανακάλυψη Προέλευσης

```
Εσείς: "Το target.com είναι πίσω από WAF. Μπορείς να βρεις τον server προέλευσης;"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), σελίδα πρόκλησης σε ύποπτα αιτήματα
       -> DNS: εγγραφή A δείχνει σε IP Cloudflare 104.21.x.x
       -> Subdomains: dev.target.com επιλύεται σε 203.0.113.42 (μη-Cloudflare)
       -> Απευθείας σύνδεση στο 203.0.113.42:443 επιστρέφει ίδιο πιστοποιητικό TLS
       -> Ιστορικό SecurityTrails: η προέλευση ήταν 203.0.113.42 πριν το Cloudflare
       -> "Βρέθηκε IP προέλευσης: 203.0.113.42. Ανακαλύφθηκε μέσω του subdomain
          dev.target.com που παρακάμπτει το Cloudflare. Η προέλευση εξυπηρετεί
          το ίδιο πιστοποιητικό TLS και απαντά στο Host header target.com.
          Η προέλευση δεν έχει προστασία WAF — δυνατή η άμεση πρόσβαση."
```

### Ανακάλυψη Υπηρεσιών σε Host

```
Εσείς: "Τι υπηρεσίες τρέχουν στο 10.0.1.50;"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Θύρα 22: OpenSSH 8.9p1 Ubuntu, κλειδί host ED25519
       -> Θύρα 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Θύρα 3306: MySQL 8.0.36, απαιτείται πιστοποίηση
       -> Θύρα 5432: PostgreSQL 16.1, απαιτείται SSL
       -> Θύρα 6379: Redis 7.2.4, ΧΩΡΙΣ πιστοποίηση (ανοιχτό)
       -> Θύρα 8080: Node.js Express dev server, CORS: *
       -> "ΚΡΙΣΙΜΟ: Το Redis στη θύρα 6379 δεν έχει πιστοποίηση — οποιοσδήποτε
          στο δίκτυο μπορεί να διαβάσει/γράψει δεδομένα. Ο Express dev server
          στη θύρα 8080 έχει wildcard CORS. Οι MySQL και PostgreSQL απαιτούν
          σωστά πιστοποίηση. Το WordPress υστερεί κατά 2 μικρές εκδόσεις.
          Απαιτείται άμεση δράση για το Redis και την έκθεση του dev server."
```

---

## Αναφορά Εργαλείων (13 εργαλεία, 103 τεχνικές)

<details open>
<summary><b>recon &mdash; Πλήρης αναγνώριση με επιλογή τεχνικών βάσει βάθους</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `url` | string | Στοχευμένο URL για αποτύπωση |
| `depth` | `quick` \| `standard` \| `deep` | Βάθος σάρωσης: quick=5 τεχνικές, standard=20, deep=50+ |

Ενορχηστρώνει τεχνικές από όλους τους παρόχους βάσει επιπέδου βάθους. Η γρήγορη λειτουργία δίνει γρήγορη επισκόπηση· η βαθιά λειτουργία εκτελεί εξαντλητική αποτύπωση συμπεριλαμβανομένων απαρίθμησης, OSINT και συσχέτισης.

</details>

<details>
<summary><b>scan_ports &mdash; Σάρωση θυρών TCP με ανίχνευση υπηρεσιών (3 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `host` | string | Στοχευμένο host (IP ή domain) |
| `ports` | number[] | Προαιρετικό &mdash; συγκεκριμένες θύρες για σάρωση (προεπιλογή: κοινές θύρες) |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `tcp_probe` | TCP connect σάρωση για ανίχνευση ανοιχτών θυρών |
| `tcp_banner` | Λήψη banner σε ανοιχτές θύρες για αναγνώριση υπηρεσιών |
| `tcp_analysis` | Ανάλυση συνδυασμών θυρών και συμπέρασμα υπηρεσιών |

</details>

<details>
<summary><b>scan_tls &mdash; Πλήρης ανάλυση TLS/SSL (8 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `host` | string | Στοχευμένο host (IP ή domain) |
| `port` | number | Προαιρετικό &mdash; θύρα TLS (προεπιλογή: 443) |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `tls_certificate` | Ανάλυση πιστοποιητικού X.509 &mdash; υποκείμενο, εκδότης, SAN, εγκυρότητα, αλυσίδα |
| `tls_jarm` | Ενεργή αποτύπωση JARM &mdash; 10 ανιχνεύσεις TLS Client Hello, hash 62 χαρακτήρων |
| `tls_ja4x` | Παθητική αποτύπωση JA4X TLS από ιδιότητες πιστοποιητικού |
| `tls_ciphers` | Απαρίθμηση cipher suites και ανάλυση ισχύος |
| `tls_protocols` | Ανίχνευση υποστηριζόμενων εκδόσεων πρωτοκόλλου TLS (SSLv3 έως TLS 1.3) |
| `tls_sni` | Δοκιμή συμπεριφοράς SNI &mdash; προεπιλεγμένο πιστοποιητικό vs. ζητούμενο hostname |
| `tls_ct_logs` | Αναζήτηση Certificate Transparency logs μέσω crt.sh |
| `tls_ocsp` | Έλεγχος OCSP stapling και κατάστασης ανάκλησης |

</details>

<details>
<summary><b>scan_dns &mdash; Πληροφορίες DNS (7 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `domain` | string | Στοχευμένο domain |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `dns_records` | Πλήρης απαρίθμηση εγγραφών &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Ανάλυση εγγραφών SPF, DKIM και DMARC |
| `dns_saas` | Ανίχνευση SaaS/υπηρεσιών μέσω μοτίβων CNAME και MX (Slack, Zendesk κλπ.) |
| `dns_server` | Αποτύπωση DNS server (BIND, PowerDNS, Cloudflare κλπ.) |
| `dns_takeover` | Ανίχνευση κατάληψης subdomain μέσω ανάλυσης κρεμασμένων CNAME |
| `dns_zone` | Απόπειρα μεταφοράς ζώνης (AXFR) |
| `dns_caa` | Ανάλυση εγγραφών CAA για περιορισμούς αρχών πιστοποίησης |

</details>

<details>
<summary><b>scan_http &mdash; Αποτύπωση HTTP/web (29 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `url` | string | Στοχευμένο URL |

| Τεχνική | Πάροχος | Περιγραφή |
|---------|---------|-----------|
| `http_headers` | HTTP | Ανάλυση headers απόκρισης και αναγνώριση server |
| `http_header_order` | HTTP | Αποτύπωμα σειράς headers (υπογραφή λογισμικού server) |
| `http_security_headers` | HTTP | Έλεγχος headers ασφαλείας (CSP, HSTS, X-Frame-Options κλπ.) |
| `http_cookies` | HTTP | Ανάλυση cookies &mdash; σημαίες, προθέματα, ανίχνευση framework |
| `http_methods` | HTTP | Απαρίθμηση επιτρεπόμενων HTTP μεθόδων (OPTIONS) |
| `http_cors` | HTTP | Ανάλυση πολιτικής CORS και ανίχνευση λανθασμένης ρύθμισης |
| `http_compression` | HTTP | Υποστηριζόμενοι αλγόριθμοι συμπίεσης (gzip, br, zstd) |
| `http_caching` | HTTP | Ανάλυση headers cache (ανίχνευση CDN, reverse proxy) |
| `http_etag` | HTTP | Ανάλυση μορφής ETag για αναγνώριση backend |
| `http_error` | HTTP | Αποτύπωση σελίδων σφάλματος (προσαρμοσμένες vs. προεπιλεγμένες) |
| `http_redirect` | HTTP | Ανάλυση αλυσίδας ανακατευθύνσεων |
| `http_timing` | HTTP | Βασική γραμμή χρονισμού απόκρισης για προφίλ απόδοσης server |
| `http_favicon` | HTTP | Hash favicon (MurmurHash3) για αναγνώριση τεχνολογίας |
| `http_robots` | HTTP | Ανάλυση robots.txt και εξαγωγή απαγορευμένων μονοπατιών |
| `http_sitemap` | HTTP | Ανακάλυψη sitemap και εξαγωγή URL |
| `http_wellknown` | HTTP | Ανακάλυψη σημείων .well-known (security.txt, openid κλπ.) |
| `web_tech` | Web | Ανίχνευση τεχνολογίας μέσω μοτίβων HTML/JS/CSS |
| `web_analytics` | Web | Ανίχνευση υπηρεσιών analytics και παρακολούθησης |
| `web_sourcemaps` | Web | Ανακάλυψη αρχείων source map |
| `web_websocket` | Web | Ανίχνευση σημείων WebSocket |
| `web_graphql` | Web | Ανίχνευση σημείων GraphQL και introspection |
| `web_spa` | Web | Ανίχνευση frameworks εφαρμογών μονής σελίδας |
| `web_cdn` | Web | Ανίχνευση CDN μέσω headers απόκρισης και DNS |
| `web_meta` | Web | Ανάλυση HTML meta tags (γεννήτρια, ενδείξεις framework) |
| `web_feed` | Web | Ανακάλυψη RSS/Atom feeds |
| `h2_detect` | HTTP/2 | Ανίχνευση υποστήριξης πρωτοκόλλου HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Αποτύπωση HTTP/2 server (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Ανίχνευση υποστήριξης HTTP/3 (QUIC) μέσω header Alt-Svc |
| `app_cms` | Application | Ανίχνευση CMS (WordPress, Drupal, Joomla κλπ.) |

</details>

<details>
<summary><b>scan_paths &mdash; Πληροφορίες μονοπατιών (5 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `url` | string | Στοχευμένο URL |
| `categories` | string[] | Προαιρετικό &mdash; κατηγορίες για έλεγχο (sensitive, git, debug, api, config) |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `path_sensitive` | Ανακάλυψη ευαίσθητων αρχείων (αρχεία αντιγράφων ασφαλείας, αρχεία ρύθμισης, dumps βάσεων δεδομένων) |
| `path_robots` | Ανάλυση robots.txt και sitemap.xml για κρυφά μονοπάτια |
| `path_git` | Ανίχνευση διαρροής αποθετηρίου Git (.git/HEAD, .git/config) |
| `path_debug` | Ανακάλυψη σημείων εντοπισμού σφαλμάτων (phpinfo, server-status, κονσόλες debug) |
| `path_api` | Ανακάλυψη εκδόσεων API και σημείων τεκμηρίωσης |

</details>

<details>
<summary><b>scan_waf &mdash; Ανίχνευση και αποτύπωση WAF/CDN (4 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `url` | string | Στοχευμένο URL |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `waf_detect` | Ανίχνευση παρουσίας WAF μέσω ανάλυσης header απόκρισης και συμπεριφοράς |
| `waf_cdn` | Αναγνώριση παρόχου CDN (Cloudflare, Akamai, Fastly κλπ.) |
| `waf_fingerprint` | Αναγνώριση προϊόντος WAF και ανίχνευση έκδοσης |
| `waf_origin` | Ανακάλυψη IP προέλευσης πίσω από WAF/CDN (απαιτεί `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Ανίχνευση σε επίπεδο υπηρεσίας (12 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `host` | string | Στοχευμένο host (IP ή domain) |
| `ports` | number[] | Προαιρετικό &mdash; συγκεκριμένες θύρες για ανίχνευση |
| `service` | string | Προαιρετικό &mdash; συγκεκριμένη υπηρεσία για ανίχνευση (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Τεχνική | Πάροχος | Περιγραφή |
|---------|---------|-----------|
| `ssh_probe` | SSH | Ανίχνευση έκδοσης πρωτοκόλλου SSH και λογισμικού |
| `ssh_algorithms` | SSH | Έλεγχος αλγορίθμων SSH (KEX, ciphers, MACs, τύποι κλειδιών host) |
| `ssh_hostkey_lookup` | SSH | Αναζήτηση κλειδιού host SSH μέσω Shodan (απαιτεί `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Ανίχνευση έκδοσης MySQL και αποτύπωση δυνατοτήτων |
| `svc_postgres` | Service | Ανίχνευση έκδοσης PostgreSQL και έλεγχος υποστήριξης SSL |
| `svc_redis` | Service | Ανίχνευση έκδοσης Redis και κατάσταση πιστοποίησης |
| `svc_ftp` | Service | Ανάλυση banner FTP και έλεγχος ανώνυμης σύνδεσης |
| `svc_vnc_rdp` | Service | Ανίχνευση υπηρεσιών VNC/RDP και αξιολόγηση ασφάλειας |
| `smtp_banner` | SMTP | Ανάλυση banner SMTP και αναγνώριση MTA |
| `smtp_starttls` | SMTP | Υποστήριξη SMTP STARTTLS και επιθεώρηση πιστοποιητικού |
| `iot_detect` | IoT | Ανίχνευση συσκευών IoT μέσω μοτίβων banner και προεπιλεγμένων σελίδων |
| `iot_upnp` | IoT | Ανακάλυψη συσκευών UPnP/SSDP σε τοπικό δίκτυο |

</details>

<details>
<summary><b>enumerate &mdash; Επέκταση εύρους (8 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `domain` | string | Στοχευμένο domain |

| Τεχνική | Περιγραφή |
|---------|-----------|
| `enum_subdomains` | Απαρίθμηση subdomains μέσω πολλαπλών μεθόδων |
| `enum_wildcard` | Ανίχνευση wildcard DNS |
| `enum_tld` | Επέκταση TLD (target.com -> target.net, target.org κλπ.) |
| `enum_related` | Ανακάλυψη σχετικών domains μέσω κοινής υποδομής |
| `enum_asn` | Ανακάλυψη γειτόνων ASN &mdash; άλλα domains στο ίδιο δίκτυο |
| `enum_ct` | Εξαγωγή subdomains από Certificate Transparency logs |
| `enum_passive_dns` | Ιστορικό παθητικού DNS (απαιτεί `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Σύνοψη εύρους και επισκόπηση επιφάνειας επίθεσης |

</details>

<details>
<summary><b>osint &mdash; Εμπλουτισμός OSINT (6 τεχνικές)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `target` | string | Διεύθυνση IP ή domain προς εμπλουτισμό |
| `type` | `ip` \| `domain` | Προαιρετικό &mdash; τύπος στόχου (αυτόματη ανίχνευση αν παραλειφθεί) |

| Τεχνική | Πιστοποίηση | Περιγραφή |
|---------|------------|-----------|
| `osint_shodan` | `SHODAN_API_KEY` | Αναζήτηση host Shodan &mdash; ανοιχτές θύρες, banners, ευπάθειες, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Δεδομένα host Censys &mdash; υπηρεσίες, TLS, αυτόνομο σύστημα |
| `osint_reverse_ip` | Κανένα | Αντίστροφη αναζήτηση IP &mdash; άλλα domains στην ίδια IP |
| `osint_whois` | Κανένα | Δεδομένα εγγραφής WHOIS &mdash; registrar, ημερομηνίες, nameservers |
| `osint_webarchive` | Κανένα | Ιστορικό Web Archive &mdash; πρώτο/τελευταίο snapshot, συχνότητα αλλαγών |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Αναφορά VirusTotal domain/IP &mdash; ανιχνεύσεις, κατηγορίες, DNS |

</details>

<details>
<summary><b>analyze &mdash; Παθητική ανάλυση αποτυπώματος (3 λειτουργίες)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `type` | `headers` \| `html` \| `banner` | Τύπος δεδομένων για ανάλυση |
| `data` | string | Ακατέργαστα δεδομένα για ανάλυση (επικολλήστε headers, HTML ή έξοδο banner) |

| Λειτουργία | Περιγραφή |
|------------|-----------|
| `fp_analyze_headers` | Παθητική ανάλυση HTTP headers &mdash; ανίχνευση server, framework, proxy χωρίς αποστολή κίνησης |
| `fp_analyze_html` | Παθητική ανάλυση HTML &mdash; ανίχνευση τεχνολογίας, αναγνώριση framework από πηγαίο κώδικα |
| `fp_analyze_banner` | Παθητική ανάλυση banner &mdash; αναγνώριση υπηρεσίας από ακατέργαστο κείμενο banner |

</details>

<details>
<summary><b>correlate &mdash; Μηχανή συσχέτισης πολλαπλών σημάτων (7 λειτουργίες)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Λειτουργία συσχέτισης |
| `signals` | object | Σήματα αποτυπώματος για συσχέτιση (διαφέρει ανά λειτουργία) |

| Λειτουργία | Περιγραφή |
|------------|-----------|
| `fp_consistency` | Έλεγχος συνέπειας διεπίπεδων σημάτων &mdash; συμφωνούν τα αποτυπώματα TCP, TLS, HTTP και DNS; |
| `fp_honeypot` | Ανίχνευση honeypot &mdash; έλεγχος για αδύνατους συνδυασμούς υπηρεσιών και ανωμαλίες συμπεριφοράς |
| `fp_spoofing` | Ανίχνευση πλαστογράφησης &mdash; αναγνώριση αναντιστοιχίας headers server vs. πραγματικής συμπεριφοράς |
| `fp_compare` | Σύγκριση δίπλα-δίπλα των προφίλ αποτυπώματος δύο hosts |
| `fp_topology` | Χαρτογράφηση τοπολογίας υποδομής &mdash; CDN, load balancer, αλυσίδα reverse proxy |
| `fp_c2` | Ανίχνευση C2 framework μέσω συσχέτισης JARM, TLS, HTTP και χρονισμού |
| `fp_identify` | Αναγνώριση βάσει hash έναντι βάσης δεδομένων γνωστών υπογραφών |

</details>

<details>
<summary><b>meta &mdash; Ρύθμιση και δεδομένα server (3 λειτουργίες)</b></summary>

| Παράμετρος | Τύπος | Περιγραφή |
|------------|-------|-----------|
| `category` | string | Προαιρετικό &mdash; φιλτράρισμα ανά κατηγορία |

| Λειτουργία | Περιγραφή |
|------------|-----------|
| `fp_sources` | Λίστα όλων των διαθέσιμων πηγών δεδομένων με ρύθμιση και κατάσταση API κλειδιών |
| `fp_config` | Ρύθμιση server &mdash; έκδοση, φορτωμένοι πάροχοι, αριθμός τεχνικών |
| `fp_signatures` | Λίστα βάσης δεδομένων υπογραφών &mdash; υπογραφές JARM, banner, WAF, εφαρμογών |

</details>

---

### Χρήση CLI

```bash
# Λίστα όλων των διαθέσιμων εργαλείων και τεχνικών
npx fingerprint-mcp --list

# Εκτέλεση οποιουδήποτε εργαλείου απευθείας
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

# Εργαλεία OSINT (απαιτούν API κλειδιά)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Πηγές Δεδομένων (21)

| Πηγή | Πιστοποίηση | Τι παρέχει |
|------|------------|------------|
| TCP ανίχνευση | Κανένα | Σάρωση θυρών, λήψη banner, ανίχνευση υπηρεσιών |
| Ανάλυση TLS/SSL | Κανένα | Ανάλυση πιστοποιητικών, αποτύπωση JARM, JA4X, απαρίθμηση ciphers, δοκιμή SNI |
| Ανίχνευση SSH | Κανένα | Έκδοση πρωτοκόλλου, έλεγχος αλγορίθμων, ανίχνευση λογισμικού |
| Ανάλυση HTTP | Κανένα | Αποτύπωση headers, κατακερματισμός favicon, ανάλυση cookies, απαρίθμηση μεθόδων, CORS |
| Ανίχνευση Web | Κανένα | Ανίχνευση τεχνολογίας, analytics, source maps, WebSocket, GraphQL, SPA frameworks |
| Ανακάλυψη μονοπατιών | Κανένα | Ευαίσθητα αρχεία, διαρροές git, σημεία debug, εκδόσεις API, robots.txt |
| Ανάλυση DNS | Κανένα | Απαρίθμηση εγγραφών, ανάλυση πιστοποίησης email, ανίχνευση SaaS, αποτύπωση servers |
| Ανίχνευση WAF/CDN | Κανένα | Αναγνώριση WAF, ανίχνευση CDN, αποτύπωση WAF |
| Ανάλυση χρονισμού | Κανένα | Βασική γραμμή χρονισμού απόκρισης, ανίχνευση απόκλισης ρολογιού |
| HTTP/2 & HTTP/3 | Κανένα | Ανίχνευση και αποτύπωση HTTP/2, ανακάλυψη HTTP/3 Alt-Svc |
| Ανίχνευση SMTP | Κανένα | Ανάλυση banner SMTP, επιθεώρηση STARTTLS |
| IoT/Ενσωματωμένα | Κανένα | Ανίχνευση συσκευών IoT, ανακάλυψη UPnP/SSDP |
| Ανίχνευση εφαρμογών | Κανένα | Αναγνώριση CMS, framework και πλατφορμών e-commerce |
| Ανίχνευση υπηρεσιών | Κανένα | Αποτύπωση MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Ανίχνευση υποδομής | Κανένα | Αναγνώριση παρόχου cloud, παρόχου hosting, CDN |
| Μηχανή συσχέτισης | Κανένα | Συνέπεια σημάτων, ανίχνευση honeypot, ανίχνευση πλαστογράφησης, χαρτογράφηση τοπολογίας |
| Μηχανή αναγνώρισης | Κανένα | Αναγνώριση βάσει hash, ανίχνευση C2, αντιστοίχιση υπογραφών |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Πληροφορίες host &mdash; ανοιχτές θύρες, banners, ευπάθειες, ανίχνευση OS |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Δεδομένα host &mdash; υπηρεσίες, πιστοποιητικά TLS, πληροφορίες αυτόνομου συστήματος |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Ανακάλυψη προέλευσης WAF, ιστορικό παθητικού DNS, ιστορικές εγγραφές |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Φήμη domain/IP, αποτελέσματα ανίχνευσης, ιστορικό DNS, κατηγορίες |

---

## Αρχιτεκτονική

```
src/
  index.ts                # Σημείο εισόδου CLI (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts         # Εγκατάσταση MCP server (stdio transport)
    tools.ts              # Μητρώο εργαλείων — και τα 13 σύνθετα εργαλεία εγγράφονται εδώ
  types/
    index.ts              # Κοινοί τύποι (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Περιοριστής ρυθμού ανά πάροχο
    cache.ts              # TTL cache για αποκρίσεις API
    require-key.ts        # Βοηθός επαλήθευσης API κλειδιών
    murmurhash3.ts        # MurmurHash3 για κατακερματισμό favicon
  composite/              # 13 σύνθετοι ενορχηστρωτές εργαλείων
    recon.ts              # Ενορχηστρωτής πλήρους αναγνώρισης (quick/standard/deep)
    scan-ports.ts         # Σύνθετο σάρωσης θυρών
    scan-tls.ts           # Σύνθετο ανάλυσης TLS
    scan-dns.ts           # Σύνθετο πληροφοριών DNS
    scan-http.ts          # Σύνθετο αποτύπωσης HTTP
    scan-paths.ts         # Σύνθετο ανακάλυψης μονοπατιών
    scan-waf.ts           # Σύνθετο ανίχνευσης WAF/CDN
    scan-services.ts      # Σύνθετο ανίχνευσης υπηρεσιών
    analyze.ts            # Σύνθετο παθητικής ανάλυσης
    correlate.ts          # Σύνθετο μηχανής συσχέτισης
    enumerate.ts          # Σύνθετο επέκτασης εύρους
    osint.ts              # Σύνθετο εμπλουτισμού OSINT
    meta.ts               # Σύνθετο meta server
    helpers.ts            # Κοινοί σύνθετοι βοηθοί
  tcp/                    # Τεχνικές ανίχνευσης TCP (3)
  tls/                    # Τεχνικές ανάλυσης TLS/SSL (8)
  ssh/                    # Τεχνικές ανίχνευσης SSH (3)
  http/                   # Τεχνικές αποτύπωσης HTTP (16)
  web/                    # Τεχνικές ανίχνευσης web τεχνολογιών (9)
  path/                   # Τεχνικές ανακάλυψης μονοπατιών (5)
  dns/                    # Τεχνικές πληροφοριών DNS (7)
  waf/                    # Τεχνικές ανίχνευσης WAF/CDN (4)
  timing/                 # Τεχνικές ανάλυσης χρονισμού (2)
  h2/                     # Τεχνικές HTTP/2 & HTTP/3 (3)
  smtp/                   # Τεχνικές ανίχνευσης SMTP (2)
  iot/                    # Τεχνικές ανίχνευσης IoT/ενσωματωμένων (2)
  app/                    # Τεχνικές ανίχνευσης εφαρμογών (3)
  service/                # Τεχνικές ανίχνευσης υπηρεσιών (5)
  infra/                  # Τεχνικές ανίχνευσης υποδομής (3)
  correlation/            # Μηχανή συσχέτισης (5)
  identify/               # Μηχανή αναγνώρισης (3)
  passive/                # Παθητική ανάλυση (3)
  osint/                  # Τεχνικές εμπλουτισμού OSINT (6)
  enum/                   # Τεχνικές απαρίθμησης (8)
  meta/                   # Meta εργαλεία (3)
  data/                   # Βάσεις δεδομένων υπογραφών και βιβλιοθήκες μοτίβων
    jarm-signatures.ts    # Γνωστά αποτυπώματα JARM (C2, servers, CDN)
    waf-signatures.ts     # Υπογραφές ανίχνευσης WAF
    service-banners.ts    # Μοτίβα banner υπηρεσιών
    tech-patterns.ts      # Μοτίβα ανίχνευσης τεχνολογίας
    favicon-hashes.ts     # Γνωστές τιμές MurmurHash3 favicon
    c2-signatures.ts      # Υπογραφές C2 frameworks
    ...                   # 15+ βάσεις δεδομένων υπογραφών/μοτίβων
```

**Σχεδιαστικές αποφάσεις:**

- **13 σύνθετα εργαλεία, 103 τεχνικές** &mdash; Ο agent καλεί εργαλεία υψηλού επιπέδου (`recon`, `scan_tls`, `scan_http`). Κάθε σύνθετο ενορχηστρώνει πολλαπλές τεχνικές χαμηλού επιπέδου και επιστρέφει συσχετισμένα αποτελέσματα. Αυτό μειώνει το overhead κλήσεων εργαλείων διατηρώντας τη λεπτομέρεια.
- **21 πάροχοι, 1 server** &mdash; Κάθε επίπεδο αποτύπωσης είναι ανεξάρτητο module. Ο σύνθετος ενορχηστρωτής επιλέγει τεχνικές βάσει πλαισίου και βάθους.
- **Πρώτα ενεργό, OSINT προαιρετικό** &mdash; 80+ τεχνικές λειτουργούν ανιχνεύοντας απευθείας τον στόχο με μηδέν API κλειδιά. Οι πάροχοι OSINT (Shodan, Censys, VirusTotal, SecurityTrails) προσθέτουν εμπλουτισμό αλλά δεν είναι ποτέ απαραίτητοι.
- **Περιοριστές ρυθμού ανά πάροχο** &mdash; Κάθε πάροχος έχει τη δική του περίπτωση `RateLimiter`. Η ενεργή ανίχνευση περιορίζεται σε ρυθμό για αποφυγή ανίχνευσης· τα OSINT APIs βαθμονομούνται στα quotas τους.
- **TTL caching** &mdash; Εγγραφές DNS (10 λεπτά), αποτελέσματα OSINT (15 λεπτά), CT logs (30 λεπτά) αποθηκεύονται σε cache για αποφυγή περιττών αναζητήσεων κατά τη διάρκεια ροών εργασίας πολλαπλών εργαλείων.
- **Χαριτωμένη υποβάθμιση** &mdash; Τα ελλείποντα API κλειδιά δεν κρασάρουν τον server. Τα εργαλεία OSINT επιστρέφουν περιγραφικά μηνύματα: "Ρυθμίστε SHODAN_API_KEY για ενεργοποίηση αναζήτησης host Shodan."
- **3 εξαρτήσεις** &mdash; `@modelcontextprotocol/sdk`, `zod` και `cheerio`. Όλες οι λειτουργίες I/O δικτύου μέσω native `fetch()` και modules Node.js `net`/`tls`/`dns`. Χωρίς nmap, χωρίς εξωτερικά εκτελέσιμα.

---

## Περιορισμοί

- Τα εργαλεία OSINT (Shodan, Censys, VirusTotal, SecurityTrails) απαιτούν API κλειδιά για τις αντίστοιχες τεχνικές τους
- Η δωρεάν βαθμίδα Censys περιορίζεται σε 250 ερωτήματα/μήνα
- Η δωρεάν βαθμίδα VirusTotal περιορίζεται σε 500 ερωτήματα/ημέρα
- Η σάρωση θυρών χρησιμοποιεί TCP connect (όχι SYN scan) &mdash; λιγότερο διακριτική από nmap αλλά δεν απαιτεί δικαιώματα root
- Η αποτύπωση JARM απαιτεί άμεση πρόσβαση TCP στον στόχο (μπορεί να αποκλειστεί από firewalls)
- Η ανακάλυψη UPnP/SSDP λειτουργεί μόνο σε τοπικά δίκτυα
- Η ανίχνευση υπηρεσιών (MySQL, PostgreSQL, Redis) συνδέεται αλλά δεν πιστοποιείται
- Η απαρίθμηση subdomains βασίζεται σε CT logs και παθητικές πηγές (χωρίς brute-force)
- Δοκιμασμένο σε macOS / Linux (Windows δεν δοκιμάστηκε)

---

## Μέρος της Σουίτας Ασφαλείας MCP

| Έργο | Τομέας | Εργαλεία |
|------|--------|----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Δοκιμές ασφάλειας μέσω browser | 39 εργαλεία, Firefox, δοκιμές injection |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Ασφάλεια cloud (AWS/Azure/GCP) | 38 εργαλεία, 60+ έλεγχοι |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Θέση ασφαλείας GitHub | 39 εργαλεία, 45 έλεγχοι |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Πληροφορίες ευπαθειών | 23 εργαλεία, 5 πηγές |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & αναγνώριση | 37 εργαλεία, 12 πηγές |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & πληροφορίες απειλών | 66 εργαλεία, 16 πηγές |
| **fingerprint-mcp** | **Καθολικό ψηφιακό αποτύπωμα** | **13 εργαλεία, 103 τεχνικές, 21 πάροχοι** |

---

<p align="center">
<b>Μόνο για εξουσιοδοτημένες δοκιμές και αξιολόγηση ασφάλειας.</b><br>
Πάντα βεβαιωθείτε ότι έχετε κατάλληλη εξουσιοδότηση πριν εκτελέσετε αποτύπωση σε οποιονδήποτε στόχο.
</p>

<p align="center">
  <a href="LICENSE">Άδεια AGPL-3.0</a> &bull; Κατασκευάστηκε με Bun + TypeScript
</p>
