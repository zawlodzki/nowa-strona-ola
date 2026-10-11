import type { PageGraph } from "@/lib/seo/page-graphs";
import type { SiteSeoData } from "@/lib/seo/site-data";

export interface PageSeo {
  /** Canonical path of the page (always the page itself). */
  path: string;
  ogType?: "website" | "article" | "profile";
  /** Content image (JSON-LD `image`); raster key or URL. */
  image?: { src?: string; alt?: string };
  /** Editor override of the share image (`seo.ogImage`). */
  shareImage?: { src?: string; alt?: string };
  article?: { publishedTime: string; modifiedTime?: string | null };
  graph?: PageGraph;
  /** Person and seller from siteSettings; defaults to repo constants. */
  site?: SiteSeoData;
  /** `false` for pages outside the inventory (pagination, empty categories). */
  markdown?: boolean;
  /** Force noindex regardless of the build environment (e.g. 404). */
  noindex?: boolean;
}
