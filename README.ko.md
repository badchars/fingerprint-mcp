<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <strong>한국어</strong> |
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

<h3 align="center">AI 에이전트를 위한 범용 디지털 핑거프린팅.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, 서비스 프로빙, JARM, JA4X, favicon 해싱, 인프라 토폴로지, C2 탐지, OSINT 강화 &mdash; 단일 MCP 서버로 통합되었습니다.<br>
  AI 에이전트가 11개의 분리된 CLI 도구와 수동 상관분석 대신 <b>온디맨드 풀스펙트럼 핑거프린팅</b>을 수행합니다.
</p>

<br>

<p align="center">
  <a href="#문제점">문제점</a> &bull;
  <a href="#차별점">차별점</a> &bull;
  <a href="#빠른-시작">빠른 시작</a> &bull;
  <a href="#ai가-할-수-있는-것">AI가 할 수 있는 것</a> &bull;
  <a href="#도구-참조13개-도구-103개-기술">도구 (13)</a> &bull;
  <a href="#데이터-소스21개">데이터 소스</a> &bull;
  <a href="#아키텍처">아키텍처</a> &bull;
  <a href="CHANGELOG.md">변경 이력</a> &bull;
  <a href="CONTRIBUTING.md">기여하기</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="라이선스"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13개 도구">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103개 기술">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp 데모" width="800">
</p>

---

## 문제점

오늘날 서버를 핑거프린팅한다는 것은 십여 개의 분리된 도구를 동시에 다뤄야 한다는 의미입니다. 포트 스캔을 위해 `nmap`, 인증서 분석을 위해 `testssl.sh`, HTTP 헤더를 위해 `curl -I`, DNS를 위해 `dig`, WAF 탐지를 위해 `wafw00f`, SSH를 위해 `ssh-audit`, 별도의 JARM 도구, 기술 탐지를 위해 Wappalyzer를 실행하고 &mdash; 그런 다음 30분 동안 스프레드시트에서 모든 결과를 수동으로 교차 참조하여 실제로 무엇이 실행되고 있는지 파악해야 합니다.

```
기존 핑거프린팅 워크플로:
  TLS 인증서 분석             ->  testssl.sh / openssl s_client
  HTTP 헤더 수집              ->  curl -I
  웹 기술 탐지                ->  wappalyzer CLI
  DNS 정찰                    ->  dig / nslookup / dnsenum
  포트 스캔                   ->  nmap -sV
  WAF 탐지                    ->  wafw00f
  SSH 감사                    ->  ssh-audit
  서비스 핑거프린팅           ->  nmap scripts
  JARM 핑거프린트             ->  jarm (별도 도구)
  OSINT 데이터베이스 조회     ->  shodan CLI, censys CLI
  모든 결과 상관분석          ->  스프레드시트에서 수동으로
  ──────────────────────────────
  합계: 11개 도구, 30분 이상, 수동 상관분석
```

