import { describe, expect, it } from "vitest";

import {
  articleBodyToHtml,
  articleBodyToMarkdown,
} from "../../src/content/portable-text";
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

    expect(toc).toEqual([{ id: "section-h2", text: "Najpierw decyzje" }]);
    expect(html).toContain('id="section-h2"');
    expect(html).not.toContain("<h3");
    const withSubheading = articleBodyToHtml([
      {
        _type: "block",
        _key: "h2",
        style: "h2",
        children: [{ _type: "span", text: "Najpierw decyzje", marks: [] }],
      },
      {
        _type: "block",
        _key: "h3",
        style: "h3",
        children: [{ _type: "span", text: "Szczegół", marks: [] }],
      },
    ]);
    expect(withSubheading.toc).toEqual([
      { id: "section-h2", text: "Najpierw decyzje" },
    ]);
    expect(withSubheading.html).toContain("<h3>Szczegół</h3>");
    expect(withSubheading.html).not.toContain('id="section-h3"');
    expect(() =>
      articleBodyToHtml([{ _type: "unknownBlock", _key: "x" }]),
    ).toThrow("Nieznany blok artykułu");
    expect(
      articleBodyToMarkdown([
        {
          _type: "block",
          _key: "h2",
          style: "h2",
          children: [{ _type: "span", text: "Najpierw decyzje", marks: [] }],
        },
      ]),
    ).toContain("## Najpierw decyzje");
    expect(() => articleBodyToMarkdown([{ _type: "mystery" }])).toThrow(
      "Nieznany blok artykułu",
    );
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
