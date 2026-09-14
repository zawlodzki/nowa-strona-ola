import type { Locale } from "@ola/shared";

import { articlePath } from "@/lib/paths";
import { formatDate, toDatetime } from "@/lib/dates";
import type {
  ActionLink,
  CardsContent,
  ComparisonContent,
  CtaContent,
  ExpertContent,
  FaqContent,
  FormCopy,
  HeroContent,
  ListContent,
  LogosContent,
  MediaContent,
  MediaSpec,
  MetricsContent,
  PricingContent,
  ProcessContent,
  QuoteContent,
  RelatedContent,
  TestimonialsContent,
  TextContent,
  TextImageContent,
} from "@/sections/types";

interface LinkValue {
  href?: string | null;
  label?: string | null;
  emphasis?: string | null;
}

interface MediaValue {
  alt?: string | null;
  label?: string | null;
  tone?: string | null;
  caption?: string | null;
  src?: string | null;
}

function required(value: string | null | undefined, label: string): string {
  if (!value) throw new Error(`Brakuje pola ${label}.`);
  return value;
}

export function toAction(link: LinkValue | null | undefined): ActionLink {
  return {
    href: required(link?.href, "href"),
    label: required(link?.label, "etykieta odnośnika"),
    variant: link?.emphasis === "outline" ? "outline" : "default",
  };
}

export function toMedia(value: MediaValue | null | undefined): MediaSpec {
  const label = value?.alt ?? value?.label;
  const tone = value?.tone;
  if (!label) throw new Error("Medium wymaga tekstu alternatywnego.");
  if (tone !== "photo" && tone !== "diagram" && tone !== "portrait") {
    throw new Error("Medium ma nieznany rodzaj kadru.");
  }
  return {
    label,
    tone,
    caption: value?.caption ?? undefined,
    src: value?.src ?? undefined,
  };
}

export function toHero(section: {
  variant?: string | null;
  theme?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  primary?: LinkValue | null;
  secondary?: LinkValue | null;
  media?: MediaValue | null;
}): HeroContent {
  const variant = section.variant;
  if (
    variant !== "editorial" &&
    variant !== "cinematic" &&
    variant !== "split"
  ) {
    throw new Error("Nieznany wariant hero.");
  }
  return {
    variant,
    theme: section.theme === "dark" ? "dark" : "light",
    eyebrow: required(section.eyebrow, "nadtytuł hero"),
    title: required(section.title, "tytuł hero"),
    lead: required(section.lead, "lead hero"),
    primary: toAction(section.primary),
    secondary: section.secondary?.href
      ? toAction(section.secondary)
      : undefined,
    media:
      section.media?.alt || section.media?.label
        ? toMedia(section.media)
        : undefined,
  };
}

export function toText(section: {
  eyebrow?: string | null;
  title?: string | null;
  body?: (string | null)[] | null;
}): TextContent {
  return {
    eyebrow: section.eyebrow ?? undefined,
    title: required(section.title, "tytuł tekstu"),
    body: (section.body ?? []).filter((item): item is string => Boolean(item)),
  };
}

export function toTextImage(section: {
  eyebrow?: string | null;
  title?: string | null;
  body?: (string | null)[] | null;
  mediaPosition?: string | null;
  media?: MediaValue | null;
}): TextImageContent {
  return {
    ...toText(section),
    mediaPosition: section.mediaPosition === "start" ? "start" : "end",
    media: toMedia(section.media),
  };
}

export function toLogos(section: {
  title?: string | null;
  lead?: string | null;
  names?: (string | null)[] | null;
}): LogosContent {
  return {
    title: required(section.title, "tytuł logotypów"),
    lead: required(section.lead, "lead logotypów"),
    names: (section.names ?? []).filter((item): item is string =>
      Boolean(item),
    ),
  };
}

