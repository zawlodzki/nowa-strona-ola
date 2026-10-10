import { describe, expect, it } from "vitest";

import { mapAbout } from "../../src/content/map-about";
import {
  serializePage,
  serializeSection,
  sectionMarkdownExamples,
} from "../../src/content/serialize-sections";
import { knownSectionTypes } from "../../src/content/sections";
import { getPage } from "../../src/sanity/repository";

describe("about 3a fixtures", () => {
  it("maps the Polish about page in the 3a section order", async () => {
    const page = await getPage("pl", "o-mnie", { environment: {} });
    expect(page.sections?.map((section) => section?._type)).toEqual([
      "heroSection",
      "textSection",
      "metricsSection",
      "credentialsSection",
      "processSection",
      "testimonialsSection",
      "cardsSection",
      "serviceOfferSection",
      "formSection",
    ]);
    const view = mapAbout(page, "pl");
    expect(view.hero.title).toContain("Jestem Ola");
    expect(view.experience.value).toBe(450);
    expect(view.credentials.person.educationInstitution).toBe(
      "Śląski Uniwersytet Medyczny",
    );
    expect(view.credentials.person.educationProgram).toBe(
      "Dietetyka kliniczna",
    );
    expect(view.credentials.person.diploma).toMatchObject({
      src: "diploma",
      tone: "photo",
      label:
        "Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu",
    });
    expect(view.approach.steps).toHaveLength(3);
    expect(view.approach.note).toMatch(/Nie zastępuje/);
    expect(view.testimonials.items).toHaveLength(2);
    expect(view.materials.variant).toBe("links");
    expect(view.consultation.action.href).toBe(
      "https://cal.com/dietetyk/konsultacja",
    );
    expect(view.consultation.priceLabel).toBe("450 zł / 60 minut");
    expect(view.newsletter.fields.map((field) => field.name)).toEqual([
      "email",
    ]);
    expect(view.newsletter.noticeConsentId).toBe("Z6");
  });

  it("does not use Polish copy under the English about page", async () => {
    const page = await getPage("en", "about", { environment: {} });
    const view = mapAbout(page, "en");
    expect(view.hero.title).toContain("I am Ola");
    expect(view.hero.lead).not.toMatch(/Jestem Ola/);
    expect(view.credentials.person.educationProgram).toBe("Clinical dietetics");
    expect(view.credentials.person.diploma?.label).toBe(
      "Aleksandra Olesiewicz with her diploma outside the Faculty of Public Health, Medical University of Silesia in Bytom",
    );
    expect(view.newsletter.submit).toBe("Subscribe");
  });
});

describe("about serializers", () => {
  it("serializes education facts and the diploma gap", async () => {
    const page = await getPage("pl", "o-mnie", { environment: {} });
    const markdown = serializePage(page, "pl");
    expect(markdown).toContain("Śląski Uniwersytet Medyczny");
    expect(markdown).toContain("Dietetyka kliniczna");
    expect(markdown).toContain(
      "Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu",
    );
    expect(markdown).toContain("450+");
    expect(markdown).toContain("(https://cal.com/dietetyk/konsultacja)");
    expect(markdown).not.toMatch(/fikcyjny dyplom/i);
  });

  it("keeps an example for credentialsSection and fails unknowns", () => {
    expect(knownSectionTypes).toContain("credentialsSection");
    expect(sectionMarkdownExamples.credentialsSection).toContain(
      "Śląski Uniwersytet Medyczny",
    );
    expect(() =>
      serializeSection({ _key: "x", _type: "mysterySection" } as never, "pl"),
    ).toThrow("Nieznany typ sekcji");
  });
});
