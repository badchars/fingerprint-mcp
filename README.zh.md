<p align="center">
  <a href="README.md">English</a> |
  <strong>简体中文</strong> |
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

<h3 align="center">面向 AI 智能体的通用数字指纹识别。</h3>

<p align="center">
  TCP、TLS/SSL、SSH、HTTP、DNS、WAF/CDN、IoT、SMTP、服务探测、JARM、JA4X、favicon 哈希、基础设施拓扑、C2 检测、OSINT 情报富化 &mdash; 统一集成到单一 MCP 服务器中。<br>
  您的 AI 智能体可以<b>按需获取全谱指纹识别能力</b>，而不是使用 11 个互不关联的 CLI 工具并手动关联数据。
</p>

<br>

<p align="center">
  <a href="#问题所在">问题所在</a> &bull;
  <a href="#差异化优势">差异化优势</a> &bull;
  <a href="#快速开始">快速开始</a> &bull;
  <a href="#ai-能做什么">AI 能做什么</a> &bull;
  <a href="#工具参考13-个工具103-项技术">工具 (13)</a> &bull;
  <a href="#数据源21-个">数据源</a> &bull;
  <a href="#架构">架构</a> &bull;
  <a href="CHANGELOG.md">更新日志</a> &bull;
  <a href="CONTRIBUTING.md">参与贡献</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="许可证"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 个工具">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 项技术">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp 演示" width="800">
</p>

---

## 问题所在

当前对服务器进行指纹识别意味着需要同时使用十几种互不关联的工具。你需要运行 `nmap` 进行端口扫描、`testssl.sh` 进行证书分析、`curl -I` 获取 HTTP 头、`dig` 查询 DNS、`wafw00f` 检测 WAF、`ssh-audit` 审计 SSH，还有单独的 JARM 工具、Wappalyzer 检测技术栈 &mdash; 然后你需要花 30 分钟在电子表格中手动交叉比对所有结果，才能弄清楚目标到底运行着什么。

```
传统指纹识别工作流：
  分析 TLS 证书              ->  testssl.sh / openssl s_client
  抓取 HTTP 头               ->  curl -I
  检测 Web 技术              ->  wappalyzer CLI
  DNS 侦察                   ->  dig / nslookup / dnsenum
  端口扫描                   ->  nmap -sV
  WAF 检测                   ->  wafw00f
  SSH 审计                   ->  ssh-audit
  服务指纹识别               ->  nmap scripts
  JARM 指纹                  ->  jarm（单独工具）
  查询 OSINT 数据库          ->  shodan CLI, censys CLI
  关联所有结果               ->  手动在电子表格中操作
  ──────────────────────────────
  合计：11 个工具，30+ 分钟，手动关联
```

