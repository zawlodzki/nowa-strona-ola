import { describe, expect, it } from "vitest";

import { knownSectionTypes } from "../../src/content/sections";
import { metricFrame } from "../../src/lib/metrics";
import { revealDelay } from "../../src/lib/reveal";
import { catalogCopy, catalogToc } from "../../src/sections/catalog-examples";
import { catalogSectionIds } from "../../src/sections/types";

describe("catalog sections", () => {
  it("lists every planned section in both languages", () => {
    expect(catalogSectionIds).toHaveLength(18);
    expect(catalogSectionIds).toEqual(
      knownSectionTypes.map((type) =>
        type
          .replace(/Section$/, "")
          .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
      ),
    );
    for (const lang of ["pl", "en"] as const) {
      const copy = catalogCopy(lang);
      const toc = catalogToc(lang);
      expect(toc.map((item) => item.id)).toEqual([...catalogSectionIds]);
      for (const id of catalogSectionIds) {
        expect(copy.sections[id].length).toBeGreaterThan(0);
      }
    }
  });
});

describe("reveal delay", () => {
  it("caps stagger at 280 ms", () => {
    expect(revealDelay(0)).toBe(0);
    expect(revealDelay(4)).toBe(280);
    expect(revealDelay(9)).toBe(280);
  });
});

describe("metric frame", () => {
  it("starts at zero and ends on the target", () => {
    expect(metricFrame(0, 40)).toBe(0);
    expect(metricFrame(1, 40)).toBe(40);
  });
});
