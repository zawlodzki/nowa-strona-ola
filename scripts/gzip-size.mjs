import { Buffer } from "node:buffer";
import { gzipSync } from "fflate";

/**
 * Gzip size for asset budgets. fflate is pure JS, so the result does not
 * depend on the zlib a Node binary links (Homebrew and official builds differ
 * by tens of bytes). Fixed mtime keeps the header deterministic.
 */
export function gzipSize(content) {
  return gzipSync(Buffer.from(content), { level: 9, mtime: 0 }).length;
}
