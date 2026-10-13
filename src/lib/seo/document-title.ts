import {
  placementForPath,
  type Locale,
  type TitlePlacement,
} from "@ola/shared";

import { homePath } from "@/lib/paths";

export {
  documentTitle,
  placementForPath,
  resolveDocumentTitle,
  SEO_TITLE_LIMIT,
  type DocumentTitle,
  type TitlePlacement,
} from "@ola/shared";

export function titlePlacement(
  path: string | undefined,
  lang: Locale,
): TitlePlacement {
  return placementForPath(path, homePath(lang));
}
