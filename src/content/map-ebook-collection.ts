import type { Locale } from "@ola/shared";

import { ebookCollectionCopy } from "@/content/ebook-collection-seed";
import { assertKnownSections } from "@/content/sections";
import { toEbookCard, toFormCopy } from "@/content/map-sections";
import {
  ebookCollectionPath,
  parseEbookCollectionFilter,
  type EbookCollectionFilter,
} from "@/lib/paths";
import type { PageContent } from "@/sanity/repository";
import type {
  EbookCardContent,
  EbookCollectionContent,
  EbookTopic,
  FormCopy,
} from "@/sections/types";

type PageSection = NonNullable<PageContent["sections"]>[number];

function sectionOf<T extends PageSection["_type"]>(
  section: PageSection | undefined,
  type: T,
  language: Locale,
  index: number,
): Extract<PageSection, { _type: T }> {
  if (!section || section._type !== type) {
    throw new Error(
      `Kolekcja e-booków ${language}: sekcja ${index} ma być ${type}, jest ${section?._type ?? "brak"}.`,
    );
  }
  return section as Extract<PageSection, { _type: T }>;
}

export interface EbookCollectionView {
  language: Locale;
  href: string;
  alternateHref: string | null;
  seoTitle: string;
  seoDescription?: string;
  filter: EbookCollectionFilter;
  collection: EbookCollectionContent;
  newsletter: FormCopy;
  visibleItems: EbookCardContent[];
  counts: Record<"all" | EbookTopic, number>;
  availableTopics: EbookTopic[];
  isEmpty: boolean;
  isCategoryEmpty: boolean;
}

export function toEbookCollection(
  section: {
    variant?: string | null;
    title?: string | null;
    lead?: string | null;
    catalogTitle?: string | null;
    catalogLead?: string | null;
    findTopicLabel?: string | null;
    cardActionLabel?: string | null;
    note?: string | null;
    emptyMessage?: string | null;
    emptyCategoryMessage?: string | null;
  },
  items: EbookCardContent[],
): EbookCollectionContent {
  if (section.variant && section.variant !== "cherry3a") {
    throw new Error(
      `Nieznany wariant kolekcji e-booków: ${section.variant}. Zatrzymuję build.`,
    );
  }
  return {
    variant: "cherry3a",
    title: required(section.title, "tytuł kolekcji"),
    lead: required(section.lead, "lead kolekcji"),
    catalogTitle: required(section.catalogTitle, "tytuł katalogu"),
    catalogLead: required(section.catalogLead, "lead katalogu"),
    findTopicLabel: required(section.findTopicLabel, "odnośnik do katalogu"),
    cardActionLabel: required(section.cardActionLabel, "etykieta karty"),
    note: section.note ?? undefined,
    emptyMessage: required(section.emptyMessage, "komunikat pustej kolekcji"),
    emptyCategoryMessage: required(
      section.emptyCategoryMessage,
      "komunikat pustej kategorii",
    ),
    items,
  };
}

function required(value: string | null | undefined, label: string): string {
  if (!value) throw new Error(`Brakuje pola ${label}.`);
  return value;
}

export function mapEbookCards(
  ebooks: Parameters<typeof toEbookCard>[0][],
  language: Locale,
): EbookCardContent[] {
  return ebooks.map((ebook) => toEbookCard(ebook, language));
}

export function mapEbookCollection(
  page: PageContent,
  ebooks: Parameters<typeof toEbookCard>[0][],
  language: Locale,
  filter: string | null | undefined = "all",
): EbookCollectionView {
  assertKnownSections(page.sections);
  if (page.language !== language) {
    throw new Error(
      `Kolekcja e-booków ${language}: dokument ma język ${page.language}.`,
    );
  }
  const catalog = sectionOf(
    page.sections[0],
    "ebookCollectionSection",
    language,
    0,
  );
  const newsletter = sectionOf(page.sections[1], "formSection", language, 1);
  const items = mapEbookCards(ebooks, language);
  const selected = parseEbookCollectionFilter(filter);
  const counts = {
    all: items.length,
    pcos: items.filter((item) => item.topic === "pcos").length,
    perimenopause: items.filter((item) => item.topic === "perimenopause")
      .length,
  };
  const availableTopics = (["pcos", "perimenopause"] as const).filter(
    (topic) => counts[topic] > 0,
  );
  const visibleItems =
    selected === "all"
      ? items
      : items.filter((item) => item.topic === selected);
  const copy = ebookCollectionCopy[language];
  return {
    language,
    href: ebookCollectionPath(language),
    alternateHref: page.translation?.slug
      ? ebookCollectionPath(page.translation.language === "en" ? "en" : "pl")
      : null,
    seoTitle: page.seo?.title ?? copy.seoTitle,
    seoDescription: page.seo?.description ?? copy.seoDescription,
    filter: selected,
    collection: toEbookCollection(catalog, items),
    newsletter: toFormCopy(newsletter),
    visibleItems,
    counts,
    availableTopics,
    isEmpty: items.length === 0,
    isCategoryEmpty: selected !== "all" && visibleItems.length === 0,
  };
}
