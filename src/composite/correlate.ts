import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool } from "./helpers.js";

export const correlateTool: ToolDef = {
  name: "correlate",
  description:
    "Cross-layer correlation engine. Validates fingerprint consistency, detects honeypots, identifies spoofing, compares profiles, reconstructs infrastructure topology, detects C2 frameworks, and looks up fingerprint hashes.",
  schema: {
    type: z
      .enum(["consistency", "honeypot", "spoofing", "compare", "topology", "c2", "identify"])
      .describe("Correlation type"),
    serverHeader: z
      .string()
      .optional()
      .describe("Server header value"),
    headerOrderHash: z
      .string()
      .optional()
      .describe("Header order hash"),
    tlsVersion: z
      .string()
      .optional()
      .describe("TLS version"),
    errorSignature: z
      .string()
      .optional()
      .describe("Error page signature"),
    cookies: z
      .array(z.string())
      .optional()
      .describe("Cookie names"),
    sshBanner: z
      .string()
      .optional()
      .describe("SSH banner"),
    jarm: z
      .string()
      .optional()
      .describe("JARM hash"),
    services: z
      .array(
        z.object({
          port: z.number(),
          protocol: z.string(),
          banner: z.string().optional(),
        }),
      )
      .optional()
      .describe("Detected services (for honeypot)"),
    openPortCount: z
      .number()
      .optional()
      .describe("Total open ports (for honeypot)"),
    sshAlgorithms: z
      .array(z.string())
      .optional()
      .describe("SSH algorithms"),
    headerOrder: z
      .array(z.string())
      .optional()
      .describe("Header ordering (for spoofing)"),
    hassh: z
      .string()
      .optional()
      .describe("HASSH fingerprint"),
    claimedVersion: z
      .string()
      .optional()
      .describe("Claimed server version"),
    profile1: z
      .record(z.unknown())
      .optional()
      .describe("First profile (for compare)"),
    profile2: z
      .record(z.unknown())
      .optional()
      .describe("Second profile (for compare)"),
    cdnProvider: z
      .string()
      .optional()
      .describe("CDN provider (for topology)"),
    originIp: z
      .string()
      .optional()
      .describe("Origin IP (for topology)"),
    lbCookies: z
      .array(z.string())
      .optional()
      .describe("LB cookies (for topology)"),
    certSans: z
      .array(z.string())
      .optional()
      .describe("Certificate SANs (for topology)"),
    dnsRecords: z
      .record(z.unknown())
      .optional()
      .describe("DNS records (for topology)"),
    internalHostnames: z
      .array(z.string())
      .optional()
      .describe("Internal hostnames (for topology)"),
    host: z
      .string()
      .optional()
      .describe("Target host (for c2)"),
    port: z
      .number()
      .optional()
      .describe("Target port (for c2)"),
    certCn: z
      .string()
      .optional()
      .describe("Certificate CN (for c2)"),
    certOrg: z
      .string()
      .optional()
      .describe("Certificate Org (for c2)"),
    certSelfSigned: z
      .boolean()
      .optional()
      .describe("Self-signed cert (for c2)"),
    certValidityDays: z
      .number()
      .optional()
      .describe("Cert validity days (for c2)"),
    responseTimingMs: z
      .number()
      .optional()
      .describe("Response timing ms (for c2)"),
    hash: z
      .string()
      .optional()
      .describe("Fingerprint hash (for identify)"),
    hashType: z
      .enum(["jarm", "favicon", "hassh", "header_order"])
      .optional()
      .describe("Hash type (for identify)"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const type = args.type as string;

    const filter = (keys: string[]): Record<string, unknown> => {
      const filtered: Record<string, unknown> = {};
      for (const k of keys) {
        if (args[k] !== undefined) filtered[k] = args[k];
      }
      return filtered;
    };

    let result;

    switch (type) {
      case "consistency":
        result = await callTool(
          "fp_correlate",
          filter(["serverHeader", "headerOrderHash", "tlsVersion", "errorSignature", "cookies", "sshBanner", "jarm"]),
          ctx,
        );
        break;

      case "honeypot":
        result = await callTool(
          "fp_honeypot",
          filter(["services", "openPortCount", "sshBanner", "sshAlgorithms"]),
          ctx,
        );
        break;

      case "spoofing":
        result = await callTool(
          "fp_spoofing",
          filter(["serverHeader", "headerOrder", "sshBanner", "hassh", "sshAlgorithms", "claimedVersion"]),
          ctx,
        );
        break;

      case "compare":
        result = await callTool(
          "fp_compare",
          filter(["profile1", "profile2"]),
          ctx,
        );
        break;

      case "topology":
        result = await callTool(
          "fp_topology",
          filter(["cdnProvider", "originIp", "lbCookies", "certSans", "dnsRecords", "serverHeader", "internalHostnames"]),
          ctx,
        );
        break;

      case "c2":
        result = await callTool(
          "fp_c2_detect",
          filter(["host", "port", "jarm", "certCn", "certOrg", "certSelfSigned", "certValidityDays", "responseTimingMs"]),
          ctx,
        );
        break;

      case "identify": {
        const identifyArgs: Record<string, unknown> = {};
        if (args.hash !== undefined) identifyArgs.hash = args.hash;
        if (args.hashType !== undefined) identifyArgs.type = args.hashType;
        result = await callTool("fp_identify", identifyArgs, ctx);
        break;
      }

      default:
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Unknown correlation type: ${type}` }, null, 2) }],
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
    };
  },
};
