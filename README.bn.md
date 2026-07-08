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
  <strong>বাংলা</strong> |
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

<h3 align="center">AI এজেন্টদের জন্য সর্বজনীন ডিজিটাল ফিঙ্গারপ্রিন্টিং।</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, সার্ভিস প্রোবিং, JARM, JA4X, ফেভিকন হ্যাশিং, অবকাঠামো টপোলজি, C2 শনাক্তকরণ, OSINT সমৃদ্ধকরণ &mdash; একটি একক MCP সার্ভারে একীভূত।<br>
  আপনার AI এজেন্ট পায় <b>চাহিদা অনুযায়ী সম্পূর্ণ-বর্ণালী ফিঙ্গারপ্রিন্টিং</b>, ১১টি বিচ্ছিন্ন CLI টুল এবং ম্যানুয়াল সম্পর্কযুক্তকরণ নয়।
</p>

<br>

<p align="center">
  <a href="#সমস্যা">সমস্যা</a> &bull;
  <a href="#এটি-কীভাবে-আলাদা">এটি কীভাবে আলাদা</a> &bull;
  <a href="#দ্রুত-শুরু">দ্রুত শুরু</a> &bull;
  <a href="#ai-কী-করতে-পারে">AI কী করতে পারে</a> &bull;
  <a href="#টুল-রেফারেন্স-১৩-টুল-১০৩-কৌশল">টুল (১৩)</a> &bull;
  <a href="#ডেটা-উৎস-২১">ডেটা উৎস</a> &bull;
  <a href="#আর্কিটেকচার">আর্কিটেকচার</a> &bull;
  <a href="CHANGELOG.md">পরিবর্তন লগ</a> &bull;
  <a href="CONTRIBUTING.md">অবদান</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="লাইসেন্স"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="১৩ টুল">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="১০৩ কৌশল">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp ডেমো" width="800">
</p>

---

## সমস্যা

আজকে একটি সার্ভারের ফিঙ্গারপ্রিন্ট নেওয়া মানে একগুচ্ছ বিচ্ছিন্ন টুল নিয়ে জাগলিং করা। আপনি পোর্ট স্ক্যানিংয়ের জন্য `nmap`, সার্টিফিকেট বিশ্লেষণের জন্য `testssl.sh`, HTTP হেডারের জন্য `curl -I`, DNS-এর জন্য `dig`, WAF শনাক্তকরণের জন্য `wafw00f`, SSH-এর জন্য `ssh-audit`, একটি আলাদা JARM টুল, প্রযুক্তি শনাক্তকরণের জন্য Wappalyzer চালান &mdash; এবং তারপর আসলে কী চলছে তা বুঝতে একটি স্প্রেডশিটে সবকিছু ম্যানুয়ালি ক্রস-রেফারেন্স করতে ৩০ মিনিট ব্যয় করেন।

```
ঐতিহ্যবাহী ফিঙ্গারপ্রিন্টিং কর্মপ্রবাহ:
  TLS সার্টিফিকেট বিশ্লেষণ      ->  testssl.sh / openssl s_client
  HTTP হেডার সংগ্রহ              ->  curl -I
  ওয়েব প্রযুক্তি শনাক্তকরণ     ->  wappalyzer CLI
  DNS রিকনেসান্স                 ->  dig / nslookup / dnsenum
  পোর্ট স্ক্যানিং               ->  nmap -sV
  WAF শনাক্তকরণ                  ->  wafw00f
  SSH অডিট                       ->  ssh-audit
  সার্ভিস ফিঙ্গারপ্রিন্টিং     ->  nmap scripts
  JARM ফিঙ্গারপ্রিন্ট           ->  jarm (আলাদা টুল)
  OSINT ডাটাবেস পরীক্ষা          ->  shodan CLI, censys CLI
  সবকিছু সম্পর্কযুক্ত করা      ->  ম্যানুয়ালি স্প্রেডশিটে
  ──────────────────────────────
  মোট: ১১ টুল, ৩০+ মিনিট, ম্যানুয়াল সম্পর্কযুক্তকরণ
```

