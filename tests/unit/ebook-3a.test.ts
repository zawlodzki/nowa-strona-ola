import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapEbook } from "../../src/content/map-ebook";
import {
  serializeEbook,
  serializeEbookView,
} from "../../src/content/serialize-ebook";
import { getEbook } from "../../src/sanity/repository";
import { parseContentPath } from "../../src/lib/content-path";
import { ebookPath } from "../../src/lib/paths";

describe("ebook 3a fixtures", () => {
  it("maps the Polish PCOS landing from the shared ebook document", async () => {
    const ebook = await getEbook("pl", "suplementy-w-pcos", {
      environment: {},
    });
    const view = mapEbook(ebook, "pl");
    expect(view.title).toBe("Suplementy w PCOS");
    expect(view.subtitle).toBe("Decyzje, które mają sens");
    expect(view.topic).toBe("pcos");
    expect(view.availability).toBe("planned");
    expect(view.priceGross).toBe(97);
    expect(view.currency).toBe("PLN");
    expect(view.priceLabel).toBe("97 zł brutto");
    expect(view.href).toBe("/ebooki/suplementy-w-pcos/");
    expect(view.alternateHref).toBe("/en/ebooks/supplements-in-pcos/");
    expect(view.checkoutUrl).toBeUndefined();
    expect(view.landing.variant).toBe("cherry3a");
    expect(view.chapters).toHaveLength(7);
    expect(view.materials).toHaveLength(5);
    expect(view.landing.problemQuestions).toHaveLength(3);
    expect(view.landing.audienceItems).toHaveLength(4);
    expect(view.landing.testimonials.items).toHaveLength(2);
    expect(view.landing.testimonialsScope).toBe("cooperation");
    expect(view.landing.faq.items).toHaveLength(6);
    expect(view.landing.heroTitle).toContain("Zrób porządek");
  });

  it("does not use Polish copy under the English ebook route", async () => {
    const ebook = await getEbook("en", "supplements-in-pcos", {
      environment: {},
    });
    const view = mapEbook(ebook, "en");
    expect(view.href).toBe("/en/ebooks/supplements-in-pcos/");
    expect(view.landing.heroTitle).toContain("Put your supplements");
    expect(view.landing.heroLead).not.toMatch(/Zrób porządek|suplementami/);
    expect(view.priceLabel).toBe("97 PLN gross");
    expect(view.landing.faq.items).toHaveLength(6);
  });

  it("rejects an unknown landing variant", async () => {
    const ebook = structuredClone(
      await getEbook("pl", "suplementy-w-pcos", { environment: {} }),
    );
    if (!ebook.landing) throw new Error("expected landing");
    (ebook.landing as { variant: string }).variant = "wonderful";
    expect(() => mapEbook(ebook, "pl")).toThrow("Nieznany wariant landingu");
  });

  it("does not expose checkout for a planned ebook even if a URL is present", async () => {
    const ebook = structuredClone(
      await getEbook("pl", "suplementy-w-pcos", { environment: {} }),
    );
    ebook.checkoutUrl = "https://pay.example/pcos";
    const view = mapEbook(ebook, "pl");
    expect(view.availability).toBe("planned");
    expect(view.checkoutUrl).toBeUndefined();
  });
});

describe("ebook serializers", () => {
  it("serializes price, chapters, FAQ and cooperation context from the same data", async () => {
    const ebook = await getEbook("pl", "suplementy-w-pcos", {
      environment: {},
    });
    const markdown = serializeEbook(ebook, "pl");
    expect(markdown).toContain("97 zł brutto");
    expect(markdown).toContain("Zapowiedź");
    expect(markdown).toContain("Zacznij od swojej półki");
    expect(markdown).toContain("Czy mogę już kupić ebook?");
    expect(markdown).toContain("Opinie o dotychczasowej współpracy");
    expect(markdown).not.toMatch(/potwierdzenie zakupu|płatność przyjęta/i);
  });

  it("keeps the markdown example for the landing", () => {
    const example = readFileSync(
      "src/content/examples/ebook-landing.md",
      "utf8",
    );
    expect(example).toContain("97 zł brutto");
    expect(example).toContain("Zapowiedź");
  });

  it("round-trips the mapped view", async () => {
    const ebook = await getEbook("pl", "suplementy-w-pcos", {
      environment: {},
    });
    const view = mapEbook(ebook, "pl");
    expect(serializeEbookView(view, "pl")).toContain(view.chapters[0]?.title);
  });
});

describe("ebook routes", () => {
  it("parses PL/EN landing paths and rejects the Polish slug under English", () => {
    expect(parseContentPath("ebooki/suplementy-w-pcos")).toEqual({
      kind: "ebook",
      language: "pl",
      slug: "suplementy-w-pcos",
    });
    expect(parseContentPath("en/ebooks/supplements-in-pcos")).toEqual({
      kind: "ebook",
      language: "en",
      slug: "supplements-in-pcos",
    });
    expect(parseContentPath("en/ebooki/suplementy-w-pcos")).toEqual({
      kind: "unknown",
    });
    expect(ebookPath("pl", "suplementy-w-pcos")).toBe(
      "/ebooki/suplementy-w-pcos/",
    );
  });
});
