import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callToolsParallel, buildCompositeResponse } from "./helpers.js";

export const scanPathsTool: ToolDef = {
  name: "scan_paths",
  description:
    "Path intelligence: sensitive file/directory probing (200+ paths across 11 categories), robots.txt/sitemap/security.txt parsing, version control and secret exposure detection, debug endpoint discovery with severity ratings, and API version probing. 5 techniques in a single call.",
  schema: {
    url: z
      .string()
      .describe("Base URL for path probing"),
    categories: z
      .array(z.string())
      .optional()
      .describe("path_sensitive categories to probe (default: all 11 categories)"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const url = args.url as string;
    const categories = args.categories as string[] | undefined;

    const sensitiveArgs: Record<string, unknown> = { url };
    if (categories !== undefined) {
      sensitiveArgs.categories = categories;
    }

    const results = await callToolsParallel(
      [
        { name: "path_sensitive", args: sensitiveArgs },
        { name: "path_robots", args: { url } },
        { name: "path_git_leak", args: { url } },
        { name: "path_debug", args: { url } },
        { name: "path_api_version", args: { url } },
      ],
      ctx,
    );

    return buildCompositeResponse("scan_paths", results);
  },
};
