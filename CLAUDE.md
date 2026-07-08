# fingerprint-mcp — Universal Digital Fingerprinting MCP Server

## Overview
100-tool MCP server for digital fingerprinting: TCP/TLS/SSH/HTTP/DNS/WAF/IoT/SMTP/SMB probing, infrastructure topology mapping, C2 detection, OSINT enrichment, scope expansion.

## Architecture
- **Runtime:** Bun 1.3.9+ (dev), Node.js (publish)
- **Dependencies:** @modelcontextprotocol/sdk, zod, cheerio
- **Transport:** stdio only
- **Pattern:** Each provider in own directory under src/, tools registered in src/protocol/tools.ts

## Key Rules
- TypeScript strict mode, English code/comments
- Native `fetch()` for HTTP APIs; `node:tls`, `node:net`, `node:dns/promises`, `node:http2` for protocol probing
- Every tool schema field must have `.describe()`
- API keys always optional — graceful error when missing
- Rate limiter + TTL cache per provider
- Import paths use `.js` extension (ESM)

## Providers (21)
tcp, tls, ssh, http, web, path, dns, waf, timing, correlation, identify, passive, iot, h2, app, smtp, infra, service, osint, enum, meta

## Commands
```bash
bun install          # Install deps
bun run dev          # Dev mode (watch)
bun run build        # Build for npm
bun run src/index.ts --help   # CLI help
bun run src/index.ts --list   # List all tools
bun run src/index.ts --tool <name> '<json>'  # Run single tool
```
