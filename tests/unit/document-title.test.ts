import { describe, expect, it } from "vitest";

import {
  documentTitle,
  resolveDocumentTitle,
  titlePlacement,
} from "../../src/lib/seo/document-title";

describe("document title", () => {
  it("puts the brand first on the homepage", () => {
    expect(
      documentTitle(
        "Aleksandra Olesiewicz — dietetyczka kliniczna",
        titlePlacement("/", "pl"),
      ),
    ).toBe("Aleksandra Olesiewicz | dietetyczka kliniczna");
  });

  it("puts the brand last on an inner page", () => {
    expect(
      documentTitle(
        "Kontakt — Aleksandra Olesiewicz",
        titlePlacement("/kontakt/", "pl"),
      ),
    ).toBe("Kontakt | Aleksandra Olesiewicz");
  });

  it("keeps pipe titles that already place the brand last", () => {
    expect(
      documentTitle(
        "E-booki | Aleksandra Olesiewicz",
        titlePlacement("/ebooki/", "pl"),
      ),
    ).toBe("E-booki | Aleksandra Olesiewicz");
    expect(
      documentTitle(
        "Konsultacja dietetyczna 1:1 | Aleksandra Olesiewicz",
        titlePlacement("/konsultacje/", "pl"),
      ),
    ).toBe("Konsultacja dietetyczna 1:1 | Aleksandra Olesiewicz");
  });

  it("moves the brand to the end and joins the other segments", () => {
    expect(
      documentTitle(
        "O mnie — Aleksandra Olesiewicz | dietetyczka kliniczna",
        titlePlacement("/o-mnie/", "pl"),
      ),
    ).toBe("O mnie — dietetyczka kliniczna | Aleksandra Olesiewicz");
  });

  it("keeps both surrounding segments when the brand is in the middle", () => {
    expect(
      documentTitle(
        "Blog — Aleksandra Olesiewicz — strona 2",
        titlePlacement("/blog/strona/2/", "pl"),
      ),
    ).toBe("Blog — strona 2 | Aleksandra Olesiewicz");
  });

  it("appends the brand when the source has none", () => {
    const placement = titlePlacement("/polityka-prywatnosci/", "pl");
    expect(documentTitle("Polityka prywatności", placement)).toBe(
      "Polityka prywatności | Aleksandra Olesiewicz",
    );
    expect(resolveDocumentTitle("Polityka prywatności", placement)).toEqual({
      title: "Polityka prywatności | Aleksandra Olesiewicz",
      brandOmitted: false,
    });
  });

  it("returns a 50-character topic unchanged when the suffix would pass 60", () => {
    const source = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    expect(source).toHaveLength(50);
    const placement = titlePlacement("/temat/", "pl");
    expect(documentTitle(source, placement)).toBe(source);
    expect(resolveDocumentTitle(source, placement)).toEqual({
      title: source,
      brandOmitted: true,
    });
  });

  it("leaves a genitive product line unchanged", () => {
    expect(
      documentTitle(
        "PMOS | E-book Aleksandry Olesiewicz",
        titlePlacement("/ebooki/przyklad/", "pl"),
      ),
    ).toBe("PMOS | E-book Aleksandry Olesiewicz");
    expect(
      documentTitle(
        "Szczupła, a jednak PMOS | E-book Aleksandry Olesiewicz",
        titlePlacement("/ebooki/szczupla-a-jednak-pcos/", "pl"),
      ),
    ).toBe("Szczupła, a jednak PMOS | E-book Aleksandry Olesiewicz");
  });

  it("does not split the hyphen inside E-booki", () => {
    expect(
      documentTitle(
        "E-booki | Aleksandra Olesiewicz",
        titlePlacement("/ebooki/", "pl"),
      ),
    ).toBe("E-booki | Aleksandra Olesiewicz");
  });

  it("keeps an empty title empty", () => {
    expect(documentTitle("", titlePlacement("/", "pl"))).toBe("");
    expect(documentTitle("", titlePlacement(undefined, "pl"))).toBe("");
  });

  it("keeps a brand-only title as the brand", () => {
    expect(
      documentTitle("Aleksandra Olesiewicz", titlePlacement("/", "pl")),
    ).toBe("Aleksandra Olesiewicz");
    expect(
      documentTitle("Aleksandra Olesiewicz", titlePlacement("/kontakt/", "pl")),
    ).toBe("Aleksandra Olesiewicz");
  });
});

describe("title placement", () => {
  it("is home only for the locale homepage", () => {
    expect(titlePlacement("/", "pl")).toBe("home");
    expect(titlePlacement("/kontakt/", "pl")).toBe("inner");
    expect(titlePlacement(undefined, "pl")).toBe("inner");
  });
});
