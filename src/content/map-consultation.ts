import type { Locale } from "@ola/shared";

import type { PageContent } from "@/sanity/repository";
import { assertKnownSections } from "@/content/sections";
import {
  toCards,
  toExpert,
  toFaq,
  toHero,
  toList,
  toProcess,
  toServiceOffer,
  toTestimonials,
  toTextImage,
} from "@/content/map-sections";
import { currencyLabel, durationLabel } from "@/lib/offer";
import type {
  ExpertContent,
  FaqContent,
  HeroContent,
  ListContent,
  ProcessContent,
  QuestionMapContent,
  ServiceDetails,
  ServiceOfferContent,
  TestimonialsContent,
  TextCardsContent,
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
      `Konsultacje ${language}: sekcja ${index} ma być ${type}, jest ${section?._type ?? "brak"}.`,
    );
  }
  return section as Extract<PageSection, { _type: T }>;
}

export interface ConsultationPrice extends ServiceDetails {
  currencyLabel: string;
  durationLabel: string;
}

export interface ConsultationView {
  hero: HeroContent;
  path: ListContent;
  problem: QuestionMapContent;
  audience: TextCardsContent;
  process: ProcessContent;
  outcomes: TextCardsContent;
  expert: ExpertContent;
  offer: ServiceOfferContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  price: ConsultationPrice;
}

const expectedTypes = [
  "heroSection",
  "listSection",
  "textImageSection",
  "cardsSection",
  "processSection",
  "cardsSection",
  "expertSection",
  "serviceOfferSection",
  "testimonialsSection",
  "faqSection",
] as const;

export function mapConsultation(
  page: PageContent,
  language: Locale,
): ConsultationView {
  assertKnownSections(page.sections);
  const sections = page.sections;
  if (sections.length !== expectedTypes.length) {
    throw new Error(
      `Konsultacje ${language} wymagają ${expectedTypes.length} sekcji w ustalonej kolejności.`,
    );
  }
  const hero = toHero(sectionOf(sections[0], "heroSection", language, 0));
  const path = toList(sectionOf(sections[1], "listSection", language, 1));
  const problem = toTextImage(
    sectionOf(sections[2], "textImageSection", language, 2),
  );
  const audience = toCards(sectionOf(sections[3], "cardsSection", language, 3));
  const process = toProcess(
    sectionOf(sections[4], "processSection", language, 4),
  );
  const outcomes = toCards(sectionOf(sections[5], "cardsSection", language, 5));
  const expert = toExpert(sectionOf(sections[6], "expertSection", language, 6));
  const offer = toServiceOffer(
    sectionOf(sections[7], "serviceOfferSection", language, 7),
    language,
  );
  const testimonials = toTestimonials(
    sectionOf(sections[8], "testimonialsSection", language, 8),
  );
  const faq = toFaq(sectionOf(sections[9], "faqSection", language, 9));

  if (hero.variant !== "split") {
    throw new Error("Konsultacje 3a wymagają hero w wariancie split.");
  }
  if (path.items.length !== 3) {
    throw new Error("Konsultacje 3a wymagają trzech etapów ścieżki.");
  }
  if (problem.variant !== "questions") {
    throw new Error("Konsultacje 3a wymagają mapy pytań w sekcji problemu.");
  }
  if (audience.variant !== "situations" || audience.items.length !== 4) {
    throw new Error("Konsultacje 3a wymagają czterech sytuacji odbiorczyni.");
  }
  if (process.steps.length !== 3) {
    throw new Error("Konsultacje 3a wymagają trzech kroków spotkania.");
  }
  if (outcomes.variant !== "goals" || outcomes.items.length !== 3) {
    throw new Error("Konsultacje 3a wymagają trzech celów rozmowy.");
  }
  if (testimonials.items.length !== 2) {
    throw new Error("Konsultacje 3a pokazują dwie opinie, bez karuzeli.");
  }
  const service = offer.service;
  if (!service) {
    throw new Error(
      "Konsultacje 3a wymagają usługi z ceną, walutą i czasem trwania.",
    );
  }
  if (hero.primary.href !== offer.action.href) {
    throw new Error(
      "Hero konsultacji musi prowadzić do tego samego adresu rezerwacji co oferta.",
    );
  }

  return {
    hero,
    path,
    problem,
    audience,
    process,
    outcomes,
    expert,
    offer,
    testimonials,
    faq,
    price: {
      ...service,
      currencyLabel: currencyLabel(service.currency, language),
      durationLabel: durationLabel(service.durationMinutes, language),
    },
  };
}
