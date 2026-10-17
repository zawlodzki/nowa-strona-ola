import { describe, expect, it } from "vitest";

import { regionById } from "../../src/content/template-regions";
import { assertTemplateRegion } from "../../scripts/check-regions.mjs";

const home = regionById("home");
const seed = "Zrozum swoje ciało.";

function assertCopy(html: string, text: string, label: string) {
  if (!html.includes(text)) {
    throw new Error(`${label}: missing fixture copy`);
  }
}

function homeFragment(classes: readonly string[], sentence: string) {
  const tags = classes
    .map((className) => `<section class="ao-section ${className}"></section>`)
    .join("\n");
  return `<main>\n${tags}\n<p>${sentence}</p>\n</main>`;
}

describe("template regions", () => {
  it("accepts a complete home fragment", () => {
    expect(home.classes).toEqual([
      "home3a",
      "home3a-portrait",
      "home3a-audience",
      "home3a-about",
      "home3a-results",
    ]);
    expect(() =>
      assertTemplateRegion({
        html: homeFragment(home.classes, seed),
        classes: home.classes,
        label: "home",
        seed,
        assertCopy,
      }),
    ).not.toThrow();
  });

  it("throws when the home fragment drops home3a-audience", () => {
    const classes = home.classes.filter(
      (className) => className !== "home3a-audience",
    );
    expect(() =>
      assertTemplateRegion({
        html: homeFragment(classes, seed),
        classes: home.classes,
        label: "home",
        seed,
        assertCopy,
      }),
    ).toThrow(/missing class home3a-audience/);
  });

  it("throws when the seed sentence is dropped and the classes remain", () => {
    expect(() =>
      assertTemplateRegion({
        html: homeFragment(home.classes, ""),
        classes: home.classes,
        label: "home",
        seed,
        assertCopy,
      }),
    ).toThrow(/missing fixture copy/);
  });
});
