import type { SchemaTypeDefinition } from "sanity";

import { pageType } from "./documents/page";
import { seoType } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [seoType, pageType];
