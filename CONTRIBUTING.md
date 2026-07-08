# Contributing to fingerprint-mcp

Thank you for your interest in contributing to fingerprint-mcp! This document provides guidelines and instructions to help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/badchars/fingerprint-mcp.git
cd fingerprint-mcp

# Install dependencies (Bun 1.3.9+ required)
bun install

# Build the project
bun run build

# Start in development mode (watch for changes)
bun run dev
```

## Project Structure

```
src/
├── index.ts                # Entry point, CLI flags, MCP server bootstrap
├── protocol/
│   ├── mcp-server.ts       # MCP server setup (stdio transport)
│   └── tools.ts            # Tool registry — 13 composite tools registered here
├── types/
│   └── index.ts            # ToolDef, ToolContext, ToolResult interfaces
├── utils/
│   ├── cache.ts            # TTL cache implementation
│   └── rate-limiter.ts     # Per-provider rate limiter
├── composite/              # 13 composite tools (MCP-registered)
│   ├── helpers.ts          # callTool(), callToolsParallel(), buildCompositeResponse()
│   ├── recon.ts            # recon — depth-based orchestration
│   ├── scan-ports.ts       # scan_ports — TCP + service detection
│   ├── scan-tls.ts         # scan_tls — 8 TLS techniques
│   ├── scan-dns.ts         # scan_dns — 7 DNS techniques
│   ├── scan-http.ts        # scan_http — 29 HTTP/web techniques
│   ├── scan-paths.ts       # scan_paths — 5 path techniques
│   ├── scan-waf.ts         # scan_waf — 4 WAF/CDN techniques
│   ├── scan-services.ts    # scan_services — 12 service techniques
│   ├── enumerate.ts        # enumerate — 8 scope expansion techniques
│   ├── osint.ts            # osint — 6 OSINT techniques
│   ├── analyze.ts          # analyze — 3 passive analysis modes
│   ├── correlate.ts        # correlate — 7 correlation modes
│   ├── meta.ts             # meta — server info + signatures
│   └── index.ts            # compositeTools array export
├── tcp/                    # TCP fingerprinting (3 techniques)
├── tls/                    # TLS/SSL analysis (8 techniques)
├── ssh/                    # SSH fingerprinting (3 techniques)
├── http/                   # HTTP fingerprinting (16 techniques)
├── web/                    # Web technology detection (9 techniques)
├── path/                   # Path intelligence (5 techniques)
├── dns/                    # DNS intelligence (7 techniques)
├── waf/                    # WAF/CDN detection (4 techniques)
├── timing/                 # Timing analysis (2 techniques)
├── h2/                     # HTTP/2 & HTTP/3 (3 techniques)
├── smtp/                   # SMTP fingerprinting (2 techniques)
├── iot/                    # IoT/embedded detection (2 techniques)
├── app/                    # Application detection (3 techniques)
├── service/                # Service probing (5 techniques)
├── correlation/            # Correlation engine (5 techniques)
├── identify/               # Fingerprint identification (3 techniques)
├── passive/                # Passive analysis (3 techniques)
├── osint/                  # OSINT enrichment (6 techniques)
├── enum/                   # Scope expansion (8 techniques)
├── infra/                  # Infrastructure detection (3 techniques)
└── meta/                   # Meta tools (3 techniques)
```

## Adding a New Tool

fingerprint-mcp uses a two-layer architecture: **techniques** (low-level fingerprinting operations) and **composite tools** (MCP-registered tools that orchestrate multiple techniques).

### Adding a New Technique

Each technique is defined using the `ToolDef` interface. Every technique has a name, description, a Zod input schema, and an async `execute` function.

#### 1. Define the technique

Create or edit a file in the appropriate provider directory:

```typescript
import { z } from "zod";
import type { ToolDef, ToolContext } from "../types/index.js";
import { json, text } from "../types/index.js";

