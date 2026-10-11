import type { Locale } from "@ola/shared";

import { socialProfileSameAs } from "@/content/social-profiles";

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
    pl: "Dietetyczka kliniczna, absolwentka Śląskiego Uniwersytetu Medycznego. Pomaga kobietom z PCOS i insulinoopornością uporządkować odżywianie.",
    en: "Clinical dietitian, graduate of the Medical University of Silesia. Helps women with PCOS and insulin resistance organise their eating.",
  } satisfies Record<Locale, string>,
  knowsAbout: {
    pl: ["PCOS", "Insulinooporność", "Dietetyka kliniczna"],
    en: ["PCOS", "Insulin resistance", "Clinical nutrition"],
  } satisfies Record<Locale, string[]>,
  alumniOf: {
    name: "Śląski Uniwersytet Medyczny w Katowicach",
    url: "https://sum.edu.pl/",
  },
  /** ISCO-08 2265: Dietitians and nutritionists. */
  occupationCode: "2265",
  /** Real photo (docs/ABOUT-EEAT-3A.md, 09.10.2026); hero/contact portraits are AI-generated. */
  portrait: "about",
  sameAs: socialProfileSameAs,
} as const;
