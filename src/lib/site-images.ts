export const SITE_RASTER_KEYS = [
  "hero",
  "about",
  "contact",
  "food",
  "home-meal",
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

/**
 * Crop instruction for one image.
 * A percentage pair stays a percentage. A keyword such as `left bottom` passes through for Sharp.
 * Percentages are not collapsed to `top` or `centre`.
 */
export function imageCropPosition(objectPosition?: string): string | undefined {
  const instruction = objectPosition?.trim();
  if (!instruction) return undefined;
  return instruction;
}

/** Sharp `position` for a keyword crop. A percentage is not a Sharp gravity. */
export function sharpCropPosition(objectPosition?: string): string | undefined {
  const instruction = imageCropPosition(objectPosition);
  if (!instruction || instruction.includes("%")) return undefined;
  return instruction;
}
