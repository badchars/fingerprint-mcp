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
  <a href="README.el.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a> |
  <strong>हिन्दी</strong>
</p>

<p align="center">
  <br>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-light.svg">
    <img alt="fingerprint-mcp" src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/banner-dark.svg" width="700">
  </picture>
</p>

<h3 align="center">AI एजेंटों के लिए सार्वभौमिक डिजिटल फिंगरप्रिंटिंग।</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, सर्विस प्रोबिंग, JARM, JA4X, फेविकॉन हैशिंग, इंफ्रास्ट्रक्चर टोपोलॉजी, C2 डिटेक्शन, OSINT एनरिचमेंट &mdash; एक एकल MCP सर्वर में एकीकृत।<br>
  आपका AI एजेंट पाता है <b>मांग पर पूर्ण-स्पेक्ट्रम फिंगरप्रिंटिंग</b>, 11 अलग-अलग CLI टूल और मैनुअल कोरिलेशन नहीं।
</p>

<br>

<p align="center">
  <a href="#समस्या">समस्या</a> &bull;
  <a href="#यह-कैसे-अलग-है">यह कैसे अलग है</a> &bull;
  <a href="#त्वरित-शुरुआत">त्वरित शुरुआत</a> &bull;
  <a href="#ai-क्या-कर-सकता-है">AI क्या कर सकता है</a> &bull;
  <a href="#टूल-संदर्भ-13-टूल-103-तकनीक">टूल (13)</a> &bull;
  <a href="#डेटा-स्रोत-21">डेटा स्रोत</a> &bull;
  <a href="#आर्किटेक्चर">आर्किटेक्चर</a> &bull;
  <a href="CHANGELOG.md">परिवर्तन लॉग</a> &bull;
  <a href="CONTRIBUTING.md">योगदान</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="लाइसेंस"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 टूल">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 तकनीक">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp डेमो" width="800">
</p>

---

## समस्या

आज किसी सर्वर का फिंगरप्रिंट लेने का मतलब है एक दर्जन अलग-अलग टूल्स से जूझना। आप पोर्ट स्कैनिंग के लिए `nmap`, सर्टिफिकेट विश्लेषण के लिए `testssl.sh`, HTTP हेडर्स के लिए `curl -I`, DNS के लिए `dig`, WAF डिटेक्शन के लिए `wafw00f`, SSH के लिए `ssh-audit`, एक अलग JARM टूल, टेक्नोलॉजी डिटेक्शन के लिए Wappalyzer चलाते हैं &mdash; और फिर वास्तव में क्या चल रहा है यह जानने के लिए सब कुछ एक स्प्रेडशीट में मैनुअली क्रॉस-रेफरेंस करने में 30 मिनट लगाते हैं।

```
पारंपरिक फिंगरप्रिंटिंग वर्कफ्लो:
  TLS सर्टिफिकेट विश्लेषण      ->  testssl.sh / openssl s_client
  HTTP हेडर्स प्राप्त करना      ->  curl -I
  वेब टेक्नोलॉजी डिटेक्शन     ->  wappalyzer CLI
  DNS रिकनेसान्स               ->  dig / nslookup / dnsenum
  पोर्ट स्कैनिंग               ->  nmap -sV
  WAF डिटेक्शन                 ->  wafw00f
  SSH ऑडिट                     ->  ssh-audit
  सर्विस फिंगरप्रिंटिंग       ->  nmap scripts
  JARM फिंगरप्रिंट             ->  jarm (अलग टूल)
  OSINT डेटाबेस जांच            ->  shodan CLI, censys CLI
  सब कुछ कोरिलेट करना          ->  मैनुअली स्प्रेडशीट में
  ──────────────────────────────
  कुल: 11 टूल, 30+ मिनट, मैनुअल कोरिलेशन
```

