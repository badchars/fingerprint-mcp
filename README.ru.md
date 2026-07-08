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
  <strong>Русский</strong> |
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

<h3 align="center">Универсальный цифровой фингерпринтинг для AI-агентов.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, зондирование сервисов, JARM, JA4X, хеширование favicon, топология инфраструктуры, обнаружение C2, обогащение OSINT &mdash; объединены в одном MCP-сервере.<br>
  Ваш AI-агент получает <b>полноспектральный фингерпринтинг по запросу</b>, а не 11 разрозненных CLI-инструментов и ручную корреляцию.
</p>

<br>

<p align="center">
  <a href="#проблема">Проблема</a> &bull;
  <a href="#чем-отличается">Чем Отличается</a> &bull;
  <a href="#быстрый-старт">Быстрый Старт</a> &bull;
  <a href="#что-может-ai">Что Может AI</a> &bull;
  <a href="#справочник-инструментов-13-инструментов-103-техники">Инструменты (13)</a> &bull;
  <a href="#источники-данных-21">Источники Данных</a> &bull;
  <a href="#архитектура">Архитектура</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Участие</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Лицензия"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Инструментов">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Техники">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Демо fingerprint-mcp" width="800">
</p>

---

## Проблема

Фингерпринтинг сервера сегодня означает жонглирование дюжиной разрозненных инструментов. Вы запускаете `nmap` для сканирования портов, `testssl.sh` для анализа сертификатов, `curl -I` для HTTP-заголовков, `dig` для DNS, `wafw00f` для обнаружения WAF, `ssh-audit` для SSH, отдельный инструмент JARM, Wappalyzer для определения технологий &mdash; а потом тратите 30 минут на ручную перекрёстную проверку всего в электронной таблице, чтобы понять, что на самом деле работает.

```
Традиционный рабочий процесс фингерпринтинга:
  анализ TLS-сертификатов       ->  testssl.sh / openssl s_client
  получение HTTP-заголовков     ->  curl -I
  определение веб-технологий    ->  wappalyzer CLI
  DNS-разведка                  ->  dig / nslookup / dnsenum
  сканирование портов           ->  nmap -sV
  обнаружение WAF               ->  wafw00f
  аудит SSH                     ->  ssh-audit
  фингерпринтинг сервисов       ->  nmap scripts
  фингерпринт JARM              ->  jarm (отдельный инструмент)
  проверка баз OSINT            ->  shodan CLI, censys CLI
  корреляция всего              ->  вручную в электронной таблице
  ──────────────────────────────
  Итого: 11 инструментов, 30+ минут, ручная корреляция
```

