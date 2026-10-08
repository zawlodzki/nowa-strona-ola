import type { Locale } from "@ola/shared";

import { consultationPath } from "@/lib/paths";

type Span = {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
};

type MarkDef = { _type: "link"; _key: string; href: string };

function span(key: string, text: string, marks: string[] = []): Span {
  return { _type: "span", _key: key, text, marks };
}

function paragraph(
  key: string,
  text: string,
  style: "normal" | "h2" | "h3" | "blockquote" = "normal",
) {
  return {
    _type: "block" as const,
    _key: key,
    style,
    children: [span(`${key}-s`, text)],
    markDefs: [] as MarkDef[],
  };
}

function richParagraph(
  key: string,
  children: Span[],
  markDefs: MarkDef[] = [],
  style: "normal" | "blockquote" = "normal",
) {
  return {
    _type: "block" as const,
    _key: key,
    style,
    children,
    markDefs,
  };
}

function listItem(key: string, text: string, listItem: "bullet" | "number") {
  return {
    _type: "block" as const,
    _key: key,
    style: "normal" as const,
    listItem,
    children: [span(`${key}-s`, text)],
    markDefs: [] as MarkDef[],
  };
}

const copy = {
  pl: {
    proposalNote:
      "Przykładowy artykuł i daty do oceny makiety. Treść wymaga akceptacji redakcyjnej.",
    breadcrumbTitle: "Przygotowanie do konsultacji",
    heroCaption: "Codzienne odżywianie jest punktem wyjścia do rozmowy.",
    faqTitle: "Pytania przed pierwszą konsultacją.",
    faqLead: "Krótko o tym, jak przygotować się do rozmowy.",
    faqNote: "Przykładowe FAQ do akceptacji redakcyjnej.",
    faq: [
      [
        "Czy przed konsultacją muszę przygotować idealny jadłospis?",
        "Nie. Punktem wyjścia jest opis Twojego zwykłego dnia i tego, z czym potrzebujesz wsparcia. Nie poprawiaj notatek po to, żeby wyglądały lepiej — mają pomóc w rozmowie o Twojej codzienności.",
      ],
      [
        "Jakie informacje warto zebrać przed rozmową?",
        "Przygotuj dokumenty, które już masz, nazwy stosowanych preparatów, wcześniejsze zalecenia oraz krótkie notatki o posiłkach i codziennych trudnościach. Zakres potrzebnych informacji sprawdź w instrukcji organizacyjnej konsultacji.",
      ],
      [
        "Co zrobić, jeśli nie mam wszystkich dokumentów?",
        "Zapisz, czego brakuje, i potraktuj to jako pytanie na spotkanie. Nie musisz tworzyć kompletnego archiwum przed pierwszą rozmową. Możesz zacząć od opisu zwykłego dnia i najważniejszej wątpliwości.",
      ],
      [
        "Jak przygotować listę pytań na konsultację?",
        "Zanotuj, co chcesz lepiej zrozumieć, które wcześniejsze zmiany były trudne oraz jak dopasować kolejne kroki do czasu i budżetu. Wybierz pytania, które są dla Ciebie najważniejsze, i zostaw miejsce na ustalenia ze spotkania.",
      ],
    ],
  },
  en: {
    proposalNote:
      "Sample article and dates for reviewing the layout. The copy needs editorial approval.",
    breadcrumbTitle: "Preparing for a consultation",
    heroCaption: "Everyday eating is the starting point for the conversation.",
    faqTitle: "Questions before the first consultation.",
    faqLead: "A short note on how to prepare for the conversation.",
    faqNote: "Sample FAQ pending editorial approval.",
    faq: [
      [
        "Do I need a perfect meal plan before the consultation?",
        "No. The starting point is a description of your ordinary day and what you need support with. Do not tidy the notes so they look better. They should help the conversation about your everyday life.",
      ],
      [
        "What information is worth gathering before the conversation?",
        "Bring the documents you already have, the names of preparations you use, earlier recommendations, and short notes about meals and everyday difficulties. Check the consultation’s practical instructions for the information that is actually needed.",
      ],
      [
        "What if I do not have every document?",
        "Write down what is missing and treat it as a question for the appointment. You do not need a complete archive before the first conversation. You can start with a description of an ordinary day and your most important doubt.",
      ],
      [
        "How do I prepare a list of questions for the consultation?",
        "Note what you want to understand better, which earlier changes were hard to keep, and how to fit the next steps to your time and budget. Choose the questions that matter most to you and leave room for what you agree in the appointment.",
      ],
    ],
  },
} as const;

