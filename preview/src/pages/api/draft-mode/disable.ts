import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import type { APIRoute } from "astro";

import { previewSessionCookieName } from "../../../lib/session";

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(previewSessionCookieName, { path: "/" });
  cookies.delete(perspectiveCookieName, { path: "/" });
  return redirect("/", 303);
};
