import { blogCollectionPageFixture } from "./blog-page";
import { contactPageFixture } from "./contact-fixtures";
import type { Locale } from "@ola/shared";

import { aboutPageFixture } from "./about-fixtures";
import {
  demonstrationArticles,
  demonstrationCategories,
  fixtureArticle,
  fixtureArticlesForLanguage,
} from "./blog-collection-fixtures";
import { consultationPageFixture } from "./consultation-fixtures";
import { ebookCollectionPageFixture } from "./ebook-collection-fixtures";
import {
  homepagePageFixture,
  homepageSettingsFixture,
} from "./homepage-fixtures";

export {
  demonstrationArticles,
  demonstrationCategories,
  fixtureArticle,
  fixtureArticlesForLanguage,
};

const formFields = {
  pl: [
    {
      _key: "name",
      name: "name",
      input: "text",
      label: "Imię",
      errorMessage: "Wpisz imię (od 2 do 100 znaków).",
      required: "required",
      options: null,
    },
    {
      _key: "email",
      name: "email",
      input: "email",
      label: "E-mail",
      errorMessage: "Wpisz poprawny adres e-mail.",
      required: "required",
      options: null,
    },
  ],
  en: [
    {
      _key: "name",
      name: "name",
      input: "text",
      label: "Name",
      errorMessage: "Enter a name (2 to 100 characters).",
      required: "required",
      options: null,
    },
    {
      _key: "email",
      name: "email",
      input: "email",
      label: "Email",
      errorMessage: "Enter a valid email address.",
      required: "required",
      options: null,
    },
  ],
};

const forms = {
  pl: {
    id: "demo-form-pl",
    language: "pl" as const,
    title: "Kontakt demonstracyjny",
    submitLabel: "Sprawdź formularz",
    successMessage: "Dane poprawne. Nic nie wysłano.",
    noscriptMessage:
      "Włącz JavaScript, aby sprawdzić formularz demonstracyjny.",
    fields: formFields.pl,
  },
  en: {
    id: "demo-form-en",
    language: "en" as const,
    title: "Demonstration contact",
    submitLabel: "Check the form",
    successMessage: "The details look correct. Nothing was sent.",
    noscriptMessage: "Turn on JavaScript to check the demonstration form.",
    fields: formFields.en,
  },
};

const photo = {
  alt: "Kadr demonstracyjny",
  label: "Kadr demonstracyjny",
  tone: "photo" as const,
  caption: null,
  src: null,
};

export const demonstrationSettings = {
  pl: homepageSettingsFixture("pl"),
  en: homepageSettingsFixture("en"),
};

