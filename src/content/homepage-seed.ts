import type { Locale } from "@ola/shared";

import { aboutPath, consultationPath, homeAnchor } from "@/lib/paths";

export const homepageMediaKeys = {
  hero: "hero",
  about: "about",
  contact: "contact",
  food: "food",
  alab: "alab",
  uns: "uns",
  norsan: "norsan",
  norsa: "norsa",
  omni: "omni",
} as const;

export const TESTIMONIAL_QUOTES_PL = [
  "Ola, muszę się pochwalić choć dopiero co zaczęłyśmy! 😀 Na wadze dopiero -3kg, ale już się zadział mały cud. Z twarzy zaczęły znikać mi pryszcze, nie mam już tak wielkiej ochoty na słodycze!! Nawet nie wiesz jak się cieszę ❤️ a to dopiero początek naszej współpracy",
  "Dzięki współpracy z Olą schudłam 8 kg w 3 miesiące bez wyrzeczeń. Hormony się ustabilizowały, energii mam więcej niż kiedykolwiek!",
  "Najlepsza decyzja jaką podjęłam! Aplikacja jest super intuicyjna, a Ola zawsze dostępna gdy potrzebuję pomocy. Polecam z całego serca!",
  "Po latach walki z PCOS w końcu znalazłam kogoś, kto rozumie moje problemy. Dieta jest dopasowana do mnie, a nie ja do diety!",
  "Miałam problem z insulinoopornością i nie widziałam efektów mimo wielu diet. Z Olą w 2 miesiące schudłam 5 kg i wyniki badań się poprawiły!",
  "Nie wierzyłam, że dieta może być elastyczna i smaczna jednocześnie. Ola udowodniła mi, że to możliwe. Gotuje dla całej rodziny z tych samych przepisów!",
] as const;

export const TESTIMONIAL_QUOTES_EN = [
  "Ola, I have to share this even though we have only just started! 😀 The scale shows only −3 kg so far, but a small miracle is already happening. Spots are fading from my face and I no longer crave sweets so much!! You have no idea how happy I am ❤️ and this is only the beginning of our work together",
  "Working with Ola I lost 8 kg in 3 months without deprivation. My hormones settled and I have more energy than ever!",
  "The best decision I have made! The app is intuitive and Ola is there when I need help. I recommend her wholeheartedly!",
  "After years of fighting PCOS I finally found someone who understands my problems. The way of eating is fitted to me, not the other way around!",
  "I struggled with insulin resistance and saw no change despite many diets. With Ola I lost 5 kg in 2 months and my lab results improved!",
  "I did not believe a way of eating could be flexible and tasty at once. Ola showed me it is possible. I now cook for the whole family from the same recipes!",
] as const;

export const DISPLAY_LABEL_COOPERATION = {
  pl: "Opinia o dotychczasowej współpracy",
  en: "Feedback on previous work together",
} as const;

