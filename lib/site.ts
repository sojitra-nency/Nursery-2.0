import { sanityFetch } from "@/sanity/lib/fetch";
import { SETTINGS_QUERY } from "@/sanity/lib/queries";

export type SiteSettings = {
  name?: { en?: string; hi?: string; gu?: string };
  tagline?: { en?: string; hi?: string; gu?: string };
  description?: { en?: string; hi?: string; gu?: string };
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  region?: string;
};

const FALLBACK: SiteSettings = {
  name: { en: "Green Valley Nursery" },
};

export async function getSettings(): Promise<SiteSettings> {
  const data = await sanityFetch<SiteSettings>(SETTINGS_QUERY, {}, ["siteSettings"]);
  return data ?? FALLBACK;
}
