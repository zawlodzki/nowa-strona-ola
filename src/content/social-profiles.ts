/** Canonical public profiles. Fixture, seed, import and JSON-LD `sameAs` read this. */
export const SOCIAL_PROFILES = [
  {
    _key: "social-instagram",
    label: "Instagram",
    href: "https://www.instagram.com/aleksandra_olesiewicz",
  },
  {
    _key: "social-facebook",
    label: "Facebook",
    href: "https://www.facebook.com/dietetykolesiewicz/",
  },
  {
    _key: "social-tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@aleksandra_olesiewicz",
  },
] as const;

export function footerSocialLinks() {
  return SOCIAL_PROFILES.map((link) => ({
    _key: link._key,
    label: link.label,
    href: link.href,
  }));
}

export function socialProfileSameAs(): string[] {
  return SOCIAL_PROFILES.map((link) => link.href);
}
