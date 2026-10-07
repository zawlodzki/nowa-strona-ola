import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapEbookCollection } from "../../src/content/map-ebook-collection";
import { serializeEbookCollection } from "../../src/content/serialize-ebook-collection";
import { knownSectionTypes } from "../../src/content/sections";
import { parseContentPath } from "../../src/lib/content-path";
import { ebookCoverArt } from "../../src/lib/ebook-covers";
import { ebookCollectionPath, ebookPath } from "../../src/lib/paths";
import { getPage, listEbooks } from "../../src/sanity/repository";

describe("ebook collection 3a fixtures", () => {
  it("maps six shared ebook documents with prices, topics and landing hrefs", async () => {
    const page = await getPage("pl", "ebooki", { environment: {} });
    const ebooks = await listEbooks("pl", { environment: {} });
    const view = mapEbookCollection(page, ebooks, "pl");
    expect(view.collection.variant).toBe("cherry3a");
    expect(view.collection.title).toContain("Więcej jasności");
    expect(view.collection.items).toHaveLength(6);
    expect(view.counts).toEqual({ all: 6, pcos: 3, perimenopause: 3 });
    expect(view.collection.items.every((item) => item.priceGross === 97)).toBe(
      true,
    );
    expect(
      view.collection.items.every((item) => item.availability === "planned"),
    ).toBe(true);
    expect(view.collection.items[0]?.href).toBe(
      ebookPath("pl", "suplementy-w-pcos"),
    );
    expect(view.collection.items.map((item) => item.href)).toEqual(
      ebooks.map((ebook) => ebookPath("pl", ebook.slug ?? "")),
    );
    expect(view.isEmpty).toBe(false);
    expect(view.alternateHref).toBe("/en/ebooks/");
    expect(view.collection.items.map((item) => item.coverTone)).toEqual([
      "light",
      "cherry",
      "light",
      "light",
      "cherry",
      "light",
    ]);
  });

  it("does not use Polish copy under the English collection", async () => {
    const page = await getPage("en", "ebooks", { environment: {} });
    const ebooks = await listEbooks("en", { environment: {} });
    const view = mapEbookCollection(page, ebooks, "en");
    expect(view.href).toBe("/en/ebooks/");
    expect(view.collection.title).toContain("More clarity");
    expect(view.collection.lead).not.toMatch(/Więcej jasności|swoim tempie/);
    expect(view.collection.items[0]?.href).toBe(
      "/en/ebooks/supplements-in-pcos/",
    );
  });

  it("shows an empty collection without filters and empty category state", async () => {
    const page = await getPage("pl", "ebooki", { environment: {} });
    const empty = mapEbookCollection(page, [], "pl");
    expect(empty.isEmpty).toBe(true);
    expect(empty.availableTopics).toEqual([]);
    expect(empty.collection.emptyMessage).toMatch(/nie ma opublikowanych/);
    const categoryEmpty = mapEbookCollection(page, [], "pl", "pcos");
    expect(categoryEmpty.isCategoryEmpty).toBe(true);
    expect(categoryEmpty.filter).toBe("pcos");
  });

  it("rejects an unknown collection variant", async () => {
    const page = structuredClone(
      await getPage("pl", "ebooki", { environment: {} }),
    );
    const section = page.sections?.[0];
    if (!section || section._type !== "ebookCollectionSection") {
      throw new Error("expected collection section");
    }
    (section as { variant: string }).variant = "wonderful";
    const ebooks = await listEbooks("pl", { environment: {} });
    expect(() => mapEbookCollection(page, ebooks, "pl")).toThrow(
      "Nieznany wariant kolekcji",
    );
  });
});

describe("ebook collection serializers", () => {
  it("serializes the full catalog with prices, status and landing links", async () => {
    const page = await getPage("pl", "ebooki", { environment: {} });
    const ebooks = await listEbooks("pl", { environment: {} });
    const markdown = serializeEbookCollection(page, ebooks, "pl");
    expect(markdown).toContain("97 zł brutto");
    expect(markdown).toContain("Zapowiedź");
    expect(markdown).toContain("/ebooki/suplementy-w-pcos/");
    expect(markdown).toContain("/ebooki/badania-ktore-maja-sens/");
    expect(markdown).toContain("PCOS");
    expect(markdown).toContain("Perimenopauza");
  });

  it("keeps the markdown example for the collection", async () => {
    const example = readFileSync(
      "src/content/examples/ebook-collection.md",
      "utf8",
    ).trim();
    const page = await getPage("pl", "ebooki", { environment: {} });
    const ebooks = await listEbooks("pl", { environment: {} });
    expect(serializeEbookCollection(page, ebooks, "pl")).toBe(example);
    expect(knownSectionTypes).toContain("ebookCollectionSection");
  });
});

describe("ebook collection routes", () => {
  it("parses PL/EN collection and category paths and rejects Polish under English", () => {
    expect(parseContentPath("ebooki")).toEqual({
      kind: "ebookCollection",
      language: "pl",
      topic: "all",
    });
    expect(parseContentPath("ebooki/kategoria/pcos")).toEqual({
      kind: "ebookCollection",
      language: "pl",
      topic: "pcos",
    });
    expect(parseContentPath("en/ebooks/category/perimenopause")).toEqual({
      kind: "ebookCollection",
      language: "en",
      topic: "perimenopause",
    });
    expect(parseContentPath("en/ebooki")).toEqual({ kind: "unknown" });
    expect(ebookCollectionPath("pl", "pcos")).toBe("/ebooki/kategoria/pcos/");
  });
});

describe("ebook collection covers", () => {
  it("maps production slugs to mockup art and refuses silent substitutes", () => {
    expect(ebookCoverArt("szczupla-a-jednak-pcos")).toEqual({
      kind: "nutrition",
      variant: "default",
    });
    expect(ebookCoverArt("suplementy-w-pcos").kind).toBe("decisions");
    expect(() => ebookCoverArt("unknown-slug")).toThrow(
      "Brak mapowania okładki",
    );
  });
});
