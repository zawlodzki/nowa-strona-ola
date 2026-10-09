import type { Locale } from "@ola/shared";
import type { PageContent } from "@/sanity/repository";
import { assertKnownSections } from "./sections";
import {
  toCards,
  toFormCopy,
  toHero,
  toText,
  isTextCards,
} from "./map-sections";

export function mapContact(page: PageContent, language: Locale) {
  assertKnownSections(page.sections);
  const [hero, form, social, company, newsletter] = page.sections;
  if (
    page.sections.length !== 5 ||
    hero?._type !== "heroSection" ||
    form?._type !== "formSection" ||
    social?._type !== "cardsSection" ||
    company?._type !== "textSection" ||
    newsletter?._type !== "formSection"
  ) {
    throw new Error(
      `Contact ${language}: wymagane sekcje hero, formularz, profile, dane firmy, newsletter.`,
    );
  }
  const contact = toFormCopy(form);
  const fields = contact.fields;
  if (
    fields.length !== 3 ||
    fields[0].input !== "email" ||
    fields[1].input !== "tel" ||
    fields[2].input !== "text"
  ) {
    throw new Error(
      "Kontakt wymaga trzech pól: e-mail, telefon, temat rozmowy.",
    );
  }
  const heading = toHero(hero);
  if (!heading.media || !heading.primary.href.startsWith("mailto:")) {
    throw new Error(
      "Kontakt wymaga zdjęcia i odnośnika do bezpośredniego e-maila.",
    );
  }
  const signup = toFormCopy(newsletter);
  const profiles = toCards(social);
  if (isTextCards(profiles) || profiles.items.length === 0) {
    throw new Error("Kontakt wymaga odnośników do profili społecznościowych.");
  }
  if (
    !signup.fields.some((field) => field.input === "checkbox" && field.required)
  ) {
    throw new Error("Newsletter kontaktu wymaga zgody.");
  }
  return {
    hero: { ...heading, media: heading.media },
    form: contact,
    social: profiles,
    company: toText(company),
    newsletter: signup,
  };
}

export type ContactView = ReturnType<typeof mapContact>;
