"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { CareGuideTable } from "@/components/plant/CareGuideTable";
import { AVAILABILITY } from "@/sanity/lib/enums";
import { formatCurrency, formatNumber } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";
import type { BagSizePricing } from "@/lib/types/plant";

/** A variety with its text already resolved for the active locale. */
export interface ResolvedVariety {
  key: string;
  name: string;
  description?: string;
  sizeRange?: string;
  bagSizes?: BagSizePricing[];
  availability?: string;
  sunlight?: string;
  watering?: string;
  growthRate?: string;
  maxHeight?: string;
  bloomSeason?: string;
}

interface VarietyDetailPanelProps {
  variety: ResolvedVariety;
  dict: Dictionary;
  locale: Locale;
  /** ISO 4217 code from siteSettings; the symbol and its placement follow the locale. */
  currency?: string;
}

function availabilityTone(value?: string) {
  if (value === "in_stock") return "success" as const;
  if (value === "out_of_stock") return "danger" as const;
  if (value === "limited") return "warning" as const;
  return "neutral" as const;
}

/**
 * Availability, description, care guide and quantity-tiered pricing for one variety.
 *
 * Client-side only because of the bag-size selector; everything else is static.
 */
export function VarietyDetailPanel({
  variety,
  dict,
  locale,
  currency = "INR",
}: VarietyDetailPanelProps) {
  const [activeBagSize, setActiveBagSize] = useState<string | null>(
    variety.bagSizes?.[0]?.size ?? null
  );

  // Reset the selection when the variety changes (adjust state during render — the
  // idiom used elsewhere in this codebase rather than an effect).
  const [prevKey, setPrevKey] = useState(variety.key);
  if (prevKey !== variety.key) {
    setPrevKey(variety.key);
    setActiveBagSize(variety.bagSizes?.[0]?.size ?? null);
  }

  const avail = AVAILABILITY.find((a) => a.value === variety.availability);
  const activePricing = variety.bagSizes?.find((b) => b.size === activeBagSize);

  return (
    <div className="space-y-5">
      {avail && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge dot tone={availabilityTone(variety.availability)}>
            {dict.common[avail.key]}
          </Badge>
        </div>
      )}

      {variety.description && <p className="leading-relaxed text-muted">{variety.description}</p>}

      <CareGuideTable
        sunlight={variety.sunlight}
        watering={variety.watering}
        growthRate={variety.growthRate}
        size={variety.sizeRange}
        floweringSeason={variety.bloomSeason}
        dict={dict}
        // This panel always renders directly beneath the page's h1 (variety page,
        // or a single-variety plant page), so the care guide is the first h2.
        headingLevel={2}
      />

      {/* Bag size selector + tiered pricing */}
      {variety.bagSizes && variety.bagSizes.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">{dict.plant.bagSize}</p>
          <div className="flex flex-wrap gap-2">
            {variety.bagSizes.map((b) => (
              <Chip
                key={b.size}
                shape="square"
                active={b.size === activeBagSize}
                onClick={() => setActiveBagSize(b.size)}
              >
                {b.size}
              </Chip>
            ))}
          </div>

          {activePricing && activePricing.tiers && activePricing.tiers.length > 0 && (
            <table className="w-full overflow-hidden rounded-lg border border-border text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">{dict.plant.quantity}</th>
                  <th className="px-3 py-2 text-end font-medium">{dict.plant.pricePerPlant}</th>
                </tr>
              </thead>
              <tbody>
                {activePricing.tiers.map((tier, i) => {
                  const range = tier.maxQty
                    ? `${formatNumber(tier.minQty, locale)} – ${formatNumber(tier.maxQty, locale)}`
                    : `${formatNumber(tier.minQty, locale)}+`;
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-surface"}>
                      <td className="px-3 py-2 text-muted">{range}</td>
                      <td className="px-3 py-2 text-end font-semibold text-foreground">
                        {formatCurrency(tier.price, locale, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {variety.maxHeight && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">{dict.plant.size}:</span>{" "}
          {variety.maxHeight}
        </p>
      )}
    </div>
  );
}
