import type { SchemaTypeDefinition } from "sanity";

import { pageSectionTypes } from "./blocks/page-sections";
import { articleType } from "./documents/article";
import { authorType } from "./documents/author";
import { categoryType } from "./documents/category";
import { ebookType } from "./documents/ebook";
import { formType } from "./documents/form";
import { pageType } from "./documents/page";
import { redirectType } from "./documents/redirect";
import { serviceType } from "./documents/service";
import { siteSettingsType } from "./documents/site-settings";
import { testimonialType } from "./documents/testimonial";
import { actionLinkType } from "./objects/action-link";
import {
  articleBodyType,
  articleCtaType,
  articleHighlightType,
  articleImageType,
  articleTableType,
} from "./objects/article-body";
import {
  ebookChapterType,
  ebookDeliveryType,
  ebookLandingType,
  ebookMaterialType,
  ebookSourceType,
} from "./objects/ebook-landing";
import { mediaObjectType } from "./objects/media-object";
import { seoType } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [
  seoType,
  actionLinkType,
  mediaObjectType,
  articleImageType,
  articleHighlightType,
  articleCtaType,
  articleTableType,
  articleBodyType,
  ...pageSectionTypes,
  ebookChapterType,
  ebookMaterialType,
  ebookSourceType,
  ebookDeliveryType,
  ebookLandingType,
  pageType,
  articleType,
  authorType,
  categoryType,
  serviceType,
  ebookType,
  testimonialType,
  formType,
  redirectType,
  siteSettingsType,
];
