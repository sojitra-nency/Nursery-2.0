import type { Dictionary } from "@/lib/i18n/dictionaries";

interface CareGuideTableProps {
  sunlight?: string;
  watering?: string;
  growthRate?: string;
  size?: string;
  floweringSeason?: string;
  dict: Dictionary;
}

const SUNLIGHT_ICONS: Record<string, string> = {
  full_sun: "☀️",
  partial_shade: "⛅",
  shade: "🌥️",
  bright_indirect: "🌤️",
};

const WATERING_ICONS: Record<string, string> = {
  low: "💧",
  medium: "💧💧",
  high: "💧💧💧",
};

const GROWTH_ICONS: Record<string, string> = {
  slow: "🐢",
  medium: "🚶",
  fast: "🏃",
};

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

interface CareRow {
  icon: string;
  label: string;
  value: string;
}

export function CareGuideTable({
  sunlight,
  watering,
  growthRate,
  size,
  floweringSeason,
  dict,
}: CareGuideTableProps) {
  const rows: CareRow[] = [];

  if (sunlight) {
    const key = SUNLIGHT_LABELS[sunlight];
    rows.push({
      icon: SUNLIGHT_ICONS[sunlight] ?? "☀️",
      label: dict.plant.sunlight,
      value: key ? (dict.plant[key] as string) : sunlight,
    });
  }
  if (watering) {
    const key = WATERING_LABELS[watering];
    rows.push({
      icon: WATERING_ICONS[watering] ?? "💧",
      label: dict.plant.watering,
      value: key ? (dict.plant[key] as string) : watering,
    });
  }
  if (growthRate) {
    const key = GROWTH_LABELS[growthRate];
    rows.push({
      icon: GROWTH_ICONS[growthRate] ?? "🌱",
      label: dict.plant.growthRate,
      value: key ? (dict.plant[key] as string) : growthRate,
    });
  }
  if (size) rows.push({ icon: "📏", label: dict.plant.size, value: size });
  if (floweringSeason) rows.push({ icon: "🌸", label: dict.plant.season, value: floweringSeason });

  if (!rows.length) return null;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-surface px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">{dict.plant.careGuide}</h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg w-6 text-center">{row.icon}</span>
            <span className="text-sm text-muted w-28">{row.label}</span>
            <span className="text-sm text-foreground font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
