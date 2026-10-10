import {
  LEAD_SUBMISSION_SCHEMA_VERSION,
  type ConsentRecord,
  type FormKey,
  type LeadSubmission,
  type Locale,
} from "@ola/shared";

import type { FormInputKind } from "@/sections/types";

export interface LeadFieldSpec {
  name: string;
  input: FormInputKind;
  required: boolean;
  options?: readonly string[];
}

/** What the browser needs to validate and serialize one form. */
export interface LeadFormSpec {
  formKey: FormKey;
  version: string;
  language: Locale;
  noticeConsentId?: string;
  fields: readonly LeadFieldSpec[];
}

export interface SubmissionContext {
  submissionId: string;
  submittedAt: string;
  href: string;
}

export type FieldValues = Readonly<Record<string, string>>;

export const CHECKED = "on";

const maxLength = {
  text: 100,
  email: 254,
  tel: 40,
  textarea: 2000,
} satisfies Partial<Record<FormInputKind, number>>;

export function fieldMaxLength(input: FormInputKind): number | undefined {
  const limits: Partial<Record<FormInputKind, number>> = maxLength;
  return limits[input];
}

function isInvalidEmail(value: string) {
  return (
    value.length > maxLength.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

function isInvalidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return true;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  );
}

function isInvalidTel(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    !/^\+?[\d\s().-]+$/.test(value) || digits.length < 6 || digits.length > 15
  );
}

export function isInvalidField(field: LeadFieldSpec, value: string): boolean {
  if (field.input === "checkbox") {
    return field.required && value !== CHECKED;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return field.required;
  switch (field.input) {
    case "email":
      return isInvalidEmail(value);
    case "text":
      return trimmed.length < 2 || value.length > maxLength.text;
    case "tel":
      return value.length > maxLength.tel || isInvalidTel(trimmed);
    case "textarea":
      return value.length > maxLength.textarea;
    case "select":
      return !(field.options ?? []).includes(value);
    case "date":
      return isInvalidDate(trimmed);
  }
}

export function invalidFieldNames(
  spec: LeadFormSpec,
  values: FieldValues,
): string[] {
  return spec.fields
    .filter((field) => isInvalidField(field, values[field.name] ?? ""))
    .map((field) => field.name);
}

export function sourceUrl(href: string): string {
  const url = new URL(href);
  return `${url.origin}${url.pathname}`;
}

export function buildLeadSubmission(
  spec: LeadFormSpec,
  values: FieldValues,
  context: SubmissionContext,
): LeadSubmission {
  const fields: Record<string, string> = {};
  const consents: ConsentRecord[] = [];
  const consent = (id: string): ConsentRecord => ({
    id,
    version: spec.version,
    acceptedAt: context.submittedAt,
  });
  for (const field of spec.fields) {
    const value = values[field.name] ?? "";
    if (field.input === "checkbox") {
      if (value === CHECKED) consents.push(consent(field.name));
    } else {
      fields[field.name] = value.trim();
    }
  }
  if (spec.noticeConsentId) consents.push(consent(spec.noticeConsentId));
  return {
    schemaVersion: LEAD_SUBMISSION_SCHEMA_VERSION,
    submissionId: context.submissionId,
    formKey: spec.formKey,
    formVersion: spec.version,
    language: spec.language,
    source: sourceUrl(context.href),
    submittedAt: context.submittedAt,
    fields,
    consents,
  };
}

export async function postLeadSubmission(
  endpoint: string,
  submission: LeadSubmission,
  send: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await send(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(submission),
    });
    return response.ok;
  } catch {
    return false;
  }
}
