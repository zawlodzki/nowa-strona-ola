import type { ImageMetadata } from "astro";

import aboutPortrait from "@/assets/portraits/about.webp";
import contactPortrait from "@/assets/portraits/contact.webp";
import diplomaPhoto from "@/assets/portraits/diploma.jpg";
import foodEditorial from "@/assets/editorial/food-editorial.webp";
import homeMeal from "@/assets/editorial/home-meal.webp";
import heroPortrait from "@/assets/portraits/hero.webp";
import type { SiteRasterKey } from "@/lib/site-images";

/** Local rasters addressed by `SiteRasterKey`; shared by `SiteImage` and SEO images. */
export const siteRasters: Record<SiteRasterKey, ImageMetadata> = {
  hero: heroPortrait,
  about: aboutPortrait,
  contact: contactPortrait,
  diploma: diplomaPhoto,
  food: foodEditorial,
  "home-meal": homeMeal,
};
