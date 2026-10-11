import { c15tInstance, policyBuilder } from "@c15t/backend";
import type { C15TOptions } from "@c15t/backend/types";
import { olaOptInPolicy, olaTranslations } from "../shared/ola-policy.js";

export const olaProfiles = [
  {
    tenantId: "ola-production",
    audience: "olesiewicz-production",
    origins: [
      "https://aleksandraolesiewicz.com",
      "https://www.aleksandraolesiewicz.com",
    ],
  },
  {
    tenantId: "ola-staging",
    audience: "olesiewicz-staging",
    origins: ["https://ola-website-staging.zawlodzki.workers.dev"],
  },
] as const;

export function createOlaConsentInstances(
  adapter: C15TOptions["adapter"],
  signingKey: string,
) {
  return olaProfiles.map((profile) => ({
    profile,
    instance: c15tInstance({
      appName: "olesiewicz-cmp",
      basePath: "/api/c15t",
      adapter,
      tenantId: profile.tenantId,
      trustedOrigins: [...profile.origins],
      disableGeoLocation: true,
      branding: "none",
      openapi: { enabled: false },
      telemetry: { enabled: false },
      logger: { level: "error" },
      ipAddress: {
        tracking: true,
        masking: true,
        ipAddressHeaders: ["cf-connecting-ip"],
      },
      policyPacks: policyBuilder.createPackWithDefault([], {
        id: olaOptInPolicy.id,
        isDefault: true,
        model: olaOptInPolicy.consent?.model,
        expiryDays: olaOptInPolicy.consent?.expiryDays,
        scopeMode: olaOptInPolicy.consent?.scopeMode,
        categories: olaOptInPolicy.consent?.categories,
        preselectedCategories: olaOptInPolicy.consent?.preselectedCategories,
        uiMode: olaOptInPolicy.ui?.mode,
        banner: olaOptInPolicy.ui?.banner,
        dialog: olaOptInPolicy.ui?.dialog,
        i18n: olaOptInPolicy.i18n,
        proof: olaOptInPolicy.proof,
      }),
      i18n: {
        defaultProfile: "olesiewicz_pl",
        messages: {
          olesiewicz_pl: {
            fallbackLanguage: "pl",
            translations: { pl: olaTranslations },
          },
        },
      },
      policySnapshot: {
        signingKey,
        onValidationFailure: "reject",
        issuer: "consent.zawlodzki.com",
        audience: profile.audience,
        ttlSeconds: 1_800,
      },
    }),
  }));
}
