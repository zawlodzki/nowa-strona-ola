import { requireSafeHref, type Locale } from "@ola/shared";

import { ebookCopy } from "@/content/ebook-seed";
import {
  toEbookAvailability,
  toFaq,
  toFormCopy,
  toMedia,
} from "@/content/map-sections";
import {
  currencyLabel,
  formatLowestPriceNote,
  formatPriceGross,
} from "@/lib/offer";
import {
  toPcosProductCode,
  type PcosProductCode,
} from "@/lib/checkout-products";
import { ebookPath } from "@/lib/paths";
import { pickSiteImage } from "@/lib/site-images";
import type {
  EbookAvailability,
  EbookTopic,
  FaqContent,
  FormCopy,
  MediaSpec,
  TestimonialsContent,
} from "@/sections/types";

export type EbookProblemVisual =
  "supplements" | "results" | "plate" | "measurements" | "journal" | "evening";

export interface EbookChapter {
  title: string;
  summary: string;
}

export interface EbookMaterial {
  title: string;
  description?: string;
}

export interface EbookFact {
  title: string;
  detail: string;
}

export interface EbookAudienceItem {
  title: string;
  body: string;
}

export interface EbookComparisonItem {
  before: string;
  after: string;
}

export interface EbookSource {
  title: string;
  href: string;
  scope?: string;
}

export interface EbookAuthor {
  name: string;
  role: string;
  bio: string;
  photo?: MediaSpec;
  education?: { institution: string; program: string };
}

export interface EbookWaitlist {
  buttonLabel: string;
  form: FormCopy;
}

export interface EbookView {
  language: Locale;
  slug: string;
  href: string;
  alternateHref: string | null;
  title: string;
  subtitle?: string;
  topic: EbookTopic;
  availability: EbookAvailability;
  priceGross: number;
  currency: "PLN";
  currencyLabel: string;
  priceLabel: string;
  /** Obecne tylko podczas obniżki (art. 4 ust. 2 ustawy o informowaniu o cenach). */
  lowestPriceNote?: string;
  format: string;
  seoTitle: string;
  seoDescription?: string;
  coverTone: "light" | "cherry";
  cover?: MediaSpec;
  author: EbookAuthor;
  chapters: EbookChapter[];
  materials: EbookMaterial[];
  sources: EbookSource[];
  numberOfPages?: number;
  /** Sale start date (YYYY-MM-DD) for JSON-LD datePublished. */
  publishedAt?: string;
  productCode?: PcosProductCode;
  checkoutUrl?: string;
  /** Tylko dla statusu „Wkrótce dostępny” z kompletną konfiguracją zapisu. */
  waitlist?: EbookWaitlist;
  landing: {
    variant: "cherry3a";
    coverTopic: string;
    coverArt: [string, string, string];
    coverCaption: string;
    problemCaption: string;
    problemVisual: EbookProblemVisual;
    sampleKicker: string;
    sampleSheetTitle: string;
    sampleSheetLead: string;
    sampleSheetFooter: [string, string];
    beforeLabel: string;
    afterLabel: string;
    heroTitle: string;
    heroLead: string;
    primaryLabel: string;
    secondaryLabel: string;
    facts: EbookFact[];
    problemTitle: string;
    problemParagraphs: string[];
    problemQuestions: string[];
    problemMedia?: MediaSpec;
    audienceTitle: string;
    audienceLead: string;
    audienceItems: EbookAudienceItem[];
    educationNote: string;
    contentsTitle: string;
    contentsLead: string;
    ingredients: string[];
    sampleTitle: string;
    sampleLead: string;
    sampleMedia?: MediaSpec;
    sampleFields: string[];
    sampleCaption: string;
    outcomesTitle: string;
    outcomesLead: string;
    comparisonItems: EbookComparisonItem[];
    outcomesNote: string;
    authorTitle: string;
    authorParagraphs: string[];
    offerTitle: string;
    offerLead: string;
    purchaseLabel: string;
    offerNote?: string;
    testimonials: TestimonialsContent;
    testimonialsScope: "cooperation" | "product";
    faq: FaqContent;
  };
}

