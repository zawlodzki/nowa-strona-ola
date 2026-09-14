export const catalogSectionIds = [
  "hero",
  "text",
  "text-image",
  "logos",
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
  eyebrow: string;
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
  media: MediaSpec;
  mediaPosition: "start" | "end";
}

export interface LogosContent {
  title: string;
  lead: string;
  names: string[];
}

export interface CardItem {
  title: string;
  body: string;
  href: string;
  media: MediaSpec;
}

export interface CardsContent {
  eyebrow?: string;
  title: string;
  lead: string;
  items: CardItem[];
}

export interface ListContent {
  title: string;
  lead: string;
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
}

export interface MetricItem {
  value: number;
  suffix: string;
  label: string;
}

export interface MetricsContent {
  title: string;
  lead: string;
  items: MetricItem[];
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
  name: string;
  role: string;
}

export interface TestimonialsContent {
  title: string;
  items: TestimonialItem[];
}

export interface ExpertContent {
  title: string;
  name: string;
  role: string;
  body: string;
  media: MediaSpec;
  action: ActionLink;
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

export interface FormCopy {
  eyebrow: string;
  title: string;
  lead: string;
  nameLabel: string;
  nameError: string;
  emailLabel: string;
  emailError: string;
  submit: string;
  success: string;
  noscript: string;
}

export interface CatalogCopy {
  tocLabel: string;
  sections: Record<CatalogSectionId, string>;
  heroEditorial: HeroContent;
  heroCinematic: HeroContent;
  heroSplit: HeroContent;
  text: TextContent;
  textImage: TextImageContent;
  logos: LogosContent;
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