**fingerprint-mcp** आपके AI एजेंट को [Model Context Protocol](https://modelcontextprotocol.io) के माध्यम से 21 प्रदाताओं में 103 फिंगरप्रिंटिंग तकनीकों को कवर करने वाले 13 कम्पोजिट टूल देता है। एजेंट बहु-स्तरीय फिंगरप्रिंटिंग समानांतर में चलाता है, TCP/TLS/HTTP/DNS/SSH लेयर्स में सिग्नल कोरिलेट करता है, हनीपॉट और C2 इंफ्रास्ट्रक्चर का पता लगाता है, और एक एकीकृत इंटेलिजेंस चित्र प्रस्तुत करता है &mdash; एक ही बातचीत में।

```
fingerprint-mcp के साथ:
  आप: "target.com पर डीप रिकन करो"

  एजेंट: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: JARM (3fd21b20d00000...) के माध्यम से nginx/1.24.0,
            Let's Encrypt सर्टिफिकेट, 2 SAN, TLS 1.2+1.3
         -> HTTP: Cloudflare WAF के पीछे Express.js,
            React SPA, Google Analytics, 14 सुरक्षा हेडर्स विश्लेषित
         -> DNS: A/AAAA/MX/TXT रिकॉर्ड, SPF/DKIM/DMARC कॉन्फ़िगर,
            CNAME/MX के माध्यम से Slack + Google Workspace डिटेक्ट
         -> पोर्ट: 80, 443, 22 (OpenSSH 9.6), 8080 (dev सर्वर)
         -> WAF: Cloudflare डिटेक्ट, direct-connect के माध्यम से ओरिजिन IP पता चला
         -> एन्यूमरेशन: CT लॉग के माध्यम से 12 सबडोमेन, wildcard DNS डिटेक्ट
         -> "target.com Cloudflare WAF के पीछे Express.js के साथ nginx/1.24.0 चला रहा है।
            ओरिजिन IP 203.0.113.42 पोर्ट 8080 पर एक्सपोज़्ड है।
            TLS ठीक से कॉन्फ़िगर है (A+ समतुल्य) लेकिन 8080 पर dev सर्वर
            में कोई WAF सुरक्षा नहीं है। 3 सबडोमेन निष्क्रिय
            इंफ्रास्ट्रक्चर की ओर इशारा करते हैं — संभावित टेकओवर जोखिम।"
```

---

## यह कैसे अलग है

मौजूदा टूल आपको एक बार में एक लेयर का कच्चा डेटा देते हैं। fingerprint-mcp आपके AI एजेंट को **सभी फिंगरप्रिंटिंग लेयर्स में एक साथ तर्क करने** की क्षमता देता है।

<table>
<thead>
<tr>
<th></th>
<th>पारंपरिक दृष्टिकोण</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>इंटरफेस</b></td>
<td>अलग-अलग आउटपुट फॉर्मेट वाले 11 अलग CLI टूल</td>
<td>MCP &mdash; AI एजेंट बातचीत के माध्यम से टूल कॉल करता है</td>
</tr>
<tr>
<td><b>तकनीक</b></td>
<td>एक टूल, एक बार में एक लेयर</td>
<td>21 प्रदाताओं में 103 तकनीक, समानांतर में चलती हैं</td>
</tr>
<tr>
<td><b>TLS विश्लेषण</b></td>
<td>testssl.sh आउटपुट, अलग से मैनुअली JARM पार्स करना</td>
<td>एजेंट सर्टिफिकेट + JARM + JA4X + cipher suites + SNI + CT लॉग एक कॉल में जोड़ता है</td>
</tr>
<tr>
<td><b>कोरिलेशन</b></td>
<td>परिणामों को स्प्रेडशीट में कॉपी-पेस्ट करना</td>
<td>एजेंट क्रॉस-कोरिलेट करता है: "JARM ज्ञात C2 फ्रेमवर्क से मेल खाता है, HTTP टाइमिंग हनीपॉट की पुष्टि करता है"</td>
</tr>
<tr>
<td><b>WAF बाइपास</b></td>
<td>wafw00f WAF डिटेक्ट करता है, आप मैनुअली ओरिजिन ढूंढते हैं</td>
<td>एजेंट WAF डिटेक्ट करता है, ओरिजिन IP खोजता है, और सत्यापित करता है कि वह वही कंटेंट सर्व करता है</td>
</tr>
<tr>
<td><b>API कुंजियाँ</b></td>
<td>Shodan, Censys आदि के लिए आवश्यक</td>
<td>80+ सक्रिय तकनीक बिना किसी API कुंजी के काम करती हैं; कुंजियाँ OSINT एनरिचमेंट अनलॉक करती हैं</td>
</tr>
<tr>
<td><b>सेटअप</b></td>
<td>nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer... इंस्टॉल करें</td>
<td><code>npx fingerprint-mcp</code> &mdash; एक कमांड, शून्य कॉन्फ़िगरेशन</td>
</tr>
</tbody>
</table>

---

## त्वरित शुरुआत

### विकल्प 1: npx (बिना इंस्टॉल)

```bash
npx fingerprint-mcp
```

सभी 80+ सक्रिय फिंगरप्रिंटिंग तकनीक तुरंत काम करती हैं। TCP, TLS, SSH, HTTP, DNS, WAF, पाथ, सर्विस, टाइमिंग, IoT, SMTP, इंफ्रास्ट्रक्चर और एप्लिकेशन फिंगरप्रिंटिंग के लिए कोई API कुंजी आवश्यक नहीं।

### विकल्प 2: क्लोन

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### एनवायरनमेंट वेरिएबल (वैकल्पिक)

```bash
# OSINT एनरिचमेंट (सभी वैकल्पिक — सक्रिय फिंगरप्रिंटिंग बिना किसी कुंजी के काम करती है)
export SHODAN_API_KEY=your-key           # osint_shodan, ssh_hostkey_lookup सक्षम करता है
export CENSYS_API_ID=your-id             # osint_censys सक्षम करता है (मुफ्त: 250 क्वेरी/माह)
export CENSYS_API_SECRET=your-secret     # Censys API सीक्रेट
export SECURITYTRAILS_API_KEY=your-key   # waf_origin, enum_passive_dns सक्षम करता है
export VIRUSTOTAL_API_KEY=your-key       # osint_virustotal सक्षम करता है (मुफ्त: 500 क्वेरी/दिन)
```

सभी API कुंजियाँ वैकल्पिक हैं। इनके बिना, आपको अभी भी पूर्ण TCP/TLS/SSH/HTTP/DNS/WAF/पाथ/सर्विस/टाइमिंग/IoT/SMTP/इंफ्रास्ट्रक्चर/एप्लिकेशन फिंगरप्रिंटिंग, कोरिलेशन, पैसिव विश्लेषण, एन्यूमरेशन और मेटा टूल मिलते हैं &mdash; 80+ तकनीक जो सीधे लक्ष्य को प्रोब करके काम करती हैं।

### अपने AI एजेंट से कनेक्ट करें

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx के साथ
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# लोकल क्लोन के साथ
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json` में जोड़ें:

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
<summary><b>Cursor / Windsurf / अन्य MCP क्लाइंट</b></summary>

वही JSON कॉन्फ़िगरेशन फॉर्मेट। कमांड को `npx fingerprint-mcp` या अपने लोकल इंस्टॉलेशन पाथ की ओर पॉइंट करें।

</details>

### क्वेरी शुरू करें

```
आप: "target.com के बारे में सब कुछ फिंगरप्रिंट करो — TLS, HTTP स्टैक, WAF, DNS, खुले पोर्ट"
```

बस इतना ही। एजेंट स्वचालित रूप से बहु-स्तरीय फिंगरप्रिंटिंग, सिग्नल कोरिलेशन और इंफ्रास्ट्रक्चर विश्लेषण संभालता है।

---

## AI क्या कर सकता है

### त्वरित रिकन

```
आप: "target.com का त्वरित रिकन"

एजेंट: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: पोर्ट 80, 443, 22 खुले
       -> TLS: Let's Encrypt RSA सर्टिफिकेट, TLS 1.2+1.3, nginx JARM सिग्नेचर
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM कॉन्फ़िगर
       -> WAF: Cloudflare डिटेक्ट (cf-ray हेडर)
       -> "target.com nginx/1.24.0 के पीछे Express.js पर एक React SPA है,
          Cloudflare CDN के माध्यम से सर्व किया जा रहा है। Let's Encrypt के साथ
          TLS ठीक से कॉन्फ़िगर है। पोर्ट 22 पर SSH OpenSSH 9.6 चला रहा है। ईमेल
          पूर्ण SPF/DKIM/DMARC के साथ Google Workspace द्वारा हैंडल।"
```

### गहन TLS जांच

```
आप: "suspicious-server.com का TLS कॉन्फ़िगरेशन विस्तार से विश्लेषण करो"

एजेंट: -> scan_tls {host: "suspicious-server.com"}

       -> सर्टिफिकेट: सेल्फ-साइन्ड, CN=localhost, 47 दिन पहले एक्सपायर
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (Cobalt Strike डिफ़ॉल्ट प्रोफाइल से मेल खाता है)
       -> JA4X: फिंगरप्रिंट ज्ञात C2 फ्रेमवर्क पैटर्न से मेल खाता है
       -> Cipher suites: कमज़ोर सिफर स्वीकार करता है (RC4, 3DES)
       -> SNI: किसी भी SNI मान के लिए समान रूप से प्रतिक्रिया करता है
       -> CT लॉग: सर्टिफिकेट लॉग नहीं किया गया (सार्वजनिक रूप से विश्वसनीय नहीं)
       -> "उच्च जोखिम: TLS कॉन्फ़िगरेशन दृढ़ता से C2 इंफ्रास्ट्रक्चर इंगित करता है।
          सेल्फ-साइन्ड एक्सपायर्ड सर्टिफिकेट, JARM फिंगरप्रिंट Cobalt Strike से मेल खाता है,
          कमज़ोर सिफर स्वीकार करता है, और मनमाने SNI मानों पर प्रतिक्रिया करता है।
          तत्काल जांच और ब्लॉकिंग की सिफारिश।"
```

### WAF बाइपास और ओरिजिन खोज

```
आप: "target.com WAF के पीछे है। क्या तुम ओरिजिन सर्वर ढूंढ सकते हो?"

एजेंट: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), संदिग्ध अनुरोधों पर चैलेंज पेज
       -> DNS: A रिकॉर्ड Cloudflare IP 104.21.x.x की ओर इशारा करता है
       -> सबडोमेन: dev.target.com 203.0.113.42 पर रिज़ॉल्व होता है (गैर-Cloudflare)
       -> 203.0.113.42:443 पर सीधा कनेक्शन वही TLS सर्टिफिकेट लौटाता है
       -> SecurityTrails इतिहास: Cloudflare से पहले ओरिजिन 203.0.113.42 था
       -> "ओरिजिन IP मिला: 203.0.113.42। dev.target.com सबडोमेन के
          माध्यम से खोजा गया जो Cloudflare को बाइपास करता है। ओरिजिन वही
          TLS सर्टिफिकेट सर्व करता है और target.com Host हेडर पर प्रतिक्रिया करता है।
          ओरिजिन में कोई WAF सुरक्षा नहीं — सीधी पहुंच संभव।"
