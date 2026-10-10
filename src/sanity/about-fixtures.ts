import type { Locale } from "@ola/shared";

import {
  aboutCopy,
  aboutContactHref,
  aboutMaterialsHref,
} from "@/content/about-seed";
import { homepageCopy, homepageMediaKeys } from "@/content/homepage-seed";
import {
  authorFixture,
  newsletterFormFixture,
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

export function aboutAuthorFixture(language: Locale) {
  const copy = aboutCopy[language];
  return {
    ...authorFixture(language),
    diplomaScan: media("diploma", copy.diplomaAlt, "photo"),
  };
}

export function aboutSections(language: Locale) {
  const copy = aboutCopy[language];
  const home = homepageCopy[language];
  const author = aboutAuthorFixture(language);
  const service = serviceFixture(language);
  const form = newsletterFormFixture(language);
  const reviews = testimonialFixtures(language).filter(
    (_, index) => index === 3 || index === 5,
  );

  return [
    {
      _key: "about-hero",
      _type: "heroSection",
      variant: "split",
      theme: "light",
      eyebrow: null,
      title: copy.heroTitle,
      lead: copy.heroLead,
      primary: {
        label: copy.heroPrimary,
        href: "#jak-pracuje",
        emphasis: "default",
      },
      secondary: {
        label: copy.heroSecondary,
        href: "#materialy",
        emphasis: "outline",
      },
      media: media(
        homepageMediaKeys.about,
        copy.portraitAlt,
        "portrait",
        copy.portraitCredit,
      ),
    },
    {
      _key: "about-story",
      _type: "textSection",
      eyebrow: null,
      title: copy.storyTitle,
      body: [...copy.storyBody],
    },
    {
      _key: "about-metric",
      _type: "metricsSection",
      variant: "approach",
      title: copy.metricTitle,
      lead: null,
      items: [
        {
          _key: "about-metric-450",
          value: 450,
          suffix: "+",
          label: copy.metricLabel,
        },
      ],
      highlights: [],
    },
    {
      _key: "about-credentials",
      _type: "credentialsSection",
      title: copy.credentialsTitle,
      body: [...copy.credentialsBody],
      diplomaCaption: copy.diplomaCaption,
      person: author,
    },
    {
      _key: "about-approach",
      _type: "processSection",
      title: copy.approachTitle,
      lead: copy.approachLead,
      note: copy.approachNote,
      steps: copy.approachSteps.map((step, index) => ({
        _key: `about-step-${index + 1}`,
        title: step.title,
        body: step.body,
      })),
    },
    {
      _key: "about-testimonials",
      _type: "testimonialsSection",
      title: copy.testimonialsTitle,
      lead: null,
      items: reviews,
    },
    {
      _key: "about-materials",
      _type: "cardsSection",
      variant: "links",
      eyebrow: null,
      title: copy.materialsTitle,
      lead: copy.materialsLead,
      items: [
        {
          _key: "about-resource-ebooks",
          title: copy.materialsEbooksTitle,
          body: copy.materialsEbooksBody,
          href: aboutMaterialsHref(language, "ebooks"),
          status: copy.materialsEbooksStatus,
          media: null,
        },
        {
          _key: "about-resource-blog",
          title: copy.materialsBlogTitle,
          body: copy.materialsBlogBody,
          href: aboutMaterialsHref(language, "blog"),
          status: null,
          media: null,
        },
      ],
    },
    {
      _key: "about-consultation",
      _type: "serviceOfferSection",
      title: copy.consultationTitle,
      body: [copy.consultationBody],
      facts: [...copy.consultationFacts],
      action: {
        label: copy.consultationAction,
        href: service.bookingUrl,
        emphasis: "default",
      },
      secondary: {
        label: copy.consultationContact,
        href: aboutContactHref(language),
        emphasis: "outline",
      },
      media: media(homepageMediaKeys.contact, copy.contactAlt, "photo"),
      service,
    },
    {
      _key: "about-newsletter",
      _type: "formSection",
      eyebrow: null,
      title: home.newsletterTitle,
      lead: home.newsletterLead,
      form,
    },
  ];
}

export function aboutPageFixture(language: Locale) {
  const copy = aboutCopy[language];
  const slug = language === "pl" ? "o-mnie" : "about";
  return {
    id: `page-about-${language}`,
    language,
    slug,
    title: copy.pageTitle,
    seo: { title: copy.seoTitle, description: copy.seoDescription },
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: language === "pl" ? "about" : "o-mnie",
    },
    sections: aboutSections(language),
  };
}
