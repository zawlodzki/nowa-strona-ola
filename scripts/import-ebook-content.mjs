#!/usr/bin/env node
/**
 * Dry-run import landingu e-booka 3a (Suplementy w PCOS).
 * Rozszerza istniejący dokument ebook z importu homepage. Nic nie zapisuje.
 * Użycie: node scripts/import-ebook-content.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const GAPS = [
  {
    id: "product-copy",
    status: "provisional",
    detail:
      "Copy, siedem rozdziałów, karty pracy, PDF i przegląd po 12 tygodniach są propozycją z mockupu i researchu, nie potwierdzeniem gotowego produktu.",
  },
  {
    id: "sales-status",
    status: "open",
    detail:
      "availability=planned, 97 PLN brutto. Brak checkoutUrl, płatnego PDF i warunków zakupu. Renderer nie udaje potwierdzenia zakupu.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN landingu jest robocze. Slug EN to supplements-in-pcos; brak polskiego fallbacku pod /en/ebooks/.",
  },
  {
    id: "content-lake-write",
    status: "open",
    detail:
      "Dokumenty ebook-suplementy-w-pcos-pl/en nie są zapisane w Content Lake. Ten skrypt tworzy wyłącznie raport dry-run.",
  },
];

function now() {
  return new Date().toISOString();
}

function reference(id) {
  return { _type: "reference", _ref: id };
}

function keys(prefix, items) {
  return items.map((item, index) => ({
    ...item,
    _key: `${prefix}-${index + 1}`,
  }));
}

function landing(language) {
  const pl = language === "pl";
  return {
    _type: "ebookLanding",
    variant: "cherry3a",
    heroTitle: pl
      ? "Zrób porządek\nz suplementami."
      : "Put your supplements\nin order.",
    heroLead: pl
      ? "Zanim kupisz kolejne opakowanie, sprawdź, po co je bierzesz. Uporządkuj swoją półkę i pytania do specjalisty."
      : "Before you buy another pack, check why you are taking it. Tidy your shelf and your questions for a specialist.",
    primaryLabel: pl
      ? "Chcę uporządkować suplementy"
      : "I want to sort my supplements",
    secondaryLabel: pl ? "Zajrzyj do środka" : "Look inside",
    facts: keys("fact", [
      {
        title: pl ? "7 rozdziałów" : "7 chapters",
        detail: pl
          ? "od pytań do planu działania"
          : "from questions to an action plan",
      },
      {
        title: pl ? "Twój audyt półki" : "Your shelf audit",
        detail: pl
          ? "preparat, cel, koszt, pytania"
          : "product, aim, cost, questions",
      },
      {
        title: pl ? "12 tygodni" : "12 weeks",
        detail: pl
          ? "plan obserwacji i przeglądu"
          : "an observation and review plan",
      },
    ]),
    problemTitle: pl
      ? "Kolejna kapsułka.\nTo samo pytanie:\n„Czy to ma sens?”"
      : "Another capsule.\nThe same question:\n“Does this make sense?”",
    problemParagraphs: pl
      ? [
          "Inozytol z polecenia. Witamina D z reklamy. Jeszcze coś „na hormony”. A na półce coraz więcej opakowań i coraz mniej jasności.",
          "Trudno podjąć dobrą decyzję, kiedy każda rada brzmi inaczej. Potrzebujesz kryteriów, które pomogą Ci przyjrzeć się temu, co już masz.",
        ]
      : [
          "Inositol on a recommendation. Vitamin D from an ad. Something else “for hormones”. More packs on the shelf, and less clarity.",
          "It is hard to decide well when every piece of advice sounds different. You need criteria that help you look at what you already have.",
        ],
    problemQuestions: pl
      ? [
          "Po co to biorę?",
          "Czy pasuje do mojej sytuacji?",
          "Kiedy warto do tego wrócić?",
        ]
      : [
          "Why am I taking this?",
          "Does it fit my situation?",
          "When is it worth coming back to?",
        ],
    audienceTitle: pl
      ? "Brzmi znajomo?\nJesteś w dobrym miejscu."
      : "Does this sound familiar?\nYou are in the right place.",
    audienceLead: pl
      ? "Nie zaczynasz od zera. Już szukasz rozwiązań. Teraz możesz poukładać je w całość."
      : "You are not starting from scratch. You are already looking for answers. Now you can put them together.",
    audienceItems: keys(
      "audience",
      pl
        ? [
            {
              title: "Masz PCOS i pełną półkę.",
              body: "Bierzesz kilka preparatów, ale trudno Ci powiedzieć, jaki cel ma każdy z nich.",
            },
            {
              title: "Kończy Ci się opakowanie.",
              body: "Zanim zamówisz następne, chcesz wrócić do pytania: dlaczego właśnie ten suplement?",
            },
            {
              title: "Każdy poleca coś innego.",
              body: "Chcesz odróżnić reklamowe obietnice od informacji, które pomagają w decyzji.",
            },
            {
              title: "Chcesz przygotować się do wizyty.",
              body: "Potrzebujesz uporządkowanej listy preparatów i konkretnych pytań do specjalisty.",
            },
          ]
        : [
            {
              title: "You have PCOS and a full shelf.",
              body: "You take several products, but it is hard to say what aim each one has.",
            },
            {
              title: "A pack is running out.",
              body: "Before you order the next one, you want to return to the question: why this supplement?",
            },
            {
              title: "Everyone recommends something else.",
              body: "You want to tell advertising promises apart from information that helps you decide.",
            },
            {
              title: "You want to prepare for an appointment.",
              body: "You need an ordered list of products and concrete questions for a specialist.",
            },
          ],
    ),
    educationNote: pl
      ? "E-book ma charakter edukacyjny. Nie zastępuje diagnostyki ani indywidualnych zaleceń."
      : "The e-book is educational. It does not replace diagnosis or individual advice.",
    contentsTitle: pl
      ? "Każdy rozdział\nkończy się konkretem."
      : "Every chapter\nends with something concrete.",
    contentsLead: pl
      ? "Od listy preparatów do karty przeglądu. Czytasz, zapisujesz i przygotowujesz kolejny krok."
      : "From a list of products to a review card. You read, write things down and prepare the next step.",
    ingredients: pl
      ? [
          "Inozytol",
          "Witamina D",
          "Omega-3",
          "Magnez",
          "NAC",
          "Berberyna",
          "i inne składniki",
        ]
      : [
          "Inositol",
          "Vitamin D",
          "Omega-3",
          "Magnesium",
          "NAC",
          "Berberine",
          "and other ingredients",
        ],
    sampleTitle: pl
      ? "Jedna karta.\nDobry początek."
      : "One card.\nA good start.",
    sampleLead: pl
      ? "Wyjmij preparaty z szafki. Zapisz, po co je bierzesz i czego jeszcze nie wiesz. Z taką listą łatwiej zacząć konkretną rozmowę."
      : "Take the products out of the cupboard. Write down why you take them and what you still do not know. That list makes a concrete conversation easier.",
    sampleFields: keys(
      "sample-field",
      (pl
        ? [
            "Nazwa preparatu",
            "Dlaczego go stosuję?",
            "Co chcę omówić ze specjalistą?",
            "Miesięczny koszt",
          ]
        : [
            "Product name",
            "Why am I using it?",
            "What do I want to discuss with a specialist?",
            "Monthly cost",
          ]
      ).map((label) => ({ label })),
    ),
    sampleCaption: pl
      ? "Podgląd projektowanej karty. Finalny skład pakietu wymaga przygotowania materiałów."
      : "A preview of the planned card. The final pack still needs the materials prepared.",
    outcomesTitle: pl
      ? "Mniej zgadywania.\nWięcej jasności."
      : "Less guesswork.\nMore clarity.",
    outcomesLead: pl
      ? "Rezultat pracy z ebookiem zobaczysz w swoich notatkach: cel, pytania, koszt i termin przeglądu dla każdego preparatu."
      : "The result of working with the e-book shows up in your notes: aim, questions, cost and a review date for each product.",
    comparisonItems: keys(
      "compare",
      pl
        ? [
            { before: "„Biorę, bo polecano.”", after: "Wiesz, o co zapytać." },
            {
              before: "„Nie wiem, ile wydaję.”",
              after: "Masz policzony koszt.",
            },
            {
              before: "„Może dołożę coś jeszcze?”",
              after: "Masz plan rozmowy i przeglądu.",
            },
          ]
        : [
            {
              before: "“I take it because it was recommended.”",
              after: "You know what to ask.",
            },
            {
              before: "“I do not know how much I spend.”",
              after: "You have counted the cost.",
            },
            {
              before: "“Maybe I should add something else?”",
              after: "You have a plan for the conversation and the review.",
            },
          ],
    ),
    outcomesNote: pl
      ? "E-book pomaga uporządkować decyzje. Nie obiecuje regulacji hormonów, utraty kilogramów ani powrotu miesiączki."
      : "The e-book helps you order decisions. It does not promise hormone regulation, weight loss or a return of periods.",
    authorTitle: pl
      ? "Dobra decyzja\nzaczyna się od „po co?”."
      : "A good decision\nstarts with “why?”.",
    authorParagraphs: pl
      ? [
          "W mojej pracy z kobietami z PCOS liczy się zrozumienie ich codzienności. Ten sam punkt wyjścia proponuję w ebooku: najpierw Twoja sytuacja, potem kolejne kroki.",
          "Suplementy też potrzebują kontekstu. W wytycznych PCOS z 2023 roku korzyści kliniczne inozytolu oceniono jako ograniczone. Dlatego warto rozmawiać o oczekiwaniach i zasadności stosowania.",
        ]
      : [
          "In my work with women with PCOS, understanding daily life comes first. I offer the same starting point in the e-book: your situation first, then the next steps.",
          "Supplements need context too. In the 2023 PCOS guideline, the clinical benefit of inositol was judged limited. That is why it is worth talking about expectations and whether use is justified.",
        ],
    offerTitle: pl
      ? "Zanim kupisz\nkolejne opakowanie,\nzrób miejsce na wiedzę."
      : "Before you buy\nanother pack,\nmake space for knowledge.",
    offerLead: pl
      ? "Zacznij od tego, co już masz. Sprawdź pytania, policz koszty i przygotuj się do świadomej rozmowy o suplementacji."
      : "Start with what you already have. Check the questions, count the costs and prepare for a considered conversation about supplementation.",
    purchaseLabel: pl ? "Chcę ebook" : "I want the e-book",
    offerNote: pl
      ? "Zapowiedź oferty. Zakres pakietu i dostępność do potwierdzenia przed sprzedażą."
      : "An announced offer. The pack and availability still need confirmation before sale.",
    testimonialsTitle: pl
      ? "Jak pracuje się z Olą?"
      : "What is it like to work with Ola?",
    testimonialsContext: pl
      ? "Opinie o dotychczasowej współpracy. Nie są recenzjami tego ebooka ani obietnicą jego efektów."
      : "Feedback on previous work together. These are not reviews of this e-book and not a promise of its effects.",
    testimonialsScope: "cooperation",
    testimonials: [
      reference(`testimonial-${language}-4`),
      reference(`testimonial-${language}-6`),
    ],
    faq: {
      _type: "faqSection",
      title: pl ? "Jeszcze\nkilka odpowiedzi." : "A few more\nanswers.",
      lead: pl
        ? "Sprawdź, czy to materiał na Twój obecny etap."
        : "Check whether this is the material for your current stage.",
      items: keys(
        "faq",
        pl
          ? [
              {
                question: "Czy dostanę gotową listę suplementów do brania?",
                answer:
                  "Dostaniesz sposób porządkowania informacji i pytań o własne preparaty. Nie jest to indywidualna rozpiska leczenia ani dawkowania.",
              },
              {
                question:
                  "Czy ten ebook jest dla mnie, jeśli dopiero mam diagnozę?",
                answer:
                  "Tak, jeśli chcesz zrozumieć temat przed zakupami. Nie musisz mieć pełnej szafki suplementów.",
              },
              {
                question: "Czy mogę korzystać z niego, gdy biorę leki?",
                answer:
                  "Możesz użyć go do przygotowania rozmowy o bezpieczeństwie. Nie odstawiaj leków na podstawie ebooka.",
              },
              {
                question: "A jeśli planuję ciążę, jestem w ciąży lub karmię?",
                answer:
                  "Te sytuacje wymagają indywidualnych zaleceń. Ebook nie zawiera planu suplementacji na ciążę ani karmienie.",
              },
              {
                question: "W jakiej formie otrzymam materiał?",
                answer:
                  "Planowany pakiet to ebook PDF i karty pracy. Finalne pliki oraz sposób dostarczenia zostaną potwierdzone przed sprzedażą.",
              },
              {
                question: "Czy mogę już kupić ebook?",
                answer:
                  "To zapowiedź strony sprzedażowej. Cena wynosi 97 zł brutto, ale płatność nie jest aktywna.",
              },
            ]
          : [
              {
                question: "Will I get a ready list of supplements to take?",
                answer:
                  "You will get a way to order information and questions about your own products. It is not an individual treatment plan.",
              },
              {
                question:
                  "Is this e-book for me if I have only just been diagnosed?",
                answer:
                  "Yes, if you want to understand the topic before you buy. You do not need a full cupboard of supplements.",
              },
              {
                question: "Can I use it if I take medicines?",
                answer:
                  "You can use it to prepare a conversation about safety. Do not stop medicines on the basis of the e-book.",
              },
              {
                question:
                  "What if I am planning pregnancy, pregnant or breastfeeding?",
                answer:
                  "Those situations need individual advice. The e-book does not include a supplementation plan for pregnancy or breastfeeding.",
              },
              {
                question: "In what form will I receive the material?",
                answer:
                  "The planned pack is a PDF e-book and worksheets. Final files and delivery will be confirmed before sales start.",
              },
              {
                question: "Can I buy the e-book already?",
                answer:
                  "This is a preview of the sales page. The price is 97 PLN gross, but payment is not active.",
              },
            ],
      ),
    },
  };
}

function ebookDocument(language) {
  const pl = language === "pl";
  const slug = pl ? "suplementy-w-pcos" : "supplements-in-pcos";
  return {
    _id: `ebook-suplementy-w-pcos-${language}`,
    _type: "ebook",
    language,
    title: pl ? "Suplementy w PCOS" : "Supplements in PCOS",
    subtitle: pl ? "Decyzje, które mają sens" : "Decisions that make sense",
    slug: { _type: "slug", current: slug },
    topic: "pcos",
    cardDescription: pl
      ? "Uporządkuj pytania o suplementy: po co je stosować i co omówić ze specjalistą przed zakupem."
      : "Sort your questions about supplements: why to use them and what to discuss with a specialist before you buy.",
    coverTone: "light",
    availability: "planned",
    priceGross: 97,
    currency: "PLN",
    format: "pdf",
    sortOrder: 1,
    author: reference(`author-ola-${language}`),
    translation: reference(
      pl ? "ebook-suplementy-w-pcos-en" : "ebook-suplementy-w-pcos-pl",
    ),
    chapters: keys(
      "chapter",
      (pl
        ? [
            [
              "Zacznij od swojej półki",
              "Zapisz, co bierzesz i po co. Oddziel własny cel od obietnicy na opakowaniu.",
            ],
            [
              "Zanim kupisz kolejny preparat",
              "Uporządkuj posiadane wyniki i pytania. Dowiedz się, czego nie da się ocenić z reklamy.",
            ],
            [
              "Inozytol bez wielkich obietnic",
              "Zrozum, co mówią dowody, gdzie są ich ograniczenia i co warto omówić ze specjalistą.",
            ],
            [
              "Witamina D, omega-3 i reszta półki",
              "Porównaj popularne składniki: zastosowanie, ograniczenia i sytuacje wymagające konsultacji.",
            ],
            [
              "Przeczytaj etykietę, zanim zapłacisz",
              "Przyjrzyj się składowi, porcji i kosztowi. Rozpoznaj hasła, które niewiele mówią o produkcie.",
            ],
            [
              "Bezpieczeństwo i interakcje",
              "Przygotuj listę leków i suplementów do rozmowy z lekarzem lub farmaceutą.",
            ],
            [
              "Zaplanuj przegląd za 12 tygodni",
              "Zapisz ustalenia ze specjalistą, obserwacje i datę ponownej oceny. Nie zmieniaj wszystkiego naraz.",
            ],
          ]
        : [
            [
              "Start with your shelf",
              "Write down what you take and why. Separate your own aim from the promise on the pack.",
            ],
            [
              "Before you buy another product",
              "Order the results and questions you already have. Learn what an advert cannot tell you.",
            ],
            [
              "Inositol without grand promises",
              "Understand what the evidence says, where it is limited, and what to discuss with a specialist.",
            ],
            [
              "Vitamin D, omega-3 and the rest of the shelf",
              "Compare popular ingredients: use, limits, and situations that need a consultation.",
            ],
            [
              "Read the label before you pay",
              "Look at the composition, serving and cost. Spot claims that say little about the product.",
            ],
            [
              "Safety and interactions",
              "Prepare a list of medicines and supplements for a conversation with a doctor or pharmacist.",
            ],
            [
              "Plan a review in 12 weeks",
              "Write down what you agreed with a specialist, what you observe, and the date of the next review.",
            ],
          ]
      ).map(([title, summary]) => ({ title, summary })),
    ),
    includedMaterials: keys(
      "material",
      (pl
        ? [
            "Karta audytu suplementów",
            "Checklista czytania etykiety",
            "Arkusz miesięcznych kosztów",
            "Pytania do lekarza i farmaceuty",
            "Plan obserwacji na 12 tygodni",
          ]
        : [
            "Supplement audit card",
            "Label-reading checklist",
            "Monthly cost sheet",
            "Questions for a doctor and pharmacist",
            "12-week observation plan",
          ]
      ).map((title) => ({ title })),
    ),
    sources: [
      {
        _key: "source-pcos-2023",
        _type: "ebookSource",
        title: pl
          ? "Zobacz źródło: wytyczne PCOS 2023, sekcja 4.7"
          : "See the source: 2023 PCOS guideline, section 4.7",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/",
        scope: pl
          ? "Wytyczne PCOS 2023, sekcja 4.7"
          : "2023 PCOS guideline, section 4.7",
      },
    ],
    seo: {
      title: pl
        ? "Suplementy w PCOS | E-book Aleksandry Olesiewicz"
        : "Supplements in PCOS | E-book by Aleksandra Olesiewicz",
      description: pl
        ? "Suplementy w PCOS. Uporządkuj swoją półkę i przygotuj pytania do specjalisty. Zapowiedź e-booka, sprzedaż nie jest uruchomiona."
        : "Supplements in PCOS. Tidy your shelf and prepare questions for a specialist. An announcement — sales are not live.",
    },
    landing: landing(language),
    _createdNote: now(),
  };
}

function documents() {
  return [ebookDocument("pl"), ebookDocument("en")];
}

async function compareExisting(docs) {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !dataset || !token) {
    return {
      compared: false,
      reason:
        "Brak PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET / SANITY_API_READ_TOKEN. Nie odczytano Content Lake.",
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
      "*[_id in $ids]{_id, _updatedAt, _type, availability, priceGross}",
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
    "author-ola-pl",
    "author-ola-en",
    "testimonial-pl-4",
    "testimonial-pl-6",
    "testimonial-en-4",
    "testimonial-en-6",
  ],
  paidAssetCheck: {
    checkoutUrl: docs.every((doc) => !doc.checkoutUrl),
    paidFile: false,
  },
  gaps: GAPS,
  comparison,
  note: "Fixture e-booka nie jest dowodem zapisu do CMS. Cena 97 PLN i status planned pozostają w tym samym dokumencie produktu co karty homepage. Nie tworzyć drugiego typu produktu.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "ebook-3a-import.ndjson");
const reportPath = join(outDir, "ebook-3a-import-dry-run.json");
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
