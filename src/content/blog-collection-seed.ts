import type { Locale } from "@ola/shared";

import { homepageCopy } from "@/content/homepage-seed";
import type { SiteRasterKey } from "@/lib/site-images";

export type BlogCardFrame =
  "food" | "food-close" | "portrait" | "portrait-close";

export type BlogCategoryKey =
  "consultations" | "nutrition" | "pcos" | "insulin" | "perimenopause";

export interface BlogIndexCopy {
  title: string;
  lead: string;
  note: string;
  latestTitle: string;
  collectionTitle: string;
  readActionLabel: string;
  allCategoriesLabel: string;
  emptyMessage: string;
  emptyCategoryMessage: string;
  previousLabel: string;
  nextLabel: string;
  paginationLabel: string;
  pageLabel: string;
  seoTitle: string;
  seoDescription: string;
  breadcrumbHome: string;
  breadcrumbBlog: string;
}

export const blogIndexCopy: Record<Locale, BlogIndexCopy> = {
  pl: {
    title: "Blog. Po Twojemu.",
    lead: "O PCOS, insulinooporności i odżywianiu, które pasuje do życia. Znajdź temat, z którym jesteś dzisiaj.",
    note: "Przykładowa kolekcja do oceny układu. Tytuły, opisy i daty są demonstracyjne.",
    latestTitle: "Najnowszy wpis",
    collectionTitle: "Wszystkie wpisy",
    readActionLabel: "Przeczytaj artykuł",
    allCategoriesLabel: "Wszystkie",
    emptyMessage:
      "W tej chwili nie ma opublikowanych wpisów. Gdy pojawią się artykuły, zobaczysz je w tej kolekcji.",
    emptyCategoryMessage:
      "W tej kategorii nie ma jeszcze wpisów. Wybierz inną kategorię albo wróć do pełnej listy.",
    previousLabel: "Poprzednia",
    nextLabel: "Następna",
    paginationLabel: "Strony bloga",
    pageLabel: "Strona",
    seoTitle: "Blog — Aleksandra Olesiewicz",
    seoDescription:
      "Blog Aleksandry Olesiewicz. PCOS, insulinooporność i codzienne odżywianie. Przeglądaj wpisy i zapisz się do newslettera.",
    breadcrumbHome: "Strona główna",
    breadcrumbBlog: "Blog",
  },
  en: {
    title: "Blog. On your terms.",
    lead: "On PCOS, insulin resistance and eating that fits real life. Find the topic you need today.",
    note: "A sample collection for layout review. Titles, descriptions and dates are demonstrative.",
    latestTitle: "Latest post",
    collectionTitle: "All posts",
    readActionLabel: "Read the article",
    allCategoriesLabel: "All",
    emptyMessage:
      "There are no published posts yet. When articles are ready, they will appear in this collection.",
    emptyCategoryMessage:
      "There are no posts in this category yet. Choose another category or return to the full list.",
    previousLabel: "Previous",
    nextLabel: "Next",
    paginationLabel: "Blog pages",
    pageLabel: "Page",
    seoTitle: "Blog — Aleksandra Olesiewicz",
    seoDescription:
      "Aleksandra Olesiewicz’s blog. PCOS, insulin resistance and everyday nutrition. Browse posts and join the newsletter.",
    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
  },
};

export function blogRangeLabel(
  language: Locale,
  start: number,
  end: number,
  total: number,
): string | null {
  if (start < 1 || end < 1 || total < 1) return null;
  return language === "pl"
    ? `Wpisy ${start}–${end} z ${total}`
    : `Posts ${start}–${end} of ${total}`;
}

export function blogPageStatus(
  language: Locale,
  page: number,
  totalPages: number,
): string {
  return language === "pl"
    ? `Strona ${page} z ${totalPages}`
    : `Page ${page} of ${totalPages}`;
}

export function blogIndexSettingsFixture(language: Locale) {
  const copy = blogIndexCopy[language];
  return {
    title: copy.title,
    lead: copy.lead,
    note: copy.note,
    latestTitle: copy.latestTitle,
    collectionTitle: copy.collectionTitle,
    readActionLabel: copy.readActionLabel,
    allCategoriesLabel: copy.allCategoriesLabel,
    emptyMessage: copy.emptyMessage,
    emptyCategoryMessage: copy.emptyCategoryMessage,
    previousLabel: copy.previousLabel,
    nextLabel: copy.nextLabel,
    paginationLabel: copy.paginationLabel,
    seoTitle: copy.seoTitle,
    seoDescription: copy.seoDescription,
  };
}

