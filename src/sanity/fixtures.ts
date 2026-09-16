import type { Locale } from "@ola/shared";

function block(
  key: string,
  text: string,
  style: "normal" | "h2" | "h3" = "normal",
) {
  return {
    _type: "block" as const,
    _key: key,
    style,
    children: [{ _type: "span", text, marks: [] }],
    markDefs: [],
  };
}

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
  pl: {
    id: "siteSettings-pl",
    language: "pl" as const,
    footerNote: "Lokalny prototyp · treści demonstracyjne",
    navigation: [
      { _key: "nav-workshop", label: "Warsztat", href: "/warsztat/" },
      { _key: "nav-impl", label: "Wdrożenie", href: "/wdrozenie/" },
      { _key: "nav-blog", label: "Blog", href: "/blog/" },
      { _key: "nav-ui", label: "Komponenty", href: "/ui/" },
    ],
    translation: { language: "en" as const },
  },
  en: {
    id: "siteSettings-en",
    language: "en" as const,
    footerNote: "Local prototype · demonstration content",
    navigation: [
      { _key: "nav-workshop", label: "Workshop", href: "/en/workshop/" },
      {
        _key: "nav-impl",
        label: "Implementation",
        href: "/en/implementation/",
      },
      { _key: "nav-blog", label: "Blog", href: "/en/blog/" },
      { _key: "nav-ui", label: "Components", href: "/en/ui/" },
    ],
    translation: { language: "pl" as const },
  },
};

