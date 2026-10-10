import type { Locale } from "@ola/shared";

import {
  footerLegalLinks,
  sellerCompany,
  siteLegalCopy,
} from "@/content/site-legal";
import { footerSocialLinks } from "@/content/social-profiles";
import type { PageContent } from "@/sanity/repository";

type PageSection = NonNullable<PageContent["sections"]>[number];

function sectionOf<T extends PageSection["_type"]>(
  section: PageSection | undefined,
  type: T,
  language: Locale,
  index: number,
): Extract<PageSection, { _type: T }> {
  if (!section || section._type !== type) {
    throw new Error(
      `Homepage ${language}: sekcja ${index} ma być ${type}, jest ${section?._type ?? "brak"}.`,
    );
  }
  return section as Extract<PageSection, { _type: T }>;
}
import { assertKnownSections } from "@/content/sections";
import {
  toAudience,
  toEbooks,
  toFormCopy,
  toHero,
  toMetrics,
  toServiceOffer,
  toTestimonials,
  toTextImage,
} from "@/content/map-sections";
import type {
  AudienceContent,
  EbooksContent,
  FormCopy,
  HeroContent,
  MediaSpec,
  MetricsContent,
  ServiceOfferContent,
  TestimonialsContent,
  TextImageContent,
} from "@/sections/types";

export interface HomepageView {
  hero: HeroContent;
  audience: AudienceContent;
  approach: MetricsContent;
  about: TextImageContent;
  ebooks: EbooksContent;
  consultation: ServiceOfferContent & { media: MediaSpec };
  testimonials: TestimonialsContent;
  newsletter: FormCopy;
}

const expectedTypes = [
  "heroSection",
  "audienceSection",
  "metricsSection",
  "textImageSection",
  "ebooksSection",
  "serviceOfferSection",
  "testimonialsSection",
  "formSection",
] as const;

export function mapHomepage(page: PageContent, language: Locale): HomepageView {
  assertKnownSections(page.sections);
  const sections = page.sections;
  if (sections.length !== expectedTypes.length) {
    throw new Error(
      `Homepage ${language} wymaga ${expectedTypes.length} sekcji w ustalonej kolejności.`,
    );
  }
  const hero = toHero(sectionOf(sections[0], "heroSection", language, 0));
  const audience = toAudience(
    sectionOf(sections[1], "audienceSection", language, 1),
  );
  const approach = toMetrics(
    sectionOf(sections[2], "metricsSection", language, 2),
  );
  const about = toTextImage(
    sectionOf(sections[3], "textImageSection", language, 3),
  );
  const ebooks = toEbooks(
    sectionOf(sections[4], "ebooksSection", language, 4),
    language,
  );
  const consultation = toServiceOffer(
    sectionOf(sections[5], "serviceOfferSection", language, 5),
    language,
  );
  const testimonials = toTestimonials(
    sectionOf(sections[6], "testimonialsSection", language, 6),
  );
  const newsletter = toFormCopy(
    sectionOf(sections[7], "formSection", language, 7),
  );

  if (hero.variant !== "split") {
    throw new Error("Homepage 3a wymaga hero w wariancie split.");
  }
  if (approach.variant !== "approach" || approach.items.length !== 1) {
    throw new Error(
      "Homepage 3a wymaga jednego wskaźnika w wariancie podejścia.",
    );
  }
  if (about.variant !== "photo") {
    throw new Error("Homepage 3a wymaga sekcji O mnie z fotografią.");
  }
  if (!consultation.media) {
    throw new Error("Homepage 3a wymaga fotografii przy ofercie konsultacji.");
  }
  if (newsletter.formKey !== "newsletter") {
    throw new Error("Newsletter homepage wymaga formularza newslettera.");
  }

  return {
    hero,
    audience,
    approach,
    about,
    ebooks,
    consultation: { ...consultation, media: consultation.media },
    testimonials,
    newsletter,
  };
}

type SellerCompany = typeof sellerCompany;

interface ShellSettings {
  language?: string | null;
  navigation?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
  headerCta?: { label?: string | null; href?: string | null } | null;
  socialLinks?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
  legalLinks?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
  company?: SellerCompany | null;
  copyright?: string | null;
  testimonialsDisclosure?: string | null;
}

function settingsLanguage(settings: ShellSettings): Locale {
  return settings.language === "en" ? "en" : "pl";
}

export function sellerLine(company: SellerCompany, language: Locale): string {
  return [
    `${company.name}, ${company.street}, ${company.postalCode} ${company.city}`,
    `KRS ${company.krs}`,
    `NIP ${company.nip}`,
    `REGON ${company.regon}`,
    `${language === "pl" ? "kapitał zakładowy" : "share capital"} ${company.shareCapital}`,
    company.email,
    company.phone,
  ].join(" · ");
}

export function testimonialsDisclosure(settings: ShellSettings): string {
  return (
    settings.testimonialsDisclosure?.trim() ||
    siteLegalCopy[settingsLanguage(settings)].testimonialsDisclosure
  );
}

export function shellLinks(settings: ShellSettings) {
  const language = settingsLanguage(settings);
  const socialLinks = (settings.socialLinks ?? []).flatMap((item) =>
    item?.label && item.href ? [{ label: item.label, href: item.href }] : [],
  );
  const legalLinks = (settings.legalLinks ?? []).flatMap((item) =>
    item?.label && item.href ? [{ label: item.label, href: item.href }] : [],
  );
  return {
    navigation: (settings.navigation ?? []).flatMap((item) =>
      item?.label && item.href ? [{ label: item.label, href: item.href }] : [],
    ),
    headerCta:
      settings.headerCta?.label && settings.headerCta.href
        ? { label: settings.headerCta.label, href: settings.headerCta.href }
        : undefined,
    socialLinks: socialLinks.length > 0 ? socialLinks : footerSocialLinks(),
    legalLinks: legalLinks.length > 0 ? legalLinks : footerLegalLinks(language),
    sellerLine: sellerLine(settings.company ?? sellerCompany, language),
    copyright: settings.copyright?.trim() || siteLegalCopy[language].copyright,
  };
}
