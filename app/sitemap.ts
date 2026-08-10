import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PLANT_VARIETY_PATHS_QUERY } from "@/sanity/lib/queries";
import { locales } from "@/lib/i18n/config";
import { varietySlugs } from "@/lib/plant/variety";
import { SITE_DOMAIN as DOMAIN } from "@/lib/constants";
import type { PlantVariety } from "@/lib/types/plant";

function urls(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${DOMAIN}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const plants = await sanityFetch<Array<{ slug: string; varieties?: PlantVariety[] }>>(
    PLANT_VARIETY_PATHS_QUERY,
    {},
    ["plant"]
  );

  // `/` is the language chooser — the locale-neutral hub that links to all
  // thirteen locales, and the `x-default` target in every page's hreflang set.
  const rootPath = "/";

  const localePaths = locales.flatMap((locale) => [
    `/${locale}`,
    `/${locale}/catalog`,
    `/${locale}/about`,
    `/${locale}/visit`,
  ]);

  const plantPaths = (plants ?? []).flatMap(({ slug }) =>
    locales.map((l) => `/${l}/plants/${slug}`)
  );

  // Variety pages only exist where there's an actual choice to make — a plant with
  // one variety redirects to the plant page, so listing it here would advertise a
  // redirect. Mirrors `hasVarietyPages` on the variety route.
  const varietyPaths = (plants ?? []).flatMap(({ slug, varieties }) => {
    const list = varieties ?? [];
    if (list.length <= 1) return [];
    return varietySlugs(list).flatMap((variety) =>
      locales.map((l) => `/${l}/plants/${slug}/${variety}`)
    );
  });

  return [rootPath, ...localePaths, ...plantPaths, ...varietyPaths].map(urls);
}