type RawEbook = {
  language?: string | null;
  numberOfPages?: number | null;
  publishedAt?: string | null;
  slug?: string | null;
  title?: string | null;
  subtitle?: string | null;
  topic?: string | null;
  availability?: string | null;
  priceGross?: number | null;
  lowestPrice30Days?: number | null;
  currency?: string | null;
  format?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
  coverTone?: string | null;
  cover?: Parameters<typeof toMedia>[0];
  translation?: { language?: string | null; slug?: string | null } | null;
  author?: {
    name?: string | null;
    role?: string | null;
    bio?: string | null;
    educationInstitution?: string | null;
    educationProgram?: string | null;
    photo?: Parameters<typeof toMedia>[0];
  } | null;
  chapters?: { title?: string | null; summary?: string | null }[] | null;
  includedMaterials?:
    { title?: string | null; description?: string | null }[] | null;
  productCode?: string | null;
  checkoutUrl?: string | null;
  waitlist?: {
    buttonLabel?: string | null;
    title?: string | null;
    lead?: string | null;
    form?: Parameters<typeof toFormCopy>[0]["form"];
  } | null;
  sources?:
    | { title?: string | null; href?: string | null; scope?: string | null }[]
    | null;
  landing?: {
    variant?: string | null;
    coverTopic?: string | null;
    coverArt?: string[] | null;
    coverCaption?: string | null;
    problemCaption?: string | null;
    problemVisual?: string | null;
    sampleKicker?: string | null;
    sampleSheetTitle?: string | null;
    sampleSheetLead?: string | null;
    sampleSheetFooter?: string[] | null;
    beforeLabel?: string | null;
    afterLabel?: string | null;
    heroTitle?: string | null;
    heroLead?: string | null;
    primaryLabel?: string | null;
    secondaryLabel?: string | null;
    facts?: { title?: string | null; detail?: string | null }[] | null;
    problemTitle?: string | null;
    problemParagraphs?: (string | null)[] | null;
    problemQuestions?: (string | null)[] | null;
    problemMedia?: Parameters<typeof toMedia>[0];
    audienceTitle?: string | null;
    audienceLead?: string | null;
    audienceItems?: { title?: string | null; body?: string | null }[] | null;
    educationNote?: string | null;
    contentsTitle?: string | null;
    contentsLead?: string | null;
    ingredients?: (string | null)[] | null;
    sampleTitle?: string | null;
    sampleLead?: string | null;
    sampleMedia?: Parameters<typeof toMedia>[0];
    sampleFields?: { label?: string | null }[] | null;
    sampleCaption?: string | null;
    outcomesTitle?: string | null;
    outcomesLead?: string | null;
    comparisonItems?:
      { before?: string | null; after?: string | null }[] | null;
    outcomesNote?: string | null;
    authorTitle?: string | null;
    authorParagraphs?: (string | null)[] | null;
    offerTitle?: string | null;
    offerLead?: string | null;
    purchaseLabel?: string | null;
    offerNote?: string | null;
    testimonialsTitle?: string | null;
    testimonialsContext?: string | null;
    testimonialsScope?: string | null;
    testimonials?:
      | {
          quote?: string | null;
          name?: string | null;
          role?: string | null;
          anonymous?: boolean | null;
          displayLabel?: string | null;
          scope?: string | null;
        }[]
      | null;
    faq?: {
      title?: string | null;
      lead?: string | null;
      items?: { question?: string | null; answer?: string | null }[] | null;
    } | null;
  } | null;
};

function required(value: string | null | undefined, label: string): string {
  if (!value) throw new Error(`E-book: brakuje pola ${label}.`);
  return value;
}

function requiredList(
  values: readonly (string | null | undefined)[] | null | undefined,
  label: string,
  min: number,
  max: number,
): string[] {
  const items = (values ?? []).filter((item): item is string => Boolean(item));
  if (items.length < min || items.length > max) {
    throw new Error(`E-book: ${label} wymaga od ${min} do ${max} pozycji.`);
  }
  return items;
}

function toProblemVisual(value: string | null | undefined): EbookProblemVisual {
  switch (value) {
    case "supplements":
    case "results":
    case "plate":
    case "measurements":
    case "journal":
    case "evening":
      return value;
    default:
      throw new Error(
        `Nieznana ilustracja problemu e-booka: ${value ?? "brak"}.`,
      );
  }
}

