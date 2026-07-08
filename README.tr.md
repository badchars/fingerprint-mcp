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
  <strong>Türkçe</strong> |
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

<h3 align="center">AI ajanlar icin evrensel dijital parmak izi.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, servis tarama, JARM, JA4X, favicon hash'leme, altyapi topolojisi, C2 tespiti, OSINT zenginlestirme &mdash; tek bir MCP sunucusunda birlestirildi.<br>
  AI ajaniniz <b>talep uzerine tam spektrumlu parmak izi</b> alir, 11 bagimsiz CLI araci ve manuel korelasyon degil.
</p>

<br>

<p align="center">
  <a href="#sorun">Sorun</a> &bull;
  <a href="#nasil-farkli">Nasil Farkli</a> &bull;
  <a href="#hizli-baslangic">Hizli Baslangic</a> &bull;
  <a href="#ai-neler-yapabilir">AI Neler Yapabilir</a> &bull;
  <a href="#arac-referansi-13-arac-103-teknik">Araclar (13)</a> &bull;
  <a href="#veri-kaynaklari-21">Veri Kaynaklari</a> &bull;
  <a href="#mimari">Mimari</a> &bull;
  <a href="CHANGELOG.md">Degisiklik Gunlugu</a> &bull;
  <a href="CONTRIBUTING.md">Katki</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Lisans"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Arac">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Teknik">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="fingerprint-mcp demo" width="800">
</p>

---

## Sorun

Bugunku sunucu parmak izi alma islemi, bir durine birbirinden bagimsiz aracla ugrasmayi gerektirir. Port taramasi icin `nmap`, sertifika analizi icin `testssl.sh`, HTTP basliklari icin `curl -I`, DNS icin `dig`, WAF tespiti icin `wafw00f`, SSH icin `ssh-audit`, ayri bir JARM araci, teknoloji tespiti icin Wappalyzer calistirirsiniz &mdash; sonra gercekte neyin calistigini anlamak icin 30 dakika boyunca her seyi bir elektronik tabloda manuel olarak carpraz referanslarsiniz.

```
Geleneksel parmak izi alma is akisi:
  TLS sertifikalarini analiz et    ->  testssl.sh / openssl s_client
  HTTP basliklarini yakala          ->  curl -I
  web teknolojilerini tespit et     ->  wappalyzer CLI
  DNS kesfet                       ->  dig / nslookup / dnsenum
  port taramasi                    ->  nmap -sV
  WAF tespiti                      ->  wafw00f
  SSH denetimi                     ->  ssh-audit
  servis parmak izi                ->  nmap scripts
  JARM parmak izi                  ->  jarm (ayri arac)
  OSINT veritabanlarini kontrol et ->  shodan CLI, censys CLI
  her seyi iliskilendir            ->  manuel olarak elektronik tabloda
  ──────────────────────────────
  Toplam: 11 arac, 30+ dakika, manuel korelasyon
```

