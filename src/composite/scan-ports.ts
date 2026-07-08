import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool, callToolsParallel, buildCompositeResponse } from "./helpers.js";

const DEFAULT_PORTS = [21, 22, 25, 80, 443, 3306, 3389, 5432, 5900, 6379, 8080, 8443];

export const scanPortsTool: ToolDef = {
  name: "scan_ports",
  description:
    "TCP port scanning with banner grabbing and automatic service detection. Probes specified ports, reads initial banners, detects protocols (SSH, MySQL, Redis, FTP, SMTP, HTTP, PostgreSQL, VNC, RDP), and runs targeted service fingerprinting on detected services.",
  schema: {
    host: z.string().describe("Target host"),
    ports: z
      .array(z.number())
      .optional()
      .describe("Ports to scan (default: common service ports)"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const host = args.host as string;
    const ports = (args.ports as number[] | undefined) ?? DEFAULT_PORTS;

    // ── Step 1: TCP probe with banner grab ──
    const probeResult = await callTool("tcp_probe", { host, ports }, ctx);

    // ── Step 2: Detect services from banners and dispatch probes ──
    const serviceCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    if (probeResult.ok && probeResult.data && typeof probeResult.data === "object") {
      const data = probeResult.data as Record<string, unknown>;
      const probes = (data.probes ?? []) as Array<{
        port: number;
        open: boolean;
        banner?: string;
      }>;

      for (const probe of probes) {
        if (!probe.open) continue;

        const banner = probe.banner ?? "";
        const port = probe.port;

        // SSH detection
        if (banner.startsWith("SSH-")) {
          serviceCalls.push({ name: "ssh_probe", args: { host, port } });
          continue;
        }

        // SMTP detection
        if (/^220[\s-]/.test(banner) && /smtp|mail/i.test(banner)) {
          serviceCalls.push({ name: "smtp_probe", args: { host, port } });
          continue;
        }

        // FTP detection
        if (/^220[\s-]/.test(banner) && /ftp/i.test(banner)) {
          serviceCalls.push({ name: "svc_ftp_probe", args: { host, port } });
          continue;
        }

        // MySQL detection
        if (port === 3306) {
          serviceCalls.push({ name: "svc_mysql_probe", args: { host, port } });
          continue;
        }

        // PostgreSQL detection
        if (port === 5432) {
          serviceCalls.push({ name: "svc_postgres_probe", args: { host, port } });
          continue;
        }

        // Redis detection
        if (port === 6379 || /\+PONG|-NOAUTH/.test(banner)) {
          serviceCalls.push({ name: "svc_redis_probe", args: { host, port } });
          continue;
        }

        // RDP detection
        if (port === 3389) {
          serviceCalls.push({ name: "svc_vnc_rdp_detect", args: { host, ports: [port] } });
          continue;
        }

        // VNC detection
        if (port === 5900 || port === 5901 || banner.startsWith("RFB")) {
          serviceCalls.push({ name: "svc_vnc_rdp_detect", args: { host, ports: [port] } });
          continue;
        }
      }
    }

    // ── Step 3: Run all service probes in parallel ──
    const serviceResults =
      serviceCalls.length > 0
        ? await callToolsParallel(serviceCalls, ctx)
        : [];

    // ── Combine results ──
    return buildCompositeResponse("scan_ports", [probeResult, ...serviceResults]);
  },
};
