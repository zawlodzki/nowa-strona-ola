import { recognizeAiSource, type AiSource } from "./ai-source";
import type { ConsentPreferences, ConsentView } from "./consent";
import { parseTrackingPolicy, type TrackingPolicy } from "./tracking-policy";

type ConsentCommand = [
  "consent",
  "default" | "update",
  Record<string, "granted" | "denied" | boolean>,
];
type LayerEntry = ConsentCommand | Record<string, string | boolean | number>;

type TrackingState =
  "inactive" | "measurement" | "marketing" | "all" | "revoked";

interface AnalyticsOptions {
  readAiSource?: () => AiSource;
  enabled: boolean;
  policy: TrackingPolicy | null;
  push: (entry: LayerEntry) => void;
  load: () => void;
  stop: () => void;
  reload?: () => void;
  syncState?: (state: TrackingState) => void;
}

export function createAnalytics(options: AnalyticsOptions) {
  let loaded = false;
  let pageViewSent = false;
  let aiSource: AiSource = null;
  let activeMeasurement = false;
  let activeMarketing = false;
  let revoked: { measurement: boolean; marketing: boolean } | null = null;
  let reloading = false;

  const command = (
    measurement: boolean,
    marketing: boolean,
  ): ConsentCommand => [
    "consent",
    "update",
    {
      analytics_storage: measurement ? "granted" : "denied",
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      ad_personalization: marketing ? "granted" : "denied",
      personalization_storage: "denied",
      functionality_storage: "denied",
      security_storage: "granted",
    },
  ];

  return {
    applyConsent(view: ConsentView) {
      this.applyPreferences(view.preferences);
      if (
        revoked &&
        !reloading &&
        view.phase === "settled" &&
        !(revoked.measurement && view.preferences.measurement) &&
        !(revoked.marketing && view.preferences.marketing)
      ) {
        reloading = true;
        options.reload?.();
      }
    },
    applyPreferences(preferences: ConsentPreferences) {
      if (revoked) return;
      const measurement = Boolean(
        options.enabled &&
        options.policy?.measurement &&
        preferences.measurement,
      );
      const marketing = Boolean(
        options.enabled && options.policy?.marketing && preferences.marketing,
      );
      if (
        loaded &&
        ((activeMeasurement && !measurement) || (activeMarketing && !marketing))
      ) {
        revoked = {
          measurement: activeMeasurement && !measurement,
          marketing: activeMarketing && !marketing,
        };
        activeMeasurement = false;
        activeMarketing = false;
        options.syncState?.("revoked");
        options.stop();
        return;
      }
      activeMeasurement = measurement;
      activeMarketing = marketing;
      options.syncState?.(
        marketing
          ? measurement
            ? "all"
            : "marketing"
          : measurement
            ? "measurement"
            : "inactive",
      );
      if (measurement && !pageViewSent) {
        aiSource = options.readAiSource?.() ?? null;
      }
      const source: Record<string, string> =
        measurement && aiSource ? { ao_ai_source: aiSource } : {};
      options.push(command(measurement, marketing));
      if (!options.policy || (!measurement && !marketing)) return;
      options.push({
        event: "consent-update",
        ...source,
        ao_measurement: measurement,
        ao_clarity: measurement && options.policy.clarity,
        ao_marketing: marketing,
        ao_page_code: options.policy.pageCode,
      });
      if (!loaded) {
        loaded = true;
        options.load();
      }
      if (measurement && !pageViewSent) {
        pageViewSent = true;
        options.push({
          event: "ao_page_view",
          ...source,
          ao_page_code: options.policy.pageCode,
        });
      }
    },
  };
}

export function clearMeasurementStorage() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0]);
  const hostname = window.location.hostname;
  const domains = [
    "",
    ...hostname
      .split(".")
      .map((_, index, parts) => `; Domain=${parts.slice(index).join(".")}`),
  ];
  for (const name of names) {
    if (
      !name ||
      !/^(?:_ga(?:_.+)?|_gid|_gat(?:_.+)?|_fbp|_fbc|_clck|_clsk)$/.test(name)
    )
      continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain}${window.location.protocol === "https:" ? "; Secure" : ""}`;
    }
  }
  for (const key of ["localStorage", "sessionStorage"] as const) {
    try {
      window[key].removeItem("_cltk");
    } catch {
      continue;
    }
  }
}

const layer: (LayerEntry | IArguments)[] = [];
export function applyConsent(view: ConsentView) {
  browserAnalytics.applyConsent(view);
}

const browserAnalytics = createAnalytics({
  readAiSource: () => recognizeAiSource(document.referrer),
  enabled: import.meta.env.PUBLIC_GTM_ENABLED === "true",
  policy:
    typeof document === "undefined"
      ? null
      : parseTrackingPolicy(
          document.querySelector<HTMLElement>('meta[name="ao-tracking-policy"]')
            ?.dataset ?? {},
        ),
  push: (entry) => {
    if (Array.isArray(entry)) {
      Reflect.apply(queueGoogleCommand, null, entry);
    } else layer.push(entry);
  },
  load: () => {
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-PWBRPZ29";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    layer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    document.head.append(script);
  },
  syncState: (state) => Reflect.set(window, "aoTrackingState", state),
  stop: () => {
    Reflect.set(window, "ga-disable-G-9QW05JYZTL", true);
    const pixel: unknown = Reflect.get(window, "fbq");
    if (typeof pixel === "function")
      Reflect.apply(pixel, window, ["consent", "revoke"]);
    clearMeasurementStorage();
  },
  reload: () => window.location.reload(),
});

function queueGoogleCommand() {
  // eslint-disable-next-line prefer-rest-params -- Kolejka Google rozpoznaje obiekt Arguments.
  layer.push(arguments);
}

if (typeof window !== "undefined") {
  Reflect.set(window, "aoTrackingState", "inactive");
  Reflect.set(window, "dataLayer", layer);
  Reflect.apply(queueGoogleCommand, null, [
    "consent",
    "default",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      personalization_storage: "denied",
      functionality_storage: "denied",
      security_storage: "granted",
    },
  ]);
  Reflect.apply(queueGoogleCommand, null, ["set", "ads_data_redaction", true]);
  Reflect.apply(queueGoogleCommand, null, ["set", "url_passthrough", false]);
}
