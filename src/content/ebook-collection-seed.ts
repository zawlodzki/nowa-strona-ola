import type { Locale } from "@ola/shared";

export const ebookCollectionCopy = {
  pl: {
    pageTitle: "E-booki | Aleksandra Olesiewicz",
    seoTitle: "E-booki | Aleksandra Olesiewicz",
    seoDescription:
      "Kolekcja e-booków Aleksandry Olesiewicz o PCOS i perimenopauzie. Copy i UX kolekcji są propozycją do zatwierdzenia.",
    title: "Więcej jasności.\nW Twoim tempie.",
    lead: "PCOS, perimenopauza i codzienne wybory. E-booki, do których możesz wracać, kiedy potrzebujesz uporządkować pytania i znaleźć swój następny krok.",
    findTopicLabel: "Znajdź swój temat",
    catalogTitle: "Wszystkie e-booki",
    catalogLead: "Wybierz to, co jest Ci teraz bliskie.",
    filterLegend: "Wybierz kategorię",
    allLabel: "Wszystkie",
    cardActionLabel: "Poznaj temat",
    note: "Zapowiedzi e-booków. Tytuły i okładki są propozycją; materiały są w przygotowaniu.",
    emptyMessage:
      "W tej chwili nie ma opublikowanych e-booków. Gdy pojawią się materiały, zobaczysz je w tej kolekcji.",
    emptyCategoryMessage:
      "W tej kategorii nie ma jeszcze e-booków. Wybierz inną kategorię albo wróć do pełnej kolekcji.",
    breadcrumbHome: "Strona główna",
    breadcrumbCurrent: "E-booki",
    coverTopic: "Praktyczny przewodnik dla kobiet",
    newsletterTitle: "Mniej sprzecznych rad.\nWięcej konkretów.",
  },
  en: {
    pageTitle: "E-books | Aleksandra Olesiewicz",
    seoTitle: "E-books | Aleksandra Olesiewicz",
    seoDescription:
      "Aleksandra Olesiewicz’s e-book collection on PCOS and perimenopause. Collection copy and UX are a proposal pending approval.",
    title: "More clarity.\nAt your pace.",
    lead: "PCOS, perimenopause and everyday choices. E-books you can return to when you need to sort your questions and find your next step.",
    findTopicLabel: "Find your topic",
    catalogTitle: "All e-books",
    catalogLead: "Choose what feels close right now.",
    filterLegend: "Choose a category",
    allLabel: "All",
    cardActionLabel: "Explore the topic",
    note: "E-book announcements. Titles and covers are a proposal; the materials are being prepared.",
    emptyMessage:
      "There are no published e-books yet. When materials are ready, they will appear in this collection.",
    emptyCategoryMessage:
      "There are no e-books in this category yet. Choose another category or return to the full collection.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "E-books",
    coverTopic: "A practical guide for women",
    newsletterTitle: "Fewer conflicting tips.\nMore specifics.",
  },
} as const;

export function ebookCountPhrase(
  count: number,
  language: Locale,
  topicLabel?: string,
): string {
  const noun =
    language === "en"
      ? count === 1
        ? "e-book"
        : "e-books"
      : count === 1
        ? "e-book"
        : count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 10 || count % 100 >= 20)
          ? "e-booki"
          : "e-booków";
  const base = `${count} ${noun}`;
  return topicLabel ? `${base} · ${topicLabel}` : base;
}

export function ebookFilterStatus(
  count: number,
  language: Locale,
  topicLabel?: string,
): string {
  if (language === "en") {
    const noun = count === 1 ? "e-book" : "e-books";
    return topicLabel
      ? `Showing ${count} ${noun} in ${topicLabel}.`
      : `Showing all ${count} ${noun}.`;
  }
  const noun =
    count === 1
      ? "e-book"
      : count % 10 >= 2 &&
          count % 10 <= 4 &&
          (count % 100 < 10 || count % 100 >= 20)
        ? "e-booki"
        : "e-booków";
  return topicLabel
    ? `Wyświetlono ${count} ${noun} z kategorii ${topicLabel}.`
    : `Wyświetlono wszystkie ${count} ${noun}.`;
}
