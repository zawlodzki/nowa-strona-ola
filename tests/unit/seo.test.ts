import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { pageSeo } from "../../src/lib/seo/page-seo";
import { siteSeoData } from "../../src/lib/seo/site-data";

import { collectionSeoTitle } from "../../src/content/map-blog-collection";
import { mapConsultation } from "../../src/content/map-consultation";
import { mapEbook } from "../../src/content/map-ebook";
import {
  graphDocument,
  serializeJsonLd,
  siteEntities,
  type GraphContext,
} from "../../src/lib/seo/graph";
import { consultationGraph, ebookGraph } from "../../src/lib/seo/page-graphs";
import {
  absoluteUrl,
  isIndexingEnabled,
  pageEntityId,
  SITE_ORIGIN,
} from "../../src/lib/seo/site";
import { getEbook, getPage } from "../../src/sanity/repository";

const ctx = (path: string): GraphContext => ({
  lang: "pl",
  path,
  title: "Tytuł",
  site: siteSeoData(null),
});

describe("SEO site configuration", () => {
  it("uses the same origin as astro.config.mjs", () => {
    const config = readFileSync("astro.config.mjs", "utf8");
    expect(config).toContain(`site: "${SITE_ORIGIN}"`);
    expect(config).toContain('trailingSlash: "always"');
  });

  it("indexes only builds with SITE_INDEXING=production", () => {
    expect(isIndexingEnabled(undefined)).toBe(false);
    expect(isIndexingEnabled("staging")).toBe(false);
    expect(isIndexingEnabled("true")).toBe(false);
    expect(isIndexingEnabled("production")).toBe(true);
  });

  it("builds absolute URLs and page identifiers", () => {
    expect(absoluteUrl("/o-mnie/")).toBe(
      "https://aleksandraolesiewicz.com/o-mnie/",
    );
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(pageEntityId("/blog/a/", "article")).toBe(
      "https://aleksandraolesiewicz.com/blog/a/#article",
    );
  });
});

describe("JSON-LD graph", () => {
  it("emits the shared Person and WebSite with stable identifiers", () => {
    const [person, seller, website] = siteEntities(ctx("/"));
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": "https://aleksandraolesiewicz.com/#person",
      url: "https://aleksandraolesiewicz.com/o-mnie/",
      jobTitle: "Dietetyczka kliniczna",
    });
    expect(person?.sameAs).toContain(
      "https://www.instagram.com/aleksandra_olesiewicz",
    );
    expect(person).not.toHaveProperty("interactionStatistic");
    expect(seller).toMatchObject({
      "@type": "Organization",
      "@id": "https://aleksandraolesiewicz.com/#seller",
      legalName: "Wellbiz sp. z o.o.",
      taxID: "6793323800",
    });
    expect(website).toMatchObject({
      "@id": "https://aleksandraolesiewicz.com/#website",
      publisher: { "@id": "https://aleksandraolesiewicz.com/#person" },
    });
  });

  it("merges nodes with the same @id and drops undefined values", () => {
    const document = graphDocument([
      { "@type": "Person", "@id": "a", name: "A", image: undefined },
      { "@type": "Person", "@id": "a", jobTitle: "B" },
    ]);
    expect(document["@graph"]).toEqual([
      { "@type": "Person", "@id": "a", name: "A", jobTitle: "B" },
    ]);
  });

  it("escapes characters that could close the script element", () => {
    const json = serializeJsonLd(
      graphDocument([{ "@type": "Thing", name: "</script><b>&" }]),
    );
    expect(json).not.toContain("</script>");
    expect(json).not.toContain("<b>");
    expect(JSON.parse(json)["@graph"][0].name).toBe("</script><b>&");
  });

  it("models the consultation as Service with the visible Offer and FAQ", async () => {
    const page = await getPage("pl", "konsultacje", { environment: {} });
    const view = mapConsultation(page, "pl");
    const graph = consultationGraph(view, "online")(ctx("/konsultacje/"));
    const service = graph.find((node) => node["@type"] === "Service");
    expect(service).toMatchObject({
      "@id": "https://aleksandraolesiewicz.com/konsultacje/#service",
      provider: { "@id": "https://aleksandraolesiewicz.com/#person" },
      offers: {
        price: view.price.price,
        priceCurrency: "PLN",
        seller: { "@id": "https://aleksandraolesiewicz.com/#seller" },
      },
    });
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    expect(faq?.about).toEqual({ "@id": service?.["@id"] });
  });

  it("gives e-books an Offer only when they can be bought", async () => {
    const ebook = await getEbook("pl", "suplementy-w-pcos", {
      environment: {},
    });
    const view = mapEbook(ebook, "pl");
    const product = (availability: typeof view.availability) =>
      ebookGraph({
        ...view,
        availability,
        checkoutUrl: "https://buy.stripe.com/test",
      })(ctx(view.href)).find((node) =>
        [node["@type"]].flat().includes("Product"),
      );
    expect(product("planned")).not.toHaveProperty("offers");
    expect(product("paused")).not.toHaveProperty("offers");
    expect(product("available")?.offers).toMatchObject({
      availability: "https://schema.org/InStock",
      url: "https://buy.stripe.com/test",
    });
    expect(product("presale")?.offers).toMatchObject({
      availability: "https://schema.org/PreOrder",
    });
    expect(product("planned")).toMatchObject({
      "@type": ["Product", "Book"],
      bookFormat: "https://schema.org/EBook",
    });
  });
});

