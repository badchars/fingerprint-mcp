import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const metaTool: ToolDef = {
  name: "meta",
  description:
    "Server info: lists all providers, tools, configuration, and known signature databases in a single response.",
  schema: {
    category: z
      .string()
      .optional()
      .describe(
        "Filter by category: active, passive, osint, enum, analysis, meta",
      ),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const category = args.category as string | undefined;

    const calls = [
      { name: "fp_list_sources", args: category ? { category } : {} },
      { name: "fp_server_config", args: {} },
      { name: "fp_list_signatures", args: {} },
    ];

    const results = await callToolsParallel(calls, ctx);

    return buildCompositeResponse("meta", results);
  },
};
