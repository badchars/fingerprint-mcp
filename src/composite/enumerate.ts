import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const enumerateTool: ToolDef = {
  name: "enumerate",
  description:
    "Scope expansion: subdomain enumeration (SecurityTrails/HackerTarget), wildcard DNS detection, TLD/ccTLD expansion, related domain discovery via certificate transparency, ASN neighbor enumeration, passive DNS history, and attack surface summary. 8 techniques across 3 phases.",
  schema: {
    domain: z.string().describe("Target domain for scope expansion"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const domain = args.domain as string;
    const basename = domain.split(".")[0];

    // ── Phase 1: parallel discovery (5 tools) ──
    const phase1Results = await callToolsParallel(
      [
        { name: "enum_subdomains", args: { domain } },
        { name: "enum_wildcard_detect", args: { domain } },
        { name: "enum_tld_expansion", args: { basename } },
        { name: "enum_related_domains", args: { domain } },
        { name: "tls_ct_subdomains", args: { domain } },
      ],
      ctx,
    );

    // ── Phase 2: parallel enrichment (2 tools) ──
    const phase2Results = await callToolsParallel(
      [
        { name: "enum_asn_neighbors", args: { target: domain } },
        { name: "enum_passive_dns", args: { domain } },
      ],
      ctx,
    );

    // ── Phase 3: scope summary ──
    // Attempt to extract subdomains, IPs, and wildcard zones from phase 1
    let subdomains: string[] = [];
    let ips: string[] = [];
    let wildcardZones: string[] = [];

    try {
      // Extract subdomains from enum_subdomains result
      const enumSubResult = phase1Results.find((r) => r.tool === "enum_subdomains");
      if (enumSubResult?.ok && enumSubResult.data && typeof enumSubResult.data === "object") {
        const enumData = enumSubResult.data as Record<string, unknown>;
        if (Array.isArray(enumData.subdomains)) {
          subdomains = [...subdomains, ...(enumData.subdomains as string[])];
        }
      }

      // Extract subdomains from CT log result
      const ctResult = phase1Results.find((r) => r.tool === "tls_ct_subdomains");
      if (ctResult?.ok && ctResult.data) {
        const ctData = ctResult.data as Record<string, unknown>;
        if (Array.isArray(ctData.subdomains)) {
          subdomains = [...subdomains, ...(ctData.subdomains as string[])];
        } else if (Array.isArray(ctData.domains)) {
          subdomains = [...subdomains, ...(ctData.domains as string[])];
        } else if (Array.isArray(ctData.results)) {
          subdomains = [...subdomains, ...(ctData.results as string[])];
        }
      }

      // Deduplicate subdomains
      subdomains = [...new Set(subdomains)];

      // Extract wildcard zones from wildcard detect result
      const wildcardResult = phase1Results.find((r) => r.tool === "enum_wildcard_detect");
      if (wildcardResult?.ok && wildcardResult.data && typeof wildcardResult.data === "object") {
        const wcData = wildcardResult.data as Record<string, unknown>;
        if (Array.isArray(wcData.wildcardZones)) {
          wildcardZones = wcData.wildcardZones as string[];
        } else if (Array.isArray(wcData.zones)) {
          wildcardZones = wcData.zones as string[];
        }
      }

      // Extract IPs from passive DNS if available
      const passiveResult = phase2Results.find((r) => r.tool === "enum_passive_dns");
      if (passiveResult?.ok && passiveResult.data && typeof passiveResult.data === "object") {
        const pdData = passiveResult.data as Record<string, unknown>;
        if (Array.isArray(pdData.ips)) {
          ips = pdData.ips as string[];
        }
      }
    } catch {
      // Extraction failed — call scope_summary with domain only
    }

    const summaryArgs: Record<string, unknown> = { domain };
    if (subdomains.length > 0) summaryArgs.subdomains = subdomains;
    if (ips.length > 0) summaryArgs.ips = ips;
    if (wildcardZones.length > 0) summaryArgs.wildcardZones = wildcardZones;

    const phase3Result = await callToolsParallel(
      [{ name: "enum_scope_summary", args: summaryArgs }],
      ctx,
    );

    // ── Combine all phases ──
    return buildCompositeResponse("enumerate", [
      ...phase1Results,
      ...phase2Results,
      ...phase3Result,
    ]);
  },
};
