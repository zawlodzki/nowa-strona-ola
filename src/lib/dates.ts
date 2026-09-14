import type { Locale } from "@ola/shared";

const months = {
  pl: [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
} as const;

export function formatDate(value: string, language: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Niepoprawna data: ${value}`);
  }
  const day = date.getUTCDate();
  const month = months[language][date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return language === "pl"
    ? `${day} ${month} ${year}`
    : `${day} ${month} ${year}`;
}

export function toDatetime(value: string): string {
  return value.slice(0, 10);
}
