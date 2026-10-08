import { defineQuery } from "groq";

const mediaFields = /* groq */ `{
  alt,
  tone,
  caption,
  "label": alt,
  "src": coalesce(image.asset->url, rasterKey),
  "hotspot": image.hotspot{x, y, height, width}
}`;

const actionFields = /* groq */ `{ label, href, emphasis }`;

export const ebookCardProjection = /* groq */ `
  "id": _id,
  language,
  "slug": slug.current,
  title,
  subtitle,
  topic,
  cardDescription,
  coverTone,
  availability,
  priceGross,
  currency,
  format,
  sortOrder,
  "cover": cover${mediaFields},
  "authorName": author->name
`;

export const PAGE_SECTION_PROJECTION = /* groq */ `
  _key,
  _type,
  _type == "heroSection" => {
    variant,
    theme,
    eyebrow,
    title,
    lead,
    "primary": primary${actionFields},
    "secondary": secondary${actionFields},
    "media": media${mediaFields}
  },
  _type == "textSection" => { eyebrow, title, body },
  _type == "textImageSection" => {
    variant,
    eyebrow,
    title,
    lead,
    body,
    mediaPosition,
    "action": action${actionFields},
    "media": media${mediaFields},
    "secondaryMedia": secondaryMedia${mediaFields},
    prompts,
    resolutionEyebrow,
    resolutionTitle,
    caption
  },
  _type == "logosSection" => {
    title,
    lead,
    names,
    items[]{
      _key,
      name,
      "media": media${mediaFields}
    }
  },
  _type == "cardsSection" => {
    variant,
    eyebrow,
    title,
    lead,
    items[]{
      _key,
      title,
      body,
      href,
      status,
      "media": media${mediaFields}
    },
    closing
  },
  _type == "listSection" => { title, lead, items },
  _type == "processSection" => {
    title,
    lead,
    note,
    steps[]{ _key, title, body },
    "media": media${mediaFields}
  },
  _type == "metricsSection" => {
    variant,
    title,
    lead,
    items[]{ _key, value, suffix, label },
    highlights[]{ _key, title, body }
  },
  _type == "pricingSection" => {
    title,
    lead,
    plans[]{
      _key,
      name,
      price,
      summary,
      emphasis,
      features,
      "action": action${actionFields}
    }
  },
  _type == "testimonialsSection" => {
    title,
    lead,
    items[]->{
      quote,
      name,
      role,
      anonymous,
      displayLabel,
      scope
    }
  },
  _type == "expertSection" => {
    title,
    intro,
    body,
    metric{ value, suffix, label },
    "action": action${actionFields},
    "media": media${mediaFields},
    "person": person->{
      name,
      role,
      bio,
      educationInstitution,
      educationProgram,
      "photo": photo${mediaFields}
    }
  },
  _type == "faqSection" => {
    title,
    lead,
    items[]{ _key, question, answer }
  },
  _type == "comparisonSection" => {
    title,
    lead,
    caption,
    rowHeading,
    columns,
    rows[]{ _key, feature, values }
  },
  _type == "quoteSection" => { theme, heading, quote, attribution },
  _type == "ctaSection" => {
    theme,
    title,
    lead,
    "action": action${actionFields}
  },
  _type == "formSection" => {
    eyebrow,
    title,
    lead,
    "form": form->{
      "id": _id,
      language,
      title,
      submitLabel,
      successMessage,
      noscriptMessage,
      fields[]{
        _key,
        name,
        input,
        label,
        errorMessage,
        required,
        options
      }
    }
  },
  _type == "mediaSection" => {
    title,
    lead,
    "image": image${mediaFields},
    videoTitle,
    videoUrl,
    videoPlatform
  },
  _type == "relatedSection" => {
    title,
    items[]->{
      title,
      "excerpt": lead,
      "slug": slug.current,
      language,
      publishedAt,
      "media": image${mediaFields}
    }
  },
  _type == "ebooksSection" => {
    title,
    lead,
    cardActionLabel,
    note,
    "collection": collection${actionFields},
    items[]->{ ${ebookCardProjection} }
  },
  _type == "ebookCollectionSection" => {
    variant,
    title,
    lead,
    catalogTitle,
    catalogLead,
    findTopicLabel,
    cardActionLabel,
    note,
    emptyMessage,
    emptyCategoryMessage
  },
  _type == "serviceOfferSection" => {
    title,
    body,
    facts,
    note,
    "action": action${actionFields},
    "secondary": secondary${actionFields},
    "media": media${mediaFields},
    "service": service->{
      "id": _id,
      title,
      summary,
      "slug": slug.current,
      price,
      currency,
      durationMinutes,
      bookingUrl,
      bookingStatus
    }
  },
  _type == "credentialsSection" => {
    title,
    body,
    diplomaCaption,
    "person": person->{
      "id": _id,
      name,
      role,
      bio,
      educationInstitution,
      educationProgram,
      "photo": photo${mediaFields},
      "diplomaScan": diplomaScan${mediaFields}
    }
  }
`;

