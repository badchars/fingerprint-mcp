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
  <strong>Tiếng Việt</strong> |
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

<h3 align="center">Lấy dấu vân tay kỹ thuật số toàn diện cho AI agent.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, thăm dò dịch vụ, JARM, JA4X, băm favicon, topo hạ tầng, phát hiện C2, làm giàu OSINT &mdash; hợp nhất trong một MCP server duy nhất.<br>
  AI agent của bạn có được <b>khả năng lấy dấu vân tay toàn phổ theo yêu cầu</b>, không phải 11 công cụ CLI rời rạc và tương quan thủ công.
</p>

<br>

<p align="center">
  <a href="#vấn-đề">Vấn Đề</a> &bull;
  <a href="#điểm-khác-biệt">Điểm Khác Biệt</a> &bull;
  <a href="#bắt-đầu-nhanh">Bắt Đầu Nhanh</a> &bull;
  <a href="#ai-có-thể-làm-gì">AI Có Thể Làm Gì</a> &bull;
  <a href="#tham-chiếu-công-cụ-13-công-cụ-103-kỹ-thuật">Công Cụ (13)</a> &bull;
  <a href="#nguồn-dữ-liệu-21">Nguồn Dữ Liệu</a> &bull;
  <a href="#kiến-trúc">Kiến Trúc</a> &bull;
  <a href="CHANGELOG.md">Nhật Ký Thay Đổi</a> &bull;
  <a href="CONTRIBUTING.md">Đóng Góp</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Giấy phép"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Công cụ">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Kỹ thuật">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Demo fingerprint-mcp" width="800">
</p>

---

## Vấn Đề

Lấy dấu vân tay máy chủ ngày nay có nghĩa là phải vật lộn với hàng tá công cụ rời rạc. Bạn chạy `nmap` để quét cổng, `testssl.sh` để phân tích chứng chỉ, `curl -I` để lấy HTTP headers, `dig` cho DNS, `wafw00f` để phát hiện WAF, `ssh-audit` cho SSH, một công cụ JARM riêng, Wappalyzer để phát hiện công nghệ &mdash; rồi bạn mất 30 phút đối chiếu thủ công mọi thứ trong bảng tính để tìm ra thực sự cái gì đang chạy.

```
Quy trình lấy dấu vân tay truyền thống:
  phân tích chứng chỉ TLS       ->  testssl.sh / openssl s_client
  lấy HTTP headers              ->  curl -I
  phát hiện công nghệ web       ->  wappalyzer CLI
  trinh sát DNS                 ->  dig / nslookup / dnsenum
  quét cổng                     ->  nmap -sV
  phát hiện WAF                 ->  wafw00f
  kiểm tra SSH                  ->  ssh-audit
  lấy dấu vân tay dịch vụ      ->  nmap scripts
  dấu vân tay JARM              ->  jarm (công cụ riêng)
  kiểm tra cơ sở dữ liệu OSINT ->  shodan CLI, censys CLI
  tương quan mọi thứ            ->  thủ công trong bảng tính
  ──────────────────────────────
  Tổng cộng: 11 công cụ, 30+ phút, tương quan thủ công
```

