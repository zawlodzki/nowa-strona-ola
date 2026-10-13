export const SITE_NAME = "Aleksandra Olesiewicz";

export const SEO_TITLE_LIMIT = 60;

export type TitlePlacement = "home" | "inner";

export interface DocumentTitle {
  title: string;
  brandOmitted: boolean;
}

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

export function placementForPath(
  path: string | null | undefined,
  home: string,
): TitlePlacement {
  return path === home ? "home" : "inner";
}

export function resolveDocumentTitle(
  source: string,
  placement: TitlePlacement,
): DocumentTitle {
  const clean = source.replace(/\s+/g, " ").trim();
  if (clean === "") return { title: "", brandOmitted: false };

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

  if (hasProductLine && !hasBrand) return { title: clean, brandOmitted: false };

  const body = hasBrand ? topicParts.join(" \u2014 ") : clean;
  const candidate =
    body === ""
      ? SITE_NAME
      : placement === "home"
        ? `${SITE_NAME} | ${body}`
        : `${body} | ${SITE_NAME}`;

  if (candidate.length > SEO_TITLE_LIMIT) {
    return { title: clean, brandOmitted: candidate !== clean };
  }
  return { title: candidate, brandOmitted: false };
}

export function documentTitle(
  source: string,
  placement: TitlePlacement,
): string {
  return resolveDocumentTitle(source, placement).title;
}
