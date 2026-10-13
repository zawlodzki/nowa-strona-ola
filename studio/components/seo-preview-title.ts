import {
  placementForPath,
  resolveDocumentTitle,
  type DocumentTitle,
} from "@ola/shared";

const POLISH_HOME_PATH = "/";

export function seoPreviewTitle(
  source: string,
  path: string | null,
): DocumentTitle {
  return resolveDocumentTitle(source, placementForPath(path, POLISH_HOME_PATH));
}
