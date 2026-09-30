import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import type { APIRoute } from "astro";

import {
  previewPerspectiveCookie,
  previewSessionCookie,
  previewSessionCookieName,
} from "../../../lib/session";

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(previewSessionCookieName, {
    path: previewSessionCookie.path,
  });
  cookies.delete(perspectiveCookieName, {
    path: previewPerspectiveCookie.path,
  });
  return redirect("/", 303);
};
