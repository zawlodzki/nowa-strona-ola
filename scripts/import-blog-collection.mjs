#!/usr/bin/env node
/**
 * Dry-run import kolekcji bloga 3a.
 * Używa istniejących typów article i category oraz ustawień indeksu.
 * Użycie: node scripts/import-blog-collection.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const CATEGORIES = [
  {
    key: "consultations",
    slugs: { pl: "konsultacje", en: "consultations" },
    titles: { pl: "Konsultacje", en: "Consultations" },
    descriptions: {
      pl: "Jak przygotować się do rozmowy i nazwać to, czego potrzebujesz.",
      en: "How to prepare for a conversation and name what you need.",
    },
  },
  {
    key: "nutrition",
    slugs: { pl: "odzywianie", en: "nutrition" },
    titles: { pl: "Odżywianie", en: "Nutrition" },
    descriptions: {
      pl: "Codzienne posiłki, rytm i zakupy dopasowane do życia.",
      en: "Everyday meals, rhythm and shopping that fit real life.",
    },
  },
  {
    key: "pcos",
    slugs: { pl: "pcos", en: "pcos" },
    titles: { pl: "PCOS", en: "PCOS" },
    descriptions: {
      pl: "Pytania o PCOS, suplementy i sprzeczne rady.",
      en: "Questions about PCOS, supplements and conflicting advice.",
    },
  },
  {
    key: "insulin",
    slugs: { pl: "insulinoopornosc", en: "insulin-resistance" },
    titles: { pl: "Insulinooporność", en: "Insulin resistance" },
    descriptions: {
      pl: "Od czego zacząć rozmowę o odżywianiu przy insulinooporności.",
      en: "Where to start a nutrition conversation with insulin resistance.",
    },
  },
  {
    key: "perimenopause",
    slugs: { pl: "perimenopauza", en: "perimenopause" },
    titles: { pl: "Perimenopauza", en: "Perimenopause" },
    descriptions: {
      pl: "Miejsce na wpisy o perimenopauzie, gdy się pojawią.",
      en: "A place for perimenopause posts when they are published.",
    },
  },
];

const ARTICLES = [
  {
    key: "01",
    category: "consultations",
    publishedAt: "2026-09-28T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "przygotowanie-do-konsultacji-pcos",
      title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
      lead: "Bez perfekcyjnego dzienniczka i listy nowych obowiązków. Kilka notatek, które pomogą Ci spokojnie zacząć rozmowę.",
      alt: "Kolorowy posiłek z warzywami i kaszą na jasnym stole.",
    },
    en: {
      slug: "preparing-for-a-pcos-nutrition-consultation",
      title: "How to prepare for a nutrition consultation with PCOS?",
      lead: "Without a perfect food diary or a list of new duties. A few notes that help you start the conversation calmly.",
      alt: "A colourful meal with vegetables and groats on a light table.",
    },
  },
  {
    key: "02",
    category: "nutrition",
    publishedAt: "2026-09-24T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "codzienne-posilki-przy-pcos",
      title: "Codzienne posiłki przy PCOS: zacznij od swojego rytmu",
      lead: "Nie musisz zaczynać od nowego jadłospisu. Przyjrzyj się temu, jak jesz w zwykłym tygodniu.",
      alt: "Kolorowy posiłek na jasnym stole.",
    },
    en: {
      slug: "everyday-meals-with-pcos",
      title: "Everyday meals with PCOS: start from your own rhythm",
      lead: "You do not have to start with a new meal plan. Look at how you eat in an ordinary week.",
      alt: "A colourful meal on a light table.",
    },
  },
  {
    key: "03",
    category: "pcos",
    publishedAt: "2026-09-18T08:00:00.000Z",
    tone: "portrait",
    pl: {
      slug: "pytania-o-pcos-przed-wizyta",
      title: "Jak uporządkować pytania o PCOS przed wizytą?",
      lead: "Co chcesz wiedzieć, co Cię niepokoi i co warto zapisać przed spotkaniem ze specjalistą.",
      alt: "Aleksandra Olesiewicz.",
    },
    en: {
      slug: "sorting-pcos-questions-before-an-appointment",
      title: "How to sort your PCOS questions before an appointment?",
      lead: "What you want to know, what worries you, and what is worth writing down before you meet a specialist.",
      alt: "Aleksandra Olesiewicz.",
    },
  },
  {
    key: "04",
    category: "consultations",
    publishedAt: "2026-09-12T08:00:00.000Z",
    tone: "portrait",
    pl: {
      slug: "wyniki-badan-na-konsultacje",
      title: "Wyniki badań: co zabrać na konsultację?",
      lead: "Kilka sposobów, by zebrać dokumenty i łatwiej opowiedzieć o swoim punkcie wyjścia.",
      alt: "Aleksandra Olesiewicz.",
    },
    en: {
      slug: "lab-results-what-to-bring-to-a-consultation",
      title: "Lab results: what to bring to a consultation?",
      lead: "A few ways to gather documents and talk more easily about your starting point.",
      alt: "Aleksandra Olesiewicz.",
    },
  },
  {
    key: "05",
    category: "nutrition",
    publishedAt: "2026-09-05T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "regularne-posilki",
      title: "Regularne posiłki, kiedy każdy dzień wygląda inaczej",
      lead: "Jak myśleć o rytmie jedzenia przy pracy, spotkaniach i planach, które często się zmieniają.",
      alt: "Kolorowy posiłek na jasnym stole.",
    },
    en: {
      slug: "regular-meals-when-every-day-looks-different",
      title: "Regular meals when every day looks different",
      lead: "How to think about eating rhythm with work, meetings and plans that often change.",
      alt: "A colourful meal on a light table.",
    },
  },
  {
    key: "06",
    category: "insulin",
    publishedAt: "2026-08-28T08:00:00.000Z",
    tone: "portrait",
    pl: {
      slug: "insulinoopornosc-rozmowa-o-odzywianiu",
      title: "Insulinooporność: od czego zacząć rozmowę o odżywianiu?",
      lead: "Zanim zbierzesz kolejną listę zasad, nazwij to, co jest dla Ciebie najtrudniejsze na co dzień.",
      alt: "Aleksandra Olesiewicz.",
    },
    en: {
      slug: "insulin-resistance-starting-the-nutrition-conversation",
      title: "Insulin resistance: where to start the nutrition conversation?",
      lead: "Before you collect another list of rules, name what is hardest for you day to day.",
      alt: "Aleksandra Olesiewicz.",
    },
  },
  {
    key: "07",
    category: "pcos",
    publishedAt: "2026-08-17T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "suplementy-w-pcos-pytania",
      title: "Suplementy w PCOS: uporządkuj pytania, zanim kupisz",
      lead: "Co masz już w szafce i o co chcesz zapytać specjalistę? Zacznij od uporządkowania informacji.",
      alt: "Kolorowy posiłek na jasnym stole.",
    },
    en: {
      slug: "pcos-supplements-sort-questions-before-you-buy",
      title: "Supplements in PCOS: sort your questions before you buy",
      lead: "What is already in your cupboard, and what do you want to ask a specialist? Start by sorting the information.",
      alt: "A colourful meal on a light table.",
    },
  },
  {
    key: "08",
    category: "nutrition",
    publishedAt: "2026-08-10T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "dzienniczek-posilkow",
      title: "Dzienniczek posiłków bez presji perfekcji",
      lead: "Notatki mogą ułatwić rozmowę. Nie muszą być kolejnym zadaniem, z którego się rozliczasz.",
      alt: "Kolorowy posiłek na jasnym stole.",
    },
    en: {
      slug: "a-food-diary-without-the-pressure-of-perfection",
      title: "A food diary without the pressure of perfection",
      lead: "Notes can make a conversation easier. They do not have to be another task you are graded on.",
      alt: "A colourful meal on a light table.",
    },
  },
  {
    key: "09",
    category: "consultations",
    publishedAt: "2026-08-03T08:00:00.000Z",
    tone: "portrait",
    pl: {
      slug: "cel-konsultacji",
      title: "Co chcesz zmienić? Jak nazwać cel konsultacji",
      lead: "Od ogólnego „chcę jeść lepiej” do pytań o to, co naprawdę ma znaczenie w Twojej codzienności.",
      alt: "Aleksandra Olesiewicz.",
    },
    en: {
      slug: "naming-the-goal-of-a-consultation",
      title:
        "What do you want to change? How to name the goal of a consultation",
      lead: "From a general “I want to eat better” to questions about what actually matters in your everyday life.",
      alt: "Aleksandra Olesiewicz.",
    },
  },
  {
    key: "10",
    category: "nutrition",
    publishedAt: "2026-07-27T08:00:00.000Z",
    tone: "photo",
    pl: {
      slug: "zakupy-spozywcze",
      title: "Zakupy spożywcze dopasowane do Twojego tygodnia",
      lead: "Punkt wyjścia do planowania posiłków, który uwzględnia czas, upodobania i to, co już masz.",
      alt: "Kolorowy posiłek na jasnym stole.",
    },
    en: {
      slug: "grocery-shopping-that-fits-your-week",
      title: "Grocery shopping that fits your week",
      lead: "A starting point for meal planning that accounts for time, preferences and what you already have.",
      alt: "A colourful meal on a light table.",
    },
  },
  {
    key: "11",
    category: "pcos",
    publishedAt: "2026-07-20T08:00:00.000Z",
    tone: "portrait",
    pl: {
      slug: "sprzeczne-rady-o-pcos",
      title: "Sprzeczne rady o PCOS: zapisz to, co chcesz wyjaśnić",
      lead: "Zamiast kolejnej listy zasad — zbiór zdań, które usłyszałaś i chcesz sprawdzić w spokojnej rozmowie.",
      alt: "Aleksandra Olesiewicz.",
    },
    en: {
      slug: "conflicting-advice-on-pcos",
      title: "Conflicting advice on PCOS: write down what you want to clarify",
      lead: "Instead of another list of rules — the sentences you have heard and want to check in a calm conversation.",
      alt: "Aleksandra Olesiewicz.",
    },
  },
];

const GAPS = [
  {
    id: "collection-copy",
    status: "provisional",
    detail:
      "Tytuł „Blog. Po Twojemu.”, lead i nota demonstracyjna są propozycją z mockupu blog-3a.html, nie zatwierdzoną treścią publikacji.",
  },
  {
    id: "sample-articles",
    status: "provisional",
    detail:
      "Jedenaście tytułów, leadów i dat z makiety to przykłady do decyzji. Nie publikować ich jako właściwych wpisów.",
  },
  {
    id: "local-images",
    status: "open",
    detail:
      "Kadry kolekcji mapują się na lokalne SiteImage (food, about, contact). Ten skrypt nie wysyła plików do Content Lake.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN indeksu i kart jest robocze. Brak polskiego fallbacku pod /en/blog/.",
  },
  {
    id: "content-lake-write",
    status: "open",
    detail:
      "Ustawienia indeksu, kategorie i artykuły nie są zapisane w Content Lake. Ten skrypt tworzy wyłącznie raport dry-run.",
  },
];

function now() {
  return new Date().toISOString();
}

function reference(id) {
  return { _type: "reference", _ref: id };
}

function categoryDocuments() {
  return CATEGORIES.flatMap((seed) => {
    const plId = `cat-${seed.key}-pl`;
    const enId = `cat-${seed.key}-en`;
    return [
      {
        _id: plId,
        _type: "category",
        language: "pl",
        title: seed.titles.pl,
        slug: { _type: "slug", current: seed.slugs.pl },
        description: seed.descriptions.pl,
        translation: reference(enId),
      },
      {
        _id: enId,
        _type: "category",
        language: "en",
        title: seed.titles.en,
        slug: { _type: "slug", current: seed.slugs.en },
        description: seed.descriptions.en,
        translation: reference(plId),
      },
    ];
  });
}

function articleDocuments() {
  return ARTICLES.flatMap((seed) => {
    const plId = `article-blog-${seed.key}-pl`;
    const enId = `article-blog-${seed.key}-en`;
    return [
      {
        _id: plId,
        _type: "article",
        language: "pl",
        title: seed.pl.title,
        slug: { _type: "slug", current: seed.pl.slug },
        lead: seed.pl.lead,
        publishedAt: seed.publishedAt,
        updatedAt: seed.publishedAt,
        featured: "standard",
        authors: [reference("author-ola-pl")],
        categories: [reference(`cat-${seed.category}-pl`)],
        translation: reference(enId),
        seo: { _type: "seo", title: seed.pl.title, description: seed.pl.lead },
        image: {
          _type: "mediaObject",
          alt: seed.pl.alt,
          tone: seed.tone,
        },
      },
      {
        _id: enId,
        _type: "article",
        language: "en",
        title: seed.en.title,
        slug: { _type: "slug", current: seed.en.slug },
        lead: seed.en.lead,
        publishedAt: seed.publishedAt,
        updatedAt: seed.publishedAt,
        featured: "standard",
        authors: [reference("author-ola-en")],
        categories: [reference(`cat-${seed.category}-en`)],
        translation: reference(plId),
        seo: { _type: "seo", title: seed.en.title, description: seed.en.lead },
        image: {
          _type: "mediaObject",
          alt: seed.en.alt,
          tone: seed.tone,
        },
      },
    ];
  });
}

function settingsDocument(language) {
  const pl = language === "pl";
  return {
    _id: `siteSettings-${language}`,
    _type: "siteSettings",
    language,
    siteTitle: "Aleksandra Olesiewicz",
    footerNote: pl
      ? "PCOS, insulinooporność i odżywianie dopasowane do życia."
      : "PCOS, insulin resistance and nutrition that fits real life.",
    blogIndex: {
      _type: "blogIndexSettings",
      title: pl ? "Blog. Po Twojemu." : "Blog. On your terms.",
      lead: pl
        ? "O PCOS, insulinooporności i odżywianiu, które pasuje do życia. Znajdź temat, z którym jesteś dzisiaj."
        : "On PCOS, insulin resistance and eating that fits real life. Find the topic you need today.",
      note: pl
        ? "Przykładowa kolekcja do oceny układu. Tytuły, opisy i daty są demonstracyjne."
        : "A sample collection for layout review. Titles, descriptions and dates are demonstrative.",
      latestTitle: pl ? "Najnowszy wpis" : "Latest post",
      collectionTitle: pl ? "Wszystkie wpisy" : "All posts",
      readActionLabel: pl ? "Przeczytaj artykuł" : "Read the article",
      allCategoriesLabel: pl ? "Wszystkie" : "All",
      emptyMessage: pl
        ? "W tej chwili nie ma opublikowanych wpisów. Gdy pojawią się artykuły, zobaczysz je w tej kolekcji."
        : "There are no published posts yet. When articles are ready, they will appear in this collection.",
      emptyCategoryMessage: pl
        ? "W tej kategorii nie ma jeszcze wpisów. Wybierz inną kategorię albo wróć do pełnej listy."
        : "There are no posts in this category yet. Choose another category or return to the full list.",
      previousLabel: pl ? "Poprzednia" : "Previous",
      nextLabel: pl ? "Następna" : "Next",
      paginationLabel: pl ? "Strony bloga" : "Blog pages",
      seoTitle: "Blog — Aleksandra Olesiewicz",
      seoDescription: pl
        ? "Blog Aleksandry Olesiewicz. PCOS, insulinooporność i codzienne odżywianie. Przeglądaj wpisy i zapisz się do newslettera."
        : "Aleksandra Olesiewicz’s blog. PCOS, insulin resistance and everyday nutrition. Browse posts and join the newsletter.",
    },
    blogNewsletter: {
      _type: "blogNewsletterSettings",
      enabled: true,
      title: pl
        ? "Mniej sprzecznych rad.\nWięcej konkretów."
        : "Fewer conflicting tips.\nMore specifics.",
      lead: pl
        ? "Piszę o PCOS, insulinooporności i codziennym odżywianiu. Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję o nowych materiałach, także o perimenopauzie."
        : "I write about PCOS, insulin resistance and everyday nutrition. I share notes you can use at an ordinary meal and I send updates about new materials, including perimenopause.",
      form: reference(pl ? "form-newsletter-pl" : "form-newsletter-en"),
      sidebarTitle: pl ? "Zostań w kontakcie" : "Stay in touch",
      sidebarLead: pl
        ? "Krótka notatka, gdy pojawi się nowy materiał."
        : "A short note when new material appears.",
      sidebarActionLabel: pl ? "Do newslettera" : "To the newsletter",
    },
    translation: reference(`siteSettings-${pl ? "en" : "pl"}`),
  };
}

function documents() {
  return [
    settingsDocument("pl"),
    settingsDocument("en"),
    ...categoryDocuments(),
    ...articleDocuments(),
  ];
}

async function compareExisting(docs) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId =
    process.env.SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_DATASET ??
    process.env.PUBLIC_SANITY_DATASET ??
    "production";
  if (!token || !projectId) {
    return {
      compared: false,
      reason: "Brak tokenu lub projectId — porównanie Content Lake pominięte.",
      existing: [],
    };
  }
  try {
    const { createClient } = await import("@sanity/client");
    const client = createClient({
      projectId,
      dataset,
      token,
      apiVersion: "2026-09-13",
      useCdn: false,
    });
    const ids = docs.map((doc) => doc._id);
    const existing = await client.fetch(
      "*[_id in $ids]{_id, _updatedAt, _type}",
      { ids },
    );
    return { compared: true, existing };
  } catch (error) {
    return {
      compared: false,
      reason: `Porównanie nieudane: ${error instanceof Error ? error.message : String(error)}`,
      existing: [],
    };
  }
}

const docs = documents();
if (write) {
  console.error(
    "Zapis do Content Lake jest zablokowany w tym skrypcie bez osobnego zlecenia publikacji. Uruchom bez --write.",
  );
  process.exit(2);
}

const comparison = compare
  ? await compareExisting(docs)
  : { compared: false, existing: [], reason: "pominięte" };
const report = {
  mode: "dry-run",
  generatedAt: now(),
  documentCount: docs.length,
  stableIds: docs.map((doc) => ({ id: doc._id, type: doc._type })),
  references: [
    "form-newsletter-pl",
    "form-newsletter-en",
    "author-ola-pl",
    "author-ola-en",
  ],
  reusedArticleDocuments: true,
  duplicatedCollection: false,
  gaps: GAPS,
  comparison,
  note: "Kolekcja nie duplikuje artykułów w osobnym dokumencie strony. Renderer pobiera opublikowane article danego języka, sortuje publishedAt desc, _id asc i paginuje po odjęciu najnowszego wpisu. Copy i przykładowe daty są propozycją.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "blog-collection-3a-import.ndjson");
const reportPath = join(outDir, "blog-collection-3a-import-dry-run.json");
await writeFile(
  ndjsonPath,
  docs.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ok: true,
      ndjson: ndjsonPath,
      report: reportPath,
      documents: docs.length,
      write: false,
      compared: comparison.compared,
    },
    null,
    2,
  ),
);