function presentationFields(
  landing: NonNullable<RawEbook["landing"]>,
  slug: string,
  language: Locale,
) {
  const legacy =
    slug === "suplementy-w-pcos" || slug === "supplements-in-pcos"
      ? ebookCopy[language]
      : undefined;
  const [one, two, three] = requiredList(
    landing.coverArt ?? legacy?.coverArt,
    "etykiety okładki",
    3,
    3,
  );
  const [footerOne, footerTwo] = requiredList(
    landing.sampleSheetFooter ?? legacy?.sampleSheetFooter,
    "stopka próbki",
    2,
    2,
  );
  return {
    coverTopic: required(
      landing.coverTopic ?? legacy?.coverTopic,
      "temat okładki",
    ),
    coverArt: [
      required(one, "etykieta okładki"),
      required(two, "etykieta okładki"),
      required(three, "etykieta okładki"),
    ] satisfies [string, string, string],
    coverCaption: required(
      landing.coverCaption ?? legacy?.coverCaption,
      "podpis okładki",
    ),
    problemCaption: required(
      landing.problemCaption ?? legacy?.problemCaption,
      "podpis ilustracji problemu",
    ),
    problemVisual: toProblemVisual(
      landing.problemVisual ?? (legacy ? "supplements" : undefined),
    ),
    sampleKicker: required(
      landing.sampleKicker ?? legacy?.sampleKicker,
      "etykieta próbki",
    ),
    sampleSheetTitle: required(
      landing.sampleSheetTitle ?? legacy?.sampleSheetTitle,
      "tytuł karty pracy",
    ),
    sampleSheetLead: required(
      landing.sampleSheetLead ?? legacy?.sampleSheetLead,
      "lead karty pracy",
    ),
    sampleSheetFooter: [
      required(footerOne, "stopka próbki"),
      required(footerTwo, "stopka próbki"),
    ] satisfies [string, string],
    beforeLabel: required(
      landing.beforeLabel ?? legacy?.beforeLabel,
      "etykieta przed",
    ),
    afterLabel: required(
      landing.afterLabel ?? legacy?.afterLabel,
      "etykieta po",
    ),
  };
}

function toTopic(value: string | null | undefined): EbookTopic {
  if (value === "pcos" || value === "perimenopause") return value;
  throw new Error(`Nieznany temat e-booka: ${value ?? "brak"}.`);
}

function optionalMedia(value: Parameters<typeof toMedia>[0]) {
  if (!value?.alt && !value?.label) return undefined;
  const media = toMedia(value);
  return pickSiteImage(media.src) ? media : undefined;
}

export function canPurchase(availability: EbookAvailability): boolean {
  return availability === "available" || availability === "presale";
}

function toWaitlist(
  waitlist: RawEbook["waitlist"],
  availability: EbookAvailability,
  slug: string,
): EbookWaitlist | undefined {
  if (availability !== "planned" || !waitlist) return undefined;
  const form = toFormCopy({
    title: waitlist.title,
    lead: waitlist.lead,
    form: waitlist.form,
  });
  if (form.formKey !== "waitlist") {
    throw new Error(
      `E-book ${slug}: lista oczekujących wymaga formularza waitlist, jest ${form.formKey}.`,
    );
  }
  return {
    buttonLabel: required(waitlist.buttonLabel, "etykieta listy oczekujących"),
    form,
  };
}

