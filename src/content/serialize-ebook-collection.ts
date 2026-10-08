import type { Locale } from "@ola/shared";

import {
  mapEbookCollection,
  type EbookCollectionView,
} from "@/content/map-ebook-collection";
import { toEbookCard } from "@/content/map-sections";
import { formatPriceGross, topicLabel } from "@/lib/offer";
import type { PageContent } from "@/sanity/repository";

function heading(level: 1 | 2 | 3, value: string) {
  return `${"#".repeat(level)} ${value.replaceAll("\n", " ").trim()}`;
}

export function serializeEbookCollectionView(
  view: EbookCollectionView,
  language: Locale,
): string {
  const { collection } = view;
  const books = collection.items.flatMap((item) => [
    heading(3, item.title),
    item.description,
    `[${item.title}](${item.href})`,
    formatPriceGross(item.priceGross, item.currency, language),
    topicLabel(item.topic, language),
    item.availability === "planned"
      ? language === "pl"
        ? "Zapowiedź"
        : "Planned"
      : item.availability,
  ]);
  return [
    heading(1, collection.title),
    collection.lead,
    heading(2, collection.catalogTitle),
    collection.catalogLead,
    view.isEmpty ? collection.emptyMessage : "",
    ...books,
    collection.note,
    heading(2, view.newsletter.title),
    view.newsletter.lead,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function serializeEbookCollection(
  page: PageContent,
  ebooks: Parameters<typeof toEbookCard>[0][],
  language: Locale,
): string {
  return serializeEbookCollectionView(
    mapEbookCollection(page, ebooks, language),
    language,
  );
}
