import type { Locale } from "@ola/shared";

export type ContentRoute =
  | { kind: "home"; language: Locale }
  | { kind: "page"; language: Locale; slug: string }
  | { kind: "article"; language: Locale; slug: string }
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

export function hrefToContentPathParam(href: string): string | undefined {
  const segments = href.split("/").filter(Boolean);
  return segments.length > 0 ? segments.join("/") : undefined;
}

export function isExcludedCatchAllPath(param?: string): boolean {
  if (!param) return false;
  const [first, second] = param.split("/");
  if (first === "ui" || first === "static") return true;
  return first === "en" && (second === "ui" || second === "static");
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

  if (segments.length === 1) {
    return { kind: "page", language, slug: segments[0] };
  }
  return { kind: "unknown" };
}