const homeSections = {
  pl: [
    {
      _key: "home-hero",
      _type: "heroSection",
      variant: "editorial",
      theme: "light",
      eyebrow: "Strategia · technologia · ludzie",
      title: "Dobry pomysł. Przemyślana realizacja.",
      lead: "Spójne doświadczenie zaczyna się od detali. Sprawdź przykładowy formularz i poznaj sposób naszej pracy.",
      primary: {
        label: "Porozmawiajmy",
        href: "#contact",
        emphasis: "default",
      },
      secondary: null,
      media: null,
    },
    {
      _key: "home-form",
      _type: "formSection",
      eyebrow: "Kontakt demonstracyjny",
      title: "Co chcesz zmienić?",
      lead: "To formularz demonstracyjny. Dane pozostają w przeglądarce i nie są wysyłane.",
      form: forms.pl,
    },
    {
      _key: "home-cta",
      _type: "ctaSection",
      theme: "dark",
      title: "Ten sam system. Inny kontekst.",
      lead: "Jasny i ciemny wariant korzystają ze wspólnych tokenów.",
      action: {
        label: "Wróć do formularza",
        href: "#contact",
        emphasis: "default",
      },
    },
  ],
  en: [
    {
      _key: "home-hero",
      _type: "heroSection",
      variant: "editorial",
      theme: "light",
      eyebrow: "Strategy · technology · people",
      title: "A clear idea. Thoughtful execution.",
      lead: "A consistent experience starts with the details. Explore the example form and discover how we work.",
      primary: { label: "Let’s talk", href: "#contact", emphasis: "default" },
      secondary: null,
      media: null,
    },
    {
      _key: "home-form",
      _type: "formSection",
      eyebrow: "Demonstration contact",
      title: "What would you like to change?",
      lead: "This is a demonstration form. Your data stays in the browser and is not sent.",
      form: forms.en,
    },
    {
      _key: "home-cta",
      _type: "ctaSection",
      theme: "dark",
      title: "One system. A different context.",
      lead: "Light and dark sections share the same design tokens.",
      action: {
        label: "Back to the form",
        href: "#contact",
        emphasis: "default",
      },
    },
  ],
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

const demonstrationPages = {
  "pl/home": {
    id: "demo-home-pl",
    language: "pl" as const,
    slug: "home",
    title: "Dobry pomysł. Przemyślana realizacja.",
    seo: { title: "Próba komponentów — Wonderful" },
    translation: { language: "en" as const, slug: "home" },
    sections: homeSections.pl,
  },
  "en/home": {
    id: "demo-home-en",
    language: "en" as const,
    slug: "home",
    title: "A clear idea. Thoughtful execution.",
    seo: { title: "Component trial — Wonderful" },
    translation: { language: "pl" as const, slug: "home" },
    sections: homeSections.en,
  },
  "pl/warsztat": {
    id: "demo-workshop-pl",
    language: "pl" as const,
    slug: "warsztat",
    title: "Jeden dzień na wspólny porządek.",
    seo: { title: "Warsztat demonstracyjny" },
    translation: { language: "en" as const, slug: "workshop" },
    sections: workshopSections.pl,
  },
  "en/workshop": {
    id: "demo-workshop-en",
    language: "en" as const,
    slug: "workshop",
    title: "One day to put the work in order.",
    seo: { title: "Demonstration workshop" },
    translation: { language: "pl" as const, slug: "warsztat" },
    sections: workshopSections.en,
  },
  "pl/wdrozenie": {
    id: "demo-impl-pl",
    language: "pl" as const,
    slug: "wdrozenie",
    title: "Od ustaleń do rytmu pracy.",
    seo: { title: "Wdrożenie demonstracyjne" },
    translation: { language: "en" as const, slug: "implementation" },
    sections: implementationSections.pl,
  },
  "en/implementation": {
    id: "demo-impl-en",
    language: "en" as const,
    slug: "implementation",
    title: "From decisions to a working rhythm.",
    seo: { title: "Demonstration implementation" },
    translation: { language: "pl" as const, slug: "wdrozenie" },
    sections: implementationSections.en,
  },
  "pl/tylko-pl": {
    id: "demo-pl-only",
    language: "pl" as const,
    slug: "tylko-pl",
    title: "Strona tylko po polsku",
    seo: { title: "Tylko PL" },
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

export const demonstrationCategories = {
  pl: [
    {
      id: "cat-process-pl",
      language: "pl" as const,
      title: "Proces",
      description: "Jak porządkować pracę zanim wejdzie narzędzie.",
      slug: "proces",
      translation: { language: "en" as const, slug: "process" },
    },
    {
      id: "cat-people-pl",
      language: "pl" as const,
      title: "Ludzie",
      description: "Zmiana, która zostaje w zespole.",
      slug: "ludzie",
      translation: { language: "en" as const, slug: "people" },
    },
  ],
  en: [
    {
      id: "cat-process-en",
      language: "en" as const,
      title: "Process",
      description: "How to order the work before a tool arrives.",
      slug: "process",
      translation: { language: "pl" as const, slug: "proces" },
    },
    {
      id: "cat-people-en",
      language: "en" as const,
      title: "People",
      description: "Change that stays with the team.",
      slug: "people",
      translation: { language: "pl" as const, slug: "ludzie" },
    },
  ],
};

const author = {
  pl: {
    name: "Aleksandra Olesiewicz",
    role: "Strategia i wdrożenia",
    slug: "ola",
  },
  en: {
    name: "Aleksandra Olesiewicz",
    role: "Strategy and implementation",
    slug: "ola",
  },
};

function articleBody(language: Locale, slug: string) {
  const pl = language === "pl";
  return [
    block(`${slug}-h2a`, pl ? "Najpierw decyzje" : "Decisions first", "h2"),
    block(
      `${slug}-p1`,
      pl
        ? "Narzędzie nie naprawi niejasnego procesu. Ten wpis jest demonstracyjny i ma spis treści z nagłówków."
        : "A tool will not fix an unclear process. This post is demonstrative and builds a table of contents from headings.",
    ),
    {
      _type: "articleHighlight",
      _key: `${slug}-hi`,
      title: pl ? "Na skróty" : "In short",
      body: pl
        ? "Ustalcie właściciela decyzji, zanim kupicie kolejną licencję."
        : "Name the decision owner before you buy another licence.",
    },
    block(
      `${slug}-h2b`,
      pl ? "Co zostaje po zmianie" : "What remains after the change",
      "h2",
    ),
    block(
      `${slug}-p2`,
      pl
        ? "Zespół powinien umieć utrzymać rytm bez stałej obecności wdrożeniowca."
        : "The team should keep the rhythm without a permanent implementer in the room.",
    ),
    {
      _type: "articleTable",
      _key: `${slug}-table`,
      caption: pl
        ? "Sygnały, że proces działa"
        : "Signals that the process works",
      headers: pl ? ["Sygnał", "Skutek"] : ["Signal", "Effect"],
      rows: [
        {
          cells: pl
            ? ["Wspólna tablica decyzji", "Mniej wracania do slajdów"]
            : ["A shared decision board", "Fewer returns to slides"],
        },
        {
          cells: pl
            ? ["Krótki przegląd tygodnia", "Szybsze korekty"]
            : ["A short weekly review", "Faster corrections"],
        },
      ],
    },
    {
      _type: "articleCta",
      _key: `${slug}-cta`,
      title: pl ? "Chcecie to przećwiczyć?" : "Want to rehearse this?",
      lead: pl
        ? "Warsztat demonstracyjny składa te same sekcje."
        : "The demonstration workshop uses the same sections.",
      action: {
        href: pl ? "/warsztat/" : "/en/workshop/",
        label: pl ? "Zobacz warsztat" : "See the workshop",
      },
    },
  ];
}

const demonstrationArticles = {
  "pl/najpierw-proces": {
    id: "art-process-pl",
    language: "pl" as const,
    slug: "najpierw-proces",
    title: "Najpierw proces, potem CRM",
    lead: "Narzędzie nie naprawi niejasnych decyzji.",
    publishedAt: "2026-09-01T08:00:00.000Z",
    featured: "featured",
    seo: { title: "Najpierw proces, potem CRM" },
    media: photo,
    authors: [author.pl],
    categories: [demonstrationCategories.pl[0]],
    body: articleBody("pl", "proces"),
    sources: [
      {
        _key: "src1",
        title: "Strona warsztatu",
        href: "https://www.zawlodzki.pl/szkolenie-i-wdrozenie-pipedrive",
      },
    ],
    translation: { language: "en" as const, slug: "process-before-crm" },
    related: [] as { title: string; slug: string }[],
  },
  "en/process-before-crm": {
    id: "art-process-en",
    language: "en" as const,
    slug: "process-before-crm",
    title: "Process first, then CRM",
    lead: "A tool will not fix unclear decisions.",
    publishedAt: "2026-09-01T08:00:00.000Z",
    featured: "featured",
    seo: { title: "Process first, then CRM" },
    media: photo,
    authors: [author.en],
    categories: [demonstrationCategories.en[0]],
    body: articleBody("en", "process"),
    sources: [
      {
        _key: "src1",
        title: "Workshop page",
        href: "https://www.zawlodzki.pl/szkolenie-i-wdrozenie-pipedrive",
      },
    ],
    translation: { language: "pl" as const, slug: "najpierw-proces" },
    related: [] as { title: string; slug: string }[],
  },
  "pl/ludzie-w-srodku": {
    id: "art-people-pl",
    language: "pl" as const,
    slug: "ludzie-w-srodku",
    title: "Ludzie w środku zmiany",
    lead: "Narzędzie działa, gdy zespół wie po co.",
    publishedAt: "2026-08-20T08:00:00.000Z",
    featured: "standard",
    seo: { title: "Ludzie w środku zmiany" },
    media: photo,
    authors: [author.pl],
    categories: [demonstrationCategories.pl[1]],
    body: articleBody("pl", "ludzie"),
    sources: [],
    translation: { language: "en" as const, slug: "people-in-the-change" },
    related: [] as { title: string; slug: string }[],
  },
  "en/people-in-the-change": {
    id: "art-people-en",
    language: "en" as const,
    slug: "people-in-the-change",
    title: "People in the middle of change",
    lead: "A tool works when the team knows what it is for.",
    publishedAt: "2026-08-20T08:00:00.000Z",
    featured: "standard",
    seo: { title: "People in the middle of change" },
    media: photo,
    authors: [author.en],
    categories: [demonstrationCategories.en[1]],
    body: articleBody("en", "people"),
    sources: [],
    translation: { language: "pl" as const, slug: "ludzie-w-srodku" },
    related: [] as { title: string; slug: string }[],
  },
  "pl/maly-przeglad": {
    id: "art-review-pl",
    language: "pl" as const,
    slug: "maly-przeglad",
    title: "Mały przegląd zamiast wielkiego startu",
    lead: "Rytm tygodnia utrzymuje zmianę lepiej niż jednorazowe szkolenie.",
    publishedAt: "2026-08-05T08:00:00.000Z",
    featured: "standard",
    seo: { title: "Mały przegląd zamiast wielkiego startu" },
    media: photo,
    authors: [author.pl],
    categories: [demonstrationCategories.pl[0]],
    body: articleBody("pl", "przeglad"),
    sources: [],
    translation: { language: "en" as const, slug: "small-review" },
    related: [] as { title: string; slug: string }[],
  },
  "en/small-review": {
    id: "art-review-en",
    language: "en" as const,
    slug: "small-review",
    title: "A small review instead of a big launch",
    lead: "A weekly rhythm keeps the change better than a one-off training.",
    publishedAt: "2026-08-05T08:00:00.000Z",
    featured: "standard",
    seo: { title: "A small review instead of a big launch" },
    media: photo,
    authors: [author.en],
    categories: [demonstrationCategories.en[0]],
    body: articleBody("en", "review"),
    sources: [],
    translation: { language: "pl" as const, slug: "maly-przeglad" },
    related: [] as { title: string; slug: string }[],
  },
};

function withRelated<T extends { language: Locale; slug: string }>(
  articles: Record<string, T & { related: unknown[] }>,
) {
  const list = Object.values(articles);
  for (const article of list) {
    article.related = list
      .filter(
        (item) =>
          item.language === article.language && item.slug !== article.slug,
      )
      .slice(0, 2);
  }
  return articles;
}

withRelated(demonstrationArticles);

export function fixturePage(language: Locale, slug: string) {
  return demonstrationPages[
    `${language}/${slug}` as keyof typeof demonstrationPages
  ];
}

export function fixtureArticle(language: Locale, slug: string) {
  return demonstrationArticles[
    `${language}/${slug}` as keyof typeof demonstrationArticles
  ];
}

export function fixturePagesForLanguage(language: Locale) {
  return Object.values(demonstrationPages).filter(
    (page) => page.language === language,
  );
}

export function fixtureArticlesForLanguage(language: Locale) {
  return Object.values(demonstrationArticles)
    .filter((article) => article.language === language)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}
