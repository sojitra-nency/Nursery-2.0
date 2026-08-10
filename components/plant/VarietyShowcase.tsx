"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { CareGuideTable } from "@/components/plant/CareGuideTable";
import { AVAILABILITY } from "@/sanity/lib/enums";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";
import { interpolate, formatNumber, formatCurrency } from "@/lib/i18n/format";
import type { BagSizePricing } from "@/lib/types/plant";

export interface ShowcaseImage {
  key: string;
  url: string;
  alt: string;
}

export interface ShowcaseVariety {
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
  images: ShowcaseImage[];
}

interface VarietyShowcaseProps {
  varieties: ShowcaseVariety[];
  fallbackName: string;
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

const sliderControlClass =
  "tap-target absolute top-1/2 -translate-y-1/2 rounded-full bg-scrim/45 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors hover:bg-scrim/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * Looping image carousel for a single variety.
 *
 * Auto-advance pauses while hovered or focused and is disabled entirely under
 * `prefers-reduced-motion` (WCAG 2.2.2). Supports touch swipe; slide changes
 * are announced via a visually-hidden live region.
 */
function CircularSlider({
  images,
  name,
  dict,
  locale,
}: {
  images: ShowcaseImage[];
  name: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const [prevImages, setPrevImages] = useState(images);

  // Reset the carousel when the image set changes (adjust state during render).
  if (prevImages !== images) {
    setPrevImages(images);
    setIndex(0);
  }

  // Auto-advance unless paused, reduced-motion, or single image.
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images, paused]);

  if (!images.length) {
    return (
      <div
        aria-hidden="true"
        className="aspect-[4/3] bg-surface border border-border rounded-xl flex items-center justify-center text-6xl"
      >
        🌿
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);
  const current = images[index];
  const counter = interpolate(dict.plant.imageCounter, {
    current: formatNumber(index + 1, locale),
    total: formatNumber(images.length, locale),
  });

  return (
    <div
      role="group"
      // Announced verbatim by screen readers, so it can't stay the English
      // literal "carousel" on a Tamil or Urdu page.
      aria-roledescription={dict.plant.gallery}
      aria-label={name}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-border"
    >
      <Image
        src={current.url}
        alt={current.alt || name}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        priority
      />
      <p className="sr-only" aria-live="polite">
        {counter}
      </p>
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label={dict.plant.prevImage}
            onClick={() => go(-1)}
            className={`${sliderControlClass} start-2`}
          >
            <ChevronLeftIcon className="rtl-flip h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={dict.plant.nextImage}
            onClick={() => go(1)}
            className={`${sliderControlClass} end-2`}
          >
            <ChevronRightIcon className="rtl-flip h-5 w-5" />
          </button>
          {/* Soft scrim keeps the dots legible over bright imagery. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-scrim/50 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1">
            {images.map((img, i) => (
              <button
                key={img.key}
                type="button"
                aria-label={interpolate(dict.plant.goToImage, { n: formatNumber(i + 1, locale) })}
                aria-current={i === index || undefined}
                onClick={() => setIndex(i)}
                className="group/dot flex h-11 cursor-pointer items-center px-1 focus-visible:outline-none"
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-white ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 group-hover/dot:bg-white/90"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function VarietyShowcase({
  varieties,
  fallbackName,
  dict,
  locale,
  currency = "INR",
}: VarietyShowcaseProps) {
  const [activeKey, setActiveKey] = useState(varieties[0]?.key);
  const [activeBagSize, setActiveBagSize] = useState<string | null>(
    varieties[0]?.bagSizes?.[0]?.size ?? null
  );

  const active = useMemo(
    () => varieties.find((v) => v.key === activeKey) ?? varieties[0],
    [varieties, activeKey]
  );

  // Reset selected bag size when the active variety changes (adjust during render).
  const [prevActiveKey, setPrevActiveKey] = useState(active?.key);
  if (active && prevActiveKey !== active.key) {
    setPrevActiveKey(active.key);
    setActiveBagSize(active.bagSizes?.[0]?.size ?? null);
  }

  if (!active) return null;

  const avail = AVAILABILITY.find((a) => a.value === active.availability);
  const activePricing = active.bagSizes?.find((b) => b.size === activeBagSize);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-4">
        <CircularSlider
          images={active.images}
          name={active.name || fallbackName}
          dict={dict}
          locale={locale}
        />

        {/* Variety selector */}
        {varieties.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {varieties.map((v) => (
              <Chip key={v.key} active={v.key === active.key} onClick={() => setActiveKey(v.key)}>
                {v.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Variety details */}
      <div className="space-y-5">
        {varieties.length > 1 && active.name && (
          <h2 className="text-xl font-semibold text-foreground">{active.name}</h2>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {avail && (
            <Badge dot tone={availabilityTone(active.availability)}>
              {dict.common[avail.key]}
            </Badge>
          )}
        </div>

        {active.description && <p className="text-muted leading-relaxed">{active.description}</p>}

        <CareGuideTable
          sunlight={active.sunlight}
          watering={active.watering}
          growthRate={active.growthRate}
          size={active.sizeRange}
          floweringSeason={active.bloomSeason}
          dict={dict}
        />

        {/* Bag size selector + tiered pricing */}
        {active.bagSizes && active.bagSizes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{dict.plant.bagSize}</p>
            <div className="flex flex-wrap gap-2">
              {active.bagSizes.map((b) => (
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
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
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

        {active.maxHeight && (
          <div className="space-y-1 text-sm">
            <p className="text-muted">
              <span className="font-medium text-foreground">{dict.plant.size}:</span>{" "}
              {active.maxHeight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
