import type { Locale } from "@ola/shared";

import { ebookCollectionCopy } from "@/content/ebook-collection-seed";
import { newsletterFormFixture } from "@/sanity/homepage-fixtures";

export function ebookCollectionPageFixture(language: Locale) {
  const copy = ebookCollectionCopy[language];
  const form = newsletterFormFixture(language);
  const slug = language === "pl" ? "ebooki" : "ebooks";
  return {
    id: `page-ebook-collection-${language}`,
    language,
    slug,
    title: copy.pageTitle,
    seo: { title: copy.seoTitle, description: copy.seoDescription },
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: language === "pl" ? "ebooks" : "ebooki",
    },
    sections: [
      {
        _key: "collection-intro",
        _type: "ebookCollectionSection" as const,
        variant: "cherry3a" as const,
        title: copy.title,
        lead: copy.lead,
        catalogTitle: copy.catalogTitle,
        catalogLead: copy.catalogLead,
        findTopicLabel: copy.findTopicLabel,
        cardActionLabel: copy.cardActionLabel,
        note: copy.note,
        emptyMessage: copy.emptyMessage,
        emptyCategoryMessage: copy.emptyCategoryMessage,
      },
      {
        _key: "collection-newsletter",
        _type: "formSection" as const,
        eyebrow: null,
        title: copy.newsletterTitle,
        lead:
          language === "pl"
            ? "Piszę o PCOS, insulinooporności i codziennym odżywianiu. Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję o nowych materiałach, także o perimenopauzie."
            : "I write about PCOS, insulin resistance and everyday nutrition. I share notes you can use at an ordinary meal and I send updates about new materials, including perimenopause.",
        form,
      },
    ],
  };
}
