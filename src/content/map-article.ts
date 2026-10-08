import type { Locale } from "@ola/shared";

import { ebookCollectionCopy } from "@/content/ebook-collection-seed";
import {
  articleBodyToHtml,
  parsePortableBlocks,
  type PortableBlock,
} from "@/content/portable-text";
import { toEbookCard, toFaq, toFormCopy } from "@/content/map-sections";
import { objectPositionFromMedia } from "@/content/blog-collection-seed";
import { formatDate, toDatetime } from "@/lib/dates";
import {
  aboutPath,
  articlePath,
  blogPath,
  ebookCollectionPath,
  homePath,
} from "@/lib/paths";
import type { ArticleContent, SiteSettings } from "@/sanity/repository";
import type { EbookCardContent, FaqContent, FormCopy } from "@/sections/types";

export interface ArticleImageSpec {
  src: string;
  fallback: "about" | "food";
  alt: string;
  width: number;
  height: number;
  objectPosition: string;
}

export interface ArticleRecommendation {
  title: string;
  href: string;
  kicker: string;
}

export interface ArticleEbookPanel {
  title: string;
  lead: string;
  allLabel: string;
  allHref: string;
  actionLabel: string;
  note: string;
  coverTopic: string;
  items: [EbookCardContent, EbookCardContent, EbookCardContent];
}

export interface Article3aView {
  language: Locale;
  href: string;
  alternateHref: string | null;
  seoTitle: string;
  seoDescription: string;
  breadcrumbLabel: string;
  breadcrumbs: { href: string; label: string; current?: boolean }[];
  title: string;
  lead: string;
  proposalNote: string | null;
  byline: {
    name: string;
    role: string;
    href: string;
    photo: ArticleImageSpec;
  };
  publishedAt: string;
  publishedLabel: string;
  updatedAt: string | null;
  updatedLabel: string | null;
  publishedCaption: string;
  updatedCaption: string;
  hero: ArticleImageSpec & { caption: string | null };
  tocLabel: string;
  toc: { id: string; text: string }[];
  share: {
    canonicalUrl: string;
    title: string;
    trigger: string;
    dialog: string;
    close: string;
    copy: string;
    email: string;
    facebook: string;
    whatsapp: string;
    copied: string;
    copyFailed: string;
    manual: string;
  };
  body: PortableBlock[];
  sourcesLabel: string;
  sources: { title: string; href: string }[];
  authors: {
    name: string;
    role: string;
    bio: string;
    aboutHref: string;
    aboutLabel: string;
    photo: ArticleImageSpec;
  }[];
  recommendationsLabel: string;
  recommendations: [ArticleRecommendation, ArticleRecommendation] | null;
  sidebarLabel: string;
  ebooks: ArticleEbookPanel | null;
  faq: (FaqContent & { note: string }) | null;
  newsletter: FormCopy | null;
  sidebar: {
    title: string;
    lead: string;
    actionLabel: string;
    note: string;
  } | null;
  jsonLd: {
    "@context": "https://schema.org";
    "@graph": Record<string, unknown>[];
  };
}

const labels = {
  pl: {
    breadcrumbLabel: "Ścieżka nawigacji",
    home: "Strona główna",
    blog: "Blog",
    published: "Publikacja",
    updated: "Aktualizacja",
    toc: "W tym artykule",
    share: "Udostępnij",
    shareDialog: "Udostępnij artykuł",
    shareClose: "Zamknij opcje udostępniania",
    shareCopy: "Kopiuj link",
    shareEmail: "Wyślij mailem",
    shareFacebook: "Udostępnij na Facebooku",
    shareWhatsapp: "Prześlij przez WhatsApp",
    shareCopied: "Link skopiowany.",
    shareFailed:
      "Nie udało się skopiować automatycznie. Zaznaczony adres możesz skopiować ręcznie.",
    shareManual: "Skopiuj adres ręcznie",
    sources: "Źródła",
    about: "Poznaj mnie bliżej",
    recommendations: "Sprawdź również",
    sidebar: "Newsletter i polecane artykuły",
    booksTitle: "Przyjrzyj się temu bliżej.",
    booksLead: "Trzy e-booki o PCOS wybrane do tego artykułu.",
    faqNote: "Przykładowe FAQ do akceptacji redakcyjnej.",
  },
  en: {
    breadcrumbLabel: "Breadcrumb",
    home: "Home",
    blog: "Blog",
    published: "Published",
    updated: "Updated",
    toc: "In this article",
    share: "Share",
    shareDialog: "Share this article",
    shareClose: "Close sharing options",
    shareCopy: "Copy link",
    shareEmail: "Send by email",
    shareFacebook: "Share on Facebook",
    shareWhatsapp: "Send via WhatsApp",
    shareCopied: "Link copied.",
    shareFailed:
      "Automatic copy failed. Select the address and copy it manually.",
    shareManual: "Copy the address manually",
    sources: "Sources",
    about: "Get to know me",
    recommendations: "See also",
    sidebar: "Newsletter and recommended articles",
    booksTitle: "Take a closer look.",
    booksLead: "Three PCOS e-books chosen for this article.",
    faqNote: "Sample FAQ pending editorial approval.",
  },
} as const;

