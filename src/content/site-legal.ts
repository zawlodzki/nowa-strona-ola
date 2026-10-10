import type { Locale } from "@ola/shared";

/**
 * Seller data and legal footer copy from the legal drafts
 * (zgody-i-formularze.md, sections 1 and 8). Fixtures and the siteSettings
 * import read this; Sanity siteSettings overrides it once filled in.
 */
export const sellerCompany = {
  name: "Wellbiz sp. z o.o.",
  street: "ul. Lipowa 3D",
  postalCode: "30-702",
  city: "Kraków",
  krs: "0001158341",
  nip: "6793323800",
  regon: "541006624",
  shareCapital: "5 000 zł",
  email: "ola@aleksandraolesiewicz.com",
  phone: "+48 530 005 133",
};

export const siteLegalCopy = {
  pl: {
    copyright:
      "© 2026 Wellbiz sp. z o.o. · Treści: Aleksandra Olesiewicz-Zawłodzka",
    testimonialsDisclosure:
      "Publikujemy wyłącznie opinie osób, które skorzystały z konsultacji lub kupiły e-book — sprawdzamy to w naszej korespondencji i historii zamówień. Nie płacimy za opinie i nie zmieniamy ich treści. Efekty są indywidualne i nie są gwarantowane.",
  },
  en: {
    copyright:
      "© 2026 Wellbiz sp. z o.o. · Content: Aleksandra Olesiewicz-Zawłodzka",
    testimonialsDisclosure:
      "We only publish reviews from people who had a consultation or bought an e-book — we check this against our correspondence and order history. We do not pay for reviews or change their wording. Results are individual and not guaranteed.",
  },
} as const;

export function footerLegalLinks(language: Locale) {
  return language === "pl"
    ? [
        { _key: "legal-terms", label: "Regulamin", href: "/regulamin/" },
        {
          _key: "legal-privacy",
          label: "Polityka prywatności",
          href: "/polityka-prywatnosci/",
        },
        {
          _key: "legal-cookies",
          label: "Lista cookies",
          href: "/lista-cookies-i-identyfikatorow/",
        },
        {
          _key: "legal-newsletter",
          label: "Regulamin newslettera",
          href: "/regulamin-newslettera/",
        },
        {
          _key: "legal-withdrawal",
          label: "Odstąpienie od umowy",
          href: "/odstapienie/",
        },
      ]
    : [
        {
          _key: "legal-privacy",
          label: "Privacy policy",
          href: "/en/privacy/",
        },
        { _key: "legal-terms", label: "Terms", href: "/en/terms/" },
      ];
}
