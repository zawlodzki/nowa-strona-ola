import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import type { APIRoute } from "astro";

import {
  previewPerspectiveCookie,
  previewCookiePartition,
  previewSessionCookie,
  previewSessionCookieName,
} from "../../../lib/session";

export const POST: APIRoute = ({ request, cookies, redirect }) => {
  const partition = previewCookiePartition(request);
  cookies.delete(previewSessionCookieName, {
    path: previewSessionCookie.path,
    ...partition,
    secure: true,
  });
  cookies.delete(perspectiveCookieName, {
    path: previewPerspectiveCookie.path,
    ...partition,
    secure: true,
  });
  return redirect("/", 303);
};
