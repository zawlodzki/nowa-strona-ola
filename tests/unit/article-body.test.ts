import { describe, expect, it } from "vitest";

import { articleBodyToHtml } from "../../src/content/portable-text";
import { toHero } from "../../src/content/map-sections";

describe("article body", () => {
  it("builds a table of contents from headings and rejects unknown blocks", () => {
    const { html, toc } = articleBodyToHtml([
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", text: "Najpierw decyzje", marks: [] }],
      },
      {
        _type: "block",
        _key: "p",
        style: "normal",
        children: [{ _type: "span", text: "Akapit.", marks: [] }],
      },
    ]);

    expect(toc).toEqual([
      { id: "najpierw-decyzje", text: "Najpierw decyzje", level: 2 },
    ]);
    expect(html).toContain('id="najpierw-decyzje"');
    expect(() =>
      articleBodyToHtml([{ _type: "unknownBlock", _key: "x" }]),
    ).toThrow("Nieznany blok artykułu");
  });
});

describe("section mapping", () => {
  it("rejects an unknown hero variant", () => {
    expect(() =>
      toHero({
        variant: "unknown",
        theme: "light",
        eyebrow: "Nadtytuł",
        title: "Tytuł",
        lead: "Lead",
        primary: { href: "/", label: "Dalej", emphasis: "default" },
      }),
    ).toThrow("Nieznany wariant hero");
  });
});
