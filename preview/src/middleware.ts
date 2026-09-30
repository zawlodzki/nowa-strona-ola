import { env } from "cloudflare:workers";
import { defineMiddleware } from "astro:middleware";

import { readAccessJwt, verifyAccessJwt } from "./lib/access-jwt";
import {
  createPreviewSession,
  previewSessionCookie,
  previewSessionCookieName,
  verifyPreviewSession,
} from "./lib/session";

const activationPath = "/api/draft-mode/enable";

function frameAncestors(): string {
  const origins = new Set(["'self'"]);
  try {
    origins.add(new URL(env.SANITY_STUDIO_URL).origin);
  } catch {
    // Missing or invalid studio URL: allow only same-origin framing.
  }
  return `frame-ancestors ${[...origins].join(" ")}`;
}

function secureHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Content-Security-Policy", frameAncestors());
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname !== activationPath) {
    const session = context.cookies.get(previewSessionCookieName)?.value;
    const sessionOk = env.PREVIEW_SESSION_SECRET
      ? await verifyPreviewSession(session, env.PREVIEW_SESSION_SECRET)
      : false;
    const accessOk = await verifyAccessJwt(readAccessJwt(context.request), {
      audience: env.ACCESS_AUD,
      teamDomain: env.ACCESS_TEAM_DOMAIN,
    });

    if (!sessionOk && !accessOk) {
      if (!env.PREVIEW_SESSION_SECRET && !env.ACCESS_AUD) {
        return secureHeaders(
          new Response("Podgląd nie jest skonfigurowany.", { status: 503 }),
        );
      }
      return secureHeaders(
        new Response("Brak dostępu do podglądu.", { status: 401 }),
      );
    }

    if (accessOk && !sessionOk && env.PREVIEW_SESSION_SECRET) {
      context.cookies.set(
        previewSessionCookieName,
        await createPreviewSession(env.PREVIEW_SESSION_SECRET),
        previewSessionCookie,
      );
    }
  }

  return secureHeaders(await next());
});
