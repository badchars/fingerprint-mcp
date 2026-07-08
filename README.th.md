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
  <strong>ไทย</strong> |
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

<h3 align="center">การพิมพ์ลายนิ้วมือดิจิทัลสากลสำหรับเอเจนต์ AI</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, การตรวจสอบบริการ, JARM, JA4X, การแฮชไอคอน favicon, โทโพโลยีโครงสร้างพื้นฐาน, การตรวจจับ C2, การเสริมข้อมูล OSINT &mdash; รวมเป็นเซิร์ฟเวอร์ MCP เดียว<br>
  เอเจนต์ AI ของคุณจะได้รับ<b>การพิมพ์ลายนิ้วมือครบทุกมิติตามต้องการ</b> ไม่ใช่เครื่องมือ CLI 11 ตัวที่แยกกันและการเชื่อมโยงข้อมูลด้วยมือ
</p>

<br>

<p align="center">
  <a href="#ปัญหา">ปัญหา</a> &bull;
  <a href="#แตกต่างอย่างไร">แตกต่างอย่างไร</a> &bull;
  <a href="#เริ่มต้นอย่างรวดเร็ว">เริ่มต้นอย่างรวดเร็ว</a> &bull;
  <a href="#สิ่งที่-ai-ทำได้">สิ่งที่ AI ทำได้</a> &bull;
  <a href="#อ้างอิงเครื่องมือ-13-เครื่องมือ-103-เทคนิค">เครื่องมือ (13)</a> &bull;
  <a href="#แหล่งข้อมูล-21">แหล่งข้อมูล</a> &bull;
  <a href="#สถาปัตยกรรม">สถาปัตยกรรม</a> &bull;
  <a href="CHANGELOG.md">บันทึกการเปลี่ยนแปลง</a> &bull;
  <a href="CONTRIBUTING.md">การมีส่วนร่วม</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="สัญญาอนุญาต"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 เครื่องมือ">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 เทคนิค">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="สาธิต fingerprint-mcp" width="800">
</p>

---

## ปัญหา

การพิมพ์ลายนิ้วมือเซิร์ฟเวอร์ในปัจจุบันหมายถึงการจัดการกับเครื่องมือที่แยกกันมากมาย คุณต้องรัน `nmap` สำหรับการสแกนพอร์ต, `testssl.sh` สำหรับการวิเคราะห์ใบรับรอง, `curl -I` สำหรับ HTTP headers, `dig` สำหรับ DNS, `wafw00f` สำหรับการตรวจจับ WAF, `ssh-audit` สำหรับ SSH, เครื่องมือ JARM แยกต่างหาก, Wappalyzer สำหรับการตรวจจับเทคโนโลยี &mdash; แล้วใช้เวลา 30 นาทีในการเชื่อมโยงข้อมูลทั้งหมดด้วยมือในสเปรดชีตเพื่อหาว่าจริงๆ แล้วมีอะไรทำงานอยู่

```
ขั้นตอนการพิมพ์ลายนิ้วมือแบบดั้งเดิม:
  วิเคราะห์ใบรับรอง TLS          ->  testssl.sh / openssl s_client
  ดึง HTTP headers               ->  curl -I
  ตรวจจับเทคโนโลยีเว็บ           ->  wappalyzer CLI
  การสำรวจ DNS                    ->  dig / nslookup / dnsenum
  สแกนพอร์ต                      ->  nmap -sV
  ตรวจจับ WAF                     ->  wafw00f
  ตรวจสอบ SSH                     ->  ssh-audit
  พิมพ์ลายนิ้วมือบริการ            ->  nmap scripts
  ลายนิ้วมือ JARM                  ->  jarm (เครื่องมือแยก)
  ตรวจสอบฐานข้อมูล OSINT          ->  shodan CLI, censys CLI
  เชื่อมโยงข้อมูลทั้งหมด           ->  ด้วยมือในสเปรดชีต
  ──────────────────────────────
  รวม: 11 เครื่องมือ, 30+ นาที, เชื่อมโยงข้อมูลด้วยมือ
```