**fingerprint-mcp** cung cấp cho AI agent của bạn 13 công cụ tổng hợp bao gồm 103 kỹ thuật lấy dấu vân tay từ 21 nhà cung cấp qua [Model Context Protocol](https://modelcontextprotocol.io). Agent thực hiện lấy dấu vân tay đa tầng song song, tương quan tín hiệu qua các lớp TCP/TLS/HTTP/DNS/SSH, phát hiện honeypot và hạ tầng C2, và trình bày một bức tranh tình báo thống nhất &mdash; trong một cuộc hội thoại duy nhất.

```
Với fingerprint-mcp:
  Bạn: "Trinh sát sâu target.com"

  Agent: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 qua JARM (3fd21b20d00000...),
            chứng chỉ Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js đằng sau Cloudflare WAF,
            React SPA, Google Analytics, phân tích 14 headers bảo mật
         -> DNS: bản ghi A/AAAA/MX/TXT, đã cấu hình SPF/DKIM/DMARC,
            phát hiện Slack + Google Workspace qua CNAME/MX
         -> Cổng: 80, 443, 22 (OpenSSH 9.6), 8080 (dev server)
         -> WAF: phát hiện Cloudflare, tìm thấy IP gốc qua direct-connect
         -> Liệt kê: 12 subdomain qua CT logs, phát hiện wildcard DNS
         -> "target.com chạy nginx/1.24.0 với Express.js đằng sau
            Cloudflare WAF. IP gốc 203.0.113.42 lộ trên cổng 8080.
            TLS được cấu hình đúng (tương đương A+) nhưng dev server
            trên 8080 không có bảo vệ WAF. 3 subdomain trỏ đến
            hạ tầng đã ngừng hoạt động — rủi ro tiếp quản tiềm tàng."
```

---

## Điểm Khác Biệt

Các công cụ hiện có cung cấp dữ liệu thô từng lớp một. fingerprint-mcp cho AI agent của bạn khả năng **suy luận đồng thời qua tất cả các lớp dấu vân tay**.

<table>
<thead>
<tr>
<th></th>
<th>Cách tiếp cận truyền thống</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Giao diện</b></td>
<td>11 công cụ CLI khác nhau với các định dạng đầu ra khác nhau</td>
<td>MCP &mdash; AI agent gọi công cụ theo kiểu hội thoại</td>
</tr>
<tr>
<td><b>Kỹ thuật</b></td>
<td>Một công cụ, một lớp mỗi lần</td>
<td>103 kỹ thuật từ 21 nhà cung cấp, chạy song song</td>
</tr>
<tr>
<td><b>Phân tích TLS</b></td>
<td>Đầu ra testssl.sh, phân tích JARM thủ công riêng</td>
<td>Agent kết hợp chứng chỉ + JARM + JA4X + cipher suites + SNI + CT logs trong một lần gọi</td>
</tr>
<tr>
<td><b>Tương quan</b></td>
<td>Sao chép-dán kết quả vào bảng tính</td>
<td>Agent tương quan chéo: "JARM khớp với C2 framework đã biết, thời gian HTTP xác nhận honeypot"</td>
</tr>
<tr>
<td><b>Vượt WAF</b></td>
<td>wafw00f phát hiện WAF, bạn tự tìm nguồn gốc</td>
<td>Agent phát hiện WAF, tìm IP gốc, và xác minh nó phục vụ cùng nội dung</td>
</tr>
<tr>
<td><b>API key</b></td>
<td>Bắt buộc cho Shodan, Censys v.v.</td>
<td>80+ kỹ thuật chủ động hoạt động không cần API key; key mở khóa làm giàu OSINT</td>
</tr>
<tr>
<td><b>Cài đặt</b></td>
<td>Cài nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; một lệnh, không cấu hình</td>
</tr>
</tbody>
</table>

---

## Bắt Đầu Nhanh

### Lựa chọn 1: npx (không cần cài đặt)

```bash
npx fingerprint-mcp
```

Tất cả 80+ kỹ thuật lấy dấu vân tay chủ động hoạt động ngay lập tức. Không cần API key cho TCP, TLS, SSH, HTTP, DNS, WAF, đường dẫn, dịch vụ, thời gian, IoT, SMTP, lấy dấu vân tay hạ tầng và ứng dụng.

### Lựa chọn 2: Clone

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Biến môi trường (tùy chọn)

```bash
# Làm giàu OSINT (tất cả tùy chọn — lấy dấu vân tay chủ động hoạt động không cần key)
export SHODAN_API_KEY=your-key           # Kích hoạt osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Kích hoạt osint_censys (miễn phí: 250 truy vấn/tháng)
export CENSYS_API_SECRET=your-secret     # Bí mật Censys API
export SECURITYTRAILS_API_KEY=your-key   # Kích hoạt waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Kích hoạt osint_virustotal (miễn phí: 500 truy vấn/ngày)
```

Tất cả API key đều tùy chọn. Không có chúng, bạn vẫn có đầy đủ lấy dấu vân tay TCP/TLS/SSH/HTTP/DNS/WAF/đường dẫn/dịch vụ/thời gian/IoT/SMTP/hạ tầng/ứng dụng, tương quan, phân tích thụ động, liệt kê và công cụ meta &mdash; 80+ kỹ thuật hoạt động bằng cách thăm dò trực tiếp mục tiêu.

### Kết nối với AI agent của bạn

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Với npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Với bản clone cục bộ
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Thêm vào `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / các MCP client khác</b></summary>

Cùng định dạng cấu hình JSON. Trỏ lệnh đến `npx fingerprint-mcp` hoặc đường dẫn cài đặt cục bộ của bạn.

</details>

### Bắt đầu truy vấn

```
Bạn: "Lấy dấu vân tay mọi thứ về target.com — TLS, HTTP stack, WAF, DNS, các cổng mở"
```

Thế là xong. Agent tự động xử lý lấy dấu vân tay đa tầng, tương quan tín hiệu và phân tích hạ tầng.

---

## AI Có Thể Làm Gì

### Trinh Sát Nhanh

```
Bạn: "Trinh sát nhanh target.com"

Agent: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: cổng 80, 443, 22 mở
       -> TLS: chứng chỉ Let's Encrypt RSA, TLS 1.2+1.3, chữ ký JARM nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM đã cấu hình
       -> WAF: phát hiện Cloudflare (header cf-ray)
       -> "target.com là React SPA trên Express.js đằng sau nginx/1.24.0,
          phục vụ qua Cloudflare CDN. TLS được cấu hình đúng với
          Let's Encrypt. SSH trên cổng 22 chạy OpenSSH 9.6. Email
          được Google Workspace xử lý với đầy đủ SPF/DKIM/DMARC."
```

### Điều Tra TLS Sâu

```
Bạn: "Phân tích chi tiết cấu hình TLS của suspicious-server.com"

Agent: -> scan_tls {host: "suspicious-server.com"}

       -> Chứng chỉ: tự ký, CN=localhost, hết hạn 47 ngày trước
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (khớp với profile mặc định Cobalt Strike)
       -> JA4X: dấu vân tay khớp với mẫu C2 framework đã biết
       -> Cipher suites: chấp nhận cipher yếu (RC4, 3DES)
       -> SNI: phản hồi giống hệt với mọi giá trị SNI
       -> CT logs: chứng chỉ không được ghi log (không được tin cậy công khai)
       -> "RỦI RO CAO: Cấu hình TLS cho thấy mạnh mẽ đây là hạ tầng C2.
          Chứng chỉ tự ký đã hết hạn, dấu vân tay JARM khớp Cobalt Strike,
          chấp nhận cipher yếu, và phản hồi với mọi giá trị SNI tùy ý.
          Khuyến nghị điều tra và chặn ngay lập tức."
```

### Vượt WAF & Tìm Nguồn Gốc

```
Bạn: "target.com đằng sau WAF. Bạn có thể tìm máy chủ gốc không?"

Agent: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), trang thử thách với yêu cầu đáng ngờ
       -> DNS: bản ghi A trỏ đến IP Cloudflare 104.21.x.x
       -> Subdomain: dev.target.com phân giải thành 203.0.113.42 (không phải Cloudflare)
       -> Kết nối trực tiếp đến 203.0.113.42:443 trả về cùng chứng chỉ TLS
       -> Lịch sử SecurityTrails: nguồn gốc là 203.0.113.42 trước Cloudflare
       -> "Tìm thấy IP gốc: 203.0.113.42. Phát hiện qua subdomain
          dev.target.com vượt qua Cloudflare. Nguồn gốc phục vụ cùng
          chứng chỉ TLS và phản hồi với Host header target.com.
          Nguồn gốc không có bảo vệ WAF — truy cập trực tiếp có thể."
