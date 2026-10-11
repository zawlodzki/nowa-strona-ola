import type { ConsentPreferences } from "./consent";
import { resolveTrackingPolicy, type TrackingPolicy } from "./tracking-policy";

type ConsentCommand = [
  "consent",
  "default" | "update",
  Record<string, "granted" | "denied" | boolean>,
];
type LayerEntry = ConsentCommand | Record<string, string | boolean | number>;

interface AnalyticsOptions {
  enabled: boolean;
  policy: TrackingPolicy | null;
  push: (entry: LayerEntry) => void;
  load: () => void;
  stop: () => void;
}

export function createAnalytics(options: AnalyticsOptions) {
  let loaded = false;
  let pageViewSent = false;
  let activeMeasurement = false;
  let activeMarketing = false;

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
    applyPreferences(preferences: ConsentPreferences) {
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
        activeMeasurement = false;
        activeMarketing = false;
        options.stop();
        return;
      }
      activeMeasurement = measurement;
      activeMarketing = marketing;
      options.push(command(measurement, marketing));
      if (!options.policy || (!measurement && !marketing)) return;
      options.push({
        event: "consent-update",
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
          ao_page_code: options.policy.pageCode,
        });
      }
    },
  };
}

const layer: (LayerEntry | IArguments)[] = [];
export function applyPreferences(preferences: ConsentPreferences) {
  browserAnalytics.applyPreferences(preferences);
}

const browserAnalytics = createAnalytics({
  enabled: import.meta.env.PUBLIC_GTM_ENABLED === "true",
  policy:
    typeof window === "undefined"
      ? null
      : resolveTrackingPolicy(window.location.pathname, ""),
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
  stop: () => window.location.reload(),
});

function queueGoogleCommand() {
  // eslint-disable-next-line prefer-rest-params -- Kolejka Google rozpoznaje obiekt Arguments.
  layer.push(arguments);
}

if (typeof window !== "undefined") {
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
