import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { generateTokensCss } from "../../scripts/tokens.mjs";
import { catalogPath, homePath } from "../../src/lib/paths";

const tokens = JSON.parse(
  readFileSync("wonderful-design-system/tokens.json", "utf8"),
) as {
  font: { display: { value: string }; body: { value: string } };
};

describe("generateTokensCss", () => {
  const css = generateTokensCss(tokens);

  it("emits custom properties from tokens.json", () => {
    expect(css).toContain("--wf-color-ink: #171719;");
    expect(css).toContain("--wf-space-24: 24px;");
    expect(css).toContain(
      '--wf-font-display: "ABC Favorit Light", Arial, sans-serif;',
    );
  });

  it("keeps documented Arial fallbacks in the source tokens", () => {
    expect(tokens.font.display.value).toMatch(/Arial/);
    expect(tokens.font.body.value).toMatch(/Arial/);
  });
});

describe("localized paths", () => {
  it("keeps Polish at the root and English under /en/", () => {
    expect(homePath("pl")).toBe("/");
    expect(homePath("en")).toBe("/en/");
    expect(catalogPath("pl")).toBe("/ui/");
    expect(catalogPath("en")).toBe("/en/ui/");
  });
});
