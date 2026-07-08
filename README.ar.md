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
  <strong>العربية</strong> |
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

<h3 align="center">البصمة الرقمية الشاملة لوكلاء الذكاء الاصطناعي.</h3>

<p align="center">
  TCP، TLS/SSL، SSH، HTTP، DNS، WAF/CDN، IoT، SMTP، فحص الخدمات، JARM، JA4X، تجزئة الأيقونات المفضلة، طوبولوجيا البنية التحتية، كشف C2، إثراء OSINT &mdash; موحدة في خادم MCP واحد.<br>
  يحصل وكيل الذكاء الاصطناعي الخاص بك على <b>بصمة رقمية كاملة الطيف عند الطلب</b>، وليس 11 أداة CLI منفصلة وربط يدوي.
</p>

<br>

<p align="center">
  <a href="#المشكلة">المشكلة</a> &bull;
  <a href="#كيف-يختلف">كيف يختلف</a> &bull;
  <a href="#بداية-سريعة">بداية سريعة</a> &bull;
  <a href="#ما-يمكن-للذكاء-الاصطناعي-فعله">ما يمكن للذكاء الاصطناعي فعله</a> &bull;
  <a href="#مرجع-الأدوات-13-أداة-103-تقنية">الأدوات (13)</a> &bull;
  <a href="#مصادر-البيانات-21">مصادر البيانات</a> &bull;
  <a href="#البنية">البنية</a> &bull;
  <a href="CHANGELOG.md">سجل التغييرات</a> &bull;
  <a href="CONTRIBUTING.md">المساهمة</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="الترخيص"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 أداة">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 تقنية">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="عرض توضيحي لـ fingerprint-mcp" width="800">
</p>

---

## المشكلة

أخذ بصمة خادم اليوم يعني التعامل مع عشرات الأدوات المنفصلة. تقوم بتشغيل `nmap` لمسح المنافذ، و`testssl.sh` لتحليل الشهادات، و`curl -I` لرؤوس HTTP، و`dig` لـ DNS، و`wafw00f` لكشف WAF، و`ssh-audit` لـ SSH، وأداة JARM منفصلة، وWappalyzer لكشف التقنيات &mdash; ثم تقضي 30 دقيقة في الربط اليدوي لكل شيء في جدول بيانات لمعرفة ما يعمل فعلياً.

```
سير عمل البصمة التقليدي:
  تحليل شهادات TLS              ->  testssl.sh / openssl s_client
  التقاط رؤوس HTTP              ->  curl -I
  كشف تقنيات الويب              ->  wappalyzer CLI
  استطلاع DNS                    ->  dig / nslookup / dnsenum
  مسح المنافذ                    ->  nmap -sV
  كشف WAF                       ->  wafw00f
  تدقيق SSH                     ->  ssh-audit
  بصمة الخدمات                  ->  nmap scripts
  بصمة JARM                     ->  jarm (أداة منفصلة)
  فحص قواعد بيانات OSINT        ->  shodan CLI, censys CLI
  ربط كل شيء                    ->  يدوياً في جدول بيانات
  ──────────────────────────────
  المجموع: 11 أداة، 30+ دقيقة، ربط يدوي
```