**fingerprint-mcp** предоставляет вашему AI-агенту 13 составных инструментов, охватывающих 103 техники фингерпринтинга через 21 провайдера по [Model Context Protocol](https://modelcontextprotocol.io). Агент выполняет многоуровневый фингерпринтинг параллельно, коррелирует сигналы между уровнями TCP/TLS/HTTP/DNS/SSH, обнаруживает ханипоты и C2-инфраструктуру и представляет единую разведывательную картину &mdash; в одном разговоре.

```
С fingerprint-mcp:
  Вы: "Проведи глубокую разведку target.com"

  Агент: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 через JARM (3fd21b20d00000...),
            сертификат Let's Encrypt, 2 SAN, TLS 1.2+1.3
         -> HTTP: Express.js за Cloudflare WAF,
            React SPA, Google Analytics, 14 заголовков безопасности проанализировано
         -> DNS: записи A/AAAA/MX/TXT, SPF/DKIM/DMARC настроены,
            Slack + Google Workspace обнаружены через CNAME/MX
         -> Порты: 80, 443, 22 (OpenSSH 9.6), 8080 (сервер разработки)
         -> WAF: Cloudflare обнаружен, исходный IP обнаружен через прямое подключение
         -> Перечисление: 12 поддоменов через CT-логи, обнаружен wildcard DNS
         -> "target.com работает на nginx/1.24.0 с Express.js за
            Cloudflare WAF. Исходный IP 203.0.113.42 доступен на порту 8080.
            TLS настроен корректно (эквивалент A+), но сервер
            разработки на 8080 не имеет защиты WAF. 3 поддомена указывают на
            выведенную из эксплуатации инфраструктуру — потенциальный риск захвата."
```

---

## Чем Отличается

Существующие инструменты дают необработанные данные по одному уровню за раз. fingerprint-mcp даёт вашему AI-агенту способность **рассуждать на всех уровнях фингерпринтинга одновременно**.

<table>
<thead>
<tr>
<th></th>
<th>Традиционный Подход</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Интерфейс</b></td>
<td>11 разных CLI-инструментов с разными форматами вывода</td>
<td>MCP &mdash; AI-агент вызывает инструменты в разговорном режиме</td>
</tr>
<tr>
<td><b>Техники</b></td>
<td>Один инструмент, один уровень за раз</td>
<td>103 техники через 21 провайдера, выполняются параллельно</td>
</tr>
<tr>
<td><b>Анализ TLS</b></td>
<td>Вывод testssl.sh, ручной разбор JARM отдельно</td>
<td>Агент объединяет сертификат + JARM + JA4X + наборы шифров + SNI + CT-логи в одном вызове</td>
</tr>
<tr>
<td><b>Корреляция</b></td>
<td>Копирование результатов в электронную таблицу</td>
<td>Агент перекрёстно коррелирует: «JARM совпадает с известным C2-фреймворком, тайминг HTTP подтверждает ханипот»</td>
</tr>
<tr>
<td><b>Обход WAF</b></td>
<td>wafw00f обнаруживает WAF, вы вручную ищете источник</td>
<td>Агент обнаруживает WAF, находит исходный IP и проверяет, что он отдаёт тот же контент</td>
</tr>
<tr>
<td><b>API-ключи</b></td>
<td>Требуются для Shodan, Censys и т.д.</td>
<td>80+ активных техник работают без каких-либо API-ключей; ключи разблокируют обогащение OSINT</td>
</tr>
<tr>
<td><b>Настройка</b></td>
<td>Установить nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; одна команда, нулевая конфигурация</td>
</tr>
</tbody>
</table>

---

## Быстрый Старт

### Вариант 1: npx (без установки)

```bash
npx fingerprint-mcp
```

Все 80+ активных техник фингерпринтинга работают сразу. API-ключи не требуются для фингерпринтинга TCP, TLS, SSH, HTTP, DNS, WAF, путей, сервисов, тайминга, IoT, SMTP и приложений.

### Вариант 2: Клонирование

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Переменные окружения (необязательные)

```bash
# Обогащение OSINT (все необязательные — активный фингерпринтинг работает без каких-либо ключей)
export SHODAN_API_KEY=your-key           # Включает osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Включает osint_censys (бесплатно: 250 запросов/месяц)
export CENSYS_API_SECRET=your-secret     # Секрет API Censys
export SECURITYTRAILS_API_KEY=your-key   # Включает waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Включает osint_virustotal (бесплатно: 500 запросов/день)
```

Все API-ключи необязательны. Без них вы по-прежнему получаете полный фингерпринтинг TCP/TLS/SSH/HTTP/DNS/WAF/путей/сервисов/тайминга/IoT/SMTP/инфраструктуры/приложений, корреляцию, пассивный анализ, перечисление и мета-инструменты &mdash; 80+ техник, работающих через прямое зондирование цели.

### Подключение к AI-агенту

<details open>
<summary><b>Claude Code</b></summary>

```bash
# С npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# С локальным клоном
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Добавьте в `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / другие MCP-клиенты</b></summary>

Тот же формат JSON-конфигурации. Укажите команду на `npx fingerprint-mcp` или путь к локальной установке.

</details>

### Начните запросы

```
Вы: "Сделай фингерпринтинг всего о target.com — TLS, HTTP-стек, WAF, DNS, открытые порты"
```

Вот и всё. Агент автоматически выполняет многоуровневый фингерпринтинг, корреляцию сигналов и анализ инфраструктуры.

---

## Что Может AI

### Быстрая Разведка

```
Вы: "Быстрая разведка target.com"

Агент: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: порты 80, 443, 22 открыты
       -> TLS: RSA-сертификат Let's Encrypt, TLS 1.2+1.3, JARM-сигнатура nginx
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM настроены
       -> WAF: Cloudflare обнаружен (заголовок cf-ray)
       -> "target.com — это React SPA на Express.js за nginx/1.24.0,
          обслуживаемый через Cloudflare CDN. TLS корректно настроен с
          Let's Encrypt. SSH на порту 22 — OpenSSH 9.6. Электронная почта
          обслуживается Google Workspace с полным SPF/DKIM/DMARC."
```

### Глубокое Исследование TLS

```
Вы: "Подробно проанализируй TLS-конфигурацию suspicious-server.com"

Агент: -> scan_tls {host: "suspicious-server.com"}

       -> Сертификат: самоподписанный, CN=localhost, истёк 47 дней назад
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (совпадает с профилем Cobalt Strike по умолчанию)
       -> JA4X: фингерпринт совпадает с известным паттерном C2-фреймворка
       -> Наборы шифров: принимает слабые шифры (RC4, 3DES)
       -> SNI: отвечает одинаково на любое значение SNI
       -> CT-логи: сертификат не зарегистрирован (не является публично доверенным)
       -> "ВЫСОКИЙ РИСК: TLS-конфигурация уверенно указывает на C2-инфраструктуру.
          Самоподписанный просроченный сертификат, JARM-фингерпринт совпадает с Cobalt Strike,
          принимает слабые шифры и отвечает на произвольные значения SNI.
          Рекомендуется немедленное расследование и блокировка."
```

### Обход WAF и Обнаружение Источника

```
Вы: "target.com за WAF. Можешь найти исходный сервер?"

Агент: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), страница-вызов на подозрительные запросы
       -> DNS: A-запись указывает на IP Cloudflare 104.21.x.x
       -> Поддомены: dev.target.com разрешается в 203.0.113.42 (не-Cloudflare)
       -> Прямое подключение к 203.0.113.42:443 возвращает тот же TLS-сертификат
       -> История SecurityTrails: источник был 203.0.113.42 до Cloudflare
       -> "Исходный IP найден: 203.0.113.42. Обнаружен через поддомен
          dev.target.com, который обходит Cloudflare. Источник отдаёт тот же
          TLS-сертификат и отвечает на заголовок Host target.com.
          Источник не имеет защиты WAF — прямой доступ возможен."
```

### Обнаружение Сервисов на Хосте

```
Вы: "Какие сервисы работают на 10.0.1.50?"

Агент: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Порт 22: OpenSSH 8.9p1 Ubuntu, ключ хоста ED25519
       -> Порт 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Порт 3306: MySQL 8.0.36, требуется аутентификация
       -> Порт 5432: PostgreSQL 16.1, требуется SSL
       -> Порт 6379: Redis 7.2.4, БЕЗ аутентификации (открыт)
       -> Порт 8080: сервер разработки Node.js Express, CORS: *
       -> "КРИТИЧНО: Redis на порту 6379 без аутентификации — любой в
          сети может читать/записывать данные. Сервер разработки Express на 8080
          имеет wildcard CORS. MySQL и PostgreSQL корректно требуют аутентификацию.
          WordPress отстаёт на 2 минорные версии. Требуются немедленные действия
          по Redis и открытости сервера разработки."
```

---

## Справочник Инструментов (13 инструментов, 103 техники)

<details open>
<summary><b>recon &mdash; Полная разведка с выбором техник на основе глубины</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `url` | string | Целевой URL для фингерпринтинга |
| `depth` | `quick` \| `standard` \| `deep` | Глубина сканирования: quick=5 техник, standard=20, deep=50+ |

Оркестрирует техники всех провайдеров на основе уровня глубины. Быстрый режим даёт краткий обзор; глубокий режим выполняет исчерпывающий фингерпринтинг, включая перечисление, OSINT и корреляцию.

</details>

<details>
<summary><b>scan_ports &mdash; Сканирование TCP-портов с обнаружением сервисов (3 техники)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `host` | string | Целевой хост (IP или домен) |
| `ports` | number[] | Необязательный &mdash; конкретные порты для сканирования (по умолчанию: распространённые порты) |

| Техника | Описание |
|---------|----------|
| `tcp_probe` | TCP connect-сканирование для обнаружения открытых портов |
| `tcp_banner` | Захват баннеров на открытых портах для идентификации сервисов |
| `tcp_analysis` | Анализ комбинаций портов и вывод о сервисах |

</details>

<details>
<summary><b>scan_tls &mdash; Полный анализ TLS/SSL (8 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `host` | string | Целевой хост (IP или домен) |
| `port` | number | Необязательный &mdash; TLS-порт (по умолчанию: 443) |

| Техника | Описание |
|---------|----------|
| `tls_certificate` | Разбор сертификата X.509 &mdash; субъект, издатель, SAN, срок действия, цепочка |
| `tls_jarm` | Активный фингерпринтинг JARM &mdash; 10 зондов TLS Client Hello, 62-символьный хеш |
| `tls_ja4x` | Пассивный TLS-фингерпринтинг JA4X по свойствам сертификата |
| `tls_ciphers` | Перечисление наборов шифров и анализ стойкости |
| `tls_protocols` | Определение поддерживаемых версий протокола TLS (SSLv3 до TLS 1.3) |
| `tls_sni` | Тестирование поведения SNI &mdash; сертификат по умолчанию vs. запрошенное имя хоста |
| `tls_ct_logs` | Поиск в логах Certificate Transparency через crt.sh |
| `tls_ocsp` | Проверка OCSP-степлинга и статуса отзыва |

</details>

<details>
<summary><b>scan_dns &mdash; DNS-разведка (7 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `domain` | string | Целевой домен |

| Техника | Описание |
|---------|----------|
| `dns_records` | Полное перечисление записей &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Анализ записей SPF, DKIM и DMARC |
| `dns_saas` | Обнаружение SaaS/сервисов через паттерны CNAME и MX (Slack, Zendesk и т.д.) |
| `dns_server` | Фингерпринтинг DNS-сервера (BIND, PowerDNS, Cloudflare и т.д.) |
| `dns_takeover` | Обнаружение захвата поддомена через анализ висячих CNAME |
| `dns_zone` | Попытка трансфера зоны (AXFR) |
| `dns_caa` | Анализ записей CAA для ограничений центров сертификации |

</details>

<details>
<summary><b>scan_http &mdash; HTTP/веб-фингерпринтинг (29 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `url` | string | Целевой URL |

| Техника | Провайдер | Описание |
|---------|-----------|----------|
| `http_headers` | HTTP | Анализ заголовков ответа и идентификация сервера |
| `http_header_order` | HTTP | Фингерпринт порядка заголовков (сигнатура серверного ПО) |
| `http_security_headers` | HTTP | Аудит заголовков безопасности (CSP, HSTS, X-Frame-Options и т.д.) |
| `http_cookies` | HTTP | Анализ cookies &mdash; флаги, префиксы, обнаружение фреймворка |
| `http_methods` | HTTP | Перечисление разрешённых HTTP-методов (OPTIONS) |
| `http_cors` | HTTP | Анализ политики CORS и обнаружение неправильной конфигурации |
| `http_compression` | HTTP | Поддерживаемые алгоритмы сжатия (gzip, br, zstd) |
| `http_caching` | HTTP | Анализ заголовков кеширования (обнаружение CDN, reverse proxy) |
| `http_etag` | HTTP | Анализ формата ETag для идентификации бэкенда |
| `http_error` | HTTP | Фингерпринтинг страниц ошибок (пользовательские vs. стандартные страницы ошибок) |
| `http_redirect` | HTTP | Анализ цепочки перенаправлений |
| `http_timing` | HTTP | Базовое время отклика для профилирования производительности сервера |
| `http_favicon` | HTTP | Хеш favicon (MurmurHash3) для идентификации технологий |
| `http_robots` | HTTP | Разбор robots.txt и извлечение запрещённых путей |
| `http_sitemap` | HTTP | Обнаружение карты сайта и извлечение URL |
| `http_wellknown` | HTTP | Обнаружение конечных точек .well-known (security.txt, openid и т.д.) |
| `web_tech` | Web | Обнаружение технологий через паттерны HTML/JS/CSS |
| `web_analytics` | Web | Обнаружение сервисов аналитики и отслеживания |
| `web_sourcemaps` | Web | Обнаружение файлов source map |
| `web_websocket` | Web | Обнаружение конечных точек WebSocket |
| `web_graphql` | Web | Обнаружение конечных точек GraphQL и интроспекция |
| `web_spa` | Web | Обнаружение фреймворков одностраничных приложений |
| `web_cdn` | Web | Обнаружение CDN через заголовки ответов и DNS |
| `web_meta` | Web | Анализ HTML-метатегов (генератор, подсказки фреймворка) |
| `web_feed` | Web | Обнаружение RSS/Atom-лент |
| `h2_detect` | HTTP/2 | Обнаружение поддержки протокола HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Фингерпринтинг HTTP/2-сервера (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Обнаружение поддержки HTTP/3 (QUIC) через заголовок Alt-Svc |
| `app_cms` | Application | Обнаружение CMS (WordPress, Drupal, Joomla и т.д.) |

</details>

<details>
<summary><b>scan_paths &mdash; Разведка путей (5 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `url` | string | Целевой URL |
| `categories` | string[] | Необязательный &mdash; категории для проверки (sensitive, git, debug, api, config) |

| Техника | Описание |
|---------|----------|
| `path_sensitive` | Обнаружение чувствительных файлов (файлы резервных копий, конфигурационные файлы, дампы баз данных) |
| `path_robots` | Анализ robots.txt и sitemap.xml для скрытых путей |
| `path_git` | Обнаружение утечки Git-репозитория (.git/HEAD, .git/config) |
| `path_debug` | Обнаружение отладочных конечных точек (phpinfo, server-status, консоли отладки) |
| `path_api` | Обнаружение версий API и конечных точек документации |

</details>

<details>
<summary><b>scan_waf &mdash; Обнаружение и фингерпринтинг WAF/CDN (4 техники)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `url` | string | Целевой URL |

| Техника | Описание |
|---------|----------|
| `waf_detect` | Обнаружение присутствия WAF через анализ заголовков ответов и поведения |
| `waf_cdn` | Идентификация провайдера CDN (Cloudflare, Akamai, Fastly и т.д.) |
| `waf_fingerprint` | Идентификация продукта WAF и определение версии |
| `waf_origin` | Обнаружение исходного IP за WAF/CDN (требуется `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Зондирование на уровне сервисов (12 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `host` | string | Целевой хост (IP или домен) |
| `ports` | number[] | Необязательный &mdash; конкретные порты для зондирования |
| `service` | string | Необязательный &mdash; конкретный сервис для зондирования (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Техника | Провайдер | Описание |
|---------|-----------|----------|
| `ssh_probe` | SSH | Определение версии протокола SSH и ПО |
| `ssh_algorithms` | SSH | Аудит алгоритмов SSH (KEX, шифры, MAC, типы ключей хоста) |
| `ssh_hostkey_lookup` | SSH | Поиск ключа хоста SSH через Shodan (требуется `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Определение версии MySQL и фингерпринтинг возможностей |
| `svc_postgres` | Service | Определение версии PostgreSQL и проверка поддержки SSL |
| `svc_redis` | Service | Определение версии Redis и статус аутентификации |
| `svc_ftp` | Service | Анализ баннера FTP и проверка анонимного входа |
| `svc_vnc_rdp` | Service | Обнаружение сервисов VNC/RDP и оценка безопасности |
| `smtp_banner` | SMTP | Анализ баннера SMTP и идентификация MTA |
| `smtp_starttls` | SMTP | Поддержка SMTP STARTTLS и инспекция сертификата |
| `iot_detect` | IoT | Обнаружение IoT-устройств через паттерны баннеров и страницы по умолчанию |
| `iot_upnp` | IoT | Обнаружение устройств UPnP/SSDP в локальной сети |

</details>

<details>
<summary><b>enumerate &mdash; Расширение охвата (8 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `domain` | string | Целевой домен |

| Техника | Описание |
|---------|----------|
| `enum_subdomains` | Перечисление поддоменов несколькими методами |
| `enum_wildcard` | Обнаружение wildcard DNS |
| `enum_tld` | Расширение TLD (target.com -> target.net, target.org и т.д.) |
| `enum_related` | Обнаружение связанных доменов через общую инфраструктуру |
| `enum_asn` | Обнаружение соседей ASN &mdash; другие домены в той же сети |
| `enum_ct` | Извлечение поддоменов из логов Certificate Transparency |
| `enum_passive_dns` | История пассивного DNS (требуется `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Сводка охвата и обзор поверхности атаки |

</details>

<details>
<summary><b>osint &mdash; Обогащение OSINT (6 техник)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `target` | string | IP-адрес или домен для обогащения |
| `type` | `ip` \| `domain` | Необязательный &mdash; тип цели (определяется автоматически при пропуске) |

| Техника | Auth | Описание |
|---------|------|----------|
| `osint_shodan` | `SHODAN_API_KEY` | Поиск хоста Shodan &mdash; открытые порты, баннеры, уязвимости, ОС |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Данные хоста Censys &mdash; сервисы, TLS, автономная система |
| `osint_reverse_ip` | Нет | Обратный поиск IP &mdash; другие домены на том же IP |
| `osint_whois` | Нет | Данные регистрации WHOIS &mdash; регистратор, даты, серверы имён |
| `osint_webarchive` | Нет | История Web Archive &mdash; первый/последний снимок, частота изменений |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Отчёт VirusTotal домен/IP &mdash; обнаружения, категории, DNS |

</details>

<details>
<summary><b>analyze &mdash; Пассивный анализ фингерпринта (3 режима)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | `headers` \| `html` \| `banner` | Тип данных для анализа |
| `data` | string | Необработанные данные для анализа (вставьте заголовки, HTML или вывод баннера) |

| Режим | Описание |
|-------|----------|
| `fp_analyze_headers` | Пассивный анализ HTTP-заголовков &mdash; обнаружение сервера, фреймворка, прокси без отправки трафика |
| `fp_analyze_html` | Пассивный анализ HTML &mdash; обнаружение технологий, идентификация фреймворка из исходного кода |
| `fp_analyze_banner` | Пассивный анализ баннера &mdash; идентификация сервиса из необработанного текста баннера |

</details>

<details>
<summary><b>correlate &mdash; Движок мультисигнальной корреляции (7 режимов)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Режим корреляции |
| `signals` | object | Сигналы фингерпринта для корреляции (зависят от режима) |

| Режим | Описание |
|-------|----------|
| `fp_consistency` | Проверка согласованности межуровневых сигналов &mdash; совпадают ли фингерпринты TCP, TLS, HTTP и DNS? |
| `fp_honeypot` | Обнаружение ханипотов &mdash; проверка невозможных комбинаций сервисов и поведенческих аномалий |
| `fp_spoofing` | Обнаружение спуфинга &mdash; выявление несоответствия заголовков сервера и фактического поведения |
| `fp_compare` | Сравнение профилей фингерпринтов двух хостов бок о бок |
| `fp_topology` | Картирование топологии инфраструктуры &mdash; цепочка CDN, балансировщик нагрузки, reverse proxy |
| `fp_c2` | Обнаружение C2-фреймворка через корреляцию JARM, TLS, HTTP и тайминга |
| `fp_identify` | Хеш-идентификация по базе данных известных сигнатур |

</details>

<details>
<summary><b>meta &mdash; Конфигурация сервера и данные (3 режима)</b></summary>

| Параметр | Тип | Описание |
|----------|-----|----------|
| `category` | string | Необязательный &mdash; фильтр по категории |

| Режим | Описание |
|-------|----------|
| `fp_sources` | Список всех доступных источников данных с конфигурацией и статусом API-ключей |
| `fp_config` | Конфигурация сервера &mdash; версия, загруженные провайдеры, количество техник |
| `fp_signatures` | Список баз сигнатур &mdash; сигнатуры JARM, баннеров, WAF, приложений |

</details>

---

### Использование CLI

```bash
# Список всех доступных инструментов и техник
npx fingerprint-mcp --list

# Запуск любого инструмента напрямую
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

# Инструменты OSINT (требуют API-ключей)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Источники Данных (21)

| Источник | Auth | Что предоставляет |
|----------|------|-------------------|
| Зондирование TCP | Нет | Сканирование портов, захват баннеров, обнаружение сервисов |
| Анализ TLS/SSL | Нет | Разбор сертификатов, фингерпринтинг JARM, JA4X, перечисление шифров, тестирование SNI |
| Зондирование SSH | Нет | Версия протокола, аудит алгоритмов, определение ПО |
| Анализ HTTP | Нет | Фингерпринтинг заголовков, хеширование favicon, анализ cookies, перечисление методов, CORS |
| Веб-обнаружение | Нет | Обнаружение технологий, аналитика, source maps, WebSocket, GraphQL, SPA-фреймворки |
| Обнаружение путей | Нет | Чувствительные файлы, утечки git, отладочные конечные точки, версии API, robots.txt |
| Разрешение DNS | Нет | Перечисление записей, анализ аутентификации электронной почты, обнаружение SaaS, фингерпринтинг сервера |
| Обнаружение WAF/CDN | Нет | Идентификация WAF, обнаружение CDN, фингерпринтинг WAF |
| Анализ тайминга | Нет | Базовое время отклика, обнаружение расхождения часов |
| HTTP/2 и HTTP/3 | Нет | Обнаружение и фингерпринтинг HTTP/2, обнаружение HTTP/3 Alt-Svc |
| Зондирование SMTP | Нет | Анализ баннера SMTP, инспекция STARTTLS |
| IoT/Встраиваемые | Нет | Обнаружение IoT-устройств, обнаружение UPnP/SSDP |
| Обнаружение приложений | Нет | Идентификация CMS, фреймворков и платформ электронной коммерции |
| Зондирование сервисов | Нет | Фингерпринтинг MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Обнаружение инфраструктуры | Нет | Идентификация облачного провайдера, хостинг-провайдера, CDN |
| Движок корреляции | Нет | Согласованность сигналов, обнаружение ханипотов, обнаружение спуфинга, картирование топологии |
| Движок идентификации | Нет | Хеш-идентификация, обнаружение C2, сопоставление сигнатур |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Разведка хоста &mdash; открытые порты, баннеры, уязвимости, определение ОС |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Данные хоста &mdash; сервисы, TLS-сертификаты, информация об автономной системе |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Обнаружение источника WAF, история пассивного DNS, исторические записи |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Репутация домена/IP, результаты обнаружения, история DNS, категории |

---

## Архитектура

```
src/
  index.ts                # Точка входа CLI (--help, --list, --tool, stdio-сервер)
  protocol/
    mcp-server.ts         # Настройка MCP-сервера (транспорт stdio)
    tools.ts              # Реестр инструментов — все 13 составных инструментов зарегистрированы здесь
  types/
    index.ts              # Общие типы (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Rate limiter для каждого провайдера
    cache.ts              # TTL-кеш для API-ответов
    require-key.ts        # Хелпер валидации API-ключей
    murmurhash3.ts        # MurmurHash3 для хеширования favicon
  composite/              # 13 оркестраторов составных инструментов
    recon.ts              # Оркестратор полной разведки (quick/standard/deep)
    scan-ports.ts         # Составное сканирование портов
    scan-tls.ts           # Составной анализ TLS
    scan-dns.ts           # Составная DNS-разведка
    scan-http.ts          # Составной HTTP-фингерпринтинг
    scan-paths.ts         # Составное обнаружение путей
    scan-waf.ts           # Составное обнаружение WAF/CDN
    scan-services.ts      # Составное зондирование сервисов
    analyze.ts            # Составной пассивный анализ
    correlate.ts          # Составной движок корреляции
    enumerate.ts          # Составное расширение охвата
    osint.ts              # Составное обогащение OSINT
    meta.ts               # Составное мета сервера
    helpers.ts            # Общие составные хелперы
  tcp/                    # Техники зондирования TCP (3)
  tls/                    # Техники анализа TLS/SSL (8)
  ssh/                    # Техники зондирования SSH (3)
  http/                   # Техники HTTP-фингерпринтинга (16)
  web/                    # Техники обнаружения веб-технологий (9)
  path/                   # Техники обнаружения путей (5)
  dns/                    # Техники DNS-разведки (7)
  waf/                    # Техники обнаружения WAF/CDN (4)
  timing/                 # Техники анализа тайминга (2)
  h2/                     # Техники HTTP/2 и HTTP/3 (3)
  smtp/                   # Техники зондирования SMTP (2)
  iot/                    # Техники обнаружения IoT/встраиваемых (2)
  app/                    # Техники обнаружения приложений (3)
  service/                # Техники зондирования сервисов (5)
  infra/                  # Техники обнаружения инфраструктуры (3)
  correlation/            # Движок корреляции (5)
  identify/               # Движок идентификации (3)
  passive/                # Пассивный анализ (3)
  osint/                  # Техники обогащения OSINT (6)
  enum/                   # Техники перечисления (8)
  meta/                   # Мета-инструменты (3)
  data/                   # Базы сигнатур и библиотеки паттернов
    jarm-signatures.ts    # Известные фингерпринты JARM (C2, серверы, CDN)
    waf-signatures.ts     # Сигнатуры обнаружения WAF
    service-banners.ts    # Паттерны баннеров сервисов
    tech-patterns.ts      # Паттерны обнаружения технологий
    favicon-hashes.ts     # Известные значения MurmurHash3 favicon
    c2-signatures.ts      # Сигнатуры C2-фреймворков
    ...                   # 15+ баз сигнатур/паттернов
```

**Проектные решения:**

- **13 составных инструментов, 103 техники** &mdash; Агент вызывает высокоуровневые инструменты (`recon`, `scan_tls`, `scan_http`). Каждый составной оркестрирует множество низкоуровневых техник и возвращает коррелированные результаты. Это снижает накладные расходы на вызовы инструментов при сохранении гранулярности.
- **21 провайдер, 1 сервер** &mdash; Каждый уровень фингерпринтинга является независимым модулем. Составной оркестратор выбирает техники на основе контекста и глубины.
- **Сначала активное, OSINT опционально** &mdash; 80+ техник работают путём прямого зондирования цели без API-ключей. Провайдеры OSINT (Shodan, Censys, VirusTotal, SecurityTrails) добавляют обогащение, но никогда не являются обязательными.
- **Rate limiters для каждого провайдера** &mdash; У каждого провайдера свой экземпляр `RateLimiter`. Активное зондирование ограничено по скорости для избежания обнаружения; OSINT API откалиброваны под свои квоты.
- **TTL-кеширование** &mdash; DNS-записи (10мин), результаты OSINT (15мин), CT-логи (30мин) кешируются для избежания избыточных запросов при многоинструментных рабочих процессах.
- **Плавная деградация** &mdash; Отсутствующие API-ключи не приводят к краху сервера. Инструменты OSINT возвращают описательные сообщения: «Установите SHODAN_API_KEY для включения поиска хостов Shodan.»
- **3 зависимости** &mdash; `@modelcontextprotocol/sdk`, `zod` и `cheerio`. Весь сетевой ввод-вывод через нативный `fetch()` и модули Node.js `net`/`tls`/`dns`. Без nmap, без внешних бинарников.

---

## Ограничения

- Инструменты OSINT (Shodan, Censys, VirusTotal, SecurityTrails) требуют API-ключей для соответствующих техник
- Бесплатный план Censys ограничен 250 запросами/месяц
- Бесплатный план VirusTotal ограничен 500 запросами/день
- Сканирование портов использует TCP connect (не SYN-сканирование) &mdash; менее скрытно, чем nmap, но не требует прав root
- JARM-фингерпринтинг требует прямого TCP-доступа к цели (может быть заблокирован файрволом)
- Обнаружение UPnP/SSDP работает только в локальных сетях
- Зондирование сервисов (MySQL, PostgreSQL, Redis) подключается, но не аутентифицируется
- Перечисление поддоменов основано на CT-логах и пассивных источниках (без брутфорса)
- Протестировано на macOS / Linux (Windows не тестировался)

---

## Часть Набора Безопасности MCP

| Проект | Домен | Инструменты |
|--------|-------|-------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Тестирование безопасности на основе браузера | 39 инструментов, Firefox, тестирование инъекций |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Облачная безопасность (AWS/Azure/GCP) | 38 инструментов, 60+ проверок |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Состояние безопасности GitHub | 39 инструментов, 45 проверок |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Разведка уязвимостей | 23 инструмента, 5 источников |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT и разведка | 37 инструментов, 12 источников |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Даркнет и разведка угроз | 66 инструментов, 16 источников |
| **fingerprint-mcp** | **Универсальный цифровой фингерпринтинг** | **13 инструментов, 103 техники, 21 провайдер** |

---

<p align="center">
<b>Только для авторизованного тестирования безопасности и оценки.</b><br>
Всегда убедитесь, что у вас есть надлежащее разрешение перед выполнением фингерпринтинга любой цели.
</p>

<p align="center">
  <a href="LICENSE">Лицензия AGPL-3.0</a> &bull; Создано с Bun + TypeScript
</p>
