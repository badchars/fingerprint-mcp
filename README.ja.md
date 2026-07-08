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
  <strong>日本語</strong> |
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

<h3 align="center">AIエージェントのためのユニバーサルデジタルフィンガープリンティング。</h3>

<p align="center">
  TCP、TLS/SSL、SSH、HTTP、DNS、WAF/CDN、IoT、SMTP、サービスプローブ、JARM、JA4X、faviconハッシュ、インフラトポロジー、C2検出、OSINT エンリッチメント &mdash; すべてを単一のMCPサーバーに統合。<br>
  AIエージェントは<b>フルスペクトルのフィンガープリンティングをオンデマンド</b>で実行できます。11個のバラバラなCLIツールと手動の相関作業は不要です。
</p>

<br>

<p align="center">
  <a href="#問題点">問題点</a> &bull;
  <a href="#何が違うのか">何が違うのか</a> &bull;
  <a href="#クイックスタート">クイックスタート</a> &bull;
  <a href="#aiにできること">AIにできること</a> &bull;
  <a href="#ツールリファレンス13ツール103テクニック">ツール（13）</a> &bull;
  <a href="#データソース21">データソース</a> &bull;
  <a href="#アーキテクチャ">アーキテクチャ</a> &bull;
  <a href="CHANGELOG.md">変更履歴</a> &bull;
  <a href="CONTRIBUTING.md">コントリビュート</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="ライセンス"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13ツール">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103テクニック">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp デモ" width="800">
</p>

---

## 問題点

今日、サーバーのフィンガープリンティングを行うには、十数個のバラバラなツールを使い分ける必要があります。ポートスキャンには`nmap`、証明書分析には`testssl.sh`、HTTPヘッダーには`curl -I`、DNSには`dig`、WAF検出には`wafw00f`、SSHには`ssh-audit`、別途JARMツール、技術検出にはWappalyzer &mdash; そして、実際に何が動いているかを把握するために、すべてをスプレッドシートで手動で相互参照するのに30分を費やします。

```
従来のフィンガープリンティングワークフロー：
  TLS証明書の分析             ->  testssl.sh / openssl s_client
  HTTPヘッダーの取得          ->  curl -I
  Web技術の検出               ->  wappalyzer CLI
  DNSリコネサンス             ->  dig / nslookup / dnsenum
  ポートスキャン              ->  nmap -sV
  WAF検出                     ->  wafw00f
  SSH監査                     ->  ssh-audit
  サービスフィンガープリント  ->  nmap scripts
  JARMフィンガープリント      ->  jarm（別ツール）
  OSINTデータベースの確認     ->  shodan CLI, censys CLI
  すべてを相関                ->  スプレッドシートで手動
  ──────────────────────────────
  合計：11ツール、30分以上、手動相関
```