describe("collection titles", () => {
  it("makes category and pagination titles unique", () => {
    expect(collectionSeoTitle("Blog — A", "pl")).toBe("Blog — A");
    expect(collectionSeoTitle("Blog — A", "pl", "PMOS (PCOS)")).toBe(
      "PMOS (PCOS) — Blog — A",
    );
    expect(collectionSeoTitle("Blog — A", "pl", undefined, 2)).toBe(
      "Blog — A — strona 2",
    );
  });
});

describe("Sanity SEO fields (SEO-4)", () => {
  it("prefers siteSettings.siteOwner and seller over repo constants", () => {
    const site = siteSeoData({
      language: "pl",
      siteOwner: {
        name: "Aleksandra Olesiewicz",
        role: "Dietetyczka kliniczna",
        educationInstitution: null,
        occupationCode: "2265",
        sameAs: ["https://www.instagram.com/aleksandra_olesiewicz"],
        knowsAbout: [
          {
            title: "PMOS (PCOS)",
            sameAs: ["https://www.wikidata.org/wiki/Q1"],
          },
        ],
        credentials: [
          {
            name: "Dyplom",
            category: "degree",
            institution: "ŚUM",
            institutionUrl: null,
            year: 2020,
          },
        ],
        photo: null,
      },
      seller: {
        legalName: "Firma sp. z o.o.",
        street: "ul. A 1",
        postalCode: "00-001",
        city: "Warszawa",
        nip: "1234567890",
      },
    } as unknown as Parameters<typeof siteSeoData>[0]);
    expect(site.person.sameAs).toEqual([
      "https://www.instagram.com/aleksandra_olesiewicz",
    ]);
    expect(site.person.knowsAbout).toEqual([
      { name: "PMOS (PCOS)", sameAs: ["https://www.wikidata.org/wiki/Q1"] },
    ]);
    expect(site.person.portrait).toBe("about");
    expect(site.seller.legalName).toBe("Firma sp. z o.o.");
    const [person, seller] = siteEntities({ ...ctx("/"), site });
    expect(person?.knowsAbout).toEqual([
      {
        "@type": "Thing",
        name: "PMOS (PCOS)",
        sameAs: ["https://www.wikidata.org/wiki/Q1"],
      },
    ]);
    expect(person?.hasCredential).toHaveLength(1);
    expect(seller?.taxID).toBe("1234567890");
    expect(seller?.identifier).toEqual([]);
  });

  it("falls back to the public credentials shown on „O mnie”", () => {
    const [person] = siteEntities(ctx("/"));
    const credentials = person?.hasCredential as Record<string, unknown>[];
    expect(credentials).toHaveLength(7);
    expect(credentials[0]).toEqual({
      "@type": "EducationalOccupationalCredential",
      name: "Dietetyka, specjalność dietetyka kliniczna",
      credentialCategory: "degree",
      educationalLevel: "Licencjat",
      recognizedBy: {
        "@type": "CollegeOrUniversity",
        name: "Śląski Uniwersytet Medyczny w Katowicach",
        url: "https://sum.edu.pl/",
        department: {
          "@type": "Organization",
          name: "Wydział Zdrowia Publicznego w Bytomiu",
        },
      },
      dateCreated: "2025",
    });
    // Trainers are people: recognizedBy accepts organizations only.
    expect(credentials[1]).not.toHaveProperty("recognizedBy");
    expect(person?.alumniOf).toEqual([
      expect.objectContaining({
        name: "Śląski Uniwersytet Medyczny w Katowicach",
      }),
      expect.objectContaining({
        name: "Szpital Powiatowy w Limanowej im. Miłosierdzia Bożego",
      }),
      expect.objectContaining({
        name: "Samodzielny Publiczny Zakład Opieki Zdrowotnej w Myślenicach",
      }),
    ]);
    expect(person?.sameAs).toHaveLength(3);
  });

  it("keeps Sanity credentials authoritative when siteOwner exists", () => {
    const site = siteSeoData({
      siteOwner: { name: "Aleksandra Olesiewicz", credentials: [] },
    } as unknown as Parameters<typeof siteSeoData>[0]);
    const [person] = siteEntities({ ...ctx("/"), site });
    expect(person).not.toHaveProperty("hasCredential");
    expect(person?.alumniOf).toHaveLength(1);
  });

  it("applies seo.noindex and seo.ogImage of a document", () => {
    const settings = { language: "pl" } as Parameters<typeof pageSeo>[0];
    const hidden = pageSeo(settings, { noindex: true }, { path: "/x/" });
    expect(hidden).toMatchObject({ noindex: true, markdown: false });
    const image = pageSeo(
      settings,
      { ogImage: { src: "https://cdn.sanity.io/a.jpg", alt: "A" } },
      { path: "/x/", image: { src: "food" } },
    );
    expect(image.shareImage).toEqual({
      src: "https://cdn.sanity.io/a.jpg",
      alt: "A",
    });
    expect(image.image).toEqual({ src: "food" });
    expect(image.noindex).toBe(false);
  });

  it("adds filled service fields to the consultation Service", async () => {
    const page = await getPage("pl", "konsultacje", { environment: {} });
    const view = mapConsultation(page, "pl");
    const withFields = {
      ...view,
      price: {
        ...view.price,
        serviceType: "Konsultacja dietetyczna",
        channel: "online" as const,
        audience: "Kobiety z PMOS (PCOS)",
        deliverables: ["Plan pierwszych kroków"],
        termsPath: "/regulamin/",
      },
    };
    const service = consultationGraph(
      withFields,
      "online",
    )(ctx("/konsultacje/")).find((node) => node["@type"] === "Service");
    expect(service).toMatchObject({
      serviceType: "Konsultacja dietetyczna",
      availableChannel: { "@type": "ServiceChannel" },
      audience: { audienceType: "Kobiety z PMOS (PCOS)" },
      serviceOutput: [{ "@type": "Thing", name: "Plan pierwszych kroków" }],
      termsOfService: "https://aleksandraolesiewicz.com/regulamin/",
    });
    const plain = consultationGraph(
      view,
      "online",
    )(ctx("/konsultacje/")).find((node) => node["@type"] === "Service");
    expect(plain).not.toHaveProperty("serviceOutput");
  });
});
