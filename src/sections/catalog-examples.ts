import type { Locale } from "@ola/shared";

import {
  catalogSectionIds,
  type CatalogCopy,
  type CatalogSectionId,
} from "./types";

const pl: CatalogCopy = {
  tocLabel: "Spis sekcji",
  sections: {
    hero: "Hero",
    text: "Tekst",
    "text-image": "Tekst i obraz",
    cards: "Karty",
    list: "Lista",
    process: "Proces",
    metrics: "Liczby",
    pricing: "Pakiety",
    testimonials: "Opinie",
    expert: "Ekspert",
    faq: "FAQ",
    comparison: "Porównanie",
    quote: "Cytat",
    cta: "Wezwanie",
    form: "Formularz",
    media: "Media",
    related: "Powiązane artykuły",
  },
  heroEditorial: {
    variant: "editorial",
    eyebrow: "Wariant editorial",
    title: "Jedna myśl. Reszta jest tłem.",
    lead: "Hero bez medium: nadtytuł, tytuł, opis i najwyżej dwie akcje. Tytuł w katalogu nie jest H1 strony.",
    primary: { href: "#section-form", label: "Zobacz formularz" },
    secondary: {
      href: "#section-text",
      label: "Czytaj dalej",
      variant: "outline",
    },
  },
  heroCinematic: {
    variant: "cinematic",
    theme: "dark",
    eyebrow: "Wariant cinematic",
    title: "Ciemna scena. Jasny komunikat.",
    lead: "Bez filmu w katalogu. Tło jest zarezerwowane, tekst i CTA pozostają w HTML.",
    primary: { href: "#section-cta", label: "Przejdź do wezwania" },
  },
  heroSplit: {
    variant: "split",
    eyebrow: "Wariant split",
    title: "Treść pierwsza. Medium obok.",
    lead: "Na wąskim ekranie układ schodzi do stosu. Opis obrazu nie jest w grafice.",
    primary: { href: "#section-text-image", label: "Tekst i obraz" },
    media: { label: "Kadr demonstracyjny hero split", tone: "photo" },
  },
  text: {
    eyebrow: "Redakcja",
    title: "Tekst ma rytm i szerokość do czytania.",
    body: [
      "Sekcja tekstowa niesie znaczenie bez dekoracji. Akapity korzystają z tej samej hierarchii co reszta strony: jeden H2, treść do 68 znaków szerokości optycznej, bez wymuszonych podziałów wiersza.",
      "Na mobile font pozostaje czytelny. Reduced motion nic tu nie ukrywa, bo nie ma ruchu wymaganego do zrozumienia treści.",
    ],
  },
  textImage: {
    variant: "photo",
    eyebrow: "Układ",
    title: "Obraz tłumaczy, tekst prowadzi.",
    body: [
      "Wariant tekst–obraz składa treść i zarezerwowane medium. Na desktopie dwie kolumny, na mobile treść zostaje nad kadrą.",
    ],
    media: {
      label: "Ilustracja demonstracyjna sekcji tekst–obraz",
      tone: "photo",
      caption: "Kadr zastępczy. Docelowe zdjęcia wejdą z CMS.",
    },
    mediaPosition: "end",
  },
  cards: {
    variant: "media",
    eyebrow: "Siatka",
    title: "Trzy karty. Jedna akcja każda.",
    lead: "Na desktopie siatka, na wąskim ekranie poziomy snap. Hover powiększa tylko medium.",
    items: [
      {
        title: "Strategia przed narzędziem",
        body: "Najpierw cel i proces, potem konfiguracja.",
        href: "#section-process",
        media: { label: "Karta strategii", tone: "photo" },
      },
      {
        title: "Wdrożenie bez szumu",
        body: "Małe etapy, jasne decyzje, mierzalny skutek.",
        href: "#section-list",
        media: { label: "Karta wdrożenia", tone: "diagram" },
      },
      {
        title: "Ludzie w środku zmiany",
        body: "Narzędzie działa, gdy zespół wie po co.",
        href: "#section-expert",
        media: { label: "Karta zespołu", tone: "portrait" },
      },
    ],
  },
  list: {
    title: "Co zostaje po warsztacie",
    lead: "Lista jest zwykłym HTML. Znaczenie nie zależy od ikon.",
    items: [
      "Ustalony cel i zakres pierwszej zmiany",
      "Mapa procesu, który naprawdę działa dziś",
      "Kryteria, po których poznacie postęp",
      "Następny krok z właścicielem i terminem",
    ],
  },
  process: {
    title: "Cztery kroki, bez skrótów",
    lead: "Numer jest metadaną. Nagłówek etapu niesie nazwę.",
    steps: [
      { title: "Rozmowa", body: "Cel, ograniczenia i to, czego nie robimy." },
      { title: "Porządek", body: "Proces, dane i decyzje w jednym miejscu." },
      { title: "Wdrożenie", body: "Małe wydania zamiast wielkiego startu." },
      { title: "Utrzymanie", body: "Rytm przeglądów, nie jednorazowy efekt." },
    ],
  },
  metrics: {
    variant: "grid",
    title: "Liczby, które da się obronić",
    lead: "Czytnik dostaje wartość końcową od razu. Animacja jest dekoracją.",
    items: [
      { value: 12, suffix: "", label: "lat pracy z zespołami sprzedaży" },
      { value: 40, suffix: "+", label: "wdrożeń procesów i narzędzi" },
      { value: 5, suffix: " dni", label: "do pierwszego czytelnego prototypu" },
    ],
    highlights: [],
  },
  pricing: {
    title: "Pakiety demonstracyjne",
    lead: "To przykłady układu, nie oferta. Ceny są znacznikami hierarchii.",
    plans: [
      {
        name: "Warsztat",
        price: "1 dzień",
        summary: "Wspólne uporządkowanie celu i procesu.",
        features: ["Mapa procesu", "Lista decyzji", "Następny krok"],
        action: { href: "#section-form", label: "Zapytaj o warsztat" },
      },
      {
        name: "Wdrożenie",
        price: "6 tygodni",
        summary: "Od ustaleń do działającego rytmu pracy.",
        features: ["Konfiguracja", "Szkolenie zespołu", "Przegląd po starcie"],
        featured: true,
        action: { href: "#section-form", label: "Zapytaj o wdrożenie" },
      },
      {
        name: "Opieka",
        price: "miesiąc",
        summary: "Stały przegląd, gdy zmiana już działa.",
        features: ["Retrospektywa", "Korekty procesu", "Wsparcie redakcji"],
        action: { href: "#section-form", label: "Zapytaj o opiekę" },
      },
    ],
  },
  testimonials: {
    title: "Głos po współpracy",
    items: [
      {
        quote: "Wreszcie wiemy, po czym poznać, że proces działa.",
        name: "Anna Kwiatkowska",
        role: "Dyrektorka sprzedaży",
        anonymous: false,
        scope: "cooperation",
      },
      {
        quote:
          "Szkolenie nie było pokazem narzędzia. Było pracą na naszych sprawach.",
        name: "Marek Lis",
        role: "Head of Operations",
        anonymous: false,
        scope: "cooperation",
      },
      {
        quote: "Zespół sam utrzymuje rytm. Nie wracamy do starych arkuszy.",
        name: "Julia Berg",
        role: "COO",
        anonymous: false,
        scope: "cooperation",
      },
    ],
  },
  expert: {
    title: "Osoba, nie slajd",
    name: "Aleksandra Olesiewicz",
    role: "Strategia, wdrożenia, ludzie w procesie",
    body: "Pracuję z zespołami, które chcą uporządkować sprzedaż i współpracę. Narzędzie jest skutkiem, nie celem.",
    media: { label: "Portret demonstracyjny", tone: "portrait" },
    action: { href: "#section-form", label: "Umów rozmowę" },
  },
  faq: {
    title: "Pytania, które wracają",
    lead: "Natywne details i summary. Treść jest w HTML, także bez skryptów.",
    items: [
      {
        question: "Czy to gotowa oferta?",
        answer:
          "Nie. To demonstracyjny układ sekcji. Treści i ceny pojawią się w CMS.",
      },
      {
        question: "Czy animacja jest wymagana?",
        answer:
          "Nie. Przy reduced motion widać pełny, statyczny stan. Bez JS treść też zostaje.",
      },
      {
        question: "Gdzie jest wersja angielska?",
        answer:
          "Na razie nie ma. Wersja angielska jest wyłączona, bez polskiego fallbacku.",
      },
      {
        question: "Czy formularz coś wysyła?",
        answer: "Nie. Sprawdza pola w przeglądarce i nic nie przesyła.",
      },
    ],
  },
  comparison: {
    title: "Co wybieracie na start",
    lead: "Tabela ma podpis i nagłówki kolumn. Na wąskim ekranie przewija się poziomo.",
    rowHeading: "Zakres",
    columns: ["Warsztat", "Wdrożenie", "Opieka"],
    rows: [
      { feature: "Cel i zakres", values: ["Tak", "Tak", "Przegląd"] },
      { feature: "Konfiguracja narzędzia", values: ["Nie", "Tak", "Korekty"] },
      {
        feature: "Szkolenie zespołu",
        values: ["Szkic", "Tak", "W razie potrzeby"],
      },
      { feature: "Stały rytm", values: ["Nie", "Start", "Tak"] },
    ],
  },
  quote: {
    theme: "dark",
    quote: "Najpierw zrozumieć pracę. Potem dopiero ją przyspieszyć.",
    attribution: "Zasada współpracy",
  },
  cta: {
    theme: "dark",
    title: "Gotowi uporządkować następny krok?",
    lead: "To wezwanie z katalogu. Prowadzi do demonstracyjnego formularza na tej stronie.",
    action: { href: "#section-form", label: "Napisz" },
  },
  form: {
    eyebrow: "Kontakt demonstracyjny",
    title: "Co chcesz zmienić?",
    lead: "Dane zostają w przeglądarce. Nic nie jest wysyłane.",
    nameLabel: "Imię",
    nameError: "Wpisz imię (od 2 do 100 znaków).",
    emailLabel: "E-mail",
    emailError: "Wpisz poprawny adres e-mail.",
    submit: "Sprawdź formularz",
    success: "Dane poprawne. Nic nie wysłano.",
    noscript: "Włącz JavaScript, aby sprawdzić formularz demonstracyjny.",
    fields: [
      {
        name: "name",
        input: "text",
        label: "Imię",
        errorMessage: "Wpisz imię (od 2 do 100 znaków).",
        required: true,
      },
      {
        name: "email",
        input: "email",
        label: "E-mail",
        errorMessage: "Wpisz poprawny adres e-mail.",
        required: true,
      },
    ],
  },
  media: {
    title: "Obraz z podpisem i film z zewnątrz",
    lead: "Brak lokalnej kopii materiałów Wonderful. Film jest odnośnikiem, nie osadzonym odtwarzaczem.",
    image: {
      label: "Zdjęcie demonstracyjne z podpisem",
      tone: "photo",
      caption: "Podpis należy do treści. Alt opisuje kadr, nie dekorację.",
    },
    video: {
      title: "Rozmowa o procesie (przykład)",
      href: "https://vimeo.com",
      platform: "Vimeo",
    },
  },
  related: {
    title: "Powiązane wpisy",
    items: [
      {
        title: "Najpierw proces, potem CRM",
        excerpt: "Narzędzie nie naprawi niejasnych decyzji.",
        href: "#section-text",
        date: "12 wrz 2026",
        datetime: "2026-09-12",
        media: { label: "Okładka artykułu o procesie", tone: "photo" },
      },
      {
        title: "Jak rozmawiać o wdrożeniu",
        excerpt: "Cel, zakres i to, czego nie robimy.",
        href: "#section-process",
        date: "5 wrz 2026",
        datetime: "2026-09-05",
        media: { label: "Okładka artykułu o rozmowie", tone: "diagram" },
      },
      {
        title: "Rytm, który zostaje",
        excerpt: "Przegląd po starcie jest częścią pracy.",
        href: "#section-list",
        date: "28 sie 2026",
        datetime: "2026-08-28",
        media: { label: "Okładka artykułu o rytmie", tone: "portrait" },
      },
    ],
  },
};

