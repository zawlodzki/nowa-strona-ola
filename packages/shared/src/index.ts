export const locales = ["pl", "en"] as const;

export type Locale = (typeof locales)[number];

export interface ContentIdentity {
  id: string;
  language: Locale;
  slug: string;
}

export interface LeadSubmission {
  submissionId: string;
  formId: string;
  formVersion: string;
  language: Locale;
  source: string;
  fields: Record<string, string | boolean>;
  consentIds: string[];
}