**fingerprint-mcp** มอบเครื่องมือผสม 13 ตัวให้เอเจนต์ AI ของคุณ ครอบคลุม 103 เทคนิคการพิมพ์ลายนิ้วมือจาก 21 ผู้ให้บริการผ่าน [Model Context Protocol](https://modelcontextprotocol.io) เอเจนต์จะรันการพิมพ์ลายนิ้วมือหลายชั้นพร้อมกัน เชื่อมโยงสัญญาณข้ามชั้น TCP/TLS/HTTP/DNS/SSH ตรวจจับ honeypot และโครงสร้างพื้นฐาน C2 และนำเสนอภาพข่าวกรองแบบรวม &mdash; ในการสนทนาเดียว

```
ด้วย fingerprint-mcp:
  คุณ: "ทำ deep recon บน target.com"

  เอเจนต์: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 ผ่าน JARM (3fd21b20d00000...),
            ใบรับรอง Let's Encrypt, 2 SANs, TLS 1.2+1.3
         -> HTTP: Express.js อยู่หลัง Cloudflare WAF,
            React SPA, Google Analytics, วิเคราะห์ security headers 14 รายการ
         -> DNS: ระเบียน A/AAAA/MX/TXT, กำหนดค่า SPF/DKIM/DMARC แล้ว,
            ตรวจพบ Slack + Google Workspace ผ่าน CNAME/MX
         -> พอร์ต: 80, 443, 22 (OpenSSH 9.6), 8080 (เซิร์ฟเวอร์พัฒนา)
         -> WAF: ตรวจพบ Cloudflare, ค้นพบ IP ต้นทางผ่านการเชื่อมต่อโดยตรง
         -> การนับ: 12 โดเมนย่อยผ่าน CT logs, ตรวจพบ wildcard DNS
         -> "target.com รัน nginx/1.24.0 กับ Express.js อยู่หลัง
            Cloudflare WAF. IP ต้นทาง 203.0.113.42 เปิดเผยที่พอร์ต 8080.
            TLS กำหนดค่าอย่างถูกต้อง (เทียบเท่า A+) แต่เซิร์ฟเวอร์พัฒนา
            ที่ 8080 ไม่มีการป้องกัน WAF. 3 โดเมนย่อยชี้ไปยัง
            โครงสร้างพื้นฐานที่ยกเลิกแล้ว — มีความเสี่ยงในการเข้ายึด."
```

---

## แตกต่างอย่างไร

เครื่องมือที่มีอยู่ให้ข้อมูลดิบทีละชั้น fingerprint-mcp ให้เอเจนต์ AI ของคุณความสามารถในการ**วิเคราะห์ข้ามทุกชั้นการพิมพ์ลายนิ้วมือพร้อมกัน**

<table>
<thead>
<tr>
<th></th>
<th>วิธีแบบดั้งเดิม</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>อินเทอร์เฟซ</b></td>
<td>เครื่องมือ CLI 11 ตัวที่มีรูปแบบเอาต์พุตต่างกัน</td>
<td>MCP &mdash; เอเจนต์ AI เรียกใช้เครื่องมือแบบสนทนา</td>
</tr>
<tr>
<td><b>เทคนิค</b></td>
<td>เครื่องมือหนึ่งตัว หนึ่งชั้นต่อครั้ง</td>
<td>103 เทคนิคจาก 21 ผู้ให้บริการ รันพร้อมกัน</td>
</tr>
<tr>
<td><b>การวิเคราะห์ TLS</b></td>
<td>เอาต์พุต testssl.sh, แยกวิเคราะห์ JARM ด้วยมือ</td>
<td>เอเจนต์รวมใบรับรอง + JARM + JA4X + ชุดรหัส + SNI + CT logs ในการเรียกเดียว</td>
</tr>
<tr>
<td><b>การเชื่อมโยง</b></td>
<td>คัดลอกและวางผลลัพธ์ลงในสเปรดชีต</td>
<td>เอเจนต์เชื่อมโยงข้าม: "JARM ตรงกับ framework C2 ที่รู้จัก, เวลา HTTP ยืนยัน honeypot"</td>
</tr>
<tr>
<td><b>การเลี่ยง WAF</b></td>
<td>wafw00f ตรวจจับ WAF, คุณต้องหาต้นทางเอง</td>
<td>เอเจนต์ตรวจจับ WAF, ค้นพบ IP ต้นทาง, และยืนยันว่าให้บริการเนื้อหาเดียวกัน</td>
</tr>
<tr>
<td><b>คีย์ API</b></td>
<td>จำเป็นสำหรับ Shodan, Censys ฯลฯ</td>
<td>เทคนิคแอคทีฟ 80+ ตัวทำงานโดยไม่ต้องมีคีย์ API; คีย์เปิดใช้การเสริมข้อมูล OSINT</td>
</tr>
<tr>
<td><b>การตั้งค่า</b></td>
<td>ติดตั้ง nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; คำสั่งเดียว ไม่ต้องตั้งค่า</td>
</tr>
</tbody>
</table>

---

## เริ่มต้นอย่างรวดเร็ว

### ตัวเลือก 1: npx (ไม่ต้องติดตั้ง)

```bash
npx fingerprint-mcp
```

เทคนิคการพิมพ์ลายนิ้วมือแอคทีฟทั้ง 80+ ตัวทำงานได้ทันที ไม่ต้องมีคีย์ API สำหรับการพิมพ์ลายนิ้วมือ TCP, TLS, SSH, HTTP, DNS, WAF, เส้นทาง, บริการ, เวลา, IoT, SMTP, โครงสร้างพื้นฐาน และแอปพลิเคชัน

### ตัวเลือก 2: โคลน

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### ตัวแปรสภาพแวดล้อม (ไม่บังคับ)

```bash
# การเสริมข้อมูล OSINT (ทั้งหมดไม่บังคับ — การพิมพ์ลายนิ้วมือแอคทีฟทำงานโดยไม่ต้องมีคีย์ใดๆ)
export SHODAN_API_KEY=your-key           # เปิดใช้ osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # เปิดใช้ osint_censys (ฟรี: 250 คำร้องขอ/เดือน)
export CENSYS_API_SECRET=your-secret     # ซีเครต Censys API
export SECURITYTRAILS_API_KEY=your-key   # เปิดใช้ waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # เปิดใช้ osint_virustotal (ฟรี: 500 คำร้องขอ/วัน)
```

คีย์ API ทั้งหมดเป็นตัวเลือก โดยไม่มีคีย์เหล่านี้ คุณยังคงได้รับการพิมพ์ลายนิ้วมือเต็มรูปแบบสำหรับ TCP/TLS/SSH/HTTP/DNS/WAF/เส้นทาง/บริการ/เวลา/IoT/SMTP/โครงสร้างพื้นฐาน/แอปพลิเคชัน, การเชื่อมโยง, การวิเคราะห์แบบพาสซีฟ, การนับ, และเครื่องมือ meta &mdash; เทคนิค 80+ ตัวที่ทำงานโดยการตรวจสอบเป้าหมายโดยตรง

### เชื่อมต่อกับเอเจนต์ AI ของคุณ

<details open>
<summary><b>Claude Code</b></summary>

```bash
# ด้วย npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# ด้วยโคลนในเครื่อง
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

เพิ่มใน `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / ไคลเอนต์ MCP อื่นๆ</b></summary>

รูปแบบการตั้งค่า JSON เดียวกัน ชี้คำสั่งไปที่ `npx fingerprint-mcp` หรือเส้นทางการติดตั้งในเครื่องของคุณ

</details>

### เริ่มสอบถาม

```
คุณ: "พิมพ์ลายนิ้วมือทุกอย่างเกี่ยวกับ target.com — TLS, HTTP stack, WAF, DNS, พอร์ตที่เปิด"
```

เท่านั้นเอง เอเจนต์จัดการกับการพิมพ์ลายนิ้วมือหลายชั้น การเชื่อมโยงสัญญาณ และการวิเคราะห์โครงสร้างพื้นฐานโดยอัตโนมัติ

---

## สิ่งที่ AI ทำได้

### การสำรวจอย่างรวดเร็ว

```
คุณ: "สำรวจเร็วบน target.com"

เอเจนต์: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: พอร์ต 80, 443, 22 เปิด
       -> TLS: ใบรับรอง Let's Encrypt RSA, TLS 1.2+1.3, ลายเซ็น nginx JARM
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, กำหนดค่า SPF/DKIM แล้ว
       -> WAF: ตรวจพบ Cloudflare (cf-ray header)
       -> "target.com เป็น React SPA บน Express.js หลัง nginx/1.24.0,
          ให้บริการผ่าน Cloudflare CDN. TLS กำหนดค่าอย่างถูกต้องด้วย
          Let's Encrypt. SSH บนพอร์ต 22 รัน OpenSSH 9.6. อีเมล
          จัดการโดย Google Workspace ด้วย SPF/DKIM/DMARC เต็มรูปแบบ."
```

### การตรวจสอบ TLS เชิงลึก

```
คุณ: "วิเคราะห์การตั้งค่า TLS ของ suspicious-server.com อย่างละเอียด"

เอเจนต์: -> scan_tls {host: "suspicious-server.com"}

       -> ใบรับรอง: ลงนามด้วยตนเอง, CN=localhost, หมดอายุ 47 วันที่แล้ว
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (ตรงกับโปรไฟล์เริ่มต้นของ Cobalt Strike)
       -> JA4X: ลายนิ้วมือตรงกับรูปแบบ framework C2 ที่รู้จัก
       -> ชุดรหัส: ยอมรับรหัสที่อ่อนแอ (RC4, 3DES)
       -> SNI: ตอบสนองเหมือนกันกับค่า SNI ใดๆ
       -> CT logs: ไม่มีบันทึกใบรับรอง (ไม่น่าเชื่อถือแบบสาธารณะ)
       -> "ความเสี่ยงสูง: การตั้งค่า TLS บ่งชี้โครงสร้างพื้นฐาน C2 อย่างชัดเจน
          ใบรับรองลงนามด้วยตนเองที่หมดอายุ, ลายนิ้วมือ JARM ตรงกับ Cobalt Strike,
          ยอมรับรหัสที่อ่อนแอ, และตอบสนองต่อค่า SNI ใดๆ
          แนะนำการตรวจสอบและบล็อกทันที."
```

### การเลี่ยง WAF และค้นหาต้นทาง

```
คุณ: "target.com อยู่หลัง WAF. คุณหาเซิร์ฟเวอร์ต้นทางได้ไหม?"

เอเจนต์: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), หน้าท้าทายเมื่อมีคำร้องขอที่น่าสงสัย
       -> DNS: ระเบียน A ชี้ไปที่ IP Cloudflare 104.21.x.x
       -> โดเมนย่อย: dev.target.com แปลงเป็น 203.0.113.42 (ไม่ใช่ Cloudflare)
       -> เชื่อมต่อตรงกับ 203.0.113.42:443 คืนใบรับรอง TLS เดียวกัน
       -> ประวัติ SecurityTrails: ต้นทางคือ 203.0.113.42 ก่อน Cloudflare
       -> "พบ IP ต้นทาง: 203.0.113.42. ค้นพบผ่านโดเมนย่อย
          dev.target.com ที่เลี่ยง Cloudflare. ต้นทางให้บริการ
          ใบรับรอง TLS เดียวกันและตอบสนองต่อ Host header ของ target.com.
          ต้นทางไม่มีการป้องกัน WAF — สามารถเข้าถึงโดยตรงได้."
```

### การค้นหาบริการบนโฮสต์

```
คุณ: "มีบริการอะไรทำงานอยู่บน 10.0.1.50?"

เอเจนต์: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> พอร์ต 22: OpenSSH 8.9p1 Ubuntu, คีย์โฮสต์ ED25519
       -> พอร์ต 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> พอร์ต 3306: MySQL 8.0.36, ต้องการการพิสูจน์ตัวตน
       -> พอร์ต 5432: PostgreSQL 16.1, ต้องการ SSL
       -> พอร์ต 6379: Redis 7.2.4, ไม่มีการพิสูจน์ตัวตน (เปิด)
       -> พอร์ต 8080: เซิร์ฟเวอร์พัฒนา Node.js Express, CORS: *
       -> "วิกฤต: Redis บนพอร์ต 6379 ไม่มีการพิสูจน์ตัวตน — ใครก็ได้บน
          เครือข่ายสามารถอ่าน/เขียนข้อมูลได้. เซิร์ฟเวอร์พัฒนา Express บน 8080
          มี CORS แบบ wildcard. MySQL และ PostgreSQL ต้องการการพิสูจน์ตัวตนอย่างถูกต้อง.
          WordPress ช้ากว่า 2 เวอร์ชันย่อย. ต้องดำเนินการทันที
          เกี่ยวกับ Redis และการเปิดเผยเซิร์ฟเวอร์พัฒนา."
```

---

## อ้างอิงเครื่องมือ (13 เครื่องมือ, 103 เทคนิค)

<details open>
<summary><b>recon &mdash; การสำรวจเต็มรูปแบบพร้อมการเลือกเทคนิคตามระดับความลึก</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `url` | string | URL เป้าหมายสำหรับการพิมพ์ลายนิ้วมือ |
| `depth` | `quick` \| `standard` \| `deep` | ความลึกของการสแกน: quick=5 เทคนิค, standard=20, deep=50+ |

ประสานเทคนิคจากผู้ให้บริการทั้งหมดตามระดับความลึก โหมดเร็วให้ภาพรวมอย่างรวดเร็ว; โหมดลึกรันการพิมพ์ลายนิ้วมืออย่างครบถ้วนรวมถึงการนับ, OSINT, และการเชื่อมโยง

</details>

<details>
<summary><b>scan_ports &mdash; การสแกนพอร์ต TCP พร้อมการตรวจจับบริการ (3 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `host` | string | โฮสต์เป้าหมาย (IP หรือโดเมน) |
| `ports` | number[] | ไม่บังคับ &mdash; พอร์ตเฉพาะที่จะสแกน (ค่าเริ่มต้นเป็นพอร์ตทั่วไป) |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `tcp_probe` | การสแกนเชื่อมต่อ TCP เพื่อตรวจจับพอร์ตที่เปิด |
| `tcp_banner` | การดึงแบนเนอร์บนพอร์ตที่เปิดเพื่อระบุบริการ |
| `tcp_analysis` | การวิเคราะห์การรวมพอร์ตและการอนุมานบริการ |

</details>

<details>
<summary><b>scan_tls &mdash; การวิเคราะห์ TLS/SSL แบบครบวงจร (8 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `host` | string | โฮสต์เป้าหมาย (IP หรือโดเมน) |
| `port` | number | ไม่บังคับ &mdash; พอร์ต TLS (ค่าเริ่มต้น: 443) |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `tls_certificate` | การแยกวิเคราะห์ใบรับรอง X.509 &mdash; หัวเรื่อง, ผู้ออก, SANs, ความถูกต้อง, สายโซ่ |
| `tls_jarm` | การพิมพ์ลายนิ้วมือแอคทีฟ JARM &mdash; 10 การทดสอบ TLS Client Hello, แฮช 62 อักขระ |
| `tls_ja4x` | การพิมพ์ลายนิ้วมือพาสซีฟ JA4X ของ TLS จากคุณสมบัติใบรับรอง |
| `tls_ciphers` | การนับชุดรหัสและการวิเคราะห์ความแข็งแกร่ง |
| `tls_protocols` | การตรวจจับเวอร์ชันโปรโตคอล TLS ที่รองรับ (SSLv3 ถึง TLS 1.3) |
| `tls_sni` | การทดสอบพฤติกรรม SNI &mdash; ใบรับรองเริ่มต้น vs. ชื่อโฮสต์ที่ร้องขอ |
| `tls_ct_logs` | การค้นหา Certificate Transparency logs ผ่าน crt.sh |
| `tls_ocsp` | การตรวจสอบ OCSP stapling และสถานะการเพิกถอน |

</details>

<details>
<summary><b>scan_dns &mdash; ข่าวกรอง DNS (7 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `domain` | string | โดเมนเป้าหมาย |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `dns_records` | การนับระเบียนเต็มรูปแบบ &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | การวิเคราะห์ระเบียน SPF, DKIM, และ DMARC |
| `dns_saas` | การตรวจจับ SaaS/บริการผ่านรูปแบบ CNAME และ MX (Slack, Zendesk ฯลฯ) |
| `dns_server` | การพิมพ์ลายนิ้วมือเซิร์ฟเวอร์ DNS (BIND, PowerDNS, Cloudflare ฯลฯ) |
| `dns_takeover` | การตรวจจับการเข้ายึดโดเมนย่อยผ่านการวิเคราะห์ CNAME ที่ค้างอยู่ |
| `dns_zone` | ความพยายามถ่ายโอนโซน (AXFR) |
| `dns_caa` | การวิเคราะห์ระเบียน CAA สำหรับข้อจำกัดหน่วยงานออกใบรับรอง |

</details>

<details>
<summary><b>scan_http &mdash; การพิมพ์ลายนิ้วมือ HTTP/เว็บ (29 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `url` | string | URL เป้าหมาย |

| เทคนิค | ผู้ให้บริการ | คำอธิบาย |
|---------|-------------|----------|
| `http_headers` | HTTP | การวิเคราะห์ response headers และการระบุเซิร์ฟเวอร์ |
| `http_header_order` | HTTP | ลายนิ้วมือลำดับ headers (ลายเซ็นซอฟต์แวร์เซิร์ฟเวอร์) |
| `http_security_headers` | HTTP | การตรวจสอบ security headers (CSP, HSTS, X-Frame-Options ฯลฯ) |
| `http_cookies` | HTTP | การวิเคราะห์คุกกี้ &mdash; แฟล็ก, คำนำหน้า, การตรวจจับ framework |
| `http_methods` | HTTP | การนับเมธอด HTTP ที่อนุญาต (OPTIONS) |
| `http_cors` | HTTP | การวิเคราะห์นโยบาย CORS และการตรวจจับการตั้งค่าผิดพลาด |
| `http_compression` | HTTP | อัลกอริทึมการบีบอัดที่รองรับ (gzip, br, zstd) |
| `http_caching` | HTTP | การวิเคราะห์ cache headers (การตรวจจับ CDN, reverse proxy) |
| `http_etag` | HTTP | การวิเคราะห์รูปแบบ ETag สำหรับการระบุ backend |
| `http_error` | HTTP | การพิมพ์ลายนิ้วมือหน้าข้อผิดพลาด (หน้าข้อผิดพลาดที่กำหนดเอง vs. ค่าเริ่มต้น) |
| `http_redirect` | HTTP | การวิเคราะห์สายโซ่การเปลี่ยนเส้นทาง |
| `http_timing` | HTTP | ค่าพื้นฐานเวลาตอบสนองสำหรับการวิเคราะห์ประสิทธิภาพเซิร์ฟเวอร์ |
| `http_favicon` | HTTP | แฮช favicon (MurmurHash3) สำหรับการระบุเทคโนโลยี |
| `http_robots` | HTTP | การแยกวิเคราะห์ robots.txt และการดึงเส้นทางที่ห้าม |
| `http_sitemap` | HTTP | การค้นหา sitemap และการดึง URL |
| `http_wellknown` | HTTP | การค้นหา endpoint .well-known (security.txt, openid ฯลฯ) |
| `web_tech` | Web | การตรวจจับเทคโนโลยีผ่านรูปแบบ HTML/JS/CSS |
| `web_analytics` | Web | การตรวจจับบริการวิเคราะห์และติดตาม |
| `web_sourcemaps` | Web | การค้นหาไฟล์ source map |
| `web_websocket` | Web | การตรวจจับ endpoint WebSocket |
| `web_graphql` | Web | การตรวจจับ endpoint GraphQL และ introspection |
| `web_spa` | Web | การตรวจจับ framework แอปพลิเคชันหน้าเดียว |
| `web_cdn` | Web | การตรวจจับ CDN ผ่าน response headers และ DNS |
| `web_meta` | Web | การวิเคราะห์แท็ก HTML meta (generator, คำแนะนำ framework) |
| `web_feed` | Web | การค้นหา RSS/Atom feed |
| `h2_detect` | HTTP/2 | การตรวจจับการรองรับโปรโตคอล HTTP/2 |
| `h2_fingerprint` | HTTP/2 | การพิมพ์ลายนิ้วมือเซิร์ฟเวอร์ HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | การตรวจจับการรองรับ HTTP/3 (QUIC) ผ่าน Alt-Svc header |
| `app_cms` | Application | การตรวจจับ CMS (WordPress, Drupal, Joomla ฯลฯ) |

</details>

<details>
<summary><b>scan_paths &mdash; ข่าวกรองเส้นทาง (5 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `url` | string | URL เป้าหมาย |
| `categories` | string[] | ไม่บังคับ &mdash; หมวดหมู่ที่จะตรวจสอบ (sensitive, git, debug, api, config) |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `path_sensitive` | การค้นหาไฟล์ที่ละเอียดอ่อน (ไฟล์สำรอง, ไฟล์การตั้งค่า, การถ่ายโอนฐานข้อมูล) |
| `path_robots` | การวิเคราะห์ robots.txt และ sitemap.xml สำหรับเส้นทางที่ซ่อน |
| `path_git` | การตรวจจับการรั่วไหลของ Git repository (.git/HEAD, .git/config) |
| `path_debug` | การค้นหา endpoint การแก้ไขข้อบกพร่อง (phpinfo, server-status, คอนโซลแก้ไขข้อบกพร่อง) |
| `path_api` | การค้นหาเวอร์ชัน API และ endpoint เอกสาร |

</details>

<details>
<summary><b>scan_waf &mdash; การตรวจจับและพิมพ์ลายนิ้วมือ WAF/CDN (4 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `url` | string | URL เป้าหมาย |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `waf_detect` | การตรวจจับการมีอยู่ของ WAF ผ่านการวิเคราะห์ response headers และพฤติกรรม |
| `waf_cdn` | การระบุผู้ให้บริการ CDN (Cloudflare, Akamai, Fastly ฯลฯ) |
| `waf_fingerprint` | การระบุผลิตภัณฑ์ WAF และการตรวจจับเวอร์ชัน |
| `waf_origin` | การค้นหา IP ต้นทางหลัง WAF/CDN (ต้องมี `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; การตรวจสอบระดับบริการ (12 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `host` | string | โฮสต์เป้าหมาย (IP หรือโดเมน) |
| `ports` | number[] | ไม่บังคับ &mdash; พอร์ตเฉพาะที่จะตรวจสอบ |
| `service` | string | ไม่บังคับ &mdash; บริการเฉพาะที่จะตรวจสอบ (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| เทคนิค | ผู้ให้บริการ | คำอธิบาย |
|---------|-------------|----------|
| `ssh_probe` | SSH | การตรวจจับเวอร์ชันโปรโตคอล SSH และซอฟต์แวร์ |
| `ssh_algorithms` | SSH | การตรวจสอบอัลกอริทึม SSH (KEX, รหัส, MACs, ประเภทคีย์โฮสต์) |
| `ssh_hostkey_lookup` | SSH | การค้นหาคีย์โฮสต์ SSH ผ่าน Shodan (ต้องมี `SHODAN_API_KEY`) |
| `svc_mysql` | Service | การตรวจจับเวอร์ชัน MySQL และการพิมพ์ลายนิ้วมือความสามารถ |
| `svc_postgres` | Service | การตรวจจับเวอร์ชัน PostgreSQL และการตรวจสอบการรองรับ SSL |
| `svc_redis` | Service | การตรวจจับเวอร์ชัน Redis และสถานะการพิสูจน์ตัวตน |
| `svc_ftp` | Service | การวิเคราะห์แบนเนอร์ FTP และการตรวจสอบการเข้าสู่ระบบแบบไม่ระบุชื่อ |
| `svc_vnc_rdp` | Service | การตรวจจับบริการ VNC/RDP และการประเมินความปลอดภัย |
| `smtp_banner` | SMTP | การวิเคราะห์แบนเนอร์ SMTP และการระบุ MTA |
| `smtp_starttls` | SMTP | การรองรับ SMTP STARTTLS และการตรวจสอบใบรับรอง |
| `iot_detect` | IoT | การตรวจจับอุปกรณ์ IoT ผ่านรูปแบบแบนเนอร์และหน้าเริ่มต้น |
| `iot_upnp` | IoT | การค้นหาอุปกรณ์ UPnP/SSDP บนเครือข่ายท้องถิ่น |

</details>

<details>
<summary><b>enumerate &mdash; การขยายขอบเขต (8 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `domain` | string | โดเมนเป้าหมาย |

| เทคนิค | คำอธิบาย |
|---------|----------|
| `enum_subdomains` | การนับโดเมนย่อยผ่านหลายวิธี |
| `enum_wildcard` | การตรวจจับ wildcard DNS |
| `enum_tld` | การขยาย TLD (target.com -> target.net, target.org ฯลฯ) |
| `enum_related` | การค้นหาโดเมนที่เกี่ยวข้องผ่านโครงสร้างพื้นฐานที่ใช้ร่วมกัน |
| `enum_asn` | การค้นหาเพื่อนบ้าน ASN &mdash; โดเมนอื่นบนเครือข่ายเดียวกัน |
| `enum_ct` | การดึงโดเมนย่อยจาก Certificate Transparency logs |
| `enum_passive_dns` | ประวัติ DNS พาสซีฟ (ต้องมี `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | สรุปขอบเขตและภาพรวมพื้นที่การโจมตี |

</details>

<details>
<summary><b>osint &mdash; การเสริมข้อมูล OSINT (6 เทคนิค)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `target` | string | ที่อยู่ IP หรือโดเมนที่จะเสริมข้อมูล |
| `type` | `ip` \| `domain` | ไม่บังคับ &mdash; ประเภทเป้าหมาย (ตรวจจับอัตโนมัติหากไม่ระบุ) |

| เทคนิค | การพิสูจน์ตัวตน | คำอธิบาย |
|---------|-----------------|----------|
| `osint_shodan` | `SHODAN_API_KEY` | การค้นหาโฮสต์ Shodan &mdash; พอร์ตที่เปิด, แบนเนอร์, ช่องโหว่, ระบบปฏิบัติการ |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | ข้อมูลโฮสต์ Censys &mdash; บริการ, TLS, ระบบอัตโนมัติ |
| `osint_reverse_ip` | ไม่มี | การค้นหา IP ย้อนกลับ &mdash; โดเมนอื่นบน IP เดียวกัน |
| `osint_whois` | ไม่มี | ข้อมูลการลงทะเบียน WHOIS &mdash; ผู้รับจดทะเบียน, วันที่, เนมเซิร์ฟเวอร์ |
| `osint_webarchive` | ไม่มี | ประวัติ Web Archive &mdash; snapshot แรก/ล่าสุด, ความถี่ของการเปลี่ยนแปลง |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | รายงาน VirusTotal ของโดเมน/IP &mdash; การตรวจจับ, หมวดหมู่, DNS |

</details>

<details>
<summary><b>analyze &mdash; การวิเคราะห์ลายนิ้วมือแบบพาสซีฟ (3 โหมด)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `type` | `headers` \| `html` \| `banner` | ประเภทข้อมูลที่จะวิเคราะห์ |
| `data` | string | ข้อมูลดิบที่จะวิเคราะห์ (วาง headers, HTML หรือเอาต์พุตแบนเนอร์) |

| โหมด | คำอธิบาย |
|------|----------|
| `fp_analyze_headers` | การวิเคราะห์ HTTP headers แบบพาสซีฟ &mdash; การตรวจจับเซิร์ฟเวอร์, framework, proxy โดยไม่ส่งทราฟฟิก |
| `fp_analyze_html` | การวิเคราะห์ HTML แบบพาสซีฟ &mdash; การตรวจจับเทคโนโลยี, การระบุ framework จากซอร์สโค้ด |
| `fp_analyze_banner` | การวิเคราะห์แบนเนอร์แบบพาสซีฟ &mdash; การระบุบริการจากข้อความแบนเนอร์ดิบ |

</details>

<details>
<summary><b>correlate &mdash; เครื่องยนต์เชื่อมโยงหลายสัญญาณ (7 โหมด)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | โหมดการเชื่อมโยง |
| `signals` | object | สัญญาณลายนิ้วมือที่จะเชื่อมโยง (แตกต่างตามโหมด) |

| โหมด | คำอธิบาย |
|------|----------|
| `fp_consistency` | การตรวจสอบความสอดคล้องของสัญญาณข้ามชั้น &mdash; ลายนิ้วมือ TCP, TLS, HTTP และ DNS สอดคล้องกันหรือไม่? |
| `fp_honeypot` | การตรวจจับ honeypot &mdash; ตรวจสอบการรวมบริการที่เป็นไปไม่ได้และความผิดปกติทางพฤติกรรม |
| `fp_spoofing` | การตรวจจับการปลอมแปลง &mdash; ระบุ headers เซิร์ฟเวอร์ที่ไม่ตรงกับพฤติกรรมจริง |
| `fp_compare` | การเปรียบเทียบโปรไฟล์ลายนิ้วมือของสองโฮสต์แบบเคียงข้างกัน |
| `fp_topology` | การทำแผนที่โทโพโลยีโครงสร้างพื้นฐาน &mdash; CDN, ตัวกระจายโหลด, สายโซ่ reverse proxy |
| `fp_c2` | การตรวจจับ framework C2 ผ่านการเชื่อมโยง JARM, TLS, HTTP และเวลา |
| `fp_identify` | การระบุตัวตนด้วยแฮชเทียบกับฐานข้อมูลลายเซ็นที่รู้จัก |

</details>

<details>
<summary><b>meta &mdash; การตั้งค่าเซิร์ฟเวอร์และข้อมูล (3 โหมด)</b></summary>

| พารามิเตอร์ | ประเภท | คำอธิบาย |
|-------------|--------|----------|
| `category` | string | ไม่บังคับ &mdash; กรองตามหมวดหมู่ |

| โหมด | คำอธิบาย |
|------|----------|
| `fp_sources` | แสดงรายการแหล่งข้อมูลที่มีทั้งหมดพร้อมการตั้งค่าและสถานะคีย์ API |
| `fp_config` | การตั้งค่าเซิร์ฟเวอร์ &mdash; เวอร์ชัน, ผู้ให้บริการที่โหลด, จำนวนเทคนิค |
| `fp_signatures` | รายการฐานข้อมูลลายเซ็น &mdash; JARM, แบนเนอร์, WAF, ลายเซ็นแอปพลิเคชัน |

</details>

---

### การใช้งาน CLI

```bash
# แสดงรายการเครื่องมือและเทคนิคทั้งหมดที่มี
npx fingerprint-mcp --list

# รันเครื่องมือใดๆ โดยตรง
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

# เครื่องมือ OSINT (ต้องมีคีย์ API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## แหล่งข้อมูล (21)

| แหล่ง | การพิสูจน์ตัวตน | สิ่งที่ให้ |
|-------|-----------------|-----------|
| การตรวจสอบ TCP | ไม่มี | การสแกนพอร์ต, การดึงแบนเนอร์, การตรวจจับบริการ |
| การวิเคราะห์ TLS/SSL | ไม่มี | การแยกวิเคราะห์ใบรับรอง, การพิมพ์ลายนิ้วมือ JARM, JA4X, การนับชุดรหัส, การทดสอบ SNI |
| การตรวจสอบ SSH | ไม่มี | เวอร์ชันโปรโตคอล, การตรวจสอบอัลกอริทึม, การตรวจจับซอฟต์แวร์ |
| การวิเคราะห์ HTTP | ไม่มี | การพิมพ์ลายนิ้วมือ headers, การแฮช favicon, การวิเคราะห์คุกกี้, การนับเมธอด, CORS |
| การตรวจจับเว็บ | ไม่มี | การตรวจจับเทคโนโลยี, การวิเคราะห์, source maps, WebSocket, GraphQL, framework SPA |
| การค้นหาเส้นทาง | ไม่มี | ไฟล์ที่ละเอียดอ่อน, การรั่วไหล git, endpoint แก้ไขข้อบกพร่อง, เวอร์ชัน API, robots.txt |
| การแปลง DNS | ไม่มี | การนับระเบียน, การวิเคราะห์การพิสูจน์ตัวตนอีเมล, การตรวจจับ SaaS, การพิมพ์ลายนิ้วมือเซิร์ฟเวอร์ |
| การตรวจจับ WAF/CDN | ไม่มี | การระบุ WAF, การตรวจจับ CDN, การพิมพ์ลายนิ้วมือ WAF |
| การวิเคราะห์เวลา | ไม่มี | ค่าพื้นฐานเวลาตอบสนอง, การตรวจจับความคลาดเคลื่อนของนาฬิกา |
| HTTP/2 และ HTTP/3 | ไม่มี | การตรวจจับและพิมพ์ลายนิ้วมือ HTTP/2, การค้นหา HTTP/3 Alt-Svc |
| การตรวจสอบ SMTP | ไม่มี | การวิเคราะห์แบนเนอร์ SMTP, การตรวจสอบ STARTTLS |
| IoT/อุปกรณ์ฝังตัว | ไม่มี | การตรวจจับอุปกรณ์ IoT, การค้นหา UPnP/SSDP |
| การตรวจจับแอปพลิเคชัน | ไม่มี | การระบุ CMS, framework และแพลตฟอร์มอีคอมเมิร์ซ |
| การตรวจสอบบริการ | ไม่มี | การพิมพ์ลายนิ้วมือ MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| การตรวจจับโครงสร้างพื้นฐาน | ไม่มี | การระบุผู้ให้บริการคลาวด์, ผู้ให้บริการโฮสติ้ง, CDN |
| เครื่องยนต์เชื่อมโยง | ไม่มี | ความสอดคล้องของสัญญาณ, การตรวจจับ honeypot, การตรวจจับการปลอมแปลง, การทำแผนที่โทโพโลยี |
| เครื่องยนต์ระบุตัวตน | ไม่มี | การระบุตัวตนด้วยแฮช, การตรวจจับ C2, การจับคู่ลายเซ็น |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | ข่าวกรองโฮสต์ &mdash; พอร์ตที่เปิด, แบนเนอร์, ช่องโหว่, การตรวจจับระบบปฏิบัติการ |
| [Censys](https://censys.io) | `CENSYS_API_ID` | ข้อมูลโฮสต์ &mdash; บริการ, ใบรับรอง TLS, ข้อมูลระบบอัตโนมัติ |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | การค้นหาต้นทาง WAF, ประวัติ DNS พาสซีฟ, ระเบียนประวัติ |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | ชื่อเสียงโดเมน/IP, ผลการตรวจจับ, ประวัติ DNS, หมวดหมู่ |

---

## สถาปัตยกรรม

```
src/
  index.ts                # จุดเข้า CLI (--help, --list, --tool, เซิร์ฟเวอร์ stdio)
  protocol/
    mcp-server.ts         # การตั้งค่าเซิร์ฟเวอร์ MCP (การขนส่ง stdio)
    tools.ts              # ทะเบียนเครื่องมือ — เครื่องมือผสมทั้ง 13 ตัวลงทะเบียนที่นี่
  types/
    index.ts              # ประเภทที่ใช้ร่วม (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # ตัวจำกัดอัตราต่อผู้ให้บริการ
    cache.ts              # แคช TTL สำหรับการตอบสนอง API
    require-key.ts        # ตัวช่วยตรวจสอบคีย์ API
    murmurhash3.ts        # MurmurHash3 สำหรับการแฮช favicon
  composite/              # ตัวประสานเครื่องมือผสม 13 ตัว
    recon.ts              # ตัวประสานการสำรวจเต็มรูปแบบ (quick/standard/deep)
    scan-ports.ts         # เครื่องมือผสมสแกนพอร์ต
    scan-tls.ts           # เครื่องมือผสมวิเคราะห์ TLS
    scan-dns.ts           # เครื่องมือผสมข่าวกรอง DNS
    scan-http.ts          # เครื่องมือผสมพิมพ์ลายนิ้วมือ HTTP
    scan-paths.ts         # เครื่องมือผสมค้นหาเส้นทาง
    scan-waf.ts           # เครื่องมือผสมตรวจจับ WAF/CDN
    scan-services.ts      # เครื่องมือผสมตรวจสอบบริการ
    analyze.ts            # เครื่องมือผสมวิเคราะห์พาสซีฟ
    correlate.ts          # เครื่องมือผสมเครื่องยนต์เชื่อมโยง
    enumerate.ts          # เครื่องมือผสมขยายขอบเขต
    osint.ts              # เครื่องมือผสมเสริมข้อมูล OSINT
    meta.ts               # เครื่องมือผสม meta เซิร์ฟเวอร์
    helpers.ts            # ตัวช่วยเครื่องมือผสมที่ใช้ร่วม
  tcp/                    # เทคนิคการตรวจสอบ TCP (3)
  tls/                    # เทคนิคการวิเคราะห์ TLS/SSL (8)
  ssh/                    # เทคนิคการตรวจสอบ SSH (3)
  http/                   # เทคนิคการพิมพ์ลายนิ้วมือ HTTP (16)
  web/                    # เทคนิคการตรวจจับเทคโนโลยีเว็บ (9)
  path/                   # เทคนิคการค้นหาเส้นทาง (5)
  dns/                    # เทคนิคข่าวกรอง DNS (7)
  waf/                    # เทคนิคการตรวจจับ WAF/CDN (4)
  timing/                 # เทคนิคการวิเคราะห์เวลา (2)
  h2/                     # เทคนิค HTTP/2 และ HTTP/3 (3)
  smtp/                   # เทคนิคการตรวจสอบ SMTP (2)
  iot/                    # เทคนิคการตรวจจับ IoT/อุปกรณ์ฝังตัว (2)
  app/                    # เทคนิคการตรวจจับแอปพลิเคชัน (3)
  service/                # เทคนิคการตรวจสอบบริการ (5)
  infra/                  # เทคนิคการตรวจจับโครงสร้างพื้นฐาน (3)
  correlation/            # เครื่องยนต์เชื่อมโยง (5)
  identify/               # เครื่องยนต์ระบุตัวตน (3)
  passive/                # การวิเคราะห์พาสซีฟ (3)
  osint/                  # เทคนิคการเสริมข้อมูล OSINT (6)
  enum/                   # เทคนิคการนับ (8)
  meta/                   # เครื่องมือ meta (3)
  data/                   # ฐานข้อมูลลายเซ็นและไลบรารีรูปแบบ
    jarm-signatures.ts    # ลายนิ้วมือ JARM ที่รู้จัก (C2, เซิร์ฟเวอร์, CDNs)
    waf-signatures.ts     # ลายเซ็นการตรวจจับ WAF
    service-banners.ts    # รูปแบบแบนเนอร์บริการ
    tech-patterns.ts      # รูปแบบการตรวจจับเทคโนโลยี
    favicon-hashes.ts     # ค่า MurmurHash3 ของ favicon ที่รู้จัก
    c2-signatures.ts      # ลายเซ็น framework C2
    ...                   # ฐานข้อมูลลายเซ็น/รูปแบบ 15+ รายการ
```

**การตัดสินใจในการออกแบบ:**

- **13 เครื่องมือผสม, 103 เทคนิค** &mdash; เอเจนต์เรียกเครื่องมือระดับสูง (`recon`, `scan_tls`, `scan_http`) แต่ละเครื่องมือผสมประสานเทคนิคระดับต่ำหลายตัวและคืนผลลัพธ์ที่เชื่อมโยง ซึ่งลดค่าใช้จ่ายในการเรียกเครื่องมือในขณะที่รักษาความละเอียด
- **21 ผู้ให้บริการ, 1 เซิร์ฟเวอร์** &mdash; ทุกชั้นการพิมพ์ลายนิ้วมือเป็นโมดูลอิสระ ตัวประสานเครื่องมือผสมเลือกเทคนิคตามบริบทและความลึก
- **แอคทีฟก่อน, OSINT ตัวเลือก** &mdash; เทคนิค 80+ ตัวทำงานโดยการตรวจสอบเป้าหมายโดยตรงด้วยคีย์ API ศูนย์ตัว ผู้ให้บริการ OSINT (Shodan, Censys, VirusTotal, SecurityTrails) เพิ่มการเสริมข้อมูลแต่ไม่จำเป็น
- **ตัวจำกัดอัตราต่อผู้ให้บริการ** &mdash; แต่ละผู้ให้บริการมีอินสแตนซ์ `RateLimiter` ของตัวเอง การตรวจสอบแอคทีฟถูกจำกัดอัตราเพื่อหลีกเลี่ยงการถูกตรวจพบ; API OSINT ถูกปรับเทียบตามโควต้าของพวกเขา
- **แคช TTL** &mdash; ระเบียน DNS (10 นาที), ผลลัพธ์ OSINT (15 นาที), CT logs (30 นาที) ถูกแคชเพื่อหลีกเลี่ยงการค้นหาซ้ำซ้อนระหว่างเวิร์กโฟลว์หลายเครื่องมือ
- **การลดประสิทธิภาพอย่างสง่างาม** &mdash; คีย์ API ที่ขาดไม่ทำให้เซิร์ฟเวอร์ล่ม เครื่องมือ OSINT คืนข้อความอธิบาย: "ตั้งค่า SHODAN_API_KEY เพื่อเปิดใช้การค้นหาโฮสต์ Shodan"
- **3 การพึ่งพา** &mdash; `@modelcontextprotocol/sdk`, `zod` และ `cheerio` I/O เครือข่ายทั้งหมดผ่าน `fetch()` ดั้งเดิมและโมดูล Node.js `net`/`tls`/`dns` ไม่มี nmap, ไม่มีไบนารีภายนอก

---

## ข้อจำกัด

- เครื่องมือ OSINT (Shodan, Censys, VirusTotal, SecurityTrails) ต้องมีคีย์ API สำหรับเทคนิคที่เกี่ยวข้อง
- ระดับฟรีของ Censys จำกัดที่ 250 คำร้องขอ/เดือน
- ระดับฟรีของ VirusTotal จำกัดที่ 500 คำร้องขอ/วัน
- การสแกนพอร์ตใช้ TCP connect (ไม่ใช่ SYN scan) &mdash; ซ่อนตัวน้อยกว่า nmap แต่ไม่ต้องการสิทธิ์ root
- การพิมพ์ลายนิ้วมือ JARM ต้องการการเข้าถึง TCP โดยตรงไปยังเป้าหมาย (อาจถูกบล็อกโดยไฟร์วอลล์)
- การค้นหา UPnP/SSDP ทำงานเฉพาะบนเครือข่ายท้องถิ่น
- การตรวจสอบบริการ (MySQL, PostgreSQL, Redis) เชื่อมต่อแต่ไม่พิสูจน์ตัวตน
- การนับโดเมนย่อยพึ่งพา CT logs และแหล่งพาสซีฟ (ไม่มี brute-force)
- ทดสอบบน macOS / Linux (ไม่ได้ทดสอบบน Windows)

---

## ส่วนหนึ่งของชุดเครื่องมือความปลอดภัย MCP

| โปรเจกต์ | โดเมน | เครื่องมือ |
|----------|--------|-----------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | การทดสอบความปลอดภัยด้วยเบราว์เซอร์ | 39 เครื่องมือ, Firefox, การทดสอบ injection |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | ความปลอดภัยคลาวด์ (AWS/Azure/GCP) | 38 เครื่องมือ, 60+ การตรวจสอบ |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | สถานะความปลอดภัย GitHub | 39 เครื่องมือ, 45 การตรวจสอบ |
| [cve-mcp](https://github.com/badchars/cve-mcp) | ข่าวกรองช่องโหว่ | 23 เครื่องมือ, 5 แหล่ง |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT และการสำรวจ | 37 เครื่องมือ, 12 แหล่ง |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web และข่าวกรองภัยคุกคาม | 66 เครื่องมือ, 16 แหล่ง |
| **fingerprint-mcp** | **การพิมพ์ลายนิ้วมือดิจิทัลสากล** | **13 เครื่องมือ, 103 เทคนิค, 21 ผู้ให้บริการ** |

---

<p align="center">
<b>สำหรับการทดสอบและประเมินความปลอดภัยที่ได้รับอนุญาตเท่านั้น</b><br>
ตรวจสอบให้แน่ใจว่าคุณได้รับอนุญาตอย่างเหมาะสมก่อนทำการพิมพ์ลายนิ้วมือบนเป้าหมายใดๆ
</p>

<p align="center">
  <a href="LICENSE">สัญญาอนุญาต AGPL-3.0</a> &bull; สร้างด้วย Bun + TypeScript
</p>
