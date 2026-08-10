import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { GridIcon, LeafIcon, TapIcon } from "@/components/ui/icons";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { VarietyCardGrid, type VarietyGridItem } from "@/components/plant/VarietyCardGrid";
import { pluralize } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";
import type { PlantCardData } from "@/lib/types/plant";

interface ResultsHeadingProps {
  icon: ReactNode;
  title: string;
  count: string;
  id: string;
}

function ResultsHeading({ icon, title, count, id }: ResultsHeadingProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
      >
        {icon}
      </span>
      <h2 id={id} className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <span className="ms-auto">
        <Badge tone="neutral">{count}</Badge>
      </span>
    </div>
  );
}

interface SearchResultsProps {
  plants: PlantCardData[];
  varieties: VarietyGridItem[];
  locale: Locale;
  dict: Dictionary;
  currency?: string;
}

/**
 * Search results split into what someone actually asked for and what they probably
 * meant next: the plants that matched, then the individual varieties underneath.
 *
 * Searching "Mango" used to return one card — the Mango document — with Kesar,
 * Alphonso and Langra invisible until you opened it and scrolled. Here they are
 * results in their own right, each linking straight to its product page, so a dealer
 * who knows the variety name can go there in one tap.
 *
 * Only rendered when a term is present; plain browsing keeps the unlabelled grid.
 */
export function SearchResults({ plants, varieties, locale, dict, currency }: SearchResultsProps) {
  const plantCount = pluralize(
    plants.length,
    { one: dict.catalog.resultsCountOne, other: dict.catalog.resultsCount },
    locale
  );
  const varietyCount = pluralize(
    varieties.length,
    { one: dict.catalog.resultsCountVarietyOne, other: dict.catalog.resultsCountVariety },
    locale
  );

  return (
    <div className="space-y-10">
      {plants.length > 0 && (
        <section aria-labelledby="results-plants-heading">
          <ResultsHeading
            id="results-plants-heading"
            icon={<LeafIcon className="h-5 w-5" />}
            title={dict.catalog.plantsSection}
            count={plantCount}
          />
          <CatalogGrid plants={plants} locale={locale} dict={dict} />
        </section>
      )}

      {varieties.length > 0 && (
        <section aria-labelledby="results-varieties-heading">
          <ResultsHeading
            id="results-varieties-heading"
            icon={<GridIcon className="h-5 w-5" />}
            title={dict.catalog.varietiesSection}
            count={varietyCount}
          />
          <p className="mb-4 flex items-start gap-2 text-sm text-muted">
            <TapIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {dict.plant.varietiesHint}
          </p>
          <VarietyCardGrid items={varieties} locale={locale} dict={dict} currency={currency} />
        </section>
      )}
    </div>
  );
}
