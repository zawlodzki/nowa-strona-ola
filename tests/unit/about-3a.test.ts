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
    expect(view.experience.value).toBe(9000);
    expect(view.credentials.person.educationInstitution).toBe(
      "Śląski Uniwersytet Medyczny",
    );
    expect(view.credentials.person.educationProgram).toBe(
      "Dietetyka kliniczna",
    );
    expect(view.credentials.person.credentials).toHaveLength(7);
    expect(view.credentials.person.credentials[0]).toMatchObject({
      category: "degree",
      level: "bachelor",
      name: "Dietetyka",
      specialization: "dietetyka kliniczna",
      department: "Wydział Zdrowia Publicznego w Bytomiu",
      year: 2025,
    });
    expect(view.credentials.person.practiceSince).toBe(2022);
    expect(view.credentials.person.experience).toHaveLength(2);
    expect(view.story.body[0]).toBe(
      "Znam PMOS (PCOS) także z własnego doświadczenia. Jak wiele dietetyczek, zaczęłam od szukania rozwiązań dla własnych problemów hormonalnych.",
    );
    expect(view.story.body[1]).toBe(
      "Najpierw uczyłam się sama i to w odżywianiu znalazłam wiele odpowiedzi, których szukałam. Tę wiedzę uporządkowałam i poszerzyłam na studiach dietetycznych na Śląskim Uniwersytecie Medycznym. Dziś pracuję z kobietami, które mierzą się z podobnymi trudnościami jak ja.",
    );
    expect(view.credentials.person.diploma).toMatchObject({
      src: "diploma",
      tone: "photo",
      label:
        "Aleksandra Olesiewicz z pracą dyplomową przed budynkiem Wydziału Zdrowia Publicznego w Bytomiu",
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
      "Aleksandra Olesiewicz with her thesis outside the Faculty of Public Health building in Bytom",
    );
    expect(view.newsletter.submit).toBe("Subscribe");
  });
});

describe("about serializers", () => {
  it("serializes education facts and the diploma gap", async () => {
    const page = await getPage("pl", "o-mnie", { environment: {} });
    const markdown = serializePage(page, "pl");
    expect(markdown).toContain(
      "- Dietetyka, specjalność dietetyka kliniczna, Śląski Uniwersytet Medyczny w Katowicach, Wydział Zdrowia Publicznego w Bytomiu",
    );
    expect(markdown).not.toContain("Licencjat");
    expect(markdown).not.toContain("Stopień");
    expect(markdown).not.toContain("Wcześniejsze miejsca pracy");
    expect(markdown).not.toContain("Limanowej");
    expect(markdown).not.toContain("Myślenicach");
    expect(markdown).toContain("- Praktyka dietetyczna od 2022 roku");
    expect(markdown).toContain("### Szkolenia");
    expect(markdown).toContain(
      "- Odchudzanie w chorobie Hashimoto, Polski Związek Trenerów Personalnych, 2023",
    );
    expect(markdown).toContain(
      "Aleksandra Olesiewicz z pracą dyplomową przed budynkiem Wydziału Zdrowia Publicznego w Bytomiu",
    );
    expect(markdown).toContain("9000+");
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
