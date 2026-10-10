import type { Locale } from "@ola/shared";

import {
  blogIndexSettingsFixture,
  blogNewsletterSettingsFixture,
} from "@/content/blog-collection-seed";
import {
  DISPLAY_LABEL_COOPERATION,
  EBOOK_SEED,
  homepageCopy,
  footerLegalLinks,
  homepageHeaderCta,
  homepageMediaKeys,
  homepageNavigation,
  TESTIMONIAL_QUOTES_EN,
  TESTIMONIAL_QUOTES_PL,
} from "@/content/homepage-seed";
import { footerSocialLinks } from "@/content/social-profiles";
import { consultationPath, ebookCollectionPath } from "@/lib/paths";

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

export function newsletterFormFixture(language: Locale) {
  const copy = homepageCopy[language];
  return {
    id: `newsletter-form-${language}`,
    language,
    title:
      language === "pl"
        ? "Newsletter demonstracyjny"
        : "Demonstration newsletter",
    submitLabel: copy.newsletterSubmit,
    successMessage: copy.newsletterSuccess,
    noscriptMessage: copy.newsletterNoscript,
    fields: [
      {
        _key: "email",
        name: "email",
        input: "email",
        label: copy.emailLabel,
        placeholder: copy.emailPlaceholder,
        errorMessage: copy.emailError,
        required: "required",
        options: null,
      },
      {
        _key: "consent",
        name: "consent",
        input: "checkbox",
        label: copy.consentLabel,
        errorMessage: copy.consentError,
        required: "required",
        options: null,
      },
    ],
  };
}

export function authorFixture(language: Locale) {
  return {
    id: `author-ola-${language}`,
    language,
    name: "Aleksandra Olesiewicz",
    slug: "aleksandra-olesiewicz",
    role: language === "pl" ? "Dietetyczka kliniczna" : "Clinical dietitian",
    bio:
      language === "pl"
        ? "Specjalizuję się w PCOS i insulinooporności. Pomagam uporządkować odżywianie i wybrać kolejne kroki dopasowane do Twojego życia. Znam PCOS także z własnego doświadczenia."
        : "I specialise in PCOS and insulin resistance. I help you organise nutrition and choose next steps that fit your life. I also know PCOS from my own experience.",
    educationInstitution: "Śląski Uniwersytet Medyczny",
    educationProgram:
      language === "pl" ? "Dietetyka kliniczna" : "Clinical dietetics",
    photo: media(
      homepageMediaKeys.about,
      language === "pl"
        ? "Aleksandra Olesiewicz, dietetyczka kliniczna"
        : "Aleksandra Olesiewicz, clinical dietitian",
      "portrait",
    ),
  };
}

export function serviceFixture(language: Locale) {
  const copy = homepageCopy[language];
  return {
    id: `service-consultation-${language}`,
    language,
    title:
      language === "pl"
        ? "Konsultacja dietetyczna online"
        : "Online dietetic consultation",
    slug: language === "pl" ? "konsultacja" : "consultation",
    summary: copy.serviceSummary,
    price: 450,
    currency: "PLN",
    durationMinutes: 60,
    bookingUrl: "https://cal.com",
    bookingStatus: "placeholder",
  };
}

export function ebookFixtures(language: Locale) {
  const author = authorFixture(language);
  return EBOOK_SEED.map((ebook) => ({
    id: `ebook-${ebook.slug.pl}-${language}`,
    language,
    slug: ebook.slug[language],
    title: ebook.title[language],
    subtitle: ebook.subtitle[language],
    topic: ebook.topic,
    cardDescription: ebook.description[language],
    coverTone: ebook.coverTone,
    availability: "planned" as const,
    priceGross: 97,
    currency: "PLN",
    format: "pdf",
    sortOrder: ebook.sortOrder,
    cover: media(
      `cover-${ebook.slug.pl}`,
      language === "pl"
        ? `Kontrolowana okładka: ${ebook.title.pl}`
        : `Controlled cover: ${ebook.title.en}`,
      "diagram",
    ),
    authorName: author.name,
  }));
}

export function testimonialFixtures(language: Locale) {
  const quotes =
    language === "pl" ? TESTIMONIAL_QUOTES_PL : TESTIMONIAL_QUOTES_EN;
  return quotes.map((quote, index) => ({
    id: `testimonial-${language}-${index + 1}`,
    language,
    quote,
    anonymous: true,
    displayLabel: DISPLAY_LABEL_COOPERATION[language],
    name: null,
    role: null,
    scope: "cooperation" as const,
  }));
}

