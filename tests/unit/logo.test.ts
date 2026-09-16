import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  logoMark,
  prepareLogoSvg,
  type LogoVariant,
} from "../../src/assets/brand/logo";

const brandDir = "src/assets/brand";

describe("logo source", () => {
  it("records Gambarino as the wordmark typeface for later edits", () => {
    expect(logoMark.font.family).toBe("Gambarino");
    expect(logoMark.font.style).toBe("Regular");
    expect(logoMark.font.source).toBe(
      "https://www.fontshare.com/fonts/gambarino",
    );
    expect(logoMark.text).toBe("aleksandra olesiewicz");
    expect(logoMark.colorHex).toBe("#171719");
  });

  it.each(Object.keys(logoMark.variants) as LogoVariant[])(
    "keeps outlined SVG for %s with a font comment",
    (variant) => {
      const files = logoMark.variants[variant];
      const svg = readFileSync(join(brandDir, files.svg), "utf8");
      expect(svg).toContain("Gambarino Regular");
      expect(svg).toContain(logoMark.font.source);
      expect(svg).toContain("src/assets/brand/logo.ts");
      expect(svg).toContain('fill="currentColor"');
    },
  );

  it("strips accessible names from decorative marks to avoid duplicate ids", () => {
    const markup =
      '<svg role="img" aria-labelledby="title" fill="currentColor"><title id="title">ao</title><path d="M"/></svg>';
    expect(prepareLogoSvg(markup, "monogram", true)).not.toMatch(/<title/);
    expect(prepareLogoSvg(markup, "monogram", false)).toContain(
      'id="logo-monogram-title"',
    );
  });
});
