import type { Locale } from "@ola/shared";

import {
  articleBodyToHtml,
  parsePortableBlocks,
  type PortableBlock,
} from "@/content/portable-text";
import { toDatetime } from "@/lib/dates";
import { homePath, pagePath } from "@/lib/paths";
import type { LegalPageContent, SiteSettings } from "@/sanity/repository";

export interface LegalPageView {
  language: Locale;
  href: string;
  alternateHref: string | null;
  bindingHref: string | null;
  seoTitle: string;
  seoDescription: string;
  breadcrumbLabel: string;
  breadcrumbs: { href: string; label: string; current?: boolean }[];
  title: string;
  versionLabel: string;
  effective: { datetime: string; label: string } | null;
  effectiveCaption: string;
  pendingCaption: string;
  versionLine: string;
  tocLabel: string;
  toc: { id: string; text: string }[];
  body: PortableBlock[];
  html: string;
  jsonLd: {
    "@context": "https://schema.org";
    "@graph": Record<string, unknown>[];
  };
}

const copy = {
  pl: {
    home: "Strona główna",
    breadcrumbLabel: "Ścieżka nawigacji",
    toc: "W tym dokumencie",
    version: "Wersja",
    effective: "obowiązuje od",
    pending: "data wejścia w życie do ustalenia",
  },
  en: {
    home: "Home",
    breadcrumbLabel: "Breadcrumb",
    toc: "In this document",
    version: "Version",
    effective: "effective from",
    pending: "effective date to be confirmed",
  },
} as const;

function formatEffectiveNumeric(value: string): string {
  const iso = toDatetime(value);
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) {
    throw new Error(`Niepoprawna data obowiązywania: ${value}`);
  }
  return `${day}.${month}.${year}`;
}

export function mapLegalPage(
  page: LegalPageContent,
  settings: SiteSettings,
): LegalPageView {
  const language = page.language === "en" ? "en" : "pl";
  const slug = page.slug?.trim();
  if (!slug) throw new Error("Strona prawna nie ma adresu. Zatrzymuję build.");
  const title = page.title?.trim();
  if (!title) throw new Error("Strona prawna nie ma tytułu. Zatrzymuję build.");
  const version = page.version?.trim();
  if (!version)
    throw new Error("Strona prawna nie ma wersji. Zatrzymuję build.");
  const effectiveFrom = page.effectiveFrom?.trim() || null;
  const href = pagePath(language, slug);
  const translationSlug = page.translation?.slug?.trim() || null;
  const alternateHref = translationSlug
    ? pagePath(language === "pl" ? "en" : "pl", translationSlug)
    : null;
  const bindingHref =
    language === "en" && page.translation?.slug
      ? pagePath("pl", page.translation.slug)
      : null;
  const body = parsePortableBlocks(page.body);
  const { html, toc } = articleBodyToHtml(body);
  const labels = copy[language];
  const versionLabel = `${labels.version} ${version}`;
  const effective = effectiveFrom
    ? {
        datetime: toDatetime(effectiveFrom),
        label: formatEffectiveNumeric(effectiveFrom),
      }
    : null;
  const origin = "https://aleksandraolesiewicz.com";
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${origin}${href}#webpage`,
      url: `${origin}${href}`,
      name: title,
      inLanguage: language === "pl" ? "pl-PL" : "en-GB",
      version,
      ...(effective ? { datePublished: effective.datetime } : {}),
      isPartOf: { "@id": `${origin}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: labels.home,
          item: `${origin}${homePath(language)}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: `${origin}${href}`,
        },
      ],
    },
  ];
  return {
    language,
    href,
    alternateHref,
    bindingHref,
    seoTitle: page.seo?.title?.trim() || title,
    seoDescription:
      page.seo?.description?.trim() ||
      settings.defaultSeo?.description?.trim() ||
      title,
    breadcrumbLabel: labels.breadcrumbLabel,
    breadcrumbs: [
      { href: homePath(language), label: labels.home },
      { href, label: title, current: true },
    ],
    title,
    versionLabel,
    effective,
    effectiveCaption: labels.effective,
    pendingCaption: labels.pending,
    versionLine: effective
      ? `${versionLabel} · ${labels.effective} ${effective.label}`
      : `${versionLabel} · ${labels.pending}`,
    tocLabel: labels.toc,
    toc,
    body,
    html,
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
  };
}
