import { createClient } from "@sanity/client";
import type { Locale } from "@ola/shared";
import type { PageContent } from "../../../src/sanity/repository";
import { sanityApiVersion } from "../../../src/sanity/config";
import { PREVIEW_PAGE_QUERY } from "./queries";

export interface PreviewEnvironment {
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_STUDIO_URL: string;
  SANITY_API_READ_TOKEN: string;
}

interface PreviewFetcher {
  fetch: (
    query: string,
    parameters: { language: Locale; slug: string },
  ) => Promise<PageContent | null>;
}

export function createPreviewContentClient(
  environment: PreviewEnvironment,
): PreviewFetcher {
  if (!environment.SANITY_API_READ_TOKEN) {
    throw new Error("Brak serwerowego SANITY_API_READ_TOKEN.");
  }

  return createClient({
    projectId: environment.SANITY_PROJECT_ID,
    dataset: environment.SANITY_DATASET,
    apiVersion: sanityApiVersion,
    perspective: "drafts",
    stega: {
      enabled: true,
      studioUrl: environment.SANITY_STUDIO_URL,
    },
    token: environment.SANITY_API_READ_TOKEN,
    useCdn: false,
  });
}

export async function getPreviewPage(
  language: Locale,
  slug: string,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<PageContent> {
  const page = await client.fetch(PREVIEW_PAGE_QUERY, { language, slug });
  if (!page) throw new Error(`Brak strony podglądu ${language}/${slug}.`);
  return page;
}
