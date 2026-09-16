/**
 * Wordmark source of truth. SVGs are glyph outlines, not live text.
 * To redraw: download Gambarino Regular from `font.source`, then regenerate
 * `logo-{wordmark,stacked,monogram}.svg` from `text` / variant layouts.
 * Do not host Gambarino as a site webfont — page type remains Switzer.
 */
export const logoFont = {
  family: "Gambarino",
  style: "Regular",
  designer: "Théo Guillard",
  foundry: "Indian Type Foundry",
  source: "https://www.fontshare.com/fonts/gambarino",
  download: "https://api.fontshare.com/v2/fonts/download/gambarino",
  license: "ITF Free Font License 2.0",
} as const;

export const logoMark = {
  name: "Aleksandra Olesiewicz",
  text: "aleksandra olesiewicz",
  casing: "lowercase",
  colorToken: "ink",
  colorHex: "#171719",
  font: logoFont,
  variants: {
    wordmark: {
      id: "wordmark",
      layout: "single-line",
      text: "aleksandra olesiewicz",
      svg: "logo-wordmark.svg",
    },
    stacked: {
      id: "stacked",
      layout: "stacked",
      text: "aleksandra\nolesiewicz",
      svg: "logo-stacked.svg",
    },
    monogram: {
      id: "monogram",
      layout: "initials",
      text: "ao",
      svg: "logo-monogram.svg",
    },
  },
} as const;

export type LogoVariant = keyof typeof logoMark.variants;

export function prepareLogoSvg(
  markup: string,
  variant: LogoVariant,
  decorative: boolean,
): string {
  if (decorative) {
    return markup
      .replace(/\srole="img"/, "")
      .replace(/\saria-labelledby="[^"]+"/, "")
      .replace(/\s*<title[^>]*>[^<]*<\/title>\s*/, "\n  ");
  }
  const titleId = `logo-${variant}-title`;
  return markup
    .replaceAll('id="title"', `id="${titleId}"`)
    .replaceAll('aria-labelledby="title"', `aria-labelledby="${titleId}"`);
}