**fingerprint-mcp**, AI ajaniniza [Model Context Protocol](https://modelcontextprotocol.io) uzerinden 21 saglayicidaki 103 parmak izi tekniklerini kapsayan 13 bilesik arac sunar. Ajan, cok katmanli parmak izini paralel olarak calistirir, TCP/TLS/HTTP/DNS/SSH katmanlari arasinda sinyalleri iliskilendirir, bal kukasi ve C2 altyapisini tespit eder ve birlesik bir istihbarat tablosu sunar &mdash; tek bir gorusmede.

```
fingerprint-mcp ile:
  Siz: "target.com uzerinde derin kesif yap"

  Ajan: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0, JARM ile (3fd21b20d00000...),
            Let's Encrypt sertifikasi, 2 SANs, TLS 1.2+1.3
         -> HTTP: Cloudflare WAF arkasinda Express.js,
            React SPA, Google Analytics, 14 guvenlik basligi analiz edildi
         -> DNS: A/AAAA/MX/TXT kayitlari, SPF/DKIM/DMARC yapilandirilmis,
            CNAME/MX uzerinden Slack + Google Workspace tespit edildi
         -> Portlar: 80, 443, 22 (OpenSSH 9.6), 8080 (gelistirme sunucusu)
         -> WAF: Cloudflare tespit edildi, kaynak IP dogrudan baglanti ile kesfedildi
         -> Numaralandirma: CT loglari uzerinden 12 alt alan adi, wildcard DNS tespit edildi
         -> "target.com, Cloudflare WAF arkasinda Express.js ile nginx/1.24.0
            calistiriyor. Kaynak IP 203.0.113.42, port 8080'de aciga cikmis.
            TLS dogru yapilandirilmis (A+ esdegeri) ancak 8080'deki gelistirme
            sunucusu WAF korumasi olmadan calisiyor. 3 alt alan adi
            devre disi birakilmis altyapiya isaret ediyor — potansiyel ele gecirme riski."
```

---

## Nasil Farkli

Mevcut araclar size bir seferde tek katman ham veri verir. fingerprint-mcp, AI ajaniniza **tum parmak izi katmanlarinda ayni anda muhakeme etme** yetenegini kazandirir.

<table>
<thead>
<tr>
<th></th>
<th>Geleneksel Yaklasim</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Arayuz</b></td>
<td>Farkli cikti formatlarinda 11 farkli CLI araci</td>
<td>MCP &mdash; AI ajani araclari konusarak cagirir</td>
</tr>
<tr>
<td><b>Teknikler</b></td>
<td>Bir arac, bir seferde bir katman</td>
<td>21 saglayicide 103 teknik, paralel calistirilir</td>
</tr>
<tr>
<td><b>TLS analizi</b></td>
<td>testssl.sh ciktisi, JARM'i ayrica manuel olarak ayristirma</td>
<td>Ajan sertifika + JARM + JA4X + sifreleme paketleri + SNI + CT loglarini tek cagri ile birlestirir</td>
</tr>
<tr>
<td><b>Korelasyon</b></td>
<td>Sonuclari bir elektronik tabloya kopyala-yapistir</td>
<td>Ajan capraz iliskilendirir: "JARM bilinen C2 cercevesi ile eslesiyor, HTTP zamanlama bal kukasini dogruluyor"</td>
</tr>
<tr>
<td><b>WAF atlama</b></td>
<td>wafw00f WAF'i tespit eder, kaynak icin manuel olarak ararsiniz</td>
<td>Ajan WAF'i tespit eder, kaynak IP'yi bulur ve ayni icerigi sundugunu dogrular</td>
</tr>
<tr>
<td><b>API anahtarlari</b></td>
<td>Shodan, Censys vb. icin gerekli</td>
<td>80+ aktif teknik hicbir API anahtari olmadan calisir; anahtarlar OSINT zenginlestirmesini acar</td>
</tr>
<tr>
<td><b>Kurulum</b></td>
<td>nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer yukle...</td>
<td><code>npx fingerprint-mcp</code> &mdash; tek komut, sifir yapilandirma</td>
</tr>
</tbody>
</table>

---

## Hizli Baslangic

### Secenek 1: npx (kurulum gerektirmez)

```bash
npx fingerprint-mcp
```

Tum 80+ aktif parmak izi teknigi aninda calisir. TCP, TLS, SSH, HTTP, DNS, WAF, yol, servis, zamanlama, IoT, SMTP, altyapi ve uygulama parmak izi icin API anahtari gerekmez.

### Secenek 2: Klonla

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Ortam degiskenleri (istege bagli)

```bash
# OSINT zenginlestirme (tamami istege bagli — aktif parmak izi herhangi bir anahtar olmadan calisir)
export SHODAN_API_KEY=your-key           # osint_shodan, ssh_hostkey_lookup'u etkinlestirir
export CENSYS_API_ID=your-id             # osint_censys'i etkinlestirir (ucretsiz: 250 sorgu/ay)
export CENSYS_API_SECRET=your-secret     # Censys API sifresi
export SECURITYTRAILS_API_KEY=your-key   # waf_origin, enum_passive_dns'i etkinlestirir
export VIRUSTOTAL_API_KEY=your-key       # osint_virustotal'i etkinlestirir (ucretsiz: 500 sorgu/gun)
```

Tum API anahtarlari istege baglidir. Bunlar olmadan, yine de tam TCP/TLS/SSH/HTTP/DNS/WAF/yol/servis/zamanlama/IoT/SMTP/altyapi/uygulama parmak izi, korelasyon, pasif analiz, numaralandirma ve meta araclari elde edersiniz &mdash; hedefi dogrudan tarayarak calisan 80+ teknik.

### AI ajaniniza baglayin

<details open>
<summary><b>Claude Code</b></summary>

```bash
# npx ile
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Yerel klon ile
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

`~/Library/Application Support/Claude/claude_desktop_config.json` dosyasina ekleyin:

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
<summary><b>Cursor / Windsurf / diger MCP istemcileri</b></summary>

Ayni JSON yapilandirma formati. Komutu `npx fingerprint-mcp` veya yerel kurulum yolunuza yonlendirin.

</details>

### Sorgulamaya baslayin

```
Siz: "target.com hakkinda her seyin parmak izini al — TLS, HTTP yigini, WAF, DNS, acik portlar"
```

Hepsi bu. Ajan cok katmanli parmak izi, sinyal korelasyonu ve altyapi analizini otomatik olarak yonetir.

---

## AI Neler Yapabilir

### Hizli Kesif

```
Siz: "target.com uzerinde hizli kesif"

Ajan: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: portlar 80, 443, 22 acik
       -> TLS: Let's Encrypt RSA sertifikasi, TLS 1.2+1.3, nginx JARM imzasi
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM yapilandirilmis
       -> WAF: Cloudflare tespit edildi (cf-ray basligi)
       -> "target.com, Cloudflare CDN uzerinden sunulan nginx/1.24.0
          arkasinda Express.js uzerinde bir React SPA'dir. TLS, Let's Encrypt
          ile dogru yapilandirilmis. Port 22'de SSH, OpenSSH 9.6 calistiriyor.
          E-posta, tam SPF/DKIM/DMARC ile Google Workspace tarafindan yonetiliyor."
```

### Derin TLS Incelemesi

```
Siz: "suspicious-server.com'un TLS yapilandirmasini detayli analiz et"

Ajan: -> scan_tls {host: "suspicious-server.com"}

       -> Sertifika: kendinden imzali, CN=localhost, 47 gun once suresi dolmus
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (Cobalt Strike varsayilan profili ile eslesiyor)
       -> JA4X: parmak izi bilinen C2 cercevesi deseni ile eslesiyor
       -> Sifreleme paketleri: zayif sifreleme kabul ediyor (RC4, 3DES)
       -> SNI: herhangi bir SNI degerine ayni sekilde yanit veriyor
       -> CT loglari: sertifika kaydedilmemis (halka acik guvenilir degil)
       -> "YUKSEK RISK: TLS yapilandirmasi guclu bir sekilde C2 altyapisina isaret ediyor.
          Kendinden imzali suresi dolmus sertifika, JARM parmak izi Cobalt Strike ile eslesiyor,
          zayif sifreleme kabul ediyor ve rastgele SNI degerlerine yanit veriyor.
          Acil sorusturma ve engelleme onerilir."
```

### WAF Atlama ve Kaynak Kesfetme

```
Siz: "target.com bir WAF arkasinda. Kaynak sunucuyu bulabilir misin?"

Ajan: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), supeli isteklerde challenge sayfasi
       -> DNS: A kaydi Cloudflare IP 104.21.x.x'e isaret ediyor
       -> Alt alan adlari: dev.target.com, 203.0.113.42'ye cozumleniyor (Cloudflare-disi)
       -> 203.0.113.42:443'e dogrudan baglanti ayni TLS sertifikasini donduruyor
       -> SecurityTrails gecmisi: Cloudflare'den once kaynak 203.0.113.42 idi
       -> "Kaynak IP bulundu: 203.0.113.42. dev.target.com alt alan adi uzerinden
          kesfedildi, Cloudflare'i atliyor. Kaynak ayni TLS sertifikasini sunuyor
          ve target.com Host basligina yanit veriyor.
          Kaynagin WAF korumasi yok — dogrudan erisim mumkun."
