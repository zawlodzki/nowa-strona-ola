import { env } from "cloudflare:workers";
import { defineMiddleware } from "astro:middleware";

import { previewSessionCookieName, verifyPreviewSession } from "./lib/session";

const activationPath = "/api/draft-mode/enable";

function secureHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Referrer-Policy", "no-referrer");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname !== activationPath) {
    if (!env.PREVIEW_SESSION_SECRET) {
      return secureHeaders(
        new Response("Podgląd nie jest skonfigurowany.", { status: 503 }),
      );
    }

    const session = context.cookies.get(previewSessionCookieName)?.value;
    const authorized = await verifyPreviewSession(
      session,
      env.PREVIEW_SESSION_SECRET,
    );

    if (!authorized) {
      return secureHeaders(
        new Response("Brak dostępu do podglądu.", { status: 401 }),
      );
    }
  }

  return secureHeaders(await next());
});
