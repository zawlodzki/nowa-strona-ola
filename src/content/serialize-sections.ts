import type { Locale } from "@ola/shared";

import {
  isTextCards,
  toCards,
  toComparison,
  toCredentials,
  toCta,
  toEbooks,
  toExpert,
  toFaq,
  toFormCopy,
  toHero,
  toList,
  toLogos,
  toMediaSection,
  toMetrics,
  toPricing,
  toProcess,
  toQuote,
  toRelated,
  toServiceOffer,
  toTestimonials,
  toText,
  toTextImage,
} from "@/content/map-sections";
import { assertKnownSections, type KnownSectionType } from "@/content/sections";
import { toEbookCollection } from "@/content/map-ebook-collection";
import { formatPriceGross, topicLabel } from "@/lib/offer";
import type { PageContent } from "@/sanity/repository";

type Section = NonNullable<PageContent["sections"]>[number];

function heading(level: 2 | 3, text: string): string {
  return `${"#".repeat(level)} ${text.replaceAll("\n", " ").trim()}`;
}

function paragraphs(values: string[]): string {
  return values.map((item) => item.trim()).join("\n\n");
}

function bullet(values: string[]): string {
  return values.map((item) => `- ${item}`).join("\n");
}

function serializeUnknown(type: string): never {
  throw new Error(`Nieznany typ sekcji: ${type}. Zatrzymuję serializację.`);
}

