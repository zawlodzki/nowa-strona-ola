import type { Locale } from "@ola/shared";

import {
  ebookPaymentMethods,
  ebookPaymentTrustCopy,
} from "@/content/ebook-payment-trust";
import { canPurchase, mapEbook, type EbookView } from "@/content/map-ebook";
import { availabilityLabel } from "@/lib/offer";

function heading(level: 1 | 2 | 3, value: string) {
  return `${"#".repeat(level)} ${value.replaceAll("\n", " ").trim()}`;
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function serializeEbookView(view: EbookView, language: Locale): string {
  const { landing } = view;
  const paymentTrust = ebookPaymentTrustCopy[language];
  return [
    heading(1, view.title),
    view.subtitle,
    view.priceLabel,
    availabilityLabel(view.availability, language),
    heading(2, landing.heroTitle),
    landing.heroLead,
    ...(view.cover?.src
      ? [`![${view.cover.label}](${view.cover.src})`]
      : [landing.coverTopic, bullets(landing.coverArt)]),
    landing.coverCaption,
    ...landing.facts.map((fact) => `${fact.title} · ${fact.detail}`),
    heading(2, landing.problemTitle),
    ...landing.problemParagraphs,
    ...(landing.problemMedia?.src
      ? [`![${landing.problemMedia.label}](${landing.problemMedia.src})`]
      : []),
    bullets(landing.problemQuestions),
    landing.problemCaption,
    heading(2, landing.audienceTitle),
    landing.audienceLead,
    ...landing.audienceItems.flatMap((item) => [
      heading(3, item.title),
      item.body,
    ]),
    landing.educationNote,
    heading(2, landing.contentsTitle),
    landing.contentsLead,
    bullets(landing.ingredients),
    ...view.chapters.flatMap((chapter, index) => [
      heading(3, `${String(index + 1).padStart(2, "0")} ${chapter.title}`),
      chapter.summary,
    ]),
    heading(2, landing.sampleTitle),
    landing.sampleLead,
    ...(landing.sampleMedia?.src
      ? [`![${landing.sampleMedia.label}](${landing.sampleMedia.src})`]
      : [
          landing.sampleKicker,
          heading(3, landing.sampleSheetTitle),
          landing.sampleSheetLead,
          bullets(landing.sampleFields),
          landing.sampleSheetFooter.join(" · "),
        ]),
    bullets(view.materials.map((item) => item.title)),
    landing.sampleCaption,
    heading(2, landing.outcomesTitle),
    landing.outcomesLead,
    ...landing.comparisonItems.map(
      (item) =>
        `- ${landing.beforeLabel}: ${item.before} → ${landing.afterLabel}: ${item.after}`,
    ),
    landing.outcomesNote,
    heading(2, landing.authorTitle),
    ...landing.authorParagraphs,
    ...view.sources.map((source) => `[${source.title}](${source.href})`),
    heading(2, landing.offerTitle),
    landing.offerLead,
    view.format.split("-").join(" + ").toUpperCase(),
    language === "pl"
      ? `${view.chapters.length} rozdziałów`
      : `${view.chapters.length} chapters`,
    view.priceLabel,
    view.lowestPriceNote,
    bullets(view.materials.map((item) => item.title)),
    ...(canPurchase(view.availability) && view.checkoutUrl && view.productCode
      ? [
          ...(view.availability === "available" ? [paymentTrust.delivery] : []),
          paymentTrust.payment,
          `${paymentTrust.methods}: ${ebookPaymentMethods.map((method) => method.name).join(", ")}.`,
          paymentTrust.availability,
        ]
      : []),
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

export const ebookLandingMarkdownExample = `## Suplementy w PMOS\u00A0(PCOS)

97 zł brutto

Wkrótce dostępny

### Zacznij od swojej półki

Zapisz, co bierzesz i po co.
`;
