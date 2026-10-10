import type { PageContent } from "@/sanity/repository";
import { toFormCopy, toText } from "./map-sections";
import { assertKnownSections } from "./sections";

export function mapWithdrawal(page: PageContent) {
  assertKnownSections(page.sections);
  const [intro, form] = page.sections;
  if (
    page.sections.length !== 2 ||
    intro?._type !== "textSection" ||
    form?._type !== "formSection"
  ) {
    throw new Error("Odstąpienie: wymagane sekcje wstęp i formularz.");
  }
  const withdrawal = toFormCopy(form);
  if (withdrawal.formKey !== "withdrawal") {
    throw new Error("Odstąpienie wymaga formularza odstąpienia od umowy.");
  }
  if (!withdrawal.fields.some((field) => field.input === "textarea")) {
    throw new Error("Odstąpienie wymaga pola z treścią oświadczenia.");
  }
  return { intro: toText(intro), form: withdrawal };
}

export type WithdrawalView = ReturnType<typeof mapWithdrawal>;