يمنح **fingerprint-mcp** وكيل الذكاء الاصطناعي الخاص بك 13 أداة مركبة تغلف 103 تقنية بصمة عبر 21 مزوداً من خلال [Model Context Protocol](https://modelcontextprotocol.io). يقوم الوكيل بتشغيل البصمة متعددة الطبقات بالتوازي، ويربط الإشارات عبر طبقات TCP/TLS/HTTP/DNS/SSH، ويكشف مصائد العسل والبنية التحتية لـ C2، ويقدم صورة استخباراتية موحدة &mdash; في محادثة واحدة.

```
مع fingerprint-mcp:
  أنت: "قم باستطلاع عميق على target.com"

  الوكيل: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 عبر JARM (3fd21b20d00000...),
            شهادة Let's Encrypt، 2 SANs، TLS 1.2+1.3
         -> HTTP: Express.js خلف Cloudflare WAF,
            React SPA، Google Analytics، تحليل 14 رأس أمان
         -> DNS: سجلات A/AAAA/MX/TXT، SPF/DKIM/DMARC مُعدّة,
            كشف Slack + Google Workspace عبر CNAME/MX
         -> المنافذ: 80، 443، 22 (OpenSSH 9.6)، 8080 (خادم تطوير)
         -> WAF: كشف Cloudflare، اكتشاف IP الأصلي عبر الاتصال المباشر
         -> التعداد: 12 نطاقاً فرعياً عبر سجلات CT، كشف wildcard DNS
         -> "يعمل target.com على nginx/1.24.0 مع Express.js خلف
            Cloudflare WAF. IP الأصلي 203.0.113.42 مكشوف على المنفذ 8080.
            TLS مُعدّ بشكل صحيح (يعادل A+) لكن خادم التطوير
            على 8080 بدون حماية WAF. 3 نطاقات فرعية تشير إلى
            بنية تحتية مُلغاة — خطر استيلاء محتمل."
```

---

## كيف يختلف

الأدوات الحالية تعطيك بيانات خام طبقة واحدة في كل مرة. يمنح fingerprint-mcp وكيل الذكاء الاصطناعي الخاص بك القدرة على **التفكير عبر جميع طبقات البصمة في وقت واحد**.

<table>
<thead>
<tr>
<th></th>
<th>النهج التقليدي</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>الواجهة</b></td>
<td>11 أداة CLI مختلفة بتنسيقات إخراج مختلفة</td>
<td>MCP &mdash; وكيل الذكاء الاصطناعي يستدعي الأدوات بشكل حواري</td>
</tr>
<tr>
<td><b>التقنيات</b></td>
<td>أداة واحدة، طبقة واحدة في كل مرة</td>
<td>103 تقنية عبر 21 مزوداً، تعمل بالتوازي</td>
</tr>
<tr>
<td><b>تحليل TLS</b></td>
<td>إخراج testssl.sh، تحليل JARM يدوياً بشكل منفصل</td>
<td>الوكيل يجمع الشهادة + JARM + JA4X + مجموعات التشفير + SNI + سجلات CT في استدعاء واحد</td>
</tr>
<tr>
<td><b>الربط</b></td>
<td>نسخ ولصق النتائج في جدول بيانات</td>
<td>الوكيل يربط بشكل متقاطع: "بصمة JARM تطابق إطار C2 معروف، توقيت HTTP يؤكد مصيدة عسل"</td>
</tr>
<tr>
<td><b>تجاوز WAF</b></td>
<td>wafw00f يكشف WAF، تبحث يدوياً عن الأصل</td>
<td>الوكيل يكشف WAF، يكتشف IP الأصلي، ويتحقق من أنه يقدم نفس المحتوى</td>
</tr>
<tr>
<td><b>مفاتيح API</b></td>
<td>مطلوبة لـ Shodan و Censys وغيرها</td>
<td>أكثر من 80 تقنية نشطة تعمل بدون أي مفاتيح API؛ المفاتيح تفتح إثراء OSINT</td>
</tr>
<tr>
<td><b>الإعداد</b></td>
<td>تثبيت nmap، testssl، wafw00f، ssh-audit، jarm، wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; أمر واحد، بدون إعداد</td>
</tr>
</tbody>
</table>

---

## بداية سريعة

### الخيار 1: npx (بدون تثبيت)

```bash
npx fingerprint-mcp
```

جميع تقنيات البصمة النشطة الـ 80+ تعمل فوراً. لا حاجة لمفاتيح API لبصمة TCP و TLS و SSH و HTTP و DNS و WAF والمسارات والخدمات والتوقيت و IoT و SMTP والبنية التحتية والتطبيقات.

### الخيار 2: استنساخ

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### متغيرات البيئة (اختيارية)

```bash
# إثراء OSINT (جميعها اختيارية — البصمة النشطة تعمل بدون أي مفاتيح)
export SHODAN_API_KEY=your-key           # يُفعّل osint_shodan، ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # يُفعّل osint_censys (مجاني: 250 استعلام/شهر)
export CENSYS_API_SECRET=your-secret     # مفتاح Censys API السري
export SECURITYTRAILS_API_KEY=your-key   # يُفعّل waf_origin، enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # يُفعّل osint_virustotal (مجاني: 500 استعلام/يوم)
```

جميع مفاتيح API اختيارية. بدونها، لا تزال تحصل على بصمة كاملة لـ TCP/TLS/SSH/HTTP/DNS/WAF/المسارات/الخدمات/التوقيت/IoT/SMTP/البنية التحتية/التطبيقات، والربط، والتحليل السلبي، والتعداد، وأدوات meta &mdash; أكثر من 80 تقنية تعمل عن طريق فحص الهدف مباشرة.

### الاتصال بوكيل الذكاء الاصطناعي الخاص بك

<details open>
<summary><b>Claude Code</b></summary>

```bash
# مع npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# مع نسخة محلية
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

أضف إلى `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / عملاء MCP آخرون</b></summary>

نفس تنسيق إعداد JSON. وجّه الأمر إلى `npx fingerprint-mcp` أو مسار التثبيت المحلي الخاص بك.

</details>

### ابدأ الاستعلام

```
أنت: "خذ بصمة كل شيء عن target.com — TLS، مجموعة HTTP، WAF، DNS، المنافذ المفتوحة"
```

هذا كل شيء. يتعامل الوكيل مع البصمة متعددة الطبقات وربط الإشارات وتحليل البنية التحتية تلقائياً.

---

## ما يمكن للذكاء الاصطناعي فعله

### استطلاع سريع

```
أنت: "استطلاع سريع على target.com"

الوكيل: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: المنافذ 80، 443، 22 مفتوحة
       -> TLS: شهادة Let's Encrypt RSA، TLS 1.2+1.3، بصمة nginx JARM
       -> HTTP: nginx/1.24.0، Express.js، React، Cloudflare CDN
       -> DNS: A 203.0.113.42، MX Google Workspace، SPF/DKIM مُعدّ
       -> WAF: كشف Cloudflare (رأس cf-ray)
       -> "target.com هو React SPA على Express.js خلف nginx/1.24.0،
          يُقدم عبر Cloudflare CDN. TLS مُعدّ بشكل صحيح مع
          Let's Encrypt. SSH على المنفذ 22 يعمل بـ OpenSSH 9.6. البريد
          يُدار بواسطة Google Workspace مع SPF/DKIM/DMARC كامل."
```

### تحقيق TLS عميق

```
أنت: "حلل إعداد TLS لـ suspicious-server.com بالتفصيل"

الوكيل: -> scan_tls {host: "suspicious-server.com"}

       -> الشهادة: موقعة ذاتياً، CN=localhost، منتهية الصلاحية منذ 47 يوماً
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (تطابق ملف Cobalt Strike الافتراضي)
       -> JA4X: البصمة تطابق نمط إطار C2 معروف
       -> مجموعات التشفير: تقبل تشفيراً ضعيفاً (RC4، 3DES)
       -> SNI: تستجيب بشكل متطابق لأي قيمة SNI
       -> سجلات CT: الشهادة غير مسجلة (غير موثوقة علنياً)
       -> "خطر عالٍ: إعداد TLS يشير بقوة إلى بنية تحتية C2.
          شهادة موقعة ذاتياً منتهية الصلاحية، بصمة JARM تطابق Cobalt Strike،
          تقبل تشفيراً ضعيفاً، وتستجيب لقيم SNI عشوائية.
          يُوصى بالتحقيق الفوري والحظر."
```

### تجاوز WAF واكتشاف الأصل

```
أنت: "target.com خلف WAF. هل يمكنك إيجاد الخادم الأصلي؟"

الوكيل: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335)، صفحة تحدي عند الطلبات المشبوهة
       -> DNS: سجل A يشير إلى IP Cloudflare 104.21.x.x
       -> النطاقات الفرعية: dev.target.com يُحلّ إلى 203.0.113.42 (غير Cloudflare)
       -> الاتصال المباشر بـ 203.0.113.42:443 يُرجع نفس شهادة TLS
       -> سجل SecurityTrails التاريخي: الأصل كان 203.0.113.42 قبل Cloudflare
       -> "تم العثور على IP الأصلي: 203.0.113.42. اكتُشف عبر النطاق الفرعي
          dev.target.com الذي يتجاوز Cloudflare. الأصل يقدم نفس
          شهادة TLS ويستجيب لرأس Host الخاص بـ target.com.
          الأصل بدون حماية WAF — الوصول المباشر ممكن."
```

### اكتشاف الخدمات على مضيف

```
أنت: "ما الخدمات التي تعمل على 10.0.1.50؟"

الوكيل: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> المنفذ 22: OpenSSH 8.9p1 Ubuntu، مفتاح مضيف ED25519
       -> المنفذ 80: Apache/2.4.57، PHP/8.2، WordPress 6.4
       -> المنفذ 3306: MySQL 8.0.36، المصادقة مطلوبة
       -> المنفذ 5432: PostgreSQL 16.1، SSL مطلوب
       -> المنفذ 6379: Redis 7.2.4، بدون مصادقة (مفتوح)
       -> المنفذ 8080: خادم تطوير Node.js Express، CORS: *
       -> "حرج: Redis على المنفذ 6379 بدون مصادقة — أي شخص على
          الشبكة يمكنه القراءة/الكتابة. خادم Express التطويري على 8080
          لديه CORS شامل. MySQL و PostgreSQL يتطلبان المصادقة بشكل صحيح.
          WordPress متأخر بنسختين ثانويتين. إجراء فوري مطلوب
          بشأن Redis وتعرض خادم التطوير."
```

---

## مرجع الأدوات (13 أداة، 103 تقنية)

<details open>
<summary><b>recon &mdash; استطلاع كامل مع اختيار التقنيات حسب العمق</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `url` | string | عنوان URL الهدف لأخذ البصمة |
| `depth` | `quick` \| `standard` \| `deep` | عمق المسح: quick=5 تقنيات، standard=20، deep=50+ |

ينسق التقنيات من جميع المزودين بناءً على مستوى العمق. الوضع السريع يعطي نظرة عامة سريعة؛ الوضع العميق يشغل بصمة شاملة تشمل التعداد و OSINT والربط.

</details>

<details>
<summary><b>scan_ports &mdash; مسح منافذ TCP مع كشف الخدمات (3 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `host` | string | المضيف الهدف (IP أو نطاق) |
| `ports` | number[] | اختياري &mdash; منافذ محددة للمسح (الافتراضي هو المنافذ الشائعة) |

| التقنية | الوصف |
|---------|-------|
| `tcp_probe` | مسح اتصال TCP لكشف المنافذ المفتوحة |
| `tcp_banner` | التقاط البانر على المنافذ المفتوحة لتحديد الخدمات |
| `tcp_analysis` | تحليل مجموعات المنافذ واستنتاج الخدمات |

</details>

<details>
<summary><b>scan_tls &mdash; تحليل TLS/SSL كامل (8 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `host` | string | المضيف الهدف (IP أو نطاق) |
| `port` | number | اختياري &mdash; منفذ TLS (الافتراضي: 443) |

| التقنية | الوصف |
|---------|-------|
| `tls_certificate` | تحليل شهادة X.509 &mdash; الموضوع، المُصدر، SANs، الصلاحية، السلسلة |
| `tls_jarm` | بصمة JARM النشطة &mdash; 10 فحوصات TLS Client Hello، تجزئة 62 حرفاً |
| `tls_ja4x` | بصمة JA4X السلبية لـ TLS من خصائص الشهادة |
| `tls_ciphers` | تعداد مجموعات التشفير وتحليل القوة |
| `tls_protocols` | كشف إصدارات بروتوكول TLS المدعومة (SSLv3 حتى TLS 1.3) |
| `tls_sni` | اختبار سلوك SNI &mdash; الشهادة الافتراضية مقابل اسم المضيف المطلوب |
| `tls_ct_logs` | البحث في سجلات شفافية الشهادات عبر crt.sh |
| `tls_ocsp` | فحص تدبيس OCSP وحالة الإلغاء |

</details>

<details>
<summary><b>scan_dns &mdash; استخبارات DNS (7 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `domain` | string | النطاق الهدف |

| التقنية | الوصف |
|---------|-------|
| `dns_records` | تعداد كامل للسجلات &mdash; A، AAAA، MX، NS، TXT، CNAME، SOA |
| `dns_email_auth` | تحليل سجلات SPF و DKIM و DMARC |
| `dns_saas` | كشف SaaS/الخدمات عبر أنماط CNAME و MX (Slack، Zendesk، إلخ.) |
| `dns_server` | بصمة خادم DNS (BIND، PowerDNS، Cloudflare، إلخ.) |
| `dns_takeover` | كشف استيلاء النطاقات الفرعية عبر تحليل CNAME المعلق |
| `dns_zone` | محاولة نقل المنطقة (AXFR) |
| `dns_caa` | تحليل سجل CAA لقيود سلطة الشهادات |

</details>

<details>
<summary><b>scan_http &mdash; بصمة HTTP/الويب (29 تقنية)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `url` | string | عنوان URL الهدف |

| التقنية | المزود | الوصف |
|---------|--------|-------|
| `http_headers` | HTTP | تحليل رؤوس الاستجابة وتحديد الخادم |
| `http_header_order` | HTTP | بصمة ترتيب الرؤوس (توقيع برنامج الخادم) |
| `http_security_headers` | HTTP | تدقيق رؤوس الأمان (CSP، HSTS، X-Frame-Options، إلخ.) |
| `http_cookies` | HTTP | تحليل ملفات تعريف الارتباط &mdash; العلامات، البادئات، كشف إطار العمل |
| `http_methods` | HTTP | تعداد طرق HTTP المسموحة (OPTIONS) |
| `http_cors` | HTTP | تحليل سياسة CORS وكشف سوء التكوين |
| `http_compression` | HTTP | خوارزميات الضغط المدعومة (gzip، br، zstd) |
| `http_caching` | HTTP | تحليل رؤوس التخزين المؤقت (كشف CDN، الوكيل العكسي) |
| `http_etag` | HTTP | تحليل تنسيق ETag لتحديد الواجهة الخلفية |
| `http_error` | HTTP | بصمة صفحات الخطأ (صفحات خطأ مخصصة مقابل افتراضية) |
| `http_redirect` | HTTP | تحليل سلسلة إعادة التوجيه |
| `http_timing` | HTTP | خط أساس توقيت الاستجابة لتحديد أداء الخادم |
| `http_favicon` | HTTP | تجزئة الأيقونة المفضلة (MurmurHash3) لتحديد التقنية |
| `http_robots` | HTTP | تحليل robots.txt واستخراج المسارات المحظورة |
| `http_sitemap` | HTTP | اكتشاف خريطة الموقع واستخراج عناوين URL |
| `http_wellknown` | HTTP | اكتشاف نقاط نهاية .well-known (security.txt، openid، إلخ.) |
| `web_tech` | Web | كشف التقنيات عبر أنماط HTML/JS/CSS |
| `web_analytics` | Web | كشف خدمات التحليلات والتتبع |
| `web_sourcemaps` | Web | اكتشاف ملفات خرائط المصدر |
| `web_websocket` | Web | كشف نقاط نهاية WebSocket |
| `web_graphql` | Web | كشف نقطة نهاية GraphQL والاستبطان |
| `web_spa` | Web | كشف إطار عمل تطبيق الصفحة الواحدة |
| `web_cdn` | Web | كشف CDN عبر رؤوس الاستجابة و DNS |
| `web_meta` | Web | تحليل علامات HTML meta (المُنشئ، تلميحات إطار العمل) |
| `web_feed` | Web | اكتشاف RSS/Atom feed |
| `h2_detect` | HTTP/2 | كشف دعم بروتوكول HTTP/2 |
| `h2_fingerprint` | HTTP/2 | بصمة خادم HTTP/2 (SETTINGS، WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | كشف دعم HTTP/3 (QUIC) عبر رأس Alt-Svc |
| `app_cms` | Application | كشف CMS (WordPress، Drupal، Joomla، إلخ.) |

</details>

<details>
<summary><b>scan_paths &mdash; استخبارات المسارات (5 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `url` | string | عنوان URL الهدف |
| `categories` | string[] | اختياري &mdash; الفئات المراد فحصها (sensitive، git، debug، api، config) |

| التقنية | الوصف |
|---------|-------|
| `path_sensitive` | اكتشاف الملفات الحساسة (ملفات النسخ الاحتياطي، ملفات التكوين، تفريغ قواعد البيانات) |
| `path_robots` | تحليل robots.txt و sitemap.xml للمسارات المخفية |
| `path_git` | كشف تسريب مستودع Git (.git/HEAD، .git/config) |
| `path_debug` | اكتشاف نقاط نهاية التصحيح (phpinfo، server-status، وحدات التصحيح) |
| `path_api` | اكتشاف إصدارات API ونقاط نهاية الوثائق |

</details>

<details>
<summary><b>scan_waf &mdash; كشف وبصمة WAF/CDN (4 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `url` | string | عنوان URL الهدف |

| التقنية | الوصف |
|---------|-------|
| `waf_detect` | كشف وجود WAF عبر تحليل رؤوس الاستجابة والسلوك |
| `waf_cdn` | تحديد مزود CDN (Cloudflare، Akamai، Fastly، إلخ.) |
| `waf_fingerprint` | تحديد منتج WAF وكشف الإصدار |
| `waf_origin` | اكتشاف IP الأصلي خلف WAF/CDN (يتطلب `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; فحص مستوى الخدمة (12 تقنية)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `host` | string | المضيف الهدف (IP أو نطاق) |
| `ports` | number[] | اختياري &mdash; منافذ محددة للفحص |
| `service` | string | اختياري &mdash; خدمة محددة للفحص (mysql، postgres، redis، ftp، ssh، smtp، vnc، iot) |

| التقنية | المزود | الوصف |
|---------|--------|-------|
| `ssh_probe` | SSH | كشف إصدار بروتوكول SSH والبرنامج |
| `ssh_algorithms` | SSH | تدقيق خوارزميات SSH (KEX، التشفير، MACs، أنواع مفاتيح المضيف) |
| `ssh_hostkey_lookup` | SSH | البحث عن مفتاح مضيف SSH عبر Shodan (يتطلب `SHODAN_API_KEY`) |
| `svc_mysql` | Service | كشف إصدار MySQL وبصمة القدرات |
| `svc_postgres` | Service | كشف إصدار PostgreSQL وفحص دعم SSL |
| `svc_redis` | Service | كشف إصدار Redis وحالة المصادقة |
| `svc_ftp` | Service | تحليل بانر FTP وفحص تسجيل الدخول المجهول |
| `svc_vnc_rdp` | Service | كشف خدمة VNC/RDP وتقييم الأمان |
| `smtp_banner` | SMTP | تحليل بانر SMTP وتحديد MTA |
| `smtp_starttls` | SMTP | دعم SMTP STARTTLS وفحص الشهادة |
| `iot_detect` | IoT | كشف أجهزة IoT عبر أنماط البانر والصفحات الافتراضية |
| `iot_upnp` | IoT | اكتشاف أجهزة UPnP/SSDP على الشبكة المحلية |

</details>

<details>
<summary><b>enumerate &mdash; توسيع النطاق (8 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `domain` | string | النطاق الهدف |

| التقنية | الوصف |
|---------|-------|
| `enum_subdomains` | تعداد النطاقات الفرعية عبر طرق متعددة |
| `enum_wildcard` | كشف wildcard DNS |
| `enum_tld` | توسيع TLD (target.com -> target.net، target.org، إلخ.) |
| `enum_related` | اكتشاف النطاقات ذات الصلة عبر البنية التحتية المشتركة |
| `enum_asn` | اكتشاف جيران ASN &mdash; نطاقات أخرى على نفس الشبكة |
| `enum_ct` | استخراج النطاقات الفرعية من سجلات شفافية الشهادات |
| `enum_passive_dns` | تاريخ DNS السلبي (يتطلب `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | ملخص النطاق ونظرة عامة على سطح الهجوم |

</details>

<details>
<summary><b>osint &mdash; إثراء OSINT (6 تقنيات)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `target` | string | عنوان IP أو نطاق للإثراء |
| `type` | `ip` \| `domain` | اختياري &mdash; نوع الهدف (يُكتشف تلقائياً إذا حُذف) |

| التقنية | المصادقة | الوصف |
|---------|----------|-------|
| `osint_shodan` | `SHODAN_API_KEY` | بحث مضيف Shodan &mdash; المنافذ المفتوحة، البانرات، الثغرات، نظام التشغيل |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | بيانات مضيف Censys &mdash; الخدمات، TLS، النظام المستقل |
| `osint_reverse_ip` | لا شيء | بحث IP العكسي &mdash; نطاقات أخرى على نفس IP |
| `osint_whois` | لا شيء | بيانات تسجيل WHOIS &mdash; المسجل، التواريخ، خوادم الأسماء |
| `osint_webarchive` | لا شيء | تاريخ أرشيف الويب &mdash; أول/آخر لقطة، تكرار التغيير |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | تقرير VirusTotal للنطاق/IP &mdash; الاكتشافات، الفئات، DNS |

</details>

<details>
<summary><b>analyze &mdash; تحليل البصمة السلبية (3 أوضاع)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `type` | `headers` \| `html` \| `banner` | نوع البيانات المراد تحليلها |
| `data` | string | البيانات الخام للتحليل (الصق الرؤوس أو HTML أو إخراج البانر) |

| الوضع | الوصف |
|-------|-------|
| `fp_analyze_headers` | تحليل سلبي لرؤوس HTTP &mdash; كشف الخادم وإطار العمل والوكيل بدون إرسال حركة مرور |
| `fp_analyze_html` | تحليل سلبي لـ HTML &mdash; كشف التقنيات وتحديد إطار العمل من المصدر |
| `fp_analyze_banner` | تحليل سلبي للبانر &mdash; تحديد الخدمة من نص البانر الخام |

</details>

<details>
<summary><b>correlate &mdash; محرك ربط الإشارات المتعددة (7 أوضاع)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | وضع الربط |
| `signals` | object | إشارات البصمة للربط (تختلف حسب الوضع) |

| الوضع | الوصف |
|-------|-------|
| `fp_consistency` | فحص اتساق الإشارات عبر الطبقات &mdash; هل تتفق بصمات TCP و TLS و HTTP و DNS؟ |
| `fp_honeypot` | كشف مصائد العسل &mdash; يفحص مجموعات الخدمات المستحيلة والشذوذ السلوكي |
| `fp_spoofing` | كشف التزييف &mdash; يحدد عدم تطابق رؤوس الخادم مع السلوك الفعلي |
| `fp_compare` | مقارنة جنباً إلى جنب لملفات بصمة مضيفين |
| `fp_topology` | رسم طوبولوجيا البنية التحتية &mdash; CDN، موازن الحمل، سلسلة الوكيل العكسي |
| `fp_c2` | كشف إطار C2 عبر ربط JARM و TLS و HTTP والتوقيت |
| `fp_identify` | التعرف القائم على التجزئة مقابل قاعدة بيانات التوقيعات المعروفة |

</details>

<details>
<summary><b>meta &mdash; تكوين الخادم والبيانات (3 أوضاع)</b></summary>

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `category` | string | اختياري &mdash; التصفية حسب الفئة |

| الوضع | الوصف |
|-------|-------|
| `fp_sources` | قائمة جميع مصادر البيانات المتاحة مع التكوين وحالة مفاتيح API |
| `fp_config` | تكوين الخادم &mdash; الإصدار، المزودون المحملون، عدد التقنيات |
| `fp_signatures` | قائمة قاعدة بيانات التوقيعات &mdash; JARM، البانر، WAF، توقيعات التطبيقات |

</details>

---

### استخدام CLI

```bash
# قائمة جميع الأدوات والتقنيات المتاحة
npx fingerprint-mcp --list

# تشغيل أي أداة مباشرة
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

# أدوات OSINT (تتطلب مفاتيح API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## مصادر البيانات (21)

| المصدر | المصادقة | ما يوفره |
|--------|----------|----------|
| فحص TCP | لا شيء | مسح المنافذ، التقاط البانر، كشف الخدمات |
| تحليل TLS/SSL | لا شيء | تحليل الشهادات، بصمة JARM، JA4X، تعداد التشفير، اختبار SNI |
| فحص SSH | لا شيء | إصدار البروتوكول، تدقيق الخوارزميات، كشف البرنامج |
| تحليل HTTP | لا شيء | بصمة الرؤوس، تجزئة الأيقونات المفضلة، تحليل ملفات تعريف الارتباط، تعداد الطرق، CORS |
| كشف الويب | لا شيء | كشف التقنيات، التحليلات، خرائط المصدر، WebSocket، GraphQL، أطر SPA |
| اكتشاف المسارات | لا شيء | الملفات الحساسة، تسريبات git، نقاط نهاية التصحيح، إصدارات API، robots.txt |
| تحليل DNS | لا شيء | تعداد السجلات، تحليل مصادقة البريد، كشف SaaS، بصمة الخادم |
| كشف WAF/CDN | لا شيء | تحديد WAF، كشف CDN، بصمة WAF |
| تحليل التوقيت | لا شيء | خط أساس توقيت الاستجابة، كشف انحراف الساعة |
| HTTP/2 و HTTP/3 | لا شيء | كشف HTTP/2 وبصمته، اكتشاف HTTP/3 Alt-Svc |
| فحص SMTP | لا شيء | تحليل بانر SMTP، فحص STARTTLS |
| IoT/الأجهزة المدمجة | لا شيء | كشف أجهزة IoT، اكتشاف UPnP/SSDP |
| كشف التطبيقات | لا شيء | تحديد CMS وإطار العمل ومنصة التجارة الإلكترونية |
| فحص الخدمات | لا شيء | بصمة MySQL و PostgreSQL و Redis و FTP و VNC/RDP |
| كشف البنية التحتية | لا شيء | تحديد مزود السحابة والاستضافة و CDN |
| محرك الربط | لا شيء | اتساق الإشارات، كشف مصائد العسل، كشف التزييف، رسم الطوبولوجيا |
| محرك التعرف | لا شيء | التعرف القائم على التجزئة، كشف C2، مطابقة التوقيعات |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | استخبارات المضيف &mdash; المنافذ المفتوحة، البانرات، الثغرات، كشف نظام التشغيل |
| [Censys](https://censys.io) | `CENSYS_API_ID` | بيانات المضيف &mdash; الخدمات، شهادات TLS، معلومات النظام المستقل |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | اكتشاف أصل WAF، تاريخ DNS السلبي، السجلات التاريخية |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | سمعة النطاق/IP، نتائج الاكتشاف، تاريخ DNS، الفئات |

---

## البنية

```
src/
  index.ts                # نقطة دخول CLI (--help، --list، --tool، خادم stdio)
  protocol/
    mcp-server.ts         # إعداد خادم MCP (نقل stdio)
    tools.ts              # سجل الأدوات — جميع الأدوات المركبة الـ 13 مسجلة هنا
  types/
    index.ts              # أنواع مشتركة (ToolDef، ToolContext، ToolResult)
  utils/
    rate-limiter.ts       # محدد معدل لكل مزود
    cache.ts              # ذاكرة تخزين مؤقت TTL لاستجابات API
    require-key.ts        # مساعد التحقق من مفتاح API
    murmurhash3.ts        # MurmurHash3 لتجزئة الأيقونات المفضلة
  composite/              # 13 منسق أداة مركبة
    recon.ts              # منسق الاستطلاع الكامل (quick/standard/deep)
    scan-ports.ts         # مركب مسح المنافذ
    scan-tls.ts           # مركب تحليل TLS
    scan-dns.ts           # مركب استخبارات DNS
    scan-http.ts          # مركب بصمة HTTP
    scan-paths.ts         # مركب اكتشاف المسارات
    scan-waf.ts           # مركب كشف WAF/CDN
    scan-services.ts      # مركب فحص الخدمات
    analyze.ts            # مركب التحليل السلبي
    correlate.ts          # مركب محرك الربط
    enumerate.ts          # مركب توسيع النطاق
    osint.ts              # مركب إثراء OSINT
    meta.ts               # مركب meta الخادم
    helpers.ts            # مساعدات مركبة مشتركة
  tcp/                    # تقنيات فحص TCP (3)
  tls/                    # تقنيات تحليل TLS/SSL (8)
  ssh/                    # تقنيات فحص SSH (3)
  http/                   # تقنيات بصمة HTTP (16)
  web/                    # تقنيات كشف تقنيات الويب (9)
  path/                   # تقنيات اكتشاف المسارات (5)
  dns/                    # تقنيات استخبارات DNS (7)
  waf/                    # تقنيات كشف WAF/CDN (4)
  timing/                 # تقنيات تحليل التوقيت (2)
  h2/                     # تقنيات HTTP/2 و HTTP/3 (3)
  smtp/                   # تقنيات فحص SMTP (2)
  iot/                    # تقنيات كشف IoT/الأجهزة المدمجة (2)
  app/                    # تقنيات كشف التطبيقات (3)
  service/                # تقنيات فحص الخدمات (5)
  infra/                  # تقنيات كشف البنية التحتية (3)
  correlation/            # محرك الربط (5)
  identify/               # محرك التعرف (3)
  passive/                # التحليل السلبي (3)
  osint/                  # تقنيات إثراء OSINT (6)
  enum/                   # تقنيات التعداد (8)
  meta/                   # أدوات meta (3)
  data/                   # قواعد بيانات التوقيعات ومكتبات الأنماط
    jarm-signatures.ts    # بصمات JARM المعروفة (C2، الخوادم، CDNs)
    waf-signatures.ts     # توقيعات كشف WAF
    service-banners.ts    # أنماط بانر الخدمات
    tech-patterns.ts      # أنماط كشف التقنيات
    favicon-hashes.ts     # قيم MurmurHash3 المعروفة للأيقونات المفضلة
    c2-signatures.ts      # توقيعات إطار C2
    ...                   # أكثر من 15 قاعدة بيانات توقيعات/أنماط
```

**قرارات التصميم:**

- **13 أداة مركبة، 103 تقنية** &mdash; يستدعي الوكيل أدوات عالية المستوى (`recon`، `scan_tls`، `scan_http`). كل مركب ينسق تقنيات منخفضة المستوى متعددة ويعيد نتائج مرتبطة. هذا يقلل من عبء استدعاء الأدوات مع الحفاظ على الدقة.
- **21 مزوداً، خادم واحد** &mdash; كل طبقة بصمة هي وحدة مستقلة. المنسق المركب يختار التقنيات بناءً على السياق والعمق.
- **النشط أولاً، OSINT اختياري** &mdash; أكثر من 80 تقنية تعمل عن طريق فحص الهدف مباشرة بدون أي مفاتيح API. مزودو OSINT (Shodan، Censys، VirusTotal، SecurityTrails) يضيفون إثراءً لكنهم ليسوا مطلوبين أبداً.
- **محددات معدل لكل مزود** &mdash; كل مزود لديه مثيل `RateLimiter` خاص به. الفحص النشط محدد المعدل لتجنب الكشف؛ واجهات OSINT API معايرة وفق حصصها.
- **تخزين مؤقت TTL** &mdash; سجلات DNS (10 دقائق)، نتائج OSINT (15 دقيقة)، سجلات CT (30 دقيقة) مخزنة مؤقتاً لتجنب البحث المكرر أثناء سير العمل متعدد الأدوات.
- **التدهور السلس** &mdash; مفاتيح API المفقودة لا تُعطل الخادم. أدوات OSINT تُرجع رسائل وصفية: "عيّن SHODAN_API_KEY لتفعيل بحث مضيف Shodan."
- **3 تبعيات** &mdash; `@modelcontextprotocol/sdk`، `zod`، و`cheerio`. كل الإدخال/الإخراج الشبكي عبر `fetch()` الأصلي ووحدات Node.js `net`/`tls`/`dns`. بدون nmap، بدون ملفات ثنائية خارجية.

---

## القيود

- أدوات OSINT (Shodan، Censys، VirusTotal، SecurityTrails) تتطلب مفاتيح API لتقنياتها المعنية
- الطبقة المجانية من Censys محدودة بـ 250 استعلاماً/شهر
- الطبقة المجانية من VirusTotal محدودة بـ 500 استعلام/يوم
- مسح المنافذ يستخدم اتصال TCP (وليس مسح SYN) &mdash; أقل تخفياً من nmap لكنه لا يتطلب صلاحيات root
- بصمة JARM تتطلب وصول TCP مباشر للهدف (قد يُحظر بواسطة جدران الحماية)
- اكتشاف UPnP/SSDP يعمل فقط على الشبكات المحلية
- فحص الخدمات (MySQL، PostgreSQL، Redis) يتصل لكن لا يُصادق
- تعداد النطاقات الفرعية يعتمد على سجلات CT والمصادر السلبية (بدون تخمين عنيف)
- تم الاختبار على macOS / Linux (Windows لم يُختبر)

---

## جزء من مجموعة أمان MCP

| المشروع | المجال | الأدوات |
|---------|--------|---------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | اختبار الأمان المبني على المتصفح | 39 أداة، Firefox، اختبار الحقن |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | أمان السحابة (AWS/Azure/GCP) | 38 أداة، أكثر من 60 فحصاً |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | وضع أمان GitHub | 39 أداة، 45 فحصاً |
| [cve-mcp](https://github.com/badchars/cve-mcp) | استخبارات الثغرات | 23 أداة، 5 مصادر |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT والاستطلاع | 37 أداة، 12 مصدراً |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | الويب المظلم واستخبارات التهديدات | 66 أداة، 16 مصدراً |
| **fingerprint-mcp** | **البصمة الرقمية الشاملة** | **13 أداة، 103 تقنية، 21 مزوداً** |

---

<p align="center">
<b>للاختبار والتقييم الأمني المصرح به فقط.</b><br>
تأكد دائماً من حصولك على التصريح المناسب قبل إجراء البصمة على أي هدف.
</p>

<p align="center">
  <a href="LICENSE">ترخيص AGPL-3.0</a> &bull; مبني باستخدام Bun + TypeScript
</p>
