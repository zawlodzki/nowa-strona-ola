import { describe, expect, it } from "vitest";

import { toAudience } from "../../src/content/map-sections";
import { audienceIconOptions } from "../../studio/schema-types/blocks/page-sections";
import { AUDIENCE_ICON_KEYS } from "../../src/sections/types";

const card = (title: string, icon?: string) => ({
  title,
  body: `${title} opis.`,
  icon,
});

describe("audience section mapper", () => {
  it("maps 4 to 6 cards with optional icons", () => {
    const content = toAudience({
      title: "Z kim pracuję",
      lead: null,
      items: [card("A", "arrow"), card("B", "check"), card("C"), card("D")],
    });
    expect(content.lead).toBeUndefined();
    expect(content.items.map((item) => item.icon)).toEqual([
      "arrow",
      "check",
      undefined,
      undefined,
    ]);
  });

  it("rejects fewer than 4 or more than 6 cards", () => {
    expect(() =>
      toAudience({ title: "X", items: [card("A"), card("B"), card("C")] }),
    ).toThrow("od 4 do 6 kart");
    expect(() =>
      toAudience({
        title: "X",
        items: ["A", "B", "C", "D", "E", "F", "G"].map((t) => card(t)),
      }),
    ).toThrow("od 4 do 6 kart");
  });

  it("rejects icon keys outside the site set", () => {
    expect(() =>
      toAudience({
        title: "X",
        items: [card("A", "logo"), card("B"), card("C"), card("D")],
      }),
    ).toThrow("Nieznana ikona");
  });

  it("keeps Studio icon options in sync with the renderer", () => {
    expect(audienceIconOptions.map((option) => option.value)).toEqual([
      ...AUDIENCE_ICON_KEYS,
    ]);
  });
});
