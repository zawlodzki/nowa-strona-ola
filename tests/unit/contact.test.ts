import { isValidActionHref } from "../../studio/schema-types/objects/action-link";
import { describe, expect, it } from "vitest";
import { getPage } from "../../src/sanity/repository";
import { mapContact } from "../../src/content/map-contact";
import { serializePage } from "../../src/content/serialize-sections";
import { validateDemoField } from "../../src/lib/validate-demo";

const fixture = { environment: {} };
describe("contact", () => {
  it.each(["pl", "en"] as const)(
    "maps and exports the %s contact page",
    async (lang) => {
      const page = await getPage(
        lang,
        lang === "pl" ? "kontakt" : "contact",
        fixture,
      );
      const content = mapContact(page, lang);
      expect(content.form.fields.map((field) => field.input)).toEqual([
        "email",
        "tel",
        "text",
      ]);
      expect(content.company.body).toContain("NIP: 6793323800");
      const markdown = serializePage(page, lang);
      for (const value of [
        "ola@aleksandraolesiewicz.com",
        "Wellbiz sp. z o.o.",
        ...content.social.items.map((item) => item.href),
        ...content.form.fields.map((field) => field.label),
      ]) {
        expect(markdown).toContain(value);
      }
    },
  );
  it("stops a malformed contact page instead of hiding missing sections", async () => {
    const page = await getPage("pl", "kontakt", fixture);
    expect(() =>
      mapContact({ ...page, sections: page.sections.slice(1) }, "pl"),
    ).toThrow();
  });
  it.each(["+48 500 600 700", "(500) 600-700", ""])(
    "accepts optional phone %j",
    (value) => {
      expect(validateDemoField("tel", value, false)).toBe(false);
    },
  );
  it.each([
    "abcdef",
    "12345",
    "1234567890123456",
    "123456@",
    "+48" + " ".repeat(40) + "123456",
  ])("rejects phone %j", (value) => {
    expect(validateDemoField("tel", value, false)).toBe(true);
  });
});

describe("CMS action links", () => {
  it.each([
    "mailto:ola@aleksandraolesiewicz.com",
    "mailto:ola+kontakt@example.com",
    "/kontakt/",
    "#newsletter",
    "https://example.com",
  ])("accepts supported destination %j", (href) => {
    expect(isValidActionHref(href)).toBe(true);
  });
  it.each([
    "mailto:",
    "mailto:ola",
    "mailto:ola@example",
    "mailto:ola @example.com",
    "javascript:alert(1)",
    "data:text/html,test",
  ])("rejects invalid destination %j", (href) => {
    expect(isValidActionHref(href)).toBe(false);
  });
});
