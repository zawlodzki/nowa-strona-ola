import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { mapLegalPage } from "../../src/content/map-legal";
import { serializeLegalPage } from "../../src/content/serialize-legal";
import {
  articleBodyToHtml,
  articleBodyToMarkdown,
} from "../../src/content/portable-text";
import { unpublishableLegalText } from "../../studio/schema-types/shared/legal-publication";
import { checkboxLabelHtml } from "../../src/lib/checkbox-label";
import {
  getLegalPage,
  getLegalPagePaths,
  getSiteSettings,
} from "../../src/sanity/repository";

describe("legal page mapper", () => {
  it("maps the Polish privacy policy draft without an effective date", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("pl", "polityka-prywatnosci", { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapLegalPage(page, settings);
    expect(view.href).toBe("/polityka-prywatnosci/");
    expect(view.title).toBe("Polityka prywatności aleksandraolesiewicz.com");
    expect(view.versionLabel).toBe("Wersja 2.1");
    expect(view.effective).toBeNull();
    expect(view.versionLine).toBe(
      "Wersja 2.1 · data wejścia w życie do ustalenia",
    );
    expect(view.toc[0]?.text).toBe("1. Kto jest administratorem Twoich danych");
    expect(view.html).toContain('href="/lista-cookies-i-identyfikatorow/"');
    expect(view.html).toContain("<table>");
    expect(view.html).not.toContain("Metryka dokumentu");
    expect(view.html).not.toContain("Historia wersji");
    expect(view.jsonLd["@graph"][0]).toMatchObject({ version: "2.1" });
    expect(view.jsonLd["@graph"][0]).not.toHaveProperty("datePublished");
    expect(serializeLegalPage(view)).toBe(
      readFileSync("src/content/examples/legal-privacy.md", "utf8"),
    );
  });

  it("renders the effective date once it is set", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("pl", "regulamin", { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapLegalPage(
      { ...page, effectiveFrom: "2026-11-01" },
      settings,
    );
    expect(view.effective).toEqual({
      datetime: "2026-11-01",
      label: "01.11.2026",
    });
    expect(view.versionLine).toBe("Wersja 2.2 · obowiązuje od 01.11.2026");
    expect(serializeLegalPage(view).split("\n")[2]).toBe(
      "Wersja 2.2 · obowiązuje od 01.11.2026",
    );
    expect(view.jsonLd["@graph"][0]).toMatchObject({
      version: "2.2",
      datePublished: "2026-11-01",
    });
  });

  it("puts the withdrawal notice and form on the terms page under stable anchors", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const terms = mapLegalPage(
      await getLegalPage("pl", "regulamin", { environment: {} }),
      settings,
    );
    expect(terms.title).toBe(
      "Regulamin sprzedaży e-booków i świadczenia konsultacji dietetycznych online — aleksandraolesiewicz.com",
    );
    expect(terms.toc[0]).toEqual({
      id: "1-postanowienia-ogolne",
      text: "§ 1. Postanowienia ogólne",
    });
    expect(terms.toc.slice(-3)).toEqual([
      { id: "zalaczniki", text: "Załączniki" },
      { id: "pouczenie", text: "Pouczenie o prawie odstąpienia od umowy" },
      {
        id: "formularz-odstapienia",
        text: "Wzór formularza odstąpienia od umowy",
      },
    ]);
    expect(terms.html).toContain(
      '<a href="/regulamin/#pouczenie">Pouczenie o prawie odstąpienia od umowy</a>',
    );
    expect(terms.html).toContain(
      '<a href="/regulamin/#formularz-odstapienia">wzoru formularza</a>',
    );
    expect(terms.html).toContain("<h3>Skutki odstąpienia od umowy</h3>");
    expect(terms.html).toContain(
      "<p>Data zawarcia umowy: ………………………………</p>\n<p>Imię i nazwisko konsumenta(-ów): ………………………………</p>",
    );
    expect(serializeLegalPage(terms)).toBe(
      readFileSync("src/content/examples/legal-terms.md", "utf8"),
    );
  });

  it("maps cookies and newsletter terms with links between documents", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const cookies = mapLegalPage(
      await getLegalPage("pl", "lista-cookies-i-identyfikatorow", {
        environment: {},
      }),
      settings,
    );
    expect(cookies.href).toBe("/lista-cookies-i-identyfikatorow/");
    expect(cookies.alternateHref).toBeNull();
    expect(cookies.html).toContain(
      '<a href="/polityka-prywatnosci/">Politykę prywatności</a>',
    );
    expect(cookies.toc[0]?.text).toBe("Przed dokonaniem wyboru");
    expect(cookies.versionLabel).toBe("Wersja 2.0");
    expect(serializeLegalPage(cookies)).toBe(
      readFileSync("src/content/examples/legal-cookies.md", "utf8"),
    );

    const newsletter = mapLegalPage(
      await getLegalPage("pl", "regulamin-newslettera", { environment: {} }),
      settings,
    );
    expect(newsletter.toc[0]?.text).toBe("§ 1. Kto wysyła newsletter");
    expect(newsletter.versionLabel).toBe("Wersja 2.1");
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
    expect(view.versionLine).toBe(
      "Version 2.1 · effective date to be confirmed",
    );
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

describe("legal blockquotes", () => {
  it("joins consecutive quote paragraphs into one quotation", () => {
    const quote = (text: string) => ({
      _type: "block",
      style: "blockquote",
      children: [{ _type: "span", text, marks: [] }],
    });
    const blocks = [
      quote("Adresat: Wellbiz"),
      quote("(*) Niepotrzebne skreślić."),
      {
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "Po", marks: [] }],
      },
    ];
    expect(articleBodyToHtml(blocks).html).toBe(
      "<blockquote>\n<p>Adresat: Wellbiz</p>\n<p>(*) Niepotrzebne skreślić.</p>\n</blockquote>\n<p>Po</p>",
    );
    expect(articleBodyToMarkdown(blocks)).toBe(
      "> Adresat: Wellbiz\n>\n> (\\*) Niepotrzebne skreślić.\n\nPo",
    );
  });
});

describe("legal publication guard", () => {
  it("lists placeholders and review notes anywhere in the body", () => {
    expect(
      unpublishableLegalText([
        {
          _type: "block",
          _key: "a",
          children: [
            { _type: "span", _key: "s", text: "Wchodzi w życie {{DATA}}." },
          ],
          markDefs: [{ _type: "link", _key: "l", href: "/{{x}}" }],
        },
        {
          _type: "articleTable",
          _key: "t",
          headers: ["Cel"],
          rows: [{ _key: "r", cells: ["okres [do sprawdzenia: GA4]"] }],
        },
      ]),
    ).toEqual(["{{DATA}}.", "{{x}}", "[do sprawdzenia: GA4]"]);
  });

  it("accepts a body without placeholders", () => {
    expect(
      unpublishableLegalText([
        {
          _type: "block",
          _key: "a",
          children: [{ _type: "span", _key: "s", text: "Gotowy tekst." }],
        },
      ]),
    ).toEqual([]);
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
