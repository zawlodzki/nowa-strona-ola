import type { Locale } from "@ola/shared";

import { articlePath, ebookPath } from "@/lib/paths";
import { formatDate, toDatetime } from "@/lib/dates";
import type {
  ActionLink,
  CardsContent,
  ComparisonContent,
  CredentialsContent,
  CtaContent,
  EbookAvailability,
  EbookCardContent,
  EbookTopic,
  EbooksContent,
  ExpertContent,
  FaqContent,
  FormCopy,
  FormFieldCopy,
  FormInputKind,
  HeroContent,
  ListContent,
  LogosContent,
  MediaContent,
  MediaSpec,
  MetricItem,
  MetricsContent,
  PricingContent,
  ProcessContent,
  QuestionMapContent,
  QuoteContent,
  RelatedContent,
  ServiceDetails,
  ServiceOfferContent,
  TestimonialsContent,
  TextCardsContent,
  TextContent,
  TextImageContent,
} from "@/sections/types";
import { formatServicePrice } from "@/lib/offer";

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
    eyebrow: section.eyebrow ?? undefined,
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
  variant?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  body?: (string | null)[] | null;
  mediaPosition?: string | null;
  action?: LinkValue | null;
  media?: MediaValue | null;
  secondaryMedia?: MediaValue | null;
  prompts?: (string | null)[] | null;
  resolutionEyebrow?: string | null;
  resolutionTitle?: string | null;
  caption?: string | null;
}): TextImageContent | QuestionMapContent {
  if (section.variant === "questions") {
    const prompts = (section.prompts ?? []).filter((item): item is string =>
      Boolean(item),
    );
    if (prompts.length < 3 || prompts.length > 8) {
      throw new Error("Mapa pytań wymaga od 3 do 8 pytań.");
    }
    return {
      ...toText(section),
      variant: "questions",
      prompts,
      resolution: {
        eyebrow: section.resolutionEyebrow ?? undefined,
        title: required(section.resolutionTitle, "odpowiedź mapy pytań"),
      },
      caption: section.caption ?? undefined,
    };
  }
  if (section.variant && section.variant !== "photo") {
    throw new Error(`Nieznany wariant tekstu i obrazu: ${section.variant}.`);
  }
  return {
    ...toText(section),
    variant: "photo",
    lead: section.lead ?? undefined,
    action: section.action?.href ? toAction(section.action) : undefined,
    mediaPosition: section.mediaPosition === "start" ? "start" : "end",
    media: toMedia(section.media),
    secondaryMedia:
      section.secondaryMedia?.alt || section.secondaryMedia?.label
        ? toMedia(section.secondaryMedia)
        : undefined,
  };
}

export function toLogos(section: {
  title?: string | null;
  lead?: string | null;
  names?: (string | null)[] | null;
  items?: { name?: string | null; media?: MediaValue | null }[] | null;
}): LogosContent {
  const items = (section.items ?? [])
    .filter((item) => item?.name)
    .map((item) => ({
      name: required(item.name, "nazwa logotypu"),
      media:
        item.media?.alt || item.media?.label ? toMedia(item.media) : undefined,
    }));
  const names = (section.names ?? []).filter((item): item is string =>
    Boolean(item),
  );
  if (items.length + names.length < 2) {
    throw new Error("Logotypy wymagają co najmniej dwóch pozycji.");
  }
  return {
    title: required(section.title, "tytuł logotypów"),
    lead: section.lead ?? undefined,
    names,
    items,
  };
}

export function toCards(section: {
  variant?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  items?:
    | {
        title?: string | null;
        body?: string | null;
        href?: string | null;
        status?: string | null;
        media?: MediaValue | null;
      }[]
    | null;
  closing?: string | null;
}): CardsContent | TextCardsContent {
  const variant = section.variant ?? "media";
  const heading = {
    eyebrow: section.eyebrow ?? undefined,
    title: required(section.title, "tytuł kart"),
    lead: required(section.lead, "lead kart"),
  };
  if (variant === "situations" || variant === "goals") {
    return {
      ...heading,
      variant,
      items: (section.items ?? []).map((item) => ({
        title: required(item.title, "tytuł karty"),
        body: required(item.body, "opis karty"),
      })),
      closing: section.closing ?? undefined,
    };
  }
  if (variant !== "media" && variant !== "links") {
    throw new Error(`Nieznany wariant kart: ${variant}.`);
  }
  return {
    ...heading,
    variant,
    items: (section.items ?? []).map((item) => {
      const hasMedia = Boolean(item.media?.alt || item.media?.label);
      if (variant === "media" && !hasMedia) {
        throw new Error("Karta z medium wymaga obrazu.");
      }
      return {
        title: required(item.title, "tytuł karty"),
        body: required(item.body, "opis karty"),
        href: required(item.href, "adres karty"),
        status: item.status ?? undefined,
        media: hasMedia ? toMedia(item.media) : undefined,
      };
    }),
  };
}

