import { siteSeoData } from "@/lib/seo/site-data";
import type { PageSeo } from "@/lib/seo/types";
import type { SiteSettings } from "@/sanity/repository";

/** `seo` object of a Sanity document (page, article, ebook, legal page). */
export interface DocumentSeo {
  noindex?: boolean | null;
  ogImage?: { src?: string | null; alt?: string | null } | null;
}

/**
 * Page SEO with editor overrides: `seo.ogImage` replaces the share image and
 * `seo.noindex` hides the page (noindex, no Markdown alternate).
 */
export function pageSeo(
  settings: SiteSettings,
  documentSeo: DocumentSeo | null | undefined,
  base: PageSeo,
): PageSeo {
  const hidden = base.noindex === true || documentSeo?.noindex === true;
  const shareImage = documentSeo?.ogImage?.src
    ? {
        src: documentSeo.ogImage.src,
        alt: documentSeo.ogImage.alt ?? undefined,
      }
    : base.shareImage;
  return {
    ...base,
    shareImage,
    noindex: hidden,
    markdown: hidden ? false : base.markdown,
    site: siteSeoData(settings, settings.language === "en" ? "en" : "pl"),
  };
}
