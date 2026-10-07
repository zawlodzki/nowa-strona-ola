import type { Locale } from "@ola/shared";

import { consultationCopy } from "@/content/consultation-seed";
import { homepageCopy, homepageMediaKeys } from "@/content/homepage-seed";
import {
  authorFixture,
  serviceFixture,
  testimonialFixtures,
} from "@/sanity/homepage-fixtures";

function media(
  key: string,
  alt: string,
  tone: "photo" | "portrait" | "diagram" = "photo",
  caption?: string,
) {
  return {
    alt,
    label: alt,
    tone,
    caption: caption ?? null,
    src: key,
  };
}

export function consultationSections(language: Locale) {
  const copy = consultationCopy[language];
  const service = serviceFixture(language);
  const reviews = testimonialFixtures(language).filter(
    (_, index) => index === 3 || index === 5,
  );

  return [
    {
      _key: "consultation-hero",
      _type: "heroSection",
      variant: "split",
      theme: "light",
      eyebrow: null,
      title: copy.heroTitle,
      lead: copy.heroLead,
      primary: {
        label: copy.heroPrimary,
        href: service.bookingUrl,
        emphasis: "default",
      },
      secondary: {
        label: copy.heroSecondary,
        href: "#przebieg",
        emphasis: "outline",
      },
      media: media(
        homepageMediaKeys.hero,
        copy.portraitAlt,
        "portrait",
        copy.portraitCaption,
      ),
    },
    {
      _key: "consultation-path",
      _type: "listSection",
      title: copy.pathTitle,
      lead: null,
      items: [...copy.pathItems],
    },
    {
      _key: "consultation-problem",
      _type: "textImageSection",
      variant: "questions",
      eyebrow: null,
      title: copy.problemTitle,
      lead: null,
      body: [...copy.problemBody],
      mediaPosition: null,
      action: null,
      media: null,
      secondaryMedia: null,
      prompts: [...copy.prompts],
      resolutionEyebrow: copy.resolutionEyebrow,
      resolutionTitle: copy.resolutionTitle,
      caption: copy.mapCaption,
    },
    {
      _key: "consultation-audience",
      _type: "cardsSection",
      variant: "situations",
      eyebrow: null,
      title: copy.audienceTitle,
      lead: copy.audienceLead,
      items: copy.audience.map((item, index) => ({
        _key: `consultation-audience-${index + 1}`,
        title: item.title,
        body: item.body,
        href: null,
        status: null,
        media: null,
      })),
      closing: null,
    },
    {
      _key: "consultation-process",
      _type: "processSection",
      title: copy.processTitle,
      lead: copy.processLead,
      note: copy.preparation,
      steps: copy.processSteps.map((step, index) => ({
        _key: `consultation-step-${index + 1}`,
        title: step.title,
        body: step.body,
      })),
      media: media(
        homepageMediaKeys.contact,
        copy.processAlt,
        "photo",
        copy.processCaption,
      ),
    },
    {
      _key: "consultation-outcomes",
      _type: "cardsSection",
      variant: "goals",
      eyebrow: null,
      title: copy.outcomesTitle,
      lead: copy.outcomesLead,
      items: copy.outcomes.map((item, index) => ({
        _key: `consultation-goal-${index + 1}`,
        title: item.title,
        body: item.body,
        href: null,
        status: null,
        media: null,
      })),
      closing: copy.outcomesClosing,
    },
    {
      _key: "consultation-expert",
      _type: "expertSection",
      title: copy.expertTitle,
      intro: copy.expertIntro,
      body: copy.expertBody,
      metric: {
        value: 450,
        suffix: "+",
        label: homepageCopy[language].metricLabel,
      },
      action: null,
      media: media(homepageMediaKeys.about, copy.expertAlt, "portrait"),
      person: authorFixture(language),
    },
    {
      _key: "consultation-offer",
      _type: "serviceOfferSection",
      title: copy.priceTitle,
      body: [...copy.priceBody],
      facts: [...copy.inclusions],
      note: copy.commitment,
      action: {
        label: copy.heroPrimary,
        href: service.bookingUrl,
        emphasis: "default",
      },
      secondary: null,
      media: null,
      service,
    },
    {
      _key: "consultation-testimonials",
      _type: "testimonialsSection",
      title: copy.reviewsTitle,
      lead: copy.reviewsLead,
      items: reviews,
    },
    {
      _key: "consultation-faq",
      _type: "faqSection",
      title: copy.faqTitle,
      lead: copy.faqLead,
      items: copy.faq.map((item, index) => ({
        _key: `consultation-faq-${index + 1}`,
        question: item.question,
        answer: item.answer,
      })),
    },
  ];
}

export function consultationPageFixture(language: Locale) {
  const copy = consultationCopy[language];
  const slug = language === "pl" ? "konsultacje" : "consultations";
  return {
    id: `page-consultation-${language}`,
    language,
    slug,
    title: copy.pageTitle,
    seo: { title: copy.seoTitle, description: copy.seoDescription },
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: language === "pl" ? "consultations" : "konsultacje",
    },
    sections: consultationSections(language),
  };
}
