import { describe, expect, it } from "vitest";

import { seoPreviewTitle } from "../../studio/components/seo-preview-title";

describe("Studio SEO title preview", () => {
  it("puts the brand first on the homepage document", () => {
    expect(
      seoPreviewTitle("Aleksandra Olesiewicz — dietetyczka kliniczna", "/"),
    ).toEqual({
      title: "Aleksandra Olesiewicz | dietetyczka kliniczna",
      brandOmitted: false,
    });
  });

  it("puts the brand last on an inner document", () => {
    expect(
      seoPreviewTitle("Polityka prywatności", "/polityka-prywatnosci/"),
    ).toEqual({
      title: "Polityka prywatności | Aleksandra Olesiewicz",
      brandOmitted: false,
    });
  });

  it("treats a document without a public path as an inner page", () => {
    expect(seoPreviewTitle("Kontakt", null).title).toBe(
      "Kontakt | Aleksandra Olesiewicz",
    );
  });

  it("keeps a long topic and reports the omitted brand", () => {
    const source = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    expect(seoPreviewTitle(source, "/temat/")).toEqual({
      title: source,
      brandOmitted: true,
    });
  });
});
