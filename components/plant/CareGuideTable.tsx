import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { SunIcon, DropletIcon, SproutIcon, RulerIcon, FlowerIcon } from "@/components/ui/icons";

interface CareGuideTableProps {
  sunlight?: string;
  watering?: string;
  growthRate?: string;
  size?: string;
  floweringSeason?: string;
  dict: Dictionary;
  /**
   * Where this sits in the page outline. The variety page puts the care guide
   * directly under its `h1`, so it needs `2`; on the plant page a section heading
   * comes first and `3` (the default) is correct.
   */
  headingLevel?: 2 | 3;
}

const SUNLIGHT_LABELS: Record<string, keyof Dictionary["plant"]> = {
  full_sun: "fullSun",
  partial_shade: "partialShade",
  shade: "shade",
  bright_indirect: "brightIndirect",
};

const WATERING_LABELS: Record<string, keyof Dictionary["plant"]> = {
  low: "wateringLow",
  medium: "wateringMedium",
  high: "wateringHigh",
};

const GROWTH_LABELS: Record<string, keyof Dictionary["plant"]> = {
  slow: "growthSlow",
  medium: "growthMedium",
  fast: "growthFast",
};

/**
 * Last-resort label for an enum value with no dictionary entry — e.g. a value
 * added in the Studio before the catalogs caught up. `"bright_indirect"` reads as
 * "Bright indirect" rather than leaking a database token onto the page.
 */
function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface CareRow {
  /** Decorative glyph — the row's meaning is carried by the visible label. */
  icon: React.ReactNode;
  label: string;
  value: string;
}

/**
 * The care guide is the densest block of information on a plant page, and the one
 * a buyer with limited reading confidence most needs. Every row is icon + label +
 * value, so sun/water/growth are recognisable before a single word is read.
 *
 * Icons are the design system's SVGs rather than emoji: emoji render in a different
 * style on every OS (and as monochrome tofu on some Android builds), ignore the
 * theme, and can't take an accent colour.
 */
export function CareGuideTable({
  sunlight,
  watering,
  growthRate,
  size,
  floweringSeason,
  dict,
  headingLevel = 3,
}: CareGuideTableProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const rows: CareRow[] = [];

  if (sunlight) {
    const key = SUNLIGHT_LABELS[sunlight];
    rows.push({
      icon: <SunIcon className="h-4 w-4" />,
      label: dict.plant.sunlight,
      value: key ? (dict.plant[key] as string) : humanize(sunlight),
    });
  }
  if (watering) {
    const key = WATERING_LABELS[watering];
    rows.push({
      icon: <DropletIcon className="h-4 w-4" />,
      label: dict.plant.watering,
      value: key ? (dict.plant[key] as string) : humanize(watering),
    });
  }
  if (growthRate) {
    const key = GROWTH_LABELS[growthRate];
    rows.push({
      icon: <SproutIcon className="h-4 w-4" />,
      label: dict.plant.growthRate,
      value: key ? (dict.plant[key] as string) : humanize(growthRate),
    });
  }
  if (size) {
    rows.push({ icon: <RulerIcon className="h-4 w-4" />, label: dict.plant.size, value: size });
  }
  if (floweringSeason) {
    rows.push({
      icon: <FlowerIcon className="h-4 w-4" />,
      label: dict.plant.season,
      value: floweringSeason,
    });
  }

  if (!rows.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-surface px-4 py-3">
        <Heading className="text-sm font-semibold text-foreground">{dict.plant.careGuide}</Heading>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
            >
              {row.icon}
            </span>
            {/* Wraps to two lines instead of a fixed-width label column: a
                translated label can be two or three times its English width. */}
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="min-w-[6rem] text-sm text-muted">{row.label}</span>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
