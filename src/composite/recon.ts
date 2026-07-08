import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import {
  callToolsParallel,
  buildCompositeResponse,
  parseTarget,
  type SubToolResult,
} from "./helpers.js";

// ─── Quick Techniques (5) ───

const QUICK_CALLS = (
  url: string,
  host: string,
  domain: string,
  port: number,
): Array<{ name: string; args: Record<string, unknown> }> => [
  { name: "http_headers", args: { url } },
  { name: "dns_records", args: { domain } },
  { name: "tls_cert", args: { host, port } },
  { name: "web_tech", args: { url } },
  { name: "infra_cloud_detect", args: { target: host } },
];

// ─── Standard Techniques (+15) ───

const STANDARD_CALLS = (
  url: string,
  host: string,
  domain: string,
  port: number,
): Array<{ name: string; args: Record<string, unknown> }> => [
  { name: "http_favicon", args: { url } },
  { name: "http_cookies", args: { url } },
  { name: "http_etag", args: { url } },
  { name: "http_errors", args: { url } },
  { name: "http_security", args: { url } },
  { name: "tls_probe", args: { host, port } },
  { name: "tls_jarm", args: { host, port } },
  { name: "waf_detect", args: { url } },
  { name: "waf_cdn_detect", args: { url } },
  { name: "app_cms", args: { url } },
  { name: "app_framework", args: { url } },
  { name: "web_analytics", args: { url } },
  { name: "dns_email", args: { domain } },
  { name: "dns_saas", args: { domain } },
  { name: "path_robots", args: { url } },
];

// ─── Deep Batch 1 (~15) ───

const DEEP_BATCH_1 = (
  url: string,
  host: string,
  port: number,
): Array<{ name: string; args: Record<string, unknown> }> => [
  { name: "http_multi_fingerprint", args: { url } },
  { name: "http_methods", args: { url } },
  { name: "http_cors", args: { url } },
  { name: "http_compression", args: { url } },
  { name: "http_cache", args: { url } },
  { name: "http_timing", args: { url } },
  { name: "http_redirect", args: { url } },
  { name: "http_keepalive", args: { url } },
  { name: "http_resource_hints", args: { url } },
  { name: "http_server_timing", args: { url } },
  { name: "http_nel", args: { url } },
  { name: "tls_ja4x", args: { host, port } },
  { name: "tls_ciphers", args: { host, port } },
  { name: "tls_sni", args: { host, port } },
  { name: "tls_cert_cross_ref", args: { host, port } },
];

// ─── Deep Batch 2 (~15) ───

const DEEP_BATCH_2 = (
  url: string,
  host: string,
  domain: string,
  port: number,
): Array<{ name: string; args: Record<string, unknown> }> => [
  { name: "tls_ct_subdomains", args: { domain } },
  { name: "dns_server_fp", args: { domain } },
  { name: "dns_mta_sts", args: { domain } },
  { name: "dns_takeover", args: { domain } },
  { name: "web_sourcemaps", args: { url } },
  { name: "web_api_discovery", args: { url } },
  { name: "web_websocket", args: { url } },
  { name: "web_sri", args: { url } },
  { name: "app_ecommerce", args: { url } },
  { name: "path_sensitive", args: { url } },
  { name: "path_git_leak", args: { url } },
  { name: "path_debug", args: { url } },
  { name: "path_api_version", args: { url } },
  { name: "timing_baseline", args: { url } },
  { name: "h2_detect", args: { host, port } },
];

// ─── Deep Batch 3 (~7) ───

const DEEP_BATCH_3 = (
  url: string,
  host: string,
  domain: string,
  port: number,
): Array<{ name: string; args: Record<string, unknown> }> => [
  { name: "h2_server_fp", args: { host, port } },
  { name: "waf_fingerprint", args: { url } },
  { name: "infra_asn_lookup", args: { ip: host } },
  { name: "infra_cdn_identify", args: { url } },
  { name: "infra_reverse_proxy_detect", args: { url } },
  { name: "infra_lb_detect", args: { url } },
  { name: "waf_origin", args: { domain } },
];

// ─── Recon Composite Tool ───

export const reconTool: ToolDef = {
  name: "recon",
  description:
    "Full target reconnaissance. Runs HTTP headers, TLS certificate, DNS records, web technology detection, WAF/CDN, and infrastructure analysis in a single call. Use depth parameter to control scope: quick (~5 techniques, fast overview), standard (~20 techniques, balanced), deep (~50+ techniques, comprehensive).",
  schema: {
    url: z
      .string()
      .describe("Target URL (e.g., https://example.com)"),
    depth: z
      .enum(["quick", "standard", "deep"])
      .optional()
      .describe(
        "Scan depth: quick (~5 techniques), standard (~20), deep (50+). Default: quick",
      ),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    let url = args.url as string;
    if (!url.startsWith("http")) url = `https://${url}`;

    const depth = (args.depth as string) ?? "quick";
    const { host, domain, port } = parseTarget(url);

    const allResults: SubToolResult[] = [];
    const called = new Set<string>();

    const runBatch = async (
      calls: Array<{ name: string; args: Record<string, unknown> }>,
    ): Promise<void> => {
      const filtered = calls.filter((c) => !called.has(c.name));
      for (const c of filtered) called.add(c.name);
      if (filtered.length === 0) return;
      const results = await callToolsParallel(filtered, ctx);
      allResults.push(...results);
    };

    // ── Quick (~5 techniques) ──
    await runBatch(QUICK_CALLS(url, host, domain, port));
    if (depth === "quick") {
      return buildCompositeResponse("recon", allResults, {
        depth,
        target: url,
      });
    }

    // ── Standard (~20 techniques) ──
    await runBatch(STANDARD_CALLS(url, host, domain, port));
    if (depth === "standard") {
      return buildCompositeResponse("recon", allResults, {
        depth,
        target: url,
      });
    }

    // ── Deep (~50+ techniques, 3 sequential batches) ──
    await runBatch(DEEP_BATCH_1(url, host, port));
    await runBatch(DEEP_BATCH_2(url, host, domain, port));
    await runBatch(DEEP_BATCH_3(url, host, domain, port));

    return buildCompositeResponse("recon", allResults, {
      depth,
      target: url,
    });
  },
};