export function mapEbook(ebook: RawEbook, language: Locale): EbookView {
  if (ebook.language && ebook.language !== language) {
    throw new Error(
      `E-book ${ebook.slug ?? "bez adresu"} ma język ${ebook.language}, oczekiwano ${language}.`,
    );
  }
  const slug = required(ebook.slug, "adres");
  const availability = toEbookAvailability(ebook.availability);
  const landing = ebook.landing;
  if (!landing) {
    throw new Error(`E-book ${slug} nie ma landingu. Zatrzymuję build.`);
  }
  if (landing.variant !== "cherry3a") {
    throw new Error(
      `Nieznany wariant landingu e-booka: ${landing.variant ?? "brak"}. Zatrzymuję build.`,
    );
  }
  if (
    typeof ebook.priceGross !== "number" ||
    !Number.isFinite(ebook.priceGross)
  ) {
    throw new Error(`E-book ${slug} wymaga skończonej ceny brutto.`);
  }
  if (ebook.currency !== "PLN") {
    throw new Error(`E-book ${slug} wymaga waluty PLN.`);
  }
  const lowestPrice30Days = ebook.lowestPrice30Days ?? undefined;
  if (
    lowestPrice30Days !== undefined &&
    !(Number.isFinite(lowestPrice30Days) && lowestPrice30Days > 0)
  ) {
    throw new Error(
      `E-book ${slug}: najniższa cena z 30 dni musi być dodatnią liczbą.`,
    );
  }
  const productCode =
    language === "pl" ? toPcosProductCode(ebook.productCode) : undefined;
  if (ebook.productCode && !productCode) {
    throw new Error(`E-book ${slug} ma nieznany kod produktu płatności.`);
  }
  const checkoutUrl = productCode
    ? `/zamowienie/?produkt=${productCode}`
    : (ebook.checkoutUrl ?? undefined);
  if (canPurchase(availability) && !checkoutUrl) {
    throw new Error(`E-book ${slug} w sprzedaży wymaga checkoutUrl HTTPS.`);
  }
  const chapters = (ebook.chapters ?? []).map((chapter) => ({
    title: required(chapter.title, "tytuł rozdziału"),
    summary: required(chapter.summary, "streszczenie rozdziału"),
  }));
  if (chapters.length < 1 || chapters.length > 20) {
    throw new Error(`E-book ${slug} wymaga od 1 do 20 rozdziałów.`);
  }
  const materials = (ebook.includedMaterials ?? []).map((item) => ({
    title: required(item.title, "nazwa materiału"),
    description: item.description ?? undefined,
  }));
  if (materials.length < 1 || materials.length > 10) {
    throw new Error(`E-book ${slug} wymaga od 1 do 10 materiałów.`);
  }
  const person = ebook.author;
  const facts = (landing.facts ?? []).map((fact) => ({
    title: required(fact.title, "nagłówek faktu"),
    detail: required(fact.detail, "dopisek faktu"),
  }));
  if (facts.length !== 3) {
    throw new Error(`Landing e-booka ${slug} wymaga trzech faktów pod hero.`);
  }
  const audienceItems = (landing.audienceItems ?? []).map((item) => ({
    title: required(item.title, "tytuł sytuacji"),
    body: required(item.body, "opis sytuacji"),
  }));
  if (audienceItems.length < 1 || audienceItems.length > 6) {
    throw new Error(`Landing e-booka ${slug} wymaga od 1 do 6 sytuacji.`);
  }
  const comparisonItems = (landing.comparisonItems ?? []).map((item) => ({
    before: required(item.before, "stan przed"),
    after: required(item.after, "stan po"),
  }));
  if (comparisonItems.length < 2) {
    throw new Error(`Landing e-booka ${slug} wymaga par przed/po.`);
  }
  const testimonialsScope =
    landing.testimonialsScope === "product" ? "product" : "cooperation";
  const testimonials: TestimonialsContent = {
    title: required(landing.testimonialsTitle, "tytuł opinii"),
    lead: required(landing.testimonialsContext, "kontekst opinii"),
    items: (landing.testimonials ?? []).map((item) => {
      const anonymous = item.anonymous === true;
      if (anonymous && !item.displayLabel) {
        throw new Error("Anonimowa opinia wymaga podpisu widocznego.");
      }
      if (item.scope && item.scope !== testimonialsScope) {
        throw new Error(
          `Opinia ma zakres ${item.scope}, landing wymaga ${testimonialsScope}.`,
        );
      }
      return {
        quote: required(item.quote, "cytat"),
        name: item.name ?? undefined,
        role: item.role ?? undefined,
        anonymous,
        displayLabel: item.displayLabel ?? undefined,
        scope: testimonialsScope,
      };
    }),
  };
  if (testimonials.items.length < 1) {
    throw new Error(`Landing e-booka ${slug} wymaga opinii.`);
  }
  if (!landing.faq) {
    throw new Error(`Landing e-booka ${slug} wymaga FAQ.`);
  }
  const translationSlug = ebook.translation?.slug;
  const translationLanguage = ebook.translation?.language;
  const alternateHref =
    translationSlug &&
    (translationLanguage === "pl" || translationLanguage === "en")
      ? ebookPath(translationLanguage, translationSlug)
      : null;

  return {
    language,
    slug,
    href: ebookPath(language, slug),
    alternateHref,
    title: required(ebook.title, "tytuł"),
    subtitle: ebook.subtitle ?? undefined,
    topic: toTopic(ebook.topic),
    availability,
    priceGross: ebook.priceGross,
    currency: "PLN",
    currencyLabel: currencyLabel("PLN", language),
    priceLabel: formatPriceGross(ebook.priceGross, "PLN", language),
    lowestPriceNote:
      lowestPrice30Days === undefined
        ? undefined
        : formatLowestPriceNote(
            ebook.priceGross,
            lowestPrice30Days,
            "PLN",
            language,
          ),
    format: ebook.format === "pdf" ? "pdf" : required(ebook.format, "format"),
    seoTitle: ebook.seo?.title ?? required(ebook.title, "tytuł"),
    seoDescription: ebook.seo?.description ?? undefined,
    coverTone: ebook.coverTone === "cherry" ? "cherry" : "light",
    cover: optionalMedia(ebook.cover),
    author: {
      name: required(person?.name, "imię autorki"),
      role: required(person?.role, "rola autorki"),
      bio: required(person?.bio, "biogram autorki"),
      photo: optionalMedia(person?.photo),
      education:
        person?.educationInstitution && person.educationProgram
          ? {
              institution: person.educationInstitution,
              program: person.educationProgram,
            }
          : undefined,
    },
    chapters,
    materials,
    sources: (ebook.sources ?? []).map((source) => ({
      title: required(source.title, "tytuł źródła"),
      href: requireSafeHref(
        required(source.href, "adres źródła"),
        "adres źródła",
      ),
      scope: source.scope ?? undefined,
    })),
    numberOfPages: ebook.numberOfPages ?? undefined,
    publishedAt: ebook.publishedAt ?? undefined,
    productCode,
    checkoutUrl: canPurchase(availability) ? checkoutUrl : undefined,
    waitlist: toWaitlist(ebook.waitlist, availability, slug),
    landing: {
      variant: "cherry3a",
      ...presentationFields(landing, slug, language),
      heroTitle: required(landing.heroTitle, "tytuł hero"),
      heroLead: required(landing.heroLead, "lead hero"),
      primaryLabel: required(landing.primaryLabel, "główne CTA"),
      secondaryLabel: required(landing.secondaryLabel, "drugie CTA"),
      facts,
      problemTitle: required(landing.problemTitle, "nagłówek problemu"),
      problemParagraphs: requiredList(
        landing.problemParagraphs,
        "akapity problemu",
        1,
        4,
      ),
      problemQuestions: requiredList(
        landing.problemQuestions,
        "pytania przy półce",
        3,
        3,
      ),
      problemMedia: optionalMedia(landing.problemMedia),
      audienceTitle: required(landing.audienceTitle, "nagłówek odbiorczyń"),
      audienceLead: required(landing.audienceLead, "lead odbiorczyń"),
      audienceItems,
      educationNote: required(landing.educationNote, "nota edukacyjna"),
      contentsTitle: required(landing.contentsTitle, "nagłówek zawartości"),
      contentsLead: required(landing.contentsLead, "lead zawartości"),
      ingredients: requiredList(landing.ingredients, "składniki", 1, 12),
      sampleTitle: required(landing.sampleTitle, "nagłówek próbki"),
      sampleLead: required(landing.sampleLead, "lead próbki"),
      sampleMedia: optionalMedia(landing.sampleMedia),
      sampleFields: (landing.sampleFields ?? []).map((field) =>
        required(field.label, "etykieta pola próbki"),
      ),
      sampleCaption: required(landing.sampleCaption, "podpis próbki"),
      outcomesTitle: required(landing.outcomesTitle, "nagłówek efektów"),
      outcomesLead: required(landing.outcomesLead, "lead efektów"),
      comparisonItems,
      outcomesNote: required(landing.outcomesNote, "nota efektów"),
      authorTitle: required(landing.authorTitle, "nagłówek autorki"),
      authorParagraphs: requiredList(
        landing.authorParagraphs,
        "akapity autorki",
        1,
        4,
      ),
      offerTitle: required(landing.offerTitle, "nagłówek oferty"),
      offerLead: required(landing.offerLead, "lead oferty"),
      purchaseLabel: required(landing.purchaseLabel, "etykieta zakupu"),
      offerNote: landing.offerNote ?? undefined,
      testimonials,
      testimonialsScope,
      faq: toFaq(landing.faq),
    },
  };
}

export function ebookShellCopy(language: Locale) {
  return ebookCopy[language];
}
