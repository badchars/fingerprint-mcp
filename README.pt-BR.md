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
  <strong>Português (Brasil)</strong> |
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

<h3 align="center">Fingerprinting digital universal para agentes de IA.</h3>

<p align="center">
  TCP, TLS/SSL, SSH, HTTP, DNS, WAF/CDN, IoT, SMTP, sondagem de servicos, JARM, JA4X, hash de favicon, topologia de infraestrutura, deteccao de C2, enriquecimento OSINT &mdash; unificados em um unico servidor MCP.<br>
  Seu agente de IA obtem <b>fingerprinting de espectro completo sob demanda</b>, nao 11 ferramentas CLI desconectadas e correlacao manual.
</p>

<br>

<p align="center">
  <a href="#o-problema">O Problema</a> &bull;
  <a href="#como-e-diferente">Como e Diferente</a> &bull;
  <a href="#inicio-rapido">Inicio Rapido</a> &bull;
  <a href="#o-que-a-ia-pode-fazer">O que a IA Pode Fazer</a> &bull;
  <a href="#referencia-de-ferramentas-13-ferramentas-103-tecnicas">Ferramentas (13)</a> &bull;
  <a href="#fontes-de-dados-21">Fontes de Dados</a> &bull;
  <a href="#arquitetura">Arquitetura</a> &bull;
  <a href="CHANGELOG.md">Changelog</a> &bull;
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/fingerprint-mcp"><img src="https://img.shields.io/npm/v/fingerprint-mcp.svg" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" alt="Licenca"></a>
  <img src="https://img.shields.io/badge/runtime-Bun-f472b6" alt="Bun">
  <img src="https://img.shields.io/badge/protocol-MCP-8b5cf6" alt="MCP">
  <img src="https://img.shields.io/badge/tools-13-ef4444" alt="13 Ferramentas">
  <img src="https://img.shields.io/badge/techniques-103-f97316" alt="103 Tecnicas">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/badchars/fingerprint-mcp/main/.github/demo.gif" alt="demonstracao do fingerprint-mcp" width="800">
</p>

---

## O Problema

Fazer o fingerprinting de um servidor hoje significa lidar com uma duzia de ferramentas desconectadas. Voce executa `nmap` para varredura de portas, `testssl.sh` para analise de certificados, `curl -I` para cabecalhos HTTP, `dig` para DNS, `wafw00f` para deteccao de WAF, `ssh-audit` para SSH, uma ferramenta JARM separada, Wappalyzer para deteccao de tecnologias &mdash; e depois gasta 30 minutos cruzando manualmente tudo em uma planilha para descobrir o que realmente esta rodando.

```
Fluxo de trabalho tradicional de fingerprinting:
  analisar certificados TLS      ->  testssl.sh / openssl s_client
  capturar cabecalhos HTTP       ->  curl -I
  detectar tecnologias web       ->  wappalyzer CLI
  reconhecimento DNS             ->  dig / nslookup / dnsenum
  varredura de portas            ->  nmap -sV
  deteccao de WAF                ->  wafw00f
  auditoria SSH                  ->  ssh-audit
  fingerprinting de servicos     ->  nmap scripts
  fingerprint JARM               ->  jarm (ferramenta separada)
  verificar bancos OSINT         ->  shodan CLI, censys CLI
  correlacionar tudo             ->  manualmente em uma planilha
  ──────────────────────────────
  Total: 11 ferramentas, 30+ minutos, correlacao manual
```

