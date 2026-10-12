import type { Locale } from "@ola/shared";

import { toPersonCredentials } from "@/content/map-sections";
import { siteIdentity } from "@/content/site-identity";
import { sellerCompany } from "@/content/site-legal";
import type { SiteSettings } from "@/sanity/repository";
import type { PersonCredential, PersonExperience } from "@/sections/types";

export interface PersonSeoData {
  name: string;
  alternateName?: string;
  jobTitle: string;
  description: string;
  sameAs: string[];
  knowsAbout: { name: string; sameAs: string[] }[];
  alumniOf: { name: string; url?: string };
  occupationCode?: string;
  /** Public credentials. The degree level and year stay here and are not rows on „O mnie”. */
  credentials: readonly PersonCredential[];
  /** Earlier workplaces. JSON-LD alumniOf only. „O mnie” does not list them. */
  experience: readonly PersonExperience[];
  /** Site raster key or image URL of a real portrait. */
  portrait: string;
}

export interface SellerSeoData {
  legalName: string;
  street: string;
  postalCode: string;
  city: string;
  nip: string;
  krs?: string;
  regon?: string;
  email?: string;
}

export interface SiteSeoData {
  person: PersonSeoData;
  seller: SellerSeoData;
  /** Share image fallback: raster key or URL. */
  defaultImage: string;
}

const clean = <T>(values: (T | null | undefined)[] | null | undefined): T[] =>
  (values ?? []).filter((value): value is T => value != null);

/**
 * Shared Person and seller for JSON-LD: Sanity siteSettings (siteOwner,
 * seller, defaultOgImage) with field-level fallback to the repo constants.
 */
export function siteSeoData(
  settings: SiteSettings | null | undefined,
  language: Locale = "pl",
): SiteSeoData {
  const owner = settings?.siteOwner;
  const seller = settings?.seller;
  const institution = owner?.educationInstitution?.trim();
  const sameAs = clean(owner?.sameAs);
  const knowsAbout = clean(owner?.knowsAbout).flatMap((topic) =>
    topic.title ? [{ name: topic.title, sameAs: clean(topic.sameAs) }] : [],
  );
  return {
    person: {
      name: owner?.name?.trim() || siteIdentity.name,
      alternateName: siteIdentity.alternateName,
      jobTitle: owner?.role?.trim() || siteIdentity.jobTitle[language],
      description: siteIdentity.description[language],
      sameAs: sameAs.length ? sameAs : siteIdentity.sameAs(),
      knowsAbout: knowsAbout.length
        ? knowsAbout
        : siteIdentity.knowsAbout[language].map((name) => ({
            name,
            sameAs: [],
          })),
      alumniOf:
        institution && institution !== siteIdentity.alumniOf.name
          ? { name: institution }
          : { ...siteIdentity.alumniOf },
      occupationCode: owner?.occupationCode ?? siteIdentity.occupationCode,
      // Without a Sanity owner the repo constants mirror the „O mnie” fixture.
      credentials: owner
        ? toPersonCredentials(owner.credentials)
        : siteIdentity.credentials[language],
      experience: owner
        ? clean(owner.experience).flatMap((item) =>
            item.organization
              ? [
                  {
                    organization: item.organization,
                    role: item.role ?? undefined,
                    url: item.url ?? undefined,
                  },
                ]
              : [],
          )
        : siteIdentity.experience,
      portrait: owner?.photo?.src || siteIdentity.portrait,
    },
    seller: seller?.legalName
      ? {
          legalName: seller.legalName,
          street: seller.street ?? "",
          postalCode: seller.postalCode ?? "",
          city: seller.city ?? "",
          nip: seller.nip ?? "",
          krs: seller.krs ?? undefined,
          regon: seller.regon ?? undefined,
          email: seller.email ?? undefined,
        }
      : {
          legalName: sellerCompany.name,
          street: sellerCompany.street,
          postalCode: sellerCompany.postalCode,
          city: sellerCompany.city,
          nip: sellerCompany.nip,
          krs: sellerCompany.krs,
          regon: sellerCompany.regon,
          email: sellerCompany.email,
        },
    defaultImage: settings?.defaultOgImage?.src || siteIdentity.portrait,
  };
}
