import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { mapLegalPage } from "../../src/content/map-legal";
import { serializeLegalPage } from "../../src/content/serialize-legal";
import { articleBodyToHtml } from "../../src/content/portable-text";
import { checkboxLabelHtml } from "../../src/lib/checkbox-label";
import {
  getLegalPage,
  getLegalPagePaths,
  getSiteSettings,
} from "../../src/sanity/repository";

describe("legal page mapper", () => {
  it("maps the Polish privacy policy from the Zawlodzki source", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("pl", "polityka-prywatnosci", { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapLegalPage(page, settings);
    expect(view.href).toBe("/polityka-prywatnosci/");
    expect(view.alternateHref).toBe("/en/privacy/");
    expect(view.title).toBe("Polityka prywatności www.zawlodzki.pl");
    expect(view.effectiveFrom).toBe("2026-08-24");
    expect(view.effectiveLabel).toBe("24.08.2026");
    expect(view.toc[0]?.text).toBe("1. Administrator danych");
    expect(view.html).toContain("1. Administrator danych");
    expect(view.html).toContain('href="/lista-cookies-i-identyfikatorow/"');
    expect(view.html).toContain("<table>");
    expect(serializeLegalPage(view)).toContain("## 1. Administrator danych");
    expect(serializeLegalPage(view)).toBe(
      readFileSync("src/content/examples/legal-privacy.md", "utf8"),
    );
  });

  it("maps cookies, terms and newsletter without rewriting non-legal links", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const cookies = mapLegalPage(
      await getLegalPage("pl", "lista-cookies-i-identyfikatorow", {
        environment: {},
      }),
      settings,
    );
    expect(cookies.href).toBe("/lista-cookies-i-identyfikatorow/");
    expect(cookies.alternateHref).toBeNull();
    expect(cookies.html).toContain('href="/polityka-prywatnosci/"');
    expect(cookies.toc[0]?.text).toBe("Przed dokonaniem wyboru");
    expect(cookies.effectiveLabel).toBe("26.07.2026");

    const terms = mapLegalPage(
      await getLegalPage("pl", "regulamin", { environment: {} }),
      settings,
    );
    expect(terms.title).toContain("Regulamin sklepu");
    expect(terms.toc[0]?.text).toBe("§ 1. Postanowienia ogólne");
    expect(serializeLegalPage(terms)).toBe(
      readFileSync("src/content/examples/legal-terms.md", "utf8"),
    );

    const newsletter = mapLegalPage(
      await getLegalPage("pl", "regulamin-newslettera", { environment: {} }),
      settings,
    );
    expect(newsletter.toc[0]?.text).toBe("§ 1. Kto wysyła newsletter");
    expect(newsletter.effectiveLabel).toBe("01.08.2026");
    expect(serializeLegalPage(newsletter)).toBe(
      readFileSync("src/content/examples/legal-newsletter.md", "utf8"),
    );
  });

  it("keeps English pages as a Polish-binding notice", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("en", "privacy", { environment: {} }),
      getSiteSettings("en", { environment: {} }),
    ]);
    const view = mapLegalPage(page, settings);
    expect(view.href).toBe("/en/privacy/");
    expect(view.bindingHref).toBe("/polityka-prywatnosci/");
    expect(view.html).toContain("binding version is the Polish text");
    expect(view.html).toContain('href="/polityka-prywatnosci/"');
    expect(view.html).not.toContain("Administratorem danych osobowych");
    expect(serializeLegalPage(view)).toBe(
      readFileSync("src/content/examples/legal-privacy-en.md", "utf8"),
    );
  });

  it("lists fixture legal paths for the static build", async () => {
    const paths = await getLegalPagePaths({ environment: {} });
    expect(paths).toEqual(
      expect.arrayContaining([
        { language: "pl", slug: "polityka-prywatnosci" },
        { language: "pl", slug: "regulamin" },
        { language: "pl", slug: "lista-cookies-i-identyfikatorow" },
        { language: "pl", slug: "regulamin-newslettera" },
        { language: "en", slug: "privacy" },
        { language: "en", slug: "terms" },
      ]),
    );
  });
});

describe("legal portable text", () => {
  it("continues a numbered list after an interrupting table", () => {
    const { html } = articleBodyToHtml([
      {
        _type: "block",
        listItem: "number",
        level: 1,
        children: [{ _type: "span", text: "One", marks: [] }],
      },
      {
        _type: "articleTable",
        headers: ["A"],
        rows: [{ cells: ["`x`"] }],
      },
      {
        _type: "block",
        listItem: "number",
        level: 1,
        listStart: 2,
        children: [{ _type: "span", text: "Two", marks: [] }],
      },
    ]);
    expect(html).toContain("<ol>");
    expect(html).toContain('<ol start="2">');
    expect(html).toContain("<code>x</code>");
  });
});

describe("checkbox label links", () => {
  it("turns markdown links into anchors", () => {
    expect(
      checkboxLabelHtml(
        "Zgoda. [Polityka prywatności](/polityka-prywatnosci/) i [regulamin newslettera](/regulamin-newslettera/).",
      ),
    ).toBe(
      'Zgoda. <a href="/polityka-prywatnosci/">Polityka prywatności</a> i <a href="/regulamin-newslettera/">regulamin newslettera</a>.',
    );
  });
});
