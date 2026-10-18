import type { Locale } from "@ola/shared";

import { ebookCopy } from "@/content/ebook-seed";
import type { EbookLandingSeed } from "@/content/ebook-landing-seed";
import { badaniaKtoreMajaSensLanding } from "@/content/ebook-landings/badania-ktore-maja-sens";
import { szczuplaAJednakPcosLanding } from "@/content/ebook-landings/szczupla-a-jednak-pcos";
import { wagaLanding } from "@/content/ebook-landings/waga-cie-oklamuje";
import { czyToJuzLanding } from "@/content/ebook-landings/czy-to-juz";
import { nocLanding } from "@/content/ebook-landings/noc-zaczyna-sie-o-osiemnastej";
import { EBOOK_SEED } from "@/content/homepage-seed";
import { PCOS_PRODUCTS } from "@/lib/checkout-products";
import { ebookPath } from "@/lib/paths";
import { homepageCopy } from "@/content/homepage-seed";
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

/** Propozycja copy; wersja 0.1 do czasu ujęcia w „Zgody i formularze”. */
export const WAITLIST_FORM_VERSION = "0.1";

export function waitlistFormFixture(language: Locale) {
  const copy = ebookCopy[language].waitlist;
  const shared = homepageCopy[language];
  return {
    id: `waitlist-form-${language}`,
    language,
    title: "Lista oczekujących na e-book",
    formKey: "waitlist",
    version: WAITLIST_FORM_VERSION,
    submitLabel: copy.submit,
    notice: copy.notice,
    noticeConsentId: null,
    successMessage: copy.success,
    errorMessage: copy.error,
    noscriptMessage: copy.noscript,
    fields: [
      {
        _key: "email",
        name: "email",
        input: "email",
        label: shared.emailLabel,
        placeholder: shared.emailPlaceholder,
        errorMessage: shared.emailError,
        required: "required",
        options: null,
        defaultValue: null,
      },
    ],
  };
}

export function pcosEbookFixture(language: Locale) {
  const seed = EBOOK_SEED[0];
  return buildEbookFixture(language, seed, ebookCopy[language]);
}

function buildEbookFixture(
  language: Locale,
  seed: (typeof EBOOK_SEED)[number],
  copy: (typeof ebookCopy)[Locale] | EbookLandingSeed,
) {
  const waitlist = ebookCopy[language].waitlist;
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
    lowestPrice30Days: null,
    currency: "PLN" as const,
    format: "problemVisual" in copy ? "pdf-epub" : "pdf",
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
    productCode:
      language === "pl"
        ? (PCOS_PRODUCTS.find((product) => product.slug === seed.slug.pl)
            ?.code ?? null)
        : null,
    checkoutUrl: null,
    waitlist: {
      buttonLabel: waitlist.buttonLabel,
      title: waitlist.title,
      lead: waitlist.lead,
      form: waitlistFormFixture(language),
    },
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
      slug: language === "pl" ? seed.slug.en : seed.slug.pl,
    },
    landing: {
      variant: "cherry3a" as const,
      coverTopic: copy.coverTopic,
      coverArt: [...copy.coverArt],
      coverCaption: copy.coverCaption,
      problemCaption: copy.problemCaption,
      problemVisual:
        "problemVisual" in copy ? copy.problemVisual : "supplements",
      sampleKicker: copy.sampleKicker,
      sampleSheetTitle: copy.sampleSheetTitle,
      sampleSheetLead: copy.sampleSheetLead,
      sampleSheetFooter: [...copy.sampleSheetFooter],
      beforeLabel: copy.beforeLabel,
      afterLabel: copy.afterLabel,
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

export const additionalEbookLandings: ReadonlyMap<string, EbookLandingSeed> =
  new Map<string, EbookLandingSeed>([
    ["badania-ktore-maja-sens", badaniaKtoreMajaSensLanding],
    ["szczupla-a-jednak-pcos", szczuplaAJednakPcosLanding],
    ["waga-cie-oklamuje", wagaLanding],
    ["czy-to-juz", czyToJuzLanding],
    ["noc-zaczyna-sie-o-osiemnastej", nocLanding],
  ]);

function ebooksWithLanding(language: Locale) {
  const pcos = pcosEbookFixture(language);
  if (language !== "pl") return [pcos];
  return EBOOK_SEED.map((seed) => {
    if (seed.slug.pl === pcos.slug) return pcos;
    const copy = additionalEbookLandings.get(seed.slug.pl);
    if (!copy) throw new Error(`Brak treści landingu ${seed.slug.pl}.`);
    return buildEbookFixture(language, seed, copy);
  });
}

export function fixtureEbook(language: Locale, slug: string) {
  return (
    ebooksWithLanding(language).find((ebook) => ebook.slug === slug) ?? null
  );
}

export function fixtureEbooksWithLanding() {
  return [...ebooksWithLanding("pl"), ...ebooksWithLanding("en")];
}

export function fixtureEbooksForLanguage(language: Locale) {
  return [...ebookFixtures(language)].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
}

export function pcosEbookHref(language: Locale) {
  return ebookPath(language, PCOS_SLUG[language]);
}
