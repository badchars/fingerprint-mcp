/**
 * HTTP response header ordering signatures for server identification.
 *
 * Different HTTP server implementations emit response headers in a characteristic
 * order that is determined by the source code, not by any standard. By recording the
 * order of canonical header names in a response and comparing against known signatures
 * we can passively fingerprint the server software -- even when the Server header is
 * stripped or spoofed.
 *
 * The hash is computed by joining the lowercased header names with commas and taking
 * a simple FNV-1a 32-bit hash of the resulting string.
 *
 * References:
 *  - https://httprobe.org
 *  - Nmap HTTP fingerprinting engine
 */

import { createHash } from "node:crypto";

/** A known header-order signature entry. */
export interface HeaderOrderSignature {
  /** The server software name */
  server: string;
  /** Canonical header names in the order they appear in a typical response */
  order: string[];
  /** Precomputed SHA-256-based short hash of the joined header order for quick matching */
  hash: string;
}

/**
 * Compute a deterministic hash from an array of header names.
 *
 * The function lowercases every header name, joins them with commas, and returns
 * the first 16 hex characters of the SHA-256 digest. This gives 64 bits of entropy
 * which is sufficient for matching against a small dictionary.
 *
 * @param headers - Array of header names in observed order
 * @returns 16-character hex hash string
 */
export function computeHeaderOrderHash(headers: string[]): string {
  const normalized = headers.map((h) => h.toLowerCase()).join(",");
  const digest = createHash("sha256").update(normalized).digest("hex");
  return digest.slice(0, 16);
}

export const HEADER_ORDER_SIGNATURES: HeaderOrderSignature[] = [
  {
    server: "Apache httpd",
    order: [
      "Date",
      "Server",
      "Last-Modified",
      "ETag",
      "Accept-Ranges",
      "Content-Length",
      "Content-Type",
    ],
    hash: computeHeaderOrderHash([
      "Date",
      "Server",
      "Last-Modified",
      "ETag",
      "Accept-Ranges",
      "Content-Length",
      "Content-Type",
    ]),
  },
  {
    server: "Apache httpd (CGI)",
    order: [
      "Date",
      "Server",
      "Content-Type",
      "Content-Length",
      "Connection",
    ],
    hash: computeHeaderOrderHash([
      "Date",
      "Server",
      "Content-Type",
      "Content-Length",
      "Connection",
    ]),
  },
  {
    server: "Nginx",
    order: [
      "Server",
      "Date",
      "Content-Type",
      "Content-Length",
      "Connection",
      "Last-Modified",
      "ETag",
      "Accept-Ranges",
    ],
    hash: computeHeaderOrderHash([
      "Server",
      "Date",
      "Content-Type",
      "Content-Length",
      "Connection",
      "Last-Modified",
      "ETag",
      "Accept-Ranges",
    ]),
  },
  {
    server: "Microsoft IIS",
    order: [
      "Content-Type",
      "Server",
      "X-Powered-By",
      "Date",
      "Content-Length",
    ],
    hash: computeHeaderOrderHash([
      "Content-Type",
      "Server",
      "X-Powered-By",
      "Date",
      "Content-Length",
    ]),
  },
  {
    server: "Express.js (Node.js)",
    order: [
      "X-Powered-By",
      "Content-Type",
      "Content-Length",
      "ETag",
      "Date",
      "Connection",
    ],
    hash: computeHeaderOrderHash([
      "X-Powered-By",
      "Content-Type",
      "Content-Length",
      "ETag",
      "Date",
      "Connection",
    ]),
  },
  {
    server: "LiteSpeed",
    order: [
      "Date",
      "Content-Type",
      "Transfer-Encoding",
      "Connection",
      "X-Powered-By",
    ],
    hash: computeHeaderOrderHash([
      "Date",
      "Content-Type",
      "Transfer-Encoding",
      "Connection",
      "X-Powered-By",
    ]),
  },
  {
    server: "Caddy",
    order: [
      "Server",
      "Content-Type",
      "Date",
    ],
    hash: computeHeaderOrderHash([
      "Server",
      "Content-Type",
      "Date",
    ]),
  },
  {
    server: "Cloudflare",
    order: [
      "Date",
      "Content-Type",
      "Transfer-Encoding",
      "Connection",
      "Cache-Control",
      "CF-Cache-Status",
      "CF-RAY",
      "Server",
    ],
    hash: computeHeaderOrderHash([
      "Date",
      "Content-Type",
      "Transfer-Encoding",
      "Connection",
      "Cache-Control",
      "CF-Cache-Status",
      "CF-RAY",
      "Server",
    ]),
  },
];
