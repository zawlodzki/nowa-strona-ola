import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  generateTokensCss,
  generateLegacyAliasesCss,
  hexToOklch,
} from "../../scripts/tokens.mjs";
import { alternatePath, catalogPath, homePath } from "../../src/lib/paths";

const tokens = JSON.parse(
  readFileSync("design-system/tokens.json", "utf8"),
) as {
  tokens: {
    font: { value: string };
    accent: { value: string };
    "accent-on-primary": { value: string };
    "accent-on-light": { value: string };
    cta: { value: string };
    "on-cta": { value: string };
    surface: { value: string };
    background: { value: string };
    "cover-primary": { value: string };
  };
  dark: { accent: string; background: string };
};

describe("generateTokensCss", () => {
  const css = generateTokensCss(tokens);

  it("emits custom properties from tokens.json", () => {
    expect(css).toContain("--ao-ink: #6b2320;");
    expect(css).not.toContain("--wf-");
    expect(generateLegacyAliasesCss(tokens)).toContain(
      "--wf-color-ink: var(--ao-ink);",
    );
    expect(css).toContain("--ao-space-24: 24px;");
    expect(css).toContain('--ao-font: "Switzer", Arial, sans-serif;');
    expect(css).toContain("--ao-accent: #99312f;");
    expect(css).toContain("--ao-accent-on-primary: #7ec850;");
    expect(css).toContain("--ao-accent-on-light: #7ec850;");
    expect(css).toContain("--ao-cta: #7ec850;");
    expect(css).toContain("--ao-on-cta: #16300a;");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toMatch(/\[data-theme="dark"\][\s\S]*--ao-accent: #7ec850;/);
  });

  it("keeps theme colors paired with a fallback and achromatic hues missing", () => {
    expect(css).toContain("@supports not (color: light-dark(white, black))");
    expect(css).toContain(`--ao-background: light-dark(#fffffc, #261715);`);
    expect(css).toContain(`--ao-primary: light-dark(#99312f, #f0b3a8);`);
    // hexToOklch remains available for contrast tooling; achromatic still loses hue.
    expect(hexToOklch("#ffffff")).toMatch(/0 none\)$/);
    expect(hexToOklch("#000000")).toBe("oklch(0.000000000 0 none)");
  });

  it("keeps the text accent and green buttons at WCAG AA", () => {
    expect(
      contrastRatio(tokens.tokens.accent.value, tokens.tokens.background.value),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens.dark.accent, tokens.dark.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens.tokens.accent.value, tokens.tokens.surface.value),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(tokens.tokens["on-cta"].value, tokens.tokens.cta.value),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        tokens.tokens["accent-on-primary"].value,
        tokens.tokens["cover-primary"].value,
      ),
    ).toBeGreaterThanOrEqual(3);
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