export const EBOOK_SEED = [
  {
    slug: { pl: "suplementy-w-pcos", en: "supplements-in-pcos" },
    topic: "pcos" as const,
    sortOrder: 1,
    coverTone: "light" as const,
    title: { pl: "Suplementy w PCOS", en: "Supplements in PCOS" },
    subtitle: {
      pl: "Decyzje, które mają sens",
      en: "Decisions that make sense",
    },
    description: {
      pl: "Uporządkuj pytania o suplementy: po co je stosować i co omówić ze specjalistą przed zakupem.",
      en: "Sort your questions about supplements: why to use them and what to discuss with a specialist before you buy.",
    },
  },
  {
    slug: { pl: "badania-ktore-maja-sens", en: "tests-that-make-sense" },
    topic: "pcos" as const,
    sortOrder: 2,
    coverTone: "cherry" as const,
    title: { pl: "Badania, które mają sens", en: "Tests that make sense" },
    subtitle: { pl: "Mniej zgadywania", en: "Less guesswork" },
    description: {
      pl: "Przygotuj pytania na wizytę i uporządkuj dotychczasowe wyniki badań.",
      en: "Prepare questions for your appointment and organise the results you already have.",
    },
  },
  {
    slug: { pl: "szczupla-a-jednak-pcos", en: "slim-and-still-pcos" },
    topic: "pcos" as const,
    sortOrder: 3,
    coverTone: "light" as const,
    title: { pl: "Szczupła, a jednak PCOS", en: "Slim, and still PCOS" },
    subtitle: {
      pl: "Z troską o Twoje ciało",
      en: "With care for your body",
    },
    description: {
      pl: "Jak podejść do odżywiania przy PCOS, kiedy Twoim celem nie jest odchudzanie.",
      en: "How to approach nutrition with PCOS when weight loss is not your goal.",
    },
  },
  {
    slug: { pl: "waga-cie-oklamuje", en: "the-scale-is-lying" },
    topic: "perimenopause" as const,
    sortOrder: 4,
    coverTone: "cherry" as const,
    title: { pl: "Waga Cię okłamuje", en: "The scale is lying" },
    subtitle: { pl: "Więcej niż kilogramy", en: "More than kilograms" },
    description: {
      pl: "Przyjrzyj się zmianom w sylwetce i codziennych nawykach w okresie perimenopauzy.",
      en: "Look at changes in your body and daily habits during perimenopause.",
    },
  },
  {
    slug: { pl: "czy-to-juz", en: "is-this-it" },
    topic: "perimenopause" as const,
    sortOrder: 5,
    coverTone: "light" as const,
    title: { pl: "Czy to już?", en: "Is this it already?" },
    subtitle: { pl: "Poznaj swój rytm", en: "Learn your rhythm" },
    description: {
      pl: "Dziennik cyklu i samopoczucia, który pomoże Ci przygotować się do rozmowy z lekarzem.",
      en: "A cycle and wellbeing journal to help you prepare for a conversation with your doctor.",
    },
  },
  {
    slug: { pl: "noc-zaczyna-sie-o-osiemnastej", en: "night-starts-at-six" },
    topic: "perimenopause" as const,
    sortOrder: 6,
    coverTone: "cherry" as const,
    title: {
      pl: "Noc zaczyna się o osiemnastej",
      en: "Night starts at six",
    },
    subtitle: { pl: "Wieczór dla Ciebie", en: "An evening for you" },
    description: {
      pl: "Uporządkuj wieczorne posiłki i nawyki. Sprawdź, co warto obserwować przed rozmową o problemach ze snem.",
      en: "Tidy evening meals and habits. See what is worth watching before you talk about sleep.",
    },
  },
] as const;

export const PARTNER_LOGOS = [
  { key: "alab", name: "ALAB laboratoria" },
  { key: "uns", name: "UNS" },
  { key: "norsan", name: "NORSAN" },
  { key: "norsa", name: "Norsa Pharma" },
  { key: "omni", name: "OMNi-BiOTiC" },
] as const;

export function homepageNavigation(language: Locale) {
  return [
    {
      _key: "nav-ebooks",
      label: language === "pl" ? "E-booki" : "E-books",
      href: homeAnchor(language, "ebooki"),
    },
    {
      _key: "nav-consultations",
      label: language === "pl" ? "Konsultacje" : "Consultations",
      href: consultationPath(language),
    },
    {
      _key: "nav-about",
      label: language === "pl" ? "O mnie" : "About",
      href: aboutPath(language),
    },
    {
      _key: "nav-blog",
      label: "Blog",
      href: language === "pl" ? "/blog/" : "/en/blog/",
    },
  ];
}

export function homepageHeaderCta(language: Locale) {
  return {
    label: "Newsletter",
    href: homeAnchor(language, "newsletter"),
    emphasis: "default",
  };
}