**fingerprint-mcp** আপনার AI এজেন্টকে [Model Context Protocol](https://modelcontextprotocol.io) এর মাধ্যমে ২১টি প্রদানকারী জুড়ে ১০৩টি ফিঙ্গারপ্রিন্টিং কৌশল সম্বলিত ১৩টি কম্পোজিট টুল দেয়। এজেন্ট সমান্তরালে বহু-স্তরের ফিঙ্গারপ্রিন্টিং চালায়, TCP/TLS/HTTP/DNS/SSH স্তর জুড়ে সংকেত সম্পর্কযুক্ত করে, হানিপট এবং C2 অবকাঠামো শনাক্ত করে, এবং একটি একীভূত গোয়েন্দা চিত্র উপস্থাপন করে &mdash; একটি একক কথোপকথনে।

```
fingerprint-mcp দিয়ে:
  আপনি: "target.com-এ গভীর রিকন করো"

  এজেন্ট: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: JARM (3fd21b20d00000...) এর মাধ্যমে nginx/1.24.0,
            Let's Encrypt সার্টিফিকেট, ২ SAN, TLS 1.2+1.3
         -> HTTP: Cloudflare WAF-এর পিছনে Express.js,
            React SPA, Google Analytics, ১৪টি নিরাপত্তা হেডার বিশ্লেষিত
         -> DNS: A/AAAA/MX/TXT রেকর্ড, SPF/DKIM/DMARC কনফিগার করা,
            CNAME/MX এর মাধ্যমে Slack + Google Workspace শনাক্ত
         -> পোর্ট: 80, 443, 22 (OpenSSH 9.6), 8080 (dev সার্ভার)
         -> WAF: Cloudflare শনাক্ত, direct-connect এর মাধ্যমে উৎস IP আবিষ্কৃত
         -> গণনা: CT লগের মাধ্যমে ১২টি সাবডোমেইন, wildcard DNS শনাক্ত
         -> "target.com Cloudflare WAF-এর পিছনে Express.js সহ nginx/1.24.0 চালায়।
            উৎস IP 203.0.113.42 পোর্ট 8080-এ উন্মুক্ত।
            TLS সঠিকভাবে কনফিগার করা (A+ সমতুল্য) কিন্তু 8080-এর dev সার্ভারে
            কোনো WAF সুরক্ষা নেই। ৩টি সাবডোমেইন অবসরপ্রাপ্ত
            অবকাঠামোতে নির্দেশ করে — সম্ভাব্য টেকওভার ঝুঁকি।"
```

---

## এটি কীভাবে আলাদা

বিদ্যমান টুলগুলি আপনাকে একবারে একটি স্তরের কাঁচা ডেটা দেয়। fingerprint-mcp আপনার AI এজেন্টকে **একই সাথে সমস্ত ফিঙ্গারপ্রিন্টিং স্তর জুড়ে যুক্তি করার** ক্ষমতা দেয়।

<table>
<thead>
<tr>
<th></th>
<th>ঐতিহ্যবাহী পদ্ধতি</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>ইন্টারফেস</b></td>
<td>বিভিন্ন আউটপুট ফরম্যাটসহ ১১টি ভিন্ন CLI টুল</td>
<td>MCP &mdash; AI এজেন্ট কথোপকথনমূলকভাবে টুল কল করে</td>
</tr>
<tr>
<td><b>কৌশল</b></td>
<td>একটি টুল, একবারে একটি স্তর</td>
<td>২১ প্রদানকারী জুড়ে ১০৩ কৌশল, সমান্তরালে চলে</td>
</tr>
<tr>
<td><b>TLS বিশ্লেষণ</b></td>
<td>testssl.sh আউটপুট, আলাদাভাবে ম্যানুয়ালি JARM পার্স করা</td>
<td>এজেন্ট সার্টিফিকেট + JARM + JA4X + সাইফার স্যুট + SNI + CT লগ একটি কলে সংযুক্ত করে</td>
</tr>
<tr>
<td><b>সম্পর্কযুক্তকরণ</b></td>
<td>ফলাফল স্প্রেডশিটে কপি-পেস্ট করা</td>
<td>এজেন্ট ক্রস-সম্পর্কযুক্ত করে: "JARM পরিচিত C2 ফ্রেমওয়ার্কের সাথে মেলে, HTTP টাইমিং হানিপট নিশ্চিত করে"</td>
</tr>
<tr>
<td><b>WAF বাইপাস</b></td>
<td>wafw00f WAF শনাক্ত করে, আপনি ম্যানুয়ালি উৎস খুঁজেন</td>
<td>এজেন্ট WAF শনাক্ত করে, উৎস IP আবিষ্কার করে, এবং যাচাই করে যে এটি একই কন্টেন্ট পরিবেশন করে</td>
</tr>
<tr>
<td><b>API কী</b></td>
<td>Shodan, Censys ইত্যাদির জন্য প্রয়োজন।</td>
<td>৮০+ সক্রিয় কৌশল কোনো API কী ছাড়াই কাজ করে; কীগুলি OSINT সমৃদ্ধকরণ আনলক করে</td>
</tr>
<tr>
<td><b>সেটআপ</b></td>
<td>nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer... ইনস্টল করুন</td>
<td><code>npx fingerprint-mcp</code> &mdash; একটি কমান্ড, শূন্য কনফিগারেশন</td>
</tr>
</tbody>
</table>

---

## দ্রুত শুরু

### বিকল্প ১: npx (ইনস্টল ছাড়া)

```bash
npx fingerprint-mcp
```

সমস্ত ৮০+ সক্রিয় ফিঙ্গারপ্রিন্টিং কৌশল তাৎক্ষণিকভাবে কাজ করে। TCP, TLS, SSH, HTTP, DNS, WAF, পাথ, সার্ভিস, টাইমিং, IoT, SMTP, অবকাঠামো এবং অ্যাপ্লিকেশন ফিঙ্গারপ্রিন্টিংয়ের জন্য কোনো API কী প্রয়োজন নেই।

### বিকল্প ২: ক্লোন

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### এনভায়রনমেন্ট ভেরিয়েবল (ঐচ্ছিক)

```bash
# OSINT সমৃদ্ধকরণ (সব ঐচ্ছিক — সক্রিয় ফিঙ্গারপ্রিন্টিং কোনো কী ছাড়াই কাজ করে)
export SHODAN_API_KEY=your-key           # osint_shodan, ssh_hostkey_lookup সক্রিয় করে
export CENSYS_API_ID=your-id             # osint_censys সক্রিয় করে (বিনামূল্যে: ২৫০ কোয়েরি/মাস)
export CENSYS_API_SECRET=your-secret     # Censys API সিক্রেট
export SECURITYTRAILS_API_KEY=your-key   # waf_origin, enum_passive_dns সক্রিয় করে
export VIRUSTOTAL_API_KEY=your-key       # osint_virustotal সক্রিয় করে (বিনামূল্যে: ৫০০ কোয়েরি/দিন)
```

সমস্ত API কী ঐচ্ছিক। এগুলি ছাড়াও, আপনি সম্পূর্ণ TCP/TLS/SSH/HTTP/DNS/WAF/পাথ/সার্ভিস/টাইমিং/IoT/SMTP/অবকাঠামো/অ্যাপ্লিকেশন ফিঙ্গারপ্রিন্টিং, সম্পর্কযুক্তকরণ, প্যাসিভ বিশ্লেষণ, গণনা এবং মেটা টুল পাবেন &mdash; ৮০+ কৌশল যা সরাসরি লক্ষ্য প্রোব করে কাজ করে।

### আপনার AI এজেন্টের সাথে সংযোগ করুন

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx দিয়ে
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# লোকাল ক্লোন দিয়ে
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json`-এ যোগ করুন:

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
<summary><b>Cursor / Windsurf / অন্যান্য MCP ক্লায়েন্ট</b></summary>

একই JSON কনফিগারেশন ফরম্যাট। কমান্ডটি `npx fingerprint-mcp` বা আপনার লোকাল ইনস্টলেশন পাথে নির্দেশ করুন।

</details>

### কোয়েরি শুরু করুন

```
আপনি: "target.com-এর সবকিছুর ফিঙ্গারপ্রিন্ট নাও — TLS, HTTP স্ট্যাক, WAF, DNS, খোলা পোর্ট"
```

এটাই সব। এজেন্ট স্বয়ংক্রিয়ভাবে বহু-স্তরের ফিঙ্গারপ্রিন্টিং, সংকেত সম্পর্কযুক্তকরণ এবং অবকাঠামো বিশ্লেষণ পরিচালনা করে।

---

## AI কী করতে পারে

### দ্রুত রিকন

```
আপনি: "target.com-এর দ্রুত রিকন"

এজেন্ট: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: পোর্ট 80, 443, 22 খোলা
       -> TLS: Let's Encrypt RSA সার্টিফিকেট, TLS 1.2+1.3, nginx JARM স্বাক্ষর
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM কনফিগার করা
       -> WAF: Cloudflare শনাক্ত (cf-ray হেডার)
       -> "target.com হলো nginx/1.24.0-এর পিছনে Express.js-এ একটি React SPA,
          Cloudflare CDN-এর মাধ্যমে পরিবেশিত। Let's Encrypt দিয়ে TLS
          সঠিকভাবে কনফিগার করা। পোর্ট 22-এ SSH OpenSSH 9.6 চালাচ্ছে। ইমেইল
          সম্পূর্ণ SPF/DKIM/DMARC সহ Google Workspace দ্বারা পরিচালিত।"
```

### গভীর TLS তদন্ত

```
আপনি: "suspicious-server.com-এর TLS কনফিগারেশন বিস্তারিতভাবে বিশ্লেষণ করো"

এজেন্ট: -> scan_tls {host: "suspicious-server.com"}

       -> সার্টিফিকেট: স্ব-স্বাক্ষরিত, CN=localhost, ৪৭ দিন আগে মেয়াদ শেষ
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (Cobalt Strike ডিফল্ট প্রোফাইলের সাথে মেলে)
       -> JA4X: ফিঙ্গারপ্রিন্ট পরিচিত C2 ফ্রেমওয়ার্ক প্যাটার্নের সাথে মেলে
       -> সাইফার স্যুট: দুর্বল সাইফার গ্রহণ করে (RC4, 3DES)
       -> SNI: যেকোনো SNI মানে অভিন্নভাবে সাড়া দেয়
       -> CT লগ: সার্টিফিকেট লগ করা হয়নি (সর্বজনীনভাবে বিশ্বস্ত নয়)
       -> "উচ্চ ঝুঁকি: TLS কনফিগারেশন দৃঢ়ভাবে C2 অবকাঠামো নির্দেশ করে।
          স্ব-স্বাক্ষরিত মেয়াদোত্তীর্ণ সার্টিফিকেট, JARM ফিঙ্গারপ্রিন্ট Cobalt Strike-এর সাথে মেলে,
          দুর্বল সাইফার গ্রহণ করে, এবং যেকোনো SNI মানে সাড়া দেয়।
          অবিলম্বে তদন্ত এবং ব্লকিং সুপারিশ করা হয়।"
```

### WAF বাইপাস এবং উৎস আবিষ্কার

```
আপনি: "target.com একটি WAF-এর পিছনে। তুমি কি উৎস সার্ভার খুঁজে পেতে পারো?"

এজেন্ট: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), সন্দেহজনক অনুরোধে চ্যালেঞ্জ পেজ
       -> DNS: A রেকর্ড Cloudflare IP 104.21.x.x-এ নির্দেশ করে
       -> সাবডোমেইন: dev.target.com 203.0.113.42-এ রিজলভ হয় (Cloudflare নয়)
       -> 203.0.113.42:443-এ সরাসরি সংযোগ একই TLS সার্টিফিকেট রিটার্ন করে
       -> SecurityTrails ইতিহাস: Cloudflare-এর আগে উৎস ছিল 203.0.113.42
       -> "উৎস IP পাওয়া গেছে: 203.0.113.42। dev.target.com সাবডোমেইনের
          মাধ্যমে আবিষ্কৃত যা Cloudflare বাইপাস করে। উৎস একই
          TLS সার্টিফিকেট পরিবেশন করে এবং target.com Host হেডারে সাড়া দেয়।
          উৎসে কোনো WAF সুরক্ষা নেই — সরাসরি অ্যাক্সেস সম্ভব।"