**fingerprint-mcp**는 [Model Context Protocol](https://modelcontextprotocol.io)을 통해 AI 에이전트에게 21개 제공자의 103개 핑거프린팅 기술을 감싼 13개 복합 도구를 제공합니다. 에이전트는 다중 레이어 핑거프린팅을 병렬로 실행하고, TCP/TLS/HTTP/DNS/SSH 레이어 간 신호를 상관분석하며, 허니팟과 C2 인프라를 탐지하고, 통합된 인텔리전스 뷰를 제시합니다 &mdash; 단일 대화에서 모든 것을 처리합니다.

```
fingerprint-mcp 사용:
  당신: "target.com에 대해 심층 정찰을 수행해줘"

  에이전트: -> recon {url: "https://target.com", depth: "deep"}

           -> TLS: JARM (3fd21b20d00000...)을 통한 nginx/1.24.0,
              Let's Encrypt 인증서, 2개 SAN, TLS 1.2+1.3
           -> HTTP: Cloudflare WAF 뒤의 Express.js,
              React SPA, Google Analytics, 14개 보안 헤더 분석
           -> DNS: A/AAAA/MX/TXT 레코드, SPF/DKIM/DMARC 구성됨,
              CNAME/MX를 통해 Slack + Google Workspace 탐지
           -> 포트: 80, 443, 22 (OpenSSH 9.6), 8080 (개발 서버)
           -> WAF: Cloudflare 탐지됨, 직접 연결을 통해 오리진 IP 발견
           -> 열거: CT 로그를 통해 12개 하위 도메인 발견, 와일드카드 DNS 탐지
           -> "target.com은 Cloudflare WAF 뒤에서 nginx/1.24.0 +
              Express.js를 실행합니다. 오리진 IP 203.0.113.42가
              8080 포트에 노출되어 있습니다. TLS는 올바르게
              구성되어 있지만(A+ 등급) 8080의 개발 서버에는
              WAF 보호가 없습니다. 3개 하위 도메인이 폐기된
              인프라를 가리키고 있어 — 인수 위험이 있습니다."
```

---

## 차별점

기존 도구는 한 번에 한 레이어의 원시 데이터만 제공합니다. fingerprint-mcp는 AI 에이전트에게 **모든 핑거프린팅 레이어를 동시에 추론**하는 능력을 부여합니다.

<table>
<thead>
<tr>
<th></th>
<th>기존 접근 방식</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>인터페이스</b></td>
<td>출력 형식이 다른 11개의 CLI 도구</td>
<td>MCP &mdash; AI 에이전트가 대화형으로 도구 호출</td>
</tr>
<tr>
<td><b>기술</b></td>
<td>한 번에 하나의 도구, 하나의 레이어</td>
<td>21개 제공자의 103개 기술, 병렬 실행</td>
</tr>
<tr>
<td><b>TLS 분석</b></td>
<td>testssl.sh 출력, JARM을 별도로 수동 파싱</td>
<td>에이전트가 한 번의 호출로 인증서 + JARM + JA4X + 암호 제품군 + SNI + CT 로그 통합</td>
</tr>
<tr>
<td><b>상관분석</b></td>
<td>결과를 스프레드시트에 복사-붙여넣기</td>
<td>에이전트가 교차 상관분석: "JARM이 알려진 C2 프레임워크와 일치, HTTP 타이밍이 허니팟 확인"</td>
</tr>
<tr>
<td><b>WAF 우회</b></td>
<td>wafw00f가 WAF를 탐지하면, 수동으로 오리진 서버 탐색</td>
<td>에이전트가 WAF를 탐지하고, 오리진 IP를 발견하며, 동일한 콘텐츠를 제공하는지 검증</td>
</tr>
<tr>
<td><b>API 키</b></td>
<td>Shodan, Censys 등에 필수</td>
<td>80개 이상의 능동 기술이 API 키 없이 작동; 키는 OSINT 강화를 활성화</td>
</tr>
<tr>
<td><b>설치</b></td>
<td>nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer 설치...</td>
<td><code>npx fingerprint-mcp</code> &mdash; 하나의 명령, 설정 없음</td>
</tr>
</tbody>
</table>

---

## 빠른 시작

### 옵션 1: npx (설치 불필요)

```bash
npx fingerprint-mcp
```

모든 80개 이상의 능동 핑거프린팅 기술이 즉시 작동합니다. TCP, TLS, SSH, HTTP, DNS, WAF, 경로, 서비스, 타이밍, IoT, SMTP, 인프라 및 애플리케이션 핑거프린팅에 API 키가 필요하지 않습니다.

### 옵션 2: 클론

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### 환경 변수 (선택 사항)

```bash
# OSINT 강화 (모두 선택 사항 — 능동 핑거프린팅은 키 없이 작동)
export SHODAN_API_KEY=your-key           # osint_shodan, ssh_hostkey_lookup 활성화
export CENSYS_API_ID=your-id             # osint_censys 활성화 (무료: 월 250회 조회)
export CENSYS_API_SECRET=your-secret     # Censys API 시크릿
export SECURITYTRAILS_API_KEY=your-key   # waf_origin, enum_passive_dns 활성화
export VIRUSTOTAL_API_KEY=your-key       # osint_virustotal 활성화 (무료: 일 500회 조회)
```

모든 API 키는 선택 사항입니다. 키 없이도 TCP/TLS/SSH/HTTP/DNS/WAF/경로/서비스/타이밍/IoT/SMTP/인프라/애플리케이션 핑거프린팅, 상관분석, 수동 분석, 열거 및 메타 도구를 완전히 사용할 수 있습니다 &mdash; 80개 이상의 기술이 대상을 직접 프로빙하여 작동합니다.

### AI 에이전트에 연결

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx 사용
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# 로컬 클론 사용
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json`에 추가:

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
<summary><b>Cursor / Windsurf / 기타 MCP 클라이언트</b></summary>

동일한 JSON 설정 형식입니다. 명령을 `npx fingerprint-mcp` 또는 로컬 설치 경로로 지정하세요.

</details>

### 쿼리 시작

```
당신: "target.com의 모든 것을 핑거프린팅해줘 — TLS, HTTP 스택, WAF, DNS, 열린 포트"
```

그게 전부입니다. 에이전트가 다중 레이어 핑거프린팅, 신호 상관분석, 인프라 분석을 자동으로 처리합니다.

---

## AI가 할 수 있는 것

### 빠른 정찰

```
당신: "target.com을 빠르게 정찰해줘"

에이전트: -> recon {url: "https://target.com", depth: "quick"}

         -> TCP: 포트 80, 443, 22 열림
         -> TLS: Let's Encrypt RSA 인증서, TLS 1.2+1.3, nginx JARM 서명
         -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
         -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM 구성됨
         -> WAF: Cloudflare 탐지됨 (cf-ray 헤더)
         -> "target.com은 nginx/1.24.0 뒤에서 Express.js로 실행되는
            React SPA이며, Cloudflare CDN을 통해 서비스됩니다.
            TLS는 Let's Encrypt로 올바르게 구성되어 있습니다.
            22번 포트에서 OpenSSH 9.6이 실행 중입니다.
            이메일은 Google Workspace가 처리하며 SPF/DKIM/DMARC가
            완전히 구성되어 있습니다."
```

### 심층 TLS 조사

```
당신: "suspicious-server.com의 TLS 구성을 상세히 분석해줘"

에이전트: -> scan_tls {host: "suspicious-server.com"}

         -> 인증서: 자체 서명, CN=localhost, 47일 전 만료
         -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
            (Cobalt Strike 기본 프로필과 일치)
         -> JA4X: 핑거프린트가 알려진 C2 프레임워크 패턴과 일치
         -> 암호 제품군: 약한 암호 수락 (RC4, 3DES)
         -> SNI: 모든 SNI 값에 동일하게 응답
         -> CT 로그: 인증서가 기록되지 않음 (공개 신뢰되지 않음)
         -> "고위험: TLS 구성이 C2 인프라를 강하게 시사합니다.
            자체 서명 만료 인증서, JARM 핑거프린트가 Cobalt Strike와
            일치, 약한 암호 수락, 임의 SNI 값에 응답.
            즉시 조사 및 차단을 권장합니다."
```

### WAF 우회 및 오리진 발견

```
당신: "target.com이 WAF 뒤에 있어. 오리진 서버를 찾을 수 있어?"

에이전트: -> scan_waf {url: "https://target.com"}
         -> scan_dns {domain: "target.com"}
         -> enumerate {domain: "target.com"}

         -> WAF: Cloudflare (AS13335), 의심스러운 요청에 챌린지 페이지
         -> DNS: A 레코드가 Cloudflare IP 104.21.x.x를 가리킴
         -> 하위 도메인: dev.target.com이 203.0.113.42로 해석됨 (비 Cloudflare)
         -> 203.0.113.42:443에 직접 연결 시 동일한 TLS 인증서 반환
         -> SecurityTrails 이력: Cloudflare 이전 오리진은 203.0.113.42
         -> "오리진 IP 발견: 203.0.113.42. Cloudflare를 우회하는
            dev.target.com 하위 도메인을 통해 발견되었습니다.
            오리진은 동일한 TLS 인증서를 제공하고 target.com
            Host 헤더에 응답합니다.
            오리진에 WAF 보호가 없어 — 직접 접근이 가능합니다."
```

### 호스트의 서비스 발견

```
당신: "10.0.1.50에서 어떤 서비스가 실행 중이야?"

에이전트: -> scan_ports {host: "10.0.1.50"}
         -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

         -> 포트 22: OpenSSH 8.9p1 Ubuntu, ED25519 호스트 키
         -> 포트 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
         -> 포트 3306: MySQL 8.0.36, 인증 필요
         -> 포트 5432: PostgreSQL 16.1, SSL 필요
         -> 포트 6379: Redis 7.2.4, 인증 없음 (열림)
         -> 포트 8080: Node.js Express 개발 서버, CORS: *
         -> "심각: 6379 포트의 Redis에 인증이 없습니다 — 네트워크의
            누구나 데이터를 읽고 쓸 수 있습니다. 8080의 Express
            개발 서버에 와일드카드 CORS가 있습니다.
            MySQL과 PostgreSQL은 올바르게 인증을 요구합니다.
            WordPress가 2개 마이너 버전 뒤처져 있습니다.
            Redis와 개발 서버 노출에 대한 즉각적인 조치가 필요합니다."
```

---

## 도구 참조 (13개 도구, 103개 기술)

<details open>
<summary><b>recon &mdash; 깊이 기반 기술 선택을 통한 전체 정찰</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `url` | string | 핑거프린팅할 대상 URL |
| `depth` | `quick` \| `standard` \| `deep` | 스캔 깊이: quick=5개 기술, standard=20, deep=50+ |

깊이 수준에 따라 모든 제공자의 기술을 오케스트레이션합니다. 빠른 모드는 빠른 개요를 제공하고, 심층 모드는 열거, OSINT, 상관분석을 포함한 철저한 핑거프린팅을 실행합니다.

</details>

<details>
<summary><b>scan_ports &mdash; 서비스 탐지를 포함한 TCP 포트 스캔 (3개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `host` | string | 대상 호스트 (IP 또는 도메인) |
| `ports` | number[] | 선택 사항 &mdash; 스캔할 특정 포트 (기본값: 일반 포트) |

| 기술 | 설명 |
|------|------|
| `tcp_probe` | 열린 포트를 탐지하기 위한 TCP 연결 스캔 |
| `tcp_banner` | 서비스 식별을 위한 열린 포트의 배너 수집 |
| `tcp_analysis` | 포트 조합 분석 및 서비스 추론 |

</details>

<details>
<summary><b>scan_tls &mdash; 완전한 TLS/SSL 분석 (8개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `host` | string | 대상 호스트 (IP 또는 도메인) |
| `port` | number | 선택 사항 &mdash; TLS 포트 (기본값: 443) |

| 기술 | 설명 |
|------|------|
| `tls_certificate` | X.509 인증서 파싱 &mdash; 주체, 발급자, SAN, 유효 기간, 체인 |
| `tls_jarm` | JARM 능동 핑거프린팅 &mdash; 10개 TLS Client Hello 프로브, 62자 해시 |
| `tls_ja4x` | 인증서 속성 기반 JA4X 수동 TLS 핑거프린팅 |
| `tls_ciphers` | 암호 제품군 열거 및 강도 분석 |
| `tls_protocols` | 지원되는 TLS 프로토콜 버전 탐지 (SSLv3부터 TLS 1.3까지) |
| `tls_sni` | SNI 동작 테스트 &mdash; 기본 인증서 대 요청된 호스트 이름 |
| `tls_ct_logs` | crt.sh를 통한 인증서 투명성 로그 조회 |
| `tls_ocsp` | OCSP 스테이플링 및 해지 상태 확인 |

</details>

<details>
<summary><b>scan_dns &mdash; DNS 인텔리전스 (7개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `domain` | string | 대상 도메인 |

| 기술 | 설명 |
|------|------|
| `dns_records` | 전체 레코드 열거 &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF, DKIM, DMARC 레코드 분석 |
| `dns_saas` | CNAME 및 MX 패턴을 통한 SaaS/서비스 탐지 (Slack, Zendesk 등) |
| `dns_server` | DNS 서버 핑거프린팅 (BIND, PowerDNS, Cloudflare 등) |
| `dns_takeover` | 댕글링 CNAME 분석을 통한 하위 도메인 인수 탐지 |
| `dns_zone` | 영역 전송 시도 (AXFR) |
| `dns_caa` | 인증 기관 제한을 위한 CAA 레코드 분석 |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/웹 핑거프린팅 (29개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `url` | string | 대상 URL |

| 기술 | 제공자 | 설명 |
|------|--------|------|
| `http_headers` | HTTP | 응답 헤더 분석 및 서버 식별 |
| `http_header_order` | HTTP | 헤더 순서 핑거프린트 (서버 소프트웨어 서명) |
| `http_security_headers` | HTTP | 보안 헤더 감사 (CSP, HSTS, X-Frame-Options 등) |
| `http_cookies` | HTTP | 쿠키 분석 &mdash; 플래그, 접두사, 프레임워크 탐지 |
| `http_methods` | HTTP | 허용된 HTTP 메서드 열거 (OPTIONS) |
| `http_cors` | HTTP | CORS 정책 분석 및 오설정 탐지 |
| `http_compression` | HTTP | 지원되는 압축 알고리즘 (gzip, br, zstd) |
| `http_caching` | HTTP | 캐시 헤더 분석 (CDN, 리버스 프록시 탐지) |
| `http_etag` | HTTP | 백엔드 식별을 위한 ETag 형식 분석 |
| `http_error` | HTTP | 오류 페이지 핑거프린팅 (사용자 정의 대 기본 오류 페이지) |
| `http_redirect` | HTTP | 리다이렉트 체인 분석 |
| `http_timing` | HTTP | 서버 성능 프로파일링을 위한 응답 타이밍 기준선 |
| `http_favicon` | HTTP | 기술 식별을 위한 Favicon 해시 (MurmurHash3) |
| `http_robots` | HTTP | robots.txt 파싱 및 금지 경로 추출 |
| `http_sitemap` | HTTP | 사이트맵 발견 및 URL 추출 |
| `http_wellknown` | HTTP | .well-known 엔드포인트 발견 (security.txt, openid 등) |
| `web_tech` | Web | HTML/JS/CSS 패턴을 통한 기술 탐지 |
| `web_analytics` | Web | 분석 및 추적 서비스 탐지 |
| `web_sourcemaps` | Web | Source map 파일 발견 |
| `web_websocket` | Web | WebSocket 엔드포인트 탐지 |
| `web_graphql` | Web | GraphQL 엔드포인트 탐지 및 내부 조사 |
| `web_spa` | Web | 싱글 페이지 애플리케이션 프레임워크 탐지 |
| `web_cdn` | Web | 응답 헤더 및 DNS를 통한 CDN 탐지 |
| `web_meta` | Web | HTML meta 태그 분석 (생성기, 프레임워크 힌트) |
| `web_feed` | Web | RSS/Atom 피드 발견 |
| `h2_detect` | HTTP/2 | HTTP/2 프로토콜 지원 탐지 |
| `h2_fingerprint` | HTTP/2 | HTTP/2 서버 핑거프린팅 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Alt-Svc 헤더를 통한 HTTP/3 (QUIC) 지원 탐지 |
| `app_cms` | Application | CMS 탐지 (WordPress, Drupal, Joomla 등) |

</details>

<details>
<summary><b>scan_paths &mdash; 경로 인텔리전스 (5개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `url` | string | 대상 URL |
| `categories` | string[] | 선택 사항 &mdash; 확인할 카테고리 (sensitive, git, debug, api, config) |

| 기술 | 설명 |
|------|------|
| `path_sensitive` | 민감한 파일 발견 (백업 파일, 설정 파일, 데이터베이스 덤프) |
| `path_robots` | 숨겨진 경로 발견을 위한 robots.txt 및 sitemap.xml 분석 |
| `path_git` | Git 저장소 유출 탐지 (.git/HEAD, .git/config) |
| `path_debug` | 디버그 엔드포인트 발견 (phpinfo, server-status, 디버그 콘솔) |
| `path_api` | API 버전 및 문서 엔드포인트 발견 |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN 탐지 및 핑거프린팅 (4개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `url` | string | 대상 URL |

| 기술 | 설명 |
|------|------|
| `waf_detect` | 응답 헤더 및 동작 분석을 통한 WAF 존재 탐지 |
| `waf_cdn` | CDN 제공자 식별 (Cloudflare, Akamai, Fastly 등) |
| `waf_fingerprint` | WAF 제품 식별 및 버전 탐지 |
| `waf_origin` | WAF/CDN 뒤의 오리진 IP 발견 (`SECURITYTRAILS_API_KEY` 필요) |

</details>

<details>
<summary><b>scan_services &mdash; 서비스 수준 프로빙 (12개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `host` | string | 대상 호스트 (IP 또는 도메인) |
| `ports` | number[] | 선택 사항 &mdash; 프로빙할 특정 포트 |
| `service` | string | 선택 사항 &mdash; 프로빙할 특정 서비스 (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| 기술 | 제공자 | 설명 |
|------|--------|------|
| `ssh_probe` | SSH | SSH 프로토콜 버전 및 소프트웨어 탐지 |
| `ssh_algorithms` | SSH | SSH 알고리즘 감사 (KEX, 암호, MAC, 호스트 키 유형) |
| `ssh_hostkey_lookup` | SSH | Shodan을 통한 SSH 호스트 키 조회 (`SHODAN_API_KEY` 필요) |
| `svc_mysql` | Service | MySQL 버전 탐지 및 기능 핑거프린팅 |
| `svc_postgres` | Service | PostgreSQL 버전 탐지 및 SSL 지원 확인 |
| `svc_redis` | Service | Redis 버전 탐지 및 인증 상태 |
| `svc_ftp` | Service | FTP 배너 분석 및 익명 로그인 확인 |
| `svc_vnc_rdp` | Service | VNC/RDP 서비스 탐지 및 보안 평가 |
| `smtp_banner` | SMTP | SMTP 배너 분석 및 MTA 식별 |
| `smtp_starttls` | SMTP | SMTP STARTTLS 지원 및 인증서 검사 |
| `iot_detect` | IoT | 배너 패턴 및 기본 페이지를 통한 IoT 장치 탐지 |
| `iot_upnp` | IoT | 로컬 네트워크에서의 UPnP/SSDP 장치 발견 |

</details>

<details>
<summary><b>enumerate &mdash; 범위 확장 (8개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `domain` | string | 대상 도메인 |

| 기술 | 설명 |
|------|------|
| `enum_subdomains` | 다양한 방법을 통한 하위 도메인 열거 |
| `enum_wildcard` | 와일드카드 DNS 탐지 |
| `enum_tld` | TLD 확장 (target.com -> target.net, target.org 등) |
| `enum_related` | 공유 인프라를 통한 관련 도메인 발견 |
| `enum_asn` | ASN 이웃 발견 &mdash; 같은 네트워크의 다른 도메인 |
| `enum_ct` | 인증서 투명성 로그 하위 도메인 추출 |
| `enum_passive_dns` | 수동 DNS 이력 (`SECURITYTRAILS_API_KEY` 필요) |
| `enum_scope` | 범위 요약 및 공격 표면 개요 |

</details>

<details>
<summary><b>osint &mdash; OSINT 강화 (6개 기술)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `target` | string | 강화할 IP 주소 또는 도메인 |
| `type` | `ip` \| `domain` | 선택 사항 &mdash; 대상 유형 (생략 시 자동 탐지) |

| 기술 | 인증 | 설명 |
|------|------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan 호스트 조회 &mdash; 열린 포트, 배너, 취약점, OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys 호스트 데이터 &mdash; 서비스, TLS, 자율 시스템 |
| `osint_reverse_ip` | 없음 | 역방향 IP 조회 &mdash; 같은 IP의 다른 도메인 |
| `osint_whois` | 없음 | WHOIS 등록 데이터 &mdash; 등록 기관, 날짜, 네임서버 |
| `osint_webarchive` | 없음 | Web Archive 이력 &mdash; 첫/마지막 스냅샷, 변경 빈도 |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal 도메인/IP 보고서 &mdash; 탐지 결과, 분류, DNS |

</details>

<details>
<summary><b>analyze &mdash; 수동 핑거프린트 분석 (3가지 모드)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `type` | `headers` \| `html` \| `banner` | 분석할 데이터 유형 |
| `data` | string | 분석할 원시 데이터 (헤더, HTML 또는 배너 출력을 붙여넣기) |

| 모드 | 설명 |
|------|------|
| `fp_analyze_headers` | 수동 HTTP 헤더 분석 &mdash; 트래픽 전송 없이 서버, 프레임워크, 프록시 탐지 |
| `fp_analyze_html` | 수동 HTML 분석 &mdash; 소스에서 기술 탐지, 프레임워크 식별 |
| `fp_analyze_banner` | 수동 배너 분석 &mdash; 원시 배너 텍스트에서 서비스 식별 |

</details>

<details>
<summary><b>correlate &mdash; 다중 신호 상관분석 엔진 (7가지 모드)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | 상관분석 모드 |
| `signals` | object | 상관분석할 핑거프린트 신호 (모드에 따라 다름) |

| 모드 | 설명 |
|------|------|
| `fp_consistency` | 교차 레이어 신호 일관성 검사 &mdash; TCP, TLS, HTTP, DNS 핑거프린트가 일치하는가? |
| `fp_honeypot` | 허니팟 탐지 &mdash; 불가능한 서비스 조합 및 행동 이상 검사 |
| `fp_spoofing` | 스푸핑 탐지 &mdash; 서버 헤더와 실제 동작의 불일치 식별 |
| `fp_compare` | 두 호스트의 핑거프린트 프로필 나란히 비교 |
| `fp_topology` | 인프라 토폴로지 매핑 &mdash; CDN, 로드 밸런서, 리버스 프록시 체인 |
| `fp_c2` | JARM, TLS, HTTP, 타이밍 상관분석을 통한 C2 프레임워크 탐지 |
| `fp_identify` | 알려진 서명 데이터베이스에 대한 해시 기반 식별 |

</details>

<details>
<summary><b>meta &mdash; 서버 구성 및 데이터 (3가지 모드)</b></summary>

| 매개변수 | 유형 | 설명 |
|----------|------|------|
| `category` | string | 선택 사항 &mdash; 카테고리별 필터링 |

| 모드 | 설명 |
|------|------|
| `fp_sources` | 모든 사용 가능한 데이터 소스와 구성 및 API 키 상태 목록 |
| `fp_config` | 서버 구성 &mdash; 버전, 로드된 제공자, 기술 수 |
| `fp_signatures` | 서명 데이터베이스 목록 &mdash; JARM, 배너, WAF, 애플리케이션 서명 |

</details>

---

### CLI 사용법

```bash
# 사용 가능한 모든 도구 및 기술 나열
npx fingerprint-mcp --list

# 도구 직접 실행
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

# OSINT 도구 (API 키 필요)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## 데이터 소스 (21개)

| 소스 | 인증 | 제공 기능 |
|------|------|----------|
| TCP 프로빙 | 없음 | 포트 스캔, 배너 수집, 서비스 탐지 |
| TLS/SSL 분석 | 없음 | 인증서 파싱, JARM 핑거프린팅, JA4X, 암호 열거, SNI 테스트 |
| SSH 프로빙 | 없음 | 프로토콜 버전, 알고리즘 감사, 소프트웨어 탐지 |
| HTTP 분석 | 없음 | 헤더 핑거프린팅, favicon 해싱, 쿠키 분석, 메서드 열거, CORS |
| Web 탐지 | 없음 | 기술 탐지, 분석, Source map, WebSocket, GraphQL, SPA 프레임워크 |
| 경로 발견 | 없음 | 민감한 파일, Git 유출, 디버그 엔드포인트, API 버전, robots.txt |
| DNS 해석 | 없음 | 레코드 열거, 이메일 인증 분석, SaaS 탐지, 서버 핑거프린팅 |
| WAF/CDN 탐지 | 없음 | WAF 식별, CDN 탐지, WAF 핑거프린팅 |
| 타이밍 분석 | 없음 | 응답 타이밍 기준선, 클록 스큐 탐지 |
| HTTP/2 & HTTP/3 | 없음 | HTTP/2 탐지 및 핑거프린팅, HTTP/3 Alt-Svc 발견 |
| SMTP 프로빙 | 없음 | SMTP 배너 분석, STARTTLS 검사 |
| IoT/임베디드 | 없음 | IoT 장치 탐지, UPnP/SSDP 발견 |
| 애플리케이션 탐지 | 없음 | CMS, 프레임워크 및 전자상거래 플랫폼 식별 |
| 서비스 프로빙 | 없음 | MySQL, PostgreSQL, Redis, FTP, VNC/RDP 핑거프린팅 |
| 인프라 탐지 | 없음 | 클라우드 제공자, 호스팅 제공자, CDN 식별 |
| 상관분석 엔진 | 없음 | 신호 일관성, 허니팟 탐지, 스푸핑 탐지, 토폴로지 매핑 |
| 식별 엔진 | 없음 | 해시 기반 식별, C2 탐지, 서명 매칭 |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | 호스트 인텔리전스 &mdash; 열린 포트, 배너, 취약점, OS 탐지 |
| [Censys](https://censys.io) | `CENSYS_API_ID` | 호스트 데이터 &mdash; 서비스, TLS 인증서, 자율 시스템 정보 |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF 오리진 발견, 수동 DNS 이력, 역사적 레코드 |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | 도메인/IP 평판, 탐지 결과, DNS 이력, 분류 |

---

## 아키텍처

```
src/
  index.ts                # CLI 진입점 (--help, --list, --tool, stdio 서버)
  protocol/
    mcp-server.ts         # MCP 서버 설정 (stdio 전송)
    tools.ts              # 도구 레지스트리 — 모든 13개 복합 도구가 여기에 등록
  types/
    index.ts              # 공유 타입 (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # 제공자별 속도 제한기
    cache.ts              # API 응답 TTL 캐시
    require-key.ts        # API 키 검증 헬퍼
    murmurhash3.ts        # favicon 해싱을 위한 MurmurHash3
  composite/              # 13개 복합 도구 오케스트레이터
    recon.ts              # 전체 정찰 오케스트레이터 (quick/standard/deep)
    scan-ports.ts         # 포트 스캔 복합
    scan-tls.ts           # TLS 분석 복합
    scan-dns.ts           # DNS 인텔리전스 복합
    scan-http.ts          # HTTP 핑거프린팅 복합
    scan-paths.ts         # 경로 발견 복합
    scan-waf.ts           # WAF/CDN 탐지 복합
    scan-services.ts      # 서비스 프로빙 복합
    analyze.ts            # 수동 분석 복합
    correlate.ts          # 상관분석 엔진 복합
    enumerate.ts          # 범위 확장 복합
    osint.ts              # OSINT 강화 복합
    meta.ts               # 서버 메타 복합
    helpers.ts            # 공유 복합 헬퍼
  tcp/                    # TCP 프로빙 기술 (3)
  tls/                    # TLS/SSL 분석 기술 (8)
  ssh/                    # SSH 프로빙 기술 (3)
  http/                   # HTTP 핑거프린팅 기술 (16)
  web/                    # 웹 기술 탐지 기술 (9)
  path/                   # 경로 발견 기술 (5)
  dns/                    # DNS 인텔리전스 기술 (7)
  waf/                    # WAF/CDN 탐지 기술 (4)
  timing/                 # 타이밍 분석 기술 (2)
  h2/                     # HTTP/2 & HTTP/3 기술 (3)
  smtp/                   # SMTP 프로빙 기술 (2)
  iot/                    # IoT/임베디드 탐지 기술 (2)
  app/                    # 애플리케이션 탐지 기술 (3)
  service/                # 서비스 프로빙 기술 (5)
  infra/                  # 인프라 탐지 기술 (3)
  correlation/            # 상관분석 엔진 (5)
  identify/               # 식별 엔진 (3)
  passive/                # 수동 분석 (3)
  osint/                  # OSINT 강화 기술 (6)
  enum/                   # 열거 기술 (8)
  meta/                   # 메타 도구 (3)
  data/                   # 서명 데이터베이스 및 패턴 라이브러리
    jarm-signatures.ts    # 알려진 JARM 핑거프린트 (C2, 서버, CDN)
    waf-signatures.ts     # WAF 탐지 서명
    service-banners.ts    # 서비스 배너 패턴
    tech-patterns.ts      # 기술 탐지 패턴
    favicon-hashes.ts     # 알려진 favicon MurmurHash3 값
    c2-signatures.ts      # C2 프레임워크 서명
    ...                   # 15+ 서명/패턴 데이터베이스
```

**설계 결정:**

- **13개 복합 도구, 103개 기술** &mdash; 에이전트는 고수준 도구(`recon`, `scan_tls`, `scan_http`)를 호출합니다. 각 복합 도구는 여러 저수준 기술을 오케스트레이션하고 상관분석된 결과를 반환합니다. 이는 세밀함을 유지하면서 도구 호출 오버헤드를 줄입니다.
- **21개 제공자, 1개 서버** &mdash; 모든 핑거프린팅 레이어는 독립 모듈입니다. 복합 오케스트레이터가 컨텍스트와 깊이에 따라 기술을 선택합니다.
- **능동 우선, OSINT 선택** &mdash; 80개 이상의 기술이 API 키 없이 대상을 직접 프로빙하여 작동합니다. OSINT 제공자(Shodan, Censys, VirusTotal, SecurityTrails)는 강화를 추가하지만 필수는 아닙니다.
- **제공자별 속도 제한기** &mdash; 각 제공자는 자체 `RateLimiter` 인스턴스를 가집니다. 능동 프로빙은 탐지를 피하기 위해 속도 제한되고, OSINT API는 할당량에 맞게 조정됩니다.
- **TTL 캐싱** &mdash; DNS 레코드(10분), OSINT 결과(15분), CT 로그(30분)가 캐시되어 다중 도구 워크플로에서 중복 조회를 방지합니다.
- **우아한 저하** &mdash; API 키가 없어도 서버가 충돌하지 않습니다. OSINT 도구는 설명적 메시지를 반환합니다: "Shodan 호스트 조회를 활성화하려면 SHODAN_API_KEY를 설정하세요."
- **3개 의존성** &mdash; `@modelcontextprotocol/sdk`, `zod`, `cheerio`. 모든 네트워크 I/O는 네이티브 `fetch()`와 Node.js `net`/`tls`/`dns` 모듈을 통해 이루어집니다. nmap 없음, 외부 바이너리 없음.

---

## 제한 사항

- OSINT 도구(Shodan, Censys, VirusTotal, SecurityTrails)는 각각의 API 키가 필요
- Censys 무료 등급은 월 250회 조회로 제한
- VirusTotal 무료 등급은 일 500회 조회로 제한
- 포트 스캔은 TCP connect 사용 (SYN 스캔 아님) &mdash; nmap보다 은밀성이 낮지만 root 권한 불필요
- JARM 핑거프린팅은 대상에 대한 직접 TCP 접근이 필요 (방화벽에 의해 차단될 수 있음)
- UPnP/SSDP 발견은 로컬 네트워크에서만 작동
- 서비스 프로빙(MySQL, PostgreSQL, Redis)은 연결하지만 인증하지 않음
- 하위 도메인 열거는 CT 로그와 수동 소스에 의존 (무차별 대입 없음)
- macOS / Linux 테스트됨 (Windows 미테스트)

---

## MCP 보안 제품군

| 프로젝트 | 영역 | 도구 |
|----------|------|------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | 브라우저 기반 보안 테스트 | 39개 도구, Firefox, 인젝션 테스트 |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | 클라우드 보안 (AWS/Azure/GCP) | 38개 도구, 60+ 검사 |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub 보안 태세 | 39개 도구, 45개 검사 |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 취약점 인텔리전스 | 23개 도구, 5개 소스 |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT 및 정찰 | 37개 도구, 12개 소스 |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | 다크웹 및 위협 인텔리전스 | 66개 도구, 16개 소스 |
| **fingerprint-mcp** | **범용 디지털 핑거프린팅** | **13개 도구, 103개 기술, 21개 제공자** |

---

<p align="center">
<b>승인된 보안 테스트 및 평가 목적으로만 사용하세요.</b><br>
대상에 대해 핑거프린팅을 수행하기 전에 항상 적절한 승인을 받았는지 확인하세요.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 라이선스</a> &bull; Bun + TypeScript로 빌드됨
</p>
