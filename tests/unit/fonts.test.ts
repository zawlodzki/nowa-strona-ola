import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const SWITZER_VARIABLE_BYTES = 43220;

describe("Switzer webfont", () => {
  it("keeps the official unmodified variable woff2", () => {
    const font = readFileSync(
      "src/assets/fonts/switzer/Switzer-Variable.woff2",
    );
    expect(font.subarray(0, 4).toString("ascii")).toBe("wOF2");
    expect(font.length).toBe(SWITZER_VARIABLE_BYTES);
  });
});
