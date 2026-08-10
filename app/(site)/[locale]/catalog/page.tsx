import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  catalogPlantsQuery,
  catalogSearchQuery,
  USED_CATEGORIES_QUERY,
} from "@/sanity/lib/queries";
import { getSettings } from "@/lib/site";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { SearchResults } from "@/components/catalog/SearchResults";
import { EmptyState } from "@/components/catalog/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { VarietyGridItem } from "@/components/plant/VarietyCardGrid";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { pluralize } from "@/lib/i18n/format";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { collectVarietyHits } from "@/lib/plant/search";
import { buildMetadata } from "@/lib/seo/metadata";
import type { PlantSearchRow } from "@/lib/types/plant";

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

  const term = sp.q?.trim() ?? "";
  const isSearching = term.length > 0;

  // Two projections behind one filter: browsing fetches plant cards only, while a
  // search also pulls each plant's varieties so they can be surfaced as results of
  // their own. Keeping them apart means the common no-query case doesn't pay for
  // data it never renders.
  const [dict, settings, plants, categories] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    sanityFetch<PlantSearchRow[]>(
      isSearching ? catalogSearchQuery(sp.sort) : catalogPlantsQuery(sp.sort),
      { search: isSearching ? `*${term}*` : "", category: sp.category ?? "" },
      ["plant"]
    ),
    sanityFetch<string[]>(USED_CATEGORIES_QUERY, {}, ["plant"]),
  ]);

  const rows = plants ?? [];

  // Which individual varieties this term should surface — empty while browsing.
  const varietyItems: VarietyGridItem[] = collectVarietyHits(rows, term).map((hit) => {
    const plantName = getLocalized(hit.plantName, typedLocale);
    return {
      variety: hit.variety,
      varietySlug: hit.varietySlug,
      plantSlug: hit.plantSlug,
      plantName,
      fallbackName: plantName,
    };
  });

  const hasFilters = Boolean(sp.q || sp.category || sp.sort);
  const hasResults = rows.length > 0 || varietyItems.length > 0;

  // Locale-aware: picks the singular/plural form and formats the number with the
  // locale's own grouping instead of interpolating a raw `String(count)`.
  const plantCountLabel = pluralize(
    rows.length,
    { one: dict.catalog.resultsCountOne, other: dict.catalog.resultsCount },
    typedLocale
  );
  const varietyCountLabel = pluralize(
    varietyItems.length,
    { one: dict.catalog.resultsCountVarietyOne, other: dict.catalog.resultsCountVariety },
    typedLocale
  );
  const countLabel =
    varietyItems.length > 0 ? `${plantCountLabel} · ${varietyCountLabel}` : plantCountLabel;

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
      {hasResults ? (
        isSearching ? (
          <SearchResults
            plants={rows}
            varieties={varietyItems}
            locale={typedLocale}
            dict={dict}
            currency={settings.currency}
          />
        ) : (
          <CatalogGrid plants={rows} locale={typedLocale} dict={dict} />
        )
      ) : (
        <EmptyState dict={dict} clearHref={hasFilters ? `/${locale}/catalog` : undefined} />
      )}
    </div>
  );
}
