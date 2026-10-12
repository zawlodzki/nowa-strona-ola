export const measurementPageCodes = [
  "home",
  "about",
  "blog-index",
  "blog-article",
  "ebook-index",
  "ebook-detail",
] as const;

export type MeasurementPageCode = (typeof measurementPageCodes)[number];
export interface TrackingPolicy {
  pageCode: MeasurementPageCode;
  measurement: boolean;
  clarity: boolean;
  marketing: boolean;
}

export function resolveTrackingPolicy(
  kind: string,
  seo?: { excludeFromMeasurement?: boolean | null } | null,
): TrackingPolicy | null {
  if (seo?.excludeFromMeasurement === true) return null;
  const pageCode = measurementPageCodes.find((code) => code === kind);
  return pageCode
    ? { pageCode, measurement: true, clarity: true, marketing: true }
    : null;
}

export function parseTrackingPolicy(
  attributes: DOMStringMap,
): TrackingPolicy | null {
  const pageCode = measurementPageCodes.find(
    (code) => code === attributes.pageCode,
  );
  if (
    !pageCode ||
    ![attributes.measurement, attributes.clarity, attributes.marketing].every(
      (value) => value === "true" || value === "false",
    )
  )
    return null;
  return {
    pageCode,
    measurement: attributes.measurement === "true",
    clarity: attributes.clarity === "true",
    marketing: attributes.marketing === "true",
  };
}