```

### होस्ट पर सर्विस खोज

```
आप: "10.0.1.50 पर कौन सी सर्विसेज चल रही हैं?"

एजेंट: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> पोर्ट 22: OpenSSH 8.9p1 Ubuntu, ED25519 होस्ट कुंजी
       -> पोर्ट 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> पोर्ट 3306: MySQL 8.0.36, प्रमाणीकरण आवश्यक
       -> पोर्ट 5432: PostgreSQL 16.1, SSL आवश्यक
       -> पोर्ट 6379: Redis 7.2.4, कोई प्रमाणीकरण नहीं (खुला)
       -> पोर्ट 8080: Node.js Express dev सर्वर, CORS: *
       -> "गंभीर: पोर्ट 6379 पर Redis में कोई प्रमाणीकरण नहीं — नेटवर्क पर
          कोई भी डेटा पढ़/लिख सकता है। 8080 पर Express dev सर्वर में
          वाइल्डकार्ड CORS है। MySQL और PostgreSQL ठीक से प्रमाणीकरण
          की आवश्यकता रखते हैं। WordPress 2 माइनर वर्शन पीछे है।
          Redis और dev सर्वर एक्सपोज़र पर तत्काल कार्रवाई आवश्यक।"
```

---

## टूल संदर्भ (13 टूल, 103 तकनीक)

<details open>
<summary><b>recon &mdash; गहराई-आधारित तकनीक चयन के साथ पूर्ण रिकनेसान्स</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `url` | string | फिंगरप्रिंट करने के लिए लक्ष्य URL |
| `depth` | `quick` \| `standard` \| `deep` | स्कैन गहराई: quick=5 तकनीक, standard=20, deep=50+ |

गहराई स्तर के आधार पर सभी प्रदाताओं से तकनीकों को ऑर्केस्ट्रेट करता है। क्विक मोड तेज़ अवलोकन देता है; डीप मोड एन्यूमरेशन, OSINT और कोरिलेशन सहित संपूर्ण फिंगरप्रिंटिंग चलाता है।

</details>

<details>
<summary><b>scan_ports &mdash; सर्विस डिटेक्शन के साथ TCP पोर्ट स्कैनिंग (3 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `host` | string | लक्ष्य होस्ट (IP या डोमेन) |
| `ports` | number[] | वैकल्पिक &mdash; स्कैन करने के लिए विशिष्ट पोर्ट (डिफ़ॉल्ट सामान्य पोर्ट) |

| तकनीक | विवरण |
|--------|-------|
| `tcp_probe` | खुले पोर्ट का पता लगाने के लिए TCP connect स्कैन |
| `tcp_banner` | सर्विस पहचान के लिए खुले पोर्ट पर बैनर ग्रैबिंग |
| `tcp_analysis` | पोर्ट संयोजन विश्लेषण और सर्विस अनुमान |

</details>

<details>
<summary><b>scan_tls &mdash; पूर्ण TLS/SSL विश्लेषण (8 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `host` | string | लक्ष्य होस्ट (IP या डोमेन) |
| `port` | number | वैकल्पिक &mdash; TLS पोर्ट (डिफ़ॉल्ट: 443) |

| तकनीक | विवरण |
|--------|-------|
| `tls_certificate` | X.509 सर्टिफिकेट पार्सिंग &mdash; विषय, जारीकर्ता, SAN, वैधता, चेन |
| `tls_jarm` | JARM सक्रिय फिंगरप्रिंटिंग &mdash; 10 TLS Client Hello प्रोब, 62-अक्षर हैश |
| `tls_ja4x` | सर्टिफिकेट गुणों से JA4X पैसिव TLS फिंगरप्रिंटिंग |
| `tls_ciphers` | Cipher suite एन्यूमरेशन और शक्ति विश्लेषण |
| `tls_protocols` | समर्थित TLS प्रोटोकॉल वर्शन डिटेक्शन (SSLv3 से TLS 1.3) |
| `tls_sni` | SNI व्यवहार परीक्षण &mdash; डिफ़ॉल्ट सर्टिफिकेट बनाम अनुरोधित hostname |
| `tls_ct_logs` | crt.sh के माध्यम से Certificate Transparency लॉग लुकअप |
| `tls_ocsp` | OCSP stapling और निरस्तीकरण स्थिति जांच |

</details>

<details>
<summary><b>scan_dns &mdash; DNS इंटेलिजेंस (7 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `domain` | string | लक्ष्य डोमेन |

| तकनीक | विवरण |
|--------|-------|
| `dns_records` | पूर्ण रिकॉर्ड एन्यूमरेशन &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF, DKIM और DMARC रिकॉर्ड विश्लेषण |
| `dns_saas` | CNAME और MX पैटर्न के माध्यम से SaaS/सर्विस डिटेक्शन (Slack, Zendesk आदि) |
| `dns_server` | DNS सर्वर फिंगरप्रिंटिंग (BIND, PowerDNS, Cloudflare आदि) |
| `dns_takeover` | डैंगलिंग CNAME विश्लेषण के माध्यम से सबडोमेन टेकओवर डिटेक्शन |
| `dns_zone` | ज़ोन ट्रांसफर प्रयास (AXFR) |
| `dns_caa` | सर्टिफिकेट अथॉरिटी प्रतिबंधों के लिए CAA रिकॉर्ड विश्लेषण |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/वेब फिंगरप्रिंटिंग (29 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `url` | string | लक्ष्य URL |

| तकनीक | प्रदाता | विवरण |
|--------|---------|-------|
| `http_headers` | HTTP | रिस्पॉन्स हेडर विश्लेषण और सर्वर पहचान |
| `http_header_order` | HTTP | हेडर ऑर्डरिंग फिंगरप्रिंट (सर्वर सॉफ्टवेयर सिग्नेचर) |
| `http_security_headers` | HTTP | सुरक्षा हेडर ऑडिट (CSP, HSTS, X-Frame-Options आदि) |
| `http_cookies` | HTTP | कुकी विश्लेषण &mdash; फ्लैग, प्रीफिक्स, फ्रेमवर्क डिटेक्शन |
| `http_methods` | HTTP | अनुमत HTTP मेथड एन्यूमरेशन (OPTIONS) |
| `http_cors` | HTTP | CORS नीति विश्लेषण और गलत कॉन्फ़िगरेशन डिटेक्शन |
| `http_compression` | HTTP | समर्थित कम्प्रेशन एल्गोरिथम (gzip, br, zstd) |
| `http_caching` | HTTP | कैश हेडर विश्लेषण (CDN, रिवर्स प्रॉक्सी डिटेक्शन) |
| `http_etag` | HTTP | बैकएंड पहचान के लिए ETag फॉर्मेट विश्लेषण |
| `http_error` | HTTP | एरर पेज फिंगरप्रिंटिंग (कस्टम बनाम डिफ़ॉल्ट एरर पेज) |
| `http_redirect` | HTTP | रीडायरेक्ट चेन विश्लेषण |
| `http_timing` | HTTP | सर्वर प्रदर्शन प्रोफाइलिंग के लिए रिस्पॉन्स टाइमिंग बेसलाइन |
| `http_favicon` | HTTP | टेक्नोलॉजी पहचान के लिए फेविकॉन हैश (MurmurHash3) |
| `http_robots` | HTTP | robots.txt पार्सिंग और प्रतिबंधित पाथ निष्कर्षण |
| `http_sitemap` | HTTP | साइटमैप खोज और URL निष्कर्षण |
| `http_wellknown` | HTTP | .well-known एंडपॉइंट खोज (security.txt, openid आदि) |
| `web_tech` | Web | HTML/JS/CSS पैटर्न के माध्यम से टेक्नोलॉजी डिटेक्शन |
| `web_analytics` | Web | एनालिटिक्स और ट्रैकिंग सर्विस डिटेक्शन |
| `web_sourcemaps` | Web | सोर्स मैप फाइल खोज |
| `web_websocket` | Web | WebSocket एंडपॉइंट डिटेक्शन |
| `web_graphql` | Web | GraphQL एंडपॉइंट डिटेक्शन और इंट्रोस्पेक्शन |
| `web_spa` | Web | सिंगल-पेज एप्लिकेशन फ्रेमवर्क डिटेक्शन |
| `web_cdn` | Web | रिस्पॉन्स हेडर और DNS के माध्यम से CDN डिटेक्शन |
| `web_meta` | Web | HTML मेटा टैग विश्लेषण (जेनरेटर, फ्रेमवर्क संकेत) |
| `web_feed` | Web | RSS/Atom फीड खोज |
| `h2_detect` | HTTP/2 | HTTP/2 प्रोटोकॉल सपोर्ट डिटेक्शन |
| `h2_fingerprint` | HTTP/2 | HTTP/2 सर्वर फिंगरप्रिंटिंग (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Alt-Svc हेडर के माध्यम से HTTP/3 (QUIC) सपोर्ट डिटेक्शन |
| `app_cms` | Application | CMS डिटेक्शन (WordPress, Drupal, Joomla आदि) |

</details>

<details>
<summary><b>scan_paths &mdash; पाथ इंटेलिजेंस (5 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `url` | string | लक्ष्य URL |
| `categories` | string[] | वैकल्पिक &mdash; जांच करने के लिए श्रेणियां (sensitive, git, debug, api, config) |

| तकनीक | विवरण |
|--------|-------|
| `path_sensitive` | संवेदनशील फाइल खोज (बैकअप फाइलें, कॉन्फ़िग फाइलें, डेटाबेस डंप) |
| `path_robots` | छिपे हुए पाथ के लिए robots.txt और sitemap.xml विश्लेषण |
| `path_git` | Git रिपॉजिटरी लीक डिटेक्शन (.git/HEAD, .git/config) |
| `path_debug` | डीबग एंडपॉइंट खोज (phpinfo, server-status, डीबग कंसोल) |
| `path_api` | API वर्शन और डॉक्यूमेंटेशन एंडपॉइंट खोज |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN डिटेक्शन और फिंगरप्रिंटिंग (4 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `url` | string | लक्ष्य URL |

| तकनीक | विवरण |
|--------|-------|
| `waf_detect` | रिस्पॉन्स हेडर और व्यवहार विश्लेषण के माध्यम से WAF उपस्थिति डिटेक्शन |
| `waf_cdn` | CDN प्रदाता पहचान (Cloudflare, Akamai, Fastly आदि) |
| `waf_fingerprint` | WAF उत्पाद पहचान और वर्शन डिटेक्शन |
| `waf_origin` | WAF/CDN के पीछे ओरिजिन IP खोज (`SECURITYTRAILS_API_KEY` आवश्यक) |

</details>

<details>
<summary><b>scan_services &mdash; सर्विस-स्तर प्रोबिंग (12 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `host` | string | लक्ष्य होस्ट (IP या डोमेन) |
| `ports` | number[] | वैकल्पिक &mdash; प्रोब करने के लिए विशिष्ट पोर्ट |
| `service` | string | वैकल्पिक &mdash; प्रोब करने के लिए विशिष्ट सर्विस (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| तकनीक | प्रदाता | विवरण |
|--------|---------|-------|
| `ssh_probe` | SSH | SSH प्रोटोकॉल वर्शन और सॉफ्टवेयर डिटेक्शन |
| `ssh_algorithms` | SSH | SSH एल्गोरिथम ऑडिट (KEX, सिफर, MAC, होस्ट कुंजी प्रकार) |
| `ssh_hostkey_lookup` | SSH | Shodan के माध्यम से SSH होस्ट कुंजी लुकअप (`SHODAN_API_KEY` आवश्यक) |
| `svc_mysql` | Service | MySQL वर्शन डिटेक्शन और क्षमता फिंगरप्रिंटिंग |
| `svc_postgres` | Service | PostgreSQL वर्शन डिटेक्शन और SSL सपोर्ट जांच |
| `svc_redis` | Service | Redis वर्शन डिटेक्शन और प्रमाणीकरण स्थिति |
| `svc_ftp` | Service | FTP बैनर विश्लेषण और अनाम लॉगिन जांच |
| `svc_vnc_rdp` | Service | VNC/RDP सर्विस डिटेक्शन और सुरक्षा मूल्यांकन |
| `smtp_banner` | SMTP | SMTP बैनर विश्लेषण और MTA पहचान |
| `smtp_starttls` | SMTP | SMTP STARTTLS सपोर्ट और सर्टिफिकेट निरीक्षण |
| `iot_detect` | IoT | बैनर पैटर्न और डिफ़ॉल्ट पेजों के माध्यम से IoT डिवाइस डिटेक्शन |
| `iot_upnp` | IoT | लोकल नेटवर्क पर UPnP/SSDP डिवाइस खोज |

</details>

<details>
<summary><b>enumerate &mdash; दायरा विस्तार (8 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `domain` | string | लक्ष्य डोमेन |

| तकनीक | विवरण |
|--------|-------|
| `enum_subdomains` | कई विधियों के माध्यम से सबडोमेन एन्यूमरेशन |
| `enum_wildcard` | वाइल्डकार्ड DNS डिटेक्शन |
| `enum_tld` | TLD विस्तार (target.com -> target.net, target.org आदि) |
| `enum_related` | साझा इंफ्रास्ट्रक्चर के माध्यम से संबंधित डोमेन खोज |
| `enum_asn` | ASN पड़ोसी खोज &mdash; एक ही नेटवर्क पर अन्य डोमेन |
| `enum_ct` | Certificate Transparency लॉग सबडोमेन निष्कर्षण |
| `enum_passive_dns` | पैसिव DNS इतिहास (`SECURITYTRAILS_API_KEY` आवश्यक) |
| `enum_scope` | दायरा सारांश और अटैक सरफेस अवलोकन |

</details>

<details>
<summary><b>osint &mdash; OSINT एनरिचमेंट (6 तकनीक)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `target` | string | एनरिच करने के लिए IP पता या डोमेन |
| `type` | `ip` \| `domain` | वैकल्पिक &mdash; लक्ष्य प्रकार (छोड़ने पर स्वतः पता लगाया जाता है) |

| तकनीक | प्रमाणीकरण | विवरण |
|--------|-----------|-------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan होस्ट लुकअप &mdash; खुले पोर्ट, बैनर, कमज़ोरियां, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys होस्ट डेटा &mdash; सर्विसेज, TLS, स्वायत्त प्रणाली |
| `osint_reverse_ip` | नहीं | रिवर्स IP लुकअप &mdash; एक ही IP पर अन्य डोमेन |
| `osint_whois` | नहीं | WHOIS पंजीकरण डेटा &mdash; रजिस्ट्रार, तिथियां, नेमसर्वर |
| `osint_webarchive` | नहीं | Web Archive इतिहास &mdash; पहला/अंतिम स्नैपशॉट, परिवर्तन आवृत्ति |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal डोमेन/IP रिपोर्ट &mdash; डिटेक्शन, श्रेणियां, DNS |

</details>

<details>
<summary><b>analyze &mdash; पैसिव फिंगरप्रिंट विश्लेषण (3 मोड)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `type` | `headers` \| `html` \| `banner` | विश्लेषण करने के लिए डेटा का प्रकार |
| `data` | string | विश्लेषण करने के लिए कच्चा डेटा (हेडर, HTML या बैनर आउटपुट पेस्ट करें) |

| मोड | विवरण |
|------|-------|
| `fp_analyze_headers` | पैसिव HTTP हेडर विश्लेषण &mdash; ट्रैफिक भेजे बिना सर्वर, फ्रेमवर्क, प्रॉक्सी डिटेक्शन |
| `fp_analyze_html` | पैसिव HTML विश्लेषण &mdash; सोर्स से टेक्नोलॉजी डिटेक्शन, फ्रेमवर्क पहचान |
| `fp_analyze_banner` | पैसिव बैनर विश्लेषण &mdash; कच्चे बैनर टेक्स्ट से सर्विस पहचान |

</details>

<details>
<summary><b>correlate &mdash; बहु-सिग्नल कोरिलेशन इंजन (7 मोड)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | कोरिलेशन मोड |
| `signals` | object | कोरिलेट करने के लिए फिंगरप्रिंट सिग्नल (मोड के अनुसार भिन्न) |

| मोड | विवरण |
|------|-------|
| `fp_consistency` | क्रॉस-लेयर सिग्नल संगति जांच &mdash; क्या TCP, TLS, HTTP और DNS फिंगरप्रिंट मेल खाते हैं? |
| `fp_honeypot` | हनीपॉट डिटेक्शन &mdash; असंभव सर्विस संयोजनों और व्यवहारिक विसंगतियों की जांच |
| `fp_spoofing` | स्पूफिंग डिटेक्शन &mdash; सर्वर हेडर बनाम वास्तविक व्यवहार की असंगति पहचान |
| `fp_compare` | दो होस्ट के फिंगरप्रिंट प्रोफाइल की साथ-साथ तुलना |
| `fp_topology` | इंफ्रास्ट्रक्चर टोपोलॉजी मैपिंग &mdash; CDN, लोड बैलेंसर, रिवर्स प्रॉक्सी चेन |
| `fp_c2` | JARM, TLS, HTTP और टाइमिंग कोरिलेशन के माध्यम से C2 फ्रेमवर्क डिटेक्शन |
| `fp_identify` | ज्ञात सिग्नेचर डेटाबेस के विरुद्ध हैश-आधारित पहचान |

</details>

<details>
<summary><b>meta &mdash; सर्वर कॉन्फ़िगरेशन और डेटा (3 मोड)</b></summary>

| पैरामीटर | प्रकार | विवरण |
|----------|--------|-------|
| `category` | string | वैकल्पिक &mdash; श्रेणी के अनुसार फिल्टर |

| मोड | विवरण |
|------|-------|
| `fp_sources` | कॉन्फ़िगरेशन और API कुंजी स्थिति के साथ सभी उपलब्ध डेटा स्रोतों की सूची |
| `fp_config` | सर्वर कॉन्फ़िगरेशन &mdash; वर्शन, लोड किए गए प्रदाता, तकनीक संख्या |
| `fp_signatures` | सिग्नेचर डेटाबेस सूची &mdash; JARM, बैनर, WAF, एप्लिकेशन सिग्नेचर |

</details>

---

### CLI उपयोग

```bash
# सभी उपलब्ध टूल और तकनीकों की सूची
npx fingerprint-mcp --list