// The two featured recommendations show both topics from the mockup.
// Each article document still has one category, so the pair is not joinable from the data.
const relatedKickers: Record<Locale, Record<string, string>> = {
  pl: {
    "codzienne-posilki-przy-pcos": "PCOS · Odżywianie",
    "pytania-o-pcos-przed-wizyta": "PCOS · Konsultacje",
  },
  en: {
    "everyday-meals-with-pcos": "PCOS · Nutrition",
    "sorting-pcos-questions-before-an-appointment": "PCOS · Consultations",
  },
};

function required(value: string | null | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`Brak ${name} w artykule.`);
  return trimmed;
}

function localeOf(value: string | null | undefined, fallback: Locale): Locale {
  return value === "en" ? "en" : value === "pl" ? "pl" : fallback;
}

function photoSpec(
  photo:
    | {
        src?: string | null;
        alt?: string | null;
        hotspot?: { x?: number | null; y?: number | null } | null;
      }
    | null
    | undefined,
  alt: string,
  width: number,
  height: number,
  fallbackPosition: string,
): ArticleImageSpec {
  return {
    src: photo?.src?.trim() || "about",
    fallback: "about",
    alt,
    width,
    height,
    objectPosition: objectPositionFromMedia(photo?.hotspot) ?? fallbackPosition,
  };
}