export function toCards(section: {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  items?:
    | {
        title?: string | null;
        body?: string | null;
        href?: string | null;
        media?: MediaValue | null;
      }[]
    | null;
}): CardsContent {
  return {
    eyebrow: section.eyebrow ?? undefined,
    title: required(section.title, "tytuł kart"),
    lead: required(section.lead, "lead kart"),
    items: (section.items ?? []).map((item) => ({
      title: required(item.title, "tytuł karty"),
      body: required(item.body, "opis karty"),
      href: required(item.href, "adres karty"),
      media: toMedia(item.media),
    })),
  };
}

export function toList(section: {
  title?: string | null;
  lead?: string | null;
  items?: (string | null)[] | null;
}): ListContent {
  return {
    title: required(section.title, "tytuł listy"),
    lead: required(section.lead, "lead listy"),
    items: (section.items ?? []).filter((item): item is string =>
      Boolean(item),
    ),
  };
}

export function toProcess(section: {
  title?: string | null;
  lead?: string | null;
  steps?: { title?: string | null; body?: string | null }[] | null;
}): ProcessContent {
  return {
    title: required(section.title, "tytuł procesu"),
    lead: required(section.lead, "lead procesu"),
    steps: (section.steps ?? []).map((step) => ({
      title: required(step.title, "krok"),
      body: required(step.body, "opis kroku"),
    })),
  };
}

export function toMetrics(section: {
  title?: string | null;
  lead?: string | null;
  items?:
    | { value?: number | null; suffix?: string | null; label?: string | null }[]
    | null;
}): MetricsContent {
  return {
    title: required(section.title, "tytuł liczb"),
    lead: required(section.lead, "lead liczb"),
    items: (section.items ?? []).map((item) => ({
      value: item.value ?? 0,
      suffix: item.suffix ?? "",
      label: required(item.label, "opis liczby"),
    })),
  };
}

export function toPricing(section: {
  title?: string | null;
  lead?: string | null;
  plans?:
    | {
        name?: string | null;
        price?: string | null;
        summary?: string | null;
        emphasis?: string | null;
        features?: (string | null)[] | null;
        action?: LinkValue | null;
      }[]
    | null;
}): PricingContent {
  return {
    title: required(section.title, "tytuł pakietów"),
    lead: required(section.lead, "lead pakietów"),
    plans: (section.plans ?? []).map((plan) => ({
      name: required(plan.name, "nazwa pakietu"),
      price: required(plan.price, "cena pakietu"),
      summary: required(plan.summary, "streszczenie pakietu"),
      featured: plan.emphasis === "featured",
      features: (plan.features ?? []).filter((item): item is string =>
        Boolean(item),
      ),
      action: toAction(plan.action),
    })),
  };
}

export function toTestimonials(section: {
  title?: string | null;
  items?:
    | { quote?: string | null; name?: string | null; role?: string | null }[]
    | null;
}): TestimonialsContent {
  return {
    title: required(section.title, "tytuł opinii"),
    items: (section.items ?? []).map((item) => ({
      quote: required(item.quote, "cytat"),
      name: required(item.name, "autor opinii"),
      role: required(item.role, "rola opinii"),
    })),
  };
}

export function toExpert(section: {
  title?: string | null;
  body?: string | null;
  action?: LinkValue | null;
  media?: MediaValue | null;
  person?: { name?: string | null; role?: string | null } | null;
}): ExpertContent {
  return {
    title: required(section.title, "nadtytuł eksperta"),
    name: required(section.person?.name, "imię eksperta"),
    role: required(section.person?.role, "rola eksperta"),
    body: required(section.body, "opis eksperta"),
    media: toMedia(section.media),
    action: toAction(section.action),
  };
}

export function toFaq(section: {
  title?: string | null;
  lead?: string | null;
  items?: { question?: string | null; answer?: string | null }[] | null;
}): FaqContent {
  return {
    title: required(section.title, "tytuł FAQ"),
    lead: required(section.lead, "lead FAQ"),
    items: (section.items ?? []).map((item) => ({
      question: required(item.question, "pytanie"),
      answer: required(item.answer, "odpowiedź"),
    })),
  };
}

