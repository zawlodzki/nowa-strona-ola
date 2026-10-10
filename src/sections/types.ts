import type { FormKey } from "@ola/shared";

export const catalogSectionIds = [
  "hero",
  "text",
  "text-image",
  "cards",
  "list",
  "process",
  "metrics",
  "pricing",
  "testimonials",
  "expert",
  "faq",
  "comparison",
  "quote",
  "cta",
  "form",
  "media",
  "related",
] as const;

export type CatalogSectionId = (typeof catalogSectionIds)[number];

export type SectionTheme = "light" | "dark";

export type HeroVariant = "editorial" | "cinematic" | "split";

export interface ActionLink {
  href: string;
  label: string;
  variant?: "default" | "outline";
}

export interface MediaSpec {
  label: string;
  tone: "photo" | "diagram" | "portrait";
  caption?: string;
  src?: string;
}

export interface HeroContent {
  variant: HeroVariant;
  theme?: SectionTheme;
  eyebrow?: string;
  title: string;
  lead: string;
  primary: ActionLink;
  secondary?: ActionLink;
  media?: MediaSpec;
}

export interface TextContent {
  eyebrow?: string;
  title: string;
  body: string[];
}

export interface TextImageContent extends TextContent {
  variant: "photo";
  lead?: string;
  action?: ActionLink;
  media: MediaSpec;
  secondaryMedia?: MediaSpec;
  mediaPosition: "start" | "end";
}

export interface QuestionMapContent extends TextContent {
  variant: "questions";
  prompts: string[];
  resolution: { eyebrow?: string; title: string };
  caption?: string;
}

export const AUDIENCE_ICON_KEYS = [
  "arrow",
  "check",
  "flower",
  "drop-wave",
  "sprout",
  "sun-horizon",
] as const;

export type AudienceIconKey = (typeof AUDIENCE_ICON_KEYS)[number];

export interface AudienceItem {
  title: string;
  body: string;
  icon?: AudienceIconKey;
}

export interface AudienceContent {
  title: string;
  lead?: string;
  items: AudienceItem[];
}

export interface CardItem {
  title: string;
  body: string;
  href: string;
  media?: MediaSpec;
  status?: string;
}

export interface CardsContent {
  variant: "media" | "links";
  eyebrow?: string;
  title: string;
  lead: string;
  items: CardItem[];
}

export interface TextCardItem {
  title: string;
  body: string;
}

export interface TextCardsContent {
  variant: "situations" | "goals";
  eyebrow?: string;
  title: string;
  lead: string;
  items: TextCardItem[];
  closing?: string;
}

export interface ListContent {
  title: string;
  lead?: string;
  items: string[];
}

export interface ProcessStep {
  title: string;
  body: string;
}

export interface ProcessContent {
  title: string;
  lead: string;
  steps: ProcessStep[];
  note?: string;
  media?: MediaSpec;
}

export interface MetricItem {
  value: number;
  suffix: string;
  label: string;
}

export interface MetricHighlight {
  title: string;
  body: string;
}

export interface MetricsContent {
  variant: "grid" | "approach";
  title: string;
  lead?: string;
  items: MetricItem[];
  highlights: MetricHighlight[];
}

export interface PricingPlan {
  name: string;
  price: string;
  summary: string;
  features: string[];
  featured?: boolean;
  action: ActionLink;
}

export interface PricingContent {
  title: string;
  lead: string;
  plans: PricingPlan[];
}

export interface TestimonialItem {
  quote: string;
  name?: string;
  role?: string;
  anonymous: boolean;
  displayLabel?: string;
  scope: "cooperation" | "product";
}

export interface TestimonialsContent {
  title: string;
  lead?: string;
  items: TestimonialItem[];
}

export interface ExpertContent {
  title: string;
  name: string;
  role: string;
  intro?: string;
  body: string;
  media: MediaSpec;
  action?: ActionLink;
  metric?: MetricItem;
  education?: { institution: string; program: string };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  title: string;
  lead: string;
  items: FaqItem[];
}

export interface ComparisonRow {
  feature: string;
  values: string[];
}

export interface ComparisonContent {
  title: string;
  lead: string;
  rowHeading: string;
  columns: string[];
  rows: ComparisonRow[];
}

export interface QuoteContent {
  quote: string;
  attribution: string;
  theme?: SectionTheme;
}

export interface CtaContent {
  theme?: SectionTheme;
  title: string;
  lead: string;
  action: ActionLink;
}

export interface RelatedArticle {
  title: string;
  excerpt: string;
  href: string;
  date: string;
  datetime: string;
  media: MediaSpec;
}

export interface RelatedContent {
  title: string;
  items: RelatedArticle[];
}

export interface MediaContent {
  title: string;
  lead: string;
  image: MediaSpec;
  video: {
    title: string;
    href: string;
    platform: string;
  };
}

export type FormInputKind =
  "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "date";

export interface FormFieldCopy {
  name: string;
  input: FormInputKind;
  label: string;
  placeholder?: string;
  errorMessage: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface FormCopy {
  eyebrow?: string;
  title: string;
  lead: string;
  formKey: FormKey;
  version: string;
  submit: string;
  success: string;
  error: string;
  noscript: string;
  notice?: string;
  noticeConsentId?: string;
  fields: FormFieldCopy[];
}

export type EbookTopic = "pcos" | "perimenopause";
export type EbookAvailability = "planned" | "presale" | "available" | "paused";

export interface EbookCardContent {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  topic: EbookTopic;
  description: string;
  href: string;
  coverTone: "light" | "cherry";
  availability: EbookAvailability;
  priceGross: number;
  currency: string;
  authorName: string;
  cover?: MediaSpec;
}

export interface EbooksContent {
  title: string;
  lead: string;
  cardActionLabel: string;
  note?: string;
  collection?: ActionLink;
  items: EbookCardContent[];
}

export interface EbookCollectionContent {
  variant: "cherry3a";
  title: string;
  lead: string;
  catalogTitle: string;
  catalogLead: string;
  findTopicLabel: string;
  cardActionLabel: string;
  note?: string;
  emptyMessage: string;
  emptyCategoryMessage: string;
  items: EbookCardContent[];
}

export interface ServiceDetails {
  name: string;
  price: number;
  currency: "PLN";
  durationMinutes: number;
}

export interface ServiceOfferContent {
  title: string;
  body: string[];
  facts: string[];
  note?: string;
  media?: MediaSpec;
  action: ActionLink;
  secondary?: ActionLink;
  priceLabel?: string;
  bookingStatus?: "placeholder" | "live";
  service?: ServiceDetails;
}

export interface CredentialsPerson {
  name: string;
  role: string;
  bio?: string;
  educationInstitution: string;
  educationProgram: string;
  photo?: MediaSpec;
  diploma?: MediaSpec;
}

export interface CredentialsContent {
  title: string;
  body: string[];
  person: CredentialsPerson;
  diplomaCaption?: string;
}

export interface CatalogCopy {
  tocLabel: string;
  sections: Record<CatalogSectionId, string>;
  heroEditorial: HeroContent;
  heroCinematic: HeroContent;
  heroSplit: HeroContent;
  text: TextContent;
  textImage: TextImageContent;
  cards: CardsContent;
  list: ListContent;
  process: ProcessContent;
  metrics: MetricsContent;
  pricing: PricingContent;
  testimonials: TestimonialsContent;
  expert: ExpertContent;
  faq: FaqContent;
  comparison: ComparisonContent;
  quote: QuoteContent;
  cta: CtaContent;
  form: FormCopy;
  media: MediaContent;
  related: RelatedContent;
}
