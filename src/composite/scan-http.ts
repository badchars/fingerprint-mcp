import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool, callToolsParallel, buildCompositeResponse, parseTarget } from "./helpers.js";

export const scanHttpTool: ToolDef = {
  name: "scan_http",
  description:
    "Comprehensive HTTP and web fingerprinting: header ordering, favicon hash, ETag analysis, error pages, cookies, HTTP methods, CORS, compression, caching, security headers, timing, redirect chains, web technology detection, analytics, source maps, API discovery, CMS/framework/ecommerce detection, and HTTP/2 analysis. ~29 techniques with smart skipping.",
  schema: {
    url: z.string().describe("Target URL for HTTP fingerprinting"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const url = args.url as string;
    const { host, port } = parseTarget(url);

    // ── Phase 1: baseline headers ──
    const phase1 = await callTool("http_headers", { url }, ctx);

    // ── Phase 2: determine conditional tools based on phase 1 headers ──
    const phase2Calls: Array<{ name: string; args: Record<string, unknown> }> = [
      // Always-include HTTP tools
      { name: "http_multi_fingerprint", args: { url } },
      { name: "http_favicon", args: { url } },
      { name: "http_etag", args: { url } },
      { name: "http_errors", args: { url } },
      { name: "http_cookies", args: { url } },
      { name: "http_methods", args: { url } },
      { name: "http_cors", args: { url } },
      { name: "http_compression", args: { url } },
      { name: "http_cache", args: { url } },
      { name: "http_security", args: { url } },
      { name: "http_timing", args: { url } },
      { name: "http_redirect", args: { url } },
      { name: "http_keepalive", args: { url } },
      { name: "http_resource_hints", args: { url } },

      // Web fingerprinting tools
      { name: "web_tech", args: { url } },
      { name: "web_analytics", args: { url } },
      { name: "web_sourcemaps", args: { url } },
      { name: "web_api_discovery", args: { url } },
      { name: "web_sri", args: { url } },
      { name: "web_websocket", args: { url } },
      { name: "web_graphql", args: { url } },

      // App detection tools
      { name: "app_cms", args: { url } },
      { name: "app_framework", args: { url } },
      { name: "app_ecommerce", args: { url } },

      // HTTP/2 tools
      { name: "h2_detect", args: { url } },
      { name: "h2_server_fp", args: { host, port } },

      // Timing baseline
      { name: "timing_baseline", args: { url } },
    ];

    // Conditionally include server-timing and NEL tools based on phase 1 headers
    if (phase1.ok && phase1.data && typeof phase1.data === "object") {
      const data = phase1.data as Record<string, unknown>;

      // Check for server-timing header (may be nested under a "headers" key or at top level)
      const headers = (data.headers ?? data) as Record<string, unknown>;
      const headerKeys = Object.keys(headers).map((k) => k.toLowerCase());

      if (headerKeys.includes("server-timing")) {
        phase2Calls.push({ name: "http_server_timing", args: { url } });
      }

      if (headerKeys.includes("nel") || headerKeys.includes("report-to")) {
        phase2Calls.push({ name: "http_nel", args: { url } });
      }
    }

    // ── Phase 2: run all tools in parallel ──
    const phase2Results = await callToolsParallel(phase2Calls, ctx);

    // ── Combine all results ──
    return buildCompositeResponse("scan_http", [phase1, ...phase2Results]);
  },
};
