import type { Locale } from "@ola/shared";

import { mapEbook, type EbookView } from "@/content/map-ebook";
import { ebookCopy } from "@/content/ebook-seed";

function heading(level: 1 | 2 | 3, value: string) {
  return `${"#".repeat(level)} ${value.replaceAll("\n", " ").trim()}`;
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function serializeEbookView(view: EbookView, language: Locale): string {
  const copy = ebookCopy[language];
  const { landing } = view;
  return [
    heading(1, view.title),
    view.subtitle,
    view.priceLabel,
    copy.plannedStatus,
    view.availability,
    landing.heroLead,
    heading(2, landing.problemTitle),
    ...landing.problemParagraphs,
    bullets(landing.problemQuestions),
    heading(2, landing.audienceTitle),
    landing.audienceLead,
    ...landing.audienceItems.flatMap((item) => [
      heading(3, item.title),
      item.body,
    ]),
    landing.educationNote,
    heading(2, landing.contentsTitle),
    landing.contentsLead,
    ...view.chapters.flatMap((chapter, index) => [
      heading(3, `${String(index + 1).padStart(2, "0")} ${chapter.title}`),
      chapter.summary,
    ]),
    heading(2, landing.sampleTitle),
    landing.sampleLead,
    bullets(view.materials.map((item) => item.title)),
    landing.sampleCaption,
    heading(2, landing.outcomesTitle),
    landing.outcomesLead,
    ...landing.comparisonItems.map(
      (item) => `- ${item.before} → ${item.after}`,
    ),
    landing.outcomesNote,
    heading(2, landing.authorTitle),
    ...landing.authorParagraphs,
    ...view.sources.map((source) => `[${source.title}](${source.href})`),
    heading(2, landing.offerTitle),
    landing.offerLead,
    view.priceLabel,
    view.lowestPriceNote,
    bullets(view.materials.map((item) => item.title)),
    landing.offerNote,
    heading(2, landing.testimonials.title),
    landing.testimonials.lead,
    ...landing.testimonials.items.flatMap((item) => [
      `> ${item.quote}`,
      item.displayLabel ?? item.name,
    ]),
    heading(2, landing.faq.title),
    landing.faq.lead,
    ...landing.faq.items.flatMap((item) => [
      heading(3, item.question),
      item.answer,
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function serializeEbook(
  ebook: Parameters<typeof mapEbook>[0],
  language: Locale,
): string {
  return serializeEbookView(mapEbook(ebook, language), language);
}

export const ebookLandingMarkdownExample = `## Suplementy w PCOS

97 zł brutto

Zapowiedź

### Zacznij od swojej półki

Zapisz, co bierzesz i po co.
`;