export function mapArticle(
  article: ArticleContent,
  settings: SiteSettings,
): Article3aView {
  const language = localeOf(article.language, "pl");
  const copy = labels[language];
  const books = ebookCollectionCopy[language];
  const slug = required(article.slug, "slug artykułu");
  const title = required(article.title, "tytuł artykułu");
  const lead = required(article.lead, "lead artykułu");
  const publishedAt = required(article.publishedAt, "datę publikacji");
  const author = article.authors?.[0];
  if (!author?.name || !author.role) {
    throw new Error(`Artykuł ${slug} nie ma autorki.`);
  }
  const body = parsePortableBlocks(article.body);
  const { toc } = articleBodyToHtml(body);
  const href = articlePath(language, slug);
  const alternateHref = article.translation?.slug
    ? articlePath(
        localeOf(article.translation.language, language === "pl" ? "en" : "pl"),
        article.translation.slug,
      )
    : null;
  const updatedAt = article.updatedAt?.trim() || null;
  if (updatedAt && updatedAt < publishedAt) {
    throw new Error(
      `Aktualizacja artykułu ${slug} jest wcześniejsza niż publikacja.`,
    );
  }
  const sources = (article.sources ?? []).flatMap((source) =>
    source?.title && source.href
      ? [{ title: source.title, href: source.href }]
      : [],
  );
  const related = (article.related ?? []).flatMap((item) => {
    if (!item?.title || !item.slug) return [];
    if (item.language && item.language !== language) {
      throw new Error(
        `Powiązany artykuł ${item.slug} ma język ${item.language}, oczekiwano ${language}.`,
      );
    }
    const kicker =
      relatedKickers[language][item.slug] ??
      (item.categories ?? [])
        .map((category) => category?.title?.trim())
        .filter((category): category is string => Boolean(category))
        .join(" · ");
    return [
      {
        title: item.title,
        href: articlePath(language, item.slug),
        kicker,
      },
    ];
  });
  const recommendations =
    related.length >= 2
      ? ([related[0], related[1]] as [
          ArticleRecommendation,
          ArticleRecommendation,
        ])
      : null;
  const ebookItems = article.relatedEbooks ?? [];
  if (ebookItems.length !== 0 && ebookItems.length !== 3) {
    throw new Error(
      `Artykuł ${slug} ma ${ebookItems.length} e-booków. Dozwolone jest 0 albo 3.`,
    );
  }
  const ebookSlugs = ebookItems.map((item) => item?.slug);
  if (new Set(ebookSlugs).size !== ebookSlugs.length) {
    throw new Error(`E-booki artykułu ${slug} powtarzają się.`);
  }
  const ebooks =
    ebookItems.length === 3
      ? {
          title: copy.booksTitle,
          lead: copy.booksLead,
          allLabel: books.catalogTitle,
          allHref: ebookCollectionPath(language),
          actionLabel: books.cardActionLabel,
          note: books.note,
          coverTopic: books.coverTopic,
          items: ebookItems.map((item) =>
            toEbookCard(item, language),
          ) as ArticleEbookPanel["items"],
        }
      : null;
  const faq = article.faq
    ? { ...toFaq(article.faq), note: copy.faqNote }
    : null;
  if (faq && faq.items.length === 0) {
    throw new Error(`FAQ artykułu ${slug} nie ma pytań.`);
  }
  const newsletterFields = settings.blogNewsletter;
  const newsletter =
    newsletterFields?.enabled === false
      ? null
      : toFormCopy({
          title: required(newsletterFields?.title, "tytuł newslettera bloga"),
          lead: required(newsletterFields?.lead, "lead newslettera bloga"),
          form: newsletterFields?.form,
        });
  const sidebar =
    newsletter && newsletterFields?.enabled !== false
      ? {
          title: required(
            newsletterFields?.sidebarTitle,
            "tytuł kolumny newslettera",
          ),
          lead: required(
            newsletterFields?.sidebarLead,
            "lead kolumny newslettera",
          ),
          actionLabel: required(
            newsletterFields?.sidebarActionLabel,
            "etykietę kolumny newslettera",
          ),
          note: required(
            newsletterFields?.sidebarNote,
            "notę kolumny newslettera",
          ),
        }
      : null;
  const heroPosition =
    objectPositionFromMedia(article.media?.hotspot) ?? "50% 55%";
  const bylinePhoto = photoSpec(author.photo, "", 96, 96, "50% 25%");
  const authorPhoto = photoSpec(
    author.photo,
    author.photo?.alt?.trim() || author.name,
    96,
    120,
    "50% 50%",
  );
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: title,
      description: lead,
      datePublished: toDatetime(publishedAt),
      ...(updatedAt ? { dateModified: toDatetime(updatedAt) } : {}),
      inLanguage: language,
      author: {
        "@type": "Person",
        name: author.name,
        jobTitle: author.role,
      },
      mainEntityOfPage: href,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: copy.home,
          item: homePath(language),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.blog,
          item: blogPath(language),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.breadcrumbTitle?.trim() || title,
          item: href,
        },
      ],
    },
  ];
  if (faq) {
    graph.push({
      "@type": "FAQPage",
      inLanguage: language,
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return {
    language,
    href,
    alternateHref,
    seoTitle: article.seo?.title?.trim() || title,
    seoDescription: article.seo?.description?.trim() || lead,
    breadcrumbLabel: copy.breadcrumbLabel,
    breadcrumbs: [
      { href: homePath(language), label: copy.home },
      { href: blogPath(language), label: copy.blog },
      {
        href,
        label: article.breadcrumbTitle?.trim() || title,
        current: true,
      },
    ],
    title,
    lead,
    proposalNote: article.proposalNote?.trim() || null,
    byline: {
      name: author.name,
      role: author.role,
      href: "#autor",
      photo: bylinePhoto,
    },
    publishedAt: toDatetime(publishedAt),
    publishedLabel: formatDate(publishedAt, language),
    updatedAt: updatedAt ? toDatetime(updatedAt) : null,
    updatedLabel: updatedAt ? formatDate(updatedAt, language) : null,
    publishedCaption: copy.published,
    updatedCaption: copy.updated,
    hero: {
      src: article.media?.src?.trim() || "food",
      fallback: "food",
      alt: required(article.media?.alt, "tekst alternatywny zdjęcia"),
      width: 1536,
      height: 1024,
      objectPosition: heroPosition,
      caption: article.media?.caption?.trim() || null,
    },
    tocLabel: copy.toc,
    toc,
    share: {
      canonicalUrl: href,
      title,
      trigger: copy.share,
      dialog: copy.shareDialog,
      close: copy.shareClose,
      copy: copy.shareCopy,
      email: copy.shareEmail,
      facebook: copy.shareFacebook,
      whatsapp: copy.shareWhatsapp,
      copied: copy.shareCopied,
      copyFailed: copy.shareFailed,
      manual: copy.shareManual,
    },
    body,
    sourcesLabel: copy.sources,
    sources,
    authors: [
      {
        name: author.name,
        role: author.role,
        bio: required(author.bio, "biogram autorki"),
        aboutHref: aboutPath(language),
        aboutLabel: copy.about,
        photo: authorPhoto,
      },
    ],
    recommendationsLabel: copy.recommendations,
    recommendations,
    sidebarLabel: copy.sidebar,
    ebooks,
    faq,
    newsletter,
    sidebar,
    jsonLd: { "@context": "https://schema.org", "@graph": graph },
  };
}
