import type { Locale } from "@ola/shared";

import { homepageCopy } from "@/content/homepage-seed";
import { sellerCompany } from "@/content/site-legal";
import { SOCIAL_PROFILES } from "@/content/social-profiles";
import { newsletterFormFixture } from "./homepage-fixtures";

export const contactEmail = sellerCompany.email;
export const companyDetails = [
  sellerCompany.name,
  sellerCompany.street,
  `${sellerCompany.postalCode} ${sellerCompany.city}`,
  `NIP: ${sellerCompany.nip}`,
];

export function contactFormFixture(language: Locale) {
  const pl = language === "pl";
  return {
    id: `form-contact-${language}`,
    language,
    title: pl ? "Formularz kontaktowy" : "Contact form",
    submitLabel: pl ? "Sprawdź formularz" : "Check form",
    successMessage: pl
      ? "Dane poprawne. Nic nie wysłano. Aby się skontaktować, napisz e-mail."
      : "Details are valid. Nothing was sent. To get in touch, send an email.",
    noscriptMessage: pl
      ? `Formularz demonstracyjny wymaga JavaScriptu. Napisz na ${contactEmail}.`
      : `This demonstration form requires JavaScript. Email ${contactEmail}.`,
    fields: [
      {
        _key: "contact-email",
        name: "email",
        input: "email",
        label: "E-mail",
        errorMessage: pl
          ? "Wpisz poprawny adres e-mail."
          : "Enter a valid email address.",
        required: "required",
      },
      {
        _key: "contact-phone",
        name: "phone",
        input: "tel",
        label: pl ? "Telefon (opcjonalnie)" : "Phone (optional)",
        errorMessage: pl
          ? "Wpisz poprawny numer telefonu (6–15 cyfr)."
          : "Enter a valid phone number (6–15 digits).",
        required: "optional",
      },
      {
        _key: "contact-topic",
        name: "topic",
        input: "text",
        label: pl ? "Temat rozmowy" : "Conversation topic",
        errorMessage: pl
          ? "Wpisz temat rozmowy (od 2 do 100 znaków)."
          : "Enter a topic (2–100 characters).",
        required: "required",
      },
    ],
  };
}

export function contactPageFixture(language: Locale) {
  const pl = language === "pl";
  const home = homepageCopy[language];
  return {
    id: `page-contact-${language}`,
    language,
    slug: pl ? "kontakt" : "contact",
    title: pl ? "Kontakt" : "Contact",
    seo: {
      title: pl
        ? "Kontakt — Aleksandra Olesiewicz"
        : "Contact — Aleksandra Olesiewicz",
      description: pl
        ? "Skontaktuj się z Olą Olesiewicz. Formularz kontaktowy, adres e-mail, profile społecznościowe i dane firmy Wellbiz sp. z o.o."
        : "Get in touch with Ola Olesiewicz. Contact form, email address, social profiles and company details for Wellbiz sp. z o.o.",
    },
    translation: {
      language: pl ? "en" : "pl",
      slug: pl ? "contact" : "kontakt",
    },
    sections: [
      {
        _key: "contact-hero",
        _type: "heroSection",
        variant: "split",
        theme: "light",
        eyebrow: pl ? "Kontakt" : "Contact",
        title: pl ? "Porozmawiajmy." : "Let’s talk.",
        lead: pl
          ? "Masz pytanie o konsultację, e-booki lub współpracę? Napisz do mnie."
          : "Have a question about a consultation, e-books or working together? Get in touch.",
        primary: {
          label: contactEmail,
          href: `mailto:${contactEmail}`,
          emphasis: "default",
        },
        secondary: null,
        media: {
          src: "contact",
          alt: "Aleksandra Olesiewicz",
          label: "Aleksandra Olesiewicz",
          tone: "photo",
          caption: null,
        },
      },
      {
        _key: "contact-form",
        _type: "formSection",
        eyebrow: null,
        title: pl ? "Napisz do mnie" : "Write to me",
        lead: pl
          ? "E-mail i temat rozmowy są wymagane. Telefon możesz zostawić, jeśli chcesz."
          : "Email and topic are required. You can leave a phone number if you wish.",
        form: contactFormFixture(language),
      },
      {
        _key: "contact-social",
        _type: "cardsSection",
        variant: "links",
        eyebrow: null,
        title: pl ? "Znajdziesz mnie też tutaj" : "You can also find me here",
        lead: pl ? "Moje profile społecznościowe." : "My social profiles.",
        items: SOCIAL_PROFILES.map((profile) => ({
          _key: profile._key,
          title: profile.label,
          body: profile.label,
          href: profile.href,
          status: null,
          media: null,
        })),
      },
      {
        _key: "contact-company",
        _type: "textSection",
        eyebrow: null,
        title: pl ? "Dane firmy" : "Company details",
        body: [...companyDetails],
      },
      {
        _key: "contact-newsletter",
        _type: "formSection",
        eyebrow: null,
        title: home.newsletterTitle,
        lead: home.newsletterLead,
        form: newsletterFormFixture(language),
      },
    ],
  };
}
