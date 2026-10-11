import type { PolicyConfig, Translations } from "c15t";

export const olaTranslations = {
  common: {
    acceptAll: "Akceptuję wszystkie",
    rejectAll: "Odrzucam opcjonalne",
    customize: "Dostosuj",
    save: "Zapisuję wybór",
    close: "Zamknij",
    securedBy: "Zabezpieczone przez",
  },
  cookieBanner: {
    title: "Pliki cookies na tej stronie",
    description:
      "Niezbędne pliki cookies zapewniają działanie strony. Za Twoją zgodą włączymy też narzędzia analityczne (pomagają nam ulepszać stronę) i marketingowe (mierzymy skuteczność reklam). Na stronach konsultacji, e-booków, w zamówieniu i ankiecie te narzędzia nigdy nie działają. Wybór zmienisz w każdej chwili w „Ustawieniach cookies”.",
  },
  consentManagerDialog: {
    title: "Ustawienia cookies",
    description:
      "Wybierz kategorie cookies. Zgodę możesz zmienić lub wycofać w każdej chwili.",
  },
  consentTypes: {
    necessary: {
      title: "Niezbędne",
      description:
        "Działanie strony, ochrona przed botami, płatności, zapis Twojego wyboru. Są zawsze aktywne.",
    },
    measurement: {
      title: "Analityczne",
      description:
        "Google Analytics 4 i Microsoft Clarity z maskowaniem treści formularzy. Domyślnie wyłączone.",
    },
    marketing: {
      title: "Marketingowe",
      description:
        "Piksel Meta, tylko na stronach niezwiązanych z tematyką zdrowia. Domyślnie wyłączone.",
    },
  },
  legalLinks: {
    privacyPolicy: "Polityka prywatności",
    cookiePolicy: "Lista cookies i identyfikatorów",
  },
} satisfies Partial<Translations>;

export const olaOptInPolicy: PolicyConfig = {
  id: "olesiewicz_global_opt_in_v1",
  match: { isDefault: true },
  i18n: { language: "pl", messageProfile: "olesiewicz_pl" },
  consent: {
    model: "opt-in",
    expiryDays: 365,
    scopeMode: "strict",
    categories: ["necessary", "measurement", "marketing"],
    preselectedCategories: ["necessary"],
  },
  ui: {
    mode: "banner",
    banner: {
      allowedActions: ["accept", "reject", "customize"],
      primaryActions: ["accept", "reject", "customize"],
      layout: ["accept", "reject", "customize"],
      direction: "row",
      uiProfile: "balanced",
      scrollLock: false,
    },
    dialog: {
      allowedActions: ["accept", "reject", "customize"],
      primaryActions: ["accept", "reject", "customize"],
      direction: "row",
      uiProfile: "balanced",
      scrollLock: true,
    },
  },
  proof: { storeIp: true, storeUserAgent: true, storeLanguage: true },
};
