<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <strong>繁體中文</strong> |
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

<h3 align="center">面向 AI 智能代理的通用數位指紋辨識。</h3>

<p align="center">
  TCP、TLS/SSL、SSH、HTTP、DNS、WAF/CDN、IoT、SMTP、服務探測、JARM、JA4X、favicon 雜湊、基礎設施拓撲、C2 偵測、OSINT 情報強化 &mdash; 統一整合至單一 MCP 伺服器。<br>
  您的 AI 智能代理可以<b>按需取得全頻譜指紋辨識能力</b>，而非使用 11 個互不相關的 CLI 工具並手動關聯資料。
</p>

<br>

<p align="center">
  <a href="#問題所在">問題所在</a> &bull;
  <a href="#差異化優勢">差異化優勢</a> &bull;
  <a href="#快速開始">快速開始</a> &bull;
  <a href="#ai-能做什麼">AI 能做什麼</a> &bull;
  <a href="#工具參考13-個工具103-項技術">工具 (13)</a> &bull;
  <a href="#資料來源21-個">資料來源</a> &bull;
  <a href="#架構">架構</a> &bull;
  <a href="CHANGELOG.md">更新日誌</a> &bull;
  <a href="CONTRIBUTING.md">參與貢獻</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="授權"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 個工具">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 項技術">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp 展示" width="800">
</p>

---

## 問題所在

現今對伺服器進行指紋辨識意味著需要同時使用十幾種互不相關的工具。你需要執行 `nmap` 進行連接埠掃描、`testssl.sh` 進行憑證分析、`curl -I` 取得 HTTP 標頭、`dig` 查詢 DNS、`wafw00f` 偵測 WAF、`ssh-audit` 審計 SSH，還有單獨的 JARM 工具、Wappalyzer 偵測技術堆疊 &mdash; 然後你需要花 30 分鐘在試算表中手動交叉比對所有結果，才能釐清目標到底執行著什麼。

```
傳統指紋辨識工作流程：
  分析 TLS 憑證              ->  testssl.sh / openssl s_client
  擷取 HTTP 標頭             ->  curl -I
  偵測 Web 技術              ->  wappalyzer CLI
  DNS 偵察                   ->  dig / nslookup / dnsenum
  連接埠掃描                 ->  nmap -sV
  WAF 偵測                   ->  wafw00f
  SSH 審計                   ->  ssh-audit
  服務指紋辨識               ->  nmap scripts
  JARM 指紋                  ->  jarm（單獨工具）
  查詢 OSINT 資料庫          ->  shodan CLI, censys CLI
  關聯所有結果               ->  手動在試算表中操作
  ──────────────────────────────
  合計：11 個工具，30+ 分鐘，手動關聯
```

