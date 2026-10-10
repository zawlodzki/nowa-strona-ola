import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapHomepage, shellLinks } from "../../src/content/map-homepage";
import {
  serializePage,
  serializeSection,
} from "../../src/content/serialize-sections";
import {
  assertKnownSections,
  knownSectionTypes,
} from "../../src/content/sections";
import { validateDemoField } from "../../src/lib/validate-demo";
import { getPage, getSiteSettings } from "../../src/sanity/repository";
import { formatPriceGross, formatServicePrice } from "../../src/lib/offer";

describe("homepage 3a fixtures", () => {
  it("maps the Polish homepage in the 3a section order", async () => {
    const page = await getPage("pl", "home", { environment: {} });
    expect(page.sections?.map((section) => section?._type)).toEqual([
      "heroSection",
      "audienceSection",
      "metricsSection",
      "textImageSection",
      "ebooksSection",
      "serviceOfferSection",
      "testimonialsSection",
      "formSection",
    ]);
    const view = mapHomepage(page, "pl");
    expect(view.hero.title).toContain("Zrozum swoje ciało");
    expect(view.audience.title).toBe("Z kim pracuję");
    expect(view.audience.items.map((item) => item.title)).toEqual([
      "PCOS",
      "Insulinooporność",
      "Szczupła, a jednak PCOS",
      "Perimenopauza",
    ]);
    expect(view.audience.items.every((item) => item.icon === "arrow")).toBe(
      true,
    );
    expect(view.approach.items[0]?.value).toBe(450);
    expect(view.ebooks.items).toHaveLength(6);
    expect(view.ebooks.items.every((item) => item.priceGross === 97)).toBe(
      true,
    );
    expect(view.ebooks.items[0]?.href).toBe("/ebooki/suplementy-w-pcos/");
    expect(view.ebooks.collection?.href).toBe("/ebooki/");
    expect(view.ebooks.items[0]?.slug).toBe("suplementy-w-pcos");
    expect(view.consultation.action.href).toBe("https://cal.com");
    expect(view.consultation.priceLabel).toBe("450 zł / 60 minut");
    expect(view.testimonials.items).toHaveLength(6);
    expect(view.testimonials.items.every((item) => item.anonymous)).toBe(true);
    expect(view.newsletter.fields.map((field) => field.name)).toEqual([
      "email",
      "consent",
    ]);
    expect(view.newsletter.fields[0]?.label).toBe("Twój adres e-mail");
    expect(view.newsletter.fields[0]?.placeholder).toBe("np. ola@przyklad.pl");
    expect(view.ebooks.items.map((item) => item.coverTone)).toEqual([
      "light",
      "cherry",
      "light",
      "light",
      "cherry",
      "light",
    ]);
  });

  it("does not use Polish copy under the English homepage", async () => {
    const page = await getPage("en", "home", { environment: {} });
    const view = mapHomepage(page, "en");
    expect(view.hero.title).toContain("Understand your body");
    expect(view.hero.lead).not.toMatch(/Jestem Ola/);
    expect(view.audience.title).toBe("Who I work with");
    expect(view.audience.items.map((item) => item.title)).toEqual([
      "PCOS",
      "Insulin resistance",
      "Slim, and still PCOS",
      "Perimenopause",
    ]);
    expect(view.newsletter.submit).toBe("I want the newsletter");
  });
});

describe("section serializers", () => {
  it("serializes homepage markdown with prices and anonymous labels", async () => {
    const page = await getPage("pl", "home", { environment: {} });
    const markdown = serializePage(page, "pl");
    expect(markdown).toContain("450+");
    expect(markdown).toContain("97 zł brutto");
    expect(markdown).toContain("/ebooki/suplementy-w-pcos/");
    expect(markdown).toContain("Opinia o dotychczasowej współpracy");
    expect(markdown).toContain("Zarezerwuj konsultację");
    expect(markdown).toContain("## Z kim pracuję");
    expect(markdown).toContain("### Szczupła, a jednak PCOS");
  });

  it("drops the retired logo strip from known sections", () => {
    expect(knownSectionTypes).toContain("audienceSection");
    expect(knownSectionTypes).not.toContain("logosSection" as never);
    expect(() =>
      assertKnownSections([{ _key: "home-logos", _type: "logosSection" }]),
    ).toThrow("Nieznany typ sekcji");
  });

  it("fails the build for an unknown section type", () => {
    expect(() =>
      serializeSection({ _key: "x", _type: "mysterySection" } as never, "pl"),
    ).toThrow("Nieznany typ sekcji");
    expect(knownSectionTypes).toContain("ebooksSection");
    expect(knownSectionTypes).toContain("serviceOfferSection");
    expect(() =>
      assertKnownSections([{ _key: "x", _type: "mysterySection" }]),
    ).toThrow("Nieznany typ sekcji");
  });
});

describe("site chrome 3a fixtures", () => {
  const profileHrefs = [
    "https://www.instagram.com/aleksandra_olesiewicz",
    "https://www.facebook.com/dietetykolesiewicz/",
    "https://www.tiktok.com/@aleksandra_olesiewicz",
  ];

  it("keeps mockup social and legal links in the shared footer", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const shell = shellLinks(settings);
    expect(shell.socialLinks.map((link) => link.label)).toEqual([
      "Instagram",
      "Facebook",
      "TikTok",
    ]);
    expect(shell.socialLinks.map((link) => link.href)).toEqual(profileHrefs);
    expect(shell.legalLinks.map((link) => link.label)).toEqual([
      "Polityka prywatności",
      "Regulamin",
    ]);
  });

  it("uses the same live profile hrefs in English site settings", async () => {
    const settings = await getSiteSettings("en", { environment: {} });
    const shell = shellLinks(settings);
    expect(shell.socialLinks.map((link) => link.href)).toEqual(profileHrefs);
    expect(shell.socialLinks.map((link) => link.label)).toEqual([
      "Instagram",
      "Facebook",
      "TikTok",
    ]);
  });
});

describe("offer formatting", () => {
  it("formats gross ebook prices and consultation time from data", () => {
    expect(formatPriceGross(97, "PLN", "pl")).toBe("97 zł brutto");
    expect(formatServicePrice(450, "PLN", 60, "pl")).toBe("450 zł / 60 minut");
  });
});

describe("demo field validation", () => {
  it("requires newsletter consent and a valid email", () => {
    expect(validateDemoField("email", "ola@example.com", true)).toBe(false);
    expect(validateDemoField("email", "ola", true)).toBe(true);
    expect(validateDemoField("checkbox", "on", true)).toBe(false);
    expect(validateDemoField("checkbox", "", true)).toBe(true);
  });
});

describe("example markdown files", () => {
  it("keeps examples for the new homepage section types", () => {
    const ebooks = readFileSync(
      "src/content/examples/ebooks-section.md",
      "utf8",
    );
    const offer = readFileSync(
      "src/content/examples/service-offer-section.md",
      "utf8",
    );
    expect(ebooks).toContain("97 zł brutto");
    expect(offer).toContain("450 zł / 60 minut");
  });
});
