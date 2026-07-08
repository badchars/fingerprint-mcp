import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const scanTlsTool: ToolDef = {
  name: "scan_tls",
  description:
    "Complete TLS/SSL analysis: handshake probe, JARM fingerprint, certificate deep inspection, JA4X generation fingerprint, cipher suite enumeration, SNI probing, certificate cross-referencing, and CT subdomain discovery. 8 techniques in a single call.",
  schema: {
    host: z
      .string()
      .describe("Target hostname"),
    port: z
      .number()
      .optional()
      .describe("TLS port (default: 443)"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const host = args.host as string;
    const port = (args.port as number) ?? 443;
    const domain = host;

    const results = await callToolsParallel(
      [
        { name: "tls_probe", args: { host, port } },
        { name: "tls_jarm", args: { host, port } },
        { name: "tls_cert", args: { host, port } },
        { name: "tls_ja4x", args: { host, port } },
        { name: "tls_ciphers", args: { host, port } },
        { name: "tls_sni", args: { host, port } },
        { name: "tls_cert_cross_ref", args: { host, port } },
        { name: "tls_ct_subdomains", args: { domain } },
      ],
      ctx,
    );

    return buildCompositeResponse("scan_tls", results);
  },
};
