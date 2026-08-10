import { groq } from "next-sanity";
import { locales } from "@/lib/i18n/config";

export const SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    name, tagline, description, logo,
    phone, whatsapp, email,
    address, city, region, geo,
    openEveryday, openTime, closeTime, hoursNote,
    socialLinks[],
    currency, defaultSeo,
    theme{ preset, darkMode, background, foreground, surface, border, muted, accent, accentDark, onAccent }
  }
`;

// Common projection for plant cards: prefer first variety image, fall back to plant image.
const CARD_FIELDS = `
  name, slug, categories,
  "image": coalesce(varieties[0].images[0]{ asset, alt }, images[0]{ asset, alt }),
  "availability": coalesce(varieties[0].availability, "in_stock")
`;

export const FEATURED_PLANTS_QUERY = groq`
  *[_type == "plant" && featured == true] | order(_createdAt desc) [0..7] {
    ${CARD_FIELDS}
  }
`;

/**
 * `name.<locale> match $search` for every locale in the registry.
 *
 * Generated rather than hand-listed: search used to cover only `en`/`hi`/`gu`, so a
 * Tamil or Malayalam visitor searching in their own script got nothing back from a
 * site that otherwise ships in thirteen languages.
 */
const localizedNameMatch = (path: string) =>
  locales.map((locale) => `${path}.${locale} match $search`).join("\n    || ");

/** The plant itself matched: any localized name, the botanical name, or a tag. */
const PLANT_TEXT_MATCH = `
    ${localizedNameMatch("name")}
    || scientificName match $search
    || count(tags[@ match $search]) > 0
`;

/**
 * One of the plant's varieties matched by name — this is what makes a search for
 * "Kesar" or "Alphonso" find the Mango document that contains them.
 */
const VARIETY_TEXT_MATCH = `count(varieties[${localizedNameMatch("name")}]) > 0`;

const CATALOG_FILTER = `
  _type == "plant"
  && ($search == "" || ${PLANT_TEXT_MATCH} || ${VARIETY_TEXT_MATCH})
  && ($category == "" || $category in categories)
`;
const CATALOG_FIELDS = CARD_FIELDS;

/**
 * Search results carry each plant's full variety list so the page can render variety
 * result cards and derive their slugs (slug collision handling needs every sibling —
 * see `lib/plant/variety.ts`). Only the fields a variety card shows are projected.
 *
 * Kept separate from the browse projection so plain catalog browsing — the common
 * case, and the one with no query at all — doesn't pay for data it never renders.
 */
const CATALOG_SEARCH_FIELDS = `
  ${CARD_FIELDS},
  scientificName, tags,
  varieties[]{
    _key, name, availability, sizeRange,
    "image": images[0]{ asset, alt },
    bagSizes[]{ tiers[]{ price } }
  }
`;

const ORDER_CLAUSES: Record<string, string> = {
  name_desc: "name.en desc",
  newest: "_createdAt desc",
};

function orderClause(sort?: string) {
  return ORDER_CLAUSES[sort ?? ""] ?? "name.en asc";
}

/** Card-only projection: the default browse grid. */
export function catalogPlantsQuery(sort?: string) {
  return groq`*[${CATALOG_FILTER}] | order(${orderClause(sort)}) { ${CATALOG_FIELDS} }`;
}

/** Card + variety projection: used when the visitor has typed a search term. */
export function catalogSearchQuery(sort?: string) {
  return groq`*[${CATALOG_FILTER}] | order(${orderClause(sort)}) { ${CATALOG_SEARCH_FIELDS} }`;
}

// Distinct list of category strings actually used across plants (for filters / category pages).
export const USED_CATEGORIES_QUERY = groq`
  array::unique(*[_type == "plant" && defined(categories)].categories[])
`;

export const PLANT_BY_SLUG_QUERY = groq`
  *[_type == "plant" && slug.current == $slug][0]{
    _id,
    name, scientificName, slug,
    description,
    categories,
    careTips, fragrant, petSafe,
    images[]{ _key, asset, alt, caption, hotspot },
    varieties[]{
      _key, name, description, sizeRange,
      bagSizes[]{ size, tiers[]{ minQty, maxQty, price } },
      availability, sunlight, watering, growthRate,
      maxHeight, bloomSeason,
      images[]{ _key, asset, alt, caption, hotspot }
    },
    featured, tags,
    seo
  }
`;

export const PLANT_SLUGS_QUERY = groq`
  *[_type == "plant" && defined(slug.current)]{ "slug": slug.current }
`;

/**
 * Plant slug + every variety's identity, for `generateStaticParams` and the sitemap.
 *
 * The whole `name` object is projected (not just `name.en`) because slug derivation
 * falls back through the other locales when English is missing.
 */
export const PLANT_VARIETY_PATHS_QUERY = groq`
  *[_type == "plant" && defined(slug.current)]{
    "slug": slug.current,
    varieties[]{ _key, name }
  }
`;

export const RELATED_PLANTS_QUERY = groq`
  *[_type == "plant" && count(categories[@ in $categories]) > 0 && slug.current != $slug]
    | order(_createdAt desc) [0..3] {
    ${CARD_FIELDS}
  }
`;