```

### Bir Host'ta Servis Kesfetme

```
Siz: "10.0.1.50 uzerinde hangi servisler calisiyor?"

Ajan: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Port 22: OpenSSH 8.9p1 Ubuntu, ED25519 host anahtari
       -> Port 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Port 3306: MySQL 8.0.36, kimlik dogrulama gerekli
       -> Port 5432: PostgreSQL 16.1, SSL gerekli
       -> Port 6379: Redis 7.2.4, kimlik dogrulama YOK (acik)
       -> Port 8080: Node.js Express gelistirme sunucusu, CORS: *
       -> "KRITIK: Port 6379'daki Redis kimlik dogrulama icermiyor — agdaki herkes
          veri okuyabilir/yazabilir. 8080'deki Express gelistirme sunucusu
          wildcard CORS'a sahip. MySQL ve PostgreSQL dogru sekilde kimlik dogrulama
          gerektiriyor. WordPress 2 minor surum geride. Redis ve gelistirme
          sunucusu ifsa konusunda acil eylem gerekli."
```

---

## Arac Referansi (13 arac, 103 teknik)

<details open>
<summary><b>recon &mdash; Derinlik tabanli teknik secimi ile tam kesif</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `url` | string | Parmak izi alinacak hedef URL |
| `depth` | `quick` \| `standard` \| `deep` | Tarama derinligi: quick=5 teknik, standard=20, deep=50+ |

Derinlik seviyesine gore tum saglayicilardan teknikleri duzenler. Hizli mod kisa bir genel bakis verir; derin mod numaralandirma, OSINT ve korelasyon dahil kapsamli parmak izi calistirir.

</details>

<details>
<summary><b>scan_ports &mdash; Servis tespitli TCP port taramasi (3 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `host` | string | Hedef host (IP veya alan adi) |
| `ports` | number[] | Istege bagli &mdash; taranacak belirli portlar (varsayilan yaygin portlar) |

| Teknik | Aciklama |
|--------|----------|
| `tcp_probe` | Acik portlari tespit icin TCP connect taramasi |
| `tcp_banner` | Servis tespiti icin acik portlarda banner yakalama |
| `tcp_analysis` | Port kombinasyonu analizi ve servis cikarimi |

</details>

<details>
<summary><b>scan_tls &mdash; Kapsamli TLS/SSL analizi (8 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `host` | string | Hedef host (IP veya alan adi) |
| `port` | number | Istege bagli &mdash; TLS portu (varsayilan: 443) |

| Teknik | Aciklama |
|--------|----------|
| `tls_certificate` | X.509 sertifika ayristirma &mdash; konu, veren, SANs, gecerlilik, zincir |
| `tls_jarm` | JARM aktif parmak izi &mdash; 10 TLS Client Hello sondasi, 62 karakterlik hash |
| `tls_ja4x` | Sertifika ozelliklerinden JA4X pasif TLS parmak izi |
| `tls_ciphers` | Sifreleme paketi numaralandirma ve guc analizi |
| `tls_protocols` | Desteklenen TLS protokol surumu tespiti (SSLv3'ten TLS 1.3'e) |
| `tls_sni` | SNI davranis testi &mdash; varsayilan sertifika ile istenen host adi karsilastirmasi |
| `tls_ct_logs` | crt.sh uzerinden Certificate Transparency log sorgusu |
| `tls_ocsp` | OCSP zımbalama ve iptal durumu kontrolu |

</details>

<details>
<summary><b>scan_dns &mdash; DNS istihbarati (7 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `domain` | string | Hedef alan adi |

| Teknik | Aciklama |
|--------|----------|
| `dns_records` | Tam kayit numaralandirma &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | SPF, DKIM ve DMARC kayit analizi |
| `dns_saas` | CNAME ve MX desenleri uzerinden SaaS/servis tespiti (Slack, Zendesk vb.) |
| `dns_server` | DNS sunucu parmak izi (BIND, PowerDNS, Cloudflare vb.) |
| `dns_takeover` | Sarkan CNAME analizi ile alt alan adi ele gecirme tespiti |
| `dns_zone` | Bolge aktarimi denemesi (AXFR) |
| `dns_caa` | Sertifika yetkilisi kisitlamalari icin CAA kayit analizi |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/web parmak izi (29 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `url` | string | Hedef URL |

| Teknik | Saglayici | Aciklama |
|--------|-----------|----------|
| `http_headers` | HTTP | Yanit basligi analizi ve sunucu tespiti |
| `http_header_order` | HTTP | Baslik sirasi parmak izi (sunucu yazilim imzasi) |
| `http_security_headers` | HTTP | Guvenlik basligi denetimi (CSP, HSTS, X-Frame-Options vb.) |
| `http_cookies` | HTTP | Cerez analizi &mdash; bayraklar, on ekler, cerceve tespiti |
| `http_methods` | HTTP | Izin verilen HTTP metod numaralandirmasi (OPTIONS) |
| `http_cors` | HTTP | CORS politika analizi ve yapilandirma hatasi tespiti |
| `http_compression` | HTTP | Desteklenen sıkistirma algoritmalari (gzip, br, zstd) |
| `http_caching` | HTTP | Onbellek basligi analizi (CDN, ters proxy tespiti) |
| `http_etag` | HTTP | Arka uc tespiti icin ETag format analizi |
| `http_error` | HTTP | Hata sayfasi parmak izi (ozel ile varsayilan hata sayfalari) |
| `http_redirect` | HTTP | Yonlendirme zinciri analizi |
| `http_timing` | HTTP | Sunucu performans profilleme icin yanit zamanlama temel cizgisi |
| `http_favicon` | HTTP | Teknoloji tespiti icin favicon hash (MurmurHash3) |
| `http_robots` | HTTP | robots.txt ayristirma ve yasakli yol cikarimi |
| `http_sitemap` | HTTP | Site haritasi kesfetme ve URL cikarimi |
| `http_wellknown` | HTTP | .well-known uc nokta kesfetme (security.txt, openid vb.) |
| `web_tech` | Web | HTML/JS/CSS desenleri uzerinden teknoloji tespiti |
| `web_analytics` | Web | Analitik ve izleme servisi tespiti |
| `web_sourcemaps` | Web | Source map dosyasi kesfetme |
| `web_websocket` | Web | WebSocket uc nokta tespiti |
| `web_graphql` | Web | GraphQL uc nokta tespiti ve introspeksiyon |
| `web_spa` | Web | Tek sayfa uygulama cercevesi tespiti |
| `web_cdn` | Web | Yanit basliklari ve DNS uzerinden CDN tespiti |
| `web_meta` | Web | HTML meta etiket analizi (uretici, cerceve ipuclari) |
| `web_feed` | Web | RSS/Atom feed kesfetme |
| `h2_detect` | HTTP/2 | HTTP/2 protokol destegi tespiti |
| `h2_fingerprint` | HTTP/2 | HTTP/2 sunucu parmak izi (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Alt-Svc basligi uzerinden HTTP/3 (QUIC) destek tespiti |
| `app_cms` | Application | CMS tespiti (WordPress, Drupal, Joomla vb.) |

</details>

<details>
<summary><b>scan_paths &mdash; Yol istihbarati (5 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `url` | string | Hedef URL |
| `categories` | string[] | Istege bagli &mdash; kontrol edilecek kategoriler (sensitive, git, debug, api, config) |

| Teknik | Aciklama |
|--------|----------|
| `path_sensitive` | Hassas dosya kesfetme (yedek dosyalar, yapilandirma dosyalari, veritabani dokumu) |
| `path_robots` | Gizli yollar icin robots.txt ve sitemap.xml analizi |
| `path_git` | Git deposu sizintisi tespiti (.git/HEAD, .git/config) |
| `path_debug` | Hata ayiklama uc noktasi kesfetme (phpinfo, server-status, debug konsollari) |
| `path_api` | API surumu ve dokumantasyon uc noktasi kesfetme |

</details>

<details>
<summary><b>scan_waf &mdash; WAF/CDN tespiti ve parmak izi (4 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `url` | string | Hedef URL |

| Teknik | Aciklama |
|--------|----------|
| `waf_detect` | Yanit basligi ve davranis analizi ile WAF varlik tespiti |
| `waf_cdn` | CDN saglayici tespiti (Cloudflare, Akamai, Fastly vb.) |
| `waf_fingerprint` | WAF urun tespiti ve surum belirleme |
| `waf_origin` | WAF/CDN arkasindaki kaynak IP kesfetme (`SECURITYTRAILS_API_KEY` gerektirir) |

</details>

<details>
<summary><b>scan_services &mdash; Servis duzeyi tarama (12 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `host` | string | Hedef host (IP veya alan adi) |
| `ports` | number[] | Istege bagli &mdash; taranacak belirli portlar |
| `service` | string | Istege bagli &mdash; taranacak belirli servis (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Teknik | Saglayici | Aciklama |
|--------|-----------|----------|
| `ssh_probe` | SSH | SSH protokol surumu ve yazilim tespiti |
| `ssh_algorithms` | SSH | SSH algoritma denetimi (KEX, sifreler, MAC'ler, host anahtar turleri) |
| `ssh_hostkey_lookup` | SSH | Shodan uzerinden SSH host anahtar sorgusu (`SHODAN_API_KEY` gerektirir) |
| `svc_mysql` | Service | MySQL surum tespiti ve yetenek parmak izi |
| `svc_postgres` | Service | PostgreSQL surum tespiti ve SSL destek kontrolu |
| `svc_redis` | Service | Redis surum tespiti ve kimlik dogrulama durumu |
| `svc_ftp` | Service | FTP banner analizi ve anonim giris kontrolu |
| `svc_vnc_rdp` | Service | VNC/RDP servis tespiti ve guvenlik degerlendirmesi |
| `smtp_banner` | SMTP | SMTP banner analizi ve MTA tespiti |
| `smtp_starttls` | SMTP | SMTP STARTTLS destegi ve sertifika incelemesi |
| `iot_detect` | IoT | Banner desenleri ve varsayilan sayfalar uzerinden IoT cihaz tespiti |
| `iot_upnp` | IoT | Yerel agda UPnP/SSDP cihaz kesfetme |

</details>

<details>
<summary><b>enumerate &mdash; Kapsam genisletme (8 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `domain` | string | Hedef alan adi |

| Teknik | Aciklama |
|--------|----------|
| `enum_subdomains` | Birden fazla yontemle alt alan adi numaralandirma |
| `enum_wildcard` | Wildcard DNS tespiti |
| `enum_tld` | TLD genisletme (target.com -> target.net, target.org vb.) |
| `enum_related` | Paylasilan altyapi uzerinden ilgili alan adi kesfetme |
| `enum_asn` | ASN komsu kesfetme &mdash; ayni agdaki diger alan adlari |
| `enum_ct` | Certificate Transparency log alt alan adi cikarimi |
| `enum_passive_dns` | Pasif DNS gecmisi (`SECURITYTRAILS_API_KEY` gerektirir) |
| `enum_scope` | Kapsam ozeti ve saldiri yuzeyi genel bakisi |

</details>

<details>
<summary><b>osint &mdash; OSINT zenginlestirme (6 teknik)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `target` | string | Zenginlestirilecek IP adresi veya alan adi |
| `type` | `ip` \| `domain` | Istege bagli &mdash; hedef tipi (belirtilmezse otomatik tespit) |

| Teknik | Kimlik Dogrulama | Aciklama |
|--------|------------------|----------|
| `osint_shodan` | `SHODAN_API_KEY` | Shodan host sorgusu &mdash; acik portlar, bannerlar, zafiyetler, isletim sistemi |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Censys host verisi &mdash; servisler, TLS, otonom sistem |
| `osint_reverse_ip` | Yok | Ters IP sorgusu &mdash; ayni IP'deki diger alan adlari |
| `osint_whois` | Yok | WHOIS kayit verisi &mdash; kayit kurulusu, tarihler, ad sunuculari |
| `osint_webarchive` | Yok | Web Archive gecmisi &mdash; ilk/son anlık goruntu, degisim sikligi |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | VirusTotal alan adi/IP raporu &mdash; tespitler, kategoriler, DNS |

</details>

<details>
<summary><b>analyze &mdash; Pasif parmak izi analizi (3 mod)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `type` | `headers` \| `html` \| `banner` | Analiz edilecek veri tipi |
| `data` | string | Analiz edilecek ham veri (basliklari, HTML'i veya banner ciktisini yapistirin) |

| Mod | Aciklama |
|-----|----------|
| `fp_analyze_headers` | Pasif HTTP baslik analizi &mdash; trafik gondermeden sunucu, cerceve, proxy tespiti |
| `fp_analyze_html` | Pasif HTML analizi &mdash; kaynaktan teknoloji tespiti, cerceve belirleme |
| `fp_analyze_banner` | Pasif banner analizi &mdash; ham banner metninden servis tespiti |

</details>

<details>
<summary><b>correlate &mdash; Coklu sinyal korelasyon motoru (7 mod)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Korelasyon modu |
| `signals` | object | Iliskilendirilecek parmak izi sinyalleri (moda gore degisir) |

| Mod | Aciklama |
|-----|----------|
| `fp_consistency` | Katmanlar arasi sinyal tutarliligi kontrolu &mdash; TCP, TLS, HTTP ve DNS parmak izleri uyusuyor mu? |
| `fp_honeypot` | Bal kukasi tespiti &mdash; imkansiz servis kombinasyonlari ve davranissal anomalileri kontrol eder |
| `fp_spoofing` | Sahtecilik tespiti &mdash; sunucu basliklari ile gercek davranis arasindaki uyumsuzluklari belirler |
| `fp_compare` | Iki hostun parmak izi profillerinin yan yana karsilastirmasi |
| `fp_topology` | Altyapi topolojisi haritalama &mdash; CDN, yuk dengeleyici, ters proxy zinciri |
| `fp_c2` | JARM, TLS, HTTP ve zamanlama korelasyonu ile C2 cerceve tespiti |
| `fp_identify` | Bilinen imza veritabanina karsi hash tabanli tanimlama |

</details>

<details>
<summary><b>meta &mdash; Sunucu yapilandirmasi ve verileri (3 mod)</b></summary>

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| `category` | string | Istege bagli &mdash; kategoriye gore filtrele |

| Mod | Aciklama |
|-----|----------|
| `fp_sources` | Yapilandirma ve API anahtar durumu ile tum kullanilabilir veri kaynaklarini listele |
| `fp_config` | Sunucu yapilandirmasi &mdash; surum, yuklenen saglayicilar, teknik sayisi |
| `fp_signatures` | Imza veritabani listeleme &mdash; JARM, banner, WAF, uygulama imzalari |

</details>

---

### CLI Kullanimi

```bash
# Tum kullanilabilir araclari ve teknikleri listele
npx fingerprint-mcp --list

