import { contactEmail } from "./contact-fixtures";

export const WITHDRAWAL_SLUG = "odstapienie";

export function withdrawalFormFixture() {
  return {
    id: "form-withdrawal-pl",
    language: "pl" as const,
    title: "Formularz odstąpienia od umowy",
    formKey: "withdrawal",
    version: "2.3",
    submitLabel: "Wysyłam oświadczenie o odstąpieniu",
    notice: null,
    noticeConsentId: null,
    successMessage:
      "Oświadczenie zostało wysłane. Potwierdzenie otrzymasz e-mailem, a zwrot płatności nastąpi w ciągu 14 dni.",
    errorMessage: `Nie udało się wysłać oświadczenia. Spróbuj ponownie albo wyślij je e-mailem na ${contactEmail}.`,
    noscriptMessage: `Formularz wymaga włączonego JavaScriptu. Oświadczenie możesz wysłać e-mailem na ${contactEmail}.`,
    fields: [
      {
        _key: "withdrawal-name",
        name: "fullName",
        input: "text",
        label: "Imię i nazwisko",
        errorMessage: "Wpisz imię i nazwisko (od 2 do 100 znaków).",
        required: "required",
        options: null,
        defaultValue: null,
      },
      {
        _key: "withdrawal-email",
        name: "email",
        input: "email",
        label: "Adres e-mail użyty przy zakupie",
        errorMessage: "Wpisz adres e-mail, którego użyto przy zakupie.",
        required: "required",
        options: null,
        defaultValue: null,
      },
      {
        _key: "withdrawal-subject",
        name: "subject",
        input: "select",
        label: "Czego dotyczy odstąpienie",
        errorMessage: "Wybierz, czego dotyczy odstąpienie.",
        required: "required",
        options: ["E-book", "Konsultacja lub usługa dodatkowa"],
        defaultValue: null,
      },
      {
        _key: "withdrawal-item",
        name: "item",
        input: "text",
        label: "Tytuł e-booka albo data usługi",
        errorMessage: "Wpisz tytuł e-booka albo datę usługi.",
        required: "required",
        options: null,
        defaultValue: null,
      },
      {
        _key: "withdrawal-purchase-date",
        name: "purchaseDate",
        input: "date",
        label: "Data zakupu",
        errorMessage: "Podaj datę zakupu.",
        required: "required",
        options: null,
        defaultValue: null,
      },
      {
        _key: "withdrawal-statement",
        name: "statement",
        input: "textarea",
        label: "Treść oświadczenia",
        errorMessage: "Wpisz treść oświadczenia (do 2000 znaków).",
        required: "required",
        options: null,
        defaultValue:
          "Odstępuję od umowy o dostarczenie e-booka / świadczenie usługi: …, zawartej …",
      },
    ],
  };
}

export function withdrawalPageFixture() {
  return {
    id: "page-withdrawal-pl",
    language: "pl" as const,
    slug: WITHDRAWAL_SLUG,
    title: "Odstąpienie od umowy",
    seo: {
      title: "Odstąpienie od umowy — Aleksandra Olesiewicz",
      description:
        "Formularz odstąpienia od umowy zakupu e-booka lub konsultacji. Wyślij oświadczenie online w ciągu 14 dni.",
    },
    translation: null,
    sections: [
      {
        _key: "withdrawal-intro",
        _type: "textSection",
        eyebrow: "Prawo odstąpienia",
        title: "Odstąpienie od umowy",
        body: [
          "Jako konsument możesz odstąpić od umowy zawartej przez internet w ciągu 14 dni, bez podawania przyczyny. Wystarczy, że wyślesz oświadczenie przed upływem tego terminu.",
          `Oświadczenie możesz też wysłać e-mailem na [${contactEmail}](mailto:${contactEmail}). Terminy, wyjątki i zasady zwrotu opisuje [pouczenie o odstąpieniu](/regulamin/#pouczenie).`,
        ],
      },
      {
        _key: "withdrawal-form",
        _type: "formSection",
        eyebrow: null,
        title: "Formularz odstąpienia",
        lead: "Wszystkie pola są wymagane. Po wysłaniu zobaczysz treść oświadczenia oraz datę i godzinę wysłania.",
        form: withdrawalFormFixture(),
      },
    ],
  };
}
