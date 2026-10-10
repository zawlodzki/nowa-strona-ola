export const locales = ["pl", "en"] as const;

export type Locale = (typeof locales)[number];

export interface ContentIdentity {
  id: string;
  language: Locale;
  slug: string;
}

export const formKeys = ["newsletter", "contact", "withdrawal"] as const;

export type FormKey = (typeof formKeys)[number];

export function isFormKey(value: unknown): value is FormKey {
  return (formKeys as readonly unknown[]).includes(value);
}

export const LEAD_SUBMISSION_SCHEMA_VERSION = 2;

export interface ConsentRecord {
  id: string;
  version: string;
  acceptedAt: string;
}

/** JSON body POSTed by every site form (schema version 2). */
export interface LeadSubmission {
  schemaVersion: typeof LEAD_SUBMISSION_SCHEMA_VERSION;
  submissionId: string;
  formKey: FormKey;
  formVersion: string;
  language: Locale;
  source: string;
  submittedAt: string;
  fields: Record<string, string>;
  consents: ConsentRecord[];
}
