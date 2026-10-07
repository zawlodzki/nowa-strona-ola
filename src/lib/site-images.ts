export const SITE_RASTER_KEYS = [
  "hero",
  "about",
  "contact",
  "food",
  "uns",
  "norsan",
  "norsa",
  "omni",
] as const;

export const SITE_SVG_KEYS = ["alab"] as const;

export type SiteRasterKey = (typeof SITE_RASTER_KEYS)[number];
export type SiteSvgKey = (typeof SITE_SVG_KEYS)[number];

export type SiteImageRef =
  | { type: "local"; key: SiteRasterKey }
  | { type: "svg"; key: SiteSvgKey }
  | { type: "remote"; src: string };

const rasterKeys = new Set<string>(SITE_RASTER_KEYS);
const svgKeys = new Set<string>(SITE_SVG_KEYS);

export function isSiteRasterKey(value: string): value is SiteRasterKey {
  return rasterKeys.has(value);
}

export function isSiteSvgKey(value: string): value is SiteSvgKey {
  return svgKeys.has(value);
}

export function isRemoteImageSrc(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith("/");
}

export function pickSiteImage(
  src: string | undefined,
  fallback?: SiteRasterKey,
): SiteImageRef | undefined {
  if (src && isSiteSvgKey(src)) return { type: "svg", key: src };
  if (src && isSiteRasterKey(src)) return { type: "local", key: src };
  if (src && isRemoteImageSrc(src)) return { type: "remote", src };
  if (fallback) return { type: "local", key: fallback };
  return undefined;
}