export function blogNewsletterSettingsFixture(language: Locale, form: unknown) {
  const copy = homepageCopy[language];
  return {
    enabled: true,
    title: copy.newsletterTitle,
    lead: copy.newsletterLead,
    sidebarTitle: language === "pl" ? "Zostań w kontakcie" : "Stay in touch",
    sidebarLead:
      language === "pl"
        ? "Krótka notatka, gdy pojawi się nowy materiał."
        : "A short note when new material appears.",
    sidebarActionLabel:
      language === "pl" ? "Do newslettera" : "To the newsletter",
    form,
  };
}

export const BLOG_CATEGORY_SEED: Record<
  BlogCategoryKey,
  {
    slugs: Record<Locale, string>;
    titles: Record<Locale, string>;
    descriptions: Record<Locale, string>;
  }
> = {
  consultations: {
    slugs: { pl: "konsultacje", en: "consultations" },
    titles: { pl: "Konsultacje", en: "Consultations" },
    descriptions: {
      pl: "Jak przygotować się do rozmowy i nazwać to, czego potrzebujesz.",
      en: "How to prepare for a conversation and name what you need.",
    },
  },
  nutrition: {
    slugs: { pl: "odzywianie", en: "nutrition" },
    titles: { pl: "Odżywianie", en: "Nutrition" },
    descriptions: {
      pl: "Codzienne posiłki, rytm i zakupy dopasowane do życia.",
      en: "Everyday meals, rhythm and shopping that fit real life.",
    },
  },
  pcos: {
    slugs: { pl: "pcos", en: "pcos" },
    titles: { pl: "PCOS", en: "PCOS" },
    descriptions: {
      pl: "Pytania o PCOS, suplementy i sprzeczne rady.",
      en: "Questions about PCOS, supplements and conflicting advice.",
    },
  },
  insulin: {
    slugs: { pl: "insulinoopornosc", en: "insulin-resistance" },
    titles: { pl: "Insulinooporność", en: "Insulin resistance" },
    descriptions: {
      pl: "Od czego zacząć rozmowę o odżywianiu przy insulinooporności.",
      en: "Where to start a nutrition conversation with insulin resistance.",
    },
  },
  perimenopause: {
    slugs: { pl: "perimenopauza", en: "perimenopause" },
    titles: { pl: "Perimenopauza", en: "Perimenopause" },
    descriptions: {
      pl: "Miejsce na wpisy o perimenopauzie, gdy się pojawią.",
      en: "A place for perimenopause posts when they are published.",
    },
  },
};

export interface BlogArticleSeed {
  key: string;
  publishedAt: string;
  category: Exclude<BlogCategoryKey, "perimenopause">;
  imageKey: Extract<SiteRasterKey, "food" | "about" | "contact">;
  frame: BlogCardFrame;
  imageWidth: number;
  imageHeight: number;
  hotspot?: { x: number; y: number };
  pl: { slug: string; title: string; lead: string; alt: string };
  en: { slug: string; title: string; lead: string; alt: string };
}

const foodAltPl = "Kolorowy posiłek na jasnym stole.";
const foodAltFeaturedPl =
  "Kolorowy posiłek z warzywami i kaszą na jasnym stole.";
const portraitAltPl = "Aleksandra Olesiewicz.";
const foodAltEn = "A colourful meal on a light table.";
const foodAltFeaturedEn =
  "A colourful meal with vegetables and groats on a light table.";
const portraitAltEn = "Aleksandra Olesiewicz.";

