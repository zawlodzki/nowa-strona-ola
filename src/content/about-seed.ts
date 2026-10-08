import type { Locale } from "@ola/shared";

import { blogPath, ebookCollectionPath, homePath } from "@/lib/paths";

export const aboutCopy = {
  pl: {
    pageTitle: "O mnie — Aleksandra Olesiewicz",
    seoTitle: "O mnie — Aleksandra Olesiewicz | dietetyczka kliniczna",
    seoDescription:
      "Poznaj Aleksandrę Olesiewicz — dietetyczkę kliniczną, absolwentkę Śląskiego Uniwersytetu Medycznego. PCOS, podejście do pracy i materiały edukacyjne.",
    heroTitle: "Jestem Ola.\nZnam PCOS\nod środka.",
    heroLead:
      "Jestem dietetyczką kliniczną, absolwentką Śląskiego Uniwersytetu Medycznego. Pomagam kobietom z PCOS i insulinoopornością uporządkować odżywianie i wybrać zmiany, które pasują do ich codzienności.",
    heroPrimary: "Zobacz, jak pracuję",
    heroSecondary: "Poznaj moje materiały",
    portraitAlt: "Portret Aleksandry Olesiewicz",
    portraitCredit: "Portret opracowany z pomocą AI.",
    storyTitle: "Chcę, żebyś czuła się wysłuchana.",
    storyBody: [
      "Znam PCOS także z własnego doświadczenia.",
      "Dlatego tak ważne jest dla mnie, żebyś mogła spokojnie opowiedzieć o swojej sytuacji i zadać pytania, z którymi przychodzisz.",
      "Jeśli gubisz się w sprzecznych poradach o diecie, badaniach i suplementach, możemy zacząć od ich uporządkowania. Przyjrzeć się temu, co już robisz, i ustalić, czemu warto poświęcić uwagę w pierwszej kolejności.",
      "Zależy mi, żebyś po rozmowie rozumiała kolejne kroki i wiedziała, jak odnieść je do swoich posiłków, pracy i codziennych obowiązków.",
    ],
    metricTitle: "Doświadczenie konsultacji",
    metricLabel: "kobiet rocznie, którym pomagają moje konsultacje",
    credentialsTitle: "Wiedza, którą możesz sprawdzić.",
    credentialsBody: [
      "Ukończyłam dietetykę kliniczną na Śląskim Uniwersytecie Medycznym.",
      "W konsultacjach łączę wiedzę dietetyczną z analizą Twojej sytuacji i praktycznymi zmianami w codziennym odżywianiu.",
    ],
    diplomaCaption:
      "Dyplom ukończenia dietetyki klinicznej, Śląski Uniwersytet Medyczny",
    diplomaAlt:
      "Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu",
    diplomaPlaceholderTitle: "Miejsce na skan dyplomu",
    diplomaPlaceholderNote: "Dokument do uzupełnienia",
    approachTitle: "Zaczynam od Ciebie i Twojej codzienności.",
    approachLead:
      "Twoje wyniki badań są ważne. Tak samo jak to, co jesz, ile masz czasu na gotowanie i które zmiany jesteś w stanie wprowadzić.",
    approachSteps: [
      {
        title: "Twoja sytuacja jest punktem wyjścia.",
        body: "Przyglądam się Twoim wynikom badań, sposobowi odżywiania i codziennym nawykom. Pytam także o to, co jest dla Ciebie trudne i czego potrzebujesz od konsultacji.",
      },
      {
        title: "Pracujemy na posiłkach, które znasz.",
        body: "Szukamy zmian w tym, co jesz na co dzień. Uwzględniamy Twoje ulubione produkty, czas na przygotowanie posiłków i codzienne obowiązki.",
      },
      {
        title: "Wiesz, od czego zacząć.",
        body: "Wyjaśniam zalecenia i ustalam z Tobą priorytety. Masz wiedzieć, co warto zmienić w pierwszej kolejności i po co to robisz.",
      },
    ],
    approachNote:
      "Konsultacja dietetyczna uzupełnia opiekę lekarską. Nie zastępuje rozpoznania ani leczenia.",
    testimonialsTitle: "Jak kobiety opisują współpracę ze mną.",
    materialsTitle: "Poznaj mnie także przez to, co tworzę.",
    materialsLead:
      "Piszę o PCOS, insulinooporności i codziennym odżywianiu. Przygotowuję też materiały o perimenopauzie. Wybierz temat, który jest Ci teraz bliski.",
    materialsEbooksTitle: "E-booki o PCOS i perimenopauzie.",
    materialsEbooksBody:
      "Badania, suplementy, posiłki i obserwacja samopoczucia.",
    materialsEbooksStatus: "W przygotowaniu",
    materialsEbooksAction: "Poznaj tematy e-booków",
    materialsBlogTitle: "Praktyczna wiedza na blogu.",
    materialsBlogBody:
      "Treści o PCOS i odżywianiu, do których możesz wrócić we własnym tempie.",
    materialsBlogAction: "Czytaj blog",
    consultationTitle: "Porozmawiajmy o Twojej sytuacji.",
    consultationBody:
      "Podczas pojedynczej konsultacji online przyjrzymy się Twoim wynikom badań, odżywianiu i codziennym trudnościom. Ustalimy priorytety oraz zmiany, od których możesz zacząć.",
    consultationFacts: ["online"],
    consultationAction: "Zarezerwuj konsultację",
    consultationContact: "Masz pytanie? Przejdź do kontaktu",
    contactAlt: "Aleksandra Olesiewicz podczas pracy przy laptopie",
  },
  en: {
    pageTitle: "About — Aleksandra Olesiewicz",
    seoTitle: "About — Aleksandra Olesiewicz | clinical dietitian",
    seoDescription:
      "Meet Aleksandra Olesiewicz, a clinical dietitian and graduate of the Medical University of Silesia. PCOS, how she works, and educational materials.",
    heroTitle: "I am Ola.\nI know PCOS\nfrom the inside.",
    heroLead:
      "I am a clinical dietitian and a graduate of the Medical University of Silesia. I help women with PCOS and insulin resistance sort their nutrition and choose changes that fit their days.",
    heroPrimary: "See how I work",
    heroSecondary: "See my materials",
    portraitAlt: "Portrait of Aleksandra Olesiewicz",
    portraitCredit: "Portrait prepared with help from AI.",
    storyTitle: "I want you to feel heard.",
    storyBody: [
      "I also know PCOS from my own experience.",
      "That is why it matters to me that you can talk through your situation and ask the questions you arrived with.",
      "If conflicting advice about diet, tests and supplements leaves you lost, we can start by putting it in order. Look at what you already do, and decide what deserves attention first.",
      "I want you to leave the conversation knowing the next steps and how they fit your meals, work and daily duties.",
    ],
    metricTitle: "Consultation experience",
    metricLabel: "women a year helped by my consultations",
    credentialsTitle: "Knowledge you can check.",
    credentialsBody: [
      "I completed clinical dietetics at the Medical University of Silesia.",
      "In consultations I combine dietetic knowledge with your situation and practical changes in everyday eating.",
    ],
    diplomaCaption:
      "Diploma in clinical dietetics, Medical University of Silesia",
    diplomaAlt:
      "Aleksandra Olesiewicz with her diploma outside the Faculty of Public Health, Medical University of Silesia in Bytom",
    diplomaPlaceholderTitle: "Space for the diploma scan",
    diplomaPlaceholderNote: "Document still to be added",
    approachTitle: "I start with you and your everyday life.",
    approachLead:
      "Your test results matter. So do what you eat, how much time you have to cook, and which changes you can actually make.",
    approachSteps: [
      {
        title: "Your situation is the starting point.",
        body: "I look at your results, how you eat and your daily habits. I also ask what is hard for you and what you need from the consultation.",
      },
      {
        title: "We work with meals you already know.",
        body: "We look for changes in what you eat day to day. We take into account favourite foods, time to cook and daily duties.",
      },
      {
        title: "You know where to start.",
        body: "I explain the recommendations and we set priorities together. You should know what to change first and why.",
      },
    ],
    approachNote:
      "A dietetic consultation complements medical care. It does not replace diagnosis or treatment.",
    testimonialsTitle: "How women describe working with me.",
    materialsTitle: "Get to know me through what I make.",
    materialsLead:
      "I write about PCOS, insulin resistance and everyday nutrition. I am also preparing materials on perimenopause. Pick the topic that is close to you now.",
    materialsEbooksTitle: "E-books on PCOS and perimenopause.",
    materialsEbooksBody: "Tests, supplements, meals and noticing how you feel.",
    materialsEbooksStatus: "In preparation",
    materialsEbooksAction: "See the e-book topics",
    materialsBlogTitle: "Practical writing on the blog.",
    materialsBlogBody:
      "Notes on PCOS and nutrition that you can come back to at your own pace.",
    materialsBlogAction: "Read the blog",
    consultationTitle: "Let's talk about your situation.",
    consultationBody:
      "In a single online consultation we will look at your results, nutrition and daily difficulties. We will set priorities and the changes you can start with.",
    consultationFacts: ["online"],
    consultationAction: "Book a consultation",
    consultationContact: "Have a question? Go to contact",
    contactAlt: "Aleksandra Olesiewicz working at a laptop",
  },
} as const;

const diplomaSlotWidth = 340;
const diplomaSlotMinHeight = 380;

export const DIPLOMA_SLOT_RATIO = diplomaSlotWidth / diplomaSlotMinHeight;

export function diplomaSlotSize(sourceWidth = 1440) {
  return {
    width: sourceWidth,
    height: Math.max(1, Math.round(sourceWidth / DIPLOMA_SLOT_RATIO)),
  };
}

export const diplomaCropPosition = "50% 0%";

export function aboutMaterialsHref(
  language: Locale,
  kind: "ebooks" | "blog",
): string {
  if (kind === "blog") return blogPath(language);
  return ebookCollectionPath(language);
}

export function aboutContactHref(language: Locale): string {
  return `${homePath(language)}#konsultacje`;
}