export function toComparison(section: {
  title?: string | null;
  lead?: string | null;
  rowHeading?: string | null;
  columns?: (string | null)[] | null;
  rows?:
    { feature?: string | null; values?: (string | null)[] | null }[] | null;
}): ComparisonContent {
  return {
    title: required(section.title, "tytuł porównania"),
    lead: required(section.lead, "lead porównania"),
    rowHeading: required(section.rowHeading, "nagłówek wierszy"),
    columns: (section.columns ?? []).filter((item): item is string =>
      Boolean(item),
    ),
    rows: (section.rows ?? []).map((row) => ({
      feature: required(row.feature, "cecha"),
      values: (row.values ?? []).filter((item): item is string =>
        Boolean(item),
      ),
    })),
  };
}

export function toQuote(section: {
  theme?: string | null;
  quote?: string | null;
  attribution?: string | null;
}): QuoteContent {
  return {
    theme: section.theme === "dark" ? "dark" : "light",
    quote: required(section.quote, "cytat"),
    attribution: required(section.attribution, "przypisanie"),
  };
}

export function toCta(section: {
  theme?: string | null;
  title?: string | null;
  lead?: string | null;
  action?: LinkValue | null;
}): CtaContent {
  return {
    theme: section.theme === "dark" ? "dark" : "light",
    title: required(section.title, "tytuł wezwania"),
    lead: required(section.lead, "lead wezwania"),
    action: toAction(section.action),
  };
}

export function toFormCopy(section: {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  form?: {
    submitLabel?: string | null;
    successMessage?: string | null;
    noscriptMessage?: string | null;
    fields?:
      | {
          name?: string | null;
          input?: string | null;
          label?: string | null;
          errorMessage?: string | null;
        }[]
      | null;
  } | null;
}): FormCopy {
  const fields = section.form?.fields ?? [];
  const nameField =
    fields.find((field) => field.name === "name") ??
    fields.find((field) => field.input === "text");
  const emailField = fields.find((field) => field.input === "email");
  return {
    eyebrow: required(section.eyebrow, "nadtytuł formularza"),
    title: required(section.title, "tytuł formularza"),
    lead: required(section.lead, "lead formularza"),
    nameLabel: required(nameField?.label, "etykieta imienia"),
    nameError: required(nameField?.errorMessage, "błąd imienia"),
    emailLabel: required(emailField?.label, "etykieta e-mail"),
    emailError: required(emailField?.errorMessage, "błąd e-mail"),
    submit: required(section.form?.submitLabel, "etykieta wysyłki"),
    success: required(section.form?.successMessage, "komunikat sukcesu"),
    noscript: required(section.form?.noscriptMessage, "komunikat noscript"),
  };
}

export function toMediaSection(section: {
  title?: string | null;
  lead?: string | null;
  image?: MediaValue | null;
  videoTitle?: string | null;
  videoUrl?: string | null;
  videoPlatform?: string | null;
}): MediaContent {
  return {
    title: required(section.title, "tytuł mediów"),
    lead: required(section.lead, "lead mediów"),
    image: toMedia(section.image),
    video: {
      title: required(section.videoTitle, "tytuł filmu"),
      href: required(section.videoUrl, "adres filmu"),
      platform: required(section.videoPlatform, "platforma filmu"),
    },
  };
}

export function toRelated(
  section: {
    title?: string | null;
    items?:
      | {
          title?: string | null;
          excerpt?: string | null;
          slug?: string | null;
          language?: string | null;
          publishedAt?: string | null;
          media?: MediaValue | null;
        }[]
      | null;
  },
  language: Locale,
): RelatedContent {
  return {
    title: required(section.title, "tytuł powiązanych"),
    items: (section.items ?? []).map((item) => {
      const itemLanguage = item.language === "en" ? "en" : "pl";
      const publishedAt = required(item.publishedAt, "data artykułu");
      return {
        title: required(item.title, "tytuł artykułu"),
        excerpt: required(item.excerpt, "lead artykułu"),
        href: articlePath(itemLanguage, required(item.slug, "adres artykułu")),
        date: formatDate(publishedAt, language),
        datetime: toDatetime(publishedAt),
        media: toMedia(item.media),
      };
    }),
  };
}