```

### একটি হোস্টে সার্ভিস আবিষ্কার

```
আপনি: "10.0.1.50-তে কোন সার্ভিসগুলি চলছে?"

এজেন্ট: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> পোর্ট 22: OpenSSH 8.9p1 Ubuntu, ED25519 হোস্ট কী
       -> পোর্ট 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> পোর্ট 3306: MySQL 8.0.36, প্রমাণীকরণ প্রয়োজন
       -> পোর্ট 5432: PostgreSQL 16.1, SSL প্রয়োজন
       -> পোর্ট 6379: Redis 7.2.4, কোনো প্রমাণীকরণ নেই (খোলা)
       -> পোর্ট 8080: Node.js Express dev সার্ভার, CORS: *
       -> "জটিল: পোর্ট 6379-এ Redis-এর কোনো প্রমাণীকরণ নেই — নেটওয়ার্কে
          যেকেউ ডেটা পড়তে/লিখতে পারে। 8080-এর Express dev সার্ভারে
          ওয়াইল্ডকার্ড CORS আছে। MySQL এবং PostgreSQL সঠিকভাবে প্রমাণীকরণ
          প্রয়োজন করে। WordPress ২টি মাইনর ভার্সন পিছিয়ে আছে। Redis এবং
          dev সার্ভার এক্সপোজারে অবিলম্বে পদক্ষেপ প্রয়োজন।"