# Herhangi bir araci dogrudan calistir
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

# OSINT araclari (API anahtarlari gerektirir)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Veri Kaynaklari (21)

| Kaynak | Kimlik Dogrulama | Sagladiklari |
|--------|------------------|--------------|
| TCP tarama | Yok | Port taramasi, banner yakalama, servis tespiti |
| TLS/SSL analizi | Yok | Sertifika ayristirma, JARM parmak izi, JA4X, sifreleme numaralandirma, SNI testi |
| SSH tarama | Yok | Protokol surumu, algoritma denetimi, yazilim tespiti |
| HTTP analizi | Yok | Baslik parmak izi, favicon hash'leme, cerez analizi, metod numaralandirma, CORS |
| Web tespiti | Yok | Teknoloji tespiti, analitik, source map, WebSocket, GraphQL, SPA cerceveleri |
| Yol kesfetme | Yok | Hassas dosyalar, git sizintilari, hata ayiklama uc noktalari, API surumleri, robots.txt |
| DNS cozumleme | Yok | Kayit numaralandirma, e-posta kimlik dogrulama analizi, SaaS tespiti, sunucu parmak izi |
| WAF/CDN tespiti | Yok | WAF tespiti, CDN tespiti, WAF parmak izi |
| Zamanlama analizi | Yok | Yanit zamanlama temel cizgisi, saat kaymasi tespiti |
| HTTP/2 ve HTTP/3 | Yok | HTTP/2 tespiti ve parmak izi, HTTP/3 Alt-Svc kesfetme |
| SMTP tarama | Yok | SMTP banner analizi, STARTTLS incelemesi |
| IoT/Gomulu | Yok | IoT cihaz tespiti, UPnP/SSDP kesfetme |
| Uygulama tespiti | Yok | CMS, cerceve ve e-ticaret platformu tespiti |
| Servis tarama | Yok | MySQL, PostgreSQL, Redis, FTP, VNC/RDP parmak izi |
| Altyapi tespiti | Yok | Bulut saglayici, barindirma saglayici, CDN tespiti |
| Korelasyon motoru | Yok | Sinyal tutarliligi, bal kukasi tespiti, sahtecilik tespiti, topoloji haritalama |
| Tanimlama motoru | Yok | Hash tabanli tanimlama, C2 tespiti, imza eslestirme |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Host istihbarati &mdash; acik portlar, bannerlar, zafiyetler, isletim sistemi tespiti |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Host verisi &mdash; servisler, TLS sertifikalari, otonom sistem bilgisi |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | WAF kaynak kesfetme, pasif DNS gecmisi, tarihsel kayitlar |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Alan adi/IP itibar, tespit sonuclari, DNS gecmisi, kategoriler |