**fingerprint-mcp**は、AIエージェントに[Model Context Protocol](https://modelcontextprotocol.io)を介して21プロバイダーにわたる103のフィンガープリンティングテクニックを包含する13のコンポジットツールを提供します。エージェントはマルチレイヤーフィンガープリンティングを並列実行し、TCP/TLS/HTTP/DNS/SSHレイヤー間のシグナルを相関させ、ハニーポットやC2インフラを検出し、統合されたインテリジェンス画像を提示します &mdash; 単一の会話の中で。

```
fingerprint-mcpを使用：
  あなた："target.comの詳細なリコンを実行して"

  エージェント: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: JARM経由でnginx/1.24.0 (3fd21b20d00000...)、
            Let's Encrypt証明書、SAN 2件、TLS 1.2+1.3
         -> HTTP: Cloudflare WAFの背後にExpress.js、
            React SPA、Google Analytics、14のセキュリティヘッダーを分析
         -> DNS: A/AAAA/MX/TXTレコード、SPF/DKIM/DMARC設定済み、
            CNAME/MX経由でSlack + Google Workspaceを検出
         -> ポート: 80、443、22（OpenSSH 9.6）、8080（開発サーバー）
         -> WAF: Cloudflare検出、直接接続によりオリジンIPを発見
         -> 列挙: CTログ経由で12サブドメイン、ワイルドカードDNS検出
         -> "target.comはCloudflare WAFの背後でnginx/1.24.0上の
            Express.jsを実行しています。オリジンIP 203.0.113.42がポート
            8080で公開されています。TLSは正しく設定されていますが（A+相当）、
            8080の開発サーバーにはWAF保護がありません。3つのサブドメインが
            廃止されたインフラを指しています — テイクオーバーのリスクがあります。"
```

---

## 何が違うのか

既存のツールは一度に一つのレイヤーの生データしか提供しません。fingerprint-mcpはAIエージェントに**すべてのフィンガープリンティングレイヤーを同時に推論する能力**を与えます。

<table>
<thead>
<tr>
<th></th>
<th>従来のアプローチ</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>インターフェース</b></td>
<td>異なる出力形式の11個のCLIツール</td>
<td>MCP &mdash; AIエージェントが会話形式でツールを呼び出す</td>
</tr>
<tr>
<td><b>テクニック</b></td>
<td>1ツール、1レイヤーずつ</td>
<td>21プロバイダーにわたる103テクニック、並列実行</td>
</tr>
<tr>
<td><b>TLS分析</b></td>
<td>testssl.shの出力、JARMを別途手動解析</td>
<td>エージェントが証明書 + JARM + JA4X + 暗号スイート + SNI + CTログを一回の呼び出しで統合</td>
</tr>
<tr>
<td><b>相関</b></td>
<td>結果をスプレッドシートにコピペ</td>
<td>エージェントが相互相関：「JARMが既知のC2フレームワークに一致、HTTPタイミングがハニーポットを確認」</td>
</tr>
<tr>
<td><b>WAFバイパス</b></td>
<td>wafw00fがWAFを検出、手動でオリジンを探索</td>
<td>エージェントがWAFを検出し、オリジンIPを発見し、同じコンテンツを配信していることを検証</td>
</tr>
<tr>
<td><b>APIキー</b></td>
<td>Shodan、Censysなどに必須</td>
<td>80以上のアクティブテクニックがAPIキーなしで動作、キーはOSINTエンリッチメントを有効化</td>
</tr>
<tr>
<td><b>セットアップ</b></td>
<td>nmap、testssl、wafw00f、ssh-audit、jarm、wappalyzerをインストール...</td>
<td><code>npx fingerprint-mcp</code> &mdash; 一つのコマンド、設定不要</td>
</tr>
</tbody>
</table>

---

## クイックスタート

### オプション1：npx（インストール不要）

```bash
npx fingerprint-mcp
```

80以上のアクティブフィンガープリンティングテクニックがすぐに動作します。TCP、TLS、SSH、HTTP、DNS、WAF、パス、サービス、タイミング、IoT、SMTP、アプリケーションのフィンガープリンティングにAPIキーは不要です。

### オプション2：クローン

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### 環境変数（オプション）

```bash
# OSINTエンリッチメント（すべてオプション — アクティブフィンガープリンティングはキーなしで動作）
export SHODAN_API_KEY=your-key           # osint_shodan、ssh_hostkey_lookupを有効化
export CENSYS_API_ID=your-id             # osint_censysを有効化（無料：250クエリ/月）
export CENSYS_API_SECRET=your-secret     # Censys APIシークレット
export SECURITYTRAILS_API_KEY=your-key   # waf_origin、enum_passive_dnsを有効化
export VIRUSTOTAL_API_KEY=your-key       # osint_virustotalを有効化（無料：500クエリ/日）
```

すべてのAPIキーはオプションです。キーがなくても、完全なTCP/TLS/SSH/HTTP/DNS/WAF/パス/サービス/タイミング/IoT/SMTP/インフラ/アプリケーションのフィンガープリンティング、相関、パッシブ分析、列挙、メタツール &mdash; ターゲットを直接プローブする80以上のテクニックが利用できます。

### AIエージェントへの接続

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npxを使用
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# ローカルクローンを使用
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json`に追加：

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
<summary><b>Cursor / Windsurf / その他のMCPクライアント</b></summary>

同じJSON設定形式です。コマンドを`npx fingerprint-mcp`またはローカルインストールパスに向けてください。

</details>

### クエリの開始

```
あなた："target.comのすべてをフィンガープリントして — TLS、HTTPスタック、WAF、DNS、開いているポート"
```

以上です。エージェントがマルチレイヤーフィンガープリンティング、シグナル相関、インフラ分析を自動的に処理します。

---

## AIにできること

### クイックリコン

```
あなた："target.comのクイックリコン"

エージェント: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: ポート80、443、22がオープン
       -> TLS: Let's Encrypt RSA証明書、TLS 1.2+1.3、nginx JARMシグネチャ
       -> HTTP: nginx/1.24.0、Express.js、React、Cloudflare CDN
       -> DNS: A 203.0.113.42、MX Google Workspace、SPF/DKIM設定済み
       -> WAF: Cloudflare検出（cf-rayヘッダー）
       -> "target.comはnginx/1.24.0の背後でExpress.js上のReact SPAで、
          Cloudflare CDN経由で配信されています。TLSはLet's Encryptで
          適切に設定されています。ポート22でOpenSSH 9.6が動作。メールは
          完全なSPF/DKIM/DMARCでGoogle Workspaceが処理。"
```

### 詳細なTLS調査

```
あなた："suspicious-server.comのTLS設定を詳しく分析して"

エージェント: -> scan_tls {host: "suspicious-server.com"}

       -> 証明書: 自己署名、CN=localhost、47日前に期限切れ
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          （Cobalt Strikeのデフォルトプロファイルに一致）
       -> JA4X: フィンガープリントが既知のC2フレームワークパターンに一致
       -> 暗号スイート: 弱い暗号を受け入れる（RC4、3DES）
       -> SNI: 任意のSNI値に対して同一の応答
       -> CTログ: 証明書が記録されていない（公的に信頼されていない）
       -> "高リスク: TLS設定はC2インフラを強く示唆しています。
          自己署名の期限切れ証明書、JARMフィンガープリントがCobalt Strikeに一致、
          弱い暗号を受け入れ、任意のSNI値に応答します。
          即座の調査とブロックを推奨します。"
```

### WAFバイパスとオリジン発見

```
あなた："target.comはWAFの背後にあります。オリジンサーバーを見つけられますか？"

エージェント: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare（AS13335）、不審なリクエストにチャレンジページ
       -> DNS: AレコードがCloudflare IP 104.21.x.xを指す
       -> サブドメイン: dev.target.comが203.0.113.42に解決（非Cloudflare）
       -> 203.0.113.42:443への直接接続で同じTLS証明書を返す
       -> SecurityTrails履歴: Cloudflare以前のオリジンは203.0.113.42
       -> "オリジンIP発見: 203.0.113.42。Cloudflareをバイパスする
          dev.target.comサブドメイン経由で発見。オリジンは同じTLS証明書を
          配信し、target.comのHostヘッダーに応答します。
          オリジンにはWAF保護がありません — 直接アクセスが可能です。"
```

### ホスト上のサービス検出

```
あなた："10.0.1.50で何のサービスが動いていますか？"

エージェント: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> ポート22: OpenSSH 8.9p1 Ubuntu、ED25519ホストキー
       -> ポート80: Apache/2.4.57、PHP/8.2、WordPress 6.4
       -> ポート3306: MySQL 8.0.36、認証必須
       -> ポート5432: PostgreSQL 16.1、SSL必須
       -> ポート6379: Redis 7.2.4、認証なし（オープン）
       -> ポート8080: Node.js Express開発サーバー、CORS: *
       -> "重大: ポート6379のRedisに認証がありません — ネットワーク上の
          誰でもデータの読み書きが可能です。8080のExpress開発サーバーは
          ワイルドカードCORSです。MySQLとPostgreSQLは適切に認証を要求して
          います。WordPressは2マイナーバージョン遅れています。Redisと
          開発サーバーの露出に対する即座の対応が必要です。"
```

---

## ツールリファレンス（13ツール、103テクニック）

<details open>
<summary><b>recon &mdash; 深度ベースのテクニック選択による完全なリコネサンス</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `url` | string | フィンガープリントするターゲットURL |
| `depth` | `quick` \| `standard` \| `deep` | スキャン深度: quick=5テクニック、standard=20、deep=50+ |

深度レベルに基づいてすべてのプロバイダーからテクニックをオーケストレーションします。クイックモードは素早い概要を提供し、ディープモードは列挙、OSINT、相関を含む徹底的なフィンガープリンティングを実行します。

</details>

<details>
<summary><b>scan_ports &mdash; サービス検出付きTCPポートスキャン（3テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `host` | string | ターゲットホスト（IPまたはドメイン） |
| `ports` | number[] | オプション &mdash; スキャンする特定のポート（デフォルト: 一般的なポート） |

| テクニック | 説明 |
|-----------|-------------|
| `tcp_probe` | オープンポートを検出するTCPコネクトスキャン |
| `tcp_banner` | サービス識別のためのオープンポートでのバナー取得 |
| `tcp_analysis` | ポート組み合わせ分析とサービス推論 |

</details>

<details>
<summary><b>scan_tls &mdash; 完全なTLS/SSL分析（8テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `host` | string | ターゲットホスト（IPまたはドメイン） |
| `port` | number | オプション &mdash; TLSポート（デフォルト: 443） |

| テクニック | 説明 |
|-----------|-------------|
| `tls_certificate` | X.509証明書の解析 &mdash; サブジェクト、発行者、SAN、有効期限、チェーン |
| `tls_jarm` | JARMアクティブフィンガープリンティング &mdash; 10のTLS Client Helloプローブ、62文字ハッシュ |
| `tls_ja4x` | 証明書プロパティからのJA4Xパッシブ TLSフィンガープリンティング |
| `tls_ciphers` | 暗号スイートの列挙と強度分析 |
| `tls_protocols` | サポートされるTLSプロトコルバージョンの検出（SSLv3からTLS 1.3） |
| `tls_sni` | SNI動作テスト &mdash; デフォルト証明書 vs. 要求されたホスト名 |
| `tls_ct_logs` | crt.sh経由のCertificate Transparencyログ検索 |
| `tls_ocsp` | OCSPステープリングと失効ステータスの確認 |

</details>

<details>
<summary><b>scan_dns &mdash; DNSインテリジェンス（7テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `domain` | string | ターゲットドメイン |

| テクニック | 説明 |
|-----------|-------------|
| `dns_records` | 完全なレコード列挙 &mdash; A、AAAA、MX、NS、TXT、CNAME、SOA |
| `dns_email_auth` | SPF、DKIM、DMARCレコード分析 |
| `dns_saas` | CNAMEとMXパターンによるSaaS/サービス検出（Slack、Zendeskなど） |
| `dns_server` | DNSサーバーフィンガープリンティング（BIND、PowerDNS、Cloudflareなど） |
| `dns_takeover` | ダングリングCNAME分析によるサブドメインテイクオーバー検出 |
| `dns_zone` | ゾーン転送試行（AXFR） |
| `dns_caa` | 認証局制限のためのCAAレコード分析 |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/Webフィンガープリンティング（29テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `url` | string | ターゲットURL |

| テクニック | プロバイダー | 説明 |
|-----------|----------|-------------|
| `http_headers` | HTTP | レスポンスヘッダー分析とサーバー識別 |
| `http_header_order` | HTTP | ヘッダー順序フィンガープリント（サーバーソフトウェアシグネチャ） |
| `http_security_headers` | HTTP | セキュリティヘッダー監査（CSP、HSTS、X-Frame-Optionsなど） |
| `http_cookies` | HTTP | Cookie分析 &mdash; フラグ、プレフィックス、フレームワーク検出 |
| `http_methods` | HTTP | 許可されたHTTPメソッドの列挙（OPTIONS） |
| `http_cors` | HTTP | CORSポリシー分析と誤設定検出 |
| `http_compression` | HTTP | サポートされる圧縮アルゴリズム（gzip、br、zstd） |
| `http_caching` | HTTP | キャッシュヘッダー分析（CDN、リバースプロキシ検出） |
| `http_etag` | HTTP | バックエンド識別のためのETagフォーマット分析 |
| `http_error` | HTTP | エラーページフィンガープリンティング（カスタム vs. デフォルトエラーページ） |
| `http_redirect` | HTTP | リダイレクトチェーン分析 |
| `http_timing` | HTTP | サーバーパフォーマンスプロファイリングのためのレスポンスタイミングベースライン |
| `http_favicon` | HTTP | 技術識別のためのfaviconハッシュ（MurmurHash3） |
| `http_robots` | HTTP | robots.txtの解析と禁止パスの抽出 |
| `http_sitemap` | HTTP | サイトマップの発見とURL抽出 |
| `http_wellknown` | HTTP | .well-knownエンドポイントの発見（security.txt、openidなど） |
| `web_tech` | Web | HTML/JS/CSSパターンによる技術検出 |
| `web_analytics` | Web | アナリティクスおよびトラッキングサービスの検出 |
| `web_sourcemaps` | Web | ソースマップファイルの発見 |
| `web_websocket` | Web | WebSocketエンドポイントの検出 |
| `web_graphql` | Web | GraphQLエンドポイントの検出とイントロスペクション |
| `web_spa` | Web | シングルページアプリケーションフレームワークの検出 |
| `web_cdn` | Web | レスポンスヘッダーとDNS経由のCDN検出 |
| `web_meta` | Web | HTMLメタタグ分析（ジェネレーター、フレームワークのヒント） |
| `web_feed` | Web | RSS/Atomフィードの発見 |
| `h2_detect` | HTTP/2 | HTTP/2プロトコルサポートの検出 |
| `h2_fingerprint` | HTTP/2 | HTTP/2サーバーフィンガープリンティング（SETTINGS、WINDOW_UPDATE） |
| `h2_h3` | HTTP/2 | Alt-Svcヘッダー経由のHTTP/3（QUIC）サポート検出 |
| `app_cms` | Application | CMS検出（WordPress、Drupal、Joomlaなど） |

</details>

<details>
<summary><b>scan_paths &mdash; パスインテリジェンス（5テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `url` | string | ターゲットURL |
| `categories` | string[] | オプション &mdash; 確認するカテゴリ（sensitive、git、debug、api、config） |

| テクニック | 説明 |
|-----------|-------------|
| `path_sensitive` | 機密ファイルの発見（バックアップファイル、設定ファイル、データベースダンプ） |
| `path_robots` | 隠しパスのためのrobots.txtとsitemap.xmlの分析 |
| `path_git` | Gitリポジトリ漏洩検出（.git/HEAD、.git/config） |
| `path_debug` | デバッグエンドポイントの発見（phpinfo、server-status、デバッグコンソール） |
| `path_api` | APIバージョンとドキュメントエンドポイントの発見 |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN検出とフィンガープリンティング（4テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `url` | string | ターゲットURL |

| テクニック | 説明 |
|-----------|-------------|
| `waf_detect` | レスポンスヘッダーと動作分析によるWAF存在検出 |
| `waf_cdn` | CDNプロバイダー識別（Cloudflare、Akamai、Fastlyなど） |
| `waf_fingerprint` | WAF製品識別とバージョン検出 |
| `waf_origin` | WAF/CDN背後のオリジンIP発見（`SECURITYTRAILS_API_KEY`が必要） |

</details>

<details>
<summary><b>scan_services &mdash; サービスレベルプローブ（12テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `host` | string | ターゲットホスト（IPまたはドメイン） |
| `ports` | number[] | オプション &mdash; プローブする特定のポート |
| `service` | string | オプション &mdash; プローブする特定のサービス（mysql、postgres、redis、ftp、ssh、smtp、vnc、iot） |

| テクニック | プロバイダー | 説明 |
|-----------|----------|-------------|
| `ssh_probe` | SSH | SSHプロトコルバージョンとソフトウェア検出 |
| `ssh_algorithms` | SSH | SSHアルゴリズム監査（KEX、暗号、MAC、ホストキータイプ） |
| `ssh_hostkey_lookup` | SSH | Shodan経由のSSHホストキー検索（`SHODAN_API_KEY`が必要） |
| `svc_mysql` | Service | MySQLバージョン検出と機能フィンガープリンティング |
| `svc_postgres` | Service | PostgreSQLバージョン検出とSSLサポート確認 |
| `svc_redis` | Service | Redisバージョン検出と認証ステータス |
| `svc_ftp` | Service | FTPバナー分析と匿名ログイン確認 |
| `svc_vnc_rdp` | Service | VNC/RDPサービス検出とセキュリティ評価 |
| `smtp_banner` | SMTP | SMTPバナー分析とMTA識別 |
| `smtp_starttls` | SMTP | SMTP STARTTLSサポートと証明書検査 |
| `iot_detect` | IoT | バナーパターンとデフォルトページによるIoTデバイス検出 |
| `iot_upnp` | IoT | ローカルネットワーク上のUPnP/SSDPデバイス検出 |

</details>

<details>
<summary><b>enumerate &mdash; スコープ拡張（8テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `domain` | string | ターゲットドメイン |

| テクニック | 説明 |
|-----------|-------------|
| `enum_subdomains` | 複数の方法によるサブドメイン列挙 |
| `enum_wildcard` | ワイルドカードDNS検出 |
| `enum_tld` | TLD拡張（target.com -> target.net、target.orgなど） |
| `enum_related` | 共有インフラ経由の関連ドメイン発見 |
| `enum_asn` | ASN近隣発見 &mdash; 同じネットワーク上の他のドメイン |
| `enum_ct` | Certificate Transparencyログからのサブドメイン抽出 |
| `enum_passive_dns` | パッシブDNS履歴（`SECURITYTRAILS_API_KEY`が必要） |
| `enum_scope` | スコープサマリーと攻撃対象面の概要 |

</details>

<details>
<summary><b>osint &mdash; OSINTエンリッチメント（6テクニック）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `target` | string | エンリッチするIPアドレスまたはドメイン |
| `type` | `ip` \| `domain` | オプション &mdash; ターゲットタイプ（省略時は自動検出） |

| テクニック | 認証 | 説明 |
|-----------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodanホスト検索 &mdash; オープンポート、バナー、脆弱性、OS |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censysホストデータ &mdash; サービス、TLS、自律システム |
| `osint_reverse_ip` | なし | リバースIP検索 &mdash; 同じIP上の他のドメイン |
| `osint_whois` | なし | WHOIS登録データ &mdash; レジストラ、日付、ネームサーバー |
| `osint_webarchive` | なし | Web Archive履歴 &mdash; 最初/最後のスナップショット、変更頻度 |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotalドメイン/IPレポート &mdash; 検出結果、カテゴリ、DNS |

</details>

<details>
<summary><b>analyze &mdash; パッシブフィンガープリント分析（3モード）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | 分析するデータの種類 |
| `data` | string | 分析する生データ（ヘッダー、HTML、またはバナー出力を貼り付け） |

| モード | 説明 |
|--------|-------------|
| `fp_analyze_headers` | パッシブHTTPヘッダー分析 &mdash; トラフィックを送信せずにサーバー、フレームワーク、プロキシを検出 |
| `fp_analyze_html` | パッシブHTML分析 &mdash; ソースからの技術検出、フレームワーク識別 |
| `fp_analyze_banner` | パッシブバナー分析 &mdash; 生のバナーテキストからのサービス識別 |

</details>

<details>
<summary><b>correlate &mdash; マルチシグナル相関エンジン（7モード）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | 相関モード |
| `signals` | object | 相関するフィンガープリントシグナル（モードにより異なる） |

| モード | 説明 |
|--------|-------------|
| `fp_consistency` | クロスレイヤーシグナル整合性チェック &mdash; TCP、TLS、HTTP、DNSのフィンガープリントが一致するか？ |
| `fp_honeypot` | ハニーポット検出 &mdash; 不可能なサービスの組み合わせと動作異常をチェック |
| `fp_spoofing` | スプーフィング検出 &mdash; サーバーヘッダーと実際の動作の不一致を特定 |
| `fp_compare` | 2つのホストのフィンガープリントプロファイルの並列比較 |
| `fp_topology` | インフラトポロジーマッピング &mdash; CDN、ロードバランサー、リバースプロキシチェーン |
| `fp_c2` | JARM、TLS、HTTP、タイミング相関によるC2フレームワーク検出 |
| `fp_identify` | 既知のシグネチャデータベースに対するハッシュベースの識別 |

</details>

<details>
<summary><b>meta &mdash; サーバー設定とデータ（3モード）</b></summary>

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `category` | string | オプション &mdash; カテゴリでフィルター |

| モード | 説明 |
|--------|-------------|
| `fp_sources` | 設定とAPIキーステータスを含むすべての利用可能なデータソースの一覧 |
| `fp_config` | サーバー設定 &mdash; バージョン、ロードされたプロバイダー、テクニック数 |
| `fp_signatures` | シグネチャデータベース一覧 &mdash; JARM、バナー、WAF、アプリケーションシグネチャ |

</details>

---

### CLI使用法

```bash
# 利用可能なすべてのツールとテクニックを一覧表示
npx fingerprint-mcp --list

# 任意のツールを直接実行
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

# OSINTツール（APIキーが必要）
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## データソース（21）

| ソース | 認証 | 提供するもの |
|--------|------|-------------|
| TCPプローブ | なし | ポートスキャン、バナー取得、サービス検出 |
| TLS/SSL分析 | なし | 証明書解析、JARMフィンガープリンティング、JA4X、暗号列挙、SNIテスト |
| SSHプローブ | なし | プロトコルバージョン、アルゴリズム監査、ソフトウェア検出 |
| HTTP分析 | なし | ヘッダーフィンガープリンティング、faviconハッシュ、cookie分析、メソッド列挙、CORS |
| Web検出 | なし | 技術検出、アナリティクス、ソースマップ、WebSocket、GraphQL、SPAフレームワーク |
| パス発見 | なし | 機密ファイル、git漏洩、デバッグエンドポイント、APIバージョン、robots.txt |
| DNS解決 | なし | レコード列挙、メール認証分析、SaaS検出、サーバーフィンガープリンティング |
| WAF/CDN検出 | なし | WAF識別、CDN検出、WAFフィンガープリンティング |
| タイミング分析 | なし | レスポンスタイミングベースライン、クロックスキュー検出 |
| HTTP/2 & HTTP/3 | なし | HTTP/2検出とフィンガープリンティング、HTTP/3 Alt-Svc発見 |
| SMTPプローブ | なし | SMTPバナー分析、STARTTLS検査 |
| IoT/組み込み | なし | IoTデバイス検出、UPnP/SSDP発見 |
| アプリケーション検出 | なし | CMS、フレームワーク、eコマースプラットフォーム識別 |
| サービスプローブ | なし | MySQL、PostgreSQL、Redis、FTP、VNC/RDPフィンガープリンティング |
| インフラ検出 | なし | クラウドプロバイダー、ホスティングプロバイダー、CDN識別 |
| 相関エンジン | なし | シグナル整合性、ハニーポット検出、スプーフィング検出、トポロジーマッピング |
| 識別エンジン | なし | ハッシュベースの識別、C2検出、シグネチャマッチング |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | ホストインテリジェンス &mdash; オープンポート、バナー、脆弱性、OS検出 |
| [Censys](https://censys.io) | `CENSYS_API_ID` | ホストデータ &mdash; サービス、TLS証明書、自律システム情報 |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAFオリジン発見、パッシブDNS履歴、過去のレコード |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | ドメイン/IPレピュテーション、検出結果、DNS履歴、カテゴリ |

---

## アーキテクチャ

```
src/
  index.ts                # CLIエントリーポイント（--help、--list、--tool、stdioサーバー）
  protocol/
    mcp-server.ts         # MCPサーバーセットアップ（stdioトランスポート）
    tools.ts              # ツールレジストリ — 13のコンポジットツールすべてをここで登録
  types/
    index.ts              # 共有型（ToolDef、ToolContext、ToolResult）
  utils/
    rate-limiter.ts       # プロバイダーごとのレートリミッター
    cache.ts              # APIレスポンス用TTLキャッシュ
    require-key.ts        # APIキー検証ヘルパー
    murmurhash3.ts        # faviconハッシュ用MurmurHash3
  composite/              # 13のコンポジットツールオーケストレーター
    recon.ts              # 完全リコンオーケストレーター（quick/standard/deep）
    scan-ports.ts         # ポートスキャンコンポジット
    scan-tls.ts           # TLS分析コンポジット
    scan-dns.ts           # DNSインテリジェンスコンポジット
    scan-http.ts          # HTTPフィンガープリンティングコンポジット
    scan-paths.ts         # パス発見コンポジット
    scan-waf.ts           # WAF/CDN検出コンポジット
    scan-services.ts      # サービスプローブコンポジット
    analyze.ts            # パッシブ分析コンポジット
    correlate.ts          # 相関エンジンコンポジット
    enumerate.ts          # スコープ拡張コンポジット
    osint.ts              # OSINTエンリッチメントコンポジット
    meta.ts               # サーバーメタコンポジット
    helpers.ts            # 共有コンポジットヘルパー
  tcp/                    # TCPプローブテクニック（3）
  tls/                    # TLS/SSL分析テクニック（8）
  ssh/                    # SSHプローブテクニック（3）
  http/                   # HTTPフィンガープリンティングテクニック（16）
  web/                    # Web技術検出テクニック（9）
  path/                   # パス発見テクニック（5）
  dns/                    # DNSインテリジェンステクニック（7）
  waf/                    # WAF/CDN検出テクニック（4）
  timing/                 # タイミング分析テクニック（2）
  h2/                     # HTTP/2 & HTTP/3テクニック（3）
  smtp/                   # SMTPプローブテクニック（2）
  iot/                    # IoT/組み込み検出テクニック（2）
  app/                    # アプリケーション検出テクニック（3）
  service/                # サービスプローブテクニック（5）
  infra/                  # インフラ検出テクニック（3）
  correlation/            # 相関エンジン（5）
  identify/               # 識別エンジン（3）
  passive/                # パッシブ分析（3）
  osint/                  # OSINTエンリッチメントテクニック（6）
  enum/                   # 列挙テクニック（8）
  meta/                   # メタツール（3）
  data/                   # シグネチャデータベースとパターンライブラリ
    jarm-signatures.ts    # 既知のJARMフィンガープリント（C2、サーバー、CDN）
    waf-signatures.ts     # WAF検出シグネチャ
    service-banners.ts    # サービスバナーパターン
    tech-patterns.ts      # 技術検出パターン
    favicon-hashes.ts     # 既知のfavicon MurmurHash3値
    c2-signatures.ts      # C2フレームワークシグネチャ
    ...                   # 15以上のシグネチャ/パターンデータベース
```

**設計上の決定：**

- **13のコンポジットツール、103のテクニック** &mdash; エージェントは高レベルツール（`recon`、`scan_tls`、`scan_http`）を呼び出します。各コンポジットは複数の低レベルテクニックをオーケストレーションし、相関された結果を返します。これにより粒度を維持しながらツール呼び出しのオーバーヘッドを削減します。
- **21プロバイダー、1サーバー** &mdash; すべてのフィンガープリンティングレイヤーが独立したモジュールです。コンポジットオーケストレーターがコンテキストと深度に基づいてテクニックを選択します。
- **アクティブ優先、OSINTはオプション** &mdash; 80以上のテクニックがAPIキーなしでターゲットを直接プローブして動作します。OSINTプロバイダー（Shodan、Censys、VirusTotal、SecurityTrails）はエンリッチメントを追加しますが、決して必須ではありません。
- **プロバイダーごとのレートリミッター** &mdash; 各プロバイダーが独自の`RateLimiter`インスタンスを持ちます。アクティブプローブは検出を避けるためレート制限され、OSINT APIはそれぞれのクォータに合わせて調整されています。
- **TTLキャッシュ** &mdash; DNSレコード（10分）、OSINT結果（15分）、CTログ（30分）がキャッシュされ、マルチツールワークフロー中の冗長な検索を回避します。
- **グレースフルデグラデーション** &mdash; 不足しているAPIキーがサーバーをクラッシュさせることはありません。OSINTツールは説明的なメッセージを返します：「Shodanホスト検索を有効にするにはSHODAN_API_KEYを設定してください。」
- **3つの依存関係** &mdash; `@modelcontextprotocol/sdk`、`zod`、`cheerio`。すべてのネットワークI/Oはネイティブの`fetch()`とNode.jsの`net`/`tls`/`dns`モジュール経由です。nmapなし、外部バイナリなし。

---

## 制限事項

- OSINTツール（Shodan、Censys、VirusTotal、SecurityTrails）はそれぞれのテクニックにAPIキーが必要
- Censys無料プランは月250クエリに制限
- VirusTotal無料プランは日500クエリに制限
- ポートスキャンはTCPコネクト（SYNスキャンではない）を使用 &mdash; nmapより隠密性が低いがroot権限は不要
- JARMフィンガープリンティングはターゲットへの直接TCPアクセスが必要（ファイアウォールによりブロックされる場合あり）
- UPnP/SSDP発見はローカルネットワークでのみ動作
- サービスプローブ（MySQL、PostgreSQL、Redis）は接続するが認証しない
- サブドメイン列挙はCTログとパッシブソースに依存（ブルートフォースなし）
- macOS / Linuxでテスト済み（Windowsは未テスト）

---

## MCPセキュリティスイートの一部

| プロジェクト | ドメイン | ツール |
|------------|---------|--------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | ブラウザベースのセキュリティテスト | 39ツール、Firefox、インジェクションテスト |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | クラウドセキュリティ（AWS/Azure/GCP） | 38ツール、60以上のチェック |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHubセキュリティ態勢 | 39ツール、45チェック |
| [cve-mcp](https://github.com/badchars/cve-mcp) | 脆弱性インテリジェンス | 23ツール、5ソース |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINTとリコネサンス | 37ツール、12ソース |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | ダークウェブと脅威インテリジェンス | 66ツール、16ソース |
| **fingerprint-mcp** | **ユニバーサルデジタルフィンガープリンティング** | **13ツール、103テクニック、21プロバイダー** |

---

<p align="center">
<b>認可されたセキュリティテストと評価にのみ使用してください。</b><br>
ターゲットに対してフィンガープリンティングを実行する前に、必ず適切な認可を得てください。
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0ライセンス</a> &bull; Bun + TypeScriptで構築
</p>
