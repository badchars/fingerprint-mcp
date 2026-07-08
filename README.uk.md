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
  <strong>Українська</strong> |
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

<h3 align="center">Універсальне цифрове зняття відбитків для AI-агентів.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, зондування сервісів, JARM, JA4X, хешування favicon, топологія інфраструктури, виявлення C2, збагачення OSINT &mdash; об'єднано в єдиний MCP сервер.<br>
  Ваш AI-агент отримує <b>повний спектр зняття відбитків на вимогу</b>, а не 11 роз'єднаних CLI інструментів та ручну кореляцію.
</p>

<br>

<p align="center">
  <a href="#проблема">Проблема</a> &bull;
  <a href="#чим-це-відрізняється">Чим це відрізняється</a> &bull;
  <a href="#швидкий-старт">Швидкий старт</a> &bull;
  <a href="#що-може-ai">Що може AI</a> &bull;
  <a href="#довідник-інструментів-13-інструментів-103-техніки">Інструменти (13)</a> &bull;
  <a href="#джерела-даних-21">Джерела даних</a> &bull;
  <a href="#архітектура">Архітектура</a> &bull;
  <a href="CHANGELOG.md">Журнал змін</a> &bull;
  <a href="CONTRIBUTING.md">Внесок</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Ліцензія"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 інструментів">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 техніки">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Демонстрація fingerprint-mcp" width="800">
</p>

---

## Проблема

Зняття відбитків сервера сьогодні означає жонглювання десятком роз'єднаних інструментів. Ви запускаєте `nmap` для сканування портів, `testssl.sh` для аналізу сертифікатів, `curl -I` для HTTP заголовків, `dig` для DNS, `wafw00f` для виявлення WAF, `ssh-audit` для SSH, окремий інструмент JARM, Wappalyzer для виявлення технологій &mdash; а потім витрачаєте 30 хвилин на ручне перехресне порівняння всього в електронній таблиці, щоб зрозуміти, що насправді працює.

```
Традиційний процес зняття відбитків:
  аналіз TLS сертифікатів        ->  testssl.sh / openssl s_client
  отримання HTTP заголовків      ->  curl -I
  виявлення веб-технологій       ->  wappalyzer CLI
  DNS розвідка                   ->  dig / nslookup / dnsenum
  сканування портів              ->  nmap -sV
  виявлення WAF                  ->  wafw00f
  аудит SSH                      ->  ssh-audit
  зняття відбитків сервісів      ->  nmap scripts
  JARM відбиток                  ->  jarm (окремий інструмент)
  перевірка баз OSINT            ->  shodan CLI, censys CLI
  кореляція всього               ->  вручну в електронній таблиці
  ──────────────────────────────
  Разом: 11 інструментів, 30+ хвилин, ручна кореляція
```

