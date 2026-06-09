import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityFetch } from "@/sanity/lib/fetch";
import { catalogPlantsQuery, ALL_CATEGORIES_QUERY } from "@/sanity/lib/queries";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { EmptyState } from "@/components/catalog/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";

interface Plant {
  name: { en?: string; hi?: string; gu?: string };
  slug: { current: string };
  images?: Array<{ asset: SanityImageSource }>;
  availability?: string;
  category?: { slug: { current: string } };
}

interface Category {
  title: { en?: string };
  slug: { current: string };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; availability?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const typedLocale = locale as Locale;

  const [dict, plants, categories] = await Promise.all([
    getDictionary(locale),
    sanityFetch<Plant[]>(
      catalogPlantsQuery(sp.sort),
      {
        search: sp.q ? `*${sp.q}*` : "",
        category: sp.category ?? "",
        availability: sp.availability ?? "",
      },
      ["plant"]
    ),
    sanityFetch<Category[]>(ALL_CATEGORIES_QUERY, {}, ["category"]),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <SectionHeading title={dict.catalog.title} />
      <Suspense>
        <CatalogFilters categories={categories ?? []} dict={dict} />
      </Suspense>
      {plants && plants.length > 0 ? (
        <CatalogGrid plants={plants} locale={typedLocale} />
      ) : (
        <EmptyState dict={dict} />
      )}
    </div>
  );
}
