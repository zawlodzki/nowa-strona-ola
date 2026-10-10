export const SITE_RASTER_KEYS = [
  "hero",
  "about",
  "contact",
  "food",
  "diploma",
] as const;

export type SiteRasterKey = (typeof SITE_RASTER_KEYS)[number];

export type SiteImageRef =
  { type: "local"; key: SiteRasterKey } | { type: "remote"; src: string };

const rasterKeys = new Set<string>(SITE_RASTER_KEYS);

export function isSiteRasterKey(value: string): value is SiteRasterKey {
  return rasterKeys.has(value);
}

export function isRemoteImageSrc(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith("/");
}

export function pickSiteImage(
  src: string | undefined,
  fallback?: SiteRasterKey,
): SiteImageRef | undefined {
  if (src && isSiteRasterKey(src)) return { type: "local", key: src };
  if (src && isRemoteImageSrc(src)) return { type: "remote", src };
  if (fallback) return { type: "local", key: fallback };
  return undefined;
}

/** Sharp `position` for a CSS object-position percentage pair. */
export function imageCropPosition(objectPosition?: string): string | undefined {
  if (!objectPosition) return undefined;
  const match = /^([\d.]+)%\s+([\d.]+)%$/.exec(objectPosition.trim());
  if (!match) return objectPosition;
  const x = Number(match[1]);
  const y = Number(match[2]);
  const horizontal = x < 35 ? "left" : x > 65 ? "right" : "";
  const vertical = y < 35 ? "top" : y > 65 ? "bottom" : "";
  if (!horizontal && !vertical) return "centre";
  return [horizontal, vertical].filter(Boolean).join(" ");
}
