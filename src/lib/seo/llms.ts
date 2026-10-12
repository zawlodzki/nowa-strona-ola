import type { Locale } from "@ola/shared";

import type { ConsultationPrice } from "@/content/map-consultation";
import { siteIdentity } from "@/content/site-identity";
import { sellerCompany } from "@/content/site-legal";
import { availabilityLabel } from "@/lib/offer";
import {
  absolutizeMarkdownLinks,
  markdownPath,
  type InventoryEntry,
  type InventoryKind,
} from "@/lib/seo/inventory";
import { absoluteUrl } from "@/lib/seo/site";

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

function link(entry: InventoryEntry, note?: string): string {
  const description = [entry.description, note]
    .filter(Boolean)
    .map((value) => oneLine(value as string))
    .join(" ");
  const url = absoluteUrl(markdownPath(entry.path));
  return description
    ? `- [${oneLine(entry.title)}](${url}): ${description}`
    : `- [${oneLine(entry.title)}](${url})`;
}

function section(
  title: string,
  entries: InventoryEntry[],
  note?: (entry: InventoryEntry) => string | undefined,
): string[] {
  if (!entries.length) return [];
  return [
    `## ${title}`,
    "",
    ...entries.map((entry) => link(entry, note?.(entry))),
    "",
  ];
}

/**
 * llms.txt (llmstxt.org): curated index of key pages with links to their
 * Markdown alternates. Facts repeat only what the linked pages show.
 */
export function buildLlmsTxt(
  entries: InventoryEntry[],
  consultation: ConsultationPrice & { format: string },
  language: Locale = "pl",
): string {
  const of = (...kinds: InventoryKind[]) =>
    entries.filter((entry) => kinds.includes(entry.kind));
  const ebookNote = (entry: InventoryEntry) => {
    const status = entry.meta?.status;
    if (status === "available" || status === "presale") {
      return entry.meta?.price ? `Cena: ${entry.meta.price}.` : undefined;
    }
    return status
      ? `${availabilityLabel(status as Parameters<typeof availabilityLabel>[0], language)}.`
      : undefined;
  };
  return [
    `# ${siteIdentity.name}`,
    "",
    `> ${siteIdentity.description[language]}`,
    "",
    "Każda strona ma wersję Markdown pod tym samym adresem z rozszerzeniem .md; poniższe linki prowadzą do tych wersji. Strony HTML są wersją kanoniczną.",
    "",
    `[Pełna treść kluczowych stron](${absoluteUrl("/llms-full.txt")})`,
    "",
    "## Kluczowe fakty",
    "",
    `- Autorka treści: ${siteIdentity.name}, ${siteIdentity.jobTitle[language].toLowerCase()}.`,
    `- Wykształcenie: dietetyka kliniczna, ${siteIdentity.alumniOf.name}.`,
    `- Tematy: ${siteIdentity.knowsAbout[language].join(", ")}.`,
    `- Konsultacja: ${[
      consultation.name,
      `${consultation.price} ${consultation.currencyLabel}`,
      consultation.durationLabel,
      consultation.name.toLowerCase().includes(consultation.format)
        ? null
        : consultation.format,
    ]
      .filter(Boolean)
      .join(", ")}.`,
    `- Sprzedawca konsultacji i e-booków: ${sellerCompany.name}, ${sellerCompany.street}, ${sellerCompany.postalCode} ${sellerCompany.city}, NIP ${sellerCompany.nip}.`,
    `- Kontakt: ${sellerCompany.email}.`,
    "",
    ...section("Konsultacje", of("consultation")),
    ...section("E-booki", of("ebook"), ebookNote),
    ...section("Blog", of("article")),
    ...section("O mnie i kontakt", of("about", "contact", "home")),
    ...section(
      "Optional",
      of("blog", "category", "ebooks", "ebookTopic", "legal", "page"),
    ),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
}

const fullContentKinds: InventoryKind[] = [
  "home",
  "about",
  "consultation",
  "ebooks",
  "ebook",
];

export async function buildLlmsFullTxt(
  entries: InventoryEntry[],
): Promise<string> {
  const selected = fullContentKinds.flatMap((kind) =>
    entries.filter((entry) => entry.kind === kind),
  );
  const documents = await Promise.all(
    selected.map(
      async (entry) =>
        `Źródło: ${absoluteUrl(entry.path)}\n\n${absolutizeMarkdownLinks(await entry.markdown(), entry.path).trimEnd()}`,
    ),
  );
  return documents.length ? `${documents.join("\n\n---\n\n")}\n` : "";
}
