import type { Locale } from "@ola/shared";

import { ebookCopy } from "@/content/ebook-seed";
import { EBOOK_SEED } from "@/content/homepage-seed";
import { ebookPath } from "@/lib/paths";
import {
  authorFixture,
  ebookFixtures,
  testimonialFixtures,
} from "@/sanity/homepage-fixtures";

function media(
  key: string,
  alt: string,
  tone: "photo" | "portrait" | "diagram" = "photo",
) {
  return {
    alt,
    label: alt,
    tone,
    caption: null,
    src: key,
  };
}

const PCOS_SLUG = {
  pl: "suplementy-w-pcos",
  en: "supplements-in-pcos",
} as const;

export function pcosEbookFixture(language: Locale) {
  const copy = ebookCopy[language];
  const seed = EBOOK_SEED[0];
  const author = authorFixture(language);
  const cards = ebookFixtures(language);
  const card = cards.find((item) => item.slug === seed.slug[language]);
  if (!card) {
    throw new Error(`Brak karty e-booka ${seed.slug[language]}.`);
  }
  const testimonials = testimonialFixtures(language);
  const selected = [testimonials[3], testimonials[5]];
  if (!selected[0] || !selected[1]) {
    throw new Error("Landing e-booka wymaga opinii 4 i 6 ze współpracy.");
  }

  return {
    id: card.id,
    language,
    slug: seed.slug[language],
    title: seed.title[language],
    subtitle: seed.subtitle[language],
    topic: seed.topic,
    cardDescription: seed.description[language],
    coverTone: seed.coverTone,
    availability: "planned" as const,
    priceGross: 97,
    currency: "PLN" as const,
    format: "pdf",
    sortOrder: seed.sortOrder,
    reviewedAt: null,
    cover: card.cover,
    author: {
      ...author,
      photo: media(
        "about",
        language === "pl"
          ? "Aleksandra Olesiewicz, dietetyczka kliniczna"
          : "Aleksandra Olesiewicz, clinical dietitian",
        "portrait",
      ),
    },
    chapters: copy.chapters.map((chapter, index) => ({
      _key: `chapter-${index + 1}`,
      title: chapter.title,
      summary: chapter.summary,
    })),
    includedMaterials: copy.materials.map((item, index) => ({
      _key: `material-${index + 1}`,
      title: item.title,
      description: item.description,
    })),
    delivery: null,
    checkoutUrl: null,
    sources: [
      {
        _key: "source-pcos-2023",
        title: copy.sourceLabel,
        href: copy.sourceHref,
        scope: copy.sourceScope,
      },
    ],
    seo: {
      title: copy.seoTitle,
      description: copy.seoDescription,
    },
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: language === "pl" ? PCOS_SLUG.en : PCOS_SLUG.pl,
    },
    landing: {
      variant: "cherry3a" as const,
      heroTitle: copy.heroTitle,
      heroLead: copy.heroLead,
      primaryLabel: copy.primaryLabel,
      secondaryLabel: copy.secondaryLabel,
      facts: copy.facts.map((fact, index) => ({
        _key: `fact-${index + 1}`,
        title: fact.title,
        detail: fact.detail,
      })),
      problemTitle: copy.problemTitle,
      problemParagraphs: [...copy.problemParagraphs],
      problemQuestions: [...copy.problemQuestions],
      problemMedia: null,
      audienceTitle: copy.audienceTitle,
      audienceLead: copy.audienceLead,
      audienceItems: copy.audienceItems.map((item, index) => ({
        _key: `audience-${index + 1}`,
        title: item.title,
        body: item.body,
      })),
      educationNote: copy.educationNote,
      contentsTitle: copy.contentsTitle,
      contentsLead: copy.contentsLead,
      ingredients: [...copy.ingredients],
      sampleTitle: copy.sampleTitle,
      sampleLead: copy.sampleLead,
      sampleMedia: null,
      sampleFields: copy.sampleFields.map((label, index) => ({
        _key: `sample-field-${index + 1}`,
        label,
      })),
      sampleCaption: copy.sampleCaption,
      outcomesTitle: copy.outcomesTitle,
      outcomesLead: copy.outcomesLead,
      comparisonItems: copy.comparison.map((item, index) => ({
        _key: `compare-${index + 1}`,
        before: item.before,
        after: item.after,
      })),
      outcomesNote: copy.outcomesNote,
      authorTitle: copy.authorTitle,
      authorParagraphs: [...copy.authorParagraphs],
      offerTitle: copy.offerTitle,
      offerLead: copy.offerLead,
      purchaseLabel: copy.purchaseLabel,
      offerNote: copy.offerNote,
      testimonialsTitle: copy.testimonialsTitle,
      testimonialsContext: copy.testimonialsContext,
      testimonialsScope: "cooperation" as const,
      testimonials: selected,
      faq: {
        title: copy.faqTitle,
        lead: copy.faqLead,
        items: copy.faq.map((item, index) => ({
          _key: `faq-${index + 1}`,
          question: item.question,
          answer: item.answer,
        })),
      },
    },
  };
}

export function fixtureEbook(language: Locale, slug: string) {
  const fixture = pcosEbookFixture(language);
  if (fixture.slug !== slug) return null;
  return fixture;
}

export function fixtureEbooksWithLanding() {
  return [pcosEbookFixture("pl"), pcosEbookFixture("en")];
}

export function pcosEbookHref(language: Locale) {
  return ebookPath(language, PCOS_SLUG[language]);
}
