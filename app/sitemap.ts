import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PLANT_SLUGS_QUERY,
  CATEGORY_SLUGS_QUERY,
  COLLECTION_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { locales } from "@/lib/i18n/config";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://greenskilllandscape.pages.dev";

function urls(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${DOMAIN}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plantSlugs, catSlugs, colSlugs] = await Promise.all([
    sanityFetch<Array<{ slug: string }>>(PLANT_SLUGS_QUERY, {}, ["plant"]),
    sanityFetch<Array<{ slug: string }>>(CATEGORY_SLUGS_QUERY, {}, ["category"]),
    sanityFetch<Array<{ slug: string }>>(COLLECTION_SLUGS_QUERY, {}, ["collection"]),
  ]);

  const staticPaths = locales.flatMap((locale) => [
    `/${locale}`,
    `/${locale}/catalog`,
    `/${locale}/about`,
    `/${locale}/visit`,
  ]);

  const plantPaths = (plantSlugs ?? []).flatMap(({ slug }) =>
    locales.map((l) => `/${l}/plants/${slug}`)
  );
  const catPaths = (catSlugs ?? []).flatMap(({ slug }) =>
    locales.map((l) => `/${l}/categories/${slug}`)
  );
  const colPaths = (colSlugs ?? []).flatMap(({ slug }) =>
    locales.map((l) => `/${l}/collections/${slug}`)
  );

  return [...staticPaths, ...plantPaths, ...catPaths, ...colPaths].map(urls);
}