```

### Khám Phá Dịch Vụ Trên Host

```
Bạn: "Những dịch vụ nào đang chạy trên 10.0.1.50?"

Agent: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Cổng 22: OpenSSH 8.9p1 Ubuntu, host key ED25519
       -> Cổng 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Cổng 3306: MySQL 8.0.36, yêu cầu xác thực
       -> Cổng 5432: PostgreSQL 16.1, yêu cầu SSL
       -> Cổng 6379: Redis 7.2.4, KHÔNG có xác thực (mở)
       -> Cổng 8080: Node.js Express dev server, CORS: *
       -> "NGHIÊM TRỌNG: Redis trên cổng 6379 không có xác thực — bất kỳ ai
          trên mạng đều có thể đọc/ghi dữ liệu. Express dev server trên 8080
          có wildcard CORS. MySQL và PostgreSQL yêu cầu xác thực đúng cách.
          WordPress tụt 2 phiên bản nhỏ. Cần hành động ngay lập tức
          với Redis và sự phơi bày của dev server."
```

---

## Tham Chiếu Công Cụ (13 công cụ, 103 kỹ thuật)

<details open>
<summary><b>recon &mdash; Trinh sát đầy đủ với lựa chọn kỹ thuật theo độ sâu</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `url` | string | URL mục tiêu để lấy dấu vân tay |
| `depth` | `quick` \| `standard` \| `deep` | Độ sâu quét: quick=5 kỹ thuật, standard=20, deep=50+ |

Điều phối kỹ thuật từ tất cả nhà cung cấp dựa trên mức độ sâu. Chế độ nhanh cho tổng quan nhanh; chế độ sâu chạy lấy dấu vân tay toàn diện bao gồm liệt kê, OSINT và tương quan.

</details>

<details>
<summary><b>scan_ports &mdash; Quét cổng TCP với phát hiện dịch vụ (3 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `host` | string | Host mục tiêu (IP hoặc domain) |
| `ports` | number[] | Tùy chọn &mdash; các cổng cụ thể để quét (mặc định là các cổng phổ biến) |

| Kỹ thuật | Mô tả |
|----------|-------|
| `tcp_probe` | Quét TCP connect để phát hiện cổng mở |
| `tcp_banner` | Lấy banner trên cổng mở để nhận dạng dịch vụ |
| `tcp_analysis` | Phân tích tổ hợp cổng và suy luận dịch vụ |

</details>

<details>
<summary><b>scan_tls &mdash; Phân tích TLS/SSL đầy đủ (8 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `host` | string | Host mục tiêu (IP hoặc domain) |
| `port` | number | Tùy chọn &mdash; cổng TLS (mặc định: 443) |

| Kỹ thuật | Mô tả |
|----------|-------|
| `tls_certificate` | Phân tích chứng chỉ X.509 &mdash; chủ thể, nhà phát hành, SAN, hiệu lực, chuỗi |
| `tls_jarm` | Lấy dấu vân tay chủ động JARM &mdash; 10 thăm dò TLS Client Hello, hash 62 ký tự |
| `tls_ja4x` | Lấy dấu vân tay thụ động JA4X TLS từ thuộc tính chứng chỉ |
| `tls_ciphers` | Liệt kê cipher suite và phân tích độ mạnh |
| `tls_protocols` | Phát hiện phiên bản giao thức TLS được hỗ trợ (SSLv3 đến TLS 1.3) |
| `tls_sni` | Kiểm tra hành vi SNI &mdash; chứng chỉ mặc định so với hostname yêu cầu |
| `tls_ct_logs` | Tra cứu Certificate Transparency log qua crt.sh |
| `tls_ocsp` | Kiểm tra OCSP stapling và trạng thái thu hồi |

</details>

<details>
<summary><b>scan_dns &mdash; Tình báo DNS (7 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `domain` | string | Domain mục tiêu |

| Kỹ thuật | Mô tả |
|----------|-------|
| `dns_records` | Liệt kê đầy đủ bản ghi &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Phân tích bản ghi SPF, DKIM và DMARC |
| `dns_saas` | Phát hiện SaaS/dịch vụ qua mẫu CNAME và MX (Slack, Zendesk v.v.) |
| `dns_server` | Lấy dấu vân tay DNS server (BIND, PowerDNS, Cloudflare v.v.) |
| `dns_takeover` | Phát hiện chiếm đoạt subdomain qua phân tích CNAME treo |
| `dns_zone` | Thử chuyển vùng (AXFR) |
| `dns_caa` | Phân tích bản ghi CAA cho hạn chế tổ chức phát hành chứng chỉ |

</details>

<details>
<summary><b>scan_http &mdash; Lấy dấu vân tay HTTP/web (29 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `url` | string | URL mục tiêu |

| Kỹ thuật | Nhà cung cấp | Mô tả |
|----------|-------------|-------|
| `http_headers` | HTTP | Phân tích header phản hồi và nhận dạng server |
| `http_header_order` | HTTP | Dấu vân tay thứ tự header (chữ ký phần mềm server) |
| `http_security_headers` | HTTP | Kiểm tra header bảo mật (CSP, HSTS, X-Frame-Options v.v.) |
| `http_cookies` | HTTP | Phân tích cookie &mdash; cờ, tiền tố, phát hiện framework |
| `http_methods` | HTTP | Liệt kê phương thức HTTP được phép (OPTIONS) |
| `http_cors` | HTTP | Phân tích chính sách CORS và phát hiện cấu hình sai |
| `http_compression` | HTTP | Thuật toán nén được hỗ trợ (gzip, br, zstd) |
| `http_caching` | HTTP | Phân tích header cache (phát hiện CDN, reverse proxy) |
| `http_etag` | HTTP | Phân tích định dạng ETag để nhận dạng backend |
| `http_error` | HTTP | Lấy dấu vân tay trang lỗi (tùy chỉnh so với mặc định) |
| `http_redirect` | HTTP | Phân tích chuỗi chuyển hướng |
| `http_timing` | HTTP | Thời gian phản hồi cơ sở cho phân tích hiệu năng server |
| `http_favicon` | HTTP | Hash favicon (MurmurHash3) để nhận dạng công nghệ |
| `http_robots` | HTTP | Phân tích robots.txt và trích xuất đường dẫn bị cấm |
| `http_sitemap` | HTTP | Khám phá sitemap và trích xuất URL |
| `http_wellknown` | HTTP | Khám phá endpoint .well-known (security.txt, openid v.v.) |
| `web_tech` | Web | Phát hiện công nghệ qua mẫu HTML/JS/CSS |
| `web_analytics` | Web | Phát hiện dịch vụ phân tích và theo dõi |
| `web_sourcemaps` | Web | Khám phá tệp source map |
| `web_websocket` | Web | Phát hiện endpoint WebSocket |
| `web_graphql` | Web | Phát hiện endpoint GraphQL và introspection |
| `web_spa` | Web | Phát hiện framework ứng dụng trang đơn |
| `web_cdn` | Web | Phát hiện CDN qua header phản hồi và DNS |
| `web_meta` | Web | Phân tích HTML meta tag (generator, gợi ý framework) |
| `web_feed` | Web | Khám phá RSS/Atom feed |
| `h2_detect` | HTTP/2 | Phát hiện hỗ trợ giao thức HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Lấy dấu vân tay HTTP/2 server (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Phát hiện hỗ trợ HTTP/3 (QUIC) qua header Alt-Svc |
| `app_cms` | Application | Phát hiện CMS (WordPress, Drupal, Joomla v.v.) |

</details>

<details>
<summary><b>scan_paths &mdash; Tình báo đường dẫn (5 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `url` | string | URL mục tiêu |
| `categories` | string[] | Tùy chọn &mdash; danh mục để kiểm tra (sensitive, git, debug, api, config) |

| Kỹ thuật | Mô tả |
|----------|-------|
| `path_sensitive` | Khám phá tệp nhạy cảm (tệp sao lưu, tệp cấu hình, dump cơ sở dữ liệu) |
| `path_robots` | Phân tích robots.txt và sitemap.xml tìm đường dẫn ẩn |
| `path_git` | Phát hiện rò rỉ kho Git (.git/HEAD, .git/config) |
| `path_debug` | Khám phá endpoint gỡ lỗi (phpinfo, server-status, bảng điều khiển debug) |
| `path_api` | Khám phá phiên bản API và endpoint tài liệu |

</details>

<details>
<summary><b>scan_waf &mdash; Phát hiện và lấy dấu vân tay WAF/CDN (4 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `url` | string | URL mục tiêu |

| Kỹ thuật | Mô tả |
|----------|-------|
| `waf_detect` | Phát hiện sự hiện diện WAF qua phân tích header phản hồi và hành vi |
| `waf_cdn` | Nhận dạng nhà cung cấp CDN (Cloudflare, Akamai, Fastly v.v.) |
| `waf_fingerprint` | Nhận dạng sản phẩm WAF và phát hiện phiên bản |
| `waf_origin` | Khám phá IP gốc đằng sau WAF/CDN (yêu cầu `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Thăm dò cấp dịch vụ (12 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `host` | string | Host mục tiêu (IP hoặc domain) |
| `ports` | number[] | Tùy chọn &mdash; các cổng cụ thể để thăm dò |
| `service` | string | Tùy chọn &mdash; dịch vụ cụ thể để thăm dò (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Kỹ thuật | Nhà cung cấp | Mô tả |
|----------|-------------|-------|
| `ssh_probe` | SSH | Phát hiện phiên bản giao thức SSH và phần mềm |
| `ssh_algorithms` | SSH | Kiểm tra thuật toán SSH (KEX, cipher, MAC, loại host key) |
| `ssh_hostkey_lookup` | SSH | Tra cứu host key SSH qua Shodan (yêu cầu `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Phát hiện phiên bản MySQL và lấy dấu vân tay khả năng |
| `svc_postgres` | Service | Phát hiện phiên bản PostgreSQL và kiểm tra hỗ trợ SSL |
| `svc_redis` | Service | Phát hiện phiên bản Redis và trạng thái xác thực |
| `svc_ftp` | Service | Phân tích banner FTP và kiểm tra đăng nhập ẩn danh |
| `svc_vnc_rdp` | Service | Phát hiện dịch vụ VNC/RDP và đánh giá bảo mật |
| `smtp_banner` | SMTP | Phân tích banner SMTP và nhận dạng MTA |
| `smtp_starttls` | SMTP | Hỗ trợ SMTP STARTTLS và kiểm tra chứng chỉ |
| `iot_detect` | IoT | Phát hiện thiết bị IoT qua mẫu banner và trang mặc định |
| `iot_upnp` | IoT | Khám phá thiết bị UPnP/SSDP trên mạng cục bộ |

</details>

<details>
<summary><b>enumerate &mdash; Mở rộng phạm vi (8 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `domain` | string | Domain mục tiêu |

| Kỹ thuật | Mô tả |
|----------|-------|
| `enum_subdomains` | Liệt kê subdomain qua nhiều phương pháp |
| `enum_wildcard` | Phát hiện wildcard DNS |
| `enum_tld` | Mở rộng TLD (target.com -> target.net, target.org v.v.) |
| `enum_related` | Khám phá domain liên quan qua hạ tầng chung |
| `enum_asn` | Khám phá láng giềng ASN &mdash; domain khác trên cùng mạng |
| `enum_ct` | Trích xuất subdomain từ Certificate Transparency log |
| `enum_passive_dns` | Lịch sử DNS thụ động (yêu cầu `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Tóm tắt phạm vi và tổng quan bề mặt tấn công |

</details>

<details>
<summary><b>osint &mdash; Làm giàu OSINT (6 kỹ thuật)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `target` | string | Địa chỉ IP hoặc domain để làm giàu |
| `type` | `ip` \| `domain` | Tùy chọn &mdash; loại mục tiêu (tự phát hiện nếu bỏ qua) |

| Kỹ thuật | Xác thực | Mô tả |
|----------|---------|-------|
| `osint_shodan` | `SHODAN_API_KEY` | Tra cứu host Shodan &mdash; cổng mở, banner, lỗ hổng, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Dữ liệu host Censys &mdash; dịch vụ, TLS, hệ thống tự trị |
| `osint_reverse_ip` | Không | Tra cứu IP ngược &mdash; domain khác trên cùng IP |
| `osint_whois` | Không | Dữ liệu đăng ký WHOIS &mdash; nhà đăng ký, ngày, nameserver |
| `osint_webarchive` | Không | Lịch sử Web Archive &mdash; snapshot đầu/cuối, tần suất thay đổi |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Báo cáo VirusTotal domain/IP &mdash; phát hiện, danh mục, DNS |

</details>

<details>
<summary><b>analyze &mdash; Phân tích dấu vân tay thụ động (3 chế độ)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `type` | `headers` \| `html` \| `banner` | Loại dữ liệu để phân tích |
| `data` | string | Dữ liệu thô để phân tích (dán header, HTML hoặc đầu ra banner) |

| Chế độ | Mô tả |
|--------|-------|
| `fp_analyze_headers` | Phân tích HTTP header thụ động &mdash; phát hiện server, framework, proxy mà không gửi lưu lượng |
| `fp_analyze_html` | Phân tích HTML thụ động &mdash; phát hiện công nghệ, nhận dạng framework từ mã nguồn |
| `fp_analyze_banner` | Phân tích banner thụ động &mdash; nhận dạng dịch vụ từ văn bản banner thô |

</details>

<details>
<summary><b>correlate &mdash; Công cụ tương quan đa tín hiệu (7 chế độ)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Chế độ tương quan |
| `signals` | object | Tín hiệu dấu vân tay để tương quan (thay đổi theo chế độ) |

| Chế độ | Mô tả |
|--------|-------|
| `fp_consistency` | Kiểm tra nhất quán tín hiệu xuyên lớp &mdash; dấu vân tay TCP, TLS, HTTP và DNS có khớp không? |
| `fp_honeypot` | Phát hiện honeypot &mdash; kiểm tra tổ hợp dịch vụ không thể và bất thường hành vi |
| `fp_spoofing` | Phát hiện giả mạo &mdash; nhận dạng sự không khớp giữa header server và hành vi thực tế |
| `fp_compare` | So sánh song song hồ sơ dấu vân tay của hai host |
| `fp_topology` | Lập bản đồ topo hạ tầng &mdash; CDN, bộ cân bằng tải, chuỗi reverse proxy |
| `fp_c2` | Phát hiện C2 framework qua tương quan JARM, TLS, HTTP và thời gian |
| `fp_identify` | Nhận dạng dựa trên hash đối chiếu cơ sở dữ liệu chữ ký đã biết |

</details>

<details>
<summary><b>meta &mdash; Cấu hình và dữ liệu server (3 chế độ)</b></summary>

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `category` | string | Tùy chọn &mdash; lọc theo danh mục |

| Chế độ | Mô tả |
|--------|-------|
| `fp_sources` | Liệt kê tất cả nguồn dữ liệu có sẵn với cấu hình và trạng thái API key |
| `fp_config` | Cấu hình server &mdash; phiên bản, nhà cung cấp đã tải, số lượng kỹ thuật |
| `fp_signatures` | Danh sách cơ sở dữ liệu chữ ký &mdash; chữ ký JARM, banner, WAF, ứng dụng |

</details>

---

### Sử dụng CLI

```bash
# Liệt kê tất cả công cụ và kỹ thuật có sẵn
npx fingerprint-mcp --list

# Chạy bất kỳ công cụ nào trực tiếp
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

# Công cụ OSINT (yêu cầu API key)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Nguồn Dữ Liệu (21)

| Nguồn | Xác thực | Cung cấp gì |
|-------|---------|-------------|
| Thăm dò TCP | Không | Quét cổng, lấy banner, phát hiện dịch vụ |
| Phân tích TLS/SSL | Không | Phân tích chứng chỉ, lấy dấu vân tay JARM, JA4X, liệt kê cipher, kiểm tra SNI |
| Thăm dò SSH | Không | Phiên bản giao thức, kiểm tra thuật toán, phát hiện phần mềm |
| Phân tích HTTP | Không | Lấy dấu vân tay header, băm favicon, phân tích cookie, liệt kê phương thức, CORS |
| Phát hiện Web | Không | Phát hiện công nghệ, phân tích, source map, WebSocket, GraphQL, SPA framework |
| Khám phá đường dẫn | Không | Tệp nhạy cảm, rò rỉ git, endpoint gỡ lỗi, phiên bản API, robots.txt |
| Phân giải DNS | Không | Liệt kê bản ghi, phân tích xác thực email, phát hiện SaaS, lấy dấu vân tay server |
| Phát hiện WAF/CDN | Không | Nhận dạng WAF, phát hiện CDN, lấy dấu vân tay WAF |
| Phân tích thời gian | Không | Thời gian phản hồi cơ sở, phát hiện lệch đồng hồ |
| HTTP/2 & HTTP/3 | Không | Phát hiện và lấy dấu vân tay HTTP/2, khám phá HTTP/3 Alt-Svc |
| Thăm dò SMTP | Không | Phân tích banner SMTP, kiểm tra STARTTLS |
| IoT/Nhúng | Không | Phát hiện thiết bị IoT, khám phá UPnP/SSDP |
| Phát hiện ứng dụng | Không | Nhận dạng CMS, framework và nền tảng thương mại điện tử |
| Thăm dò dịch vụ | Không | Lấy dấu vân tay MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Phát hiện hạ tầng | Không | Nhận dạng nhà cung cấp cloud, hosting, CDN |
| Công cụ tương quan | Không | Nhất quán tín hiệu, phát hiện honeypot, phát hiện giả mạo, lập bản đồ topo |
| Công cụ nhận dạng | Không | Nhận dạng dựa trên hash, phát hiện C2, khớp chữ ký |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Tình báo host &mdash; cổng mở, banner, lỗ hổng, phát hiện OS |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Dữ liệu host &mdash; dịch vụ, chứng chỉ TLS, thông tin hệ thống tự trị |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Khám phá nguồn gốc WAF, lịch sử DNS thụ động, bản ghi lịch sử |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Danh tiếng domain/IP, kết quả phát hiện, lịch sử DNS, danh mục |

---

## Kiến Trúc

```
src/
  index.ts                # Điểm vào CLI (--help, --list, --tool, stdio server)
  protocol/
    mcp-server.ts         # Thiết lập MCP server (stdio transport)
    tools.ts              # Sổ đăng ký công cụ — tất cả 13 công cụ tổng hợp được đăng ký tại đây
  types/
    index.ts              # Kiểu dùng chung (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Bộ giới hạn tốc độ theo nhà cung cấp
    cache.ts              # TTL cache cho phản hồi API
    require-key.ts        # Hàm hỗ trợ xác thực API key
    murmurhash3.ts        # MurmurHash3 cho băm favicon
  composite/              # 13 bộ điều phối công cụ tổng hợp
    recon.ts              # Bộ điều phối trinh sát đầy đủ (quick/standard/deep)
    scan-ports.ts         # Tổng hợp quét cổng
    scan-tls.ts           # Tổng hợp phân tích TLS
    scan-dns.ts           # Tổng hợp tình báo DNS
    scan-http.ts          # Tổng hợp lấy dấu vân tay HTTP
    scan-paths.ts         # Tổng hợp khám phá đường dẫn
    scan-waf.ts           # Tổng hợp phát hiện WAF/CDN
    scan-services.ts      # Tổng hợp thăm dò dịch vụ
    analyze.ts            # Tổng hợp phân tích thụ động
    correlate.ts          # Tổng hợp công cụ tương quan
    enumerate.ts          # Tổng hợp mở rộng phạm vi
    osint.ts              # Tổng hợp làm giàu OSINT
    meta.ts               # Tổng hợp meta server
    helpers.ts            # Hàm hỗ trợ tổng hợp dùng chung
  tcp/                    # Kỹ thuật thăm dò TCP (3)
  tls/                    # Kỹ thuật phân tích TLS/SSL (8)
  ssh/                    # Kỹ thuật thăm dò SSH (3)
  http/                   # Kỹ thuật lấy dấu vân tay HTTP (16)
  web/                    # Kỹ thuật phát hiện công nghệ web (9)
  path/                   # Kỹ thuật khám phá đường dẫn (5)
  dns/                    # Kỹ thuật tình báo DNS (7)
  waf/                    # Kỹ thuật phát hiện WAF/CDN (4)
  timing/                 # Kỹ thuật phân tích thời gian (2)
  h2/                     # Kỹ thuật HTTP/2 & HTTP/3 (3)
  smtp/                   # Kỹ thuật thăm dò SMTP (2)
  iot/                    # Kỹ thuật phát hiện IoT/nhúng (2)
  app/                    # Kỹ thuật phát hiện ứng dụng (3)
  service/                # Kỹ thuật thăm dò dịch vụ (5)
  infra/                  # Kỹ thuật phát hiện hạ tầng (3)
  correlation/            # Công cụ tương quan (5)
  identify/               # Công cụ nhận dạng (3)
  passive/                # Phân tích thụ động (3)
  osint/                  # Kỹ thuật làm giàu OSINT (6)
  enum/                   # Kỹ thuật liệt kê (8)
  meta/                   # Công cụ meta (3)
  data/                   # Cơ sở dữ liệu chữ ký và thư viện mẫu
    jarm-signatures.ts    # Dấu vân tay JARM đã biết (C2, server, CDN)
    waf-signatures.ts     # Chữ ký phát hiện WAF
    service-banners.ts    # Mẫu banner dịch vụ
    tech-patterns.ts      # Mẫu phát hiện công nghệ
    favicon-hashes.ts     # Giá trị MurmurHash3 favicon đã biết
    c2-signatures.ts      # Chữ ký C2 framework
    ...                   # 15+ cơ sở dữ liệu chữ ký/mẫu
```

**Quyết định thiết kế:**

- **13 công cụ tổng hợp, 103 kỹ thuật** &mdash; Agent gọi các công cụ cấp cao (`recon`, `scan_tls`, `scan_http`). Mỗi tổng hợp điều phối nhiều kỹ thuật cấp thấp và trả về kết quả đã tương quan. Điều này giảm chi phí gọi công cụ trong khi duy trì độ chi tiết.
- **21 nhà cung cấp, 1 server** &mdash; Mỗi lớp lấy dấu vân tay là một module độc lập. Bộ điều phối tổng hợp chọn kỹ thuật dựa trên ngữ cảnh và độ sâu.
- **Chủ động trước, OSINT tùy chọn** &mdash; 80+ kỹ thuật hoạt động bằng cách thăm dò trực tiếp mục tiêu với không API key. Nhà cung cấp OSINT (Shodan, Censys, VirusTotal, SecurityTrails) bổ sung làm giàu nhưng không bao giờ bắt buộc.
- **Bộ giới hạn tốc độ theo nhà cung cấp** &mdash; Mỗi nhà cung cấp có instance `RateLimiter` riêng. Thăm dò chủ động được giới hạn tốc độ để tránh bị phát hiện; OSINT API được hiệu chỉnh theo quota của chúng.
- **TTL caching** &mdash; Bản ghi DNS (10 phút), kết quả OSINT (15 phút), CT log (30 phút) được cache để tránh tra cứu thừa trong quy trình đa công cụ.
- **Suy giảm mượt mà** &mdash; API key thiếu không làm crash server. Công cụ OSINT trả về thông báo mô tả: "Đặt SHODAN_API_KEY để kích hoạt tra cứu host Shodan."
- **3 dependency** &mdash; `@modelcontextprotocol/sdk`, `zod` và `cheerio`. Tất cả I/O mạng qua `fetch()` native và module Node.js `net`/`tls`/`dns`. Không nmap, không binary bên ngoài.

---

## Giới Hạn

- Công cụ OSINT (Shodan, Censys, VirusTotal, SecurityTrails) yêu cầu API key cho kỹ thuật tương ứng
- Gói miễn phí Censys giới hạn 250 truy vấn/tháng
- Gói miễn phí VirusTotal giới hạn 500 truy vấn/ngày
- Quét cổng sử dụng TCP connect (không phải SYN scan) &mdash; ít ẩn hơn nmap nhưng không yêu cầu quyền root
- Lấy dấu vân tay JARM yêu cầu truy cập TCP trực tiếp đến mục tiêu (có thể bị chặn bởi firewall)
- Khám phá UPnP/SSDP chỉ hoạt động trên mạng cục bộ
- Thăm dò dịch vụ (MySQL, PostgreSQL, Redis) kết nối nhưng không xác thực
- Liệt kê subdomain dựa vào CT log và nguồn thụ động (không brute-force)
- Đã kiểm tra trên macOS / Linux (Windows chưa kiểm tra)

---

## Thuộc Bộ Bảo Mật MCP

| Dự án | Lĩnh vực | Công cụ |
|-------|---------|---------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Kiểm tra bảo mật qua trình duyệt | 39 công cụ, Firefox, kiểm tra injection |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bảo mật cloud (AWS/Azure/GCP) | 38 công cụ, 60+ kiểm tra |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Bảo mật GitHub | 39 công cụ, 45 kiểm tra |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Tình báo lỗ hổng | 23 công cụ, 5 nguồn |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT & trinh sát | 37 công cụ, 12 nguồn |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web & tình báo mối đe dọa | 66 công cụ, 16 nguồn |
| **fingerprint-mcp** | **Lấy dấu vân tay kỹ thuật số toàn diện** | **13 công cụ, 103 kỹ thuật, 21 nhà cung cấp** |

---

<p align="center">
<b>Chỉ dành cho kiểm tra và đánh giá bảo mật được ủy quyền.</b><br>
Luôn đảm bảo bạn có sự ủy quyền phù hợp trước khi thực hiện lấy dấu vân tay trên bất kỳ mục tiêu nào.
</p>

<p align="center">
  <a href="LICENSE">Giấy phép AGPL-3.0</a> &bull; Xây dựng với Bun + TypeScript
</p>