---

## Mimari

```
src/
  index.ts                # CLI giris noktasi (--help, --list, --tool, stdio sunucusu)
  protocol/
    mcp-server.ts         # MCP sunucu kurulumu (stdio aktarim)
    tools.ts              # Arac kayit defteri — tum 13 bilesik arac burada kayitli
  types/
    index.ts              # Paylasilan tipler (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Saglayici basina hiz sinirlandirici
    cache.ts              # API yanitlari icin TTL onbellek
    require-key.ts        # API anahtar dogrulama yardimcisi
    murmurhash3.ts        # Favicon hash'leme icin MurmurHash3
  composite/              # 13 bilesik arac duzenleyici
    recon.ts              # Tam kesif duzenleyici (quick/standard/deep)
    scan-ports.ts         # Port taramasi bilesik
    scan-tls.ts           # TLS analizi bilesik
    scan-dns.ts           # DNS istihbarati bilesik
    scan-http.ts          # HTTP parmak izi bilesik
    scan-paths.ts         # Yol kesfetme bilesik
    scan-waf.ts           # WAF/CDN tespiti bilesik
    scan-services.ts      # Servis tarama bilesik
    analyze.ts            # Pasif analiz bilesik
    correlate.ts          # Korelasyon motoru bilesik
    enumerate.ts          # Kapsam genisletme bilesik
    osint.ts              # OSINT zenginlestirme bilesik
    meta.ts               # Sunucu meta bilesik
    helpers.ts            # Paylasilan bilesik yardimcilar
  tcp/                    # TCP tarama teknikleri (3)
  tls/                    # TLS/SSL analiz teknikleri (8)
  ssh/                    # SSH tarama teknikleri (3)
  http/                   # HTTP parmak izi teknikleri (16)
  web/                    # Web teknoloji tespit teknikleri (9)
  path/                   # Yol kesfetme teknikleri (5)
  dns/                    # DNS istihbarat teknikleri (7)
  waf/                    # WAF/CDN tespit teknikleri (4)
  timing/                 # Zamanlama analiz teknikleri (2)
  h2/                     # HTTP/2 ve HTTP/3 teknikleri (3)
  smtp/                   # SMTP tarama teknikleri (2)
  iot/                    # IoT/gomulu tespit teknikleri (2)
  app/                    # Uygulama tespit teknikleri (3)
  service/                # Servis tarama teknikleri (5)
  infra/                  # Altyapi tespit teknikleri (3)
  correlation/            # Korelasyon motoru (5)
  identify/               # Tanimlama motoru (3)
  passive/                # Pasif analiz (3)
  osint/                  # OSINT zenginlestirme teknikleri (6)
  enum/                   # Numaralandirma teknikleri (8)
  meta/                   # Meta araclari (3)
  data/                   # Imza veritabanlari ve desen kutuphaneleri
    jarm-signatures.ts    # Bilinen JARM parmak izleri (C2, sunucular, CDN'ler)
    waf-signatures.ts     # WAF tespit imzalari
    service-banners.ts    # Servis banner desenleri
    tech-patterns.ts      # Teknoloji tespit desenleri
    favicon-hashes.ts     # Bilinen favicon MurmurHash3 degerleri
    c2-signatures.ts      # C2 cerceve imzalari
    ...                   # 15+ imza/desen veritabani
```

