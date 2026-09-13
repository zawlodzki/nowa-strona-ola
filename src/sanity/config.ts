export const sanityApiVersion = "2026-09-01";

export interface SanityPublicConfig {
  projectId: string;
  dataset: string;
}

export function readSanityPublicConfig(
  environment: Record<string, string | undefined>,
): SanityPublicConfig | null {
  const projectId = environment.PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = environment.PUBLIC_SANITY_DATASET?.trim();

  if (!projectId && !dataset) return null;

  if (!projectId || !dataset) {
    throw new Error(
      "Ustaw jednocześnie PUBLIC_SANITY_PROJECT_ID i PUBLIC_SANITY_DATASET.",
    );
  }

  return { projectId, dataset };
}
