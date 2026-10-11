import { c15tInstance, policyBuilder } from "@c15t/backend";
import { globalOptInPolicy, polishTranslations } from "../shared/policy.js";
import { adapter } from "./database.js";
import { isolateLegacyAdapter } from "./legacy-adapter.js";

const signingKey = process.env.C15T_POLICY_SIGNING_KEY;

if (!signingKey || signingKey.length < 32) {
  throw new Error(
    "C15T_POLICY_SIGNING_KEY must contain at least 32 characters",
  );
}

const trustedOrigins = [
  "https://zawlodzki.pl",
  "https://www.zawlodzki.pl",
  "https://zawlodzki.com",
  "https://www.zawlodzki.com",
];

export const c15t = c15tInstance({
  appName: "zawlodzki-cmp",
  basePath: "/api/c15t",
  adapter: isolateLegacyAdapter(adapter),
  trustedOrigins,
  disableGeoLocation: true,
  branding: "none",
  openapi: {
    enabled: false,
  },
  telemetry: {
    enabled: false,
  },
  ipAddress: {
    tracking: true,
    masking: true,
    ipAddressHeaders: ["cf-connecting-ip"],
  },
  policyPacks: policyBuilder.createPackWithDefault([], {
    id: globalOptInPolicy.id,
    isDefault: true,
    model: globalOptInPolicy.consent?.model,
    expiryDays: globalOptInPolicy.consent?.expiryDays,
    scopeMode: globalOptInPolicy.consent?.scopeMode,
    categories: globalOptInPolicy.consent?.categories,
    preselectedCategories: globalOptInPolicy.consent?.preselectedCategories,
    uiMode: globalOptInPolicy.ui?.mode,
    banner: globalOptInPolicy.ui?.banner,
    dialog: globalOptInPolicy.ui?.dialog,
    i18n: globalOptInPolicy.i18n,
    proof: globalOptInPolicy.proof,
  }),
  i18n: {
    defaultProfile: "zawlodzki_pl",
    messages: {
      zawlodzki_pl: {
        fallbackLanguage: "pl",
        translations: {
          pl: polishTranslations,
        },
      },
    },
  },
  policySnapshot: {
    signingKey,
    onValidationFailure: "reject",
    issuer: "consent.zawlodzki.com",
    audience: "zawlodzki-webflow",
    ttlSeconds: 1_800,
  },
});
