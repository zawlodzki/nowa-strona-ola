export interface TrackingPolicy {
  pageCode: string;
  measurement: boolean;
  clarity: boolean;
  marketing: boolean;
}

interface ReviewedPage {
  pathname: string;
  contentFingerprint: string;
  policy: TrackingPolicy;
}

const reviewedPages: readonly ReviewedPage[] = [];

export function resolveTrackingPolicy(
  pathname: string,
  contentFingerprint: string,
): TrackingPolicy | null {
  return (
    reviewedPages.find(
      (page) =>
        page.pathname === pathname &&
        page.contentFingerprint === contentFingerprint,
    )?.policy ?? null
  );
}
