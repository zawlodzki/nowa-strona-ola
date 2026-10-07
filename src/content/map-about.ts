import type { Locale } from "@ola/shared";

import type { PageContent } from "@/sanity/repository";
import { assertKnownSections } from "@/content/sections";
import {
  toCards,
  toCredentials,
  toFormCopy,
  toHero,
  toMetrics,
  toProcess,
  toServiceOffer,
  toTestimonials,
  toText,
} from "@/content/map-sections";
import type {
  CardsContent,
  CredentialsContent,
  FormCopy,
  HeroContent,
  MediaSpec,
  MetricItem,
  ProcessContent,
  ServiceOfferContent,
  TestimonialsContent,
  TextContent,
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
      `About ${language}: sekcja ${index} ma być ${type}, jest ${section?._type ?? "brak"}.`,
    );
  }
  return section as Extract<PageSection, { _type: T }>;
}

export interface AboutView {
  hero: HeroContent;
  story: TextContent;
  experience: MetricItem;
  credentials: CredentialsContent;
  approach: ProcessContent;
  testimonials: TestimonialsContent;
  materials: CardsContent;
  consultation: ServiceOfferContent & { media: MediaSpec };
  newsletter: FormCopy;
}

const expectedTypes = [
  "heroSection",
  "textSection",
  "metricsSection",
  "credentialsSection",
  "processSection",
  "testimonialsSection",
  "cardsSection",
  "serviceOfferSection",
  "formSection",
] as const;

export function mapAbout(page: PageContent, language: Locale): AboutView {
  assertKnownSections(page.sections);
  const sections = page.sections;
  if (sections.length !== expectedTypes.length) {
    throw new Error(
      `About ${language} wymaga ${expectedTypes.length} sekcji w ustalonej kolejności.`,
    );
  }
  const hero = toHero(sectionOf(sections[0], "heroSection", language, 0));
  const story = toText(sectionOf(sections[1], "textSection", language, 1));
  const metrics = toMetrics(
    sectionOf(sections[2], "metricsSection", language, 2),
  );
  const credentials = toCredentials(
    sectionOf(sections[3], "credentialsSection", language, 3),
  );
  const approach = toProcess(
    sectionOf(sections[4], "processSection", language, 4),
  );
  const testimonials = toTestimonials(
    sectionOf(sections[5], "testimonialsSection", language, 5),
  );
  const materials = toCards(
    sectionOf(sections[6], "cardsSection", language, 6),
  );
  const consultation = toServiceOffer(
    sectionOf(sections[7], "serviceOfferSection", language, 7),
    language,
  );
  const newsletter = toFormCopy(
    sectionOf(sections[8], "formSection", language, 8),
  );

  if (hero.variant !== "split") {
    throw new Error("About 3a wymaga hero w wariancie split.");
  }
  if (metrics.variant !== "approach" || metrics.items.length !== 1) {
    throw new Error("About 3a wymaga jednego wskaźnika 450+ w historii.");
  }
  if (approach.steps.length !== 3) {
    throw new Error("About 3a wymaga trzech paneli podejścia.");
  }
  if (!approach.note) {
    throw new Error("About 3a wymaga uwagi o granicach konsultacji.");
  }
  if (testimonials.items.length !== 2) {
    throw new Error("About 3a pokazuje dwie opinie, bez karuzeli.");
  }
  if (materials.variant !== "links" || materials.items.length !== 2) {
    throw new Error("About 3a wymaga dwóch odnośników do materiałów.");
  }
  if (!consultation.media) {
    throw new Error("About 3a wymaga fotografii przy ofercie konsultacji.");
  }
  if (newsletter.fields.some((field) => field.input === "checkbox") === false) {
    throw new Error("Newsletter strony O mnie wymaga zgody (checkbox).");
  }

  return {
    hero,
    story,
    experience: metrics.items[0],
    credentials,
    approach,
    testimonials,
    materials,
    consultation: { ...consultation, media: consultation.media },
    newsletter,
  };
}