function featuredBody(language: Locale) {
  const pl = language === "pl";
  const consult = consultationPath(language);
  if (pl) {
    return [
      paragraph(
        "intro",
        "Pierwsza konsultacja nie musi zaczynać się od idealnego jadłospisu ani perfekcyjnie wypełnionego dzienniczka. Punktem wyjścia jest Twoja historia — i to, z czym potrzebujesz wsparcia teraz.",
      ),
      paragraph(
        "intro-next",
        "Możesz mieć wiele pytań albo dopiero szukać słów, żeby opisać swoją sytuację. Kilka prostych notatek pomoże uporządkować rozmowę. Poniżej pokazuję, jak może wyglądać takie przygotowanie.",
      ),
      paragraph("punkt-wyjscia", "Zacznij od tego, z czym przychodzisz", "h2"),
      paragraph(
        "punkt-p1",
        "Zastanów się, co chciałabyś omówić w pierwszej kolejności. Czy trudno Ci zaplanować posiłki w pracy? Czy gubisz się w informacjach o PCOS? A może dotychczasowe zalecenia po prostu nie pasowały do Twojego dnia?",
      ),
      richParagraph("punkt-p2", [
        span(
          "punkt-p2-a",
          "Nie musisz od razu nazywać wszystkich celów. Wystarczy jedno zdanie: ",
        ),
        span("punkt-p2-b", "„Najbardziej potrzebuję pomocy z…”", ["strong"]),
        span("punkt-p2-c", ". Resztę możesz doprecyzować podczas rozmowy."),
      ]),
      paragraph(
        "punkt-quote",
        "Nie przygotowujesz się do egzaminu. Przygotowujesz przestrzeń do rozmowy o sobie.",
        "blockquote",
      ),
      paragraph("codziennosc", "Opisz swoją codzienność", "h2"),
      paragraph(
        "codz-p1",
        "Opis zwykłego dnia daje więcej kontekstu niż opis dnia, w którym wszystko poszło zgodnie z planem. Uwzględnij pracę, dojazdy, obowiązki domowe i czas, który realnie masz na gotowanie.",
      ),
      paragraph("codz-h3", "Pomocne punkty do notatki", "h3"),
      listItem(
        "codz-l1",
        "Jak wygląda poranek i kiedy pojawia się pierwszy posiłek?",
        "bullet",
      ),
      listItem("codz-l2", "Co jesz w domu, a co poza nim?", "bullet"),
      listItem("codz-l3", "Jakie posiłki lubisz i chcesz zachować?", "bullet"),
      listItem(
        "codz-l4",
        "Który moment dnia jest najtrudniejszy do zorganizowania?",
        "bullet",
      ),
      paragraph(
        "codz-p2",
        "To miejsce także na rzeczy, które zwykle pomijasz: nieregularne godziny pracy, wspólne posiłki z rodziną czy brak ochoty na gotowanie wieczorem.",
      ),
      {
        _type: "articleHighlight" as const,
        _key: "codz-highlight",
        title: "Wystarczy zwykły dzień.",
        body: "Notatka może być krótka. Nie zmieniaj swojego opisu po to, żeby wyglądał „lepiej”. Najbardziej przydatny jest ten, który odpowiada Twojej codzienności.",
      },
      paragraph("notatki", "Zbierz informacje w jednym miejscu", "h2"),
      paragraph(
        "notatki-p1",
        "Przygotuj dokumenty i notatki, które już masz i które chciałabyś omówić. Nie chodzi o tworzenie nowego archiwum, ale o łatwy dostęp do informacji podczas spotkania online.",
      ),
      {
        _type: "articleTable" as const,
        _key: "notatki-table",
        caption: "Przykładowa organizacja notatek",
        headers: ["Co przygotować", "Jak to uporządkować"],
        rows: [
          {
            _key: "row-docs",
            cells: [
              "Dotychczasowe dokumenty",
              "Jeden folder, nazwy plików z datami.",
            ],
          },
          {
            _key: "row-prep",
            cells: ["Stosowane preparaty", "Nazwy i informacje z opakowania."],
          },
          {
            _key: "row-advice",
            cells: [
              "Poprzednie zalecenia",
              "Zaznacz, co było łatwe, a co trudne.",
            ],
          },
          {
            _key: "row-notes",
            cells: ["Twoje obserwacje", "Krótka notatka własnymi słowami."],
          },
        ],
      },
      paragraph(
        "notatki-p2",
        "Jeśli nie masz któregoś dokumentu, zapisz to jako pytanie na spotkanie. Zakres informacji potrzebnych przed konsultacją ustalisz w jej instrukcji organizacyjnej.",
      ),
      paragraph("pytania", "Zapisz pytania, które są dla Ciebie ważne", "h2"),
      paragraph(
        "pyt-p1",
        "W trakcie rozmowy łatwo zapomnieć o tym, co wcześniej chciałaś poruszyć. Lista kilku pytań pozwala wrócić do tematów, które mają dla Ciebie największe znaczenie.",
      ),
      listItem(
        "pyt-l1",
        "Co chciałabym lepiej zrozumieć w swoim odżywianiu?",
        "number",
      ),
      listItem(
        "pyt-l2",
        "Które wcześniejsze zmiany trudno było mi utrzymać?",
        "number",
      ),
      listItem(
        "pyt-l3",
        "Jak mogę dopasować kolejne kroki do czasu i budżetu?",
        "number",
      ),
      listItem(
        "pyt-l4",
        "Co chcę wyjaśnić, zanim podejmę następną decyzję?",
        "number",
      ),
      paragraph(
        "pyt-p2",
        "Możesz też zanotować sprzeczne informacje, na które trafiłaś. Nie musisz samodzielnie rozstrzygać wszystkich wątpliwości przed spotkaniem.",
      ),
      paragraph("po-rozmowie", "Zostaw miejsce na kolejne kroki", "h2"),
      paragraph(
        "po-p1",
        "Na końcu notatki zostaw kilka pustych linijek. Podczas konsultacji zapiszesz tam ustalenia, pytania do dalszego wyjaśnienia i rzeczy, od których chcesz zacząć.",
      ),
      richParagraph("po-p2", [
        span(
          "po-p2-a",
          "Przygotowanie ma ułatwić rozmowę, a nie dodać Ci kolejnych obowiązków.",
          ["strong"],
        ),
        span(
          "po-p2-b",
          " Jeśli masz tylko chwilę, zacznij od jednego pytania i opisu zwykłego dnia.",
        ),
      ]),
      richParagraph(
        "po-p3",
        [
          span("po-p3-a", "Chcesz poznać sposób współpracy? "),
          span("po-p3-b", "Zobacz konsultacje dietetyczne online", ["consult"]),
          span("po-p3-c", "."),
        ],
        [{ _type: "link", _key: "consult", href: consult }],
      ),
    ];
  }

  return [
    paragraph(
      "intro",
      "The first consultation does not have to start with a perfect meal plan or a perfectly kept food diary. The starting point is your story, and what you need support with now.",
    ),
    paragraph(
      "intro-next",
      "You may have many questions, or you may still be looking for words to describe your situation. A few simple notes help organise the conversation. Below is one way that preparation can look.",
    ),
    paragraph("starting-point", "Start from what you are bringing", "h2"),
    paragraph(
      "start-p1",
      "Think about what you would like to discuss first. Is it hard to plan meals at work? Are you lost in information about PCOS? Or did earlier recommendations simply not fit your day?",
    ),
    richParagraph("start-p2", [
      span(
        "start-p2-a",
        "You do not have to name every goal at once. One sentence is enough: ",
      ),
      span("start-p2-b", "“What I need help with most is…”", ["strong"]),
      span(
        "start-p2-c",
        " You can make the rest more precise during the conversation.",
      ),
    ]),
    paragraph(
      "start-quote",
      "You are not preparing for an exam. You are making room for a conversation about yourself.",
      "blockquote",
    ),
    paragraph("everyday", "Describe your everyday life", "h2"),
    paragraph(
      "day-p1",
      "A description of an ordinary day gives more context than a description of a day when everything went to plan. Include work, travel, home responsibilities, and the time you actually have for cooking.",
    ),
    paragraph("day-h3", "Useful points for the note", "h3"),
    listItem(
      "day-l1",
      "What does the morning look like, and when is the first meal?",
      "bullet",
    ),
    listItem(
      "day-l2",
      "What do you eat at home, and what do you eat elsewhere?",
      "bullet",
    ),
    listItem("day-l3", "Which meals do you like and want to keep?", "bullet"),
    listItem(
      "day-l4",
      "Which moment of the day is hardest to organise?",
      "bullet",
    ),
    paragraph(
      "day-p2",
      "This is also the place for things you usually skip: irregular working hours, shared meals with family, or no wish to cook in the evening.",
    ),
    {
      _type: "articleHighlight" as const,
      _key: "day-highlight",
      title: "An ordinary day is enough.",
      body: "The note can be short. Do not change your description so that it looks “better”. The most useful note is the one that matches your everyday life.",
    },
    paragraph("notes", "Gather information in one place", "h2"),
    paragraph(
      "notes-p1",
      "Prepare the documents and notes you already have and want to discuss. This is not about building a new archive. It is about having the information to hand during an online appointment.",
    ),
    {
      _type: "articleTable" as const,
      _key: "notes-table",
      caption: "A sample way to organise notes",
      headers: ["What to prepare", "How to organise it"],
      rows: [
        {
          _key: "row-docs",
          cells: [
            "Documents you already have",
            "One folder, file names with dates.",
          ],
        },
        {
          _key: "row-prep",
          cells: [
            "Preparations you use",
            "Names and the information on the packaging.",
          ],
        },
        {
          _key: "row-advice",
          cells: [
            "Earlier recommendations",
            "Mark what was easy and what was hard.",
          ],
        },
        {
          _key: "row-notes",
          cells: ["Your observations", "A short note in your own words."],
        },
      ],
    },
    paragraph(
      "notes-p2",
      "If a document is missing, write that down as a question for the appointment. The practical instructions for the consultation say which information is needed beforehand.",
    ),
    paragraph("questions", "Write down the questions that matter to you", "h2"),
    paragraph(
      "q-p1",
      "During the conversation it is easy to forget what you wanted to raise. A short list lets you return to the topics that matter most to you.",
    ),
    listItem(
      "q-l1",
      "What would I like to understand better about my eating?",
      "number",
    ),
    listItem(
      "q-l2",
      "Which earlier changes were hard for me to keep?",
      "number",
    ),
    listItem(
      "q-l3",
      "How can I fit the next steps to my time and budget?",
      "number",
    ),
    listItem(
      "q-l4",
      "What do I want to clarify before I make the next decision?",
      "number",
    ),
    paragraph(
      "q-p2",
      "You can also note conflicting information you have come across. You do not have to resolve every doubt on your own before the appointment.",
    ),
    paragraph("after", "Leave room for the next steps", "h2"),
    paragraph(
      "after-p1",
      "Leave a few blank lines at the end of the note. During the consultation you can write down what you agreed, questions to clarify later, and the things you want to start with.",
    ),
    richParagraph("after-p2", [
      span(
        "after-p2-a",
        "Preparation should make the conversation easier, not add another duty.",
        ["strong"],
      ),
      span(
        "after-p2-b",
        " If you only have a moment, start with one question and a description of an ordinary day.",
      ),
    ]),
    richParagraph(
      "after-p3",
      [
        span("after-p3-a", "Want to see how the work together looks? "),
        span("after-p3-b", "See online nutrition consultations", ["consult"]),
        span("after-p3-c", "."),
      ],
      [{ _type: "link", _key: "consult", href: consult }],
    ),
  ];
}

