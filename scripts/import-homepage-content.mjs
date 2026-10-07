#!/usr/bin/env node
/**
 * Dry-run import szkiców homepage 3a.
 * Domyślnie nic nie zapisuje do Content Lake.
 * Użycie: node scripts/import-homepage-content.mjs
 * Zapis (wymaga SANITY_API_WRITE_TOKEN): --write
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const GAPS = [
  {
    id: "booking-url",
    status: "open",
    detail:
      "Właściwy URL płatnej rezerwacji nieustalony; fixture używa tymczasowego https://cal.com.",
  },
  {
    id: "diploma-scan",
    status: "open",
    detail: "Brak skanu dyplomu; pole autora ma uczelnię i kierunek bez pliku.",
  },
  {
    id: "social-urls",
    status: "open",
    detail:
      "Instagram, Facebook i TikTok są ustalone jako nazwy, bez prawdziwych HTTPS URL.",
  },
  {
    id: "ebook-files",
    status: "open",
    detail:
      "Brak plików e-booków i checkoutu. Status availability=planned. Okładki są kontrolowanym rendererem, nie sześcioma plikami.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN homepage jest robocze, nie zaakceptowane do publikacji.",
  },
  {
    id: "about-consultation-collection-routes",
    status: "deferred",
    detail:
      "Podstrony /o-mnie/, /konsultacje/ i /ebooki/ powstaną w kolejnych pakietach. Nawigacja używa kotwic homepage.",
  },
];

const MEDIA = [
  {
    id: "image-hero",
    role: "hero portrait",
    source: "src/assets/portraits/hero.webp",
    alt: "Aleksandra Olesiewicz, dietetyczka",
  },
  {
    id: "image-about",
    role: "about portrait",
    source: "src/assets/portraits/about.webp",
    alt: "Portret Aleksandry Olesiewicz",
  },
  {
    id: "image-contact",
    role: "consultation photo",
    source: "src/assets/portraits/contact.webp",
    alt: "Aleksandra Olesiewicz podczas pracy przy laptopie",
  },
  {
    id: "image-food",
    role: "about food inset",
    source: "src/assets/editorial/food-editorial.webp",
    alt: "Kolorowy posiłek z warzywami i pieczywem",
  },
  {
    id: "logo-alab",
    role: "partner",
    source: "src/assets/partners/alab.svg",
    alt: "ALAB laboratoria",
  },
  {
    id: "logo-uns",
    role: "partner",
    source: "src/assets/partners/uns.png",
    alt: "UNS",
  },
  {
    id: "logo-norsan",
    role: "partner",
    source: "src/assets/partners/norsan.png",
    alt: "NORSAN",
  },
  {
    id: "logo-norsa",
    role: "partner",
    source: "src/assets/partners/norsa.png",
    alt: "Norsa Pharma",
  },
  {
    id: "logo-omni",
    role: "partner",
    source: "src/assets/partners/omni.png",
    alt: "OMNi-BiOTiC",
  },
];

function documentId(type, language, slug) {
  return `${type}-${slug}-${language}`;
}

function now() {
  return new Date().toISOString();
}

function documents() {
  const created = now();
  const quotesPl = [
    "Ola, muszę się pochwalić choć dopiero co zaczęłyśmy! 😀 Na wadze dopiero -3kg, ale już się zadział mały cud. Z twarzy zaczęły znikać mi pryszcze, nie mam już tak wielkiej ochoty na słodycze!! Nawet nie wiesz jak się cieszę ❤️ a to dopiero początek naszej współpracy",
    "Dzięki współpracy z Olą schudłam 8 kg w 3 miesiące bez wyrzeczeń. Hormony się ustabilizowały, energii mam więcej niż kiedykolwiek!",
    "Najlepsza decyzja jaką podjęłam! Aplikacja jest super intuicyjna, a Ola zawsze dostępna gdy potrzebuję pomocy. Polecam z całego serca!",
    "Po latach walki z PCOS w końcu znalazłam kogoś, kto rozumie moje problemy. Dieta jest dopasowana do mnie, a nie ja do diety!",
    "Miałam problem z insulinoopornością i nie widziałam efektów mimo wielu diet. Z Olą w 2 miesiące schudłam 5 kg i wyniki badań się poprawiły!",
    "Nie wierzyłam, że dieta może być elastyczna i smaczna jednocześnie. Ola udowodniła mi, że to możliwe. Gotuje dla całej rodziny z tych samych przepisów!",
  ];
  const ebooks = [
    ["suplementy-w-pcos", "pcos", "Suplementy w PCOS", 1],
    ["badania-ktore-maja-sens", "pcos", "Badania, które mają sens", 2],
    ["szczupla-a-jednak-pcos", "pcos", "Szczupła, a jednak PCOS", 3],
    ["waga-cie-oklamuje", "perimenopause", "Waga Cię okłamuje", 4],
    ["czy-to-juz", "perimenopause", "Czy to już?", 5],
    [
      "noc-zaczyna-sie-o-osiemnastej",
      "perimenopause",
      "Noc zaczyna się o osiemnastej",
      6,
    ],
  ];

  const authorPl = {
    _id: "author-ola-pl",
    _type: "author",
    language: "pl",
    name: "Aleksandra Olesiewicz",
    slug: { _type: "slug", current: "aleksandra-olesiewicz" },
    role: "Dietetyczka kliniczna",
    bio: "Dietetyczka kliniczna. Specjalizuje się w PCOS i insulinooporności.",
    educationInstitution: "Śląski Uniwersytet Medyczny",
    educationProgram: "Dietetyka kliniczna",
    translation: { _type: "reference", _ref: "author-ola-en" },
  };
  const authorEn = {
    _id: "author-ola-en",
    _type: "author",
    language: "en",
    name: "Aleksandra Olesiewicz",
    slug: { _type: "slug", current: "aleksandra-olesiewicz" },
    role: "Clinical dietitian",
    bio: "Clinical dietitian. Specialises in PCOS and insulin resistance.",
    educationInstitution: "Śląski Uniwersytet Medyczny",
    educationProgram: "Clinical dietetics",
    translation: { _type: "reference", _ref: authorPl._id },
  };

  const servicePl = {
    _id: "service-consultation-pl",
    _type: "service",
    language: "pl",
    title: "Konsultacja dietetyczna online",
    slug: { _type: "slug", current: "konsultacja" },
    summary:
      "Pojedyncza konsultacja dietetyczna online: wyniki, odżywianie, codzienność i pierwsze zmiany.",
    price: 450,
    currency: "PLN",
    durationMinutes: 60,
    bookingUrl: "https://cal.com",
    bookingStatus: "placeholder",
    translation: { _type: "reference", _ref: "service-consultation-en" },
  };
  const serviceEn = {
    ...servicePl,
    _id: "service-consultation-en",
    language: "en",
    title: "Online dietetic consultation",
    slug: { _type: "slug", current: "consultation" },
    summary:
      "A single online dietetic consultation: results, nutrition, daily life and first changes.",
    translation: { _type: "reference", _ref: servicePl._id },
  };

  const formPl = {
    _id: "form-newsletter-pl",
    _type: "form",
    language: "pl",
    title: "Newsletter demonstracyjny",
    submitLabel: "Chcę otrzymywać newsletter",
    successMessage: "Dane poprawne. Nic nie wysłano.",
    noscriptMessage:
      "Włącz JavaScript, aby sprawdzić formularz demonstracyjny. Dane nie są zapisywane ani wysyłane.",
    translation: { _type: "reference", _ref: "form-newsletter-en" },
    fields: [
      {
        _key: "email",
        name: "email",
        input: "email",
        label: "Adres e-mail",
        errorMessage: "Wpisz poprawny adres e-mail.",
        required: "required",
      },
      {
        _key: "consent",
        name: "consent",
        input: "checkbox",
        label:
          "Wyrażam zgodę na otrzymywanie newslettera. To demonstracja — nic nie zostanie wysłane.",
        errorMessage: "Zaznacz zgodę, aby sprawdzić formularz.",
        required: "required",
      },
    ],
  };
  const formEn = {
    ...formPl,
    _id: "form-newsletter-en",
    language: "en",
    title: "Demonstration newsletter",
    submitLabel: "I want the newsletter",
    successMessage: "The details look correct. Nothing was sent.",
    noscriptMessage:
      "Turn on JavaScript to check the demonstration form. Nothing is stored or sent.",
    translation: { _type: "reference", _ref: formPl._id },
    fields: [
      {
        _key: "email",
        name: "email",
        input: "email",
        label: "Email address",
        errorMessage: "Enter a valid email address.",
        required: "required",
      },
      {
        _key: "consent",
        name: "consent",
        input: "checkbox",
        label:
          "I agree to receive the newsletter. This is a demonstration — nothing will be sent.",
        errorMessage: "Tick the consent box to check the form.",
        required: "required",
      },
    ],
  };

  const testimonialsPl = quotesPl.map((quote, index) => ({
    _id: `testimonial-pl-${index + 1}`,
    _type: "testimonial",
    language: "pl",
    quote,
    anonymous: true,
    displayLabel: "Opinia o dotychczasowej współpracy",
    scope: "cooperation",
  }));
  const testimonialsEn = quotesPl.map((_, index) => ({
    _id: `testimonial-en-${index + 1}`,
    _type: "testimonial",
    language: "en",
    quote: `Provisional English testimonial ${index + 1}. Final wording is not approved.`,
    anonymous: true,
    displayLabel: "Feedback on previous cooperation",
    scope: "cooperation",
  }));

  const ebookDocsPl = ebooks.map(([slug, topic, title, sortOrder]) => ({
    _id: documentId("ebook", "pl", slug),
    _type: "ebook",
    language: "pl",
    title,
    slug: { _type: "slug", current: slug },
    topic,
    cardDescription: title,
    coverTone: sortOrder % 2 === 0 ? "cherry" : "light",
    availability: "planned",
    priceGross: 97,
    currency: "PLN",
    format: "pdf",
    sortOrder,
    author: { _type: "reference", _ref: authorPl._id },
    translation: {
      _type: "reference",
      _ref: documentId("ebook", "en", slug),
    },
  }));
  const ebookDocsEn = ebooks.map(([slug, topic, title, sortOrder]) => ({
    _id: documentId("ebook", "en", slug),
    _type: "ebook",
    language: "en",
    title: `${title} (EN, provisional)`,
    slug: { _type: "slug", current: slug },
    topic,
    cardDescription: `${title} — provisional English card copy.`,
    coverTone: sortOrder % 2 === 0 ? "cherry" : "light",
    availability: "planned",
    priceGross: 97,
    currency: "PLN",
    format: "pdf",
    sortOrder,
    author: { _type: "reference", _ref: authorEn._id },
    translation: {
      _type: "reference",
      _ref: documentId("ebook", "pl", slug),
    },
  }));

  const settingsPl = {
    _id: "siteSettings-pl",
    _type: "siteSettings",
    language: "pl",
    siteTitle: "Aleksandra Olesiewicz",
    footerNote: "PCOS, insulinooporność i odżywianie dopasowane do życia.",
    navigation: [
      { _key: "nav-ebooks", label: "E-booki", href: "/#ebooki" },
      {
        _key: "nav-consultations",
        label: "Konsultacje",
        href: "/#konsultacje",
      },
      { _key: "nav-about", label: "O mnie", href: "/#o-mnie" },
      { _key: "nav-blog", label: "Blog", href: "/blog/" },
    ],
    headerCta: {
      _type: "actionLink",
      label: "Newsletter",
      href: "/#newsletter",
      emphasis: "default",
    },
    translation: { _type: "reference", _ref: "siteSettings-en" },
  };
  const settingsEn = {
    ...settingsPl,
    _id: "siteSettings-en",
    language: "en",
    footerNote: "PCOS, insulin resistance and nutrition that fits real life.",
    navigation: [
      { _key: "nav-ebooks", label: "E-books", href: "/en/#ebooki" },
      {
        _key: "nav-consultations",
        label: "Consultations",
        href: "/en/#konsultacje",
      },
      { _key: "nav-about", label: "About", href: "/en/#o-mnie" },
      { _key: "nav-blog", label: "Blog", href: "/en/blog/" },
    ],
    headerCta: {
      _type: "actionLink",
      label: "Newsletter",
      href: "/en/#newsletter",
      emphasis: "default",
    },
    translation: { _type: "reference", _ref: settingsPl._id },
  };

  function homePage(language, extras) {
    return {
      _id: `page-home-${language}`,
      _type: "page",
      language,
      title:
        language === "pl"
          ? "Aleksandra Olesiewicz — strona główna"
          : "Aleksandra Olesiewicz — home",
      slug: { _type: "slug", current: "home" },
      seo: extras.seo,
      translation: {
        _type: "reference",
        _ref: language === "pl" ? "page-home-en" : "page-home-pl",
      },
      _createdNote: created,
      sections: [
        { _key: "home-hero", _type: "heroSection", variant: "split" },
        { _key: "home-logos", _type: "logosSection" },
        { _key: "home-approach", _type: "metricsSection", variant: "approach" },
        { _key: "home-about", _type: "textImageSection" },
        {
          _key: "home-ebooks",
          _type: "ebooksSection",
          items: extras.ebooks.map((doc) => ({
            _type: "reference",
            _ref: doc._id,
          })),
        },
        {
          _key: "home-consultation",
          _type: "serviceOfferSection",
          service: { _type: "reference", _ref: extras.serviceId },
        },
        {
          _key: "home-testimonials",
          _type: "testimonialsSection",
          items: extras.testimonials.map((doc) => ({
            _type: "reference",
            _ref: doc._id,
          })),
        },
        {
          _key: "home-newsletter",
          _type: "formSection",
          form: { _type: "reference", _ref: extras.formId },
        },
      ],
    };
  }

  const pagePl = homePage("pl", {
    seo: {
      title: "Aleksandra Olesiewicz — dietetyczka kliniczna",
      description:
        "Praktyczne wsparcie w odżywianiu przy PCOS i insulinooporności. Poznaj konsultacje online i materiały o PCOS i perimenopauzie.",
    },
    ebooks: ebookDocsPl,
    serviceId: servicePl._id,
    testimonials: testimonialsPl,
    formId: formPl._id,
  });
  const pageEn = homePage("en", {
    seo: {
      title: "Aleksandra Olesiewicz — clinical dietitian",
      description:
        "Practical nutrition support for PCOS and insulin resistance. Online consultations and materials on PCOS and perimenopause.",
    },
    ebooks: ebookDocsEn,
    serviceId: serviceEn._id,
    testimonials: testimonialsEn,
    formId: formEn._id,
  });
  return [
    authorPl,
    authorEn,
    servicePl,
    serviceEn,
    formPl,
    formEn,
    ...testimonialsPl,
    ...testimonialsEn,
    ...ebookDocsPl,
    ...ebookDocsEn,
    settingsPl,
    settingsEn,
    pagePl,
    pageEn,
  ];
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
      "*[_id in $ids]{_id, _updatedAt, _type}",
      {
        ids,
      },
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
  media: MEDIA,
  gaps: GAPS,
  comparison,
  note: "Fixture homepage nie jest dowodem zapisu do CMS. Istniejące dokumenty i zmiany redaktorów trzeba zachować przed ewentualnym createOrReplace.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "homepage-3a-import.ndjson");
const reportPath = join(outDir, "homepage-3a-import-dry-run.json");
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