**fingerprint-mcp** 通过 [Model Context Protocol](https://modelcontextprotocol.io) 为您的 AI 智能体提供 13 个复合工具，封装了来自 21 个提供商的 103 项指纹识别技术。智能体可以并行执行多层指纹识别，跨 TCP/TLS/HTTP/DNS/SSH 层关联信号，检测蜜罐和 C2 基础设施，并呈现统一的情报视图 &mdash; 一切都在一次对话中完成。

```
使用 fingerprint-mcp：
  你："对 target.com 进行深度侦察"

  智能体：-> recon {url: "https://target.com", depth: "deep"}

         -> TLS：nginx/1.24.0（通过 JARM (3fd21b20d00000...)），
            Let's Encrypt 证书，2 个 SAN，TLS 1.2+1.3
         -> HTTP：Cloudflare WAF 后的 Express.js，
            React SPA，Google Analytics，分析了 14 个安全头
         -> DNS：A/AAAA/MX/TXT 记录，SPF/DKIM/DMARC 已配置，
            通过 CNAME/MX 检测到 Slack + Google Workspace
         -> 端口：80、443、22 (OpenSSH 9.6)、8080（开发服务器）
         -> WAF：检测到 Cloudflare，通过直接连接发现源站 IP
         -> 枚举：通过 CT 日志发现 12 个子域名，检测到通配符 DNS
         -> "target.com 运行 nginx/1.24.0 + Express.js，位于
            Cloudflare WAF 之后。源站 IP 203.0.113.42 暴露在
            8080 端口。TLS 配置正确（等效 A+），但 8080 上的
            开发服务器没有 WAF 保护。3 个子域名指向已废弃的
            基础设施 — 存在接管风险。"
```

---

## 差异化优势

现有工具一次只能在一个层面提供原始数据。fingerprint-mcp 赋予你的 AI 智能体**同时跨所有指纹识别层进行推理**的能力。

<table>
<thead>
<tr>
<th></th>
<th>传统方式</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>接口</b></td>
<td>11 种不同的 CLI 工具，输出格式各异</td>
<td>MCP &mdash; AI 智能体以对话方式调用工具</td>
</tr>
<tr>
<td><b>技术</b></td>
<td>一次一个工具、一个层面</td>
<td>103 项技术，来自 21 个提供商，并行执行</td>
</tr>
<tr>
<td><b>TLS 分析</b></td>
<td>testssl.sh 输出，手动单独解析 JARM</td>
<td>智能体在一次调用中整合证书 + JARM + JA4X + 密码套件 + SNI + CT 日志</td>
</tr>
<tr>
<td><b>关联</b></td>
<td>将结果复制粘贴到电子表格</td>
<td>智能体交叉关联："JARM 匹配已知 C2 框架，HTTP 时序确认蜜罐"</td>
</tr>
<tr>
<td><b>WAF 绕过</b></td>
<td>wafw00f 检测到 WAF，你手动寻找源站</td>
<td>智能体检测 WAF、发现源站 IP，并验证其提供相同内容</td>
</tr>
<tr>
<td><b>API 密钥</b></td>
<td>Shodan、Censys 等需要密钥</td>
<td>80+ 项主动技术无需任何 API 密钥；密钥可解锁 OSINT 情报富化</td>
</tr>
<tr>
<td><b>安装</b></td>
<td>安装 nmap、testssl、wafw00f、ssh-audit、jarm、wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; 一条命令，零配置</td>
</tr>
</tbody>
</table>

---

## 快速开始

### 方式一：npx（免安装）

```bash
npx fingerprint-mcp
```

所有 80+ 项主动指纹识别技术立即可用。TCP、TLS、SSH、HTTP、DNS、WAF、路径、服务、时序、IoT、SMTP、基础设施和应用程序指纹识别均无需 API 密钥。

### 方式二：克隆仓库

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### 环境变量（可选）

```bash
# OSINT 情报富化（全部可选 — 主动指纹识别无需任何密钥即可工作）
export SHODAN_API_KEY=your-key           # 启用 osint_shodan、ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # 启用 osint_censys（免费：250 次查询/月）
export CENSYS_API_SECRET=your-secret     # Censys API 密钥
export SECURITYTRAILS_API_KEY=your-key   # 启用 waf_origin、enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # 启用 osint_virustotal（免费：500 次查询/天）
```

所有 API 密钥均为可选。没有密钥，你仍然可以使用完整的 TCP/TLS/SSH/HTTP/DNS/WAF/路径/服务/时序/IoT/SMTP/基础设施/应用程序指纹识别、关联、被动分析、枚举和元数据工具 &mdash; 80+ 项技术通过直接探测目标工作。

### 连接你的 AI 智能体

<details open>
<summary><b>Claude Code</b></summary>

```bash
# 使用 npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# 使用本地克隆
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

添加到 `~/Library/Application Support/Claude/claude_desktop_config.json`：

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
<summary><b>Cursor / Windsurf / 其他 MCP 客户端</b></summary>

相同的 JSON 配置格式。将命令指向 `npx fingerprint-mcp` 或你的本地安装路径。

</details>

### 开始查询

```
你："对 target.com 的所有内容进行指纹识别 — TLS、HTTP 栈、WAF、DNS、开放端口"
```

就是这样。智能体会自动处理多层指纹识别、信号关联和基础设施分析。

---

## AI 能做什么

### 快速侦察

```
你："快速侦察 target.com"

智能体：-> recon {url: "https://target.com", depth: "quick"}

       -> TCP：端口 80、443、22 开放
       -> TLS：Let's Encrypt RSA 证书，TLS 1.2+1.3，nginx JARM 签名
       -> HTTP：nginx/1.24.0，Express.js，React，Cloudflare CDN
       -> DNS：A 203.0.113.42，MX Google Workspace，SPF/DKIM 已配置
       -> WAF：检测到 Cloudflare（cf-ray 头）
       -> "target.com 是一个 React SPA，运行在 Express.js 上，
          位于 nginx/1.24.0 之后，通过 Cloudflare CDN 提供服务。
          TLS 使用 Let's Encrypt 正确配置。SSH 在 22 端口运行
          OpenSSH 9.6。邮件由 Google Workspace 处理，完整配置了
          SPF/DKIM/DMARC。"
```

### 深度 TLS 调查

```
你："详细分析 suspicious-server.com 的 TLS 配置"

智能体：-> scan_tls {host: "suspicious-server.com"}

       -> 证书：自签名，CN=localhost，已过期 47 天
       -> JARM：2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          （匹配 Cobalt Strike 默认配置）
       -> JA4X：指纹匹配已知 C2 框架模式
       -> 密码套件：接受弱密码（RC4、3DES）
       -> SNI：对任何 SNI 值响应相同
       -> CT 日志：证书未记录（非公开信任）
       -> "高风险：TLS 配置强烈表明这是 C2 基础设施。
          自签名过期证书，JARM 指纹匹配 Cobalt Strike，
          接受弱密码，对任意 SNI 值响应。
          建议立即调查并封锁。"
```

### WAF 绕过与源站发现

```
你："target.com 位于 WAF 后面。你能找到源站服务器吗？"

智能体：-> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF：Cloudflare (AS13335)，对可疑请求显示验证页面
       -> DNS：A 记录指向 Cloudflare IP 104.21.x.x
       -> 子域名：dev.target.com 解析到 203.0.113.42（非 Cloudflare）
       -> 直接连接 203.0.113.42:443 返回相同 TLS 证书
       -> SecurityTrails 历史记录：Cloudflare 之前源站为 203.0.113.42
       -> "已找到源站 IP：203.0.113.42。通过 dev.target.com
          子域名发现，该子域名绕过了 Cloudflare。源站提供相同的
          TLS 证书并响应 target.com 的 Host 头。
          源站没有 WAF 保护 — 可以直接访问。"
```

### 主机上的服务发现

```
你："10.0.1.50 上运行着哪些服务？"

智能体：-> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> 端口 22：OpenSSH 8.9p1 Ubuntu，ED25519 主机密钥
       -> 端口 80：Apache/2.4.57，PHP/8.2，WordPress 6.4
       -> 端口 3306：MySQL 8.0.36，需要认证
       -> 端口 5432：PostgreSQL 16.1，需要 SSL
       -> 端口 6379：Redis 7.2.4，无认证（开放）
       -> 端口 8080：Node.js Express 开发服务器，CORS: *
       -> "严重：6379 端口的 Redis 无需认证 — 网络上的任何人
          都可以读写数据。8080 上的 Express 开发服务器
          具有通配符 CORS。MySQL 和 PostgreSQL 正确要求认证。
          WordPress 落后 2 个小版本。需要立即处理
          Redis 和开发服务器暴露问题。"
```

---

## 工具参考（13 个工具，103 项技术）

<details open>
<summary><b>recon &mdash; 基于深度级别选择技术的全面侦察</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | string | 目标指纹识别 URL |
| `depth` | `quick` \| `standard` \| `deep` | 扫描深度：quick=5 项技术，standard=20，deep=50+ |

根据深度级别编排所有提供商的技术。快速模式提供快速概览；深度模式运行全面指纹识别，包括枚举、OSINT 和关联。

</details>

<details>
<summary><b>scan_ports &mdash; TCP 端口扫描与服务检测（3 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `host` | string | 目标主机（IP 或域名） |
| `ports` | number[] | 可选 &mdash; 指定扫描端口（默认为常用端口） |

| 技术 | 描述 |
|------|------|
| `tcp_probe` | TCP 连接扫描以检测开放端口 |
| `tcp_banner` | 对开放端口进行 Banner 抓取以识别服务 |
| `tcp_analysis` | 端口组合分析和服务推断 |

</details>

<details>
<summary><b>scan_tls &mdash; 完整 TLS/SSL 分析（8 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `host` | string | 目标主机（IP 或域名） |
| `port` | number | 可选 &mdash; TLS 端口（默认：443） |

| 技术 | 描述 |
|------|------|
| `tls_certificate` | X.509 证书解析 &mdash; 主题、签发者、SAN、有效期、证书链 |
| `tls_jarm` | JARM 主动指纹识别 &mdash; 10 个 TLS Client Hello 探测，62 字符哈希 |
| `tls_ja4x` | JA4X 基于证书属性的被动 TLS 指纹识别 |
| `tls_ciphers` | 密码套件枚举和强度分析 |
| `tls_protocols` | 支持的 TLS 协议版本检测（SSLv3 到 TLS 1.3） |
| `tls_sni` | SNI 行为测试 &mdash; 默认证书与请求的主机名对比 |
| `tls_ct_logs` | 通过 crt.sh 查询证书透明度日志 |
| `tls_ocsp` | OCSP 装订和吊销状态检查 |

</details>

<details>
<summary><b>scan_dns &mdash; DNS 情报（7 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `domain` | string | 目标域名 |

| 技术 | 描述 |
|------|------|
| `dns_records` | 完整记录枚举 &mdash; A、AAAA、MX、NS、TXT、CNAME、SOA |
| `dns_email_auth` | SPF、DKIM 和 DMARC 记录分析 |
| `dns_saas` | 通过 CNAME 和 MX 模式检测 SaaS/服务（Slack、Zendesk 等） |
| `dns_server` | DNS 服务器指纹识别（BIND、PowerDNS、Cloudflare 等） |
| `dns_takeover` | 通过悬空 CNAME 分析检测子域名接管 |
| `dns_zone` | 域传送尝试 (AXFR) |
| `dns_caa` | CAA 记录分析，用于证书颁发机构限制 |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/Web 指纹识别（29 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | string | 目标 URL |

| 技术 | 提供商 | 描述 |
|------|--------|------|
| `http_headers` | HTTP | 响应头分析和服务器识别 |
| `http_header_order` | HTTP | 头部排序指纹（服务器软件签名） |
| `http_security_headers` | HTTP | 安全头审计（CSP、HSTS、X-Frame-Options 等） |
| `http_cookies` | HTTP | Cookie 分析 &mdash; 标志、前缀、框架检测 |
| `http_methods` | HTTP | 允许的 HTTP 方法枚举 (OPTIONS) |
| `http_cors` | HTTP | CORS 策略分析和错误配置检测 |
| `http_compression` | HTTP | 支持的压缩算法（gzip、br、zstd） |
| `http_caching` | HTTP | 缓存头分析（CDN、反向代理检测） |
| `http_etag` | HTTP | ETag 格式分析，用于后端识别 |
| `http_error` | HTTP | 错误页面指纹识别（自定义与默认错误页面） |
| `http_redirect` | HTTP | 重定向链分析 |
| `http_timing` | HTTP | 响应时序基线，用于服务器性能分析 |
| `http_favicon` | HTTP | Favicon 哈希 (MurmurHash3)，用于技术识别 |
| `http_robots` | HTTP | robots.txt 解析和禁止路径提取 |
| `http_sitemap` | HTTP | 站点地图发现和 URL 提取 |
| `http_wellknown` | HTTP | .well-known 端点发现（security.txt、openid 等） |
| `web_tech` | Web | 通过 HTML/JS/CSS 模式进行技术检测 |
| `web_analytics` | Web | 分析和跟踪服务检测 |
| `web_sourcemaps` | Web | Source map 文件发现 |
| `web_websocket` | Web | WebSocket 端点检测 |
| `web_graphql` | Web | GraphQL 端点检测和内省 |
| `web_spa` | Web | 单页应用框架检测 |
| `web_cdn` | Web | 通过响应头和 DNS 进行 CDN 检测 |
| `web_meta` | Web | HTML meta 标签分析（生成器、框架提示） |
| `web_feed` | Web | RSS/Atom 订阅源发现 |
| `h2_detect` | HTTP/2 | HTTP/2 协议支持检测 |
| `h2_fingerprint` | HTTP/2 | HTTP/2 服务器指纹识别（SETTINGS、WINDOW_UPDATE） |
| `h2_h3` | HTTP/2 | 通过 Alt-Svc 头检测 HTTP/3 (QUIC) 支持 |
| `app_cms` | Application | CMS 检测（WordPress、Drupal、Joomla 等） |

</details>

<details>
<summary><b>scan_paths &mdash; 路径情报（5 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | string | 目标 URL |
| `categories` | string[] | 可选 &mdash; 要检查的类别（sensitive、git、debug、api、config） |

| 技术 | 描述 |
|------|------|
| `path_sensitive` | 敏感文件发现（备份文件、配置文件、数据库转储） |
| `path_robots` | robots.txt 和 sitemap.xml 分析以发现隐藏路径 |
| `path_git` | Git 仓库泄漏检测（.git/HEAD、.git/config） |
| `path_debug` | 调试端点发现（phpinfo、server-status、调试控制台） |
| `path_api` | API 版本和文档端点发现 |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN 检测与指纹识别（4 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `url` | string | 目标 URL |

| 技术 | 描述 |
|------|------|
| `waf_detect` | 通过响应头和行为分析检测 WAF 存在 |
| `waf_cdn` | CDN 提供商识别（Cloudflare、Akamai、Fastly 等） |
| `waf_fingerprint` | WAF 产品识别和版本检测 |
| `waf_origin` | WAF/CDN 后的源站 IP 发现（需要 `SECURITYTRAILS_API_KEY`） |

</details>

<details>
<summary><b>scan_services &mdash; 服务级探测（12 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `host` | string | 目标主机（IP 或域名） |
| `ports` | number[] | 可选 &mdash; 指定探测端口 |
| `service` | string | 可选 &mdash; 指定探测服务（mysql、postgres、redis、ftp、ssh、smtp、vnc、iot） |

| 技术 | 提供商 | 描述 |
|------|--------|------|
| `ssh_probe` | SSH | SSH 协议版本和软件检测 |
| `ssh_algorithms` | SSH | SSH 算法审计（KEX、密码、MAC、主机密钥类型） |
| `ssh_hostkey_lookup` | SSH | 通过 Shodan 查找 SSH 主机密钥（需要 `SHODAN_API_KEY`） |
| `svc_mysql` | Service | MySQL 版本检测和功能指纹识别 |
| `svc_postgres` | Service | PostgreSQL 版本检测和 SSL 支持检查 |
| `svc_redis` | Service | Redis 版本检测和认证状态 |
| `svc_ftp` | Service | FTP Banner 分析和匿名登录检查 |
| `svc_vnc_rdp` | Service | VNC/RDP 服务检测和安全评估 |
| `smtp_banner` | SMTP | SMTP Banner 分析和 MTA 识别 |
| `smtp_starttls` | SMTP | SMTP STARTTLS 支持和证书检查 |
| `iot_detect` | IoT | 通过 Banner 模式和默认页面检测 IoT 设备 |
| `iot_upnp` | IoT | 本地网络上的 UPnP/SSDP 设备发现 |

</details>

<details>
<summary><b>enumerate &mdash; 范围扩展（8 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `domain` | string | 目标域名 |

| 技术 | 描述 |
|------|------|
| `enum_subdomains` | 通过多种方法枚举子域名 |
| `enum_wildcard` | 通配符 DNS 检测 |
| `enum_tld` | TLD 扩展（target.com -> target.net、target.org 等） |
| `enum_related` | 通过共享基础设施发现相关域名 |
| `enum_asn` | ASN 邻居发现 &mdash; 同一网络上的其他域名 |
| `enum_ct` | 证书透明度日志子域名提取 |
| `enum_passive_dns` | 被动 DNS 历史（需要 `SECURITYTRAILS_API_KEY`） |
| `enum_scope` | 范围摘要和攻击面概述 |

</details>

<details>
<summary><b>osint &mdash; OSINT 情报富化（6 项技术）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `target` | string | 要富化的 IP 地址或域名 |
| `type` | `ip` \| `domain` | 可选 &mdash; 目标类型（省略时自动检测） |

| 技术 | 认证 | 描述 |
|------|------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan 主机查询 &mdash; 开放端口、Banner、漏洞、操作系统 |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys 主机数据 &mdash; 服务、TLS、自治系统 |
| `osint_reverse_ip` | 无 | 反向 IP 查询 &mdash; 同一 IP 上的其他域名 |
| `osint_whois` | 无 | WHOIS 注册数据 &mdash; 注册商、日期、域名服务器 |
| `osint_webarchive` | 无 | Web Archive 历史 &mdash; 首次/最后快照、变更频率 |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal 域名/IP 报告 &mdash; 检测结果、分类、DNS |

</details>

<details>
<summary><b>analyze &mdash; 被动指纹分析（3 种模式）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `type` | `headers` \| `html` \| `banner` | 要分析的数据类型 |
| `data` | string | 要分析的原始数据（粘贴头部、HTML 或 Banner 输出） |

| 模式 | 描述 |
|------|------|
| `fp_analyze_headers` | 被动 HTTP 头分析 &mdash; 无需发送流量即可进行服务器、框架、代理检测 |
| `fp_analyze_html` | 被动 HTML 分析 &mdash; 从源码进行技术检测、框架识别 |
| `fp_analyze_banner` | 被动 Banner 分析 &mdash; 从原始 Banner 文本进行服务识别 |

</details>

<details>
<summary><b>correlate &mdash; 多信号关联引擎（7 种模式）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | 关联模式 |
| `signals` | object | 要关联的指纹信号（因模式而异） |

| 模式 | 描述 |
|------|------|
| `fp_consistency` | 跨层信号一致性检查 &mdash; TCP、TLS、HTTP 和 DNS 指纹是否一致？ |
| `fp_honeypot` | 蜜罐检测 &mdash; 检查不可能的服务组合和行为异常 |
| `fp_spoofing` | 伪装检测 &mdash; 识别服务器头部与实际行为的不匹配 |
| `fp_compare` | 两台主机指纹配置的并排比较 |
| `fp_topology` | 基础设施拓扑映射 &mdash; CDN、负载均衡器、反向代理链 |
| `fp_c2` | 通过 JARM、TLS、HTTP 和时序关联进行 C2 框架检测 |
| `fp_identify` | 基于哈希的已知签名数据库识别 |

</details>

<details>
<summary><b>meta &mdash; 服务器配置和数据（3 种模式）</b></summary>

| 参数 | 类型 | 描述 |
|------|------|------|
| `category` | string | 可选 &mdash; 按类别过滤 |

| 模式 | 描述 |
|------|------|
| `fp_sources` | 列出所有可用数据源及其配置和 API 密钥状态 |
| `fp_config` | 服务器配置 &mdash; 版本、已加载的提供商、技术计数 |
| `fp_signatures` | 签名数据库列表 &mdash; JARM、Banner、WAF、应用程序签名 |

</details>

---

### CLI 用法

```bash
# 列出所有可用的工具和技术
npx fingerprint-mcp --list

# 直接运行任意工具
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

# OSINT 工具（需要 API 密钥）
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## 数据源（21 个）

| 数据源 | 认证 | 提供的功能 |
|--------|------|-----------|
| TCP 探测 | 无 | 端口扫描、Banner 抓取、服务检测 |
| TLS/SSL 分析 | 无 | 证书解析、JARM 指纹识别、JA4X、密码枚举、SNI 测试 |
| SSH 探测 | 无 | 协议版本、算法审计、软件检测 |
| HTTP 分析 | 无 | 头部指纹识别、favicon 哈希、Cookie 分析、方法枚举、CORS |
| Web 检测 | 无 | 技术检测、分析、Source map、WebSocket、GraphQL、SPA 框架 |
| 路径发现 | 无 | 敏感文件、Git 泄漏、调试端点、API 版本、robots.txt |
| DNS 解析 | 无 | 记录枚举、邮件认证分析、SaaS 检测、服务器指纹识别 |
| WAF/CDN 检测 | 无 | WAF 识别、CDN 检测、WAF 指纹识别 |
| 时序分析 | 无 | 响应时序基线、时钟偏差检测 |
| HTTP/2 & HTTP/3 | 无 | HTTP/2 检测和指纹识别、HTTP/3 Alt-Svc 发现 |
| SMTP 探测 | 无 | SMTP Banner 分析、STARTTLS 检查 |
| IoT/嵌入式 | 无 | IoT 设备检测、UPnP/SSDP 发现 |
| 应用检测 | 无 | CMS、框架和电商平台识别 |
| 服务探测 | 无 | MySQL、PostgreSQL、Redis、FTP、VNC/RDP 指纹识别 |
| 基础设施检测 | 无 | 云提供商、托管提供商、CDN 识别 |
| 关联引擎 | 无 | 信号一致性、蜜罐检测、伪装检测、拓扑映射 |
| 识别引擎 | 无 | 基于哈希的识别、C2 检测、签名匹配 |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | 主机情报 &mdash; 开放端口、Banner、漏洞、操作系统检测 |
| [Censys](https://censys.io) | `CENSYS_API_ID` | 主机数据 &mdash; 服务、TLS 证书、自治系统信息 |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF 源站发现、被动 DNS 历史、历史记录 |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | 域名/IP 信誉、检测结果、DNS 历史、分类 |

---

## 架构

```
src/
  index.ts                # CLI 入口（--help、--list、--tool、stdio 服务器）
  protocol/
    mcp-server.ts         # MCP 服务器设置（stdio 传输）
    tools.ts              # 工具注册表 — 所有 13 个复合工具在此注册
  types/
    index.ts              # 共享类型（ToolDef、ToolContext、ToolResult）
  utils/
    rate-limiter.ts       # 按提供商的速率限制器
    cache.ts              # API 响应的 TTL 缓存
    require-key.ts        # API 密钥验证助手
    murmurhash3.ts        # 用于 favicon 哈希的 MurmurHash3
  composite/              # 13 个复合工具编排器
    recon.ts              # 全面侦察编排器（quick/standard/deep）
    scan-ports.ts         # 端口扫描复合
    scan-tls.ts           # TLS 分析复合
    scan-dns.ts           # DNS 情报复合
    scan-http.ts          # HTTP 指纹识别复合
    scan-paths.ts         # 路径发现复合
    scan-waf.ts           # WAF/CDN 检测复合
    scan-services.ts      # 服务探测复合
    analyze.ts            # 被动分析复合
    correlate.ts          # 关联引擎复合
    enumerate.ts          # 范围扩展复合
    osint.ts              # OSINT 情报富化复合
    meta.ts               # 服务器元数据复合
    helpers.ts            # 共享复合助手
  tcp/                    # TCP 探测技术 (3)
  tls/                    # TLS/SSL 分析技术 (8)
  ssh/                    # SSH 探测技术 (3)
  http/                   # HTTP 指纹识别技术 (16)
  web/                    # Web 技术检测技术 (9)
  path/                   # 路径发现技术 (5)
  dns/                    # DNS 情报技术 (7)
  waf/                    # WAF/CDN 检测技术 (4)
  timing/                 # 时序分析技术 (2)
  h2/                     # HTTP/2 & HTTP/3 技术 (3)
  smtp/                   # SMTP 探测技术 (2)
  iot/                    # IoT/嵌入式检测技术 (2)
  app/                    # 应用检测技术 (3)
  service/                # 服务探测技术 (5)
  infra/                  # 基础设施检测技术 (3)
  correlation/            # 关联引擎 (5)
  identify/               # 识别引擎 (3)
  passive/                # 被动分析 (3)
  osint/                  # OSINT 情报富化技术 (6)
  enum/                   # 枚举技术 (8)
  meta/                   # 元数据工具 (3)
  data/                   # 签名数据库和模式库
    jarm-signatures.ts    # 已知 JARM 指纹（C2、服务器、CDN）
    waf-signatures.ts     # WAF 检测签名
    service-banners.ts    # 服务 Banner 模式
    tech-patterns.ts      # 技术检测模式
    favicon-hashes.ts     # 已知 favicon MurmurHash3 值
    c2-signatures.ts      # C2 框架签名
    ...                   # 15+ 签名/模式数据库
```

**设计决策：**

- **13 个复合工具，103 项技术** &mdash; 智能体调用高级工具（`recon`、`scan_tls`、`scan_http`）。每个复合工具编排多个底层技术并返回关联结果。这减少了工具调用开销，同时保持了粒度。
- **21 个提供商，1 个服务器** &mdash; 每个指纹识别层都是独立模块。复合编排器根据上下文和深度选择技术。
- **主动优先，OSINT 可选** &mdash; 80+ 项技术通过直接探测目标工作，无需任何 API 密钥。OSINT 提供商（Shodan、Censys、VirusTotal、SecurityTrails）添加情报富化，但从不是必需的。
- **按提供商的速率限制器** &mdash; 每个提供商拥有自己的 `RateLimiter` 实例。主动探测有速率限制以避免被检测；OSINT API 根据其配额进行校准。
- **TTL 缓存** &mdash; DNS 记录（10 分钟）、OSINT 结果（15 分钟）、CT 日志（30 分钟）被缓存，以避免多工具工作流中的冗余查询。
- **优雅降级** &mdash; 缺少 API 密钥不会导致服务器崩溃。OSINT 工具返回描述性消息："设置 SHODAN_API_KEY 以启用 Shodan 主机查询。"
- **3 个依赖** &mdash; `@modelcontextprotocol/sdk`、`zod` 和 `cheerio`。所有网络 I/O 通过原生 `fetch()` 和 Node.js `net`/`tls`/`dns` 模块。没有 nmap，没有外部二进制文件。

---

## 限制

- OSINT 工具（Shodan、Censys、VirusTotal、SecurityTrails）需要各自的 API 密钥
- Censys 免费层限制为每月 250 次查询
- VirusTotal 免费层限制为每天 500 次查询
- 端口扫描使用 TCP connect（非 SYN 扫描）&mdash; 比 nmap 隐蔽性低，但不需要 root 权限
- JARM 指纹识别需要直接 TCP 访问目标（可能被防火墙阻止）
- UPnP/SSDP 发现仅在本地网络有效
- 服务探测（MySQL、PostgreSQL、Redis）连接但不进行认证
- 子域名枚举依赖 CT 日志和被动来源（无暴力破解）
- macOS / Linux 已测试（Windows 未测试）

---

## MCP 安全套件

| 项目 | 领域 | 工具 |
|------|------|------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 基于浏览器的安全测试 | 39 个工具，Firefox，注入测试 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 云安全（AWS/Azure/GCP） | 38 个工具，60+ 项检查 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 安全态势 | 39 个工具，45 项检查 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 漏洞情报 | 23 个工具，5 个来源 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT 与侦察 | 37 个工具，12 个来源 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 暗网与威胁情报 | 66 个工具，16 个来源 |
| **fingerprint-mcp** | **通用数字指纹识别** | **13 个工具，103 项技术，21 个提供商** |

---

<p align="center">
<b>仅用于授权的安全测试和评估。</b><br>
在对任何目标执行指纹识别之前，请始终确保您已获得适当的授权。
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 许可证</a> &bull; 使用 Bun + TypeScript 构建
</p>