**Tasarim kararlari:**

- **13 bilesik arac, 103 teknik** &mdash; Ajan ust duzey araclari (`recon`, `scan_tls`, `scan_http`) cagirir. Her bilesik, birden fazla alt duzey teknigi duzenler ve iliskilendirilmis sonuclar dondurur. Bu, ayrinti duzeyini korurken arac-cagri yuku azaltir.
- **21 saglayici, 1 sunucu** &mdash; Her parmak izi katmani bagimsiz bir moduldur. Bilesik duzenleyici, baglam ve derinlige gore teknikleri secer.
- **Once aktif, OSINT istege bagli** &mdash; 80+ teknik sifir API anahtari ile hedefi dogrudan tarayarak calisir. OSINT saglayicilari (Shodan, Censys, VirusTotal, SecurityTrails) zenginlestirme ekler ancak asla gerekli degildir.
- **Saglayici basina hiz sinirlandiricilar** &mdash; Her saglayicinin kendi `RateLimiter` ornegi vardir. Aktif tarama, tespit edilmekten kacinmak icin hiz sinirlidir; OSINT API'leri kotalarına gore kalibre edilmistir.
- **TTL onbellekleme** &mdash; DNS kayitlari (10dk), OSINT sonuclari (15dk), CT loglari (30dk) coklu arac is akislari sirasinda gereksiz sorgulamalardan kacinmak icin onbelleklenir.
- **Zarifce bozulma** &mdash; Eksik API anahtarlari sunucuyu cokertmez. OSINT araclari aciklayici mesajlar dondurur: "Shodan host sorgulamasini etkinlestirmek icin SHODAN_API_KEY'i ayarlayin."
- **3 bagimlilik** &mdash; `@modelcontextprotocol/sdk`, `zod` ve `cheerio`. Tum ag G/C yerel `fetch()` ve Node.js `net`/`tls`/`dns` modulleri uzerinden. nmap yok, harici ikili dosya yok.

