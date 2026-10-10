const PRODUCTION_LEAD_WEBHOOK_URL =
  "https://flows.zawlodzki.com/webhook/2fba1cf1-729f-4e79-8ebf-869f9277284e";

export function resolveLeadWebhookUrl(override: unknown): string {
  if (override === undefined || override === "") {
    return PRODUCTION_LEAD_WEBHOOK_URL;
  }
  if (typeof override !== "string" || !/^https:\/\/[^\s/]+\//.test(override)) {
    throw new Error("PUBLIC_LEAD_WEBHOOK_URL musi być adresem https://.");
  }
  return override;
}

export const leadWebhookUrl = resolveLeadWebhookUrl(
  import.meta.env.PUBLIC_LEAD_WEBHOOK_URL,
);
