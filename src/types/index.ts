import type { z } from "zod";

// ─── MCP Tool Infrastructure ───

export interface ToolDef {
  name: string;
  description: string;
  schema: Record<string, z.ZodType>;
  execute: (args: Record<string, unknown>, ctx: ToolContext) => Promise<ToolResult>;
}

export interface ToolContext {
  config: {
    // OSINT APIs
    shodanApiKey?: string;
    censysApiId?: string;
    censysApiSecret?: string;
    securitytrailsApiKey?: string;
    virustotalApiKey?: string;
  };
}

export interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
}

// ─── Response Helpers ───

export function text(msg: string): ToolResult {
  return { content: [{ type: "text", text: msg }] };
}

export function json(data: unknown): ToolResult {
  return text(JSON.stringify(data, null, 2));
}