---

## Kisitlamalar

- OSINT araclari (Shodan, Censys, VirusTotal, SecurityTrails) ilgili teknikleri icin API anahtarlari gerektirir
- Censys ucretsiz katman ayda 250 sorgu ile sinirli
- VirusTotal ucretsiz katman gunde 500 sorgu ile sinirli
- Port taramasi TCP connect kullanir (SYN taramasi degil) &mdash; nmap'ten daha az gizli ancak root ayricaliklari gerektirmez
- JARM parmak izi hedefe dogrudan TCP erisimi gerektirir (guvenlik duvarlari tarafindan engellenebilir)
- UPnP/SSDP kesfetme yalnizca yerel aglarda calisir
- Servis tarama (MySQL, PostgreSQL, Redis) baglanir ancak kimlik dogrulama yapmaz
- Alt alan adi numaralandirma CT loglarina ve pasif kaynaklara dayanir (kaba kuvvet yok)
- macOS / Linux test edildi (Windows test edilmedi)

---

## MCP Guvenlik Paketinin Parcasi

| Proje | Alan | Araclar |
|-------|------|---------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Tarayici tabanli guvenlik testi | 39 arac, Firefox, enjeksiyon testi |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Bulut guvenligi (AWS/Azure/GCP) | 38 arac, 60+ kontrol |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | GitHub guvenlik durumu | 39 arac, 45 kontrol |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Zafiyet istihbarati | 23 arac, 5 kaynak |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT ve kesif | 37 arac, 12 kaynak |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Karanlik ag ve tehdit istihbarati | 66 arac, 16 kaynak |
| **fingerprint-mcp** | **Evrensel dijital parmak izi** | **13 arac, 103 teknik, 21 saglayici** |

---

<p align="center">
<b>Yalnizca yetkili guvenlik testi ve degerlendirmesi icindir.</b><br>
Herhangi bir hedef uzerinde parmak izi almadan once uygun yetkiye sahip oldugunuzdan her zaman emin olun.
</p>

<p align="center">
  <a href="LICENSE">AGPL-3.0 Lisansi</a> &bull; Bun + TypeScript ile yapildi
</p>
