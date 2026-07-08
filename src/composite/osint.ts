import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const osintTool: ToolDef = {
  name: "osint",
  description:
    "OSINT enrichment: Shodan host lookup, Censys search, reverse IP lookup, WHOIS information, Wayback Machine historical snapshots, and VirusTotal intelligence. Supports both IP and domain targets with auto-detection. 6 techniques in a single call.",
  schema: {
    target: z.string().describe("IP address or domain for OSINT lookup"),
    type: z
      .enum(["ip", "domain"])
      .optional()
      .describe("Target type (auto-detected if omitted)"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const target = args.target as string;
    const type =
      (args.type as "ip" | "domain" | undefined) ??
      (/^\d+\.\d+\.\d+\.\d+$/.test(target) ? "ip" : "domain");

    let calls: Array<{ name: string; args: Record<string, unknown> }>;

    if (type === "ip") {
      calls = [
        { name: "osint_shodan", args: { ip: target } },
        { name: "osint_censys", args: { ip: target } },
        { name: "osint_reverse_ip", args: { ip: target } },
        { name: "osint_whois", args: { target } },
        { name: "osint_virustotal", args: { target, type: "ip" } },
      ];
    } else {
      calls = [
        { name: "osint_shodan", args: { query: "hostname:" + target } },
        { name: "osint_censys", args: { query: target } },
        { name: "osint_whois", args: { target } },
        { name: "osint_web_archive", args: { url: "https://" + target } },
        { name: "osint_virustotal", args: { target, type: "domain" } },
      ];
    }

    const results = await callToolsParallel(calls, ctx);

    return buildCompositeResponse("osint", results);
  },
};