export const homepageCopy = {
  pl: {
    siteTitle: "Aleksandra Olesiewicz",
    footerNote: "PCOS, insulinooporność i odżywianie dopasowane do życia.",
    seoTitle: "Aleksandra Olesiewicz — dietetyczka kliniczna",
    seoDescription:
      "Praktyczne wsparcie w odżywianiu przy PCOS i insulinooporności. Poznaj konsultacje online i materiały o PCOS i perimenopauzie.",
    pageTitle: "Aleksandra Olesiewicz — strona główna",
    heroTitle: "Zrozum swoje ciało.\nZacznij od odżywiania.",
    heroLead:
      "Jestem Ola, dietetyczka kliniczna. Specjalizuję się w PCOS i insulinooporności. Pomagam uporządkować odżywianie i wybrać kolejne kroki dopasowane do Twojego życia. Przygotowuję też e-booki o PCOS i perimenopauzie.",
    heroPrimary: "Poznaj e-booki",
    heroSecondary: "Poznaj konsultacje",
    partnersTitle: "Współpracuję z markami, które znasz",
    approachTitle: "Wiesz, od czego zacząć.\nRozumiesz, po co to robisz.",
    approachLead:
      "Po diagnozie łatwo pogubić się w radach o diecie, badaniach i suplementach. Pomogę Ci uporządkować informacje i przełożyć je na codzienne decyzje.",
    metricLabel: "kobiet rocznie, którym pomagają moje konsultacje",
    highlights: [
      {
        title: "Twoja sytuacja jest punktem wyjścia.",
        body: "Przyglądam się Twoim wynikom badań, sposobowi odżywiania i codziennym nawykom.",
      },
      {
        title: "Zmieniamy to, co jesz na co dzień.",
        body: "Szukamy rozwiązań, które uwzględniają Twoje ulubione posiłki, czas i możliwości.",
      },
      {
        title: "Rozumiesz kolejne kroki.",
        body: "Wyjaśniam zalecenia, żebyś wiedziała, co robisz i dlaczego.",
      },
    ],
    aboutTitle: "Jestem Ola.",
    aboutLead: "Znam PCOS także z własnego doświadczenia.",
    aboutBody: [
      "Jestem dietetyczką kliniczną i sama mam doświadczenie z PCOS. Wiem, jak trudno odnaleźć się w sprzecznych radach i kolejnych próbach zmiany odżywiania.",
      "W pracy z kobietami z PCOS i insulinoopornością łączę analizę wyników badań z praktycznymi zmianami w posiłkach. Zależy mi, żebyś rozumiała zalecenia i potrafiła korzystać z nich w swojej codzienności.",
    ],
    aboutAction: "Poznaj moją historię",
    ebooksTitle: "E-booki o PCOS i perimenopauzie.",
    ebooksLead:
      "Badania, suplementy, codzienne posiłki i obserwacja samopoczucia. Wybierz temat, w którym potrzebujesz więcej jasności.",
    ebooksNote:
      "Zapowiedzi e-booków. Tytuły i okładki są propozycją; materiały są w przygotowaniu.",
    ebooksCardAction: "Poznaj temat",
    ebooksCollection: "Zobacz wszystkie e-booki",
    consultationTitle: "Konsultacje dietetyczne online.",
    consultationBody:
      "Podczas pojedynczej konsultacji przyjrzymy się Twoim wynikom badań, sposobowi odżywiania i temu, z czym trudno Ci sobie poradzić na co dzień. Ustalimy priorytety i zmiany, od których możesz zacząć.",
    consultationFacts: [
      "Spotkanie online",
      "Analiza Twojej sytuacji",
      "Konkretne pierwsze kroki",
    ],
    consultationAction: "Zarezerwuj konsultację",
    testimonialsTitle: "O współpracy ze mną.",
    testimonialsLead: "Doświadczenia moich podopiecznych",
    newsletterTitle: "Mniej sprzecznych rad. Więcej konkretów.",
    newsletterLead:
      "Piszę o PCOS, insulinooporności i codziennym odżywianiu. Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję o nowych materiałach, także o perimenopauzie.",
    newsletterSubmit: "Chcę otrzymywać newsletter",
    newsletterSuccess: "Dane poprawne. Nic nie wysłano.",
    newsletterNoscript:
      "Włącz JavaScript, aby sprawdzić formularz demonstracyjny. Dane nie są zapisywane ani wysyłane.",
    emailLabel: "Adres e-mail",
    emailError: "Wpisz poprawny adres e-mail.",
    consentLabel:
      "Wyrażam zgodę na otrzymywanie newslettera. To demonstracja — nic nie zostanie wysłane.",
    consentError: "Zaznacz zgodę, aby sprawdzić formularz.",
    copyright: "Aleksandra Olesiewicz",
    serviceSummary:
      "Pojedyncza konsultacja dietetyczna online: wyniki, odżywianie, codzienność i pierwsze zmiany.",
  },
  en: {
    siteTitle: "Aleksandra Olesiewicz",
    footerNote: "PCOS, insulin resistance and nutrition that fits real life.",
    seoTitle: "Aleksandra Olesiewicz — clinical dietitian",
    seoDescription:
      "Practical nutrition support for PCOS and insulin resistance. Online consultations and materials on PCOS and perimenopause.",
    pageTitle: "Aleksandra Olesiewicz — home",
    heroTitle: "Understand your body.\nStart with nutrition.",
    heroLead:
      "I am Ola, a clinical dietitian. I specialise in PCOS and insulin resistance. I help you organise nutrition and choose next steps that fit your life. I also prepare e-books on PCOS and perimenopause.",
    heroPrimary: "See the e-books",
    heroSecondary: "See consultations",
    partnersTitle: "I work with brands you already know",
    approachTitle: "You know where to start.\nYou understand why.",
    approachLead:
      "After a diagnosis it is easy to get lost in advice about diet, tests and supplements. I will help you order the information and turn it into everyday decisions.",
    metricLabel: "women a year helped by my consultations",
    highlights: [
      {
        title: "Your situation is the starting point.",
        body: "I look at your lab results, the way you eat and your daily habits.",
      },
      {
        title: "We change what you eat day to day.",
        body: "We look for solutions that include your favourite meals, time and capacity.",
      },
      {
        title: "You understand the next steps.",
        body: "I explain recommendations so you know what you are doing and why.",
      },
    ],
    aboutTitle: "I am Ola.",
    aboutLead: "I also know PCOS from my own experience.",
    aboutBody: [
      "I am a clinical dietitian and I have my own experience of PCOS. I know how hard it is to find your way through conflicting advice and another attempt to change how you eat.",
      "When I work with women with PCOS and insulin resistance I combine lab results with practical changes in meals. I want you to understand the recommendations and use them in your everyday life.",
    ],
    aboutAction: "Read my story",
    ebooksTitle: "E-books on PCOS and perimenopause.",
    ebooksLead:
      "Tests, supplements, everyday meals and watching how you feel. Choose the topic where you need more clarity.",
    ebooksNote:
      "E-book announcements. Titles and covers are proposals; the materials are in preparation.",
    ebooksCardAction: "Explore the topic",
    ebooksCollection: "See all e-books",
    consultationTitle: "Online dietetic consultations.",
    consultationBody:
      "In a single consultation we will look at your lab results, the way you eat and what is hard to manage day to day. We will set priorities and the changes you can start with.",
    consultationFacts: [
      "Online appointment",
      "A look at your situation",
      "Concrete first steps",
    ],
    consultationAction: "Book a consultation",
    testimonialsTitle: "About working with me.",
    testimonialsLead: "Experiences of the women I support",
    newsletterTitle: "Fewer conflicting tips. More specifics.",
    newsletterLead:
      "I write about PCOS, insulin resistance and everyday nutrition. I share notes you can use at an ordinary meal and news about new materials, including perimenopause.",
    newsletterSubmit: "I want the newsletter",
    newsletterSuccess: "The details look correct. Nothing was sent.",
    newsletterNoscript:
      "Turn on JavaScript to check the demonstration form. Nothing is stored or sent.",
    emailLabel: "Email address",
    emailError: "Enter a valid email address.",
    consentLabel:
      "I agree to receive the newsletter. This is a demonstration — nothing will be sent.",
    consentError: "Tick the consent box to check the form.",
    copyright: "Aleksandra Olesiewicz",
    serviceSummary:
      "A single online dietetic consultation: results, nutrition, daily life and first changes.",
  },
} as const;

export function localized<T>(record: { pl: T; en: T }, language: Locale): T {
  return record[language];
}
