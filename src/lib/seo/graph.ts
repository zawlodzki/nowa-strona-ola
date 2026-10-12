import type { Locale } from "@ola/shared";

import { credentialLevelLabel, credentialTitle } from "@/content/credentials";
import { catalogText } from "@/lib/catalog-text";
import { aboutPath, homePath } from "@/lib/paths";
import type { SiteSeoData } from "@/lib/seo/site-data";
import {
  absoluteUrl,
  entityId,
  htmlLang,
  pageEntityId,
  SITE_NAME,
} from "@/lib/seo/site";

export interface JsonLdNode {
  "@type": string | string[];
  "@id"?: string;
  [key: string]: unknown;
}

export interface JsonLdDocument {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

/** Data available to every page graph after images are resolved. */
export interface GraphContext {
  lang: Locale;
  /** Canonical path of the page, e.g. `/blog/slug/`. */
  path: string;
  title: string;
  description?: string;
  /** Absolute URL of the page image (OG image), when the page has one. */
  imageUrl?: string;
  /** Absolute URL of the person portrait. */
  personImageUrl?: string;
  /** Shared Person and seller data (Sanity siteSettings with fallbacks). */
  site: SiteSeoData;
}

export interface LinkItem {
  href: string;
  label: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export function ref(id: string): { "@id": string } {
  return { "@id": id };
}

export function webPageId(path: string): string {
  return pageEntityId(path, "webpage");
}

export function breadcrumbId(path: string): string {
  return pageEntityId(path, "breadcrumb");
}

const oneLine = (value: string) => value.replace(/\s*\n\s*/g, " ").trim();

/** Person, seller and WebSite: emitted on every page, referenced by `@id`. */
export function siteEntities(ctx: GraphContext): JsonLdNode[] {
  const { lang } = ctx;
  const { person, seller } = ctx.site;
  return [
    {
      "@type": "Person",
      "@id": entityId.person,
      name: person.name,
      ...(person.alternateName ? { alternateName: person.alternateName } : {}),
      url: absoluteUrl(aboutPath(lang)),
      ...(ctx.personImageUrl ? { image: ctx.personImageUrl } : {}),
      jobTitle: person.jobTitle,
      description: person.description,
      hasOccupation: {
        "@type": "Occupation",
        name: person.jobTitle,
        ...(person.occupationCode
          ? {
              occupationalCategory: {
                "@type": "CategoryCode",
                codeValue: person.occupationCode,
                inCodeSet: "ISCO-08",
              },
            }
          : {}),
      },
      // schema.org alumniOf accepts any Organization: university first,
      // then earlier workplaces. Those workplaces are not rows on „O mnie”.
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: person.alumniOf.name,
          ...(person.alumniOf.url ? { url: person.alumniOf.url } : {}),
        },
        ...person.experience.map((item) => ({
          "@type": "Organization",
          name: item.organization,
          ...(item.url ? { url: item.url } : {}),
        })),
      ],
      knowsAbout: person.knowsAbout.map((topic) =>
        topic.sameAs.length
          ? { "@type": "Thing", name: topic.name, sameAs: topic.sameAs }
          : topic.name,
      ),
      // Public credentials. educationalLevel stays in JSON-LD and is not a row on „O mnie”.
      ...(person.credentials.length
        ? {
            hasCredential: person.credentials.map((credential) => {
              const level = credentialLevelLabel(credential, lang);
              return {
                "@type": "EducationalOccupationalCredential",
                name: credentialTitle(credential, lang),
                credentialCategory: credential.category,
                ...(level ? { educationalLevel: level } : {}),
                // recognizedBy is Organization-only; trainers stay in the name list on the page.
                ...(credential.issuerKind === "organization"
                  ? {
                      recognizedBy: {
                        "@type":
                          credential.category === "degree"
                            ? "CollegeOrUniversity"
                            : "Organization",
                        name: credential.institution,
                        ...(credential.institutionUrl
                          ? { url: credential.institutionUrl }
                          : {}),
                        ...(credential.department
                          ? {
                              department: {
                                "@type": "Organization",
                                name: credential.department,
                              },
                            }
                          : {}),
                      },
                    }
                  : {}),
                ...(credential.year
                  ? { dateCreated: String(credential.year) }
                  : {}),
              };
            }),
          }
        : {}),
      sameAs: person.sameAs,
    },
    {
      "@type": "Organization",
      "@id": entityId.seller,
      name: seller.legalName,
      legalName: seller.legalName,
      address: {
        "@type": "PostalAddress",
        streetAddress: seller.street,
        postalCode: seller.postalCode,
        addressLocality: seller.city,
        addressCountry: "PL",
      },
      ...(seller.email ? { email: seller.email } : {}),
      taxID: seller.nip,
      identifier: [
        ...(seller.krs
          ? [{ "@type": "PropertyValue", propertyID: "KRS", value: seller.krs }]
          : []),
        ...(seller.regon
          ? [
              {
                "@type": "PropertyValue",
                propertyID: "REGON",
                value: seller.regon,
              },
            ]
          : []),
      ],
    },
    {
      "@type": "WebSite",
      "@id": entityId.website,
      url: absoluteUrl(homePath(lang)),
      name: SITE_NAME,
      inLanguage: htmlLang[lang],
      publisher: ref(entityId.person),
    },
  ];
}