export const myNewTechnique: ToolDef = {
  name: "my_new_technique",
  description: "Short description of what the technique does",
  schema: {
    target: z.string().describe("The target hostname or IP address"),
    timeout: z.number().optional().default(5000).describe("Timeout in milliseconds"),
  },
  execute: async (args, ctx) => {
    const { target, timeout } = args as { target: string; timeout: number };

    const resp = await fetch(`https://api.example.com/lookup?host=${encodeURIComponent(target)}`, {
      signal: AbortSignal.timeout(timeout),
    });
    if (!resp.ok) {
      return text(`API error: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    return json(data);
  },
};
```

#### 2. Export from the provider's index

Add the technique to the provider's `index.ts` exports:

```typescript
export { myNewTechnique } from "./my-new-technique.js";
```

#### 3. Wire into a composite tool

Add the technique call to the appropriate composite tool in `src/composite/`. For example, if it is an HTTP technique, add it to `src/composite/scan-http.ts`:

```typescript
results.push(await callTool("my_new_technique", { target, timeout }, tools));
```

#### 4. Test the technique

```bash
bun run src/index.ts --tool recon '{"target": "example.com", "depth": "deep"}'
```

### Adding a Composite Tool

Composite tools are the 13 MCP-registered tools that orchestrate multiple techniques.

1. Create a new file in `src/composite/` (e.g., `src/composite/scan-new.ts`).
2. Use `callTool()` and `callToolsParallel()` from `helpers.ts` to invoke techniques.
3. Use `buildCompositeResponse()` to assemble the final result.
4. Export the composite tool and add it to `src/composite/index.ts`.
5. It will be automatically registered in `src/protocol/tools.ts` via the `compositeTools` array.

## Adding a New Provider

1. Create a new directory under `src/` named after the provider (e.g., `src/newprovider/`).
2. Create an `index.ts` that exports one or more `ToolDef` objects.
3. If the provider requires an API key, add the key field to `ToolContext["config"]` in `src/types/index.ts`.
4. Handle missing API keys gracefully -- return a descriptive error message instead of throwing.
5. Add rate limiting using the shared `RateLimiter` from `src/utils/rate-limiter.ts`.
6. Add caching using the shared `TTLCache` from `src/utils/cache.ts`.
7. Wire the techniques into the appropriate composite tool(s) in `src/composite/`.
8. Update tool/technique counts in the README and CHANGELOG if applicable.

## Guidelines

- **TypeScript strict mode** -- the project uses strict compiler settings. Fix all type errors before submitting.
- **Zod schemas** -- every tool input field must use Zod for validation with a `.describe()` call explaining the field.
- **Native `fetch()`** -- use the built-in `fetch()` for all HTTP API calls. Do not add HTTP client libraries.
- **Minimal dependencies** -- avoid adding new dependencies unless strictly necessary.
- **Graceful API key handling** -- all API keys are optional. When a key is missing, return a clear error message explaining which key is needed and how to set it.
- **Conventional Commits** -- use the [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages:
  - `feat:` for new features or tools
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `chore:` for build/tooling changes
- **ESM imports** -- always use `.js` extensions in import paths (TypeScript ESM requirement).
- **No console.log in tool output** -- tool results go through the `text()` or `json()` helpers only.

## Submitting a Pull Request

1. Fork the repository and create a feature branch from `main`.
2. Make your changes following the guidelines above.
3. Ensure the project builds cleanly: `bun run build`
4. Test your changes with the CLI: `bun run src/index.ts --tool <tool_name> '<json_args>'`
5. Commit using Conventional Commits format.
6. Open a pull request against `main` with a clear description of what you changed and why.

## Reporting Issues

- Use [GitHub Issues](https://github.com/badchars/fingerprint-mcp/issues) for bug reports and feature requests.
- For security vulnerabilities, see [SECURITY.md](SECURITY.md) -- do **not** open a public issue.
- Include reproduction steps, expected behavior, and your environment details (OS, Bun/Node version).
