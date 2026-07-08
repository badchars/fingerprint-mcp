import type { ToolDef } from "../types/index.js";

import { reconTool } from "./recon.js";
import { scanPortsTool } from "./scan-ports.js";
import { scanTlsTool } from "./scan-tls.js";
import { scanDnsTool } from "./scan-dns.js";
import { scanHttpTool } from "./scan-http.js";
import { scanPathsTool } from "./scan-paths.js";
import { scanWafTool } from "./scan-waf.js";
import { scanServicesTool } from "./scan-services.js";
import { enumerateTool } from "./enumerate.js";
import { osintTool } from "./osint.js";
import { analyzeTool } from "./analyze.js";
import { correlateTool } from "./correlate.js";
import { metaTool } from "./meta.js";

export const compositeTools: ToolDef[] = [
  reconTool,
  scanPortsTool,
  scanTlsTool,
  scanDnsTool,
  scanHttpTool,
  scanPathsTool,
  scanWafTool,
  scanServicesTool,
  enumerateTool,
  osintTool,
  analyzeTool,
  correlateTool,
  metaTool,
];