const workshopSections = {
  pl: [
    {
      _key: "ws-hero",
      _type: "heroSection",
      variant: "editorial",
      theme: "light",
      eyebrow: "Warsztat",
      title: "Jeden dzień na wspólny porządek.",
      lead: "Ustalamy cel, mapujemy proces i wychodzimy z następnym krokiem. To strona demonstracyjna, nie oferta.",
      primary: {
        label: "Zapytaj o warsztat",
        href: "/#contact",
        emphasis: "default",
      },
      secondary: {
        label: "Zobacz kroki",
        href: "#section-ws-process",
        emphasis: "outline",
      },
      media: null,
    },
    {
      _key: "ws-process",
      _type: "processSection",
      title: "Jak wygląda dzień",
      lead: "Numer jest metadaną. Nagłówek etapu niesie nazwę.",
      steps: [
        {
          _key: "s1",
          title: "Cel",
          body: "Co ma się zmienić i po czym poznamy, że zadziałało.",
        },
        {
          _key: "s2",
          title: "Proces",
          body: "Jak praca wygląda dziś, gdzie się zacina i kto decyduje.",
        },
        {
          _key: "s3",
          title: "Następny krok",
          body: "Właściciel, zakres i termin pierwszej zmiany.",
        },
      ],
    },
    {
      _key: "ws-faq",
      _type: "faqSection",
      title: "Pytania przed warsztatem",
      lead: "Odpowiedzi są w HTML. Nic nie wymaga skryptu.",
      items: [
        {
          _key: "q1",
          question: "Czy to szkolenie z narzędzia?",
          answer: "Nie. Najpierw proces i decyzje. Narzędzie jest skutkiem.",
        },
        {
          _key: "q2",
          question: "Czy trzeba przygotować slajdy?",
          answer: "Nie. Pracujemy na waszych sprawach, nie na szablonie.",
        },
      ],
    },
    {
      _key: "ws-cta",
      _type: "ctaSection",
      theme: "dark",
      title: "Chcecie uporządkować start?",
      lead: "Napiszcie. Formularz na stronie głównej nic nie wysyła.",
      action: {
        label: "Do formularza",
        href: "/#contact",
        emphasis: "default",
      },
    },
  ],
  en: [
    {
      _key: "ws-hero",
      _type: "heroSection",
      variant: "editorial",
      theme: "light",
      eyebrow: "Workshop",
      title: "One day to put the work in order.",
      lead: "We set the goal, map the process and leave with a next step. This is a demonstration page, not an offer.",
      primary: {
        label: "Ask about a workshop",
        href: "/en/#contact",
        emphasis: "default",
      },
      secondary: {
        label: "See the steps",
        href: "#section-ws-process",
        emphasis: "outline",
      },
      media: null,
    },
    {
      _key: "ws-process",
      _type: "processSection",
      title: "How the day runs",
      lead: "The number is metadata. The heading carries the name of the step.",
      steps: [
        {
          _key: "s1",
          title: "Goal",
          body: "What should change and how you will know it worked.",
        },
        {
          _key: "s2",
          title: "Process",
          body: "How the work runs today, where it stalls and who decides.",
        },
        {
          _key: "s3",
          title: "Next step",
          body: "An owner, a scope and a date for the first change.",
        },
      ],
    },
    {
      _key: "ws-faq",
      _type: "faqSection",
      title: "Questions before the workshop",
      lead: "The answers live in HTML. Nothing requires a script.",
      items: [
        {
          _key: "q1",
          question: "Is this a tool training?",
          answer:
            "No. Process and decisions come first. The tool is an outcome.",
        },
        {
          _key: "q2",
          question: "Do we need slides?",
          answer: "No. We work on your cases, not on a template.",
        },
      ],
    },
    {
      _key: "ws-cta",
      _type: "ctaSection",
      theme: "dark",
      title: "Ready to order the start?",
      lead: "Write to us. The form on the home page does not send data.",
      action: {
        label: "To the form",
        href: "/en/#contact",
        emphasis: "default",
      },
    },
  ],
};

const implementationSections = {
  pl: [
    {
      _key: "im-hero",
      _type: "heroSection",
      variant: "split",
      theme: "light",
      eyebrow: "Wdrożenie",
      title: "Od ustaleń do rytmu pracy.",
      lead: "Małe wydania, jasne decyzje i przegląd po starcie. Treści są demonstracyjne.",
      primary: {
        label: "Zapytaj o wdrożenie",
        href: "/#contact",
        emphasis: "default",
      },
      secondary: null,
      media: photo,
    },
    {
      _key: "im-text",
      _type: "textImageSection",
      eyebrow: "Zakres",
      title: "Narzędzie wchodzi, gdy proces jest jasny.",
      body: [
        "Ta strona pokazuje składanie sekcji z CMS. Redaktor zmienia kolejność i warianty bez kodu.",
      ],
      mediaPosition: "end",
      media: photo,
    },
    {
      _key: "im-pricing",
      _type: "pricingSection",
      title: "Ramy, nie cennik",
      lead: "To znaczniki hierarchii. Nie są ofertą.",
      plans: [
        {
          _key: "p1",
          name: "Start",
          price: "6 tygodni",
          summary: "Konfiguracja i pierwsze wydanie.",
          emphasis: "featured",
          features: ["Proces", "Szkolenie", "Przegląd"],
          action: {
            label: "Zapytaj",
            href: "/#contact",
            emphasis: "default",
          },
        },
        {
          _key: "p2",
          name: "Opieka",
          price: "miesiąc",
          summary: "Rytm przeglądów po starcie.",
          emphasis: "standard",
          features: ["Retrospektywa", "Korekty", "Wsparcie"],
          action: {
            label: "Zapytaj",
            href: "/#contact",
            emphasis: "default",
          },
        },
      ],
    },
    {
      _key: "im-form",
      _type: "formSection",
      eyebrow: "Kontakt",
      title: "Opiszcie zakres",
      lead: "Formularz nic nie wysyła. Sprawdza tylko pola.",
      form: forms.pl,
    },
  ],
  en: [
    {
      _key: "im-hero",
      _type: "heroSection",
      variant: "split",
      theme: "light",
      eyebrow: "Implementation",
      title: "From decisions to a working rhythm.",
      lead: "Small releases, clear decisions and a review after launch. The copy is demonstrative.",
      primary: {
        label: "Ask about implementation",
        href: "/en/#contact",
        emphasis: "default",
      },
      secondary: null,
      media: photo,
    },
    {
      _key: "im-text",
      _type: "textImageSection",
      eyebrow: "Scope",
      title: "The tool arrives once the process is clear.",
      body: [
        "This page shows CMS section assembly. Editors change order and variants without code.",
      ],
      mediaPosition: "end",
      media: photo,
    },
    {
      _key: "im-pricing",
      _type: "pricingSection",
      title: "Frames, not a price list",
      lead: "These markers show hierarchy. They are not an offer.",
      plans: [
        {
          _key: "p1",
          name: "Start",
          price: "6 weeks",
          summary: "Configuration and the first release.",
          emphasis: "featured",
          features: ["Process", "Training", "Review"],
          action: {
            label: "Ask",
            href: "/en/#contact",
            emphasis: "default",
          },
        },
        {
          _key: "p2",
          name: "Care",
          price: "monthly",
          summary: "A review rhythm after launch.",
          emphasis: "standard",
          features: ["Retro", "Corrections", "Support"],
          action: {
            label: "Ask",
            href: "/en/#contact",
            emphasis: "default",
          },
        },
      ],
    },
    {
      _key: "im-form",
      _type: "formSection",
      eyebrow: "Contact",
      title: "Describe the scope",
      lead: "The form does not send data. It only checks the fields.",
      form: forms.en,
    },
  ],
};