export function homepageSettingsFixture(language: Locale) {
  const copy = homepageCopy[language];
  return {
    id: `siteSettings-${language}`,
    language,
    siteTitle: copy.siteTitle,
    contactEmail: null,
    footerNote: copy.footerNote,
    defaultSeo: { title: copy.seoTitle, description: copy.seoDescription },
    navigation: homepageNavigation(language),
    headerCta: homepageHeaderCta(language),
    legalLinks: footerLegalLinks(language),
    socialLinks: footerSocialLinks(),
    blogIndex: blogIndexSettingsFixture(language),
    blogNewsletter: blogNewsletterSettingsFixture(
      language,
      newsletterFormFixture(language),
    ),
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
    },
  };
}

export function homepageSections(language: Locale) {
  const copy = homepageCopy[language];
  const ebooks = ebookFixtures(language);
  const testimonials = testimonialFixtures(language);
  const service = serviceFixture(language);
  const form = newsletterFormFixture(language);
  const ebookAnchor = language === "pl" ? "ebooki" : "ebooki";

  return [
    {
      _key: "home-hero",
      _type: "heroSection",
      variant: "split",
      theme: "light",
      eyebrow: null,
      title: copy.heroTitle,
      lead: copy.heroLead,
      primary: {
        label: copy.heroPrimary,
        href: `#${ebookAnchor}`,
        emphasis: "default",
      },
      secondary: {
        label: copy.heroSecondary,
        href: consultationPath(language),
        emphasis: "outline",
      },
      media: media(
        homepageMediaKeys.hero,
        language === "pl"
          ? "Aleksandra Olesiewicz, dietetyczka"
          : "Aleksandra Olesiewicz, dietitian",
        "portrait",
      ),
    },
    {
      _key: "home-audience",
      _type: "audienceSection",
      title: copy.audienceTitle,
      lead: copy.audienceLead,
      items: copy.audienceItems.map((item) => ({
        _key: item.key,
        title: item.title,
        body: item.body,
        icon: item.icon,
      })),
    },
    {
      _key: "home-approach",
      _type: "metricsSection",
      variant: "approach",
      title: copy.approachTitle,
      lead: copy.approachLead,
      items: [
        {
          _key: "metric-450",
          value: 450,
          suffix: "+",
          label: copy.metricLabel,
        },
      ],
      highlights: copy.highlights.map((item, index) => ({
        _key: `highlight-${index + 1}`,
        title: item.title,
        body: item.body,
      })),
    },
    {
      _key: "home-about",
      _type: "textImageSection",
      eyebrow: null,
      title: copy.aboutTitle,
      lead: copy.aboutLead,
      body: [...copy.aboutBody],
      action: {
        label: copy.aboutAction,
        href: language === "pl" ? "/o-mnie/" : "/en/about/",
        emphasis: "default",
      },
      mediaPosition: "start",
      media: media(
        homepageMediaKeys.about,
        language === "pl"
          ? "Portret Aleksandry Olesiewicz"
          : "Portrait of Aleksandra Olesiewicz",
        "portrait",
      ),
      secondaryMedia: media(
        homepageMediaKeys.food,
        language === "pl"
          ? "Kolorowy posiłek z warzywami i pieczywem"
          : "A colourful meal with vegetables and bread",
      ),
    },
    {
      _key: "home-ebooks",
      _type: "ebooksSection",
      title: copy.ebooksTitle,
      lead: copy.ebooksLead,
      cardActionLabel: copy.ebooksCardAction,
      note: copy.ebooksNote,
      collection: {
        label: copy.ebooksCollection,
        href: ebookCollectionPath(language),
        emphasis: "default",
      },
      items: ebooks,
    },
    {
      _key: "home-consultation",
      _type: "serviceOfferSection",
      title: copy.consultationTitle,
      body: [copy.consultationBody],
      facts: [...copy.consultationFacts],
      action: {
        label: copy.consultationAction,
        href: "https://cal.com",
        emphasis: "default",
      },
      media: media(
        homepageMediaKeys.contact,
        language === "pl"
          ? "Aleksandra Olesiewicz podczas pracy przy laptopie"
          : "Aleksandra Olesiewicz working at a laptop",
        "photo",
      ),
      service,
    },
    {
      _key: "home-testimonials",
      _type: "testimonialsSection",
      title: copy.testimonialsTitle,
      lead: copy.testimonialsLead,
      items: testimonials,
    },
    {
      _key: "home-newsletter",
      _type: "formSection",
      eyebrow: null,
      title: copy.newsletterTitle,
      lead: copy.newsletterLead,
      form,
    },
  ];
}

export function homepagePageFixture(language: Locale) {
  const copy = homepageCopy[language];
  return {
    id: `page-home-${language}`,
    language,
    slug: "home",
    title: copy.pageTitle,
    seo: { title: copy.seoTitle, description: copy.seoDescription },
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: "home",
    },
    sections: homepageSections(language),
  };
}

export function homepageCopyright(language: Locale) {
  const year = 2026;
  return language === "pl"
    ? `© ${year} ${homepageCopy.pl.copyright}`
    : `© ${year} ${homepageCopy.en.copyright}`;
}