```

---

## টুল রেফারেন্স (১৩ টুল, ১০৩ কৌশল)

<details open>
<summary><b>recon &mdash; গভীরতা-ভিত্তিক কৌশল নির্বাচনসহ সম্পূর্ণ রিকনেসান্স</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `url` | string | ফিঙ্গারপ্রিন্ট করার লক্ষ্য URL |
| `depth` | `quick` \| `standard` \| `deep` | স্ক্যান গভীরতা: quick=৫ কৌশল, standard=২০, deep=৫০+ |

গভীরতার স্তরের ভিত্তিতে সমস্ত প্রদানকারীদের থেকে কৌশল অর্কেস্ট্রেট করে। দ্রুত মোড একটি দ্রুত ওভারভিউ দেয়; গভীর মোড গণনা, OSINT এবং সম্পর্কযুক্তকরণসহ বিস্তৃত ফিঙ্গারপ্রিন্টিং চালায়।

</details>

<details>
<summary><b>scan_ports &mdash; সার্ভিস শনাক্তকরণসহ TCP পোর্ট স্ক্যানিং (৩ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `host` | string | লক্ষ্য হোস্ট (IP বা ডোমেইন) |
| `ports` | number[] | ঐচ্ছিক &mdash; স্ক্যান করার জন্য নির্দিষ্ট পোর্ট (ডিফল্ট সাধারণ পোর্ট) |

| কৌশল | বিবরণ |
|-------|-------|
| `tcp_probe` | খোলা পোর্ট শনাক্ত করতে TCP connect স্ক্যান |
| `tcp_banner` | সার্ভিস শনাক্তকরণের জন্য খোলা পোর্টে ব্যানার গ্র্যাবিং |
| `tcp_analysis` | পোর্ট সংমিশ্রণ বিশ্লেষণ এবং সার্ভিস অনুমান |

</details>

<details>
<summary><b>scan_tls &mdash; সম্পূর্ণ TLS/SSL বিশ্লেষণ (৮ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `host` | string | লক্ষ্য হোস্ট (IP বা ডোমেইন) |
| `port` | number | ঐচ্ছিক &mdash; TLS পোর্ট (ডিফল্ট: 443) |

| কৌশল | বিবরণ |
|-------|-------|
| `tls_certificate` | X.509 সার্টিফিকেট পার্সিং &mdash; সাবজেক্ট, ইস্যুয়ার, SAN, বৈধতা, চেইন |
| `tls_jarm` | JARM সক্রিয় ফিঙ্গারপ্রিন্টিং &mdash; ১০টি TLS Client Hello প্রোব, ৬২-অক্ষর হ্যাশ |
| `tls_ja4x` | সার্টিফিকেট বৈশিষ্ট্য থেকে JA4X প্যাসিভ TLS ফিঙ্গারপ্রিন্টিং |
| `tls_ciphers` | সাইফার স্যুট গণনা এবং শক্তি বিশ্লেষণ |
| `tls_protocols` | সমর্থিত TLS প্রোটোকল ভার্সন শনাক্তকরণ (SSLv3 থেকে TLS 1.3) |
| `tls_sni` | SNI আচরণ পরীক্ষা &mdash; ডিফল্ট সার্টিফিকেট বনাম অনুরোধকৃত হোস্টনেম |
| `tls_ct_logs` | crt.sh এর মাধ্যমে Certificate Transparency লগ লুকআপ |
| `tls_ocsp` | OCSP stapling এবং প্রত্যাহার স্থিতি পরীক্ষা |

</details>

<details>
<summary><b>scan_dns &mdash; DNS গোয়েন্দা তথ্য (৭ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `domain` | string | লক্ষ্য ডোমেইন |

| কৌশল | বিবরণ |
|-------|-------|
| `dns_records` | সম্পূর্ণ রেকর্ড গণনা &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF, DKIM এবং DMARC রেকর্ড বিশ্লেষণ |
| `dns_saas` | CNAME এবং MX প্যাটার্নের মাধ্যমে SaaS/সার্ভিস শনাক্তকরণ (Slack, Zendesk ইত্যাদি) |
| `dns_server` | DNS সার্ভার ফিঙ্গারপ্রিন্টিং (BIND, PowerDNS, Cloudflare ইত্যাদি) |
| `dns_takeover` | ড্যাংলিং CNAME বিশ্লেষণের মাধ্যমে সাবডোমেইন টেকওভার শনাক্তকরণ |
| `dns_zone` | জোন ট্রান্সফার প্রচেষ্টা (AXFR) |
| `dns_caa` | সার্টিফিকেট অথরিটি সীমাবদ্ধতার জন্য CAA রেকর্ড বিশ্লেষণ |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/ওয়েব ফিঙ্গারপ্রিন্টিং (২৯ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `url` | string | লক্ষ্য URL |

| কৌশল | প্রদানকারী | বিবরণ |
|-------|-----------|-------|
| `http_headers` | HTTP | রেসপন্স হেডার বিশ্লেষণ এবং সার্ভার শনাক্তকরণ |
| `http_header_order` | HTTP | হেডার ক্রম ফিঙ্গারপ্রিন্ট (সার্ভার সফটওয়্যার স্বাক্ষর) |
| `http_security_headers` | HTTP | নিরাপত্তা হেডার অডিট (CSP, HSTS, X-Frame-Options ইত্যাদি) |
| `http_cookies` | HTTP | কুকি বিশ্লেষণ &mdash; ফ্ল্যাগ, প্রিফিক্স, ফ্রেমওয়ার্ক শনাক্তকরণ |
| `http_methods` | HTTP | অনুমোদিত HTTP মেথড গণনা (OPTIONS) |
| `http_cors` | HTTP | CORS নীতি বিশ্লেষণ এবং ভুল কনফিগারেশন শনাক্তকরণ |
| `http_compression` | HTTP | সমর্থিত কম্প্রেশন অ্যালগরিদম (gzip, br, zstd) |
| `http_caching` | HTTP | ক্যাশে হেডার বিশ্লেষণ (CDN, রিভার্স প্রক্সি শনাক্তকরণ) |
| `http_etag` | HTTP | ব্যাকএন্ড শনাক্তকরণের জন্য ETag ফরম্যাট বিশ্লেষণ |
| `http_error` | HTTP | এরর পেজ ফিঙ্গারপ্রিন্টিং (কাস্টম বনাম ডিফল্ট এরর পেজ) |
| `http_redirect` | HTTP | রিডাইরেক্ট চেইন বিশ্লেষণ |
| `http_timing` | HTTP | সার্ভার পারফরম্যান্স প্রোফাইলিংয়ের জন্য রেসপন্স টাইমিং বেসলাইন |
| `http_favicon` | HTTP | প্রযুক্তি শনাক্তকরণের জন্য ফেভিকন হ্যাশ (MurmurHash3) |
| `http_robots` | HTTP | robots.txt পার্সিং এবং নিষিদ্ধ পাথ বের করা |
| `http_sitemap` | HTTP | সাইটম্যাপ আবিষ্কার এবং URL বের করা |
| `http_wellknown` | HTTP | .well-known এন্ডপয়েন্ট আবিষ্কার (security.txt, openid ইত্যাদি) |
| `web_tech` | Web | HTML/JS/CSS প্যাটার্নের মাধ্যমে প্রযুক্তি শনাক্তকরণ |
| `web_analytics` | Web | অ্যানালিটিক্স এবং ট্র্যাকিং সার্ভিস শনাক্তকরণ |
| `web_sourcemaps` | Web | সোর্স ম্যাপ ফাইল আবিষ্কার |
| `web_websocket` | Web | WebSocket এন্ডপয়েন্ট শনাক্তকরণ |
| `web_graphql` | Web | GraphQL এন্ডপয়েন্ট শনাক্তকরণ এবং ইন্ট্রোস্পেকশন |
| `web_spa` | Web | সিঙ্গেল-পেজ অ্যাপ্লিকেশন ফ্রেমওয়ার্ক শনাক্তকরণ |
| `web_cdn` | Web | রেসপন্স হেডার এবং DNS এর মাধ্যমে CDN শনাক্তকরণ |
| `web_meta` | Web | HTML মেটা ট্যাগ বিশ্লেষণ (জেনারেটর, ফ্রেমওয়ার্ক ইঙ্গিত) |
| `web_feed` | Web | RSS/Atom ফিড আবিষ্কার |
| `h2_detect` | HTTP/2 | HTTP/2 প্রোটোকল সমর্থন শনাক্তকরণ |
| `h2_fingerprint` | HTTP/2 | HTTP/2 সার্ভার ফিঙ্গারপ্রিন্টিং (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Alt-Svc হেডারের মাধ্যমে HTTP/3 (QUIC) সমর্থন শনাক্তকরণ |
| `app_cms` | Application | CMS শনাক্তকরণ (WordPress, Drupal, Joomla ইত্যাদি) |

</details>

<details>
<summary><b>scan_paths &mdash; পাথ গোয়েন্দা তথ্য (৫ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `url` | string | লক্ষ্য URL |
| `categories` | string[] | ঐচ্ছিক &mdash; পরীক্ষা করার বিভাগ (sensitive, git, debug, api, config) |

| কৌশল | বিবরণ |
|-------|-------|
| `path_sensitive` | সংবেদনশীল ফাইল আবিষ্কার (ব্যাকআপ ফাইল, কনফিগ ফাইল, ডাটাবেস ডাম্প) |
| `path_robots` | লুকানো পাথের জন্য robots.txt এবং sitemap.xml বিশ্লেষণ |
| `path_git` | Git রিপোজিটরি লিক শনাক্তকরণ (.git/HEAD, .git/config) |
| `path_debug` | ডিবাগ এন্ডপয়েন্ট আবিষ্কার (phpinfo, server-status, ডিবাগ কনসোল) |
| `path_api` | API ভার্সন এবং ডকুমেন্টেশন এন্ডপয়েন্ট আবিষ্কার |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN শনাক্তকরণ এবং ফিঙ্গারপ্রিন্টিং (৪ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `url` | string | লক্ষ্য URL |

| কৌশল | বিবরণ |
|-------|-------|
| `waf_detect` | রেসপন্স হেডার এবং আচরণ বিশ্লেষণের মাধ্যমে WAF উপস্থিতি শনাক্তকরণ |
| `waf_cdn` | CDN প্রদানকারী শনাক্তকরণ (Cloudflare, Akamai, Fastly ইত্যাদি) |
| `waf_fingerprint` | WAF পণ্য শনাক্তকরণ এবং ভার্সন শনাক্তকরণ |
| `waf_origin` | WAF/CDN-এর পিছনে উৎস IP আবিষ্কার (`SECURITYTRAILS_API_KEY` প্রয়োজন) |

</details>

<details>
<summary><b>scan_services &mdash; সার্ভিস-স্তরের প্রোবিং (১২ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `host` | string | লক্ষ্য হোস্ট (IP বা ডোমেইন) |
| `ports` | number[] | ঐচ্ছিক &mdash; প্রোব করার জন্য নির্দিষ্ট পোর্ট |
| `service` | string | ঐচ্ছিক &mdash; প্রোব করার জন্য নির্দিষ্ট সার্ভিস (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| কৌশল | প্রদানকারী | বিবরণ |
|-------|-----------|-------|
| `ssh_probe` | SSH | SSH প্রোটোকল ভার্সন এবং সফটওয়্যার শনাক্তকরণ |
| `ssh_algorithms` | SSH | SSH অ্যালগরিদম অডিট (KEX, সাইফার, MAC, হোস্ট কী টাইপ) |
| `ssh_hostkey_lookup` | SSH | Shodan এর মাধ্যমে SSH হোস্ট কী লুকআপ (`SHODAN_API_KEY` প্রয়োজন) |
| `svc_mysql` | Service | MySQL ভার্সন শনাক্তকরণ এবং ক্ষমতা ফিঙ্গারপ্রিন্টিং |
| `svc_postgres` | Service | PostgreSQL ভার্সন শনাক্তকরণ এবং SSL সমর্থন পরীক্ষা |
| `svc_redis` | Service | Redis ভার্সন শনাক্তকরণ এবং প্রমাণীকরণ স্থিতি |
| `svc_ftp` | Service | FTP ব্যানার বিশ্লেষণ এবং বেনামী লগইন পরীক্ষা |
| `svc_vnc_rdp` | Service | VNC/RDP সার্ভিস শনাক্তকরণ এবং নিরাপত্তা মূল্যায়ন |
| `smtp_banner` | SMTP | SMTP ব্যানার বিশ্লেষণ এবং MTA শনাক্তকরণ |
| `smtp_starttls` | SMTP | SMTP STARTTLS সমর্থন এবং সার্টিফিকেট পরিদর্শন |
| `iot_detect` | IoT | ব্যানার প্যাটার্ন এবং ডিফল্ট পেজের মাধ্যমে IoT ডিভাইস শনাক্তকরণ |
| `iot_upnp` | IoT | লোকাল নেটওয়ার্কে UPnP/SSDP ডিভাইস আবিষ্কার |

</details>

<details>
<summary><b>enumerate &mdash; পরিসর সম্প্রসারণ (৮ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `domain` | string | লক্ষ্য ডোমেইন |

| কৌশল | বিবরণ |
|-------|-------|
| `enum_subdomains` | একাধিক পদ্ধতির মাধ্যমে সাবডোমেইন গণনা |
| `enum_wildcard` | ওয়াইল্ডকার্ড DNS শনাক্তকরণ |
| `enum_tld` | TLD সম্প্রসারণ (target.com -> target.net, target.org ইত্যাদি) |
| `enum_related` | শেয়ার করা অবকাঠামোর মাধ্যমে সম্পর্কিত ডোমেইন আবিষ্কার |
| `enum_asn` | ASN প্রতিবেশী আবিষ্কার &mdash; একই নেটওয়ার্কে অন্যান্য ডোমেইন |
| `enum_ct` | Certificate Transparency লগ সাবডোমেইন বের করা |
| `enum_passive_dns` | প্যাসিভ DNS ইতিহাস (`SECURITYTRAILS_API_KEY` প্রয়োজন) |
| `enum_scope` | পরিসর সারাংশ এবং আক্রমণ পৃষ্ঠ ওভারভিউ |

</details>

<details>
<summary><b>osint &mdash; OSINT সমৃদ্ধকরণ (৬ কৌশল)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `target` | string | সমৃদ্ধ করার জন্য IP ঠিকানা বা ডোমেইন |
| `type` | `ip` \| `domain` | ঐচ্ছিক &mdash; লক্ষ্যের ধরন (বাদ দিলে স্বয়ংক্রিয়ভাবে শনাক্ত) |

| কৌশল | প্রমাণীকরণ | বিবরণ |
|-------|-----------|-------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan হোস্ট লুকআপ &mdash; খোলা পোর্ট, ব্যানার, দুর্বলতা, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys হোস্ট ডেটা &mdash; সার্ভিস, TLS, স্বায়ত্তশাসিত সিস্টেম |
| `osint_reverse_ip` | নেই | রিভার্স IP লুকআপ &mdash; একই IP-তে অন্যান্য ডোমেইন |
| `osint_whois` | নেই | WHOIS রেজিস্ট্রেশন ডেটা &mdash; রেজিস্ট্রার, তারিখ, নেমসার্ভার |
| `osint_webarchive` | নেই | Web Archive ইতিহাস &mdash; প্রথম/শেষ স্ন্যাপশট, পরিবর্তনের ফ্রিকোয়েন্সি |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal ডোমেইন/IP রিপোর্ট &mdash; শনাক্তকরণ, বিভাগ, DNS |

</details>

<details>
<summary><b>analyze &mdash; প্যাসিভ ফিঙ্গারপ্রিন্ট বিশ্লেষণ (৩ মোড)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `type` | `headers` \| `html` \| `banner` | বিশ্লেষণ করার ডেটার ধরন |
| `data` | string | বিশ্লেষণ করার কাঁচা ডেটা (হেডার, HTML বা ব্যানার আউটপুট পেস্ট করুন) |

| মোড | বিবরণ |
|-----|-------|
| `fp_analyze_headers` | প্যাসিভ HTTP হেডার বিশ্লেষণ &mdash; ট্রাফিক না পাঠিয়ে সার্ভার, ফ্রেমওয়ার্ক, প্রক্সি শনাক্তকরণ |
| `fp_analyze_html` | প্যাসিভ HTML বিশ্লেষণ &mdash; সোর্স থেকে প্রযুক্তি শনাক্তকরণ, ফ্রেমওয়ার্ক সনাক্তকরণ |
| `fp_analyze_banner` | প্যাসিভ ব্যানার বিশ্লেষণ &mdash; কাঁচা ব্যানার টেক্সট থেকে সার্ভিস শনাক্তকরণ |

</details>

<details>
<summary><b>correlate &mdash; বহু-সংকেত সম্পর্কযুক্তকরণ ইঞ্জিন (৭ মোড)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | সম্পর্কযুক্তকরণ মোড |
| `signals` | object | সম্পর্কযুক্ত করার ফিঙ্গারপ্রিন্ট সংকেত (মোড অনুযায়ী পরিবর্তিত হয়) |

| মোড | বিবরণ |
|-----|-------|
| `fp_consistency` | ক্রস-লেয়ার সংকেত সামঞ্জস্য পরীক্ষা &mdash; TCP, TLS, HTTP এবং DNS ফিঙ্গারপ্রিন্ট কি মিলে? |
| `fp_honeypot` | হানিপট শনাক্তকরণ &mdash; অসম্ভব সার্ভিস সংমিশ্রণ এবং আচরণগত অসঙ্গতি পরীক্ষা |
| `fp_spoofing` | স্পুফিং শনাক্তকরণ &mdash; সার্ভার হেডার বনাম প্রকৃত আচরণের অমিল সনাক্ত |
| `fp_compare` | দুটি হোস্টের ফিঙ্গারপ্রিন্ট প্রোফাইলের পাশাপাশি তুলনা |
| `fp_topology` | অবকাঠামো টপোলজি ম্যাপিং &mdash; CDN, লোড ব্যালান্সার, রিভার্স প্রক্সি চেইন |
| `fp_c2` | JARM, TLS, HTTP এবং টাইমিং সম্পর্কযুক্তকরণের মাধ্যমে C2 ফ্রেমওয়ার্ক শনাক্তকরণ |
| `fp_identify` | পরিচিত স্বাক্ষর ডাটাবেসের বিপরীতে হ্যাশ-ভিত্তিক সনাক্তকরণ |

</details>

<details>
<summary><b>meta &mdash; সার্ভার কনফিগারেশন এবং ডেটা (৩ মোড)</b></summary>

| প্যারামিটার | টাইপ | বিবরণ |
|-------------|------|-------|
| `category` | string | ঐচ্ছিক &mdash; বিভাগ অনুযায়ী ফিল্টার |

| মোড | বিবরণ |
|-----|-------|
| `fp_sources` | কনফিগারেশন এবং API কী স্থিতিসহ সমস্ত উপলব্ধ ডেটা উৎসের তালিকা |
| `fp_config` | সার্ভার কনফিগারেশন &mdash; ভার্সন, লোড করা প্রদানকারী, কৌশল সংখ্যা |
| `fp_signatures` | স্বাক্ষর ডাটাবেস তালিকা &mdash; JARM, ব্যানার, WAF, অ্যাপ্লিকেশন স্বাক্ষর |

</details>

---

### CLI ব্যবহার

```bash
# সমস্ত উপলব্ধ টুল এবং কৌশলের তালিকা
npx fingerprint-mcp --list