export function isTextCards(
  content: CardsContent | TextCardsContent,
): content is TextCardsContent {
  return content.variant === "situations" || content.variant === "goals";
}

export function toList(section: {
  title?: string | null;
  lead?: string | null;
  items?: (string | null)[] | null;
}): ListContent {
  return {
    title: required(section.title, "tytuł listy"),
    lead: section.lead ?? undefined,
    items: (section.items ?? []).filter((item): item is string =>
      Boolean(item),
    ),
  };
}

export function toProcess(section: {
  title?: string | null;
  lead?: string | null;
  note?: string | null;
  steps?: { title?: string | null; body?: string | null }[] | null;
  media?: MediaValue | null;
}): ProcessContent {
  return {
    title: required(section.title, "tytuł procesu"),
    lead: required(section.lead, "lead procesu"),
    note: section.note ?? undefined,
    steps: (section.steps ?? []).map((step) => ({
      title: required(step.title, "krok"),
      body: required(step.body, "opis kroku"),
    })),
    media:
      section.media?.alt || section.media?.label
        ? toMedia(section.media)
        : undefined,
  };
}

export function toMetrics(section: {
  variant?: string | null;
  title?: string | null;
  lead?: string | null;
  items?:
    | { value?: number | null; suffix?: string | null; label?: string | null }[]
    | null;
  highlights?: { title?: string | null; body?: string | null }[] | null;
}): MetricsContent {
  const variant = section.variant === "approach" ? "approach" : "grid";
  return {
    variant,
    title: required(section.title, "tytuł liczb"),
    lead: section.lead ?? undefined,
    items: (section.items ?? []).map((item) => ({
      value: item.value ?? 0,
      suffix: item.suffix ?? "",
      label: required(item.label, "opis liczby"),
    })),
    highlights: (section.highlights ?? []).map((item) => ({
      title: required(item.title, "nagłówek wyróżnienia"),
      body: required(item.body, "opis wyróżnienia"),
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
  lead?: string | null;
  items?:
    | {
        quote?: string | null;
        name?: string | null;
        role?: string | null;
        anonymous?: boolean | null;
        displayLabel?: string | null;
        scope?: string | null;
      }[]
    | null;
}): TestimonialsContent {
  return {
    title: required(section.title, "tytuł opinii"),
    lead: section.lead ?? undefined,
    items: (section.items ?? []).map((item) => {
      const anonymous = item.anonymous === true;
      const scope = item.scope === "product" ? "product" : "cooperation";
      if (anonymous && !item.displayLabel) {
        throw new Error("Anonimowa opinia wymaga podpisu widocznego.");
      }
      if (!anonymous) {
        required(item.name, "autor opinii");
        required(item.role, "rola opinii");
      }
      return {
        quote: required(item.quote, "cytat"),
        name: item.name ?? undefined,
        role: item.role ?? undefined,
        anonymous,
        displayLabel: item.displayLabel ?? undefined,
        scope,
      };
    }),
  };
}

export function toExpert(section: {
  title?: string | null;
  intro?: string | null;
  body?: string | null;
  metric?: {
    value?: number | null;
    suffix?: string | null;
    label?: string | null;
  } | null;
  action?: LinkValue | null;
  media?: MediaValue | null;
  person?: {
    name?: string | null;
    role?: string | null;
    educationInstitution?: string | null;
    educationProgram?: string | null;
  } | null;
}): ExpertContent {
  const person = section.person;
  return {
    title: required(section.title, "nadtytuł eksperta"),
    name: required(person?.name, "imię eksperta"),
    role: required(person?.role, "rola eksperta"),
    intro: section.intro ?? undefined,
    body: required(section.body, "opis eksperta"),
    media: toMedia(section.media),
    action: section.action?.href ? toAction(section.action) : undefined,
    metric: section.metric ? toExpertMetric(section.metric) : undefined,
    education:
      person?.educationInstitution && person.educationProgram
        ? {
            institution: person.educationInstitution,
            program: person.educationProgram,
          }
        : undefined,
  };
}

function toExpertMetric(metric: {
  value?: number | null;
  suffix?: string | null;
  label?: string | null;
}): MetricItem {
  if (typeof metric.value !== "number") {
    throw new Error("Wskaźnik eksperta wymaga liczby.");
  }
  return {
    value: metric.value,
    suffix: metric.suffix ?? "",
    label: required(metric.label, "opis wskaźnika eksperta"),
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
          required?: string | null;
          options?: (string | null)[] | null;
        }[]
      | null;
  } | null;
}): FormCopy {
  const fields = (section.form?.fields ?? []).map((field): FormFieldCopy => {
    const input = toFormInput(field.input);
    return {
      name: required(field.name, "identyfikator pola"),
      input,
      label: required(field.label, "etykieta pola"),
      errorMessage: required(field.errorMessage, "komunikat błędu pola"),
      required: field.required !== "optional",
      options: (field.options ?? []).filter((item): item is string =>
        Boolean(item),
      ),
    };
  });
  if (fields.length === 0) {
    throw new Error("Formularz nie ma pól.");
  }
  const nameField =
    fields.find((field) => field.name === "name") ??
    fields.find((field) => field.input === "text");
  const emailField = fields.find((field) => field.input === "email");
  return {
    eyebrow: section.eyebrow ?? undefined,
    title: required(section.title, "tytuł formularza"),
    lead: required(section.lead, "lead formularza"),
    nameLabel: nameField?.label,
    nameError: nameField?.errorMessage,
    emailLabel: emailField?.label,
    emailError: emailField?.errorMessage,
    submit: required(section.form?.submitLabel, "etykieta wysyłki"),
    success: required(section.form?.successMessage, "komunikat sukcesu"),
    noscript: required(section.form?.noscriptMessage, "komunikat noscript"),
    fields,
  };
}

function toFormInput(value: string | null | undefined): FormInputKind {
  if (
    value === "text" ||
    value === "email" ||
    value === "tel" ||
    value === "textarea" ||
    value === "select" ||
    value === "checkbox"
  ) {
    return value;
  }
  throw new Error(`Nieznany typ pola formularza: ${value ?? "brak"}.`);
}

export function toEbooks(
  section: {
    title?: string | null;
    lead?: string | null;
    cardActionLabel?: string | null;
    note?: string | null;
    collection?: LinkValue | null;
    items?:
      | {
          id?: string | null;
          language?: string | null;
          slug?: string | null;
          title?: string | null;
          subtitle?: string | null;
          topic?: string | null;
          cardDescription?: string | null;
          coverTone?: string | null;
          availability?: string | null;
          priceGross?: number | null;
          currency?: string | null;
          authorName?: string | null;
          cover?: MediaValue | null;
        }[]
      | null;
  },
  language: Locale,
): EbooksContent {
  return {
    title: required(section.title, "tytuł e-booków"),
    lead: required(section.lead, "lead e-booków"),
    cardActionLabel: required(
      section.cardActionLabel,
      "etykieta karty e-booka",
    ),
    note: section.note ?? undefined,
    collection: section.collection?.href
      ? toAction(section.collection)
      : undefined,
    items: (section.items ?? []).map((item) => toEbookCard(item, language)),
  };
}

function toEbookCard(
  item: {
    id?: string | null;
    language?: string | null;
    slug?: string | null;
    title?: string | null;
    subtitle?: string | null;
    topic?: string | null;
    cardDescription?: string | null;
    coverTone?: string | null;
    availability?: string | null;
    priceGross?: number | null;
    currency?: string | null;
    authorName?: string | null;
    cover?: MediaValue | null;
  },
  language: Locale,
): EbookCardContent {
  const topic = toEbookTopic(item.topic);
  const availability = toEbookAvailability(item.availability);
  if (item.language && item.language !== language) {
    throw new Error(
      `E-book ${item.slug ?? "bez adresu"} ma język ${item.language}, oczekiwano ${language}.`,
    );
  }
  const slug = required(item.slug, "adres e-booka");
  return {
    id: required(item.id, "identyfikator e-booka"),
    slug,
    title: required(item.title, "tytuł e-booka"),
    subtitle: item.subtitle ?? undefined,
    topic,
    description: required(item.cardDescription, "opis e-booka"),
    href: ebookPath(language, slug),
    coverTone: item.coverTone === "cherry" ? "cherry" : "light",
    availability,
    priceGross: item.priceGross ?? 0,
    currency: required(item.currency, "waluta e-booka"),
    authorName: required(item.authorName, "autorka e-booka"),
    cover:
      item.cover?.alt || item.cover?.label ? toMedia(item.cover) : undefined,
  };
}

function toEbookTopic(value: string | null | undefined): EbookTopic {
  if (value === "pcos" || value === "perimenopause") return value;
  throw new Error(`Nieznany temat e-booka: ${value ?? "brak"}.`);
}

export function toEbookAvailability(
  value: string | null | undefined,
): EbookAvailability {
  if (
    value === "planned" ||
    value === "presale" ||
    value === "available" ||
    value === "paused"
  ) {
    return value;
  }
  throw new Error(`Nieznany status e-booka: ${value ?? "brak"}.`);
}

export function toServiceOffer(
  section: {
    title?: string | null;
    body?: (string | null)[] | null;
    facts?: (string | null)[] | null;
    note?: string | null;
    action?: LinkValue | null;
    secondary?: LinkValue | null;
    media?: MediaValue | null;
    service?: {
      title?: string | null;
      price?: number | null;
      currency?: string | null;
      durationMinutes?: number | null;
      bookingUrl?: string | null;
      bookingStatus?: string | null;
    } | null;
  },
  language: Locale,
): ServiceOfferContent {
  const service = section.service;
  const bookingUrl = service?.bookingUrl ?? section.action?.href;
  const actionLabel =
    section.action?.label ??
    (language === "pl" ? "Zarezerwuj konsultację" : "Book a consultation");
  if (!bookingUrl) {
    throw new Error("Oferta usługi wymaga adresu rezerwacji.");
  }
  const details = service ? toServiceDetails(service) : undefined;
  return {
    title: required(section.title, "tytuł oferty usługi"),
    body: (section.body ?? []).filter((item): item is string => Boolean(item)),
    facts: (section.facts ?? []).filter((item): item is string =>
      Boolean(item),
    ),
    note: section.note ?? undefined,
    media:
      section.media?.alt || section.media?.label
        ? toMedia(section.media)
        : undefined,
    action: {
      href: bookingUrl,
      label: actionLabel,
      variant: section.action?.emphasis === "outline" ? "outline" : "default",
    },
    secondary: section.secondary?.href
      ? toAction(section.secondary)
      : undefined,
    priceLabel: details
      ? formatServicePrice(
          details.price,
          details.currency,
          details.durationMinutes,
          language,
        )
      : undefined,
    bookingStatus: service?.bookingStatus === "live" ? "live" : "placeholder",
    service: details,
  };
}

function toServiceDetails(service: {
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  durationMinutes?: number | null;
}): ServiceDetails | undefined {
  if (
    typeof service.price !== "number" ||
    typeof service.durationMinutes !== "number" ||
    !service.currency
  ) {
    return undefined;
  }
  if (service.currency !== "PLN") {
    throw new Error(`Nieobsługiwana waluta: ${service.currency}.`);
  }
  return {
    name: required(service.title, "nazwa usługi"),
    price: service.price,
    currency: service.currency,
    durationMinutes: service.durationMinutes,
  };
}

export function toCredentials(section: {
  title?: string | null;
  body?: (string | null)[] | null;
  diplomaCaption?: string | null;
  person?: {
    name?: string | null;
    role?: string | null;
    bio?: string | null;
    educationInstitution?: string | null;
    educationProgram?: string | null;
    photo?: MediaValue | null;
    diplomaScan?: MediaValue | null;
  } | null;
}): CredentialsContent {
  const person = section.person;
  if (!person) throw new Error("Kwalifikacje wymagają profilu autora.");
  return {
    title: required(section.title, "tytuł kwalifikacji"),
    body: (section.body ?? []).filter((item): item is string => Boolean(item)),
    diplomaCaption: section.diplomaCaption ?? undefined,
    person: {
      name: required(person.name, "imię autora"),
      role: required(person.role, "rola autora"),
      bio: person.bio ?? undefined,
      educationInstitution: required(person.educationInstitution, "uczelnia"),
      educationProgram: required(person.educationProgram, "kierunek"),
      photo:
        person.photo?.alt || person.photo?.label
          ? toMedia(person.photo)
          : undefined,
      diploma:
        person.diplomaScan?.alt || person.diplomaScan?.label
          ? toMedia(person.diplomaScan)
          : undefined,
    },
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
