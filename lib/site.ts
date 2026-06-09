import { sanityFetch } from "@/sanity/lib/fetch";
import { SETTINGS_QUERY } from "@/sanity/lib/queries";

export type SiteSettings = {
  name?: { en?: string; hi?: string; gu?: string };
  tagline?: { en?: string; hi?: string; gu?: string };
  description?: { en?: string; hi?: string; gu?: string };
  address?: { en?: string; hi?: string; gu?: string };
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  region?: string;
  openingHours?: Array<{ days?: string; hours?: string; opens?: string; closes?: string }>;
  socialLinks?: Array<{ platform?: string; url?: string }>;
  currency?: string;
};

const FALLBACK: SiteSettings = {
  name: { en: "Greenskill Landscape" },
  address: {
    en: "Beside Chakariya Bus Stand, Chikhli-Vansada Road",
    hi: "चाकरिया बस स्टैंड के पास, चिखली-वनसदा रोड",
    gu: "ચાકરિયા બસ સ્ટેન્ડ પાસે, ચીખલી-વાંસદા રોડ",
  },
  city: "Navsari",
  region: "Gujarat",
  phone: "9876543210",
  whatsapp: "9876543210",
  currency: "INR",
};

export async function getSettings(): Promise<SiteSettings> {
  const data = await sanityFetch<SiteSettings>(SETTINGS_QUERY, {}, ["siteSettings"]);
  return data ?? FALLBACK;
}