export function serializeSection(section: Section, language: Locale): string {
  switch (section._type) {
    case "heroSection": {
      const content = toHero(section);
      return [
        heading(2, content.title),
        content.eyebrow,
        content.lead,
        `- [${content.primary.label}](${content.primary.href})`,
        content.secondary
          ? `- [${content.secondary.label}](${content.secondary.href})`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "textSection": {
      const content = toText(section);
      return [heading(2, content.title), paragraphs(content.body)].join("\n\n");
    }
    case "textImageSection": {
      const content = toTextImage(section);
      if (content.variant === "questions") {
        return [
          heading(2, content.title),
          paragraphs(content.body),
          bullet(content.prompts),
          [content.resolution.eyebrow, content.resolution.title]
            .filter(Boolean)
            .join(" "),
          content.caption,
        ]
          .filter(Boolean)
          .join("\n\n");
      }
      return [
        heading(2, content.title),
        content.lead,
        paragraphs(content.body),
        content.action
          ? `[${content.action.label}](${content.action.href})`
          : "",
        content.media.label,
        content.secondaryMedia?.label,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "logosSection": {
      const content = toLogos(section);
      const names =
        content.items.length > 0
          ? content.items.map((item) => item.name)
          : content.names;
      return [heading(2, content.title), content.lead, bullet(names)]
        .filter(Boolean)
        .join("\n\n");
    }
    case "cardsSection": {
      const content = toCards(section);
      if (isTextCards(content)) {
        return [
          heading(2, content.title),
          content.lead,
          ...content.items.flatMap((item) => [
            heading(3, item.title),
            item.body,
          ]),
          content.closing,
        ]
          .filter(Boolean)
          .join("\n\n");
      }
      return [
        heading(2, content.title),
        content.lead,
        ...content.items.flatMap((item) => [
          heading(3, item.title),
          item.body,
          item.status,
          `[${item.title}](${item.href})`,
        ]),
      ].join("\n\n");
    }
    case "listSection": {
      const content = toList(section);
      return [heading(2, content.title), content.lead, bullet(content.items)]
        .filter(Boolean)
        .join("\n\n");
    }
    case "processSection": {
      const content = toProcess(section);
      return [
        heading(2, content.title),
        content.lead,
        ...content.steps.flatMap((step) => [heading(3, step.title), step.body]),
        content.media?.label,
        content.note,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "metricsSection": {
      const content = toMetrics(section);
      const metrics = content.items.map(
        (item) => `- ${item.value}${item.suffix} — ${item.label}`,
      );
      const highlights = content.highlights.flatMap((item) => [
        heading(3, item.title),
        item.body,
      ]);
      return [
        heading(2, content.title),
        content.lead,
        metrics.join("\n"),
        ...highlights,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "pricingSection": {
      const content = toPricing(section);
      return [
        heading(2, content.title),
        content.lead,
        ...content.plans.flatMap((plan) => [
          heading(3, plan.name),
          plan.price,
          plan.summary,
          bullet(plan.features),
        ]),
      ].join("\n\n");
    }
    case "testimonialsSection": {
      const content = toTestimonials(section);
      return [
        heading(2, content.title),
        content.lead,
        ...content.items.flatMap((item) => [
          `> ${item.quote}`,
          item.anonymous
            ? item.displayLabel
            : [item.name, item.role].filter(Boolean).join(", "),
        ]),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "expertSection": {
      const content = toExpert(section);
      return [
        heading(2, content.title),
        `${content.name}, ${content.role}`,
        content.intro,
        content.body,
        content.metric
          ? `- ${content.metric.value}${content.metric.suffix} — ${content.metric.label}`
          : "",
        content.action
          ? `[${content.action.label}](${content.action.href})`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "faqSection": {
      const content = toFaq(section);
      return [
        heading(2, content.title),
        content.lead,
        ...content.items.flatMap((item) => [
          heading(3, item.question),
          item.answer,
        ]),
      ].join("\n\n");
    }
    case "comparisonSection": {
      const content = toComparison(section);
      const header = `| ${content.rowHeading} | ${content.columns.join(" | ")} |`;
      const divider = `| ${["---", ...content.columns.map(() => "---")].join(" | ")} |`;
      const rows = content.rows.map(
        (row) => `| ${row.feature} | ${row.values.join(" | ")} |`,
      );
      return [heading(2, content.title), content.lead, header, divider, ...rows]
        .filter(Boolean)
        .join("\n\n");
    }
    case "quoteSection": {
      const content = toQuote(section);
      return [`> ${content.quote}`, content.attribution].join("\n\n");
    }
    case "ctaSection": {
      const content = toCta(section);
      return [
        heading(2, content.title),
        content.lead,
        `[${content.action.label}](${content.action.href})`,
      ].join("\n\n");
    }
    case "formSection": {
      const content = toFormCopy(section);
      return [
        heading(2, content.title),
        content.lead,
        bullet(content.fields.map((field) => field.label)),
        content.noscript,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "mediaSection": {
      const content = toMediaSection(section);
      return [
        heading(2, content.title),
        content.lead,
        content.image.label,
        `[${content.video.title}](${content.video.href})`,
      ].join("\n\n");
    }
    case "relatedSection": {
      const content = toRelated(section, language);
      return [
        heading(2, content.title),
        ...content.items.map((item) => `- [${item.title}](${item.href})`),
      ].join("\n\n");
    }
    case "ebooksSection": {
      const content = toEbooks(section, language);
      return [
        heading(2, content.title),
        content.lead,
        ...content.items.flatMap((item) => [
          heading(3, item.title),
          item.description,
          `[${item.title}](${item.href})`,
          formatPriceGross(item.priceGross, item.currency, language),
          topicLabel(item.topic, language),
          item.availability === "planned"
            ? language === "pl"
              ? "Zapowiedź"
              : "Planned"
            : item.availability,
        ]),
        content.note,
        content.collection
          ? `[${content.collection.label}](${content.collection.href})`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "serviceOfferSection": {
      const content = toServiceOffer(section, language);
      return [
        heading(2, content.title),
        paragraphs(content.body),
        bullet(content.facts),
        content.priceLabel,
        `[${content.action.label}](${content.action.href})`,
        content.note,
        content.secondary
          ? `[${content.secondary.label}](${content.secondary.href})`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "credentialsSection": {
      const content = toCredentials(section);
      return [
        heading(2, content.title),
        paragraphs(content.body),
        `- ${content.person.name}, ${content.person.role}`,
        `- ${content.person.educationProgram}, ${content.person.educationInstitution}`,
        content.person.diploma?.label,
        content.diplomaCaption,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "blogCollectionSection": {
      if (section.variant !== "cherry3a")
        throw new Error("Nieznany wariant kolekcji bloga.");
      return [
        heading(2, section.title ?? ""),
        section.lead,
        section.note,
        heading(3, section.collectionTitle ?? ""),
        section.emptyMessage,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "ebookCollectionSection": {
      const content = toEbookCollection(section, []);
      return [
        heading(2, content.title),
        content.lead,
        heading(3, content.catalogTitle),
        content.catalogLead,
        content.note,
        content.emptyMessage,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    default: {
      const unknownType = (section as { _type?: string })._type ?? "brak";
      return serializeUnknown(unknownType);
    }
  }
}

export function serializePage(page: PageContent, language: Locale): string {
  assertKnownSections(page.sections);
  return [
    `# ${page.title.replaceAll("\n", " ").trim()}`,
    page.seo?.description,
    ...page.sections.map((section) => serializeSection(section, language)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const sectionMarkdownExamples: Record<KnownSectionType, string> = {
  heroSection: "## Tytuł hero\n\nLead hero.",
  textSection: "## Tekst\n\nAkapit.",
  textImageSection: "## O mnie\n\nLead.\n\nAkapit.",
  logosSection: "## Marki\n\n- ALAB laboratoria",
  cardsSection: "## Karty\n\n### Karta\n\nOpis.",
  listSection: "## Lista\n\n- Punkt",
  processSection: "## Proces\n\n### Krok\n\nOpis.",
  metricsSection: "## Podejście\n\n- 450+ — kobiet rocznie",
  pricingSection: "## Pakiety\n\n### Plan\n\nCena",
  testimonialsSection: "## Opinie\n\n> Cytat",
  expertSection: "## Ekspert\n\nOla, dieta",
  faqSection: "## FAQ\n\n### Pytanie\n\nOdpowiedź",
  comparisonSection: "## Porównanie",
  quoteSection: "> Cytat",
  ctaSection: "## Wezwanie",
  formSection: "## Newsletter\n\n- E-mail",
  mediaSection: "## Media",
  relatedSection: "## Powiązane",
  ebooksSection: "## E-booki\n\n### Suplementy w PCOS\n\n97 zł brutto",
  serviceOfferSection: "## Konsultacje\n\n450 zł / 60 minut",
  credentialsSection:
    "## Wiedza, którą możesz sprawdzić.\n\n- Dietetyka kliniczna, Śląski Uniwersytet Medyczny",
  blogCollectionSection: "## Blog. Po Twojemu.\n\n### Wszystkie wpisy",
  ebookCollectionSection:
    "## Więcej jasności. W Twoim tempie.\n\n## Wszystkie e-booki",
};
