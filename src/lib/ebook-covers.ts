import type { Locale } from "@ola/shared";

export type EbookCoverArtKind =
  "decisions" | "route" | "nutrition" | "observation" | "journal" | "evening";

export const EBOOK_COVER_ART: Record<
  string,
  { kind: EbookCoverArtKind; variant: "default" | "alt" }
> = {
  "suplementy-w-pcos": { kind: "decisions", variant: "default" },
  "supplements-in-pcos": { kind: "decisions", variant: "default" },
  "badania-ktore-maja-sens": { kind: "route", variant: "alt" },
  "tests-that-make-sense": { kind: "route", variant: "alt" },
  "szczupla-a-jednak-pcos": { kind: "nutrition", variant: "default" },
  "slim-and-still-pcos": { kind: "nutrition", variant: "default" },
  "waga-cie-oklamuje": { kind: "observation", variant: "default" },
  "the-scale-is-lying": { kind: "observation", variant: "default" },
  "czy-to-juz": { kind: "journal", variant: "alt" },
  "is-this-it": { kind: "journal", variant: "alt" },
  "noc-zaczyna-sie-o-osiemnastej": { kind: "evening", variant: "default" },
  "night-starts-at-six": { kind: "evening", variant: "default" },
};

export function ebookCoverArt(slug: string): {
  kind: EbookCoverArtKind;
  variant: "default" | "alt";
} {
  const art = EBOOK_COVER_ART[slug];
  if (!art) {
    throw new Error(
      `Brak mapowania okładki 3a dla sluga „${slug}”. Nie podstawiam zastępnika.`,
    );
  }
  return art;
}

export function ebookCoverLabels(
  kind: EbookCoverArtKind,
  language: Locale,
): string[] {
  const pl = language === "pl";
  switch (kind) {
    case "decisions":
      return pl ? ["Cel", "Dawka", "Decyzja"] : ["Aim", "Dose", "Decision"];
    case "route":
      return pl ? ["Badania", "Termin", "Wizyta"] : ["Tests", "Date", "Visit"];
    case "observation":
      return pl ? ["Energia", "Siła", "Sen"] : ["Energy", "Strength", "Sleep"];
    case "journal":
      return pl ? ["12 tygodni obserwacji"] : ["12 weeks of observation"];
    case "evening":
      return pl
        ? ["18:00", "20:00", "22:00", "Od kolacji do snu"]
        : ["18:00", "20:00", "22:00", "From dinner to sleep"];
    default:
      return [];
  }
}