const pageProjection = /* groq */ `
  "id": _id,
  language,
  "slug": slug.current,
  title,
  seo{title, description},
  "translation": translation->{ language, "slug": slug.current },
  sections[]{ ${PAGE_SECTION_PROJECTION} }
`;

export const PUBLISHED_PAGE_QUERY = defineQuery(/* groq */ `
  *[
    _type == "page" &&
    !(_id in path("drafts.**")) &&
    language == $language &&
    slug.current == $slug
  ][0]{ ${pageProjection} }
`);

export const PUBLISHED_PAGE_PATHS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "page" &&
    !(_id in path("drafts.**")) &&
    defined(slug.current) &&
    defined(language)
  ]{ language, "slug": slug.current }
`);

export const siteSettingsProjection = /* groq */ `
  "id": _id,
  language,
  siteTitle,
  contactEmail,
  footerNote,
  defaultSeo{title, description},
  navigation[]{ _key, label, href },
  "headerCta": headerCta${actionFields},
  legalLinks[]{ _key, label, href },
  socialLinks[]{ _key, label, href },
  blogIndex{
    title,
    lead,
    note,
    latestTitle,
    collectionTitle,
    readActionLabel,
    allCategoriesLabel,
    emptyMessage,
    emptyCategoryMessage,
    previousLabel,
    nextLabel,
    paginationLabel,
    seoTitle,
    seoDescription
  },
  blogNewsletter{
    enabled,
    title,
    lead,
    sidebarTitle,
    sidebarLead,
    sidebarActionLabel,
    sidebarNote,
    "form": form->{
      "id": _id,
      language,
      title,
      submitLabel,
      successMessage,
      noscriptMessage,
      fields[]{
        _key,
        name,
        input,
        label,
        placeholder,
        errorMessage,
        required,
        options
      }
    }
  },
  "translation": translation->{ language }
`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "siteSettings" &&
    !(_id in path("drafts.**")) &&
    language == $language
  ][0]{ ${siteSettingsProjection} }
`);

export const articleCardProjection = /* groq */ `
  "id": _id,
  language,
  "slug": slug.current,
  title,
  lead,
  publishedAt,
  featured,
  "media": image${mediaFields},
  categories[]->{ title, "slug": slug.current, language },
  "translation": translation->{ language, "slug": slug.current }
`;

export const articleBodyProjection = /* groq */ `
  ...,
  _type == "articleImage" => {
    alt,
    caption,
    "src": image.asset->url,
    "hotspot": image.hotspot{x, y, height, width}
  },
  _type == "articleCta" => {
    title,
    lead,
    "action": action${actionFields}
  }
`;

export const articleDetailProjection = /* groq */ `
  ${articleCardProjection},
  breadcrumbTitle,
  proposalNote,
  updatedAt,
  seo{title, description},
  authors[]->{
    name,
    role,
    bio,
    "slug": slug.current,
    "photo": photo${mediaFields}
  },
  body[]{ ${articleBodyProjection} },
  sources[]{ _key, title, href },
  related[]->{ ${articleCardProjection} },
  relatedEbooks[]->{ ${ebookCardProjection} },
  faq{
    title,
    lead,
    items[]{ _key, question, answer }
  }
`;

