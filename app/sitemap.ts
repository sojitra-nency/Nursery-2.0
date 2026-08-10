import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_SLUGS_QUERY } from "@/sanity/lib/queries";
import { locales } from "@/lib/i18n/config";
import { SITE_DOMAIN as DOMAIN } from "@/lib/constants";

function urls(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${DOMAIN}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const plantSlugs = await sanityFetch<Array<{ slug: string }>>(PLANT_SLUGS_QUERY, {}, ["plant"]);

  // `/` is the language chooser — the locale-neutral hub that links to all
  // thirteen locales, and the `x-default` target in every page's hreflang set.
  const rootPath = "/";

  const localePaths = locales.flatMap((locale) => [
    `/${locale}`,
    `/${locale}/catalog`,
    `/${locale}/about`,
    `/${locale}/visit`,
  ]);

  const plantPaths = (plantSlugs ?? []).flatMap(({ slug }) =>
    locales.map((l) => `/${l}/plants/${slug}`)
  );

  return [rootPath, ...localePaths, ...plantPaths].map(urls);
}
