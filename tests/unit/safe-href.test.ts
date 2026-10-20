import { describe, expect, it } from "vitest";

import { isSafeHref, requireSafeHref } from "@ola/shared";

import { shellLinks } from "../../src/content/map-homepage";
import { toAction } from "../../src/content/map-sections";
import {
  articleBodyToHtml,
  articleBodyToMarkdown,
  renderInlineMarkup,
} from "../../src/content/portable-text";
import { samePreviewOriginPath } from "../../preview/src/lib/redirect";
import { validateHref } from "../../studio/schema-types/objects/action-link";

const unsafe = [
  "javascript:alert(document.domain)",
  "JavaScript:alert(1)",
  " javascript:alert(1)",
  "java\tscript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "//evil.example/",
  "/\\evil.example/",
];

function linkBlock(href: string) {
  return [
    {
      _type: "block",
      _key: "p",
      style: "normal",
      markDefs: [{ _key: "k1", _type: "link", href }],
      children: [{ _type: "span", text: "link", marks: ["k1"] }],
    },
  ];
}

describe("safe CMS hrefs", () => {
  it.each([
    "/kontakt/",
    "#faq",
    "https://example.com/a?b=1",
    "http://example.com",
    "mailto:ola@example.com",
  ])("accepts %j", (href) => {
    expect(isSafeHref(href)).toBe(true);
    expect(validateHref(href)).toBe(true);
  });

  it.each(unsafe)("rejects %j in shared helper and Studio rule", (href) => {
    expect(isSafeHref(href)).toBe(false);
    expect(validateHref(href)).not.toBe(true);
    expect(() => requireSafeHref(href, "test")).toThrow(/Niedozwolony adres/);
  });

  it.each(unsafe)(
    "stops Portable Text link %j instead of rendering it",
    (href) => {
      expect(() => articleBodyToHtml(linkBlock(href))).toThrow(
        /Niedozwolony adres/,
      );
      expect(() => articleBodyToMarkdown(linkBlock(href))).toThrow(
        /Niedozwolony adres/,
      );
    },
  );

  it("stops unsafe CTA and table links", () => {
    expect(() =>
      articleBodyToHtml([
        {
          _type: "articleCta",
          _key: "cta",
          title: "T",
          lead: "L",
          action: { href: "javascript:alert(1)", label: "Go" },
        },
      ]),
    ).toThrow(/adres CTA/);
    expect(() => renderInlineMarkup("[x](javascript:alert(1))")).toThrow(
      /link w tabeli/,
    );
    expect(renderInlineMarkup("[x](/kontakt/)")).toBe(
      '<a href="/kontakt/">x</a>',
    );
  });

  it("keeps safe Portable Text links", () => {
    expect(articleBodyToHtml(linkBlock("/kontakt/")).html).toContain(
      '<a href="/kontakt/">link</a>',
    );
  });

  it("stops unsafe section actions and site navigation", () => {
    expect(() =>
      toAction({ href: "javascript:alert(1)", label: "Go" }),
    ).toThrow(/Niedozwolony adres/);
    expect(() =>
      shellLinks({
        language: "pl",
        navigation: [{ label: "Blog", href: "javascript:alert(1)" }],
      }),
    ).toThrow(/nawigacja/);
  });
});

describe("preview activation redirect", () => {
  const request = "https://preview.example.com/api/draft-mode/enable?x=1";

  it.each([
    [
      "/blog/wpis/?sanity-preview-perspective=drafts#a",
      "/blog/wpis/?sanity-preview-perspective=drafts#a",
    ],
    ["/", "/"],
  ])("keeps same-origin path %j", (input, expected) => {
    expect(samePreviewOriginPath(input, request)).toBe(expected);
  });

  it.each([
    "//evil.example/",
    "//evil.example/?sanity-preview-perspective=drafts",
    "/\\evil.example/",
    "https://evil.example/",
    "javascript:alert(1)",
    "",
  ])("falls back to / for %j", (input) => {
    expect(samePreviewOriginPath(input, request)).toBe("/");
  });
});

describe("preview activation redirect with the Sanity library", () => {
  it("neutralises the protocol-relative path the library returns", async () => {
    const { validatePreviewUrl } = await import("@sanity/preview-url-secret");
    const client = {
      config: () => ({ token: "dummy" }),
      withConfig: () => client,
      fetch: async () => ({
        private: {
          _id: "secret",
          _updatedAt: "2026-10-20T00:00:00Z",
          secret: "S",
          studioUrl: "https://studio.example.com",
        },
        public: null,
      }),
    };
    const request =
      "https://preview.example.com/api/draft-mode/enable?sanity-preview-secret=S&sanity-preview-pathname=https%3A%2F%2Fx%2F%2Fevil.example%2F&sanity-preview-perspective=drafts";
    const { isValid, redirectTo } = await validatePreviewUrl(
      client as never,
      request,
    );
    expect(isValid).toBe(true);
    expect(redirectTo).toMatch(/^\/\/evil\.example\//);
    expect(samePreviewOriginPath(redirectTo ?? "/", request)).toBe("/");
  });
});
