import { groq } from "next-sanity";

export const SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    name, tagline, description, logo,
    phone, whatsapp, email,
    address, city, region, geo,
    openingHours[], socialLinks[],
    currency, defaultSeo
  }
`;

export const FEATURED_CATEGORIES_QUERY = groq`
  *[_type == "category"] | order(_createdAt asc) [0..3] {
    title, slug, heroImage{ asset, alt }
  }
`;

export const ALL_CATEGORIES_QUERY = groq`
  *[_type == "category"] | order(_createdAt asc) {
    title, slug
  }
`;

export const FEATURED_PLANTS_QUERY = groq`
  *[_type == "plant" && featured == true] | order(_createdAt desc) [0..7] {
    name, slug, images[0]{ asset, alt }, availability, category->{ slug }
  }
`;

const CATALOG_FILTER = `
  _type == "plant"
  && ($search == "" || name.en match $search || name.hi match $search || name.gu match $search)
  && ($category == "" || category->slug.current == $category)
  && ($availability == "" || availability == $availability)
`;
const CATALOG_FIELDS = `name, slug, images[0]{ asset, alt }, availability, category->{ title, slug }`;

export const CATALOG_PLANTS_QUERY_NAME_ASC = groq`*[${CATALOG_FILTER}] | order(name.en asc) { ${CATALOG_FIELDS} }`;
export const CATALOG_PLANTS_QUERY_NAME_DESC = groq`*[${CATALOG_FILTER}] | order(name.en desc) { ${CATALOG_FIELDS} }`;
export const CATALOG_PLANTS_QUERY_NEWEST = groq`*[${CATALOG_FILTER}] | order(_createdAt desc) { ${CATALOG_FIELDS} }`;

export function catalogPlantsQuery(sort?: string) {
  if (sort === "name_desc") return CATALOG_PLANTS_QUERY_NAME_DESC;
  if (sort === "newest") return CATALOG_PLANTS_QUERY_NEWEST;
  return CATALOG_PLANTS_QUERY_NAME_ASC;
}

export const PLANT_BY_SLUG_QUERY = groq`
  *[_type == "plant" && slug.current == $slug][0]{
    _id,
    name, scientificName, slug,
    description,
    category->{ _id, title, slug },
    collections[]->{ title, slug },
    images[]{ _key, asset, alt, caption, hotspot },
    sunlight, watering, growthRate,
    availability, size, floweringSeason,
    featured, tags,
    seo
  }
`;

export const PLANT_SLUGS_QUERY = groq`
  *[_type == "plant" && defined(slug.current)]{ "slug": slug.current }
`;

export const RELATED_PLANTS_QUERY = groq`
  *[_type == "plant" && category._ref == $catId && slug.current != $slug] | order(_createdAt desc) [0..3] {
    name, slug, images[0]{ asset, alt }, availability
  }
`;

export const CATEGORY_BY_SLUG_QUERY = groq`
  *[_type == "category" && slug.current == $slug][0]{
    title, slug, description, heroImage{ asset, alt }, seo
  }
`;

export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "category" && defined(slug.current)]{ "slug": slug.current }
`;

export const PLANTS_BY_CATEGORY_QUERY = groq`
  *[_type == "plant" && category->slug.current == $slug] | order(name.en asc) {
    name, slug, images[0]{ asset, alt }, availability, category->{ slug }
  }
`;

export const COLLECTION_BY_SLUG_QUERY = groq`
  *[_type == "collection" && slug.current == $slug][0]{
    title, slug, description, seo
  }
`;

export const COLLECTION_SLUGS_QUERY = groq`
  *[_type == "collection" && defined(slug.current)]{ "slug": slug.current }
`;

export const PLANTS_BY_COLLECTION_QUERY = groq`
  *[_type == "plant" && $slug in collections[]->slug.current] | order(name.en asc) {
    name, slug, images[0]{ asset, alt }, availability, category->{ slug }
  }
`;
