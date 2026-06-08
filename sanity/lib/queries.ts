import { groq } from "next-sanity";

export const SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    name,
    tagline,
    description,
    logo,
    phone,
    whatsapp,
    email,
    address,
    city,
    region,
    socialLinks
  }
`;

export const PLANT_BY_SLUG_QUERY = groq`
  *[_type == "plant" && slug.current == $slug][0]{
    _id,
    name,
    scientificName,
    slug,
    description,
    category->{title, slug},
    images[]{_key, asset, alt, caption, hotspot},
    sunlight,
    watering,
    growthRate,
    availability,
    size,
    floweringSeason,
    featured,
    tags
  }
`;

export const PLANT_SLUGS_QUERY = groq`
  *[_type == "plant" && defined(slug.current)][]{
    "slug": slug.current
  }
`;