# कोई भी टूल सीधे चलाएं
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

# OSINT टूल (API कुंजी आवश्यक)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## डेटा स्रोत (21)

| स्रोत | प्रमाणीकरण | क्या प्रदान करता है |
|-------|-----------|-------------------|
| TCP प्रोबिंग | नहीं | पोर्ट स्कैनिंग, बैनर ग्रैबिंग, सर्विस डिटेक्शन |
| TLS/SSL विश्लेषण | नहीं | सर्टिफिकेट पार्सिंग, JARM फिंगरप्रिंटिंग, JA4X, सिफर एन्यूमरेशन, SNI परीक्षण |
| SSH प्रोबिंग | नहीं | प्रोटोकॉल वर्शन, एल्गोरिथम ऑडिट, सॉफ्टवेयर डिटेक्शन |
| HTTP विश्लेषण | नहीं | हेडर फिंगरप्रिंटिंग, फेविकॉन हैशिंग, कुकी विश्लेषण, मेथड एन्यूमरेशन, CORS |
| Web डिटेक्शन | नहीं | टेक्नोलॉजी डिटेक्शन, एनालिटिक्स, सोर्स मैप, WebSocket, GraphQL, SPA फ्रेमवर्क |
| पाथ खोज | नहीं | संवेदनशील फाइलें, git लीक, डीबग एंडपॉइंट, API वर्शन, robots.txt |
| DNS रिज़ॉल्यूशन | नहीं | रिकॉर्ड एन्यूमरेशन, ईमेल प्रमाणीकरण विश्लेषण, SaaS डिटेक्शन, सर्वर फिंगरप्रिंटिंग |
| WAF/CDN डिटेक्शन | नहीं | WAF पहचान, CDN डिटेक्शन, WAF फिंगरप्रिंटिंग |
| टाइमिंग विश्लेषण | नहीं | रिस्पॉन्स टाइमिंग बेसलाइन, क्लॉक स्क्यू डिटेक्शन |
| HTTP/2 और HTTP/3 | नहीं | HTTP/2 डिटेक्शन और फिंगरप्रिंटिंग, HTTP/3 Alt-Svc खोज |
| SMTP प्रोबिंग | नहीं | SMTP बैनर विश्लेषण, STARTTLS निरीक्षण |
| IoT/एम्बेडेड | नहीं | IoT डिवाइस डिटेक्शन, UPnP/SSDP खोज |
| एप्लिकेशन डिटेक्शन | नहीं | CMS, फ्रेमवर्क और ई-कॉमर्स प्लेटफॉर्म पहचान |
| सर्विस प्रोबिंग | नहीं | MySQL, PostgreSQL, Redis, FTP, VNC/RDP फिंगरप्रिंटिंग |
| इंफ्रास्ट्रक्चर डिटेक्शन | नहीं | क्लाउड प्रदाता, होस्टिंग प्रदाता, CDN पहचान |
| कोरिलेशन इंजन | नहीं | सिग्नल संगति, हनीपॉट डिटेक्शन, स्पूफिंग डिटेक्शन, टोपोलॉजी मैपिंग |
| पहचान इंजन | नहीं | हैश-आधारित पहचान, C2 डिटेक्शन, सिग्नेचर मैचिंग |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | होस्ट इंटेलिजेंस &mdash; खुले पोर्ट, बैनर, कमज़ोरियां, OS डिटेक्शन |
| [Censys](https://censys.io) | `CENSYS_API_ID` | होस्ट डेटा &mdash; सर्विसेज, TLS सर्टिफिकेट, स्वायत्त प्रणाली जानकारी |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF ओरिजिन खोज, पैसिव DNS इतिहास, ऐतिहासिक रिकॉर्ड |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | डोमेन/IP प्रतिष्ठा, डिटेक्शन परिणाम, DNS इतिहास, श्रेणियां |

---

## आर्किटेक्चर

```
src/
  index.ts                # CLI एंट्रीपॉइंट (--help, --list, --tool, stdio सर्वर)
  protocol/
    mcp-server.ts         # MCP सर्वर सेटअप (stdio ट्रांसपोर्ट)
    tools.ts              # टूल रजिस्ट्री — सभी 13 कम्पोजिट टूल यहां पंजीकृत
  types/
    index.ts              # साझा प्रकार (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # प्रति-प्रदाता रेट लिमिटर
    cache.ts              # API रिस्पॉन्स के लिए TTL कैश
    require-key.ts        # API कुंजी सत्यापन सहायक
    murmurhash3.ts        # फेविकॉन हैशिंग के लिए MurmurHash3
  composite/              # 13 कम्पोजिट टूल ऑर्केस्ट्रेटर
    recon.ts              # पूर्ण रिकन ऑर्केस्ट्रेटर (quick/standard/deep)
    scan-ports.ts         # पोर्ट स्कैनिंग कम्पोजिट
    scan-tls.ts           # TLS विश्लेषण कम्पोजिट
    scan-dns.ts           # DNS इंटेलिजेंस कम्पोजिट
    scan-http.ts          # HTTP फिंगरप्रिंटिंग कम्पोजिट
    scan-paths.ts         # पाथ डिस्कवरी कम्पोजिट
    scan-waf.ts           # WAF/CDN डिटेक्शन कम्पोजिट
    scan-services.ts      # सर्विस प्रोबिंग कम्पोजिट
    analyze.ts            # पैसिव विश्लेषण कम्पोजिट
    correlate.ts          # कोरिलेशन इंजन कम्पोजिट
    enumerate.ts          # दायरा विस्तार कम्पोजिट
    osint.ts              # OSINT एनरिचमेंट कम्पोजिट
    meta.ts               # सर्वर मेटा कम्पोजिट
    helpers.ts            # साझा कम्पोजिट सहायक
  tcp/                    # TCP प्रोबिंग तकनीक (3)
  tls/                    # TLS/SSL विश्लेषण तकनीक (8)
  ssh/                    # SSH प्रोबिंग तकनीक (3)
  http/                   # HTTP फिंगरप्रिंटिंग तकनीक (16)
  web/                    # वेब टेक्नोलॉजी डिटेक्शन तकनीक (9)
  path/                   # पाथ डिस्कवरी तकनीक (5)
  dns/                    # DNS इंटेलिजेंस तकनीक (7)
  waf/                    # WAF/CDN डिटेक्शन तकनीक (4)
  timing/                 # टाइमिंग विश्लेषण तकनीक (2)
  h2/                     # HTTP/2 और HTTP/3 तकनीक (3)
  smtp/                   # SMTP प्रोबिंग तकनीक (2)
  iot/                    # IoT/एम्बेडेड डिटेक्शन तकनीक (2)
  app/                    # एप्लिकेशन डिटेक्शन तकनीक (3)
  service/                # सर्विस प्रोबिंग तकनीक (5)
  infra/                  # इंफ्रास्ट्रक्चर डिटेक्शन तकनीक (3)
  correlation/            # कोरिलेशन इंजन (5)
  identify/               # पहचान इंजन (3)
  passive/                # पैसिव विश्लेषण (3)
  osint/                  # OSINT एनरिचमेंट तकनीक (6)
  enum/                   # एन्यूमरेशन तकनीक (8)
  meta/                   # मेटा टूल (3)
  data/                   # सिग्नेचर डेटाबेस और पैटर्न लाइब्रेरी
    jarm-signatures.ts    # ज्ञात JARM फिंगरप्रिंट (C2, सर्वर, CDN)
    waf-signatures.ts     # WAF डिटेक्शन सिग्नेचर
    service-banners.ts    # सर्विस बैनर पैटर्न
    tech-patterns.ts      # टेक्नोलॉजी डिटेक्शन पैटर्न
    favicon-hashes.ts     # ज्ञात फेविकॉन MurmurHash3 मान
    c2-signatures.ts      # C2 फ्रेमवर्क सिग्नेचर
    ...                   # 15+ सिग्नेचर/पैटर्न डेटाबेस
```

**डिज़ाइन निर्णय:**

- **13 कम्पोजिट टूल, 103 तकनीक** &mdash; एजेंट उच्च-स्तरीय टूल कॉल करता है (`recon`, `scan_tls`, `scan_http`)। प्रत्येक कम्पोजिट कई निम्न-स्तरीय तकनीकों को ऑर्केस्ट्रेट करता है और कोरिलेटेड परिणाम लौटाता है। यह ग्रैनुलैरिटी बनाए रखते हुए टूल-कॉल ओवरहेड कम करता है।
- **21 प्रदाता, 1 सर्वर** &mdash; प्रत्येक फिंगरप्रिंटिंग लेयर एक स्वतंत्र मॉड्यूल है। कम्पोजिट ऑर्केस्ट्रेटर संदर्भ और गहराई के आधार पर तकनीक चुनता है।
- **पहले सक्रिय, OSINT वैकल्पिक** &mdash; 80+ तकनीक शून्य API कुंजियों के साथ सीधे लक्ष्य को प्रोब करके काम करती हैं। OSINT प्रदाता (Shodan, Censys, VirusTotal, SecurityTrails) एनरिचमेंट जोड़ते हैं लेकिन कभी आवश्यक नहीं होते।
- **प्रति-प्रदाता रेट लिमिटर** &mdash; प्रत्येक प्रदाता का अपना `RateLimiter` इंस्टेंस है। सक्रिय प्रोबिंग डिटेक्शन से बचने के लिए रेट-लिमिटेड है; OSINT API उनके कोटा के अनुसार कैलिब्रेट किए जाते हैं।
- **TTL कैशिंग** &mdash; DNS रिकॉर्ड (10 मिनट), OSINT परिणाम (15 मिनट), CT लॉग (30 मिनट) बहु-टूल वर्कफ्लो के दौरान अनावश्यक लुकअप से बचने के लिए कैश किए जाते हैं।
- **सुंदर गिरावट** &mdash; अनुपस्थित API कुंजियां सर्वर को क्रैश नहीं करतीं। OSINT टूल वर्णनात्मक संदेश लौटाते हैं: "Shodan होस्ट लुकअप सक्षम करने के लिए SHODAN_API_KEY सेट करें।"
- **3 डिपेंडेंसी** &mdash; `@modelcontextprotocol/sdk`, `zod` और `cheerio`। सभी नेटवर्क I/O नेटिव `fetch()` और Node.js `net`/`tls`/`dns` मॉड्यूल के माध्यम से। कोई nmap नहीं, कोई बाहरी बाइनरी नहीं।

---

## सीमाएं

- OSINT टूल (Shodan, Censys, VirusTotal, SecurityTrails) अपनी संबंधित तकनीकों के लिए API कुंजी आवश्यक करते हैं
- Censys मुफ्त टियर 250 क्वेरी/माह तक सीमित
- VirusTotal मुफ्त टियर 500 क्वेरी/दिन तक सीमित
- पोर्ट स्कैनिंग TCP connect (SYN scan नहीं) उपयोग करती है &mdash; nmap से कम गोपनीय लेकिन root विशेषाधिकार की आवश्यकता नहीं
- JARM फिंगरप्रिंटिंग के लिए लक्ष्य तक सीधी TCP पहुंच आवश्यक (फायरवॉल द्वारा अवरुद्ध हो सकती है)
- UPnP/SSDP खोज केवल स्थानीय नेटवर्क पर काम करती है
- सर्विस प्रोबिंग (MySQL, PostgreSQL, Redis) कनेक्ट करती है लेकिन प्रमाणित नहीं करती
- सबडोमेन एन्यूमरेशन CT लॉग और पैसिव स्रोतों पर निर्भर करती है (ब्रूट-फोर्स नहीं)
- macOS / Linux पर परीक्षित (Windows पर परीक्षित नहीं)

---

## MCP सुरक्षा सूट का हिस्सा

| प्रोजेक्ट | डोमेन | टूल |
|-----------|--------|------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | ब्राउज़र-आधारित सुरक्षा परीक्षण | 39 टूल, Firefox, इंजेक्शन परीक्षण |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | क्लाउड सुरक्षा (AWS/Azure/GCP) | 38 टूल, 60+ जांच |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub सुरक्षा स्थिति | 39 टूल, 45 जांच |
| [cve-mcp](https://github.com/badchars/cve-mcp) | कमज़ोरी इंटेलिजेंस | 23 टूल, 5 स्रोत |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT और रिकनेसान्स | 37 टूल, 12 स्रोत |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | डार्क वेब और थ्रेट इंटेलिजेंस | 66 टूल, 16 स्रोत |
| **fingerprint-mcp** | **सार्वभौमिक डिजिटल फिंगरप्रिंटिंग** | **13 टूल, 103 तकनीक, 21 प्रदाता** |

---

<p align="center">
<b>केवल अधिकृत सुरक्षा परीक्षण और मूल्यांकन के लिए।</b><br>
किसी भी लक्ष्य पर फिंगरप्रिंटिंग करने से पहले हमेशा सुनिश्चित करें कि आपके पास उचित प्राधिकरण है।
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 लाइसेंस</a> &bull; Bun + TypeScript के साथ निर्मित
</p>
