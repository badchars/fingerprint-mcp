<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <strong>Español</strong> |
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

<h3 align="center">Huella digital universal para agentes de IA.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondeo de servicios, JARM, JA4X, hash de favicon, topologia de infraestructura, deteccion de C2, enriquecimiento OSINT &mdash; unificados en un unico servidor MCP.<br>
  Tu agente de IA obtiene <b>huella digital de espectro completo bajo demanda</b>, no 11 herramientas CLI desconectadas y correlacion manual.
</p>

<br>

<p align="center">
  <a href="#el-problema">El problema</a> &bull;
  <a href="#en-que-se-diferencia">En que se diferencia</a> &bull;
  <a href="#inicio-rapido">Inicio rapido</a> &bull;
  <a href="#que-puede-hacer-la-ia">Que puede hacer la IA</a> &bull;
  <a href="#referencia-de-herramientas-13-herramientas-103-tecnicas">Herramientas (13)</a> &bull;
  <a href="#fuentes-de-datos-21">Fuentes de datos</a> &bull;
  <a href="#arquitectura">Arquitectura</a> &bull;
  <a href="CHANGELOG.md">Registro de cambios</a> &bull;
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licencia"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 herramientas">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 tecnicas">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="Demo de fingerprint-mcp" width="800">
</p>

---

## El problema

Hacer fingerprinting de un servidor hoy significa manejar una docena de herramientas desconectadas. Ejecutas `nmap` para escaneo de puertos, `testssl.sh` para analisis de certificados, `curl -I` para cabeceras HTTP, `dig` para DNS, `wafw00f` para deteccion de WAF, `ssh-audit` para SSH, una herramienta JARM separada, Wappalyzer para deteccion de tecnologias &mdash; y luego pasas 30 minutos cruzando referencias manualmente en una hoja de calculo para descubrir que esta realmente ejecutandose.

```
Flujo de trabajo tradicional de fingerprinting:
  analizar certificados TLS     ->  testssl.sh / openssl s_client
  capturar cabeceras HTTP       ->  curl -I
  detectar tecnologias web      ->  wappalyzer CLI
  reconocimiento DNS            ->  dig / nslookup / dnsenum
  escaneo de puertos            ->  nmap -sV
  deteccion de WAF              ->  wafw00f
  auditoria SSH                 ->  ssh-audit
  fingerprinting de servicios   ->  nmap scripts
  huella JARM                   ->  jarm (herramienta separada)
  consultar bases OSINT         ->  shodan CLI, censys CLI
  correlacionar todo            ->  manualmente en una hoja de calculo
  ──────────────────────────────
  Total: 11 herramientas, 30+ minutos, correlacion manual
```

