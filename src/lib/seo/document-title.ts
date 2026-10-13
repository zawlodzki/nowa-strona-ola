import type { Locale } from "@ola/shared";

import { homePath } from "@/lib/paths";
import { SITE_NAME } from "@/lib/seo/site";

export const SEO_TITLE_LIMIT = 60;

export type TitlePlacement = "home" | "inner";

const dashOrPipe = String.raw`\s*(?:\||\u2014|\u2013)\s*`;
const spacedHyphen = String.raw`\s+-\s+`;
const SEGMENT_SEPARATOR = new RegExp(`${dashOrPipe}|${spacedHyphen}`);

const PRODUCT_LINE = /^e-book\s+aleksandry\s+olesiewicz$/i;

function isSiteBrand(segment: string): boolean {
  return segment.toLocaleLowerCase("pl") === SITE_NAME.toLocaleLowerCase("pl");
}

function isProductLine(segment: string): boolean {
  return PRODUCT_LINE.test(segment);
}

export function documentTitle(
  source: string,
  placement: TitlePlacement,
): string {
  const clean = source.replace(/\s+/g, " ").trim();
  if (clean === "") return "";

  const topicParts: string[] = [];
  let hasBrand = false;
  let hasProductLine = false;
  for (const segment of clean.split(SEGMENT_SEPARATOR)) {
    if (segment === "") continue;
    if (isSiteBrand(segment)) {
      hasBrand = true;
      continue;
    }
    if (isProductLine(segment)) hasProductLine = true;
    topicParts.push(segment);
  }

  if (hasProductLine && !hasBrand) return clean;

  const body = hasBrand ? topicParts.join(" \u2014 ") : clean;
  const candidate =
    body === ""
      ? SITE_NAME
      : placement === "home"
        ? `${SITE_NAME} | ${body}`
        : `${body} | ${SITE_NAME}`;

  return candidate.length > SEO_TITLE_LIMIT ? clean : candidate;
}

export function titlePlacement(
  path: string | undefined,
  lang: Locale,
): TitlePlacement {
  return path === homePath(lang) ? "home" : "inner";
}
