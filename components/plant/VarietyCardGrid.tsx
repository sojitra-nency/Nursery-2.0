import { VarietyCard, type VarietyCardSource } from "@/components/plant/VarietyCard";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

/**
 * One card's worth of data. Carries its own plant context because search results mix
 * varieties from different plants into a single grid.
 */
export interface VarietyGridItem {
  variety: VarietyCardSource;
  varietySlug: string;
  plantSlug: string;
  /** Rendered as a subtitle; omit on a plant page where the parent is already obvious. */
  plantName?: string;
  fallbackName: string;
}

interface VarietyCardGridProps {
  items: VarietyGridItem[];
  locale: Locale;
  dict: Dictionary;
  currency?: string;
}

/** Bare responsive grid of variety cards — matches `CatalogGrid`'s column rhythm. */
export function VarietyCardGrid({ items, locale, dict, currency }: VarietyCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <VarietyCard
          key={`${item.plantSlug}/${item.varietySlug}`}
          variety={item.variety}
          varietySlug={item.varietySlug}
          plantSlug={item.plantSlug}
          plantName={item.plantName}
          fallbackName={item.fallbackName}
          locale={locale}
          dict={dict}
          currency={currency}
        />
      ))}
    </div>
  );
}
