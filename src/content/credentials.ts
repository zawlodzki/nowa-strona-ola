import type { Locale } from "@ola/shared";

import type { PersonCredential } from "@/sections/types";

const levelLabels = {
  pl: { bachelor: "Licencjat", master: "Magister" },
  en: { bachelor: "Bachelor's degree", master: "Master's degree" },
} as const satisfies Record<Locale, Record<"bachelor" | "master", string>>;

export function credentialLevelLabel(
  credential: PersonCredential,
  lang: Locale,
): string | undefined {
  return credential.level ? levelLabels[lang][credential.level] : undefined;
}

/** „Dietetyka, specjalność dietetyka kliniczna” — the same text in HTML, Markdown and JSON-LD. */
export function credentialTitle(
  credential: PersonCredential,
  lang: Locale,
): string {
  if (!credential.specialization) return credential.name;
  return lang === "pl"
    ? `${credential.name}, specjalność ${credential.specialization}`
    : `${credential.name}, ${credential.specialization} specialisation`;
}

/** „Śląski Uniwersytet Medyczny w Katowicach, Wydział Zdrowia Publicznego w Bytomiu”. */
export function credentialIssuer(credential: PersonCredential): string {
  return [credential.institution, credential.department]
    .filter(Boolean)
    .join(", ");
}

export function splitCredentials(credentials: readonly PersonCredential[]): {
  degrees: PersonCredential[];
  trainings: PersonCredential[];
} {
  return {
    degrees: credentials.filter((item) => item.category === "degree"),
    trainings: credentials.filter((item) => item.category !== "degree"),
  };
}