**fingerprint-mcp** надає вашому AI-агенту 13 композитних інструментів, що охоплюють 103 техніки зняття відбитків від 21 постачальника через [Model Context Protocol](https://modelcontextprotocol.io). Агент виконує багаторівневе зняття відбитків паралельно, корелює сигнали між рівнями TCP/TLS/HTTP/DNS/SSH, виявляє ханіпоти та C2 інфраструктуру і представляє єдину розвідувальну картину &mdash; в одній розмові.

```
З fingerprint-mcp:
  Ви: "Зроби глибоку розвідку target.com"

  Агент: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 через JARM (3fd21b20d00000...),
            сертифікат Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js за Cloudflare WAF,
            React SPA, Google Analytics, проаналізовано 14 заголовків безпеки
         -> DNS: записи A/AAAA/MX/TXT, налаштовано SPF/DKIM/DMARC,
            виявлено Slack + Google Workspace через CNAME/MX
         -> Порти: 80, 443, 22 (OpenSSH 9.6), 8080 (dev сервер)
         -> WAF: виявлено Cloudflare, знайдено IP-адресу джерела через direct-connect
         -> Перелік: 12 піддоменів через CT журнали, виявлено wildcard DNS
         -> "target.com працює на nginx/1.24.0 з Express.js за
            Cloudflare WAF. IP-адреса джерела 203.0.113.42 відкрита на порту 8080.
            TLS правильно налаштовано (еквівалент A+), але dev сервер
            на 8080 не має захисту WAF. 3 піддомени вказують на
            виведену з експлуатації інфраструктуру — потенційний ризик захоплення."
```

---

## Чим це відрізняється

Існуючі інструменти дають вам необроблені дані по одному рівню за раз. fingerprint-mcp дає вашому AI-агенту можливість **аналізувати всі рівні зняття відбитків одночасно**.

<table>
<thead>
<tr>
<th></th>
<th>Традиційний підхід</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Інтерфейс</b></td>
<td>11 різних CLI інструментів з різними форматами виводу</td>
<td>MCP &mdash; AI-агент викликає інструменти в розмові</td>
</tr>
<tr>
<td><b>Техніки</b></td>
<td>Один інструмент, один рівень за раз</td>
<td>103 техніки від 21 постачальника, виконуються паралельно</td>
</tr>
<tr>
<td><b>Аналіз TLS</b></td>
<td>Вивід testssl.sh, ручний розбір JARM окремо</td>
<td>Агент поєднує сертифікат + JARM + JA4X + набори шифрів + SNI + CT журнали в одному виклику</td>
</tr>
<tr>
<td><b>Кореляція</b></td>
<td>Копіювання результатів в електронну таблицю</td>
<td>Агент перехресно корелює: "JARM збігається з відомим C2 фреймворком, тайминг HTTP підтверджує ханіпот"</td>
</tr>
<tr>
<td><b>Обхід WAF</b></td>
<td>wafw00f виявляє WAF, ви вручну шукаєте джерело</td>
<td>Агент виявляє WAF, знаходить IP-адресу джерела і перевіряє, що вона повертає той самий контент</td>
</tr>
<tr>
<td><b>API ключі</b></td>
<td>Потрібні для Shodan, Censys тощо.</td>
<td>80+ активних технік працюють без будь-яких API ключів; ключі розблоковують збагачення OSINT</td>
</tr>
<tr>
<td><b>Налаштування</b></td>
<td>Встановіть nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; одна команда, нуль конфігурації</td>
</tr>
</tbody>
</table>

---

## Швидкий старт

### Варіант 1: npx (без встановлення)

```bash
npx fingerprint-mcp
```

Всі 80+ активних технік зняття відбитків працюють одразу. Не потрібні API ключі для TCP, TLS, SSH, HTTP, DNS, WAF, шляхів, сервісів, таймінгу, IoT, SMTP, інфраструктурного та прикладного зняття відбитків.

### Варіант 2: Клонування

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Змінні середовища (необов'язково)

```bash
# Збагачення OSINT (все необов'язкове — активне зняття відбитків працює без будь-яких ключів)
export SHODAN_API_KEY=your-key           # Вмикає osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Вмикає osint_censys (безкоштовно: 250 запитів/місяць)
export CENSYS_API_SECRET=your-secret     # Секрет Censys API
export SECURITYTRAILS_API_KEY=your-key   # Вмикає waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Вмикає osint_virustotal (безкоштовно: 500 запитів/день)
```

Всі API ключі необов'язкові. Без них ви все одно отримуєте повне зняття відбитків TCP/TLS/SSH/HTTP/DNS/WAF/шляхів/сервісів/таймінгу/IoT/SMTP/інфраструктури/додатків, кореляцію, пасивний аналіз, перелік та мета-інструменти &mdash; 80+ технік, що працюють шляхом прямого зондування цілі.

### Підключення до вашого AI-агента

<details open>
<summary><b>Claude Code</b></summary>

```bash
# З npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# З локальним клоном
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Додайте до `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / інші MCP клієнти</b></summary>

Той самий формат JSON конфігурації. Вкажіть команду на `npx fingerprint-mcp` або шлях до вашої локальної установки.

</details>

### Почніть запити

```
Ви: "Зніми відбитки з усього на target.com — TLS, HTTP стек, WAF, DNS, відкриті порти"
```

Це все. Агент автоматично виконує багаторівневе зняття відбитків, кореляцію сигналів та аналіз інфраструктури.

---

## Що може AI

### Швидка розвідка

```
Ви: "Швидка розвідка target.com"

Агент: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: порти 80, 443, 22 відкриті
       -> TLS: RSA сертифікат Let's Encrypt, TLS 1.2+1.3, підпис JARM nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM налаштовано
       -> WAF: виявлено Cloudflare (заголовок cf-ray)
       -> "target.com — це React SPA на Express.js за nginx/1.24.0,
          який обслуговується через Cloudflare CDN. TLS правильно налаштовано з
          Let's Encrypt. SSH на порту 22 працює OpenSSH 9.6. Пошта
          обробляється Google Workspace з повним SPF/DKIM/DMARC."
```

### Глибоке дослідження TLS

```
Ви: "Детально проаналізуй конфігурацію TLS suspicious-server.com"

Агент: -> scan_tls {host: "suspicious-server.com"}

       -> Сертифікат: самопідписаний, CN=localhost, прострочений 47 днів тому
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (збігається з профілем Cobalt Strike за замовчуванням)
       -> JA4X: відбиток збігається з відомим шаблоном C2 фреймворку
       -> Набори шифрів: приймає слабкі шифри (RC4, 3DES)
       -> SNI: відповідає однаково на будь-яке значення SNI
       -> CT журнали: сертифікат не зареєстровано (не є публічно довіреним)
       -> "ВИСОКИЙ РИЗИК: конфігурація TLS чітко вказує на C2 інфраструктуру.
          Самопідписаний прострочений сертифікат, відбиток JARM збігається з Cobalt Strike,
          приймає слабкі шифри і відповідає на довільні значення SNI.
          Рекомендовано негайне розслідування та блокування."
```

### Обхід WAF та виявлення джерела

```
Ви: "target.com за WAF. Чи можеш ти знайти сервер-джерело?"

Агент: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), сторінка перевірки при підозрілих запитах
       -> DNS: запис A вказує на IP Cloudflare 104.21.x.x
       -> Піддомени: dev.target.com вирішується на 203.0.113.42 (не Cloudflare)
       -> Пряме з'єднання з 203.0.113.42:443 повертає той самий TLS сертифікат
       -> Історія SecurityTrails: джерело було 203.0.113.42 до Cloudflare
       -> "IP-адресу джерела знайдено: 203.0.113.42. Виявлено через піддомен
          dev.target.com, який обходить Cloudflare. Джерело обслуговує той самий
          TLS сертифікат і відповідає на заголовок Host target.com.
          Джерело не має захисту WAF — можливий прямий доступ."
```

### Виявлення сервісів на хості

```
Ви: "Які сервіси працюють на 10.0.1.50?"

Агент: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Порт 22: OpenSSH 8.9p1 Ubuntu, ключ хоста ED25519
       -> Порт 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Порт 3306: MySQL 8.0.36, потрібна автентифікація
       -> Порт 5432: PostgreSQL 16.1, потрібен SSL
       -> Порт 6379: Redis 7.2.4, БЕЗ автентифікації (відкритий)
       -> Порт 8080: Node.js Express dev сервер, CORS: *
       -> "КРИТИЧНО: Redis на порту 6379 не має автентифікації — будь-хто в
          мережі може читати/записувати дані. Express dev сервер на 8080
          має wildcard CORS. MySQL і PostgreSQL правильно вимагають автентифікацію.
          WordPress відстає на 2 мінорні версії. Потрібні негайні дії
          щодо Redis та відкритого dev сервера."
```

---

## Довідник інструментів (13 інструментів, 103 техніки)

<details open>
<summary><b>recon &mdash; Повна розвідка з вибором технік на основі глибини</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `url` | string | Цільовий URL для зняття відбитків |
| `depth` | `quick` \| `standard` \| `deep` | Глибина сканування: quick=5 технік, standard=20, deep=50+ |

Оркеструє техніки від усіх постачальників на основі рівня глибини. Швидкий режим дає короткий огляд; глибокий режим запускає вичерпне зняття відбитків, включаючи перелік, OSINT та кореляцію.

</details>

<details>
<summary><b>scan_ports &mdash; Сканування TCP портів з виявленням сервісів (3 техніки)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `host` | string | Цільовий хост (IP або домен) |
| `ports` | number[] | Необов'язково &mdash; конкретні порти для сканування (за замовчуванням поширені порти) |

| Техніка | Опис |
|---------|------|
| `tcp_probe` | TCP connect сканування для виявлення відкритих портів |
| `tcp_banner` | Захоплення банерів на відкритих портах для ідентифікації сервісів |
| `tcp_analysis` | Аналіз комбінацій портів та визначення сервісів |

</details>

<details>
<summary><b>scan_tls &mdash; Повний аналіз TLS/SSL (8 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `host` | string | Цільовий хост (IP або домен) |
| `port` | number | Необов'язково &mdash; TLS порт (за замовчуванням: 443) |

| Техніка | Опис |
|---------|------|
| `tls_certificate` | Розбір X.509 сертифіката &mdash; суб'єкт, видавець, SAN, термін дії, ланцюжок |
| `tls_jarm` | Активне зняття відбитків JARM &mdash; 10 зондів TLS Client Hello, 62-символьний хеш |
| `tls_ja4x` | Пасивне зняття відбитків JA4X TLS з властивостей сертифіката |
| `tls_ciphers` | Перелік наборів шифрів та аналіз їх стійкості |
| `tls_protocols` | Виявлення підтримуваних версій протоколу TLS (SSLv3 до TLS 1.3) |
| `tls_sni` | Тестування поведінки SNI &mdash; сертифікат за замовчуванням vs. запитане ім'я хоста |
| `tls_ct_logs` | Пошук у журналах Certificate Transparency через crt.sh |
| `tls_ocsp` | Перевірка OCSP stapling та статусу відкликання |

</details>

<details>
<summary><b>scan_dns &mdash; DNS розвідка (7 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `domain` | string | Цільовий домен |

| Техніка | Опис |
|---------|------|
| `dns_records` | Повний перелік записів &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Аналіз записів SPF, DKIM та DMARC |
| `dns_saas` | Виявлення SaaS/сервісів через шаблони CNAME та MX (Slack, Zendesk тощо) |
| `dns_server` | Зняття відбитків DNS сервера (BIND, PowerDNS, Cloudflare тощо) |
| `dns_takeover` | Виявлення захоплення піддоменів через аналіз висячих CNAME |
| `dns_zone` | Спроба трансферу зони (AXFR) |
| `dns_caa` | Аналіз записів CAA для обмежень центрів сертифікації |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/веб зняття відбитків (29 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `url` | string | Цільовий URL |

| Техніка | Постачальник | Опис |
|---------|-------------|------|
| `http_headers` | HTTP | Аналіз заголовків відповіді та ідентифікація сервера |
| `http_header_order` | HTTP | Відбиток порядку заголовків (підпис серверного ПЗ) |
| `http_security_headers` | HTTP | Аудит заголовків безпеки (CSP, HSTS, X-Frame-Options тощо) |
| `http_cookies` | HTTP | Аналіз cookie &mdash; прапорці, префікси, виявлення фреймворку |
| `http_methods` | HTTP | Перелік дозволених HTTP методів (OPTIONS) |
| `http_cors` | HTTP | Аналіз політики CORS та виявлення неправильної конфігурації |
| `http_compression` | HTTP | Підтримувані алгоритми стиснення (gzip, br, zstd) |
| `http_caching` | HTTP | Аналіз заголовків кешування (виявлення CDN, зворотного проксі) |
| `http_etag` | HTTP | Аналіз формату ETag для ідентифікації бекенду |
| `http_error` | HTTP | Зняття відбитків сторінок помилок (користувацькі vs. стандартні) |
| `http_redirect` | HTTP | Аналіз ланцюжка перенаправлень |
| `http_timing` | HTTP | Базовий тайминг відповіді для профілювання продуктивності сервера |
| `http_favicon` | HTTP | Хеш favicon (MurmurHash3) для ідентифікації технологій |
| `http_robots` | HTTP | Розбір robots.txt та вилучення заборонених шляхів |
| `http_sitemap` | HTTP | Виявлення карти сайту та вилучення URL |
| `http_wellknown` | HTTP | Виявлення точок доступу .well-known (security.txt, openid тощо) |
| `web_tech` | Web | Виявлення технологій через шаблони HTML/JS/CSS |
| `web_analytics` | Web | Виявлення сервісів аналітики та відстеження |
| `web_sourcemaps` | Web | Виявлення файлів source map |
| `web_websocket` | Web | Виявлення точок доступу WebSocket |
| `web_graphql` | Web | Виявлення точок доступу GraphQL та інтроспекція |
| `web_spa` | Web | Виявлення фреймворків односторінкових додатків |
| `web_cdn` | Web | Виявлення CDN через заголовки відповіді та DNS |
| `web_meta` | Web | Аналіз HTML мета-тегів (генератор, підказки фреймворку) |
| `web_feed` | Web | Виявлення RSS/Atom стрічок |
| `h2_detect` | HTTP/2 | Виявлення підтримки протоколу HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Зняття відбитків HTTP/2 сервера (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Виявлення підтримки HTTP/3 (QUIC) через заголовок Alt-Svc |
| `app_cms` | Application | Виявлення CMS (WordPress, Drupal, Joomla тощо) |

</details>

<details>
<summary><b>scan_paths &mdash; Розвідка шляхів (5 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `url` | string | Цільовий URL |
| `categories` | string[] | Необов'язково &mdash; категорії для перевірки (sensitive, git, debug, api, config) |

| Техніка | Опис |
|---------|------|
| `path_sensitive` | Виявлення чутливих файлів (файли резервних копій, конфігураційні файли, дампи баз даних) |
| `path_robots` | Аналіз robots.txt та sitemap.xml для прихованих шляхів |
| `path_git` | Виявлення витоку Git репозиторію (.git/HEAD, .git/config) |
| `path_debug` | Виявлення точок доступу налагодження (phpinfo, server-status, консолі налагодження) |
| `path_api` | Виявлення версій API та точок доступу документації |

</details>

<details>
<summary><b>scan_waf &mdash; Виявлення та зняття відбитків WAF/CDN (4 техніки)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `url` | string | Цільовий URL |

| Техніка | Опис |
|---------|------|
| `waf_detect` | Виявлення наявності WAF через аналіз заголовків відповіді та поведінки |
| `waf_cdn` | Ідентифікація постачальника CDN (Cloudflare, Akamai, Fastly тощо) |
| `waf_fingerprint` | Ідентифікація продукту WAF та виявлення версії |
| `waf_origin` | Виявлення IP-адреси джерела за WAF/CDN (потрібен `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Зондування на рівні сервісів (12 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `host` | string | Цільовий хост (IP або домен) |
| `ports` | number[] | Необов'язково &mdash; конкретні порти для зондування |
| `service` | string | Необов'язково &mdash; конкретний сервіс для зондування (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Техніка | Постачальник | Опис |
|---------|-------------|------|
| `ssh_probe` | SSH | Виявлення версії протоколу SSH та програмного забезпечення |
| `ssh_algorithms` | SSH | Аудит алгоритмів SSH (KEX, шифри, MAC, типи ключів хоста) |
| `ssh_hostkey_lookup` | SSH | Пошук ключа хоста SSH через Shodan (потрібен `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Виявлення версії MySQL та зняття відбитків можливостей |
| `svc_postgres` | Service | Виявлення версії PostgreSQL та перевірка підтримки SSL |
| `svc_redis` | Service | Виявлення версії Redis та статусу автентифікації |
| `svc_ftp` | Service | Аналіз банера FTP та перевірка анонімного входу |
| `svc_vnc_rdp` | Service | Виявлення сервісів VNC/RDP та оцінка безпеки |
| `smtp_banner` | SMTP | Аналіз банера SMTP та ідентифікація MTA |
| `smtp_starttls` | SMTP | Підтримка SMTP STARTTLS та перевірка сертифіката |
| `iot_detect` | IoT | Виявлення IoT пристроїв через шаблони банерів та стандартні сторінки |
| `iot_upnp` | IoT | Виявлення пристроїв UPnP/SSDP у локальній мережі |

</details>

<details>
<summary><b>enumerate &mdash; Розширення обсягу (8 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `domain` | string | Цільовий домен |

| Техніка | Опис |
|---------|------|
| `enum_subdomains` | Перелік піддоменів кількома методами |
| `enum_wildcard` | Виявлення wildcard DNS |
| `enum_tld` | Розширення TLD (target.com -> target.net, target.org тощо) |
| `enum_related` | Виявлення пов'язаних доменів через спільну інфраструктуру |
| `enum_asn` | Виявлення сусідів ASN &mdash; інші домени в тій же мережі |
| `enum_ct` | Вилучення піддоменів з журналів Certificate Transparency |
| `enum_passive_dns` | Історія пасивного DNS (потрібен `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Підсумок обсягу та огляд поверхні атаки |

</details>

<details>
<summary><b>osint &mdash; Збагачення OSINT (6 технік)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `target` | string | IP-адреса або домен для збагачення |
| `type` | `ip` \| `domain` | Необов'язково &mdash; тип цілі (автовизначення, якщо пропущено) |

| Техніка | Автентифікація | Опис |
|---------|---------------|------|
| `osint_shodan` | `SHODAN_API_KEY` | Пошук хоста в Shodan &mdash; відкриті порти, банери, вразливості, ОС |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Дані хоста Censys &mdash; сервіси, TLS, автономна система |
| `osint_reverse_ip` | Немає | Зворотний пошук IP &mdash; інші домени на тому ж IP |
| `osint_whois` | Немає | Реєстраційні дані WHOIS &mdash; реєстратор, дати, сервери імен |
| `osint_webarchive` | Немає | Історія Web Archive &mdash; перший/останній знімок, частота змін |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Звіт VirusTotal про домен/IP &mdash; виявлення, категорії, DNS |

</details>

<details>
<summary><b>analyze &mdash; Пасивний аналіз відбитків (3 режими)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `type` | `headers` \| `html` \| `banner` | Тип даних для аналізу |
| `data` | string | Необроблені дані для аналізу (вставте заголовки, HTML або вивід банера) |

| Режим | Опис |
|-------|------|
| `fp_analyze_headers` | Пасивний аналіз HTTP заголовків &mdash; виявлення сервера, фреймворку, проксі без надсилання трафіку |
| `fp_analyze_html` | Пасивний аналіз HTML &mdash; виявлення технологій, ідентифікація фреймворку з вихідного коду |
| `fp_analyze_banner` | Пасивний аналіз банерів &mdash; ідентифікація сервісів з необробленого тексту банера |

</details>

<details>
<summary><b>correlate &mdash; Механізм багатосигнальної кореляції (7 режимів)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Режим кореляції |
| `signals` | object | Сигнали відбитків для кореляції (залежить від режиму) |

| Режим | Опис |
|-------|------|
| `fp_consistency` | Перевірка узгодженості міжрівневих сигналів &mdash; чи збігаються відбитки TCP, TLS, HTTP та DNS? |
| `fp_honeypot` | Виявлення ханіпотів &mdash; перевірка неможливих комбінацій сервісів та поведінкових аномалій |
| `fp_spoofing` | Виявлення підробки &mdash; ідентифікація невідповідності заголовків сервера та фактичної поведінки |
| `fp_compare` | Порівняння профілів відбитків двох хостів поруч |
| `fp_topology` | Картографування топології інфраструктури &mdash; CDN, балансувальник навантаження, ланцюжок зворотних проксі |
| `fp_c2` | Виявлення C2 фреймворку через кореляцію JARM, TLS, HTTP та таймінгу |
| `fp_identify` | Ідентифікація на основі хешів за базою даних відомих підписів |

</details>

<details>
<summary><b>meta &mdash; Конфігурація та дані сервера (3 режими)</b></summary>

| Параметр | Тип | Опис |
|----------|-----|------|
| `category` | string | Необов'язково &mdash; фільтрація за категорією |

| Режим | Опис |
|-------|------|
| `fp_sources` | Список усіх доступних джерел даних з конфігурацією та статусом API ключів |
| `fp_config` | Конфігурація сервера &mdash; версія, завантажені постачальники, кількість технік |
| `fp_signatures` | Список бази даних підписів &mdash; підписи JARM, банерів, WAF, додатків |

</details>

---

### Використання CLI

```bash
# Список усіх доступних інструментів та технік
npx fingerprint-mcp --list

# Запуск будь-якого інструменту напряму
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

# Інструменти OSINT (потрібні API ключі)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Джерела даних (21)

| Джерело | Автентифікація | Що надає |
|---------|---------------|----------|
| TCP зондування | Немає | Сканування портів, захоплення банерів, виявлення сервісів |
| Аналіз TLS/SSL | Немає | Розбір сертифікатів, зняття відбитків JARM, JA4X, перелік шифрів, тестування SNI |
| Зондування SSH | Немає | Версія протоколу, аудит алгоритмів, виявлення програмного забезпечення |
| Аналіз HTTP | Немає | Зняття відбитків заголовків, хешування favicon, аналіз cookie, перелік методів, CORS |
| Виявлення Web | Немає | Виявлення технологій, аналітика, source maps, WebSocket, GraphQL, SPA фреймворки |
| Виявлення шляхів | Немає | Чутливі файли, витоки git, точки доступу налагодження, версії API, robots.txt |
| DNS резолюція | Немає | Перелік записів, аналіз автентифікації пошти, виявлення SaaS, зняття відбитків серверів |
| Виявлення WAF/CDN | Немає | Ідентифікація WAF, виявлення CDN, зняття відбитків WAF |
| Аналіз таймінгу | Немає | Базовий тайминг відповіді, виявлення зсуву годинника |
| HTTP/2 та HTTP/3 | Немає | Виявлення та зняття відбитків HTTP/2, виявлення HTTP/3 Alt-Svc |
| Зондування SMTP | Немає | Аналіз банера SMTP, перевірка STARTTLS |
| IoT/Вбудовані | Немає | Виявлення IoT пристроїв, виявлення UPnP/SSDP |
| Виявлення додатків | Немає | Ідентифікація CMS, фреймворків та e-commerce платформ |
| Зондування сервісів | Немає | Зняття відбитків MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Виявлення інфраструктури | Немає | Ідентифікація хмарного провайдера, хостинг-провайдера, CDN |
| Механізм кореляції | Немає | Узгодженість сигналів, виявлення ханіпотів, виявлення підробки, картографування топології |
| Механізм ідентифікації | Немає | Ідентифікація на основі хешів, виявлення C2, зіставлення підписів |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Розвідка хоста &mdash; відкриті порти, банери, вразливості, виявлення ОС |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Дані хоста &mdash; сервіси, TLS сертифікати, інформація про автономну систему |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Виявлення джерела WAF, історія пасивного DNS, історичні записи |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Репутація домену/IP, результати виявлення, історія DNS, категорії |

---

## Архітектура

```
src/
  index.ts                # Точка входу CLI (--help, --list, --tool, stdio сервер)
  protocol/
    mcp-server.ts         # Налаштування MCP сервера (stdio транспорт)
    tools.ts              # Реєстр інструментів — усі 13 композитних інструментів зареєстровані тут
  types/
    index.ts              # Спільні типи (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Обмежувач швидкості для кожного постачальника
    cache.ts              # TTL кеш для відповідей API
    require-key.ts        # Допоміжна функція перевірки API ключів
    murmurhash3.ts        # MurmurHash3 для хешування favicon
  composite/              # 13 композитних оркестраторів інструментів
    recon.ts              # Оркестратор повної розвідки (quick/standard/deep)
    scan-ports.ts         # Композит сканування портів
    scan-tls.ts           # Композит аналізу TLS
    scan-dns.ts           # Композит DNS розвідки
    scan-http.ts          # Композит зняття відбитків HTTP
    scan-paths.ts         # Композит виявлення шляхів
    scan-waf.ts           # Композит виявлення WAF/CDN
    scan-services.ts      # Композит зондування сервісів
    analyze.ts            # Композит пасивного аналізу
    correlate.ts          # Композит механізму кореляції
    enumerate.ts          # Композит розширення обсягу
    osint.ts              # Композит збагачення OSINT
    meta.ts               # Композит мета сервера
    helpers.ts            # Спільні допоміжні функції композитів
  tcp/                    # Техніки зондування TCP (3)
  tls/                    # Техніки аналізу TLS/SSL (8)
  ssh/                    # Техніки зондування SSH (3)
  http/                   # Техніки зняття відбитків HTTP (16)
  web/                    # Техніки виявлення веб-технологій (9)
  path/                   # Техніки виявлення шляхів (5)
  dns/                    # Техніки DNS розвідки (7)
  waf/                    # Техніки виявлення WAF/CDN (4)
  timing/                 # Техніки аналізу таймінгу (2)
  h2/                     # Техніки HTTP/2 та HTTP/3 (3)
  smtp/                   # Техніки зондування SMTP (2)
  iot/                    # Техніки виявлення IoT/вбудованих пристроїв (2)
  app/                    # Техніки виявлення додатків (3)
  service/                # Техніки зондування сервісів (5)
  infra/                  # Техніки виявлення інфраструктури (3)
  correlation/            # Механізм кореляції (5)
  identify/               # Механізм ідентифікації (3)
  passive/                # Пасивний аналіз (3)
  osint/                  # Техніки збагачення OSINT (6)
  enum/                   # Техніки переліку (8)
  meta/                   # Мета-інструменти (3)
  data/                   # Бази даних підписів та бібліотеки шаблонів
    jarm-signatures.ts    # Відомі відбитки JARM (C2, сервери, CDN)
    waf-signatures.ts     # Підписи виявлення WAF
    service-banners.ts    # Шаблони банерів сервісів
    tech-patterns.ts      # Шаблони виявлення технологій
    favicon-hashes.ts     # Відомі значення MurmurHash3 favicon
    c2-signatures.ts      # Підписи C2 фреймворків
    ...                   # 15+ баз даних підписів/шаблонів
```

**Проєктні рішення:**

- **13 композитних інструментів, 103 техніки** &mdash; Агент викликає інструменти високого рівня (`recon`, `scan_tls`, `scan_http`). Кожен композит оркеструє кілька низькорівневих технік та повертає корельовані результати. Це зменшує накладні витрати на виклики інструментів, зберігаючи гранулярність.
- **21 постачальник, 1 сервер** &mdash; Кожен рівень зняття відбитків є незалежним модулем. Композитний оркестратор вибирає техніки на основі контексту та глибини.
- **Спочатку активне, OSINT необов'язковий** &mdash; 80+ технік працюють шляхом прямого зондування цілі з нулем API ключів. Постачальники OSINT (Shodan, Censys, VirusTotal, SecurityTrails) додають збагачення, але ніколи не є обов'язковими.
- **Обмежувачі швидкості для кожного постачальника** &mdash; Кожен постачальник має власний екземпляр `RateLimiter`. Активне зондування обмежується за швидкістю для уникнення виявлення; OSINT API калібруються відповідно до їх квот.
- **TTL кешування** &mdash; DNS записи (10 хв), результати OSINT (15 хв), CT журнали (30 хв) кешуються для уникнення зайвих пошуків під час багатоінструментних робочих процесів.
- **Плавна деградація** &mdash; Відсутні API ключі не призводять до збою сервера. Інструменти OSINT повертають описові повідомлення: "Встановіть SHODAN_API_KEY для ввімкнення пошуку хоста Shodan."
- **3 залежності** &mdash; `@modelcontextprotocol/sdk`, `zod` та `cheerio`. Усе мережеве введення/виведення через нативні `fetch()` та модулі Node.js `net`/`tls`/`dns`. Без nmap, без зовнішніх бінарних файлів.

---

## Обмеження

- Інструменти OSINT (Shodan, Censys, VirusTotal, SecurityTrails) потребують API ключів для відповідних технік
- Безкоштовний рівень Censys обмежений 250 запитами/місяць
- Безкоштовний рівень VirusTotal обмежений 500 запитами/день
- Сканування портів використовує TCP connect (не SYN scan) &mdash; менш непомітне ніж nmap, але не потребує привілеїв root
- Зняття відбитків JARM потребує прямого TCP доступу до цілі (може бути заблоковано файерволами)
- Виявлення UPnP/SSDP працює лише в локальних мережах
- Зондування сервісів (MySQL, PostgreSQL, Redis) з'єднується, але не автентифікується
- Перелік піддоменів покладається на CT журнали та пасивні джерела (без перебору)
- Протестовано на macOS / Linux (Windows не тестувався)

---

## Частина пакету безпеки MCP

| Проєкт | Домен | Інструменти |
|--------|-------|-------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Тестування безпеки на основі браузера | 39 інструментів, Firefox, тестування ін'єкцій |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Безпека хмари (AWS/Azure/GCP) | 38 інструментів, 60+ перевірок |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Безпека GitHub | 39 інструментів, 45 перевірок |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Розвідка вразливостей | 23 інструменти, 5 джерел |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT та розвідка | 37 інструментів, 12 джерел |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Даркнет та розвідка загроз | 66 інструментів, 16 джерел |
| **fingerprint-mcp** | **Універсальне цифрове зняття відбитків** | **13 інструментів, 103 техніки, 21 постачальник** |

---

<p align="center">
<b>Лише для авторизованого тестування та оцінки безпеки.</b><br>
Завжди переконуйтесь, що у вас є належна авторизація перед зняттям відбитків будь-якої цілі.
</p>

<p align="center">
  <a href="LICENSE">Ліцензія AGPL-3.0</a> &bull; Створено з Bun + TypeScript
</p>
