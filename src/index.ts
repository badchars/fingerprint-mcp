#!/usr/bin/env node

import type { ToolContext, ToolDef } from "./types/index.js";
import { startMcpStdio } from "./protocol/mcp-server.js";
import { allTools } from "./protocol/tools.js";
import { ALL_INDIVIDUAL } from "./composite/helpers.js";

// ─── Build ToolContext from Environment ───

function buildToolContext(): ToolContext {
  return {
    config: {
      shodanApiKey: process.env.SHODAN_API_KEY,
      censysApiId: process.env.CENSYS_API_ID,
      censysApiSecret: process.env.CENSYS_API_SECRET,
      securitytrailsApiKey: process.env.SECURITYTRAILS_API_KEY,
      virustotalApiKey: process.env.VIRUSTOTAL_API_KEY,
    },
  };
}

// ─── Individual Tool Categories for --list-all display ───

const TOOL_CATEGORIES: { category: string; prefix: string }[] = [
  { category: "TCP Fingerprint", prefix: "tcp_" },
  { category: "TLS/SSL Analysis", prefix: "tls_" },
  { category: "SSH Fingerprint", prefix: "ssh_" },
  { category: "HTTP Fingerprint", prefix: "http_" },
  { category: "Web Technology", prefix: "web_" },
  { category: "Path Intelligence", prefix: "path_" },
  { category: "DNS Intelligence", prefix: "dns_" },
  { category: "WAF/CDN Detection", prefix: "waf_" },
  { category: "Timing Analysis", prefix: "timing_" },
  { category: "Correlation Engine", prefix: "fp_correlate" },
  { category: "Correlation Engine", prefix: "fp_honeypot" },
  { category: "Correlation Engine", prefix: "fp_spoofing" },
  { category: "Correlation Engine", prefix: "fp_compare" },
  { category: "Correlation Engine", prefix: "fp_topology" },
  { category: "Fingerprint Lookup", prefix: "fp_identify" },
  { category: "Fingerprint Lookup", prefix: "fp_c2_detect" },
  { category: "Fingerprint Lookup", prefix: "fp_list_sig" },
  { category: "Passive Analysis", prefix: "fp_analyze" },
  { category: "IoT/Embedded", prefix: "iot_" },
  { category: "HTTP/2 & HTTP/3", prefix: "h2_" },
  { category: "Application Detection", prefix: "app_" },
  { category: "SMTP Fingerprint", prefix: "smtp_" },
  { category: "Infrastructure", prefix: "infra_" },
  { category: "Service Fingerprint", prefix: "svc_" },
  { category: "OSINT Enrichment", prefix: "osint_" },
  { category: "Scope Expansion", prefix: "enum_" },
  { category: "Meta", prefix: "fp_list_sources" },
  { category: "Meta", prefix: "fp_server_config" },
];

function categorize(toolName: string): string {
  for (const { category, prefix } of TOOL_CATEGORIES) {
    if (toolName.startsWith(prefix)) return category;
  }
  return "Other";
}

// ─── CLI: --help ───

function printHelp(): void {
  console.log(`fingerprint-mcp — Universal Digital Fingerprinting MCP Server

USAGE:
  fingerprint-mcp                  Start MCP server on stdio (${allTools.length} composite tools)
  fingerprint-mcp --help           Show this help message
  fingerprint-mcp --list           List ${allTools.length} composite tools
  fingerprint-mcp --list-all       List all ${ALL_INDIVIDUAL.length} individual techniques
  fingerprint-mcp --tool <name> '<json>'  Run a tool (composite or individual)

ENVIRONMENT VARIABLES (all optional):
  SHODAN_API_KEY                 Shodan API key (osint_shodan, ssh_hostkey_lookup)
  CENSYS_API_ID                  Censys API ID (osint_censys, free: 250/mo)
  CENSYS_API_SECRET              Censys API secret
  SECURITYTRAILS_API_KEY         SecurityTrails key (waf_origin, enum_passive_dns)
  VIRUSTOTAL_API_KEY             VirusTotal key (osint_virustotal, free: 500/day)

NOTE: All active fingerprinting techniques (80+) work without any API keys.
      OSINT/enumeration tools need keys for their respective APIs.
`);
}

// ─── CLI: --list (composite tools) ───

function printToolList(): void {
  console.log(`\nfingerprint-mcp — ${allTools.length} composite tools (${ALL_INDIVIDUAL.length} techniques)\n`);

  for (const tool of allTools) {
    const schemaKeys = Object.keys(tool.schema);
    const params = schemaKeys.length > 0 ? `(${schemaKeys.join(", ")})` : "()";
    console.log(`  ${tool.name}${params}`);
    console.log(`    ${tool.description.split(".")[0]}.`);
    console.log();
  }
}

// ─── CLI: --list-all (individual tools) ───

function printAllTools(): void {
  const grouped = new Map<string, ToolDef[]>();

  for (const tool of ALL_INDIVIDUAL) {
    const cat = categorize(tool.name);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(tool);
  }

  console.log(`\nfingerprint-mcp — ${ALL_INDIVIDUAL.length} individual techniques\n`);

  for (const [category, tools] of grouped) {
    console.log(`━━━ ${category} (${tools.length}) ━━━`);
    for (const tool of tools) {
      const schemaKeys = Object.keys(tool.schema);
      const params = schemaKeys.length > 0 ? `(${schemaKeys.join(", ")})` : "()";
      console.log(`  ${tool.name}${params}`);
      console.log(`    ${tool.description.split(".")[0]}.`);
    }
    console.log();
  }
}

// ─── CLI: --tool (supports both composite and individual) ───

async function runSingleTool(name: string, argsJson: string): Promise<void> {
  const tool =
    allTools.find((t) => t.name === name) ??
    ALL_INDIVIDUAL.find((t) => t.name === name);

  if (!tool) {
    console.error(`Unknown tool: ${name}`);
    console.error(`Run --list for composite tools or --list-all for individual techniques.`);
    process.exit(1);
  }

  const args = JSON.parse(argsJson);
  const ctx = buildToolContext();

  try {
    const result = await tool.execute(args, ctx);
    for (const item of result.content) {
      console.log(item.text);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

// ─── Main ───

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--list-all")) {
    printAllTools();
    return;
  }

  if (args.includes("--list") || args.includes("-l")) {
    printToolList();
    return;
  }

  const toolIdx = args.indexOf("--tool");
  if (toolIdx !== -1) {
    const toolName = args[toolIdx + 1];
    const toolArgs = args[toolIdx + 2] ?? "{}";
    if (!toolName) {
      console.error("Usage: fingerprint-mcp --tool <name> '<json>'");
      process.exit(1);
    }
    await runSingleTool(toolName, toolArgs);
    return;
  }

  // Default: start MCP server on stdio
  const ctx = buildToolContext();
  await startMcpStdio(ctx);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
