import type { Locale } from "@ola/shared";

const PCOS_SOURCE_HREF = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/";

export const ebookCopy = {
  pl: {
    seoTitle: "Suplementy w PCOS | E-book Aleksandry Olesiewicz",
    seoDescription:
      "Suplementy w PCOS. Uporządkuj swoją półkę i przygotuj pytania do specjalisty. Zapowiedź e-booka, sprzedaż nie jest uruchomiona.",
    heroEyebrow: "E-book · Suplementy w PCOS",
    heroTitle: "Zrób porządek\nz suplementami.",
    heroLead:
      "Zanim kupisz kolejne opakowanie, sprawdź, po co je bierzesz. Uporządkuj swoją półkę i pytania do specjalisty.",
    primaryLabel: "Chcę uporządkować suplementy",
    secondaryLabel: "Zajrzyj do środka",
    coverCaption: "E-book PDF + praktyczne karty pracy",
    coverTopic: "Praktyczny przewodnik dla kobiet",
    factsAria: "Planowany zakres ebooka",
    facts: [
      { title: "7 rozdziałów", detail: "od pytań do planu działania" },
      { title: "Twój audyt półki", detail: "preparat, cel, koszt, pytania" },
      { title: "12 tygodni", detail: "plan obserwacji i przeglądu" },
    ],
    problemTitle: "Kolejna kapsułka.\nTo samo pytanie:\n„Czy to ma sens?”",
    problemParagraphs: [
      "Inozytol z polecenia. Witamina D z reklamy. Jeszcze coś „na hormony”. A na półce coraz więcej opakowań i coraz mniej jasności.",
      "Trudno podjąć dobrą decyzję, kiedy każda rada brzmi inaczej. Potrzebujesz kryteriów, które pomogą Ci przyjrzeć się temu, co już masz.",
    ],
    problemQuestions: [
      "Po co to biorę?",
      "Czy pasuje do mojej sytuacji?",
      "Kiedy warto do tego wrócić?",
    ],
    problemCaption: "Zacznij od pytań. Zakupy mogą poczekać.",
    bottleLabels: ["INOZYTOL", "WITAMINA D", "OMEGA-3"],
    audienceTitle: "Brzmi znajomo?\nJesteś w dobrym miejscu.",
    audienceLead:
      "Nie zaczynasz od zera. Już szukasz rozwiązań. Teraz możesz poukładać je w całość.",
    audienceItems: [
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
    ],
    educationNote:
      "E-book ma charakter edukacyjny. Nie zastępuje diagnostyki ani indywidualnych zaleceń.",
    contentsEyebrow: "W środku ebooka",
    contentsTitle: "Każdy rozdział\nkończy się konkretem.",
    contentsLead:
      "Od listy preparatów do karty przeglądu. Czytasz, zapisujesz i przygotowujesz kolejny krok.",
    sampleLink: "Zobacz kartę audytu",
    ingredientsAria: "Omawiane składniki",
    ingredients: [
      "Inozytol",
      "Witamina D",
      "Omega-3",
      "Magnez",
      "NAC",
      "Berberyna",
      "i inne składniki",
    ],
    chapters: [
      {
        title: "Zacznij od swojej półki",
        summary:
          "Zapisz, co bierzesz i po co. Oddziel własny cel od obietnicy na opakowaniu.",
      },
      {
        title: "Zanim kupisz kolejny preparat",
        summary:
          "Uporządkuj posiadane wyniki i pytania. Dowiedz się, czego nie da się ocenić z reklamy.",
      },
      {
        title: "Inozytol bez wielkich obietnic",
        summary:
          "Zrozum, co mówią dowody, gdzie są ich ograniczenia i co warto omówić ze specjalistą.",
      },
      {
        title: "Witamina D, omega-3 i reszta półki",
        summary:
          "Porównaj popularne składniki: zastosowanie, ograniczenia i sytuacje wymagające konsultacji.",
      },
      {
        title: "Przeczytaj etykietę, zanim zapłacisz",
        summary:
          "Przyjrzyj się składowi, porcji i kosztowi. Rozpoznaj hasła, które niewiele mówią o produkcie.",
      },
      {
        title: "Bezpieczeństwo i interakcje",
        summary:
          "Przygotuj listę leków i suplementów do rozmowy z lekarzem lub farmaceutą.",
      },
      {
        title: "Zaplanuj przegląd za 12 tygodni",
        summary:
          "Zapisz ustalenia ze specjalistą, obserwacje i datę ponownej oceny. Nie zmieniaj wszystkiego naraz.",
      },
    ],
    sampleKicker: "Suplementy w PCOS · Karta pracy",
    sampleSheetTitle: "Moja półka.\nMoje pytania.",
    sampleSheetLead:
      "Zapisz jeden preparat. Zacznij od tego, który właśnie Ci się kończy.",
    sampleFields: [
      "Nazwa preparatu",
      "Dlaczego go stosuję?",
      "Co chcę omówić ze specjalistą?",
      "Miesięczny koszt",
    ],
    sampleSheetFooter: ["Karta audytu półki", "Podgląd koncepcji"],
    sampleTitle: "Jedna karta.\nDobry początek.",
    sampleLead:
      "Wyjmij preparaty z szafki. Zapisz, po co je bierzesz i czego jeszcze nie wiesz. Z taką listą łatwiej zacząć konkretną rozmowę.",
    materials: [
      {
        title: "Karta audytu suplementów",
        description: "Preparat, cel, pytania.",
      },
      {
        title: "Checklista czytania etykiety",
        description: "Skład, porcja, hasła.",
      },
      {
        title: "Arkusz miesięcznych kosztów",
        description: "Policz, zanim dokładasz.",
      },
      {
        title: "Pytania do lekarza i farmaceuty",
        description: "Lista na wizytę.",
      },
      {
        title: "Plan obserwacji na 12 tygodni",
        description: "Termin przeglądu.",
      },
    ],
    sampleCaption:
      "Podgląd projektowanej karty. Finalny skład pakietu wymaga przygotowania materiałów.",
    outcomesTitle: "Mniej zgadywania.\nWięcej jasności.",
    outcomesLead:
      "Rezultat pracy z ebookiem zobaczysz w swoich notatkach: cel, pytania, koszt i termin przeglądu dla każdego preparatu.",
    beforeLabel: "Przed audytem",
    afterLabel: "Po audycie",
    comparison: [
      { before: "„Biorę, bo polecano.”", after: "Wiesz, o co zapytać." },
      { before: "„Nie wiem, ile wydaję.”", after: "Masz policzony koszt." },
      {
        before: "„Może dołożę coś jeszcze?”",
        after: "Masz plan rozmowy i przeglądu.",
      },
    ],
    outcomesNote:
      "E-book pomaga uporządkować decyzje. Nie obiecuje regulacji hormonów, utraty kilogramów ani powrotu miesiączki.",
    authorEyebrow: "Aleksandra Olesiewicz · Dietetyczka kliniczna",
    authorTitle: "Dobra decyzja\nzaczyna się od „po co?”.",
    authorParagraphs: [
      "W mojej pracy z kobietami z PCOS liczy się zrozumienie ich codzienności. Ten sam punkt wyjścia proponuję w ebooku: najpierw Twoja sytuacja, potem kolejne kroki.",
      "Suplementy też potrzebują kontekstu. W wytycznych PCOS z 2023 roku korzyści kliniczne inozytolu oceniono jako ograniczone. Dlatego warto rozmawiać o oczekiwaniach i zasadności stosowania.",
    ],
    sourceLabel: "Zobacz źródło: wytyczne PCOS 2023, sekcja 4.7",
    sourceHref: PCOS_SOURCE_HREF,
    sourceScope: "Wytyczne PCOS 2023, sekcja 4.7",
    offerTitle: "Zanim kupisz\nkolejne opakowanie,\nzrób miejsce na wiedzę.",
    offerLead:
      "Zacznij od tego, co już masz. Sprawdź pytania, policz koszty i przygotuj się do świadomej rozmowy o suplementacji.",
    offerPackage: "E-book + karty pracy",
    offerPriceNote: "brutto · płatność jednorazowa",
    purchaseLabel: "Chcę ebook",
    offerIncludes: [
      "7 praktycznych rozdziałów",
      "PDF do czytania na swoich urządzeniach",
      "Audyt półki i arkusz kosztów",
      "Checklista etykiety i pytania na wizytę",
      "Plan obserwacji na 12 tygodni",
    ],
    purchasePreviewTitle: "Sprzedaż nie jest uruchomiona",
    purchasePreviewBody:
      "Ten przycisk nie pobiera płatności i nie potwierdza zakupu. Termin i sposób dostarczenia wymagają potwierdzenia przed startem sprzedaży.",
    offerNote:
      "Zapowiedź oferty. Zakres pakietu i dostępność do potwierdzenia przed sprzedażą.",
    testimonialsTitle: "Jak pracuje się z Olą?",
    testimonialsContext:
      "Opinie o dotychczasowej współpracy. Nie są recenzjami tego ebooka ani obietnicą jego efektów.",
    faqTitle: "Jeszcze\nkilka odpowiedzi.",
    faqLead: "Sprawdź, czy to materiał na Twój obecny etap.",
    faqCta: "Wróć do pakietu",
    faq: [
      {
        question: "Czy dostanę gotową listę suplementów do brania?",
        answer:
          "Dostaniesz sposób porządkowania informacji i pytań o własne preparaty. Nie jest to indywidualna rozpiska leczenia ani dawkowania. Cel, zasadność stosowania i zmiany suplementacji omów z lekarzem lub farmaceutą.",
      },
      {
        question: "Czy ten ebook jest dla mnie, jeśli dopiero mam diagnozę?",
        answer:
          "Tak, jeśli chcesz zrozumieć temat przed zakupami. Możesz zacząć od karty „co wiem / czego nie wiem” i listy pytań na wizytę. Nie musisz mieć pełnej szafki suplementów.",
      },
      {
        question: "Czy mogę korzystać z niego, gdy biorę leki?",
        answer:
          "Możesz użyć go do przygotowania rozmowy o bezpieczeństwie. Nie odstawiaj leków ani zaleconych preparatów na podstawie ebooka. Przed zmianą suplementacji skonsultuj możliwe interakcje z lekarzem lub farmaceutą.",
      },
      {
        question: "A jeśli planuję ciążę, jestem w ciąży lub karmię?",
        answer:
          "Te sytuacje wymagają indywidualnych zaleceń. Ebook nie zawiera planu suplementacji na ciążę ani karmienie. Przygotuj listę preparatów i omów ją z osobą prowadzącą Twoją opiekę.",
      },
      {
        question: "W jakiej formie otrzymam materiał?",
        answer:
          "Planowany pakiet to ebook PDF i karty pracy do wydruku lub uzupełnienia cyfrowo. Przeczytasz go na komputerze, tablecie i telefonie. Finalne pliki oraz sposób dostarczenia zostaną potwierdzone przed rozpoczęciem sprzedaży.",
      },
      {
        question: "Czy mogę już kupić ebook?",
        answer:
          "To zapowiedź strony sprzedażowej. Cena wynosi 97 zł brutto, ale płatność nie jest aktywna. Dostępność, termin dostarczenia i warunki zakupu zostaną podane przed uruchomieniem sprzedaży.",
      },
    ],
    navigation: [
      { label: "Dla kogo", href: "#dla-kogo" },
      { label: "Co znajdziesz w środku", href: "#zawartosc" },
      { label: "Opinie", href: "#opinie" },
      { label: "FAQ", href: "#faq" },
    ],
    headerCtaPrefix: "E-book",
    plannedStatus: "Zapowiedź",
    coverArt: ["Cel", "Dawka", "Decyzja"],
  },
  en: {
    seoTitle: "Supplements in PCOS | E-book by Aleksandra Olesiewicz",
    seoDescription:
      "Supplements in PCOS. Tidy your shelf and prepare questions for a specialist. An announcement — sales are not live.",
    heroEyebrow: "E-book · Supplements in PCOS",
    heroTitle: "Put your supplements\nin order.",
    heroLead:
      "Before you buy another pack, check why you are taking it. Tidy your shelf and your questions for a specialist.",
    primaryLabel: "I want to sort my supplements",
    secondaryLabel: "Look inside",
    coverCaption: "PDF e-book + practical worksheets",
    coverTopic: "A practical guide for women",
    factsAria: "Planned scope of the e-book",
    facts: [
      { title: "7 chapters", detail: "from questions to an action plan" },
      { title: "Your shelf audit", detail: "product, aim, cost, questions" },
      { title: "12 weeks", detail: "an observation and review plan" },
    ],
    problemTitle:
      "Another capsule.\nThe same question:\n“Does this make sense?”",
    problemParagraphs: [
      "Inositol on a recommendation. Vitamin D from an ad. Something else “for hormones”. More packs on the shelf, and less clarity.",
      "It is hard to decide well when every piece of advice sounds different. You need criteria that help you look at what you already have.",
    ],
    problemQuestions: [
      "Why am I taking this?",
      "Does it fit my situation?",
      "When is it worth coming back to?",
    ],
    problemCaption: "Start with questions. Shopping can wait.",
    bottleLabels: ["INOSITOL", "VITAMIN D", "OMEGA-3"],
    audienceTitle: "Does this sound familiar?\nYou are in the right place.",
    audienceLead:
      "You are not starting from scratch. You are already looking for answers. Now you can put them together.",
    audienceItems: [
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
    educationNote:
      "The e-book is educational. It does not replace diagnosis or individual advice.",
    contentsEyebrow: "Inside the e-book",
    contentsTitle: "Every chapter\nends with something concrete.",
    contentsLead:
      "From a list of products to a review card. You read, write things down and prepare the next step.",
    sampleLink: "See the audit card",
    ingredientsAria: "Ingredients discussed",
    ingredients: [
      "Inositol",
      "Vitamin D",
      "Omega-3",
      "Magnesium",
      "NAC",
      "Berberine",
      "and other ingredients",
    ],
    chapters: [
      {
        title: "Start with your shelf",
        summary:
          "Write down what you take and why. Separate your own aim from the promise on the pack.",
      },
      {
        title: "Before you buy another product",
        summary:
          "Order the results and questions you already have. Learn what an advert cannot tell you.",
      },
      {
        title: "Inositol without grand promises",
        summary:
          "Understand what the evidence says, where it is limited, and what to discuss with a specialist.",
      },
      {
        title: "Vitamin D, omega-3 and the rest of the shelf",
        summary:
          "Compare popular ingredients: use, limits, and situations that need a consultation.",
      },
      {
        title: "Read the label before you pay",
        summary:
          "Look at the composition, serving and cost. Spot claims that say little about the product.",
      },
      {
        title: "Safety and interactions",
        summary:
          "Prepare a list of medicines and supplements for a conversation with a doctor or pharmacist.",
      },
      {
        title: "Plan a review in 12 weeks",
        summary:
          "Write down what you agreed with a specialist, what you observe, and the date of the next review. Do not change everything at once.",
      },
    ],
    sampleKicker: "Supplements in PCOS · Worksheet",
    sampleSheetTitle: "My shelf.\nMy questions.",
    sampleSheetLead:
      "Write down one product. Start with the one that is running out.",
    sampleFields: [
      "Product name",
      "Why am I using it?",
      "What do I want to discuss with a specialist?",
      "Monthly cost",
    ],
    sampleSheetFooter: ["Shelf audit card", "Concept preview"],
    sampleTitle: "One card.\nA good start.",
    sampleLead:
      "Take the products out of the cupboard. Write down why you take them and what you still do not know. That list makes a concrete conversation easier.",
    materials: [
      {
        title: "Supplement audit card",
        description: "Product, aim, questions.",
      },
      {
        title: "Label-reading checklist",
        description: "Composition, serving, claims.",
      },
      {
        title: "Monthly cost sheet",
        description: "Count before you add more.",
      },
      {
        title: "Questions for a doctor and pharmacist",
        description: "A list for the appointment.",
      },
      {
        title: "12-week observation plan",
        description: "A review date.",
      },
    ],
    sampleCaption:
      "A preview of the planned card. The final pack still needs the materials prepared.",
    outcomesTitle: "Less guesswork.\nMore clarity.",
    outcomesLead:
      "The result of working with the e-book shows up in your notes: aim, questions, cost and a review date for each product.",
    beforeLabel: "Before the audit",
    afterLabel: "After the audit",
    comparison: [
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
    outcomesNote:
      "The e-book helps you order decisions. It does not promise hormone regulation, weight loss or a return of periods.",
    authorEyebrow: "Aleksandra Olesiewicz · Clinical dietitian",
    authorTitle: "A good decision\nstarts with “why?”.",
    authorParagraphs: [
      "In my work with women with PCOS, understanding daily life comes first. I offer the same starting point in the e-book: your situation first, then the next steps.",
      "Supplements need context too. In the 2023 PCOS guideline, the clinical benefit of inositol was judged limited. That is why it is worth talking about expectations and whether use is justified.",
    ],
    sourceLabel: "See the source: 2023 PCOS guideline, section 4.7",
    sourceHref: PCOS_SOURCE_HREF,
    sourceScope: "2023 PCOS guideline, section 4.7",
    offerTitle: "Before you buy\nanother pack,\nmake space for knowledge.",
    offerLead:
      "Start with what you already have. Check the questions, count the costs and prepare for a considered conversation about supplementation.",
    offerPackage: "E-book + worksheets",
    offerPriceNote: "gross · one-off payment",
    purchaseLabel: "I want the e-book",
    offerIncludes: [
      "7 practical chapters",
      "A PDF to read on your devices",
      "A shelf audit and a cost sheet",
      "A label checklist and questions for the visit",
      "A 12-week observation plan",
    ],
    purchasePreviewTitle: "Sales are not live",
    purchasePreviewBody:
      "This button does not take payment and does not confirm a purchase. Delivery time and method still need confirmation before sales start.",
    offerNote:
      "An announced offer. The pack and availability still need confirmation before sale.",
    testimonialsTitle: "What is it like to work with Ola?",
    testimonialsContext:
      "Feedback on previous work together. These are not reviews of this e-book and not a promise of its effects.",
    faqTitle: "A few more\nanswers.",
    faqLead: "Check whether this is the material for your current stage.",
    faqCta: "Back to the pack",
    faq: [
      {
        question: "Will I get a ready list of supplements to take?",
        answer:
          "You will get a way to order information and questions about your own products. It is not an individual treatment or dosing plan. Discuss the aim, whether use is justified, and any change with a doctor or pharmacist.",
      },
      {
        question: "Is this e-book for me if I have only just been diagnosed?",
        answer:
          "Yes, if you want to understand the topic before you buy. You can start with a “what I know / what I do not know” card and a list of questions for the appointment. You do not need a full cupboard of supplements.",
      },
      {
        question: "Can I use it if I take medicines?",
        answer:
          "You can use it to prepare a conversation about safety. Do not stop medicines or prescribed products on the basis of the e-book. Before changing supplementation, discuss possible interactions with a doctor or pharmacist.",
      },
      {
        question: "What if I am planning pregnancy, pregnant or breastfeeding?",
        answer:
          "Those situations need individual advice. The e-book does not include a supplementation plan for pregnancy or breastfeeding. Prepare a list of products and discuss it with the person providing your care.",
      },
      {
        question: "In what form will I receive the material?",
        answer:
          "The planned pack is a PDF e-book and worksheets to print or complete digitally. You will be able to read it on a computer, tablet and phone. Final files and delivery will be confirmed before sales start.",
      },
      {
        question: "Can I buy the e-book already?",
        answer:
          "This is a preview of the sales page. The price is 97 PLN gross, but payment is not active. Availability, delivery time and purchase terms will be given before sales go live.",
      },
    ],
    navigation: [
      { label: "Who it is for", href: "#dla-kogo" },
      { label: "What is inside", href: "#zawartosc" },
      { label: "Reviews", href: "#opinie" },
      { label: "FAQ", href: "#faq" },
    ],
    headerCtaPrefix: "E-book",
    plannedStatus: "Planned",
    coverArt: ["Aim", "Dose", "Decision"],
  },
} as const;

export function ebookLabels(language: Locale) {
  return ebookCopy[language];
}