export const demonstrationPages = {
  "pl/kontakt": contactPageFixture("pl"),
  "en/contact": contactPageFixture("en"),
  "pl/home": homepagePageFixture("pl"),
  "en/home": homepagePageFixture("en"),
  "pl/o-mnie": aboutPageFixture("pl"),
  "en/about": aboutPageFixture("en"),
  "pl/konsultacje": consultationPageFixture("pl"),
  "en/consultations": consultationPageFixture("en"),
  "pl/blog": blogCollectionPageFixture("pl"),
  "en/blog": blogCollectionPageFixture("en"),
  "pl/ebooki": ebookCollectionPageFixture("pl"),
  "en/ebooks": ebookCollectionPageFixture("en"),
  "pl/warsztat": {
    id: "demo-workshop-pl",
    language: "pl" as const,
    slug: "warsztat",
    title: "Jeden dzień na wspólny porządek.",
    seo: { title: "Warsztat demonstracyjny", description: null },
    translation: { language: "en" as const, slug: "workshop" },
    sections: workshopSections.pl,
  },
  "en/workshop": {
    id: "demo-workshop-en",
    language: "en" as const,
    slug: "workshop",
    title: "One day to put the work in order.",
    seo: { title: "Demonstration workshop", description: null },
    translation: { language: "pl" as const, slug: "warsztat" },
    sections: workshopSections.en,
  },
  "pl/wdrozenie": {
    id: "demo-impl-pl",
    language: "pl" as const,
    slug: "wdrozenie",
    title: "Od ustaleń do rytmu pracy.",
    seo: { title: "Wdrożenie demonstracyjne", description: null },
    translation: { language: "en" as const, slug: "implementation" },
    sections: implementationSections.pl,
  },
  "en/implementation": {
    id: "demo-impl-en",
    language: "en" as const,
    slug: "implementation",
    title: "From decisions to a working rhythm.",
    seo: { title: "Demonstration implementation", description: null },
    translation: { language: "pl" as const, slug: "wdrozenie" },
    sections: implementationSections.en,
  },
  "pl/tylko-pl": {
    id: "demo-pl-only",
    language: "pl" as const,
    slug: "tylko-pl",
    title: "Strona tylko po polsku",
    seo: { title: "Tylko PL", description: null },
    translation: null,
    sections: [
      {
        _key: "only-hero",
        _type: "heroSection",
        variant: "editorial",
        theme: "light",
        eyebrow: "Bez tłumaczenia",
        title: "Ta strona nie ma wersji angielskiej.",
        lead: "Przełącznik języka jest ukryty. Adres /en/tylko-pl nie istnieje.",
        primary: {
          label: "Strona główna",
          href: "/",
          emphasis: "default",
        },
        secondary: null,
        media: null,
      },
    ],
  },
} as const;

export function fixturePage(language: Locale, slug: string) {
  return demonstrationPages[
    `${language}/${slug}` as keyof typeof demonstrationPages
  ];
}

export function fixturePagesForLanguage(language: Locale) {
  return Object.values(demonstrationPages).filter(
    (page) => page.language === language,
  );
}
