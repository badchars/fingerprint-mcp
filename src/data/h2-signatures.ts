/**
 * HTTP/2 SETTINGS frame fingerprints for server implementation identification.
 *
 * When an HTTP/2 connection is established, the server sends a SETTINGS frame
 * (RFC 7540 Section 6.5) containing its preferred protocol parameters. Different
 * HTTP/2 implementations choose distinct default values and orderings for these
 * settings, creating a reliable passive fingerprint.
 *
 * Additionally, idle connection GOAWAY behavior (timeout duration and debug data)
 * varies across implementations, providing a secondary identification signal.
 *
 * SETTINGS frame parameters (RFC 7540 Section 6.5.2):
 *  - HEADER_TABLE_SIZE      (0x1) - HPACK dynamic table size
 *  - ENABLE_PUSH            (0x2) - Server push enabled (0 or 1)
 *  - MAX_CONCURRENT_STREAMS (0x3) - Max simultaneous streams
 *  - INITIAL_WINDOW_SIZE    (0x4) - Flow-control window size
 *  - MAX_FRAME_SIZE         (0x5) - Largest frame payload
 *  - MAX_HEADER_LIST_SIZE   (0x6) - Max header list size
 *
 * References:
 *  - RFC 7540 (HTTP/2)
 *  - https://github.com/AliasIO/wappalyzer
 *  - https://www.blackhat.com/docs/eu-17/materials/eu-17-Shuster-Passive-Fingerprinting-Of-HTTP2-Clients-wp.pdf
 */

/** HTTP/2 SETTINGS frame signature for a known server implementation. */
export interface H2Signature {
  /** Server or implementation name */
  server: string;
  /** Expected SETTINGS frame parameters (undefined means the setting is not sent) */
  settings: {
    /** HPACK header table size in bytes */
    headerTableSize?: number;
    /** Whether server push is enabled (0 = disabled, 1 = enabled) */
    enablePush?: number;
    /** Maximum number of concurrent streams */
    maxConcurrentStreams?: number;
    /** Initial flow-control window size in bytes */
    initialWindowSize?: number;
    /** Maximum frame payload size in bytes */
    maxFrameSize?: number;
    /** Maximum header list size in bytes */
    maxHeaderListSize?: number;
  };
  /** Idle timeout in seconds before the server sends GOAWAY */
  goawayTimeout?: number;
  /** Expected content of the GOAWAY debug data field */
  goawayDebugData?: string;
}

export const H2_SIGNATURES: H2Signature[] = [
  {
    server: "Nginx",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 128,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 16384,
    },
    goawayTimeout: 60,
  },
  {
    server: "Nginx (tuned)",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 256,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 32768,
    },
    goawayTimeout: 60,
  },
  {
    server: "Apache httpd (mod_http2)",
    settings: {
      headerTableSize: 8192,
      enablePush: 1,
      maxConcurrentStreams: 100,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 25600,
    },
    goawayTimeout: 0,
    goawayDebugData: "",
  },
  {
    server: "Envoy Proxy",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 2147483647,
      initialWindowSize: 268435456,
      maxFrameSize: 16384,
      maxHeaderListSize: 60000,
    },
    goawayTimeout: 300,
    goawayDebugData: "",
  },
  {
    server: "Cloudflare",
    settings: {
      headerTableSize: 65536,
      enablePush: 0,
      maxConcurrentStreams: 256,
      initialWindowSize: 65536,
      maxFrameSize: 16384,
      maxHeaderListSize: 16384,
    },
    goawayTimeout: 900,
  },
  {
    server: "AWS Application Load Balancer",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 128,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 131072,
    },
    goawayTimeout: 60,
  },
  {
    server: "Caddy",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 250,
      initialWindowSize: 1048576,
      maxFrameSize: 16384,
      maxHeaderListSize: 8192,
    },
    goawayTimeout: 0,
  },
  {
    server: "LiteSpeed",
    settings: {
      headerTableSize: 65536,
      enablePush: 1,
      maxConcurrentStreams: 100,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 65536,
    },
    goawayTimeout: 300,
  },
  {
    server: "Node.js (http2 module)",
    settings: {
      headerTableSize: 4096,
      enablePush: 1,
      maxConcurrentStreams: 4294967295,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
    },
    goawayTimeout: 120,
    goawayDebugData: "",
  },
  {
    server: "Go net/http2",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 250,
      initialWindowSize: 1048576,
      maxFrameSize: 16384,
      maxHeaderListSize: 10485760,
    },
    goawayTimeout: 0,
    goawayDebugData: "graceful_stop",
  },
  {
    server: "Microsoft IIS / Kestrel",
    settings: {
      headerTableSize: 4096,
      enablePush: 1,
      maxConcurrentStreams: 100,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 32768,
    },
    goawayTimeout: 120,
  },
  {
    server: "Akamai Ghost",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 100,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
      maxHeaderListSize: 32768,
    },
    goawayTimeout: 120,
  },
  {
    server: "Fastly (H2O / Varnish)",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 100,
      initialWindowSize: 262144,
      maxFrameSize: 16384,
      maxHeaderListSize: 65536,
    },
    goawayTimeout: 60,
  },
  {
    server: "Traefik",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 250,
      initialWindowSize: 1048576,
      maxFrameSize: 16384,
      maxHeaderListSize: 10485760,
    },
    goawayTimeout: 0,
    goawayDebugData: "graceful_stop",
  },
  {
    server: "gRPC (Go)",
    settings: {
      headerTableSize: 4096,
      enablePush: 0,
      maxConcurrentStreams: 4294967295,
      initialWindowSize: 65535,
      maxFrameSize: 16384,
    },
    goawayTimeout: 0,
    goawayDebugData: "max_age",
  },
];