O **fingerprint-mcp** oferece ao seu agente de IA 13 ferramentas compostas que encapsulam 103 tecnicas de fingerprinting em 21 provedores via [Model Context Protocol](https://modelcontextprotocol.io). O agente executa fingerprinting multicamada em paralelo, correlaciona sinais entre as camadas TCP/TLS/HTTP/DNS/SSH, detecta honeypots e infraestrutura C2, e apresenta um panorama de inteligencia unificado &mdash; em uma unica conversa.

```
Com fingerprint-mcp:
  Voce: "Faca um reconhecimento profundo em target.com"

  Agente: -> recon {url: "https://target.com", depth: "deep"}

         -> TLS: nginx/1.24.0 via JARM (3fd21b20d00000...),
            certificado Let's Encrypt, 2 SANs, TLS 1.2+1.3
         -> HTTP: Express.js atras do Cloudflare WAF,
            React SPA, Google Analytics, 14 cabecalhos de seguranca analisados
         -> DNS: registros A/AAAA/MX/TXT, SPF/DKIM/DMARC configurados,
            Slack + Google Workspace detectados via CNAME/MX
         -> Portas: 80, 443, 22 (OpenSSH 9.6), 8080 (servidor de desenvolvimento)
         -> WAF: Cloudflare detectado, IP de origem descoberto via conexao direta
         -> Enumeracao: 12 subdominios via logs CT, wildcard DNS detectado
         -> "target.com roda nginx/1.24.0 com Express.js atras do
            Cloudflare WAF. IP de origem 203.0.113.42 exposto na porta 8080.
            TLS esta corretamente configurado (equivalente a A+), mas o servidor
            de desenvolvimento na porta 8080 nao tem protecao WAF. 3 subdominios
            apontam para infraestrutura desativada — risco potencial de takeover."
```

---

## Como e Diferente

Ferramentas existentes fornecem dados brutos uma camada por vez. O fingerprint-mcp da ao seu agente de IA a capacidade de **raciocinar em todas as camadas de fingerprinting simultaneamente**.

<table>
<thead>
<tr>
<th></th>
<th>Abordagem Tradicional</th>
<th>fingerprint-mcp</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Interface</b></td>
<td>11 ferramentas CLI diferentes com formatos de saida distintos</td>
<td>MCP &mdash; agente de IA chama ferramentas de forma conversacional</td>
</tr>
<tr>
<td><b>Tecnicas</b></td>
<td>Uma ferramenta, uma camada por vez</td>
<td>103 tecnicas em 21 provedores, executadas em paralelo</td>
</tr>
<tr>
<td><b>Analise TLS</b></td>
<td>Saida do testssl.sh, parse manual do JARM separadamente</td>
<td>Agente combina certificado + JARM + JA4X + suites de cifra + SNI + logs CT em uma chamada</td>
</tr>
<tr>
<td><b>Correlacao</b></td>
<td>Copiar e colar resultados em uma planilha</td>
<td>Agente correlaciona cruzando: "JARM corresponde a framework C2 conhecido, timing HTTP confirma honeypot"</td>
</tr>
<tr>
<td><b>Bypass de WAF</b></td>
<td>wafw00f detecta WAF, voce busca manualmente a origem</td>
<td>Agente detecta WAF, descobre IP de origem e verifica que serve o mesmo conteudo</td>
</tr>
<tr>
<td><b>Chaves API</b></td>
<td>Necessarias para Shodan, Censys, etc.</td>
<td>80+ tecnicas ativas funcionam sem nenhuma chave API; chaves desbloqueiam enriquecimento OSINT</td>
</tr>
<tr>
<td><b>Configuracao</b></td>
<td>Instalar nmap, testssl, wafw00f, ssh-audit, jarm, wappalyzer...</td>
<td><code>npx fingerprint-mcp</code> &mdash; um comando, zero configuracao</td>
</tr>
</tbody>
</table>

---

## Inicio Rapido

### Opcao 1: npx (sem instalacao)

```bash
npx fingerprint-mcp
```

Todas as 80+ tecnicas ativas de fingerprinting funcionam imediatamente. Nenhuma chave API necessaria para fingerprinting de TCP, TLS, SSH, HTTP, DNS, WAF, caminhos, servicos, timing, IoT, SMTP, infraestrutura e aplicacoes.

### Opcao 2: Clonar

```bash
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp
bun install
```

### Variaveis de ambiente (opcional)

```bash
# Enriquecimento OSINT (todas opcionais — fingerprinting ativo funciona sem nenhuma chave)
export SHODAN_API_KEY=your-key           # Habilita osint_shodan, ssh_hostkey_lookup
export CENSYS_API_ID=your-id             # Habilita osint_censys (gratis: 250 consultas/mes)
export CENSYS_API_SECRET=your-secret     # Segredo da API Censys
export SECURITYTRAILS_API_KEY=your-key   # Habilita waf_origin, enum_passive_dns
export VIRUSTOTAL_API_KEY=your-key       # Habilita osint_virustotal (gratis: 500 consultas/dia)
```

Todas as chaves API sao opcionais. Sem elas, voce ainda obtem fingerprinting completo de TCP/TLS/SSH/HTTP/DNS/WAF/caminhos/servicos/timing/IoT/SMTP/infraestrutura/aplicacoes, correlacao, analise passiva, enumeracao e ferramentas meta &mdash; 80+ tecnicas que funcionam sondando o alvo diretamente.

### Conectar ao seu agente de IA

<details open>
<summary><b>Claude Code</b></summary>

```bash
# Com npx
claude mcp add fingerprint-mcp -- npx fingerprint-mcp

# Com clone local
claude mcp add fingerprint-mcp -- bun run /path/to/fingerprint-mcp/src/index.ts
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Adicione em `~/Library/Application Support/Claude/claude_desktop_config.json`:

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
<summary><b>Cursor / Windsurf / outros clientes MCP</b></summary>

Mesmo formato de configuracao JSON. Aponte o comando para `npx fingerprint-mcp` ou o caminho da sua instalacao local.

</details>

### Comece a consultar

```
Voce: "Faca o fingerprinting completo de target.com — TLS, stack HTTP, WAF, DNS, portas abertas"
```

E so isso. O agente lida com fingerprinting multicamada, correlacao de sinais e analise de infraestrutura automaticamente.

---

## O que a IA Pode Fazer

### Reconhecimento Rapido

```
Voce: "Reconhecimento rapido em target.com"

Agente: -> recon {url: "https://target.com", depth: "quick"}

       -> TCP: portas 80, 443, 22 abertas
       -> TLS: certificado Let's Encrypt RSA, TLS 1.2+1.3, assinatura nginx JARM
       -> HTTP: nginx/1.24.0, Express.js, React, Cloudflare CDN
       -> DNS: A 203.0.113.42, MX Google Workspace, SPF/DKIM configurado
       -> WAF: Cloudflare detectado (cabecalho cf-ray)
       -> "target.com e um React SPA em Express.js atras do nginx/1.24.0,
          servido pelo Cloudflare CDN. TLS configurado corretamente com
          Let's Encrypt. SSH na porta 22 rodando OpenSSH 9.6. E-mail
          gerenciado pelo Google Workspace com SPF/DKIM/DMARC completo."
```

### Investigacao TLS Profunda

```
Voce: "Analise a configuracao TLS de suspicious-server.com em detalhes"

Agente: -> scan_tls {host: "suspicious-server.com"}

       -> Certificado: autoassinado, CN=localhost, expirado ha 47 dias
       -> JARM: 2ad2ad0002ad2ad00042d42d00000069d641f34fe76acdc05c40262f8815e5
          (corresponde ao perfil padrao do Cobalt Strike)
       -> JA4X: fingerprint corresponde a padrao de framework C2 conhecido
       -> Suites de cifra: aceita cifras fracas (RC4, 3DES)
       -> SNI: responde de forma identica a qualquer valor SNI
       -> Logs CT: certificado nao registrado (nao confiavel publicamente)
       -> "ALTO RISCO: Configuracao TLS indica fortemente infraestrutura C2.
          Certificado autoassinado expirado, fingerprint JARM corresponde ao Cobalt Strike,
          aceita cifras fracas e responde a valores SNI arbitrarios.
          Recomenda-se investigacao imediata e bloqueio."
```

### Bypass de WAF e Descoberta de Origem

```
Voce: "target.com esta atras de um WAF. Voce consegue encontrar o servidor de origem?"

Agente: -> scan_waf {url: "https://target.com"}
       -> scan_dns {domain: "target.com"}
       -> enumerate {domain: "target.com"}

       -> WAF: Cloudflare (AS13335), pagina de desafio em requisicoes suspeitas
       -> DNS: registro A aponta para IP Cloudflare 104.21.x.x
       -> Subdominios: dev.target.com resolve para 203.0.113.42 (nao-Cloudflare)
       -> Conexao direta a 203.0.113.42:443 retorna o mesmo certificado TLS
       -> Historico SecurityTrails: origem era 203.0.113.42 antes do Cloudflare
       -> "IP de origem encontrado: 203.0.113.42. Descoberto via subdominio
          dev.target.com que contorna o Cloudflare. A origem serve o mesmo
          certificado TLS e responde ao cabecalho Host de target.com.
          A origem nao tem protecao WAF — acesso direto possivel."
```

### Descoberta de Servicos em um Host

```
Voce: "Quais servicos estao rodando em 10.0.1.50?"

Agente: -> scan_ports {host: "10.0.1.50"}
       -> scan_services {host: "10.0.1.50", ports: [22, 80, 3306, 5432, 6379, 8080]}

       -> Porta 22: OpenSSH 8.9p1 Ubuntu, chave de host ED25519
       -> Porta 80: Apache/2.4.57, PHP/8.2, WordPress 6.4
       -> Porta 3306: MySQL 8.0.36, autenticacao necessaria
       -> Porta 5432: PostgreSQL 16.1, SSL necessario
       -> Porta 6379: Redis 7.2.4, SEM autenticacao (aberto)
       -> Porta 8080: servidor de desenvolvimento Node.js Express, CORS: *
       -> "CRITICO: Redis na porta 6379 nao tem autenticacao — qualquer pessoa na
          rede pode ler/escrever dados. O servidor de desenvolvimento Express na 8080
          tem CORS wildcard. MySQL e PostgreSQL exigem autenticacao corretamente.
          WordPress esta 2 versoes menores atrasado. Acao imediata necessaria
          para o Redis e a exposicao do servidor de desenvolvimento."
```

---

## Referencia de Ferramentas (13 ferramentas, 103 tecnicas)

<details open>
<summary><b>recon &mdash; Reconhecimento completo com selecao de tecnicas baseada em profundidade</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `url` | string | URL alvo para fingerprinting |
| `depth` | `quick` \| `standard` \| `deep` | Profundidade da varredura: quick=5 tecnicas, standard=20, deep=50+ |

Orquestra tecnicas de todos os provedores com base no nivel de profundidade. O modo rapido fornece uma visao geral rapida; o modo profundo executa fingerprinting exaustivo incluindo enumeracao, OSINT e correlacao.

</details>

<details>
<summary><b>scan_ports &mdash; Varredura de portas TCP com deteccao de servicos (3 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `host` | string | Host alvo (IP ou dominio) |
| `ports` | number[] | Opcional &mdash; portas especificas para varredura (padrao: portas comuns) |

| Tecnica | Descricao |
|---------|-----------|
| `tcp_probe` | Varredura TCP connect para detectar portas abertas |
| `tcp_banner` | Captura de banner em portas abertas para identificacao de servicos |
| `tcp_analysis` | Analise de combinacao de portas e inferencia de servicos |

</details>

<details>
<summary><b>scan_tls &mdash; Analise completa de TLS/SSL (8 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `host` | string | Host alvo (IP ou dominio) |
| `port` | number | Opcional &mdash; porta TLS (padrao: 443) |

| Tecnica | Descricao |
|---------|-----------|
| `tls_certificate` | Parsing de certificado X.509 &mdash; sujeito, emissor, SANs, validade, cadeia |
| `tls_jarm` | Fingerprinting ativo JARM &mdash; 10 sondas TLS Client Hello, hash de 62 caracteres |
| `tls_ja4x` | Fingerprinting passivo JA4X de TLS a partir de propriedades do certificado |
| `tls_ciphers` | Enumeracao de suites de cifra e analise de forca |
| `tls_protocols` | Deteccao de versoes de protocolo TLS suportadas (SSLv3 ate TLS 1.3) |
| `tls_sni` | Teste de comportamento SNI &mdash; certificado padrao vs. hostname solicitado |
| `tls_ct_logs` | Consulta de logs de Certificate Transparency via crt.sh |
| `tls_ocsp` | Verificacao de grampeamento OCSP e status de revogacao |

</details>

<details>
<summary><b>scan_dns &mdash; Inteligencia DNS (7 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `domain` | string | Dominio alvo |

| Tecnica | Descricao |
|---------|-----------|
| `dns_records` | Enumeracao completa de registros &mdash; A, AAAA, MX, NS, TXT, CNAME, SOA |
| `dns_email_auth` | Analise de registros SPF, DKIM e DMARC |
| `dns_saas` | Deteccao de SaaS/servicos via padroes CNAME e MX (Slack, Zendesk, etc.) |
| `dns_server` | Fingerprinting de servidor DNS (BIND, PowerDNS, Cloudflare, etc.) |
| `dns_takeover` | Deteccao de subdomain takeover via analise de CNAME pendente |
| `dns_zone` | Tentativa de transferencia de zona (AXFR) |
| `dns_caa` | Analise de registro CAA para restricoes de autoridade certificadora |

</details>

<details>
<summary><b>scan_http &mdash; Fingerprinting HTTP/web (29 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `url` | string | URL alvo |

| Tecnica | Provedor | Descricao |
|---------|----------|-----------|
| `http_headers` | HTTP | Analise de cabecalhos de resposta e identificacao de servidor |
| `http_header_order` | HTTP | Fingerprint de ordem de cabecalhos (assinatura de software do servidor) |
| `http_security_headers` | HTTP | Auditoria de cabecalhos de seguranca (CSP, HSTS, X-Frame-Options, etc.) |
| `http_cookies` | HTTP | Analise de cookies &mdash; flags, prefixos, deteccao de framework |
| `http_methods` | HTTP | Enumeracao de metodos HTTP permitidos (OPTIONS) |
| `http_cors` | HTTP | Analise de politica CORS e deteccao de configuracao incorreta |
| `http_compression` | HTTP | Algoritmos de compressao suportados (gzip, br, zstd) |
| `http_caching` | HTTP | Analise de cabecalhos de cache (deteccao de CDN, proxy reverso) |
| `http_etag` | HTTP | Analise de formato ETag para identificacao de backend |
| `http_error` | HTTP | Fingerprinting de paginas de erro (paginas de erro personalizadas vs. padrao) |
| `http_redirect` | HTTP | Analise de cadeia de redirecionamento |
| `http_timing` | HTTP | Linha base de tempo de resposta para perfilamento de desempenho do servidor |
| `http_favicon` | HTTP | Hash de favicon (MurmurHash3) para identificacao de tecnologia |
| `http_robots` | HTTP | Parsing de robots.txt e extracao de caminhos proibidos |
| `http_sitemap` | HTTP | Descoberta de sitemap e extracao de URLs |
| `http_wellknown` | HTTP | Descoberta de endpoints .well-known (security.txt, openid, etc.) |
| `web_tech` | Web | Deteccao de tecnologias via padroes HTML/JS/CSS |
| `web_analytics` | Web | Deteccao de servicos de analytics e rastreamento |
| `web_sourcemaps` | Web | Descoberta de arquivos source map |
| `web_websocket` | Web | Deteccao de endpoints WebSocket |
| `web_graphql` | Web | Deteccao de endpoint GraphQL e introspecao |
| `web_spa` | Web | Deteccao de framework de aplicacao single-page |
| `web_cdn` | Web | Deteccao de CDN via cabecalhos de resposta e DNS |
| `web_meta` | Web | Analise de tags meta HTML (gerador, dicas de framework) |
| `web_feed` | Web | Descoberta de feeds RSS/Atom |
| `h2_detect` | HTTP/2 | Deteccao de suporte ao protocolo HTTP/2 |
| `h2_fingerprint` | HTTP/2 | Fingerprinting de servidor HTTP/2 (SETTINGS, WINDOW_UPDATE) |
| `h2_h3` | HTTP/2 | Deteccao de suporte HTTP/3 (QUIC) via cabecalho Alt-Svc |
| `app_cms` | Application | Deteccao de CMS (WordPress, Drupal, Joomla, etc.) |

</details>

<details>
<summary><b>scan_paths &mdash; Inteligencia de caminhos (5 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `url` | string | URL alvo |
| `categories` | string[] | Opcional &mdash; categorias a verificar (sensitive, git, debug, api, config) |

| Tecnica | Descricao |
|---------|-----------|
| `path_sensitive` | Descoberta de arquivos sensiveis (arquivos de backup, arquivos de configuracao, dumps de banco de dados) |
| `path_robots` | Analise de robots.txt e sitemap.xml para caminhos ocultos |
| `path_git` | Deteccao de vazamento de repositorio Git (.git/HEAD, .git/config) |
| `path_debug` | Descoberta de endpoints de debug (phpinfo, server-status, consoles de debug) |
| `path_api` | Descoberta de versoes de API e endpoints de documentacao |

</details>

<details>
<summary><b>scan_waf &mdash; Deteccao e fingerprinting de WAF/CDN (4 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `url` | string | URL alvo |

| Tecnica | Descricao |
|---------|-----------|
| `waf_detect` | Deteccao de presenca de WAF via analise de cabecalho de resposta e comportamento |
| `waf_cdn` | Identificacao de provedor CDN (Cloudflare, Akamai, Fastly, etc.) |
| `waf_fingerprint` | Identificacao de produto WAF e deteccao de versao |
| `waf_origin` | Descoberta de IP de origem atras de WAF/CDN (requer `SECURITYTRAILS_API_KEY`) |

</details>

<details>
<summary><b>scan_services &mdash; Sondagem em nivel de servico (12 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `host` | string | Host alvo (IP ou dominio) |
| `ports` | number[] | Opcional &mdash; portas especificas para sondar |
| `service` | string | Opcional &mdash; servico especifico para sondar (mysql, postgres, redis, ftp, ssh, smtp, vnc, iot) |

| Tecnica | Provedor | Descricao |
|---------|----------|-----------|
| `ssh_probe` | SSH | Deteccao de versao do protocolo SSH e software |
| `ssh_algorithms` | SSH | Auditoria de algoritmos SSH (KEX, cifras, MACs, tipos de chave de host) |
| `ssh_hostkey_lookup` | SSH | Consulta de chave de host SSH via Shodan (requer `SHODAN_API_KEY`) |
| `svc_mysql` | Service | Deteccao de versao MySQL e fingerprinting de capacidades |
| `svc_postgres` | Service | Deteccao de versao PostgreSQL e verificacao de suporte SSL |
| `svc_redis` | Service | Deteccao de versao Redis e status de autenticacao |
| `svc_ftp` | Service | Analise de banner FTP e verificacao de login anonimo |
| `svc_vnc_rdp` | Service | Deteccao de servico VNC/RDP e avaliacao de seguranca |
| `smtp_banner` | SMTP | Analise de banner SMTP e identificacao de MTA |
| `smtp_starttls` | SMTP | Suporte SMTP STARTTLS e inspecao de certificado |
| `iot_detect` | IoT | Deteccao de dispositivos IoT via padroes de banner e paginas padrao |
| `iot_upnp` | IoT | Descoberta de dispositivos UPnP/SSDP na rede local |

</details>

<details>
<summary><b>enumerate &mdash; Expansao de escopo (8 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `domain` | string | Dominio alvo |

| Tecnica | Descricao |
|---------|-----------|
| `enum_subdomains` | Enumeracao de subdominios via multiplos metodos |
| `enum_wildcard` | Deteccao de wildcard DNS |
| `enum_tld` | Expansao de TLD (target.com -> target.net, target.org, etc.) |
| `enum_related` | Descoberta de dominios relacionados via infraestrutura compartilhada |
| `enum_asn` | Descoberta de vizinhos ASN &mdash; outros dominios na mesma rede |
| `enum_ct` | Extracao de subdominios de logs de Certificate Transparency |
| `enum_passive_dns` | Historico de DNS passivo (requer `SECURITYTRAILS_API_KEY`) |
| `enum_scope` | Resumo de escopo e visao geral da superficie de ataque |

</details>

<details>
<summary><b>osint &mdash; Enriquecimento OSINT (6 tecnicas)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `target` | string | Endereco IP ou dominio para enriquecer |
| `type` | `ip` \| `domain` | Opcional &mdash; tipo de alvo (auto-detectado se omitido) |

| Tecnica | Autenticacao | Descricao |
|---------|--------------|-----------|
| `osint_shodan` | `SHODAN_API_KEY` | Consulta de host Shodan &mdash; portas abertas, banners, vulnerabilidades, SO |
| `osint_censys` | `CENSYS_API_ID` + `CENSYS_API_SECRET` | Dados de host Censys &mdash; servicos, TLS, sistema autonomo |
| `osint_reverse_ip` | Nenhuma | Consulta reversa de IP &mdash; outros dominios no mesmo IP |
| `osint_whois` | Nenhuma | Dados de registro WHOIS &mdash; registrador, datas, nameservers |
| `osint_webarchive` | Nenhuma | Historico do Web Archive &mdash; primeiro/ultimo snapshot, frequencia de alteracao |
| `osint_virustotal` | `VIRUSTOTAL_API_KEY` | Relatorio VirusTotal de dominio/IP &mdash; deteccoes, categorias, DNS |

</details>

<details>
<summary><b>analyze &mdash; Analise passiva de fingerprint (3 modos)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `type` | `headers` \| `html` \| `banner` | Tipo de dado a analisar |
| `data` | string | Dados brutos para analisar (cole cabecalhos, HTML ou saida de banner) |

| Modo | Descricao |
|------|-----------|
| `fp_analyze_headers` | Analise passiva de cabecalhos HTTP &mdash; deteccao de servidor, framework, proxy sem enviar trafego |
| `fp_analyze_html` | Analise passiva de HTML &mdash; deteccao de tecnologia, identificacao de framework a partir do codigo-fonte |
| `fp_analyze_banner` | Analise passiva de banner &mdash; identificacao de servico a partir de texto bruto de banner |

</details>

<details>
<summary><b>correlate &mdash; Motor de correlacao multi-sinal (7 modos)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `type` | `consistency` \| `honeypot` \| `spoofing` \| `compare` \| `topology` \| `c2` \| `identify` | Modo de correlacao |
| `signals` | object | Sinais de fingerprint para correlacionar (varia por modo) |

| Modo | Descricao |
|------|-----------|
| `fp_consistency` | Verificacao de consistencia de sinais entre camadas &mdash; TCP, TLS, HTTP e DNS concordam? |
| `fp_honeypot` | Deteccao de honeypot &mdash; verifica combinacoes impossiveis de servicos e anomalias comportamentais |
| `fp_spoofing` | Deteccao de spoofing &mdash; identifica discrepancias entre cabecalhos do servidor e comportamento real |
| `fp_compare` | Comparacao lado a lado dos perfis de fingerprint de dois hosts |
| `fp_topology` | Mapeamento de topologia de infraestrutura &mdash; CDN, balanceador de carga, cadeia de proxy reverso |
| `fp_c2` | Deteccao de framework C2 via correlacao de JARM, TLS, HTTP e timing |
| `fp_identify` | Identificacao baseada em hash contra banco de dados de assinaturas conhecidas |

</details>

<details>
<summary><b>meta &mdash; Configuracao e dados do servidor (3 modos)</b></summary>

| Parametro | Tipo | Descricao |
|-----------|------|-----------|
| `category` | string | Opcional &mdash; filtrar por categoria |

| Modo | Descricao |
|------|-----------|
| `fp_sources` | Listar todas as fontes de dados disponiveis com configuracao e status de chaves API |
| `fp_config` | Configuracao do servidor &mdash; versao, provedores carregados, contagem de tecnicas |
| `fp_signatures` | Listagem do banco de dados de assinaturas &mdash; JARM, banner, WAF, assinaturas de aplicacoes |

</details>

---

### Uso via CLI

```bash
# Listar todas as ferramentas e tecnicas disponiveis
npx fingerprint-mcp --list

# Executar qualquer ferramenta diretamente
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

# Ferramentas OSINT (requerem chaves API)
SHODAN_API_KEY=your-key npx fingerprint-mcp --tool osint '{"target":"203.0.113.42","type":"ip"}'
```

---

## Fontes de Dados (21)

| Fonte | Autenticacao | O que fornece |
|-------|--------------|---------------|
| Sondagem TCP | Nenhuma | Varredura de portas, captura de banner, deteccao de servicos |
| Analise TLS/SSL | Nenhuma | Parsing de certificados, fingerprinting JARM, JA4X, enumeracao de cifras, teste SNI |
| Sondagem SSH | Nenhuma | Versao do protocolo, auditoria de algoritmos, deteccao de software |
| Analise HTTP | Nenhuma | Fingerprinting de cabecalhos, hash de favicon, analise de cookies, enumeracao de metodos, CORS |
| Deteccao web | Nenhuma | Deteccao de tecnologias, analytics, source maps, WebSocket, GraphQL, frameworks SPA |
| Descoberta de caminhos | Nenhuma | Arquivos sensiveis, vazamentos git, endpoints de debug, versoes de API, robots.txt |
| Resolucao DNS | Nenhuma | Enumeracao de registros, analise de autenticacao de e-mail, deteccao de SaaS, fingerprinting de servidor |
| Deteccao WAF/CDN | Nenhuma | Identificacao de WAF, deteccao de CDN, fingerprinting de WAF |
| Analise de timing | Nenhuma | Linha base de tempo de resposta, deteccao de desvio de relogio |
| HTTP/2 e HTTP/3 | Nenhuma | Deteccao e fingerprinting HTTP/2, descoberta HTTP/3 Alt-Svc |
| Sondagem SMTP | Nenhuma | Analise de banner SMTP, inspecao STARTTLS |
| IoT/Embarcados | Nenhuma | Deteccao de dispositivos IoT, descoberta UPnP/SSDP |
| Deteccao de aplicacoes | Nenhuma | Identificacao de CMS, framework e plataforma de e-commerce |
| Sondagem de servicos | Nenhuma | Fingerprinting MySQL, PostgreSQL, Redis, FTP, VNC/RDP |
| Deteccao de infraestrutura | Nenhuma | Identificacao de provedor de nuvem, hospedagem, CDN |
| Motor de correlacao | Nenhuma | Consistencia de sinais, deteccao de honeypot, deteccao de spoofing, mapeamento de topologia |
| Motor de identificacao | Nenhuma | Identificacao baseada em hash, deteccao de C2, correspondencia de assinaturas |
| [Shodan](https://www.shodan.io) | `SHODAN_API_KEY` | Inteligencia de host &mdash; portas abertas, banners, vulnerabilidades, deteccao de SO |
| [Censys](https://censys.io) | `CENSYS_API_ID` | Dados de host &mdash; servicos, certificados TLS, informacao de sistema autonomo |
| [SecurityTrails](https://securitytrails.com) | `SECURITYTRAILS_API_KEY` | Descoberta de origem WAF, historico DNS passivo, registros historicos |
| [VirusTotal](https://www.virustotal.com) | `VIRUSTOTAL_API_KEY` | Reputacao de dominio/IP, resultados de deteccao, historico DNS, categorias |

---

## Arquitetura

```
src/
  index.ts                # Ponto de entrada CLI (--help, --list, --tool, servidor stdio)
  protocol/
    mcp-server.ts         # Configuracao do servidor MCP (transporte stdio)
    tools.ts              # Registro de ferramentas — todas as 13 ferramentas compostas registradas aqui
  types/
    index.ts              # Tipos compartilhados (ToolDef, ToolContext, ToolResult)
  utils/
    rate-limiter.ts       # Limitador de taxa por provedor
    cache.ts              # Cache TTL para respostas de API
    require-key.ts        # Auxiliar de validacao de chave API
    murmurhash3.ts        # MurmurHash3 para hash de favicon
  composite/              # 13 orquestradores de ferramentas compostas
    recon.ts              # Orquestrador de reconhecimento completo (quick/standard/deep)
    scan-ports.ts         # Composto de varredura de portas
    scan-tls.ts           # Composto de analise TLS
    scan-dns.ts           # Composto de inteligencia DNS
    scan-http.ts          # Composto de fingerprinting HTTP
    scan-paths.ts         # Composto de descoberta de caminhos
    scan-waf.ts           # Composto de deteccao WAF/CDN
    scan-services.ts      # Composto de sondagem de servicos
    analyze.ts            # Composto de analise passiva
    correlate.ts          # Composto do motor de correlacao
    enumerate.ts          # Composto de expansao de escopo
    osint.ts              # Composto de enriquecimento OSINT
    meta.ts               # Composto meta do servidor
    helpers.ts            # Auxiliares compostos compartilhados
  tcp/                    # Tecnicas de sondagem TCP (3)
  tls/                    # Tecnicas de analise TLS/SSL (8)
  ssh/                    # Tecnicas de sondagem SSH (3)
  http/                   # Tecnicas de fingerprinting HTTP (16)
  web/                    # Tecnicas de deteccao de tecnologias web (9)
  path/                   # Tecnicas de descoberta de caminhos (5)
  dns/                    # Tecnicas de inteligencia DNS (7)
  waf/                    # Tecnicas de deteccao WAF/CDN (4)
  timing/                 # Tecnicas de analise de timing (2)
  h2/                     # Tecnicas HTTP/2 e HTTP/3 (3)
  smtp/                   # Tecnicas de sondagem SMTP (2)
  iot/                    # Tecnicas de deteccao IoT/embarcados (2)
  app/                    # Tecnicas de deteccao de aplicacoes (3)
  service/                # Tecnicas de sondagem de servicos (5)
  infra/                  # Tecnicas de deteccao de infraestrutura (3)
  correlation/            # Motor de correlacao (5)
  identify/               # Motor de identificacao (3)
  passive/                # Analise passiva (3)
  osint/                  # Tecnicas de enriquecimento OSINT (6)
  enum/                   # Tecnicas de enumeracao (8)
  meta/                   # Ferramentas meta (3)
  data/                   # Bancos de dados de assinaturas e bibliotecas de padroes
    jarm-signatures.ts    # Fingerprints JARM conhecidos (C2, servidores, CDNs)
    waf-signatures.ts     # Assinaturas de deteccao de WAF
    service-banners.ts    # Padroes de banner de servicos
    tech-patterns.ts      # Padroes de deteccao de tecnologias
    favicon-hashes.ts     # Valores MurmurHash3 de favicon conhecidos
    c2-signatures.ts      # Assinaturas de framework C2
    ...                   # 15+ bancos de dados de assinaturas/padroes
```

**Decisoes de design:**

- **13 ferramentas compostas, 103 tecnicas** &mdash; O agente chama ferramentas de alto nivel (`recon`, `scan_tls`, `scan_http`). Cada composto orquestra multiplas tecnicas de baixo nivel e retorna resultados correlacionados. Isso reduz o overhead de chamadas de ferramentas enquanto mantem a granularidade.
- **21 provedores, 1 servidor** &mdash; Cada camada de fingerprinting e um modulo independente. O orquestrador composto seleciona tecnicas com base no contexto e profundidade.
- **Ativo primeiro, OSINT opcional** &mdash; 80+ tecnicas funcionam sondando o alvo diretamente com zero chaves API. Provedores OSINT (Shodan, Censys, VirusTotal, SecurityTrails) adicionam enriquecimento, mas nunca sao obrigatorios.
- **Limitadores de taxa por provedor** &mdash; Cada provedor tem sua propria instancia de `RateLimiter`. A sondagem ativa e limitada em taxa para evitar deteccao; APIs OSINT sao calibradas para suas cotas.
- **Cache TTL** &mdash; Registros DNS (10min), resultados OSINT (15min), logs CT (30min) sao armazenados em cache para evitar consultas redundantes durante fluxos de trabalho com multiplas ferramentas.
- **Degradacao elegante** &mdash; Chaves API ausentes nao travam o servidor. Ferramentas OSINT retornam mensagens descritivas: "Defina SHODAN_API_KEY para habilitar consulta de host Shodan."
- **3 dependencias** &mdash; `@modelcontextprotocol/sdk`, `zod` e `cheerio`. Todo I/O de rede via `fetch()` nativo e modulos Node.js `net`/`tls`/`dns`. Sem nmap, sem binarios externos.

---

## Limitacoes

- Ferramentas OSINT (Shodan, Censys, VirusTotal, SecurityTrails) requerem chaves API para suas respectivas tecnicas
- Nivel gratuito do Censys limitado a 250 consultas/mes
- Nivel gratuito do VirusTotal limitado a 500 consultas/dia
- Varredura de portas usa TCP connect (nao varredura SYN) &mdash; menos furtivo que nmap, mas nao requer privilegios root
- Fingerprinting JARM requer acesso TCP direto ao alvo (pode ser bloqueado por firewalls)
- Descoberta UPnP/SSDP funciona apenas em redes locais
- Sondagem de servicos (MySQL, PostgreSQL, Redis) conecta, mas nao autentica
- Enumeracao de subdominios depende de logs CT e fontes passivas (sem forca bruta)
- Testado em macOS / Linux (Windows nao testado)

---

## Parte da Suite de Seguranca MCP

| Projeto | Dominio | Ferramentas |
|---------|---------|-------------|
| [hackbrowser-mcp](https://github.com/badchars/hackbrowser-mcp) | Testes de seguranca baseados em navegador | 39 ferramentas, Firefox, testes de injecao |
| [cloud-audit-mcp](https://github.com/badchars/cloud-audit-mcp) | Seguranca em nuvem (AWS/Azure/GCP) | 38 ferramentas, 60+ verificacoes |
| [github-security-mcp](https://github.com/badchars/github-security-mcp) | Postura de seguranca GitHub | 39 ferramentas, 45 verificacoes |
| [cve-mcp](https://github.com/badchars/cve-mcp) | Inteligencia de vulnerabilidades | 23 ferramentas, 5 fontes |
| [osint-mcp-server](https://github.com/badchars/osint-mcp-server) | OSINT e reconhecimento | 37 ferramentas, 12 fontes |
| [darknet-mcp-server](https://github.com/badchars/darknet-mcp-server) | Dark web e inteligencia de ameacas | 66 ferramentas, 16 fontes |
| **fingerprint-mcp** | **Fingerprinting digital universal** | **13 ferramentas, 103 tecnicas, 21 provedores** |

---

<p align="center">
<b>Apenas para testes e avaliacoes de seguranca autorizados.</b><br>
Sempre certifique-se de ter a devida autorizacao antes de realizar fingerprinting em qualquer alvo.
</p>

<p align="center">
  <a href="LICENSE">Licenca AGPL-3.0</a> &bull; Construido com Bun + TypeScript
</p>