export const BLOG_ARTICLE_SEED: readonly BlogArticleSeed[] = [
  {
    key: "01",
    publishedAt: "2026-09-28T08:00:00.000Z",
    category: "consultations",
    imageKey: "food",
    frame: "food",
    imageWidth: 1536,
    imageHeight: 1024,
    pl: {
      slug: "przygotowanie-do-konsultacji-pcos",
      title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
      lead: "Bez perfekcyjnego dzienniczka i listy nowych obowiązków. Kilka notatek, które pomogą Ci spokojnie zacząć rozmowę.",
      alt: foodAltFeaturedPl,
    },
    en: {
      slug: "preparing-for-a-pcos-nutrition-consultation",
      title: "How to prepare for a nutrition consultation with PCOS?",
      lead: "Without a perfect food diary or a list of new duties. A few notes that help you start the conversation calmly.",
      alt: foodAltFeaturedEn,
    },
  },
  {
    key: "02",
    publishedAt: "2026-09-24T08:00:00.000Z",
    category: "nutrition",
    imageKey: "food",
    frame: "food",
    imageWidth: 1536,
    imageHeight: 1024,
    pl: {
      slug: "codzienne-posilki-przy-pcos",
      title: "Codzienne posiłki przy PCOS: zacznij od swojego rytmu",
      lead: "Nie musisz zaczynać od nowego jadłospisu. Przyjrzyj się temu, jak jesz w zwykłym tygodniu.",
      alt: foodAltPl,
    },
    en: {
      slug: "everyday-meals-with-pcos",
      title: "Everyday meals with PCOS: start from your own rhythm",
      lead: "You do not have to start with a new meal plan. Look at how you eat in an ordinary week.",
      alt: foodAltEn,
    },
  },
  {
    key: "03",
    publishedAt: "2026-09-18T08:00:00.000Z",
    category: "pcos",
    imageKey: "contact",
    frame: "portrait",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspot: { x: 0.5, y: 0.15 },
    pl: {
      slug: "pytania-o-pcos-przed-wizyta",
      title: "Jak uporządkować pytania o PCOS przed wizytą?",
      lead: "Co chcesz wiedzieć, co Cię niepokoi i co warto zapisać przed spotkaniem ze specjalistą.",
      alt: portraitAltPl,
    },
    en: {
      slug: "sorting-pcos-questions-before-an-appointment",
      title: "How to sort your PCOS questions before an appointment?",
      lead: "What you want to know, what worries you, and what is worth writing down before you meet a specialist.",
      alt: portraitAltEn,
    },
  },
  {
    key: "04",
    publishedAt: "2026-09-12T08:00:00.000Z",
    category: "consultations",
    imageKey: "about",
    frame: "portrait",
    imageWidth: 1122,
    imageHeight: 1402,
    hotspot: { x: 0.5, y: 0.15 },
    pl: {
      slug: "wyniki-badan-na-konsultacje",
      title: "Wyniki badań: co zabrać na konsultację?",
      lead: "Kilka sposobów, by zebrać dokumenty i łatwiej opowiedzieć o swoim punkcie wyjścia.",
      alt: portraitAltPl,
    },
    en: {
      slug: "lab-results-what-to-bring-to-a-consultation",
      title: "Lab results: what to bring to a consultation?",
      lead: "A few ways to gather documents and talk more easily about your starting point.",
      alt: portraitAltEn,
    },
  },
  {
    key: "05",
    publishedAt: "2026-09-05T08:00:00.000Z",
    category: "nutrition",
    imageKey: "food",
    frame: "food-close",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspot: { x: 0.75, y: 0.7 },
    pl: {
      slug: "regularne-posilki",
      title: "Regularne posiłki, kiedy każdy dzień wygląda inaczej",
      lead: "Jak myśleć o rytmie jedzenia przy pracy, spotkaniach i planach, które często się zmieniają.",
      alt: foodAltPl,
    },
    en: {
      slug: "regular-meals-when-every-day-looks-different",
      title: "Regular meals when every day looks different",
      lead: "How to think about eating rhythm with work, meetings and plans that often change.",
      alt: foodAltEn,
    },
  },
  {
    key: "06",
    publishedAt: "2026-08-28T08:00:00.000Z",
    category: "insulin",
    imageKey: "contact",
    frame: "portrait-close",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspot: { x: 0.5, y: 0.15 },
    pl: {
      slug: "insulinoopornosc-rozmowa-o-odzywianiu",
      title: "Insulinooporność: od czego zacząć rozmowę o odżywianiu?",
      lead: "Zanim zbierzesz kolejną listę zasad, nazwij to, co jest dla Ciebie najtrudniejsze na co dzień.",
      alt: portraitAltPl,
    },
    en: {
      slug: "insulin-resistance-starting-the-nutrition-conversation",
      title: "Insulin resistance: where to start the nutrition conversation?",
      lead: "Before you collect another list of rules, name what is hardest for you day to day.",
      alt: portraitAltEn,
    },
  },
  {
    key: "07",
    publishedAt: "2026-08-17T08:00:00.000Z",
    category: "pcos",
    imageKey: "food",
    frame: "food",
    imageWidth: 1536,
    imageHeight: 1024,
    pl: {
      slug: "suplementy-w-pcos-pytania",
      title: "Suplementy w PCOS: uporządkuj pytania, zanim kupisz",
      lead: "Co masz już w szafce i o co chcesz zapytać specjalistę? Zacznij od uporządkowania informacji.",
      alt: foodAltPl,
    },
    en: {
      slug: "pcos-supplements-sort-questions-before-you-buy",
      title: "Supplements in PCOS: sort your questions before you buy",
      lead: "What is already in your cupboard, and what do you want to ask a specialist? Start by sorting the information.",
      alt: foodAltEn,
    },
  },
  {
    key: "08",
    publishedAt: "2026-08-10T08:00:00.000Z",
    category: "nutrition",
    imageKey: "food",
    frame: "food-close",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspot: { x: 0.75, y: 0.7 },
    pl: {
      slug: "dzienniczek-posilkow",
      title: "Dzienniczek posiłków bez presji perfekcji",
      lead: "Notatki mogą ułatwić rozmowę. Nie muszą być kolejnym zadaniem, z którego się rozliczasz.",
      alt: foodAltPl,
    },
    en: {
      slug: "a-food-diary-without-the-pressure-of-perfection",
      title: "A food diary without the pressure of perfection",
      lead: "Notes can make a conversation easier. They do not have to be another task you are graded on.",
      alt: foodAltEn,
    },
  },
  {
    key: "09",
    publishedAt: "2026-08-03T08:00:00.000Z",
    category: "consultations",
    imageKey: "about",
    frame: "portrait",
    imageWidth: 1122,
    imageHeight: 1402,
    hotspot: { x: 0.5, y: 0.15 },
    pl: {
      slug: "cel-konsultacji",
      title: "Co chcesz zmienić? Jak nazwać cel konsultacji",
      lead: "Od ogólnego „chcę jeść lepiej” do pytań o to, co naprawdę ma znaczenie w Twojej codzienności.",
      alt: portraitAltPl,
    },
    en: {
      slug: "naming-the-goal-of-a-consultation",
      title:
        "What do you want to change? How to name the goal of a consultation",
      lead: "From a general “I want to eat better” to questions about what actually matters in your everyday life.",
      alt: portraitAltEn,
    },
  },
  {
    key: "10",
    publishedAt: "2026-07-27T08:00:00.000Z",
    category: "nutrition",
    imageKey: "food",
    frame: "food",
    imageWidth: 1536,
    imageHeight: 1024,
    pl: {
      slug: "zakupy-spozywcze",
      title: "Zakupy spożywcze dopasowane do Twojego tygodnia",
      lead: "Punkt wyjścia do planowania posiłków, który uwzględnia czas, upodobania i to, co już masz.",
      alt: foodAltPl,
    },
    en: {
      slug: "grocery-shopping-that-fits-your-week",
      title: "Grocery shopping that fits your week",
      lead: "A starting point for meal planning that accounts for time, preferences and what you already have.",
      alt: foodAltEn,
    },
  },
  {
    key: "11",
    publishedAt: "2026-07-20T08:00:00.000Z",
    category: "pcos",
    imageKey: "contact",
    frame: "portrait-close",
    imageWidth: 1536,
    imageHeight: 1024,
    hotspot: { x: 0.5, y: 0.15 },
    pl: {
      slug: "sprzeczne-rady-o-pcos",
      title: "Sprzeczne rady o PCOS: zapisz to, co chcesz wyjaśnić",
      lead: "Zamiast kolejnej listy zasad — zbiór zdań, które usłyszałaś i chcesz sprawdzić w spokojnej rozmowie.",
      alt: portraitAltPl,
    },
    en: {
      slug: "conflicting-advice-on-pcos",
      title: "Conflicting advice on PCOS: write down what you want to clarify",
      lead: "Instead of another list of rules — the sentences you have heard and want to check in a calm conversation.",
      alt: portraitAltEn,
    },
  },
];

