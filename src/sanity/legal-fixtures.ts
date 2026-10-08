import type { Locale } from "@ola/shared";

import type { PortableBlock } from "@/content/portable-text";
import cookiesSource from "@/content/legal-bodies/lista-cookies-i-identyfikatorow.json";
import newsletterSource from "@/content/legal-bodies/regulamin-newslettera.json";
import privacySource from "@/content/legal-bodies/polityka-prywatnosci.json";
import termsSource from "@/content/legal-bodies/regulamin.json";

interface LegalSourceFile {
  title: string;
  effectiveFrom: string;
  effectiveLabel: string;
  seoDescription: string;
  body: PortableBlock[];
}

const privacy = privacySource as LegalSourceFile;
const cookies = cookiesSource as LegalSourceFile;
const terms = termsSource as LegalSourceFile;
const newsletter = newsletterSource as LegalSourceFile;

function noticeBody(href: string, linkLabel: string): PortableBlock[] {
  return [
    {
      _type: "block",
      _key: "en-notice",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "This page does not include an English translation of the legal document. The binding version is the Polish text.",
          marks: [],
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "en-notice-link",
      style: "normal",
      children: [
        {
          _type: "span",
          text: linkLabel,
          marks: ["to-pl"],
        },
      ],
      markDefs: [{ _type: "link", _key: "to-pl", href }],
    },
  ];
}

export const demonstrationLegalPages = {
  "pl/polityka-prywatnosci": {
    id: "legal-privacy-pl",
    language: "pl" as const,
    slug: "polityka-prywatnosci",
    title: privacy.title,
    effectiveFrom: privacy.effectiveFrom,
    seo: {
      title: "Polityka prywatności",
      description: privacy.seoDescription,
    },
    translation: { language: "en" as const, slug: "privacy" },
    body: privacy.body,
  },
  "en/privacy": {
    id: "legal-privacy-en",
    language: "en" as const,
    slug: "privacy",
    title: "Privacy policy",
    effectiveFrom: privacy.effectiveFrom,
    seo: {
      title: "Privacy policy",
      description:
        "The binding version of this document is the Polish privacy policy.",
    },
    translation: { language: "pl" as const, slug: "polityka-prywatnosci" },
    body: noticeBody(
      "/polityka-prywatnosci/",
      "Read the Polish privacy policy",
    ),
  },
  "pl/regulamin": {
    id: "legal-terms-pl",
    language: "pl" as const,
    slug: "regulamin",
    title: terms.title,
    effectiveFrom: terms.effectiveFrom,
    seo: {
      title: "Regulamin",
      description: terms.seoDescription,
    },
    translation: { language: "en" as const, slug: "terms" },
    body: terms.body,
  },
  "en/terms": {
    id: "legal-terms-en",
    language: "en" as const,
    slug: "terms",
    title: "Terms",
    effectiveFrom: terms.effectiveFrom,
    seo: {
      title: "Terms",
      description: "The binding version of this document is the Polish terms.",
    },
    translation: { language: "pl" as const, slug: "regulamin" },
    body: noticeBody("/regulamin/", "Read the Polish terms"),
  },
  "pl/lista-cookies-i-identyfikatorow": {
    id: "legal-cookies-pl",
    language: "pl" as const,
    slug: "lista-cookies-i-identyfikatorow",
    title: cookies.title,
    effectiveFrom: cookies.effectiveFrom,
    seo: {
      title: "Lista cookies i identyfikatorów",
      description: cookies.seoDescription,
    },
    translation: null,
    body: cookies.body,
  },
  "pl/regulamin-newslettera": {
    id: "legal-newsletter-pl",
    language: "pl" as const,
    slug: "regulamin-newslettera",
    title: newsletter.title,
    effectiveFrom: newsletter.effectiveFrom,
    seo: {
      title: "Regulamin newslettera",
      description: newsletter.seoDescription,
    },
    translation: null,
    body: newsletter.body,
  },
} as const;

export function fixtureLegalPage(language: Locale, slug: string) {
  return demonstrationLegalPages[
    `${language}/${slug}` as keyof typeof demonstrationLegalPages
  ];
}

export function fixtureLegalPagesForLanguage(language: Locale) {
  return Object.values(demonstrationLegalPages).filter(
    (page) => page.language === language,
  );
}
