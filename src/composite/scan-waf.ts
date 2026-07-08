import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool, callToolsParallel, buildCompositeResponse, parseTarget } from "./helpers.js";

export const scanWafTool: ToolDef = {
  name: "scan_waf",
  description:
    "WAF and CDN analysis: WAF identification via attack payload probing, CDN provider detection from headers/DNS, deep WAF technology fingerprinting from block pages, and origin IP discovery behind CDN. 4 techniques with conditional origin discovery.",
  schema: {
    url: z
      .string()
      .describe("Target URL for WAF/CDN analysis"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const url = args.url as string;

    // Phase 1: Run 3 WAF tools in parallel
    const phase1Results = await callToolsParallel(
      [
        { name: "waf_detect", args: { url } },
        { name: "waf_cdn_detect", args: { url } },
        { name: "waf_fingerprint", args: { url } },
      ],
      ctx,
    );

    const allResults = [...phase1Results];

    // Phase 2: If CDN detected, attempt origin IP discovery
    const cdnResult = phase1Results.find((r) => r.tool === "waf_cdn_detect");
    if (cdnResult?.ok && cdnResult.data) {
      const data = cdnResult.data as Record<string, unknown>;

      // Check for truthy cdn or provider field indicating CDN is present
      const cdnDetected = data.cdn || data.provider;

      if (cdnDetected) {
        const { domain } = parseTarget(url);
        const originResult = await callTool("waf_origin", { domain }, ctx);
        allResults.push(originResult);
      }
    }

    return buildCompositeResponse("scan_waf", allResults);
  },
};
