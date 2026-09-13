const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "replace-me";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
export const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://127.0.0.1:4322";

export const sanityEnvironment = { dataset, projectId };
