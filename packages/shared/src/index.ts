export {
  documentTitle,
  placementForPath,
  resolveDocumentTitle,
  SEO_TITLE_LIMIT,
  SITE_NAME,
  type DocumentTitle,
  type TitlePlacement,
} from "./document-title";
export { isSafeHref, requireSafeHref } from "./safe-href";

export const locales = ["pl", "en"] as const;

export type Locale = (typeof locales)[number];

export interface ContentIdentity {
  id: string;
  language: Locale;
  slug: string;
}

export const formKeys = [
  "newsletter",
  "contact",
  "withdrawal",
  "waitlist",
] as const;

export type FormKey = (typeof formKeys)[number];

export function isFormKey(value: unknown): value is FormKey {
  return (formKeys as readonly unknown[]).includes(value);
}

export const LEAD_SUBMISSION_SCHEMA_VERSION = 3;

export interface ConsentRecord {
  id: string;
  version: string;
  acceptedAt: string;
}

/** JSON body POSTed by every site form (schema version 3). */
export interface LeadSubmission {
  schemaVersion: typeof LEAD_SUBMISSION_SCHEMA_VERSION;
  submissionId: string;
  turnstileToken: string;
  formKey: FormKey;
  formVersion: string;
  language: Locale;
  source: string;
  submittedAt: string;
  fields: Record<string, string>;
  consents: ConsentRecord[];
}
