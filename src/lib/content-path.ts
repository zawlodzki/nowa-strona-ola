import type { Locale } from "@ola/shared";

export type ContentRoute =
  | { kind: "home"; language: Locale }
  | { kind: "page"; language: Locale; slug: string }
  | { kind: "article"; language: Locale; slug: string }
  | { kind: "ebook"; language: Locale; slug: string }
  | {
      kind: "ebookCollection";
      language: Locale;
      topic: "all" | "pcos" | "perimenopause";
    }
  | { kind: "blogIndex"; language: Locale; page: number }
  | { kind: "blogCategory"; language: Locale; slug: string; page: number }
  | { kind: "unknown" };

export function parseContentPath(param?: string): ContentRoute {
  const segments = param ? param.split("/").filter(Boolean) : [];
  if (segments[0] === "en") {
    return parseLocalized(segments.slice(1), "en");
  }
  return parseLocalized(segments, "pl");
}

function parseLocalized(segments: string[], language: Locale): ContentRoute {
  if (segments.length === 0) return { kind: "home", language };

  if (segments[0] === "blog") {
    const pageWord = language === "pl" ? "strona" : "page";
    const categoryWord = language === "pl" ? "kategoria" : "category";
    if (segments.length === 1) {
      return { kind: "blogIndex", language, page: 1 };
    }
    if (segments[1] === pageWord && segments[2]) {
      return { kind: "blogIndex", language, page: Number(segments[2]) };
    }
    if (segments[1] === categoryWord && segments[2]) {
      const page =
        segments[3] === pageWord && segments[4] ? Number(segments[4]) : 1;
      return { kind: "blogCategory", language, slug: segments[2], page };
    }
    if (segments.length === 2) {
      return { kind: "article", language, slug: segments[1] };
    }
    return { kind: "unknown" };
  }

  const ebookRoot = language === "pl" ? "ebooki" : "ebooks";
  const otherEbookRoot = language === "pl" ? "ebooks" : "ebooki";
  if (segments[0] === otherEbookRoot) {
    return { kind: "unknown" };
  }
  if (segments[0] === ebookRoot) {
    const categoryWord = language === "pl" ? "kategoria" : "category";
    if (segments.length === 1) {
      return { kind: "ebookCollection", language, topic: "all" };
    }
    if (
      segments.length === 3 &&
      segments[1] === categoryWord &&
      (segments[2] === "pcos" || segments[2] === "perimenopause")
    ) {
      return { kind: "ebookCollection", language, topic: segments[2] };
    }
    if (segments.length === 2 && segments[1]) {
      return { kind: "ebook", language, slug: segments[1] };
    }
    return { kind: "unknown" };
  }

  if (segments.length === 1) {
    return { kind: "page", language, slug: segments[0] };
  }
  return { kind: "unknown" };
}
