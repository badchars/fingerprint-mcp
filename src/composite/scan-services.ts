import { z } from "zod";
import type { ToolDef, ToolContext, ToolResult } from "../types/index.js";
import { callTool, callToolsParallel, buildCompositeResponse } from "./helpers.js";

type ServiceType = "mysql" | "postgres" | "redis" | "ftp" | "vnc_rdp" | "ssh" | "smtp" | "iot" | "all";

const PORT_SERVICE_MAP: Record<number, ServiceType> = {
  3306: "mysql",
  5432: "postgres",
  6379: "redis",
  21: "ftp",
  22: "ssh",
  25: "smtp",
  587: "smtp",
  3389: "vnc_rdp",
  5900: "vnc_rdp",
  5901: "vnc_rdp",
};

function buildServiceCalls(
  service: ServiceType,
  host: string,
  ports?: number[],
): Array<{ name: string; args: Record<string, unknown> }> {
  switch (service) {
    case "mysql":
      return [{ name: "svc_mysql_probe", args: { host, port: ports?.[0] ?? 3306 } }];

    case "postgres":
      return [{ name: "svc_postgres_probe", args: { host, port: ports?.[0] ?? 5432 } }];

    case "redis":
      return [{ name: "svc_redis_probe", args: { host, port: ports?.[0] ?? 6379 } }];

    case "ftp":
      return [{ name: "svc_ftp_probe", args: { host, port: ports?.[0] ?? 21 } }];

    case "vnc_rdp":
      return [{ name: "svc_vnc_rdp_detect", args: { host, ports: ports ?? [3389, 5900, 5901] } }];

    case "ssh": {
      const sshPort = ports?.[0] ?? 22;
      return [
        { name: "ssh_probe", args: { host, port: sshPort } },
        { name: "ssh_audit", args: { host, port: sshPort } },
        { name: "ssh_hostkey_lookup", args: { host, port: sshPort } },
      ];
    }

    case "smtp": {
      const smtpPort = ports?.[0] ?? 25;
      return [
        { name: "smtp_probe", args: { host, port: smtpPort } },
        { name: "smtp_tls", args: { host, port: smtpPort } },
      ];
    }

    case "iot":
      return [{ name: "iot_probe", args: { host, ports: ports ?? [80, 443, 8080, 8443, 23, 161, 1883] } }];

    case "all":
      return [
        ...buildServiceCalls("mysql", host, ports),
        ...buildServiceCalls("postgres", host, ports),
        ...buildServiceCalls("redis", host, ports),
        ...buildServiceCalls("ftp", host, ports),
        ...buildServiceCalls("vnc_rdp", host, ports),
        ...buildServiceCalls("ssh", host, ports),
        ...buildServiceCalls("smtp", host, ports),
        ...buildServiceCalls("iot", host, ports),
      ];

    default:
      return [];
  }
}

export const scanServicesTool: ToolDef = {
  name: "scan_services",
  description:
    "Service-level fingerprinting for databases, caches, remote desktop, SSH, SMTP, and IoT. Supports auto-detection from port numbers or explicit service selection. Probes: MySQL, PostgreSQL, Redis, FTP, VNC/RDP, SSH (with full audit), SMTP (with TLS check), and IoT device detection.",
  schema: {
    host: z.string().describe("Target host"),
    ports: z
      .array(z.number())
      .optional()
      .describe("Specific ports to probe"),
    service: z
      .enum(["mysql", "postgres", "redis", "ftp", "vnc_rdp", "ssh", "smtp", "iot", "all"])
      .optional()
      .describe("Service to probe (default: auto-detect from ports, or 'all')"),
  },

  async execute(
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<ToolResult> {
    const host = args.host as string;
    const ports = args.ports as number[] | undefined;
    const service = args.service as ServiceType | undefined;

    let calls: Array<{ name: string; args: Record<string, unknown> }>;

    if (service) {
      // Explicit service selection
      calls = buildServiceCalls(service, host, ports);
    } else if (ports && ports.length > 0) {
      // Auto-detect services from port numbers
      const detectedServices = new Set<ServiceType>();

      for (const port of ports) {
        const svc = PORT_SERVICE_MAP[port];
        if (svc) detectedServices.add(svc);
      }

      if (detectedServices.size === 0) {
        // No recognized ports — default to all
        calls = buildServiceCalls("all", host, ports);
      } else {
        calls = [];
        for (const svc of detectedServices) {
          // Filter ports relevant to this service
          const relevantPorts = ports.filter((p) => PORT_SERVICE_MAP[p] === svc);
          calls.push(...buildServiceCalls(svc, host, relevantPorts.length > 0 ? relevantPorts : undefined));
        }
      }
    } else {
      // Neither service nor ports given — default to "all"
      calls = buildServiceCalls("all", host, ports);
    }

    const results = await callToolsParallel(calls, ctx);

    return buildCompositeResponse("scan_services", results);
  },
};
