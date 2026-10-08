import type { Locale } from "@ola/shared";

import { homepageSettingsFixture } from "./homepage-fixtures";
import type { PageContent, SiteSettings } from "./repository";

/** Transitional adapter: preserve existing CMS copy, SEO and form references. */
export function blogPageFromLegacySettings(
  settings: SiteSettings,
  language: Locale,
): PageContent {
  if (settings.language !== language || !settings.blogIndex) {
    throw new Error(`Brak ustawień migracji bloga ${language}.`);
  }
  const { seoTitle, seoDescription, ...collection } = settings.blogIndex;
  const newsletter = settings.blogNewsletter;
  if (
    newsletter?.enabled !== false &&
    (!newsletter?.title || !newsletter.lead || !newsletter.form)
  ) {
    throw new Error(`Brak newslettera migracji bloga ${language}.`);
  }
  return {
    id: `legacy-blog-${language}`,
    language,
    slug: "blog",
    title: seoTitle || collection.title || "Blog",
    seo: { title: seoTitle, description: seoDescription },
    translation: settings.translation?.language
      ? { language: settings.translation.language, slug: "blog" }
      : null,
    sections: [
      {
        ...collection,
        _type: "blogCollectionSection",
        _key: "blog-collection",
        variant: "cherry3a",
      },
      ...(newsletter?.enabled === false
        ? []
        : [
            {
              _type: "formSection" as const,
              _key: "blog-newsletter",
              eyebrow: null,
              title: newsletter?.title ?? "",
              lead: newsletter?.lead ?? null,
              form: newsletter?.form ?? null,
            },
          ]),
    ],
  };
}

export function blogCollectionPageFixture(language: Locale): PageContent {
  const page = blogPageFromLegacySettings(
    homepageSettingsFixture(language) as unknown as SiteSettings,
    language,
  );
  return { ...page, id: `page-blog-collection-${language}` };
}
