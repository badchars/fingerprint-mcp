import type { ToolDef } from "../types/index.js";
import { compositeTools } from "../composite/index.js";

// MCP server registers only the 13 composite tools.
// Individual tools (103) remain accessible via CLI --tool and --list-all.
export const allTools: ToolDef[] = compositeTools;
