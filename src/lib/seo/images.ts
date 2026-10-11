import { getImage } from "astro:assets";

import { siteRasters } from "@/assets/site-rasters";
import { pickSiteImage } from "@/lib/site-images";
import { absoluteUrl } from "@/lib/seo/site";

export interface SocialImage {
  url: string;
  width?: number;
  height?: number;
}

interface Size {
  width: number;
  height: number;
  position?: string;
}

/** Absolute JPEG for OG/JSON-LD from a site raster key, Sanity CDN or site URL. */
export async function resolveSocialImage(
  src: string | undefined,
  { width, height, position = "centre" }: Size,
): Promise<SocialImage | undefined> {
  const picked = pickSiteImage(src);
  if (!picked) return undefined;
  if (picked.type === "local") {
    const image = await getImage({
      src: siteRasters[picked.key],
      width,
      height,
      format: "jpg",
      fit: "cover",
      position,
    });
    return { url: absoluteUrl(image.src), width, height };
  }
  const url = new URL(absoluteUrl(picked.src.replace(/^\/\//, "https://")));
  if (url.hostname === "cdn.sanity.io") {
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    url.searchParams.set("fit", "crop");
    url.searchParams.set("fm", "jpg");
    return { url: url.href, width, height };
  }
  return { url: url.href };
}
