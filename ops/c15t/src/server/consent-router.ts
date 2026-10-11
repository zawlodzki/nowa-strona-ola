import type { c15tInstance } from "@c15t/backend";
import type { createOlaConsentInstances } from "./ola-c15t.js";

type Instance = ReturnType<typeof c15tInstance>;
type OlaServices = ReturnType<typeof createOlaConsentInstances>;
const legacyOrigins = new Set([
  "https://zawlodzki.pl",
  "https://www.zawlodzki.pl",
  "https://zawlodzki.com",
  "https://www.zawlodzki.com",
]);
const olaPostKeys = new Set([
  "subjectId",
  "domain",
  "type",
  "givenAt",
  "preferences",
  "consentAction",
  "policySnapshotToken",
  "uiSource",
]);

function rejected(status: number, origin?: string): Response {
  return Response.json(
    { error: "Consent request rejected" },
    {
      status,
      headers: {
        "cache-control": "no-store",
        ...(origin
          ? { "access-control-allow-origin": origin, vary: "Origin" }
          : {}),
      },
    },
  );
}

export function createConsentRouter(
  legacy: Instance,
  olaServices: OlaServices,
) {
  return async (request: Request): Promise<Response> => {
    const path = new URL(request.url).pathname;
    if (path === "/api/c15t/status") return legacy.handler(request);
    const origin = request.headers.get("origin");
    if (!origin) return rejected(403);
    if (legacyOrigins.has(origin)) return legacy.handler(request);
    const service = olaServices.find(({ profile }) =>
      profile.origins.some((trusted) => trusted === origin),
    );
    if (!service) return rejected(403);
    if (request.method === "OPTIONS") return service.instance.handler(request);
    if (request.method === "GET" && path === "/api/c15t/init")
      return service.instance.handler(request);
    if (
      request.method === "GET" &&
      /^\/api\/c15t\/subjects\/sub_[1-9A-HJ-NP-Za-km-z]+$/.test(path)
    ) {
      return service.instance.handler(request);
    }
    if (request.method !== "POST" || path !== "/api/c15t/subjects")
      return rejected(405, origin);
    let body: unknown;
    try {
      body = await request.clone().json();
    } catch {
      return rejected(400, origin);
    }
    if (typeof body !== "object" || body === null || Array.isArray(body))
      return rejected(400, origin);
    if (!("domain" in body) || body.domain !== new URL(origin).hostname)
      return rejected(400, origin);
    if (!("type" in body) || body.type !== "cookie_banner")
      return rejected(400, origin);
    if (
      !("uiSource" in body) ||
      (body.uiSource !== "banner" && body.uiSource !== "dialog")
    )
      return rejected(400, origin);
    if (
      !("consentAction" in body) ||
      !["all", "necessary", "custom"].includes(String(body.consentAction))
    )
      return rejected(400, origin);
    const choices = "preferences" in body ? body.preferences : null;
    if (
      typeof choices !== "object" ||
      choices === null ||
      Array.isArray(choices) ||
      !("necessary" in choices) ||
      choices.necessary !== true ||
      !("measurement" in choices) ||
      typeof choices.measurement !== "boolean" ||
      !("marketing" in choices) ||
      typeof choices.marketing !== "boolean" ||
      Object.keys(choices).some(
        (key) => !["necessary", "measurement", "marketing"].includes(key),
      )
    )
      return rejected(400, origin);
    if (Object.keys(body).some((key) => !olaPostKeys.has(key)))
      return rejected(400, origin);
    return service.instance.handler(request);
  };
}