export function webPage(
  ctx: GraphContext,
  type: string = "WebPage",
  extra: Record<string, unknown> = {},
): JsonLdNode {
  return {
    "@type": type,
    "@id": webPageId(ctx.path),
    url: absoluteUrl(ctx.path),
    name: oneLine(ctx.title),
    ...(ctx.description ? { description: oneLine(ctx.description) } : {}),
    inLanguage: htmlLang[ctx.lang],
    isPartOf: ref(entityId.website),
    ...(ctx.imageUrl
      ? { primaryImageOfPage: { "@type": "ImageObject", url: ctx.imageUrl } }
      : {}),
    ...extra,
  };
}

export function breadcrumbList(path: string, items: LinkItem[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: oneLine(item.label),
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqPage(
  ctx: GraphContext,
  items: QuestionAnswer[],
  about?: string,
): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": pageEntityId(ctx.path, "faq"),
    inLanguage: htmlLang[ctx.lang],
    isPartOf: ref(webPageId(ctx.path)),
    ...(about ? { about: ref(about) } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function itemList(path: string, items: LinkItem[]): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": pageEntityId(path, "itemlist"),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.href),
      name: oneLine(item.label),
    })),
  };
}

/** Minimal Blog node so pages inside the blog can reference `#blog` locally. */
export function blogNode(lang: Locale, blogHref: string, name: string) {
  return {
    "@type": "Blog",
    "@id": entityId.blog,
    url: absoluteUrl(blogHref),
    name,
    inLanguage: htmlLang[lang],
    publisher: ref(entityId.person),
  } satisfies JsonLdNode;
}

/** One `@graph`; nodes sharing an `@id` are merged (later keys win). */
export function graphDocument(nodes: JsonLdNode[]): JsonLdDocument {
  const merged: JsonLdNode[] = [];
  const byId = new Map<string, JsonLdNode>();
  for (const node of nodes) {
    const clean = stripUndefined(node) as JsonLdNode;
    const id = clean["@id"];
    const existing = id ? byId.get(id) : undefined;
    if (existing) {
      Object.assign(existing, clean);
      continue;
    }
    merged.push(clean);
    if (id) byId.set(id, clean);
  }
  return { "@context": "https://schema.org", "@graph": merged };
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefined(entry)]),
    );
  }
  return value;
}

/** JSON for a `<script>` element: escapes characters that could end it. */
export function serializeJsonLd(document: JsonLdDocument): string {
  return catalogText(JSON.stringify(document))
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/[\u2028\u2029]/g, (char) =>
      char === "\u2028" ? "\\u2028" : "\\u2029",
    );
}