**fingerprint-mcp** 透過 [Model Context Protocol](https://modelcontextprotocol.io) 為您的 AI 智能代理提供 13 個複合工具，封裝了來自 21 個提供者的 103 項指紋辨識技術。智能代理可以並行執行多層指紋辨識，跨 TCP/TLS/HTTP/DNS/SSH 層關聯訊號，偵測蜜罐和 C2 基礎設施，並呈現統一的情報視圖 &mdash; 一切都在一次對話中完成。

```
使用 fingerprint-mcp：
  你：「對 target.com 進行深度偵察」

  智能代理：-> recon {url: "https://target.com", depth: "deep"}

           -> TLS：nginx/1.24.0（透過 JARM (3fd21b20d00000...)），
              Let's Encrypt 憑證，2 個 SAN，TLS 1.2+1.3
           -> HTTP：Cloudflare WAF 後的 Express.js，
              React SPA，Google Analytics，分析了 14 個安全標頭
           -> DNS：A/AAAA/MX/TXT 記錄，SPF/DKIM/DMARC 已設定，
              透過 CNAME/MX 偵測到 Slack + Google Workspace
           -> 連接埠：80、443、22 (OpenSSH 9.6)、8080（開發伺服器）
           -> WAF：偵測到 Cloudflare，透過直接連線發現源站 IP
           -> 列舉：透過 CT 日誌發現 12 個子網域，偵測到萬用字元 DNS
           -> "target.com 執行 nginx/1.24.0 + Express.js，位於
              Cloudflare WAF 之後。源站 IP 203.0.113.42 暴露在
              8080 連接埠。TLS 設定正確（等效 A+），但 8080 上的
              開發伺服器沒有 WAF 保護。3 個子網域指向已棄用的
              基礎設施 — 存在接管風險。"
```

---

## 差異化優勢

現有工具一次只能在一個層面提供原始資料。fingerprint-mcp 賦予你的 AI 智能代理**同時跨所有指紋辨識層進行推理**的能力。

<table>
<thead>
<tr>
<th></th>
<th>傳統方式</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>介面</b></td>
<td>11 種不同的 CLI 工具，輸出格式各異</td>
<td>MCP &mdash; AI 智能代理以對話方式呼叫工具</td>
</tr>
<tr>
<td><b>技術</b></td>
<td>一次一個工具、一個層面</td>
<td>103 項技術，來自 21 個提供者，並行執行</td>
</tr>
<tr>
<td><b>TLS 分析</b></td>
<td>testssl.sh 輸出，手動單獨解析 JARM</td>
<td>智能代理在一次呼叫中整合憑證 + JARM + JA4X + 加密套件 + SNI + CT 日誌</td>
</tr>
<tr>
<td><b>關聯</b></td>
<td>將結果複製貼上到試算表</td>
<td>智能代理交叉關聯：「JARM 符合已知 C2 框架，HTTP 計時確認蜜罐」</td>
</tr>
<tr>
<td><b>WAF 繞過</b></td>
<td>wafw00f 偵測到 WAF，你手動尋找源站</td>
<td>智能代理偵測 WAF、發現源站 IP，並驗證其提供相同內容</td>
</tr>
<tr>
<td><b>API 金鑰</b></td>
<td>Shodan、Censys 等需要金鑰</td>
<td>80+ 項主動技術無需任何 API 金鑰；金鑰可解鎖 OSINT 情報強化</td>
</tr>
<tr>
<td><b>安裝</b></td>
<td>安裝 nmap、testssl、wafw00f、ssh-audit、jarm、wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; 一條指令，零設定</td>
</tr>
</tbody>
</table>

---

## 快速開始

### 方式一：npx（免安裝）

```bash
npx fingerprint-mcp
```

所有 80+ 項主動指紋辨識技術立即可用。TCP、TLS、SSH、HTTP、DNS、WAF、路徑、服務、計時、IoT、SMTP、基礎設施和應用程式指紋辨識均無需 API 金鑰。

### 方式二：複製儲存庫

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### 環境變數（選用）

```bash
# OSINT 情報強化（全部選用 — 主動指紋辨識無需任何金鑰即可運作）
export SHODAN_API_KEY=your-key           # 啟用 osint_shodan、ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # 啟用 osint_censys（免費：250 次查詢/月）
export CENSYS_API_SECRET=your-secret     # Censys API 密鑰
export SECURITYTRAILS_API_KEY=your-key   # 啟用 waf_origin、enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # 啟用 osint_virustotal（免費：500 次查詢/天）
```

所有 API 金鑰均為選用。沒有金鑰，你仍然可以使用完整的 TCP/TLS/SSH/HTTP/DNS/WAF/路徑/服務/計時/IoT/SMTP/基礎設施/應用程式指紋辨識、關聯、被動分析、列舉和中繼資料工具 &mdash; 80+ 項技術透過直接探測目標運作。

### 連接你的 AI 智能代理

<details open>
<summary><b>Claude Code</b></summary>

```bash
# 使用 npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# 使用本機複製
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

新增至 `~/Library/Application Support/Claude/claude_desktop_config.json`：

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
<summary><b>Cursor / Windsurf / 其他 MCP 用戶端</b></summary>

相同的 JSON 設定格式。將指令指向 `npx fingerprint-mcp` 或你的本機安裝路徑。

</details>

### 開始查詢

```
你：「對 target.com 的所有內容進行指紋辨識 — TLS、HTTP 堆疊、WAF、DNS、開放連接埠」
```

就是這樣。智能代理會自動處理多層指紋辨識、訊號關聯和基礎設施分析。

---

## AI 能做什麼

### 快速偵察

```
你：「快速偵察 target.com」

智能代理：-> recon {url: "https://target.com", depth: "quick"}

         -> TCP：連接埠 80、443、22 開放
         -> TLS：Let's Encrypt RSA 憑證，TLS 1.2+1.3，nginx JARM 簽章
         -> HTTP：nginx/1.24.0，Express.js，React，Cloudflare CDN
         -> DNS：A 203.0.113.42，MX Google Workspace，SPF/DKIM 已設定
         -> WAF：偵測到 Cloudflare（cf-ray 標頭）
         -> "target.com 是一個 React SPA，執行在 Express.js 上，
            位於 nginx/1.24.0 之後，透過 Cloudflare CDN 提供服務。
            TLS 使用 Let's Encrypt 正確設定。SSH 在 22 連接埠執行
            OpenSSH 9.6。郵件由 Google Workspace 處理，完整設定了
            SPF/DKIM/DMARC。"
```

### 深度 TLS 調查

```
你：「詳細分析 suspicious-server.com 的 TLS 設定」

智能代理：-> scan_tls {host: "suspicious-server.com"}

         -> 憑證：自簽名，CN=localhost，已過期 47 天
         -> JARM：2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
            （符合 Cobalt Strike 預設設定）
         -> JA4X：指紋符合已知 C2 框架模式
         -> 加密套件：接受弱加密（RC4、3DES）
         -> SNI：對任何 SNI 值回應相同
         -> CT 日誌：憑證未記錄（非公開信任）
         -> "高風險：TLS 設定強烈表明這是 C2 基礎設施。
            自簽名過期憑證，JARM 指紋符合 Cobalt Strike，
            接受弱加密，對任意 SNI 值回應。
            建議立即調查並封鎖。"
```

### WAF 繞過與源站發現

```
你：「target.com 位於 WAF 後面。你能找到源站伺服器嗎？」

智能代理：-> scan_waf {url: "https://target.com"}
         -> scan_dns {domain: "target.com"}
         -> enumerate {domain: "target.com"}

         -> WAF：Cloudflare (AS13335)，對可疑請求顯示驗證頁面
         -> DNS：A 記錄指向 Cloudflare IP 104.21.x.x
         -> 子網域：dev.target.com 解析到 203.0.113.42（非 Cloudflare）
         -> 直接連線 203.0.113.42:443 回傳相同 TLS 憑證
         -> SecurityTrails 歷史記錄：Cloudflare 之前源站為 203.0.113.42
         -> "已找到源站 IP：203.0.113.42。透過 dev.target.com
            子網域發現，該子網域繞過了 Cloudflare。源站提供相同的
            TLS 憑證並回應 target.com 的 Host 標頭。
            源站沒有 WAF 保護 — 可以直接存取。"
```

### 主機上的服務發現

```
你：「10.0.1.50 上執行著哪些服務？」

智能代理：-> scan_ports {host: "10.0.1.50"}
         -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

         -> 連接埠 22：OpenSSH 8.9p1 Ubuntu，ED25519 主機金鑰
         -> 連接埠 80：Apache/2.4.57，PHP/8.2，WordPress 6.4
         -> 連接埠 3306：MySQL 8.0.36，需要驗證
         -> 連接埠 5432：PostgreSQL 16.1，需要 SSL
         -> 連接埠 6379：Redis 7.2.4，無驗證（開放）
         -> 連接埠 8080：Node.js Express 開發伺服器，CORS: *
         -> "嚴重：6379 連接埠的 Redis 無需驗證 — 網路上的任何人
            都可以讀寫資料。8080 上的 Express 開發伺服器
            具有萬用字元 CORS。MySQL 和 PostgreSQL 正確要求驗證。
            WordPress 落後 2 個小版本。需要立即處理
            Redis 和開發伺服器暴露問題。"
```

---

## 工具參考（13 個工具，103 項技術）

<details open>
<summary><b>recon &mdash; 基於深度層級選擇技術的全面偵察</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `url` | string | 目標指紋辨識 URL |
| `depth` | `quick` \| `standard` \| `deep` | 掃描深度：quick=5 項技術，standard=20，deep=50+ |

根據深度層級編排所有提供者的技術。快速模式提供快速概覽；深度模式執行全面指紋辨識，包括列舉、OSINT 和關聯。

</details>

<details>
<summary><b>scan_ports &mdash; TCP 連接埠掃描與服務偵測（3 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `host` | string | 目標主機（IP 或網域） |
| `ports` | number[] | 選用 &mdash; 指定掃描連接埠（預設為常用連接埠） |

| 技術 | 描述 |
|------|------|
| `tcp_probe` | TCP 連線掃描以偵測開放連接埠 |
| `tcp_banner` | 對開放連接埠進行 Banner 擷取以辨識服務 |
| `tcp_analysis` | 連接埠組合分析和服務推斷 |

</details>

<details>
<summary><b>scan_tls &mdash; 完整 TLS/SSL 分析（8 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `host` | string | 目標主機（IP 或網域） |
| `port` | number | 選用 &mdash; TLS 連接埠（預設：443） |

| 技術 | 描述 |
|------|------|
| `tls_certificate` | X.509 憑證解析 &mdash; 主體、簽發者、SAN、有效期、憑證鏈 |
| `tls_jarm` | JARM 主動指紋辨識 &mdash; 10 個 TLS Client Hello 探測，62 字元雜湊 |
| `tls_ja4x` | JA4X 基於憑證屬性的被動 TLS 指紋辨識 |
| `tls_ciphers` | 加密套件列舉和強度分析 |
| `tls_protocols` | 支援的 TLS 協定版本偵測（SSLv3 到 TLS 1.3） |
| `tls_sni` | SNI 行為測試 &mdash; 預設憑證與請求的主機名稱對比 |
| `tls_ct_logs` | 透過 crt.sh 查詢憑證透明度日誌 |
| `tls_ocsp` | OCSP 裝訂和撤銷狀態檢查 |

</details>

<details>
<summary><b>scan_dns &mdash; DNS 情報（7 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `domain` | string | 目標網域 |

| 技術 | 描述 |
|------|------|
| `dns_records` | 完整記錄列舉 &mdash; A、AAAA、MX、NS、TXT、CNAME、SOA |
| `dns_email_auth` | SPF、DKIM 和 DMARC 記錄分析 |
| `dns_saas` | 透過 CNAME 和 MX 模式偵測 SaaS/服務（Slack、Zendesk 等） |
| `dns_server` | DNS 伺服器指紋辨識（BIND、PowerDNS、Cloudflare 等） |
| `dns_takeover` | 透過懸空 CNAME 分析偵測子網域接管 |
| `dns_zone` | 區域傳送嘗試 (AXFR) |
| `dns_caa` | CAA 記錄分析，用於憑證授權機構限制 |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/Web 指紋辨識（29 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `url` | string | 目標 URL |

| 技術 | 提供者 | 描述 |
|------|--------|------|
| `http_headers` | HTTP | 回應標頭分析和伺服器辨識 |
| `http_header_order` | HTTP | 標頭排序指紋（伺服器軟體簽章） |
| `http_security_headers` | HTTP | 安全標頭稽核（CSP、HSTS、X-Frame-Options 等） |
| `http_cookies` | HTTP | Cookie 分析 &mdash; 旗標、前綴、框架偵測 |
| `http_methods` | HTTP | 允許的 HTTP 方法列舉 (OPTIONS) |
| `http_cors` | HTTP | CORS 政策分析和錯誤設定偵測 |
| `http_compression` | HTTP | 支援的壓縮演算法（gzip、br、zstd） |
| `http_caching` | HTTP | 快取標頭分析（CDN、反向代理偵測） |
| `http_etag` | HTTP | ETag 格式分析，用於後端辨識 |
| `http_error` | HTTP | 錯誤頁面指紋辨識（自訂與預設錯誤頁面） |
| `http_redirect` | HTTP | 重新導向鏈分析 |
| `http_timing` | HTTP | 回應計時基線，用於伺服器效能分析 |
| `http_favicon` | HTTP | Favicon 雜湊 (MurmurHash3)，用於技術辨識 |
| `http_robots` | HTTP | robots.txt 解析和禁止路徑擷取 |
| `http_sitemap` | HTTP | 網站地圖發現和 URL 擷取 |
| `http_wellknown` | HTTP | .well-known 端點發現（security.txt、openid 等） |
| `web_tech` | Web | 透過 HTML/JS/CSS 模式進行技術偵測 |
| `web_analytics` | Web | 分析和追蹤服務偵測 |
| `web_sourcemaps` | Web | Source map 檔案發現 |
| `web_websocket` | Web | WebSocket 端點偵測 |
| `web_graphql` | Web | GraphQL 端點偵測和內省 |
| `web_spa` | Web | 單頁應用程式框架偵測 |
| `web_cdn` | Web | 透過回應標頭和 DNS 進行 CDN 偵測 |
| `web_meta` | Web | HTML meta 標籤分析（產生器、框架提示） |
| `web_feed` | Web | RSS/Atom 訂閱來源發現 |
| `h2_detect` | HTTP/2 | HTTP/2 協定支援偵測 |
| `h2_fingerprint` | HTTP/2 | HTTP/2 伺服器指紋辨識（SETTINGS、WINDOW_UPDATE） |
| `h2_h3` | HTTP/2 | 透過 Alt-Svc 標頭偵測 HTTP/3 (QUIC) 支援 |
| `app_cms` | Application | CMS 偵測（WordPress、Drupal、Joomla 等） |

</details>

<details>
<summary><b>scan_paths &mdash; 路徑情報（5 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `url` | string | 目標 URL |
| `categories` | string[] | 選用 &mdash; 要檢查的類別（sensitive、git、debug、api、config） |

| 技術 | 描述 |
|------|------|
| `path_sensitive` | 敏感檔案發現（備份檔案、設定檔、資料庫傾印） |
| `path_robots` | robots.txt 和 sitemap.xml 分析以發現隱藏路徑 |
| `path_git` | Git 儲存庫洩漏偵測（.git/HEAD、.git/config） |
| `path_debug` | 除錯端點發現（phpinfo、server-status、除錯主控台） |
| `path_api` | API 版本和文件端點發現 |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN 偵測與指紋辨識（4 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `url` | string | 目標 URL |

| 技術 | 描述 |
|------|------|
| `waf_detect` | 透過回應標頭和行為分析偵測 WAF 存在 |
| `waf_cdn` | CDN 提供者辨識（Cloudflare、Akamai、Fastly 等） |
| `waf_fingerprint` | WAF 產品辨識和版本偵測 |
| `waf_origin` | WAF/CDN 後的源站 IP 發現（需要 `SECURITYTRAILS_API_KEY`） |

</details>

<details>
<summary><b>scan_services &mdash; 服務層級探測（12 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `host` | string | 目標主機（IP 或網域） |
| `ports` | number[] | 選用 &mdash; 指定探測連接埠 |
| `service` | string | 選用 &mdash; 指定探測服務（mysql、postgres、redis、ftp、ssh、smtp、vnc、iot） |

| 技術 | 提供者 | 描述 |
|------|--------|------|
| `ssh_probe` | SSH | SSH 協定版本和軟體偵測 |
| `ssh_algorithms` | SSH | SSH 演算法稽核（KEX、加密、MAC、主機金鑰類型） |
| `ssh_hostkey_lookup` | SSH | 透過 Shodan 查詢 SSH 主機金鑰（需要 `SHODAN_API_KEY`） |
| `svc_mysql` | Service | MySQL 版本偵測和功能指紋辨識 |
| `svc_postgres` | Service | PostgreSQL 版本偵測和 SSL 支援檢查 |
| `svc_redis` | Service | Redis 版本偵測和驗證狀態 |
| `svc_ftp` | Service | FTP Banner 分析和匿名登入檢查 |
| `svc_vnc_rdp` | Service | VNC/RDP 服務偵測和安全評估 |
| `smtp_banner` | SMTP | SMTP Banner 分析和 MTA 辨識 |
| `smtp_starttls` | SMTP | SMTP STARTTLS 支援和憑證檢查 |
| `iot_detect` | IoT | 透過 Banner 模式和預設頁面偵測 IoT 裝置 |
| `iot_upnp` | IoT | 區域網路上的 UPnP/SSDP 裝置發現 |

</details>

<details>
<summary><b>enumerate &mdash; 範圍擴展（8 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `domain` | string | 目標網域 |

| 技術 | 描述 |
|------|------|
| `enum_subdomains` | 透過多種方法列舉子網域 |
| `enum_wildcard` | 萬用字元 DNS 偵測 |
| `enum_tld` | TLD 擴展（target.com -> target.net、target.org 等） |
| `enum_related` | 透過共享基礎設施發現相關網域 |
| `enum_asn` | ASN 鄰居發現 &mdash; 同一網路上的其他網域 |
| `enum_ct` | 憑證透明度日誌子網域擷取 |
| `enum_passive_dns` | 被動 DNS 歷史（需要 `SECURITYTRAILS_API_KEY`） |
| `enum_scope` | 範圍摘要和攻擊面概覽 |

</details>

<details>
<summary><b>osint &mdash; OSINT 情報強化（6 項技術）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `target` | string | 要強化的 IP 位址或網域 |
| `type` | `ip` \| `domain` | 選用 &mdash; 目標類型（省略時自動偵測） |

| 技術 | 驗證 | 描述 |
|------|------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan 主機查詢 &mdash; 開放連接埠、Banner、漏洞、作業系統 |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys 主機資料 &mdash; 服務、TLS、自治系統 |
| `osint_reverse_ip` | 無 | 反向 IP 查詢 &mdash; 同一 IP 上的其他網域 |
| `osint_whois` | 無 | WHOIS 註冊資料 &mdash; 註冊商、日期、網域伺服器 |
| `osint_webarchive` | 無 | Web Archive 歷史 &mdash; 首次/最後快照、變更頻率 |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal 網域/IP 報告 &mdash; 偵測結果、分類、DNS |

</details>

<details>
<summary><b>analyze &mdash; 被動指紋分析（3 種模式）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `type` | `headers` \| `html` \| `banner` | 要分析的資料類型 |
| `data` | string | 要分析的原始資料（貼上標頭、HTML 或 Banner 輸出） |

| 模式 | 描述 |
|------|------|
| `fp_analyze_headers` | 被動 HTTP 標頭分析 &mdash; 無需傳送流量即可進行伺服器、框架、代理偵測 |
| `fp_analyze_html` | 被動 HTML 分析 &mdash; 從原始碼進行技術偵測、框架辨識 |
| `fp_analyze_banner` | 被動 Banner 分析 &mdash; 從原始 Banner 文字進行服務辨識 |

</details>

<details>
<summary><b>correlate &mdash; 多訊號關聯引擎（7 種模式）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | 關聯模式 |
| `signals` | object | 要關聯的指紋訊號（因模式而異） |

| 模式 | 描述 |
|------|------|
| `fp_consistency` | 跨層訊號一致性檢查 &mdash; TCP、TLS、HTTP 和 DNS 指紋是否一致？ |
| `fp_honeypot` | 蜜罐偵測 &mdash; 檢查不可能的服務組合和行為異常 |
| `fp_spoofing` | 偽裝偵測 &mdash; 辨識伺服器標頭與實際行為的不符 |
| `fp_compare` | 兩台主機指紋設定的並排比較 |
| `fp_topology` | 基礎設施拓撲對映 &mdash; CDN、負載平衡器、反向代理鏈 |
| `fp_c2` | 透過 JARM、TLS、HTTP 和計時關聯進行 C2 框架偵測 |
| `fp_identify` | 基於雜湊的已知簽章資料庫辨識 |

</details>

<details>
<summary><b>meta &mdash; 伺服器設定和資料（3 種模式）</b></summary>

| 參數 | 類型 | 描述 |
|------|------|------|
| `category` | string | 選用 &mdash; 按類別篩選 |

| 模式 | 描述 |
|------|------|
| `fp_sources` | 列出所有可用資料來源及其設定和 API 金鑰狀態 |
| `fp_config` | 伺服器設定 &mdash; 版本、已載入的提供者、技術計數 |
| `fp_signatures` | 簽章資料庫清單 &mdash; JARM、Banner、WAF、應用程式簽章 |

</details>

---

### CLI 用法

```bash
# 列出所有可用的工具和技術
npx fingerprint-mcp --list

# 直接執行任意工具
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

# OSINT 工具（需要 API 金鑰）
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## 資料來源（21 個）

| 資料來源 | 驗證 | 提供的功能 |
|----------|------|-----------|
| TCP 探測 | 無 | 連接埠掃描、Banner 擷取、服務偵測 |
| TLS/SSL 分析 | 無 | 憑證解析、JARM 指紋辨識、JA4X、加密列舉、SNI 測試 |
| SSH 探測 | 無 | 協定版本、演算法稽核、軟體偵測 |
| HTTP 分析 | 無 | 標頭指紋辨識、favicon 雜湊、Cookie 分析、方法列舉、CORS |
| Web 偵測 | 無 | 技術偵測、分析、Source map、WebSocket、GraphQL、SPA 框架 |
| 路徑發現 | 無 | 敏感檔案、Git 洩漏、除錯端點、API 版本、robots.txt |
| DNS 解析 | 無 | 記錄列舉、郵件驗證分析、SaaS 偵測、伺服器指紋辨識 |
| WAF/CDN 偵測 | 無 | WAF 辨識、CDN 偵測、WAF 指紋辨識 |
| 計時分析 | 無 | 回應計時基線、時鐘偏差偵測 |
| HTTP/2 & HTTP/3 | 無 | HTTP/2 偵測和指紋辨識、HTTP/3 Alt-Svc 發現 |
| SMTP 探測 | 無 | SMTP Banner 分析、STARTTLS 檢查 |
| IoT/嵌入式 | 無 | IoT 裝置偵測、UPnP/SSDP 發現 |
| 應用偵測 | 無 | CMS、框架和電商平台辨識 |
| 服務探測 | 無 | MySQL、PostgreSQL、Redis、FTP、VNC/RDP 指紋辨識 |
| 基礎設施偵測 | 無 | 雲端提供者、主機代管提供者、CDN 辨識 |
| 關聯引擎 | 無 | 訊號一致性、蜜罐偵測、偽裝偵測、拓撲對映 |
| 辨識引擎 | 無 | 基於雜湊的辨識、C2 偵測、簽章比對 |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | 主機情報 &mdash; 開放連接埠、Banner、漏洞、作業系統偵測 |
| [Censys](https://censys.io) | `CENSYS_API_ID` | 主機資料 &mdash; 服務、TLS 憑證、自治系統資訊 |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF 源站發現、被動 DNS 歷史、歷史記錄 |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | 網域/IP 信譽、偵測結果、DNS 歷史、分類 |

---

## 架構

```
src/
  index.ts                # CLI 進入點（--help、--list、--tool、stdio 伺服器）
  protocol/
    mcp-server.ts         # MCP 伺服器設定（stdio 傳輸）
    tools.ts              # 工具註冊表 — 所有 13 個複合工具在此註冊
  types/
    index.ts              # 共享類型（ToolDef、ToolContext、ToolResult）
  utils/
    rate-limiter.ts       # 按提供者的速率限制器
    cache.ts              # API 回應的 TTL 快取
    require-key.ts        # API 金鑰驗證輔助程式
    murmurhash3.ts        # 用於 favicon 雜湊的 MurmurHash3
  composite/              # 13 個複合工具編排器
    recon.ts              # 全面偵察編排器（quick/standard/deep）
    scan-ports.ts         # 連接埠掃描複合
    scan-tls.ts           # TLS 分析複合
    scan-dns.ts           # DNS 情報複合
    scan-http.ts          # HTTP 指紋辨識複合
    scan-paths.ts         # 路徑發現複合
    scan-waf.ts           # WAF/CDN 偵測複合
    scan-services.ts      # 服務探測複合
    analyze.ts            # 被動分析複合
    correlate.ts          # 關聯引擎複合
    enumerate.ts          # 範圍擴展複合
    osint.ts              # OSINT 情報強化複合
    meta.ts               # 伺服器中繼資料複合
    helpers.ts            # 共享複合輔助程式
  tcp/                    # TCP 探測技術 (3)
  tls/                    # TLS/SSL 分析技術 (8)
  ssh/                    # SSH 探測技術 (3)
  http/                   # HTTP 指紋辨識技術 (16)
  web/                    # Web 技術偵測技術 (9)
  path/                   # 路徑發現技術 (5)
  dns/                    # DNS 情報技術 (7)
  waf/                    # WAF/CDN 偵測技術 (4)
  timing/                 # 計時分析技術 (2)
  h2/                     # HTTP/2 & HTTP/3 技術 (3)
  smtp/                   # SMTP 探測技術 (2)
  iot/                    # IoT/嵌入式偵測技術 (2)
  app/                    # 應用偵測技術 (3)
  service/                # 服務探測技術 (5)
  infra/                  # 基礎設施偵測技術 (3)
  correlation/            # 關聯引擎 (5)
  identify/               # 辨識引擎 (3)
  passive/                # 被動分析 (3)
  osint/                  # OSINT 情報強化技術 (6)
  enum/                   # 列舉技術 (8)
  meta/                   # 中繼資料工具 (3)
  data/                   # 簽章資料庫和模式庫
    jarm-signatures.ts    # 已知 JARM 指紋（C2、伺服器、CDN）
    waf-signatures.ts     # WAF 偵測簽章
    service-banners.ts    # 服務 Banner 模式
    tech-patterns.ts      # 技術偵測模式
    favicon-hashes.ts     # 已知 favicon MurmurHash3 值
    c2-signatures.ts      # C2 框架簽章
    ...                   # 15+ 簽章/模式資料庫
```

**設計決策：**

- **13 個複合工具，103 項技術** &mdash; 智能代理呼叫高階工具（`recon`、`scan_tls`、`scan_http`）。每個複合工具編排多個底層技術並回傳關聯結果。這減少了工具呼叫開銷，同時保持了粒度。
- **21 個提供者，1 個伺服器** &mdash; 每個指紋辨識層都是獨立模組。複合編排器根據上下文和深度選擇技術。
- **主動優先，OSINT 選用** &mdash; 80+ 項技術透過直接探測目標運作，無需任何 API 金鑰。OSINT 提供者（Shodan、Censys、VirusTotal、SecurityTrails）增加情報強化，但從不是必需的。
- **按提供者的速率限制器** &mdash; 每個提供者擁有自己的 `RateLimiter` 實例。主動探測有速率限制以避免被偵測；OSINT API 根據其配額進行校準。
- **TTL 快取** &mdash; DNS 記錄（10 分鐘）、OSINT 結果（15 分鐘）、CT 日誌（30 分鐘）被快取，以避免多工具工作流程中的冗餘查詢。
- **優雅降級** &mdash; 缺少 API 金鑰不會導致伺服器當機。OSINT 工具回傳描述性訊息：「設定 SHODAN_API_KEY 以啟用 Shodan 主機查詢。」
- **3 個相依性** &mdash; `@modelcontextprotocol/sdk`、`zod` 和 `cheerio`。所有網路 I/O 透過原生 `fetch()` 和 Node.js `net`/`tls`/`dns` 模組。沒有 nmap，沒有外部二進位檔。

---

## 限制

- OSINT 工具（Shodan、Censys、VirusTotal、SecurityTrails）需要各自的 API 金鑰
- Censys 免費方案限制為每月 250 次查詢
- VirusTotal 免費方案限制為每天 500 次查詢
- 連接埠掃描使用 TCP connect（非 SYN 掃描）&mdash; 比 nmap 隱蔽性低，但不需要 root 權限
- JARM 指紋辨識需要直接 TCP 存取目標（可能被防火牆阻擋）
- UPnP/SSDP 發現僅在區域網路有效
- 服務探測（MySQL、PostgreSQL、Redis）連線但不進行驗證
- 子網域列舉依賴 CT 日誌和被動來源（無暴力破解）
- macOS / Linux 已測試（Windows 未測試）

---

## MCP 安全套件

| 專案 | 領域 | 工具 |
|------|------|------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 基於瀏覽器的安全測試 | 39 個工具，Firefox，注入測試 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 雲端安全（AWS/Azure/GCP） | 38 個工具，60+ 項檢查 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 安全態勢 | 39 個工具，45 項檢查 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 漏洞情報 | 23 個工具，5 個來源 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT 與偵察 | 37 個工具，12 個來源 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 暗網與威脅情報 | 66 個工具，16 個來源 |
| **fingerprint-mcp** | **通用數位指紋辨識** | **13 個工具，103 項技術，21 個提供者** |

---

<p align="center">
<b>僅用於授權的安全測試和評估。</b><br>
在對任何目標執行指紋辨識之前，請始終確保您已取得適當的授權。
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 授權</a> &bull; 使用 Bun + TypeScript 建構
</p>