**fingerprint-mcp** proporciona a tu agente de IA 13 herramientas compuestas que encapsulan 103 tecnicas de fingerprinting de 21 proveedores a traves del [Model Context Protocol](https://modelcontextprotocol.io). El agente ejecuta fingerprinting multicapa en paralelo, correlaciona senales entre capas TCP/TLS/HTTP/DNS/SSH, detecta honeypots e infraestructura C2, y presenta una imagen de inteligencia unificada &mdash; todo en una sola conversacion.

```
Con fingerprint-mcp:
  Tu: "Haz un reconocimiento profundo de target.com"

  Agente: -> recon {url: "https://target.com", depth: "deep"}

          -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
             certificado Let's Encrypt, 2 SANs, TLS 1.2+1.3
          -> HTTP: Express.js detras de Cloudflare WAF,
             React SPA, Google Analytics, 14 cabeceras de seguridad analizadas
          -> DNS: registros A/AAAA/MX/TXT, SPF/DKIM/DMARC configurados,
             Slack + Google Workspace detectados via CNAME/MX
          -> Puertos: 80, 443, 22 (OpenSSH 9.6), 8080 (servidor de desarrollo)
          -> WAF: Cloudflare detectado, IP de origen descubierta via conexion directa
          -> Enumeracion: 12 subdominios via registros CT, DNS comodin detectado
          -> "target.com ejecuta nginx/1.24.0 con Express.js detras de
             Cloudflare WAF. La IP de origen 203.0.113.42 esta expuesta en
             el puerto 8080. TLS esta correctamente configurado (equivalente A+),
             pero el servidor de desarrollo en 8080 no tiene proteccion WAF.
             3 subdominios apuntan a infraestructura desmantelada —
             riesgo potencial de apropiacion."
```

---

## En que se diferencia

Las herramientas existentes te dan datos sin procesar una capa a la vez. fingerprint-mcp le da a tu agente de IA la capacidad de **razonar simultaneamente a traves de todas las capas de fingerprinting**.

<table>
<thead>
<tr>
<th></th>
<th>Enfoque tradicional</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interfaz</b></td>
<td>11 herramientas CLI diferentes con formatos de salida distintos</td>
<td>MCP &mdash; agente de IA llama herramientas conversacionalmente</td>
</tr>
<tr>
<td><b>Tecnicas</b></td>
<td>Una herramienta, una capa a la vez</td>
<td>103 tecnicas de 21 proveedores, ejecutadas en paralelo</td>
</tr>
<tr>
<td><b>Analisis TLS</b></td>
<td>Salida de testssl.sh, analizar JARM por separado manualmente</td>
<td>El agente combina certificado + JARM + JA4X + suites de cifrado + SNI + registros CT en una llamada</td>
</tr>
<tr>
<td><b>Correlacion</b></td>
<td>Copiar y pegar resultados en una hoja de calculo</td>
<td>El agente correlaciona: "JARM coincide con framework C2 conocido, timing HTTP confirma honeypot"</td>
</tr>
<tr>
<td><b>Evasion de WAF</b></td>
<td>wafw00f detecta WAF, buscas el origen manualmente</td>
<td>El agente detecta WAF, descubre la IP de origen y verifica que sirve el mismo contenido</td>
</tr>
<tr>
<td><b>Claves API</b></td>
<td>Requeridas para Shodan, Censys, etc.</td>
<td>80+ tecnicas activas funcionan sin claves API; las claves desbloquean enriquecimiento OSINT</td>
</tr>
<tr>
<td><b>Configuracion</b></td>
<td>Instalar nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; un comando, cero configuracion</td>
</tr>
</tbody>
</table>

---

## Inicio rapido

### Opcion 1: npx (sin instalacion)

```bash
npx fingerprint-mcp
```

Las 80+ tecnicas activas de fingerprinting funcionan inmediatamente. No se requieren claves API para TCP, TLS, SSH, HTTP, DNS, WAF, rutas, servicios, temporizado, IoT, SMTP, infraestructura y fingerprinting de aplicaciones.

### Opcion 2: Clonar

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Variables de entorno (opcionales)

```bash
# Enriquecimiento OSINT (todas opcionales — el fingerprinting activo funciona sin claves)
export SHODAN_API_KEY=your-key           # Habilita osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Habilita osint_censys (gratuito: 250 consultas/mes)
export CENSYS_API_SECRET=your-secret     # Secreto de API de Censys
export SECURITYTRAILS_API_KEY=your-key   # Habilita waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Habilita osint_virustotal (gratuito: 500 consultas/dia)
```

Todas las claves API son opcionales. Sin ellas, sigues teniendo TCP/TLS/SSH/HTTP/DNS/WAF/rutas/servicios/temporizado/IoT/SMTP/infraestructura/aplicaciones, correlacion, analisis pasivo, enumeracion y herramientas meta completas &mdash; 80+ tecnicas que funcionan sondeando directamente el objetivo.

### Conectar con tu agente de IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Con npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Con clon local
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Agregar a `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / otros clientes MCP</b></summary>

El mismo formato de configuracion JSON. Apunta el comando a `npx fingerprint-mcp` o a tu ruta de instalacion local.

</details>

### Empezar a consultar

```
Tu: "Haz fingerprinting de todo en target.com — TLS, stack HTTP, WAF, DNS, puertos abiertos"
```

Eso es todo. El agente maneja automaticamente el fingerprinting multicapa, la correlacion de senales y el analisis de infraestructura.

---

## Que puede hacer la IA

### Reconocimiento rapido

```
Tu: "Reconocimiento rapido de target.com"

Agente: -> recon {url: "https://target.com", depth: "quick"}

        -> TCP: puertos 80, 443, 22 abiertos
        -> TLS: certificado RSA Let's Encrypt, TLS 1.2+1.3, firma JARM de nginx
        -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
        -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM configurados
        -> WAF: Cloudflare detectado (cabecera cf-ray)
        -> "target.com es una SPA React sobre Express.js detras de nginx/1.24.0,
           servida a traves de Cloudflare CDN. TLS correctamente configurado con
           Let's Encrypt. SSH en puerto 22 ejecutando OpenSSH 9.6. Correo
           manejado por Google Workspace con SPF/DKIM/DMARC completo."
```

### Investigacion profunda de TLS

```
Tu: "Analiza la configuracion TLS de suspicious-server.com en detalle"

Agente: -> scan_tls {host: "suspicious-server.com"}

        -> Certificado: autofirmado, CN=localhost, expirado hace 47 dias
        -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
           (coincide con perfil predeterminado de Cobalt Strike)
        -> JA4X: huella coincide con patron de framework C2 conocido
        -> Suites de cifrado: acepta cifrados debiles (RC4, 3DES)
        -> SNI: responde identicamente a cualquier valor SNI
        -> Registros CT: certificado no registrado (no confiable publicamente)
        -> "ALTO RIESGO: La configuracion TLS indica fuertemente infraestructura C2.
           Certificado autofirmado expirado, huella JARM coincide con Cobalt Strike,
           acepta cifrados debiles y responde a valores SNI arbitrarios.
           Se recomienda investigacion inmediata y bloqueo."
```

### Evasion de WAF y descubrimiento de origen

```
Tu: "target.com esta detras de un WAF. Puedes encontrar el servidor de origen?"

Agente: -> scan_waf {url: "https://target.com"}
        -> scan_dns {domain: "target.com"}
        -> enumerate {domain: "target.com"}

        -> WAF: Cloudflare (AS13335), pagina de desafio en solicitudes sospechosas
        -> DNS: registro A apunta a IP de Cloudflare 104.21.x.x
        -> Subdominios: dev.target.com resuelve a 203.0.113.42 (no Cloudflare)
        -> Conexion directa a 203.0.113.42:443 devuelve el mismo certificado TLS
        -> Historico SecurityTrails: origen era 203.0.113.42 antes de Cloudflare
        -> "IP de origen encontrada: 203.0.113.42. Descubierta via subdominio
           dev.target.com que evita Cloudflare. El origen sirve el mismo
           certificado TLS y responde a la cabecera Host de target.com.
           El origen no tiene proteccion WAF — acceso directo posible."
```

### Descubrimiento de servicios en un host

```
Tu: "Que servicios estan ejecutandose en 10.0.1.50?"

Agente: -> scan_ports {host: "10.0.1.50"}
        -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

        -> Puerto 22: OpenSSH 8.9p1 Ubuntu, clave de host ED25519
        -> Puerto 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
        -> Puerto 3306: MySQL 8.0.36, autenticacion requerida
        -> Puerto 5432: PostgreSQL 16.1, SSL requerido
        -> Puerto 6379: Redis 7.2.4, SIN autenticacion (abierto)
        -> Puerto 8080: servidor de desarrollo Node.js Express, CORS: *
        -> "CRITICO: Redis en puerto 6379 no tiene autenticacion — cualquiera
           en la red puede leer/escribir datos. El servidor de desarrollo Express
           en 8080 tiene CORS comodin. MySQL y PostgreSQL requieren correctamente
           autenticacion. WordPress esta 2 versiones menores atrasado.
           Accion inmediata necesaria en Redis y la exposicion del servidor
           de desarrollo."
```

---

## Referencia de herramientas (13 herramientas, 103 tecnicas)

<details open>
<summary><b>recon &mdash; Reconocimiento completo con seleccion de tecnicas basada en profundidad</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `url` | string | URL objetivo para fingerprinting |
| `depth` | `quick` \| `standard` \| `deep` | Profundidad de escaneo: quick=5 tecnicas, standard=20, deep=50+ |

Orquesta tecnicas de todos los proveedores basandose en el nivel de profundidad. El modo rapido da una vision general rapida; el modo profundo ejecuta fingerprinting exhaustivo incluyendo enumeracion, OSINT y correlacion.

</details>

<details>
<summary><b>scan_ports &mdash; Escaneo de puertos TCP con deteccion de servicios (3 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `host` | string | Host objetivo (IP o dominio) |
| `ports` | number[] | Opcional &mdash; puertos especificos a escanear (predeterminado: puertos comunes) |

| Tecnica | Descripcion |
|---------|-------------|
| `tcp_probe` | Escaneo de conexion TCP para detectar puertos abiertos |
| `tcp_banner` | Captura de banner en puertos abiertos para identificacion de servicios |
| `tcp_analysis` | Analisis de combinacion de puertos e inferencia de servicios |

</details>

<details>
<summary><b>scan_tls &mdash; Analisis completo de TLS/SSL (8 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `host` | string | Host objetivo (IP o dominio) |
| `port` | number | Opcional &mdash; puerto TLS (predeterminado: 443) |

| Tecnica | Descripcion |
|---------|-------------|
| `tls_certificate` | Analisis de certificado X.509 &mdash; sujeto, emisor, SANs, validez, cadena |
| `tls_jarm` | Fingerprinting activo JARM &mdash; 10 sondas TLS Client Hello, hash de 62 caracteres |
| `tls_ja4x` | Fingerprinting pasivo TLS JA4X a partir de propiedades del certificado |
| `tls_ciphers` | Enumeracion de suites de cifrado y analisis de fortaleza |
| `tls_protocols` | Deteccion de versiones de protocolo TLS soportadas (SSLv3 hasta TLS 1.3) |
| `tls_sni` | Prueba de comportamiento SNI &mdash; certificado predeterminado vs. nombre de host solicitado |
| `tls_ct_logs` | Consulta de registros de Certificate Transparency via crt.sh |
| `tls_ocsp` | Grapado OCSP y verificacion de estado de revocacion |

</details>

<details>
<summary><b>scan_dns &mdash; Inteligencia DNS (7 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `domain` | string | Dominio objetivo |

| Tecnica | Descripcion |
|---------|-------------|
| `dns_records` | Enumeracion completa de registros &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analisis de registros SPF, DKIM y DMARC |
| `dns_saas` | Deteccion de SaaS/servicios via patrones CNAME y MX (Slack, Zendesk, etc.) |
| `dns_server` | Fingerprinting de servidor DNS (BIND, PowerDNS, Cloudflare, etc.) |
| `dns_takeover` | Deteccion de apropiacion de subdominio via analisis de CNAME colgante |
| `dns_zone` | Intento de transferencia de zona (AXFR) |
| `dns_caa` | Analisis de registro CAA para restricciones de autoridad de certificacion |

</details>

<details>
<summary><b>scan_http &mdash; Fingerprinting HTTP/web (29 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `url` | string | URL objetivo |

| Tecnica | Proveedor | Descripcion |
|---------|-----------|-------------|
| `http_headers` | HTTP | Analisis de cabeceras de respuesta e identificacion de servidor |
| `http_header_order` | HTTP | Huella de orden de cabeceras (firma de software del servidor) |
| `http_security_headers` | HTTP | Auditoria de cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.) |
| `http_cookies` | HTTP | Analisis de cookies &mdash; flags, prefijos, deteccion de framework |
| `http_methods` | HTTP | Enumeracion de metodos HTTP permitidos (OPTIONS) |
| `http_cors` | HTTP | Analisis de politica CORS y deteccion de mala configuracion |
| `http_compression` | HTTP | Algoritmos de compresion soportados (gzip, br, zstd) |
| `http_caching` | HTTP | Analisis de cabeceras de cache (deteccion de CDN, proxy inverso) |
| `http_etag` | HTTP | Analisis de formato ETag para identificacion de backend |
| `http_error` | HTTP | Fingerprinting de paginas de error (personalizadas vs. predeterminadas) |
| `http_redirect` | HTTP | Analisis de cadena de redireccion |
| `http_timing` | HTTP | Linea base de temporizado de respuesta para perfilado de rendimiento |
| `http_favicon` | HTTP | Hash de favicon (MurmurHash3) para identificacion de tecnologia |
| `http_robots` | HTTP | Analisis de robots.txt y extraccion de rutas prohibidas |
| `http_sitemap` | HTTP | Descubrimiento de sitemap y extraccion de URLs |
| `http_wellknown` | HTTP | Descubrimiento de endpoints .well-known (security.txt, openid, etc.) |
| `web_tech` | Web | Deteccion de tecnologia via patrones HTML/JS/CSS |
| `web_analytics` | Web | Deteccion de servicios de analitica y seguimiento |
| `web_sourcemaps` | Web | Descubrimiento de archivos source map |
| `web_websocket` | Web | Deteccion de endpoints WebSocket |
| `web_graphql` | Web | Deteccion de endpoints GraphQL e introspeccion |
| `web_spa` | Web | Deteccion de frameworks de aplicacion de pagina unica |
| `web_cdn` | Web | Deteccion de CDN via cabeceras de respuesta y DNS |
| `web_meta` | Web | Analisis de meta tags HTML (generador, pistas de framework) |
| `web_feed` | Web | Descubrimiento de feeds RSS/Atom |
| `h2_detect` | HTTP/2 | Deteccion de soporte de protocolo HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Fingerprinting de servidor HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Deteccion de soporte HTTP/3 (QUIC) via cabecera Alt-Svc |
| `app_cms` | Application | Deteccion de CMS (WordPress, Drupal, Joomla, etc.) |

</details>

<details>
<summary><b>scan_paths &mdash; Inteligencia de rutas (5 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `url` | string | URL objetivo |
| `categories` | string[] | Opcional &mdash; categorias a verificar (sensitive, git, debug, api, config) |

| Tecnica | Descripcion |
|---------|-------------|
| `path_sensitive` | Descubrimiento de archivos sensibles (backups, archivos de configuracion, volcados de base de datos) |
| `path_robots` | Analisis de robots.txt y sitemap.xml para descubrir rutas ocultas |
| `path_git` | Deteccion de fugas de repositorio Git (.git/HEAD, .git/config) |
| `path_debug` | Descubrimiento de endpoints de depuracion (phpinfo, server-status, consolas de depuracion) |
| `path_api` | Descubrimiento de versiones de API y endpoints de documentacion |

</details>

<details>
<summary><b>scan_waf &mdash; Deteccion y fingerprinting de WAF/CDN (4 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `url` | string | URL objetivo |

| Tecnica | Descripcion |
|---------|-------------|
| `waf_detect` | Deteccion de presencia de WAF via analisis de cabeceras de respuesta y comportamiento |
| `waf_cdn` | Identificacion de proveedor CDN (Cloudflare, Akamai, Fastly, etc.) |
| `waf_fingerprint` | Identificacion de producto WAF y deteccion de version |
| `waf_origin` | Descubrimiento de IP de origen detras de WAF/CDN (requiere `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondeo a nivel de servicio (12 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `host` | string | Host objetivo (IP o dominio) |
| `ports` | number[] | Opcional &mdash; puertos especificos a sondear |
| `service` | string | Opcional &mdash; servicio especifico a sondear (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Tecnica | Proveedor | Descripcion |
|---------|-----------|-------------|
| `ssh_probe` | SSH | Deteccion de version de protocolo SSH y software |
| `ssh_algorithms` | SSH | Auditoria de algoritmos SSH (KEX, cifrados, MACs, tipos de clave de host) |
| `ssh_hostkey_lookup` | SSH | Busqueda de clave de host SSH via Shodan (requiere `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Deteccion de version MySQL y fingerprinting de capacidades |
| `svc_postgres` | Service | Deteccion de version PostgreSQL y verificacion de soporte SSL |
| `svc_redis` | Service | Deteccion de version Redis y estado de autenticacion |
| `svc_ftp` | Service | Analisis de banner FTP y verificacion de inicio de sesion anonimo |
| `svc_vnc_rdp` | Service | Deteccion de servicio VNC/RDP y evaluacion de seguridad |
| `smtp_banner` | SMTP | Analisis de banner SMTP e identificacion de MTA |
| `smtp_starttls` | SMTP | Soporte SMTP STARTTLS e inspeccion de certificado |
| `iot_detect` | IoT | Deteccion de dispositivos IoT via patrones de banner y paginas predeterminadas |
| `iot_upnp` | IoT | Descubrimiento de dispositivos UPnP/SSDP en red local |

</details>

<details>
<summary><b>enumerate &mdash; Expansion de alcance (8 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `domain` | string | Dominio objetivo |

| Tecnica | Descripcion |
|---------|-------------|
| `enum_subdomains` | Enumeracion de subdominios via multiples metodos |
| `enum_wildcard` | Deteccion de DNS comodin |
| `enum_tld` | Expansion de TLD (target.com -> target.net, target.org, etc.) |
| `enum_related` | Descubrimiento de dominios relacionados via infraestructura compartida |
| `enum_asn` | Descubrimiento de vecinos ASN &mdash; otros dominios en la misma red |
| `enum_ct` | Extraccion de subdominios de registros Certificate Transparency |
| `enum_passive_dns` | Historial DNS pasivo (requiere `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Resumen de alcance y vision general de superficie de ataque |

</details>

<details>
<summary><b>osint &mdash; Enriquecimiento OSINT (6 tecnicas)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `target` | string | Direccion IP o dominio a enriquecer |
| `type` | `ip` \| `domain` | Opcional &mdash; tipo de objetivo (autodetectado si se omite) |

| Tecnica | Auth | Descripcion |
|---------|------|-------------|
| `osint_shodan` | `SHODAN_API_KEY` | Consulta de host Shodan &mdash; puertos abiertos, banners, vulnerabilidades, SO |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Datos de host Censys &mdash; servicios, TLS, sistema autonomo |
| `osint_reverse_ip` | Ninguna | Busqueda IP inversa &mdash; otros dominios en la misma IP |
| `osint_whois` | Ninguna | Datos de registro WHOIS &mdash; registrador, fechas, servidores de nombres |
| `osint_webarchive` | Ninguna | Historial Web Archive &mdash; primer/ultimo snapshot, frecuencia de cambio |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Informe VirusTotal de dominio/IP &mdash; detecciones, categorias, DNS |

</details>

<details>
<summary><b>analyze &mdash; Analisis pasivo de huellas (3 modos)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `type` | `headers` \| `html` \| `banner` | Tipo de datos a analizar |
| `data` | string | Datos sin procesar a analizar (pegar cabeceras, HTML o salida de banner) |

| Modo | Descripcion |
|------|-------------|
| `fp_analyze_headers` | Analisis pasivo de cabeceras HTTP &mdash; deteccion de servidor, framework, proxy sin enviar trafico |
| `fp_analyze_html` | Analisis pasivo de HTML &mdash; deteccion de tecnologia, identificacion de framework del codigo fuente |
| `fp_analyze_banner` | Analisis pasivo de banner &mdash; identificacion de servicio a partir de texto de banner sin procesar |

</details>

<details>
<summary><b>correlate &mdash; Motor de correlacion multi-senal (7 modos)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Modo de correlacion |
| `signals` | object | Senales de huella a correlacionar (varia segun el modo) |

| Modo | Descripcion |
|------|-------------|
| `fp_consistency` | Verificacion de consistencia de senales entre capas &mdash; coinciden las huellas TCP, TLS, HTTP y DNS? |
| `fp_honeypot` | Deteccion de honeypot &mdash; verifica combinaciones de servicios imposibles y anomalias de comportamiento |
| `fp_spoofing` | Deteccion de suplantacion &mdash; identifica discrepancias entre cabeceras de servidor y comportamiento real |
| `fp_compare` | Comparacion lado a lado de perfiles de huellas de dos hosts |
| `fp_topology` | Mapeo de topologia de infraestructura &mdash; CDN, balanceador de carga, cadena de proxy inverso |
| `fp_c2` | Deteccion de framework C2 via correlacion JARM, TLS, HTTP y temporizado |
| `fp_identify` | Identificacion basada en hash contra base de datos de firmas conocidas |

</details>

<details>
<summary><b>meta &mdash; Configuracion y datos del servidor (3 modos)</b></summary>

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `category` | string | Opcional &mdash; filtrar por categoria |

| Modo | Descripcion |
|------|-------------|
| `fp_sources` | Listar todas las fuentes de datos disponibles con configuracion y estado de claves API |
| `fp_config` | Configuracion del servidor &mdash; version, proveedores cargados, conteo de tecnicas |
| `fp_signatures` | Listado de base de datos de firmas &mdash; firmas JARM, banner, WAF, aplicacion |

</details>

---

### Uso de CLI

```bash
# Listar todas las herramientas y tecnicas disponibles
npx fingerprint-mcp --list

# Ejecutar cualquier herramienta directamente
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

# Herramientas OSINT (requieren claves API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Fuentes de datos (21)

| Fuente | Auth | Que proporciona |
|--------|------|-----------------|
| Sondeo TCP | Ninguna | Escaneo de puertos, captura de banner, deteccion de servicios |
| Analisis TLS/SSL | Ninguna | Analisis de certificados, fingerprinting JARM, JA4X, enumeracion de cifrados, pruebas SNI |
| Sondeo SSH | Ninguna | Version de protocolo, auditoria de algoritmos, deteccion de software |
| Analisis HTTP | Ninguna | Fingerprinting de cabeceras, hash de favicon, analisis de cookies, enumeracion de metodos, CORS |
| Deteccion web | Ninguna | Deteccion de tecnologia, analitica, source maps, WebSocket, GraphQL, frameworks SPA |
| Descubrimiento de rutas | Ninguna | Archivos sensibles, fugas Git, endpoints de depuracion, versiones de API, robots.txt |
| Resolucion DNS | Ninguna | Enumeracion de registros, analisis de autenticacion de email, deteccion SaaS, fingerprinting de servidor |
| Deteccion WAF/CDN | Ninguna | Identificacion de WAF, deteccion de CDN, fingerprinting de WAF |
| Analisis de temporizado | Ninguna | Linea base de temporizado de respuesta, deteccion de desviacion de reloj |
| HTTP/2 & HTTP/3 | Ninguna | Deteccion y fingerprinting HTTP/2, descubrimiento HTTP/3 Alt-Svc |
| Sondeo SMTP | Ninguna | Analisis de banner SMTP, inspeccion STARTTLS |
| IoT/Embebido | Ninguna | Deteccion de dispositivos IoT, descubrimiento UPnP/SSDP |
| Deteccion de aplicaciones | Ninguna | Identificacion de CMS, framework y plataforma de comercio electronico |
| Sondeo de servicios | Ninguna | Fingerprinting de MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Deteccion de infraestructura | Ninguna | Identificacion de proveedor cloud, proveedor de hosting, CDN |
| Motor de correlacion | Ninguna | Consistencia de senales, deteccion de honeypot, deteccion de suplantacion, mapeo de topologia |
| Motor de identificacion | Ninguna | Identificacion basada en hash, deteccion C2, coincidencia de firmas |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Inteligencia de host &mdash; puertos abiertos, banners, vulnerabilidades, deteccion de SO |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Datos de host &mdash; servicios, certificados TLS, informacion de sistema autonomo |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Descubrimiento de origen WAF, historial DNS pasivo, registros historicos |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputacion de dominio/IP, resultados de deteccion, historial DNS, categorias |

---

## Arquitectura

```
src/
  index.ts                # Punto de entrada CLI (--help, --list, --tool, servidor stdio)
  protocol/
    mcp-server.ts         # Configuracion del servidor MCP (transporte stdio)
    tools.ts              # Registro de herramientas — las 13 herramientas compuestas registradas aqui
  types/
    index.ts              # Tipos compartidos (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Limitador de tasa por proveedor
    cache.ts              # Cache TTL para respuestas API
    require-key.ts        # Helper de validacion de clave API
    murmurhash3.ts        # MurmurHash3 para hash de favicon
  composite/              # 13 orquestadores de herramientas compuestas
    recon.ts              # Orquestador de reconocimiento completo (quick/standard/deep)
    scan-ports.ts         # Compuesto de escaneo de puertos
    scan-tls.ts           # Compuesto de analisis TLS
    scan-dns.ts           # Compuesto de inteligencia DNS
    scan-http.ts          # Compuesto de fingerprinting HTTP
    scan-paths.ts         # Compuesto de descubrimiento de rutas
    scan-waf.ts           # Compuesto de deteccion WAF/CDN
    scan-services.ts      # Compuesto de sondeo de servicios
    analyze.ts            # Compuesto de analisis pasivo
    correlate.ts          # Compuesto de motor de correlacion
    enumerate.ts          # Compuesto de expansion de alcance
    osint.ts              # Compuesto de enriquecimiento OSINT
    meta.ts               # Compuesto de meta del servidor
    helpers.ts            # Helpers compartidos de compuestos
  tcp/                    # Tecnicas de sondeo TCP (3)
  tls/                    # Tecnicas de analisis TLS/SSL (8)
  ssh/                    # Tecnicas de sondeo SSH (3)
  http/                   # Tecnicas de fingerprinting HTTP (16)
  web/                    # Tecnicas de deteccion de tecnologia web (9)
  path/                   # Tecnicas de descubrimiento de rutas (5)
  dns/                    # Tecnicas de inteligencia DNS (7)
  waf/                    # Tecnicas de deteccion WAF/CDN (4)
  timing/                 # Tecnicas de analisis de temporizado (2)
  h2/                     # Tecnicas HTTP/2 & HTTP/3 (3)
  smtp/                   # Tecnicas de sondeo SMTP (2)
  iot/                    # Tecnicas de deteccion IoT/embebido (2)
  app/                    # Tecnicas de deteccion de aplicaciones (3)
  service/                # Tecnicas de sondeo de servicios (5)
  infra/                  # Tecnicas de deteccion de infraestructura (3)
  correlation/            # Motor de correlacion (5)
  identify/               # Motor de identificacion (3)
  passive/                # Analisis pasivo (3)
  osint/                  # Tecnicas de enriquecimiento OSINT (6)
  enum/                   # Tecnicas de enumeracion (8)
  meta/                   # Herramientas meta (3)
  data/                   # Bases de datos de firmas y bibliotecas de patrones
    jarm-signatures.ts    # Huellas JARM conocidas (C2, servidores, CDNs)
    waf-signatures.ts     # Firmas de deteccion WAF
    service-banners.ts    # Patrones de banner de servicios
    tech-patterns.ts      # Patrones de deteccion de tecnologia
    favicon-hashes.ts     # Valores MurmurHash3 de favicon conocidos
    c2-signatures.ts      # Firmas de framework C2
    ...                   # 15+ bases de datos de firmas/patrones
```

**Decisiones de diseno:**

- **13 herramientas compuestas, 103 tecnicas** &mdash; El agente llama herramientas de alto nivel (`recon`, `scan_tls`, `scan_http`). Cada compuesto orquesta multiples tecnicas de bajo nivel y devuelve resultados correlacionados. Esto reduce la sobrecarga de llamadas a herramientas manteniendo la granularidad.
- **21 proveedores, 1 servidor** &mdash; Cada capa de fingerprinting es un modulo independiente. El orquestador compuesto selecciona tecnicas basandose en el contexto y la profundidad.
- **Activo primero, OSINT opcional** &mdash; 80+ tecnicas funcionan sondeando directamente el objetivo sin claves API. Los proveedores OSINT (Shodan, Censys, VirusTotal, SecurityTrails) agregan enriquecimiento pero nunca son requeridos.
- **Limitadores de tasa por proveedor** &mdash; Cada proveedor tiene su propia instancia de `RateLimiter`. El sondeo activo tiene limite de tasa para evitar deteccion; las APIs OSINT estan calibradas a sus cuotas.
- **Cache TTL** &mdash; Registros DNS (10 min), resultados OSINT (15 min), registros CT (30 min) se almacenan en cache para evitar consultas redundantes en flujos de trabajo multi-herramienta.
- **Degradacion elegante** &mdash; La falta de claves API no hace que el servidor se caiga. Las herramientas OSINT devuelven mensajes descriptivos: "Configure SHODAN_API_KEY para habilitar la consulta de host Shodan."
- **3 dependencias** &mdash; `@modelcontextprotocol/sdk`, `zod` y `cheerio`. Toda la E/S de red via `fetch()` nativo y modulos `net`/`tls`/`dns` de Node.js. Sin nmap, sin binarios externos.

---

## Limitaciones

- Las herramientas OSINT (Shodan, Censys, VirusTotal, SecurityTrails) requieren claves API para sus tecnicas respectivas
- El nivel gratuito de Censys esta limitado a 250 consultas/mes
- El nivel gratuito de VirusTotal esta limitado a 500 consultas/dia
- El escaneo de puertos usa TCP connect (no escaneo SYN) &mdash; menos sigiloso que nmap pero no requiere privilegios root
- El fingerprinting JARM requiere acceso TCP directo al objetivo (puede ser bloqueado por firewalls)
- El descubrimiento UPnP/SSDP solo funciona en redes locales
- El sondeo de servicios (MySQL, PostgreSQL, Redis) se conecta pero no autentica
- La enumeracion de subdominios depende de registros CT y fuentes pasivas (sin fuerza bruta)
- macOS / Linux probados (Windows no probado)

---

## Parte de la suite de seguridad MCP

| Proyecto | Dominio | Herramientas |
|----------|---------|--------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Pruebas de seguridad basadas en navegador | 39 herramientas, Firefox, pruebas de inyeccion |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Seguridad cloud (AWS/Azure/GCP) | 38 herramientas, 60+ verificaciones |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura de seguridad GitHub | 39 herramientas, 45 verificaciones |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Inteligencia de vulnerabilidades | 23 herramientas, 5 fuentes |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT y reconocimiento | 37 herramientas, 12 fuentes |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web e inteligencia de amenazas | 66 herramientas, 16 fuentes |
| **fingerprint-mcp** | **Huella digital universal** | **13 herramientas, 103 tecnicas, 21 proveedores** |

---

<p align="center">
<b>Solo para pruebas y evaluaciones de seguridad autorizadas.</b><br>
Siempre asegurese de tener la autorizacion adecuada antes de realizar fingerprinting en cualquier objetivo.
</p>

<p align="center">
  <a href="LICENSE">Licencia AGPL-3.0</a> &bull; Construido con Bun + TypeScript
</p>
