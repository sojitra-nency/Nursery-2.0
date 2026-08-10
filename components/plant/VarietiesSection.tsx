import { Badge } from "@/components/ui/Badge";
import { GridIcon, TapIcon } from "@/components/ui/icons";
import { VarietyCardGrid, type VarietyGridItem } from "@/components/plant/VarietyCardGrid";
import { pluralize } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

/** Anchor target for the "see all varieties" jump from the hero. */
export const VARIETIES_SECTION_ID = "varieties";

interface VarietiesSectionProps {
  items: VarietyGridItem[];
  locale: Locale;
  dict: Dictionary;
  currency?: string;
}

/**
 * The plant page's primary call to action: every variety, as a picture you can tap.
 *
 * Deliberately loud. Varieties used to sit below the fold behind a row of text chips
 * that read as filters rather than products, so people left a mango page without ever
 * learning that Kesar and Alphonso were separate things they could buy. The tinted
 * band, the count and the explicit tap hint exist so the section cannot be mistaken
 * for decoration or skimmed past — the audience includes buyers with limited digital
 * literacy, for whom "these pictures are the next step" has to be stated, not implied.
 */
export function VarietiesSection({ items, locale, dict, currency }: VarietiesSectionProps) {
  if (items.length === 0) return null;

  const countLabel = pluralize(
    items.length,
    { one: dict.plant.varietyCountOne, other: dict.plant.varietyCount },
    locale
  );

  return (
    <section
      id={VARIETIES_SECTION_ID}
      aria-labelledby="varieties-heading"
      // Sticky header clearance for the in-page jump.
      className="mt-10 scroll-mt-24"
    >
      <div className="rounded-3xl border border-accent/25 bg-accent/5 p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            aria-hidden="true"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow-soft"
          >
            <GridIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              {dict.plant.varietiesEyebrow}
            </p>
            <h2
              id="varieties-heading"
              className="font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
            >
              {dict.plant.varietiesTitle}
            </h2>
          </div>
          <span className="ms-auto">
            <Badge tone="accent">{countLabel}</Badge>
          </span>
        </div>

        <p className="mb-5 flex items-start gap-2 text-sm text-muted">
          <TapIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {dict.plant.varietiesHint}
        </p>

        <VarietyCardGrid items={items} locale={locale} dict={dict} currency={currency} />
      </div>
    </section>
  );
}
