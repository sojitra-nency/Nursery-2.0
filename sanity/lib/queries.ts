import { groq } from "next-sanity";

export const SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    name, tagline, description, logo,
    phone, whatsapp, email,
    address, city, region, geo,
    openEveryday, openTime, closeTime, hoursNote,
    socialLinks[],
    currency, defaultSeo
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

const CATALOG_FILTER = `
  _type == "plant"
  && ($search == "" || name.en match $search || name.hi match $search || name.gu match $search)
  && ($category == "" || $category in categories)
`;
const CATALOG_FIELDS = CARD_FIELDS;

export const CATALOG_PLANTS_QUERY_NAME_ASC = groq`*[${CATALOG_FILTER}] | order(name.en asc) { ${CATALOG_FIELDS} }`;
export const CATALOG_PLANTS_QUERY_NAME_DESC = groq`*[${CATALOG_FILTER}] | order(name.en desc) { ${CATALOG_FIELDS} }`;
export const CATALOG_PLANTS_QUERY_NEWEST = groq`*[${CATALOG_FILTER}] | order(_createdAt desc) { ${CATALOG_FIELDS} }`;

export function catalogPlantsQuery(sort?: string) {
  if (sort === "name_desc") return CATALOG_PLANTS_QUERY_NAME_DESC;
  if (sort === "newest") return CATALOG_PLANTS_QUERY_NEWEST;
  return CATALOG_PLANTS_QUERY_NAME_ASC;
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

export const RELATED_PLANTS_QUERY = groq`
  *[_type == "plant" && count(categories[@ in $categories]) > 0 && slug.current != $slug]
    | order(_createdAt desc) [0..3] {
    ${CARD_FIELDS}
  }
`;

export const PLANTS_BY_CATEGORY_QUERY = groq`
  *[_type == "plant" && $category in categories] | order(name.en asc) {
    ${CARD_FIELDS}
  }
`;