export const FEATURED_ARTICLE_SLUGS = {
  pl: "przygotowanie-do-konsultacji-pcos",
  en: "preparing-for-a-pcos-nutrition-consultation",
} as const;

export const FEATURED_EBOOK_SLUGS = {
  pl: [
    "suplementy-w-pcos",
    "badania-ktore-maja-sens",
    "szczupla-a-jednak-pcos",
  ],
  en: ["supplements-in-pcos", "tests-that-make-sense", "slim-and-still-pcos"],
} as const;

export const FEATURED_RELATED_SLUGS = {
  pl: ["codzienne-posilki-przy-pcos", "pytania-o-pcos-przed-wizyta"],
  en: [
    "everyday-meals-with-pcos",
    "sorting-pcos-questions-before-an-appointment",
  ],
} as const;

export function featuredArticleExtras(language: Locale) {
  const text = copy[language];
  return {
    proposalNote: text.proposalNote,
    breadcrumbTitle: text.breadcrumbTitle,
    heroCaption: text.heroCaption,
    updatedAt: "2026-10-06T08:00:00.000Z",
    body: featuredBody(language),
    faq: {
      title: text.faqTitle,
      lead: text.faqLead,
      note: text.faqNote,
      items: text.faq.map(([question, answer], index) => ({
        _key: `faq-${index + 1}`,
        question,
        answer,
      })),
    },
  };
}
