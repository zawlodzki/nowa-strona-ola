import type { Locale } from "@ola/shared";

import { footerLegalLinks } from "@/content/homepage-seed";
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
  toEbooks,
  toFormCopy,
  toHero,
  toLogos,
  toMetrics,
  toServiceOffer,
  toTestimonials,
  toTextImage,
} from "@/content/map-sections";
import type {
  EbooksContent,
  FormCopy,
  HeroContent,
  LogosContent,
  MediaSpec,
  MetricsContent,
  ServiceOfferContent,
  TestimonialsContent,
  TextImageContent,
} from "@/sections/types";

export interface HomepageView {
  hero: HeroContent;
  partners: LogosContent;
  approach: MetricsContent;
  about: TextImageContent;
  ebooks: EbooksContent;
  consultation: ServiceOfferContent & { media: MediaSpec };
  testimonials: TestimonialsContent;
  newsletter: FormCopy;
}

const expectedTypes = [
  "heroSection",
  "logosSection",
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
  const partners = toLogos(sectionOf(sections[1], "logosSection", language, 1));
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
  if (newsletter.fields.some((field) => field.input === "checkbox") === false) {
    throw new Error("Newsletter homepage wymaga zgody (checkbox).");
  }

  return {
    hero,
    partners,
    approach,
    about,
    ebooks,
    consultation: { ...consultation, media: consultation.media },
    testimonials,
    newsletter,
  };
}

export function shellLinks(settings: {
  language?: string | null;
  navigation?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
  headerCta?: { label?: string | null; href?: string | null } | null;
  socialLinks?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
  legalLinks?:
    ({ label?: string | null; href?: string | null } | null)[] | null;
}) {
  const language = settings.language === "en" ? "en" : "pl";
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
  };
}