# যেকোনো টুল সরাসরি চালান
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

# OSINT টুল (API কী প্রয়োজন)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## ডেটা উৎস (২১)

| উৎস | প্রমাণীকরণ | যা প্রদান করে |
|------|-----------|---------------|
| TCP প্রোবিং | নেই | পোর্ট স্ক্যানিং, ব্যানার গ্র্যাবিং, সার্ভিস শনাক্তকরণ |
| TLS/SSL বিশ্লেষণ | নেই | সার্টিফিকেট পার্সিং, JARM ফিঙ্গারপ্রিন্টিং, JA4X, সাইফার গণনা, SNI পরীক্ষা |
| SSH প্রোবিং | নেই | প্রোটোকল ভার্সন, অ্যালগরিদম অডিট, সফটওয়্যার শনাক্তকরণ |
| HTTP বিশ্লেষণ | নেই | হেডার ফিঙ্গারপ্রিন্টিং, ফেভিকন হ্যাশিং, কুকি বিশ্লেষণ, মেথড গণনা, CORS |
| Web শনাক্তকরণ | নেই | প্রযুক্তি শনাক্তকরণ, অ্যানালিটিক্স, সোর্স ম্যাপ, WebSocket, GraphQL, SPA ফ্রেমওয়ার্ক |
| পাথ আবিষ্কার | নেই | সংবেদনশীল ফাইল, git লিক, ডিবাগ এন্ডপয়েন্ট, API ভার্সন, robots.txt |
| DNS রেজল্যুশন | নেই | রেকর্ড গণনা, ইমেইল প্রমাণীকরণ বিশ্লেষণ, SaaS শনাক্তকরণ, সার্ভার ফিঙ্গারপ্রিন্টিং |
| WAF/CDN শনাক্তকরণ | নেই | WAF সনাক্তকরণ, CDN শনাক্তকরণ, WAF ফিঙ্গারপ্রিন্টিং |
| টাইমিং বিশ্লেষণ | নেই | রেসপন্স টাইমিং বেসলাইন, ক্লক স্কু শনাক্তকরণ |
| HTTP/2 এবং HTTP/3 | নেই | HTTP/2 শনাক্তকরণ এবং ফিঙ্গারপ্রিন্টিং, HTTP/3 Alt-Svc আবিষ্কার |
| SMTP প্রোবিং | নেই | SMTP ব্যানার বিশ্লেষণ, STARTTLS পরিদর্শন |
| IoT/এম্বেডেড | নেই | IoT ডিভাইস শনাক্তকরণ, UPnP/SSDP আবিষ্কার |
| অ্যাপ্লিকেশন শনাক্তকরণ | নেই | CMS, ফ্রেমওয়ার্ক এবং ই-কমার্স প্ল্যাটফর্ম সনাক্তকরণ |
| সার্ভিস প্রোবিং | নেই | MySQL, PostgreSQL, Redis, FTP, VNC/RDP ফিঙ্গারপ্রিন্টিং |
| অবকাঠামো শনাক্তকরণ | নেই | ক্লাউড প্রদানকারী, হোস্টিং প্রদানকারী, CDN সনাক্তকরণ |
| সম্পর্কযুক্তকরণ ইঞ্জিন | নেই | সংকেত সামঞ্জস্য, হানিপট শনাক্তকরণ, স্পুফিং শনাক্তকরণ, টপোলজি ম্যাপিং |
| সনাক্তকরণ ইঞ্জিন | নেই | হ্যাশ-ভিত্তিক সনাক্তকরণ, C2 শনাক্তকরণ, স্বাক্ষর মেলানো |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | হোস্ট গোয়েন্দা তথ্য &mdash; খোলা পোর্ট, ব্যানার, দুর্বলতা, OS শনাক্তকরণ |
| [Censys](https://censys.io) | `CENSYS_API_ID` | হোস্ট ডেটা &mdash; সার্ভিস, TLS সার্টিফিকেট, স্বায়ত্তশাসিত সিস্টেম তথ্য |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF উৎস আবিষ্কার, প্যাসিভ DNS ইতিহাস, ঐতিহাসিক রেকর্ড |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | ডোমেইন/IP সুনাম, শনাক্তকরণ ফলাফল, DNS ইতিহাস, বিভাগ |

---

## আর্কিটেকচার

```
src/
  index.ts                # CLI এন্ট্রিপয়েন্ট (--help, --list, --tool, stdio সার্ভার)
  protocol/
    mcp-server.ts         # MCP সার্ভার সেটআপ (stdio ট্রান্সপোর্ট)
    tools.ts              # টুল রেজিস্ট্রি — সমস্ত ১৩ কম্পোজিট টুল এখানে নিবন্ধিত
  types/
    index.ts              # শেয়ার্ড টাইপ (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # প্রতি-প্রদানকারী রেট লিমিটার
    cache.ts              # API রেসপন্সের জন্য TTL ক্যাশে
    require-key.ts        # API কী যাচাইকরণ সহায়ক
    murmurhash3.ts        # ফেভিকন হ্যাশিংয়ের জন্য MurmurHash3
  composite/              # ১৩ কম্পোজিট টুল অর্কেস্ট্রেটর
    recon.ts              # সম্পূর্ণ রিকন অর্কেস্ট্রেটর (quick/standard/deep)
    scan-ports.ts         # পোর্ট স্ক্যানিং কম্পোজিট
    scan-tls.ts           # TLS বিশ্লেষণ কম্পোজিট
    scan-dns.ts           # DNS গোয়েন্দা তথ্য কম্পোজিট
    scan-http.ts          # HTTP ফিঙ্গারপ্রিন্টিং কম্পোজিট
    scan-paths.ts         # পাথ আবিষ্কার কম্পোজিট
    scan-waf.ts           # WAF/CDN শনাক্তকরণ কম্পোজিট
    scan-services.ts      # সার্ভিস প্রোবিং কম্পোজিট
    analyze.ts            # প্যাসিভ বিশ্লেষণ কম্পোজিট
    correlate.ts          # সম্পর্কযুক্তকরণ ইঞ্জিন কম্পোজিট
    enumerate.ts          # পরিসর সম্প্রসারণ কম্পোজিট
    osint.ts              # OSINT সমৃদ্ধকরণ কম্পোজিট
    meta.ts               # সার্ভার মেটা কম্পোজিট
    helpers.ts            # শেয়ার্ড কম্পোজিট সহায়ক
  tcp/                    # TCP প্রোবিং কৌশল (৩)
  tls/                    # TLS/SSL বিশ্লেষণ কৌশল (৮)
  ssh/                    # SSH প্রোবিং কৌশল (৩)
  http/                   # HTTP ফিঙ্গারপ্রিন্টিং কৌশল (১৬)
  web/                    # ওয়েব প্রযুক্তি শনাক্তকরণ কৌশল (৯)
  path/                   # পাথ আবিষ্কার কৌশল (৫)
  dns/                    # DNS গোয়েন্দা তথ্য কৌশল (৭)
  waf/                    # WAF/CDN শনাক্তকরণ কৌশল (৪)
  timing/                 # টাইমিং বিশ্লেষণ কৌশল (২)
  h2/                     # HTTP/2 এবং HTTP/3 কৌশল (৩)
  smtp/                   # SMTP প্রোবিং কৌশল (২)
  iot/                    # IoT/এম্বেডেড শনাক্তকরণ কৌশল (২)
  app/                    # অ্যাপ্লিকেশন শনাক্তকরণ কৌশল (৩)
  service/                # সার্ভিস প্রোবিং কৌশল (৫)
  infra/                  # অবকাঠামো শনাক্তকরণ কৌশল (৩)
  correlation/            # সম্পর্কযুক্তকরণ ইঞ্জিন (৫)
  identify/               # সনাক্তকরণ ইঞ্জিন (৩)
  passive/                # প্যাসিভ বিশ্লেষণ (৩)
  osint/                  # OSINT সমৃদ্ধকরণ কৌশল (৬)
  enum/                   # গণনা কৌশল (৮)
  meta/                   # মেটা টুল (৩)
  data/                   # স্বাক্ষর ডাটাবেস এবং প্যাটার্ন লাইব্রেরি
    jarm-signatures.ts    # পরিচিত JARM ফিঙ্গারপ্রিন্ট (C2, সার্ভার, CDN)
    waf-signatures.ts     # WAF শনাক্তকরণ স্বাক্ষর
    service-banners.ts    # সার্ভিস ব্যানার প্যাটার্ন
    tech-patterns.ts      # প্রযুক্তি শনাক্তকরণ প্যাটার্ন
    favicon-hashes.ts     # পরিচিত ফেভিকন MurmurHash3 মান
    c2-signatures.ts      # C2 ফ্রেমওয়ার্ক স্বাক্ষর
    ...                   # ১৫+ স্বাক্ষর/প্যাটার্ন ডাটাবেস
```

**ডিজাইন সিদ্ধান্ত:**

- **১৩ কম্পোজিট টুল, ১০৩ কৌশল** &mdash; এজেন্ট উচ্চ-স্তরের টুল কল করে (`recon`, `scan_tls`, `scan_http`)। প্রতিটি কম্পোজিট একাধিক নিম্ন-স্তরের কৌশল অর্কেস্ট্রেট করে এবং সম্পর্কযুক্ত ফলাফল প্রদান করে। এটি সূক্ষ্মতা বজায় রেখে টুল-কল ওভারহেড কমায়।
- **২১ প্রদানকারী, ১ সার্ভার** &mdash; প্রতিটি ফিঙ্গারপ্রিন্টিং স্তর একটি স্বাধীন মডিউল। কম্পোজিট অর্কেস্ট্রেটর প্রসঙ্গ এবং গভীরতার ভিত্তিতে কৌশল নির্বাচন করে।
- **প্রথমে সক্রিয়, OSINT ঐচ্ছিক** &mdash; ৮০+ কৌশল শূন্য API কী দিয়ে সরাসরি লক্ষ্য প্রোব করে কাজ করে। OSINT প্রদানকারী (Shodan, Censys, VirusTotal, SecurityTrails) সমৃদ্ধকরণ যোগ করে কিন্তু কখনোই প্রয়োজনীয় নয়।
- **প্রতি-প্রদানকারী রেট লিমিটার** &mdash; প্রতিটি প্রদানকারীর নিজস্ব `RateLimiter` ইনস্ট্যান্স আছে। সক্রিয় প্রোবিং শনাক্তকরণ এড়াতে রেট-লিমিটেড; OSINT API তাদের কোটায় ক্যালিব্রেট করা হয়।
- **TTL ক্যাশিং** &mdash; DNS রেকর্ড (১০ মিনিট), OSINT ফলাফল (১৫ মিনিট), CT লগ (৩০ মিনিট) বহু-টুল কর্মপ্রবাহে অপ্রয়োজনীয় লুকআপ এড়াতে ক্যাশে করা হয়।
- **সুনম্র অবক্ষয়** &mdash; অনুপস্থিত API কী সার্ভার ক্র্যাশ করে না। OSINT টুল বর্ণনামূলক বার্তা প্রদান করে: "Shodan হোস্ট লুকআপ সক্রিয় করতে SHODAN_API_KEY সেট করুন।"
- **৩টি নির্ভরতা** &mdash; `@modelcontextprotocol/sdk`, `zod` এবং `cheerio`। সমস্ত নেটওয়ার্ক I/O নেটিভ `fetch()` এবং Node.js `net`/`tls`/`dns` মডিউলের মাধ্যমে। nmap নেই, বাহ্যিক বাইনারি নেই।

---

## সীমাবদ্ধতা

- OSINT টুল (Shodan, Censys, VirusTotal, SecurityTrails) তাদের নিজ নিজ কৌশলের জন্য API কী প্রয়োজন
- Censys বিনামূল্যে স্তর ২৫০ কোয়েরি/মাসে সীমাবদ্ধ
- VirusTotal বিনামূল্যে স্তর ৫০০ কোয়েরি/দিনে সীমাবদ্ধ
- পোর্ট স্ক্যানিং TCP connect ব্যবহার করে (SYN scan নয়) &mdash; nmap-এর চেয়ে কম গোপনীয় কিন্তু root সুবিধা প্রয়োজন হয় না
- JARM ফিঙ্গারপ্রিন্টিংয়ের জন্য লক্ষ্যে সরাসরি TCP অ্যাক্সেস প্রয়োজন (ফায়ারওয়াল দ্বারা ব্লক হতে পারে)
- UPnP/SSDP আবিষ্কার শুধুমাত্র লোকাল নেটওয়ার্কে কাজ করে
- সার্ভিস প্রোবিং (MySQL, PostgreSQL, Redis) সংযোগ করে কিন্তু প্রমাণীকরণ করে না
- সাবডোমেইন গণনা CT লগ এবং প্যাসিভ উৎসের উপর নির্ভর করে (ব্রুট-ফোর্স নয়)
- macOS / Linux-এ পরীক্ষিত (Windows পরীক্ষিত নয়)

---

## MCP নিরাপত্তা স্যুটের অংশ

| প্রকল্প | ডোমেইন | টুল |
|---------|--------|------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | ব্রাউজার-ভিত্তিক নিরাপত্তা পরীক্ষা | ৩৯ টুল, Firefox, ইনজেকশন পরীক্ষা |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | ক্লাউড নিরাপত্তা (AWS/Azure/GCP) | ৩৮ টুল, ৬০+ চেক |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub নিরাপত্তা অবস্থান | ৩৯ টুল, ৪৫ চেক |
| [cve-mcp](https://github.com/badchars/cve-mcp) | দুর্বলতা গোয়েন্দা তথ্য | ২৩ টুল, ৫ উৎস |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT এবং রিকনেসান্স | ৩৭ টুল, ১২ উৎস |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | ডার্ক ওয়েব এবং হুমকি গোয়েন্দা তথ্য | ৬৬ টুল, ১৬ উৎস |
| **fingerprint-mcp** | **সর্বজনীন ডিজিটাল ফিঙ্গারপ্রিন্টিং** | **১৩ টুল, ১০৩ কৌশল, ২১ প্রদানকারী** |

---

<p align="center">
<b>শুধুমাত্র অনুমোদিত নিরাপত্তা পরীক্ষা এবং মূল্যায়নের জন্য।</b><br>
কোনো লক্ষ্যে ফিঙ্গারপ্রিন্টিং করার আগে সর্বদা নিশ্চিত করুন যে আপনার যথাযথ অনুমোদন আছে।
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 লাইসেন্স</a> &bull; Bun + TypeScript দিয়ে তৈরি
</p>
