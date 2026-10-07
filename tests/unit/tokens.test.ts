import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { generateTokensCss } from "../../scripts/tokens.mjs";
import { alternatePath, catalogPath, homePath } from "../../src/lib/paths";

const tokens = JSON.parse(
  readFileSync("design-system/tokens.json", "utf8"),
) as {
  tokens: { font: { value: string } };
};

describe("generateTokensCss", () => {
  const css = generateTokensCss(tokens);

  it("emits custom properties from tokens.json", () => {
    expect(css).toContain("--ao-ink: #70283f;");
    expect(css).toContain("--wf-color-ink: var(--ao-ink);");
    expect(css).toContain("--ao-space-24: 24px;");
    expect(css).toContain('--ao-font: "Switzer", Arial, sans-serif;');
  });

  it("keeps documented Arial fallbacks in the source tokens", () => {
    expect(tokens.tokens.font.value).toMatch(/Switzer.*Arial/);
  });
});

describe("localized paths", () => {
  it("keeps Polish at the root and English under /en/", () => {
    expect(homePath("pl")).toBe("/");
    expect(homePath("en")).toBe("/en/");
    expect(catalogPath("pl")).toBe("/ui/");
    expect(catalogPath("en")).toBe("/en/ui/");
  });

  it("switches language without a Polish fallback on English routes", () => {
    expect(alternatePath("pl", "home")).toBe("/en/");
    expect(alternatePath("en", "home")).toBe("/");
    expect(alternatePath("pl", "catalog")).toBe("/en/ui/");
    expect(alternatePath("en", "catalog")).toBe("/ui/");
  });
});