export interface BlogCardArt {
  src: Extract<SiteRasterKey, "food" | "about" | "contact">;
  frame: BlogCardFrame;
  alt: string;
  width: number;
  height: number;
  objectPosition?: string;
}

function objectPositionFromHotspot(hotspot?: { x: number; y: number }) {
  if (!hotspot) return undefined;
  return `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`;
}

const blogCardArtBySlug = new Map<string, BlogCardArt>(
  BLOG_ARTICLE_SEED.flatMap((seed) => {
    const artFor = (locale: Locale): [string, BlogCardArt] => {
      const copy = seed[locale];
      return [
        copy.slug,
        {
          src: seed.imageKey,
          frame: seed.frame,
          alt: copy.alt,
          width: seed.imageWidth,
          height: seed.imageHeight,
          objectPosition: objectPositionFromHotspot(seed.hotspot),
        },
      ];
    };
    return [artFor("pl"), artFor("en")];
  }),
);

export function blogCardArt(slug: string): BlogCardArt {
  const art = blogCardArtBySlug.get(slug);
  if (!art) {
    throw new Error(`Brak mapowania obrazu artykułu ${slug}.`);
  }
  return art;
}

export function objectPositionFromMedia(
  hotspot?: {
    x?: number | null;
    y?: number | null;
  } | null,
) {
  if (hotspot?.x == null || hotspot?.y == null) return undefined;
  return `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`;
}
