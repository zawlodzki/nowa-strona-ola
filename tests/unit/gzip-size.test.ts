import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";

import { gzipSize } from "../../scripts/gzip-size.mjs";

describe("gzipSize", () => {
  const css = ".ao-button{padding:var(--ao-space-12)}".repeat(40);

  it("measures strings and buffers the same way", () => {
    expect(gzipSize(css)).toBe(gzipSize(Buffer.from(css)));
  });

  it("is stable regardless of the Node zlib build", () => {
    // Pinned fflate output; a change means budgets need a fresh baseline.
    expect(gzipSize(css)).toBe(70);
    expect(gzipSize("")).toBe(20);
  });
});