const en: CatalogCopy = {
  tocLabel: "Section list",
  sections: {
    hero: "Hero",
    text: "Text",
    "text-image": "Text and image",
    cards: "Cards",
    list: "List",
    process: "Process",
    metrics: "Metrics",
    pricing: "Pricing",
    testimonials: "Testimonials",
    expert: "Expert",
    faq: "FAQ",
    comparison: "Comparison",
    quote: "Quote",
    cta: "Call to action",
    form: "Form",
    media: "Media",
    related: "Related articles",
  },
  heroEditorial: {
    variant: "editorial",
    eyebrow: "Editorial variant",
    title: "One idea. Everything else is support.",
    lead: "A hero without media: eyebrow, title, copy and at most two actions. The catalog title is not the page H1.",
    primary: { href: "#section-form", label: "See the form" },
    secondary: {
      href: "#section-text",
      label: "Keep reading",
      variant: "outline",
    },
  },
  heroCinematic: {
    variant: "cinematic",
    theme: "dark",
    eyebrow: "Cinematic variant",
    title: "A dark scene. A clear message.",
    lead: "No video in the catalog. The background is reserved; copy and actions stay in HTML.",
    primary: { href: "#section-cta", label: "Go to the call to action" },
  },
  heroSplit: {
    variant: "split",
    eyebrow: "Split variant",
    title: "Copy first. Media beside it.",
    lead: "On a narrow screen the layout stacks. The image meaning is not painted into the graphic.",
    primary: { href: "#section-text-image", label: "Text and image" },
    media: { label: "Demonstration frame for the split hero", tone: "photo" },
  },
  text: {
    eyebrow: "Editorial",
    title: "Copy needs rhythm and a readable measure.",
    body: [
      "A text section carries meaning without decoration. One H2, paragraphs within a 68-character measure, no forced line breaks for layout.",
      "On mobile the type stays readable. Reduced motion hides nothing, because understanding does not depend on movement.",
    ],
  },
  textImage: {
    variant: "photo",
    eyebrow: "Layout",
    title: "The image explains. The copy leads.",
    body: [
      "Text and image sit in two columns on desktop. On mobile the copy stays above the reserved frame.",
    ],
    media: {
      label: "Demonstration illustration for the text-and-image section",
      tone: "photo",
      caption:
        "Placeholder frame. Production photographs will come from the CMS.",
    },
    mediaPosition: "end",
  },
  cards: {
    variant: "media",
    eyebrow: "Grid",
    title: "Three cards. One action each.",
    lead: "A grid on desktop, a snap row on a narrow screen. Hover scales the media only.",
    items: [
      {
        title: "Strategy before the tool",
        body: "Purpose and process first, configuration second.",
        href: "#section-process",
        media: { label: "Strategy card", tone: "photo" },
      },
      {
        title: "Implementation without noise",
        body: "Small stages, clear decisions, a measurable result.",
        href: "#section-list",
        media: { label: "Implementation card", tone: "diagram" },
      },
      {
        title: "People inside the change",
        body: "A tool works when the team knows why.",
        href: "#section-expert",
        media: { label: "Team card", tone: "portrait" },
      },
    ],
  },
  list: {
    title: "What remains after the workshop",
    lead: "The list is plain HTML. Meaning does not depend on icons.",
    items: [
      "A shared goal and the scope of the first change",
      "A map of the process that actually runs today",
      "Signals you will use to recognise progress",
      "A next step with an owner and a date",
    ],
  },
  process: {
    title: "Four steps, no shortcuts",
    lead: "The number is metadata. The heading carries the name of the stage.",
    steps: [
      {
        title: "Conversation",
        body: "The goal, the constraints, and what we will not do.",
      },
      { title: "Order", body: "Process, data and decisions in one place." },
      {
        title: "Implementation",
        body: "Small releases instead of a single launch.",
      },
      { title: "Care", body: "A review rhythm, not a one-off effect." },
    ],
  },
  metrics: {
    variant: "grid",
    title: "Numbers you can stand behind",
    lead: "Assistive technology gets the final value immediately. The count-up is decoration.",
    items: [
      { value: 12, suffix: "", label: "years with sales teams" },
      { value: 40, suffix: "+", label: "process and tool implementations" },
      { value: 5, suffix: " days", label: "to a first readable prototype" },
    ],
    highlights: [],
  },
  pricing: {
    title: "Demonstration packages",
    lead: "This is a layout example, not an offer. Prices mark hierarchy only.",
    plans: [
      {
        name: "Workshop",
        price: "1 day",
        summary: "A shared picture of the goal and the process.",
        features: ["Process map", "Decision list", "Next step"],
        action: { href: "#section-form", label: "Ask about a workshop" },
      },
      {
        name: "Implementation",
        price: "6 weeks",
        summary: "From the brief to a working rhythm.",
        features: ["Configuration", "Team training", "Review after launch"],
        featured: true,
        action: { href: "#section-form", label: "Ask about implementation" },
      },
      {
        name: "Care",
        price: "month",
        summary: "A steady review once the change is live.",
        features: ["Retrospective", "Process corrections", "Editorial support"],
        action: { href: "#section-form", label: "Ask about care" },
      },
    ],
  },
  testimonials: {
    title: "After the work",
    items: [
      {
        quote: "We finally know how to tell whether the process is working.",
        name: "Anna Kwiatkowska",
        role: "Sales director",
        anonymous: false,
        scope: "cooperation",
      },
      {
        quote: "The training was not a product tour. It was work on our cases.",
        name: "Marek Lis",
        role: "Head of Operations",
        anonymous: false,
        scope: "cooperation",
      },
      {
        quote: "The team keeps the rhythm. We are not back in the old sheets.",
        name: "Julia Berg",
        role: "COO",
        anonymous: false,
        scope: "cooperation",
      },
    ],
  },
  expert: {
    title: "A person, not a slide",
    name: "Aleksandra Olesiewicz",
    role: "Strategy, implementation, people in the process",
    body: "I work with teams that need to put order into sales and collaboration. The tool is an outcome, not the goal.",
    media: { label: "Demonstration portrait", tone: "portrait" },
    action: { href: "#section-form", label: "Book a conversation" },
  },
  faq: {
    title: "Questions that return",
    lead: "Native details and summary. The answers live in HTML, including without JavaScript.",
    items: [
      {
        question: "Is this a finished offer?",
        answer:
          "No. This is a demonstration layout. Copy and prices will come from the CMS.",
      },
      {
        question: "Is motion required?",
        answer:
          "No. Reduced motion keeps a complete static state. Without JavaScript the copy remains.",
      },
      {
        question: "Where is the English version?",
        answer:
          "At /en/ui/. Missing translation means no page, with no Polish fallback.",
      },
      {
        question: "Does the form send anything?",
        answer: "No. It checks fields in the browser and does not submit.",
      },
    ],
  },
  comparison: {
    title: "What you start with",
    lead: "The table has a caption and column headers. On a narrow screen it scrolls horizontally.",
    rowHeading: "Scope",
    columns: ["Workshop", "Implementation", "Care"],
    rows: [
      { feature: "Goal and scope", values: ["Yes", "Yes", "Review"] },
      { feature: "Tool configuration", values: ["No", "Yes", "Corrections"] },
      { feature: "Team training", values: ["Sketch", "Yes", "If needed"] },
      { feature: "Steady rhythm", values: ["No", "Launch", "Yes"] },
    ],
  },
  quote: {
    theme: "dark",
    quote: "Understand the work first. Speed it up second.",
    attribution: "A working principle",
  },
  cta: {
    theme: "dark",
    title: "Ready to order the next step?",
    lead: "This call to action lives in the catalog. It leads to the demonstration form on this page.",
    action: { href: "#section-form", label: "Write" },
  },
  form: {
    eyebrow: "Demonstration contact",
    title: "What would you like to change?",
    lead: "Your details stay in the browser. Nothing is sent.",
    nameLabel: "Name",
    nameError: "Enter a name (2 to 100 characters).",
    emailLabel: "E-mail",
    emailError: "Enter a valid email address.",
    submit: "Check the form",
    success: "Details valid. Nothing was sent.",
    noscript: "Enable JavaScript to try the demonstration form.",
    fields: [
      {
        name: "name",
        input: "text",
        label: "Name",
        errorMessage: "Enter a name (2 to 100 characters).",
        required: true,
      },
      {
        name: "email",
        input: "email",
        label: "E-mail",
        errorMessage: "Enter a valid email address.",
        required: true,
      },
    ],
  },
  media: {
    title: "An image with a caption and an external film",
    lead: "Wonderful media are not copied here. The film is a link, not an embedded player.",
    image: {
      label: "Demonstration photograph with a caption",
      tone: "photo",
      caption:
        "The caption is part of the content. The accessible name describes the frame.",
    },
    video: {
      title: "A conversation about process (example)",
      href: "https://vimeo.com",
      platform: "Vimeo",
    },
  },
  related: {
    title: "Related articles",
    items: [
      {
        title: "Process first, then the CRM",
        excerpt: "A tool will not repair unclear decisions.",
        href: "#section-text",
        date: "12 Sep 2026",
        datetime: "2026-09-12",
        media: { label: "Article cover about process", tone: "photo" },
      },
      {
        title: "How to talk about implementation",
        excerpt: "The goal, the scope, and what you will not do.",
        href: "#section-process",
        date: "5 Sep 2026",
        datetime: "2026-09-05",
        media: {
          label: "Article cover about the conversation",
          tone: "diagram",
        },
      },
      {
        title: "A rhythm that remains",
        excerpt: "The review after launch is part of the work.",
        href: "#section-list",
        date: "28 Aug 2026",
        datetime: "2026-08-28",
        media: { label: "Article cover about rhythm", tone: "portrait" },
      },
    ],
  },
};

const copies: Record<Locale, CatalogCopy> = { pl, en };

export function catalogCopy(lang: Locale): CatalogCopy {
  return copies[lang];
}

export function catalogToc(
  lang: Locale,
): { id: CatalogSectionId; label: string }[] {
  const copy = catalogCopy(lang);
  return catalogSectionIds.map((id) => ({ id, label: copy.sections[id] }));
}
