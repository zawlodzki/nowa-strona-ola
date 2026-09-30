import { env } from "cloudflare:workers";
import { createClient } from "@sanity/client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import type { APIRoute } from "astro";

import { sanityApiVersion } from "../../../../../src/sanity/config";
import {
  createPreviewSession,
  previewPerspectiveCookie,
  previewSessionCookie,
  previewSessionCookieName,
} from "../../../lib/session";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!env.SANITY_API_READ_TOKEN || !env.PREVIEW_SESSION_SECRET) {
    return new Response("Podgląd nie jest skonfigurowany.", { status: 503 });
  }

  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: sanityApiVersion,
    token: env.SANITY_API_READ_TOKEN,
    useCdn: false,
  });
  const {
    isValid,
    redirectTo = "/",
    studioPreviewPerspective,
  } = await validatePreviewUrl(client, request.url);

  if (!isValid)
    return new Response("Nieprawidłowy lub wygasły sekret.", { status: 401 });

  cookies.set(
    previewSessionCookieName,
    await createPreviewSession(env.PREVIEW_SESSION_SECRET),
    previewSessionCookie,
  );
  cookies.set(
    perspectiveCookieName,
    studioPreviewPerspective ?? "drafts",
    previewPerspectiveCookie,
  );

  return redirect(redirectTo);
};
