import { describe, expect, it } from "vitest";

import { presentationResolve } from "../../studio/presentation";
import { presentationEditIntent } from "../../studio/presentation-intent";

const locations = presentationResolve.locations;

describe("presentationEditIntent", () => {
  it("opens a Polish article draft on its blog page", () => {
    expect(
      presentationEditIntent({
        documentId: "drafts.article-1",
        documentType: "article",
        selected: { title: "Magnez", slug: "magnez", language: "pl" },
        locations,
      }),
    ).toEqual({
      intent: "edit",
      params: {
        id: "article-1",
        type: "article",
        mode: "presentation",
        preview: "/blog/magnez/",
      },
    });
  });

  it("opens an English article on the English blog route", () => {
    expect(
      presentationEditIntent({
        documentId: "versions.summer.article-2",
        documentType: "article",
        selected: { title: "Magnesium", slug: "magnesium", language: "en" },
        locations,
      }),
    ).toEqual({
      intent: "edit",
      params: {
        id: "article-2",
        type: "article",
        mode: "presentation",
        preview: "/en/blog/magnesium/",
      },
    });
  });

  it("opens a complete article and stays closed when the page cannot be named", () => {
    expect(
      presentationEditIntent({
        documentId: "article-3",
        documentType: "article",
        selected: { title: "Szkic", slug: "szkic", language: "pl" },
        locations,
      }),
    ).toEqual({
      intent: "edit",
      params: {
        id: "article-3",
        type: "article",
        mode: "presentation",
        preview: "/blog/szkic/",
      },
    });
    expect(
      presentationEditIntent({
        documentId: "article-3",
        documentType: "article",
        selected: { title: "Szkic", language: "pl" },
        locations,
      }),
    ).toBeNull();
    expect(
      presentationEditIntent({
        documentId: "drafts.",
        documentType: "article",
        selected: { title: "Szkic", slug: "szkic", language: "pl" },
        locations,
      }),
    ).toBeNull();
  });

  it("uses the same resolvers for pages, ebooks, and legal pages", () => {
    expect(
      presentationEditIntent({
        documentId: "page-home",
        documentType: "page",
        selected: { title: "Start", slug: "home", language: "pl" },
        locations,
      })?.params.preview,
    ).toBe("/");
    expect(
      presentationEditIntent({
        documentId: "page-en",
        documentType: "page",
        selected: { title: "Home", slug: "home", language: "en" },
        locations,
      })?.params.preview,
    ).toBe("/en/");
    expect(
      presentationEditIntent({
        documentId: "ebook-1",
        documentType: "ebook",
        selected: { title: "Poradnik", slug: "poradnik", language: "pl" },
        locations,
      })?.params.preview,
    ).toBe("/ebooki/poradnik/");
    expect(
      presentationEditIntent({
        documentId: "legal-1",
        documentType: "legalPage",
        selected: {
          title: "Polityka",
          slug: "polityka-prywatnosci",
          language: "en",
        },
        locations,
      })?.params.preview,
    ).toBe("/en/polityka-prywatnosci/");
  });

  it("stays closed for types without a location resolver", () => {
    expect(
      presentationEditIntent({
        documentId: "settings-pl",
        documentType: "siteSettings",
        selected: { title: "Ustawienia", language: "pl" },
        locations,
      }),
    ).toBeNull();
    expect(
      presentationEditIntent({
        documentId: "author-1",
        documentType: "author",
        selected: { title: "Ola", slug: "ola", language: "pl" },
        locations,
      }),
    ).toBeNull();
  });
});
