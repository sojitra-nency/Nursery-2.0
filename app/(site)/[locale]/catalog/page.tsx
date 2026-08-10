import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityFetch } from "@/sanity/lib/fetch";
import { catalogPlantsQuery, USED_CATEGORIES_QUERY } from "@/sanity/lib/queries";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { EmptyState } from "@/components/catalog/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PlantCardData } from "@/components/ui/PlantCard";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { pluralize } from "@/lib/i18n/format";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildMetadata({
    title: dict.catalog.title,
    description: dict.seo.catalog,
    slug: "catalog",
    locale,
  });
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const typedLocale = locale as Locale;

  const [dict, plants, categories] = await Promise.all([
    getDictionary(locale),
    sanityFetch<PlantCardData[]>(
      catalogPlantsQuery(sp.sort),
      {
        search: sp.q ? `*${sp.q}*` : "",
        category: sp.category ?? "",
      },
      ["plant"]
    ),
    sanityFetch<string[]>(USED_CATEGORIES_QUERY, {}, ["plant"]),
  ]);

  const count = plants?.length ?? 0;
  const hasFilters = Boolean(sp.q || sp.category || sp.sort);
  // Locale-aware: picks the singular/plural form and formats the number with the
  // locale's own grouping instead of interpolating a raw `String(count)`.
  const countLabel = pluralize(
    count,
    { one: dict.catalog.resultsCountOne, other: dict.catalog.resultsCount },
    typedLocale
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <SectionHeading eyebrow={dict.nav.catalog} title={dict.catalog.title} subtitle={countLabel} />
      <Suspense>
        <CatalogFilters categories={categories ?? []} dict={dict} />
      </Suspense>
      {/* Filtering re-renders the grid with no visual "loading" step, so screen
          reader users had no signal that anything changed. Announce the new count. */}
      <p role="status" aria-live="polite" className="sr-only">
        {countLabel}
      </p>
      {plants && plants.length > 0 ? (
        <CatalogGrid plants={plants} locale={typedLocale} dict={dict} />
      ) : (
        <EmptyState dict={dict} clearHref={hasFilters ? `/${locale}/catalog` : undefined} />
      )}
    </div>
  );
}