export const PUBLISHED_ARTICLE_QUERY = defineQuery(/* groq */ `
  *[
    _type == "article" &&
    !(_id in path("drafts.**")) &&
    language == $language &&
    slug.current == $slug
  ][0]{
    ${articleDetailProjection}
  }
`);

export const PUBLISHED_ARTICLE_PATHS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "article" &&
    !(_id in path("drafts.**")) &&
    defined(slug.current) &&
    defined(language)
  ]{ language, "slug": slug.current }
`);

export const PUBLISHED_ARTICLES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "article" &&
    !(_id in path("drafts.**")) &&
    language == $language
  ] | order(publishedAt desc, _id asc){ ${articleCardProjection} }
`);

export const PUBLISHED_CATEGORY_QUERY = defineQuery(/* groq */ `
  *[
    _type == "category" &&
    !(_id in path("drafts.**")) &&
    language == $language &&
    slug.current == $slug
  ][0]{
    "id": _id,
    language,
    title,
    description,
    "slug": slug.current,
    "translation": translation->{ language, "slug": slug.current }
  }
`);

export const PUBLISHED_CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "category" &&
    !(_id in path("drafts.**")) &&
    language == $language
  ] | order(title asc){
    "id": _id,
    title,
    description,
    "slug": slug.current,
    language,
    "translation": translation->{ language, "slug": slug.current }
  }
`);

export const ebookProjection = /* groq */ `
  "id": _id,
  language,
  "slug": slug.current,
  title,
  subtitle,
  topic,
  cardDescription,
  coverTone,
  availability,
  priceGross,
  currency,
  format,
  sortOrder,
  reviewedAt,
  "cover": cover${mediaFields},
  "author": author->{
    name,
    role,
    bio,
    educationInstitution,
    educationProgram,
    "photo": photo${mediaFields}
  },
  chapters[]{ _key, title, summary },
  includedMaterials[]{ _key, title, description },
  delivery{ description, timeline },
  checkoutUrl,
  sources[]{ _key, title, href, scope },
  seo{title, description},
  "translation": translation->{ language, "slug": slug.current },
  landing{
    variant,
    heroTitle,
    heroLead,
    primaryLabel,
    secondaryLabel,
    facts[]{ _key, title, detail },
    problemTitle,
    problemParagraphs,
    problemQuestions,
    "problemMedia": problemMedia${mediaFields},
    audienceTitle,
    audienceLead,
    audienceItems[]{ _key, title, body },
    educationNote,
    contentsTitle,
    contentsLead,
    ingredients,
    sampleTitle,
    sampleLead,
    "sampleMedia": sampleMedia${mediaFields},
    sampleFields[]{ _key, label },
    sampleCaption,
    outcomesTitle,
    outcomesLead,
    comparisonItems[]{ _key, before, after },
    outcomesNote,
    authorTitle,
    authorParagraphs,
    offerTitle,
    offerLead,
    purchaseLabel,
    offerNote,
    testimonialsTitle,
    testimonialsContext,
    testimonialsScope,
    testimonials[]->{
      quote,
      name,
      role,
      anonymous,
      displayLabel,
      scope
    },
    faq{
      title,
      lead,
      items[]{ _key, question, answer }
    }
  }
`;

export const PUBLISHED_EBOOK_QUERY = defineQuery(/* groq */ `
  *[
    _type == "ebook" &&
    !(_id in path("drafts.**")) &&
    language == $language &&
    slug.current == $slug
  ][0]{ ${ebookProjection} }
`);

export const PUBLISHED_EBOOK_PATHS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "ebook" &&
    !(_id in path("drafts.**")) &&
    defined(slug.current) &&
    defined(language) &&
    defined(landing)
  ]{ language, "slug": slug.current }
`);

export const PUBLISHED_EBOOKS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "ebook" &&
    !(_id in path("drafts.**")) &&
    language == $language
  ] | order(coalesce(sortOrder, 9999) asc, title asc) {
    ${ebookCardProjection}
  }
`);
