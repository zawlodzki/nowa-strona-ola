import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { contrastRatio, generateTokensCss } from "../../scripts/tokens.mjs";
import { alternatePath, catalogPath, homePath } from "../../src/lib/paths";

const tokens = JSON.parse(
  readFileSync("design-system/tokens.json", "utf8"),
) as {
  tokens: {
    font: { value: string };
    accent: { value: string };
    "accent-on-primary": { value: string };
    "accent-on-light": { value: string };
    background: { value: string };
  };
  dark: { accent: string; background: string };
};

describe("generateTokensCss", () => {
  const css = generateTokensCss(tokens);

  it("emits custom properties from tokens.json", () => {
    expect(css).toContain("--ao-ink: #70283f;");
    expect(css).toContain("--wf-color-ink: var(--ao-ink);");
    expect(css).toContain("--ao-space-24: 24px;");
    expect(css).toContain('--ao-font: "Switzer", Arial, sans-serif;');
    expect(css).toContain("--ao-accent: #53671B;");
    expect(css).toContain("--ao-accent-on-primary: #D8E78A;");
    expect(css).toContain("--ao-accent-on-light: #53671B;");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toMatch(/\[data-theme="dark"\][\s\S]*--ao-accent: #D8E78A;/);
  });

  it("keeps interactive matcha at WCAG AA against its canvas", () => {
    expect(
      contrastRatio(tokens.tokens.accent.value, tokens.tokens.background.value),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens.dark.accent, tokens.dark.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(tokens.tokens["accent-on-light"].value).toBe(
      tokens.tokens.accent.value,
    );
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
