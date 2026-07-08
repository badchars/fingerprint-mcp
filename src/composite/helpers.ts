import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";

// ─── Direct imports from all 21 providers (avoids circular dep with protocol/tools.ts) ───

import { tcpTools } from "../tcp/index.js";
import { tlsTools } from "../tls/index.js";
import { sshTools } from "../ssh/index.js";
import { httpTools } from "../http/index.js";
import { webTools } from "../web/index.js";
import { pathTools } from "../path/index.js";
import { dnsTools } from "../dns/index.js";
import { wafTools } from "../waf/index.js";
import { timingTools } from "../timing/index.js";
import { h2Tools } from "../h2/index.js";
import { smtpTools } from "../smtp/index.js";
import { iotTools } from "../iot/index.js";
import { appTools } from "../app/index.js";
import { serviceTools } from "../service/index.js";
import { correlationTools } from "../correlation/index.js";
import { identifyTools } from "../identify/index.js";
import { passiveTools } from "../passive/index.js";
import { osintTools } from "../osint/index.js";
import { enumTools } from "../enum/index.js";
import { infraTools } from "../infra/index.js";
import { metaTools } from "../meta/index.js";

// ─── Tool Registry ───

export const ALL_INDIVIDUAL: ToolDef[] = [
  ...tcpTools,
  ...tlsTools,
  ...sshTools,
  ...httpTools,
  ...webTools,
  ...pathTools,
  ...dnsTools,
  ...wafTools,
  ...timingTools,
  ...h2Tools,
  ...smtpTools,
  ...iotTools,
  ...appTools,
  ...serviceTools,
  ...correlationTools,
  ...identifyTools,
  ...passiveTools,
  ...osintTools,
  ...enumTools,
  ...infraTools,
  ...metaTools,
];

const TOOL_REGISTRY = new Map<string, ToolDef>(
  ALL_INDIVIDUAL.map((t) => [t.name, t]),
);

// ─── Sub-Tool Result ───

export interface SubToolResult {
  tool: string;
  ok: boolean;
  data: unknown;
  error?: string;
  durationMs: number;
}

// ─── callTool ───

export async function callTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<SubToolResult> {
  const tool = TOOL_REGISTRY.get(name);
  if (!tool) {
    return { tool: name, ok: false, data: null, error: `Unknown tool: ${name}`, durationMs: 0 };
  }

  const start = performance.now();
  try {
    const result = await tool.execute(args, ctx);
    const durationMs = Math.round(performance.now() - start);
    const text = result.content?.[0]?.text;
    const data = text ? JSON.parse(text) : null;
    return { tool: name, ok: true, data, durationMs };
  } catch (err) {
    const durationMs = Math.round(performance.now() - start);
    return { tool: name, ok: false, data: null, error: (err as Error).message, durationMs };
  }
}

// ─── callToolsParallel ───

export async function callToolsParallel(
  calls: Array<{ name: string; args: Record<string, unknown> }>,
  ctx: ToolContext,
): Promise<SubToolResult[]> {
  return Promise.all(calls.map((c) => callTool(c.name, c.args, ctx)));
}

// ─── buildCompositeResponse ───

export function buildCompositeResponse(
  compositeName: string,
  results: SubToolResult[],
  extra?: Record<string, unknown>,
): ToolResult {
  const succeeded = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const totalDurationMs = results.reduce((sum, r) => sum + r.durationMs, 0);

  const response: Record<string, unknown> = {
    _composite: compositeName,
    _meta: {
      techniques: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
      totalDurationMs,
    },
    ...Object.fromEntries(
      succeeded.map((r) => [r.tool, r.data]),
    ),
  };

  if (failed.length > 0) {
    response._errors = failed.map((f) => ({ tool: f.tool, error: f.error }));
  }

  if (extra) {
    Object.assign(response, extra);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
  };
}

// ─── URL Parsing Helper ───

export function parseTarget(url: string): {
  host: string;
  domain: string;
  port: number;
  baseUrl: string;
} {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const parts = host.split(".");
    const domain = parts.length > 2 ? parts.slice(-2).join(".") : host;
    const port = u.port ? parseInt(u.port, 10) : u.protocol === "https:" ? 443 : 80;
    const baseUrl = `${u.protocol}//${u.host}`;
    return { host, domain, port, baseUrl };
  } catch {
    return { host: url, domain: url, port: 443, baseUrl: `https://${url}` };
  }
}
