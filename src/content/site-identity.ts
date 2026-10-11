import type { Locale } from "@ola/shared";

import { socialProfileSameAs } from "@/content/social-profiles";
import type { PersonCredential, PersonExperience } from "@/sections/types";

/**
 * Source of the shared `Person` (`/#person`) node until siteSettings.siteOwner
 * exists in Sanity (SEO-4). Values mirror visible copy on „O mnie”.
 */
export const siteIdentity = {
  name: "Aleksandra Olesiewicz",
  alternateName: "Ola",
  jobTitle: {
    pl: "Dietetyczka kliniczna",
    en: "Clinical dietitian",
  } satisfies Record<Locale, string>,
  description: {
    pl: "Dietetyczka kliniczna, absolwentka Śląskiego Uniwersytetu Medycznego. Pomaga kobietom z PMOS (PCOS) i insulinoopornością uporządkować odżywianie.",
    en: "Clinical dietitian, graduate of the Medical University of Silesia. Helps women with PMOS (PCOS) and insulin resistance organise their eating.",
  } satisfies Record<Locale, string>,
  knowsAbout: {
    pl: ["PMOS (PCOS)", "Insulinooporność", "Dietetyka kliniczna"],
    en: ["PMOS (PCOS)", "Insulin resistance", "Clinical nutrition"],
  } satisfies Record<Locale, string[]>,
  alumniOf: {
    name: "Śląski Uniwersytet Medyczny w Katowicach",
    url: "https://sum.edu.pl/",
  },
  /** ISCO-08 2265: Dietitians and nutritionists. */
  occupationCode: "2265",
  /** Shown on „O mnie” (user decision 11.10.2026, consent to publish). */
  practiceSince: 2022,
  credentials: {
    pl: [
      {
        category: "degree",
        level: "bachelor",
        name: "Dietetyka",
        specialization: "dietetyka kliniczna",
        institution: "Śląski Uniwersytet Medyczny w Katowicach",
        department: "Wydział Zdrowia Publicznego w Bytomiu",
        institutionUrl: "https://sum.edu.pl/",
        issuerKind: "organization",
        year: 2025,
      },
      {
        category: "course",
        name: "SIBO – od objawów do zdrowia",
        institution: "mgr Emilia Cesarek",
        issuerKind: "person",
        year: 2023,
      },
      {
        category: "course",
        name: "Zaburzenia hormonalne – KDK 22/29",
        institution: "Akademia Ajwen",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Odchudzanie w chorobie Hashimoto",
        institution: "Polski Związek Trenerów Personalnych",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Rola i zastosowanie nukleotydów dietetycznych w postępowaniu żywieniowym",
        institution: "NucleoCare",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Nukleotydy dietetyczne jako istotny element dietoterapii. Innowacyjne sposoby wsparcia odporności, metabolizmu oraz układu pokarmowego i nerwowego",
        institution: "NucleoCare",
        issuerKind: "organization",
        year: 2024,
      },
      {
        category: "course",
        name: "Interpretacja wyników badań laboratoryjnych w ujęciu funkcjonalnym – niedoczynność tarczycy, zanikowe zapalenie tarczycy Hashimoto, choroba Orda, guzki",
        institution: "mgr Monika Gackowska-Lisińska",
        issuerKind: "person",
        year: 2024,
      },
    ],
    en: [
      {
        category: "degree",
        level: "bachelor",
        name: "Dietetics",
        specialization: "clinical dietetics",
        institution: "Medical University of Silesia in Katowice",
        department: "Faculty of Public Health in Bytom",
        institutionUrl: "https://sum.edu.pl/",
        issuerKind: "organization",
        year: 2025,
      },
      {
        category: "course",
        name: "SIBO – od objawów do zdrowia",
        institution: "Emilia Cesarek, MSc",
        issuerKind: "person",
        year: 2023,
      },
      {
        category: "course",
        name: "Zaburzenia hormonalne – KDK 22/29",
        institution: "Akademia Ajwen",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Odchudzanie w chorobie Hashimoto",
        institution: "Polski Związek Trenerów Personalnych",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Rola i zastosowanie nukleotydów dietetycznych w postępowaniu żywieniowym",
        institution: "NucleoCare",
        issuerKind: "organization",
        year: 2023,
      },
      {
        category: "course",
        name: "Nukleotydy dietetyczne jako istotny element dietoterapii. Innowacyjne sposoby wsparcia odporności, metabolizmu oraz układu pokarmowego i nerwowego",
        institution: "NucleoCare",
        issuerKind: "organization",
        year: 2024,
      },
      {
        category: "course",
        name: "Interpretacja wyników badań laboratoryjnych w ujęciu funkcjonalnym – niedoczynność tarczycy, zanikowe zapalenie tarczycy Hashimoto, choroba Orda, guzki",
        institution: "Monika Gackowska-Lisińska, MSc",
        issuerKind: "person",
        year: 2024,
      },
    ],
  } satisfies Record<Locale, PersonCredential[]>,
  experience: [
    { organization: "Szpital Powiatowy w Limanowej im. Miłosierdzia Bożego" },
    {
      organization:
        "Samodzielny Publiczny Zakład Opieki Zdrowotnej w Myślenicach",
    },
  ] satisfies PersonExperience[],
  /** Real photo (docs/ABOUT-EEAT-3A.md, 09.10.2026); hero/contact portraits are AI-generated. */
  portrait: "about",
  sameAs: socialProfileSameAs,
} as const;
