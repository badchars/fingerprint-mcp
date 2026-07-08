import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool, callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const scanDnsTool: ToolDef = {
  name: "scan_dns",
  description:
    "Comprehensive DNS intelligence: full record enumeration, email infrastructure (MX/SPF/DKIM/DMARC), SaaS inventory from TXT records, nameserver fingerprinting, MTA-STS/DANE analysis, subdomain takeover detection, and reverse DNS. 7 techniques in a single call.",
  schema: {
    domain: z
      .string()
      .describe("Target domain"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const domain = args.domain as string;

    // Phase 1: Run 6 DNS tools in parallel
    const phase1Results = await callToolsParallel(
      [
        { name: "dns_records", args: { domain } },
        { name: "dns_email", args: { domain } },
        { name: "dns_saas", args: { domain } },
        { name: "dns_server_fp", args: { domain } },
        { name: "dns_mta_sts", args: { domain } },
        { name: "dns_takeover", args: { domain } },
      ],
      ctx,
    );

    // Phase 2: Extract A record IP from dns_records result, then do reverse DNS
    const allResults = [...phase1Results];

    const dnsRecordsResult = phase1Results.find((r) => r.tool === "dns_records");
    if (dnsRecordsResult?.ok && dnsRecordsResult.data) {
      const data = dnsRecordsResult.data as Record<string, unknown>;

      // Try to extract an IP address from the A records
      let ip: string | undefined;

      // Common shapes: data.A could be an array of strings or objects with address field
      const records = data.records as Record<string, unknown> | undefined;
      const aRecords = data.A ?? data.a ?? records?.A;
      if (Array.isArray(aRecords) && aRecords.length > 0) {
        const first = aRecords[0];
        ip = typeof first === "string" ? first : first?.address ?? first?.ip ?? first?.value;
      }

      if (ip) {
        const reverseResult = await callTool("dns_reverse", { ip }, ctx);
        allResults.push(reverseResult);
      }
    }

    return buildCompositeResponse("scan_dns", allResults);
  },
};
