import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool } from "./helpers.js";

export const analyzeTool: ToolDef = {
  name: "analyze",
  description:
    "Passive analysis of pre-collected data. No network calls. Supports three modes: headers (HTTP header fingerprinting), html (HTML source analysis), banner (service banner identification).",
  schema: {
    type: z
      .enum(["headers", "html", "banner"])
      .describe("Analysis type"),
    headers: z
      .record(z.string())
      .optional()
      .describe("HTTP response headers (for type=headers)"),
    html: z
      .string()
      .optional()
      .describe("HTML source code (for type=html)"),
    banner: z
      .string()
      .optional()
      .describe("Service banner string (for type=banner)"),
    url: z
      .string()
      .optional()
      .describe("URL context for headers/html analysis"),
    port: z
      .number()
      .optional()
      .describe("Port number context for banner analysis"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const type = args.type as string;

    const filteredArgs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && k !== "type") filteredArgs[k] = v;
    }

    let result;

    switch (type) {
      case "headers":
        result = await callTool("fp_analyze_headers", { headers: args.headers, url: args.url }, ctx);
        break;
      case "html":
        result = await callTool("fp_analyze_html", { html: args.html, url: args.url }, ctx);
        break;
      case "banner":
        result = await callTool("fp_analyze_banner", { banner: args.banner, port: args.port }, ctx);
        break;
      default:
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Unknown analysis type: ${type}` }, null, 2) }],
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
    };
  },
};
