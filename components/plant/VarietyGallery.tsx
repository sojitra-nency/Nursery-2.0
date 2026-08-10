"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, LeafIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";
import { interpolate, formatNumber } from "@/lib/i18n/format";

export interface GalleryImage {
  key: string;
  url: string;
  alt: string;
}

interface VarietyGalleryProps {
  images: GalleryImage[];
  /** Fallback alt/label when an image carries none. */
  name: string;
  dict: Dictionary;
  locale: Locale;
  /** Set on the above-the-fold hero only. */
  priority?: boolean;
}

const sliderControlClass =
  "tap-target absolute top-1/2 -translate-y-1/2 rounded-full bg-scrim/45 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors hover:bg-scrim/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * Looping image carousel for a single variety (or a plant's hero range).
 *
 * Auto-advance pauses while hovered or focused and is disabled entirely under
 * `prefers-reduced-motion` (WCAG 2.2.2). Supports touch swipe; slide changes
 * are announced via a visually-hidden live region.
 */
export function VarietyGallery({ images, name, dict, locale, priority }: VarietyGalleryProps) {
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
    // Most varieties in a working nursery catalog have no photo yet, so this is a
    // routine state, not an error: same leaf mark the cards use, no broken frame.
    return (
      <div
        aria-hidden="true"
        className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-accent/5"
      >
        <LeafIcon className="h-16 w-16 text-accent/40" />
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
      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-border"
    >
      <Image
        src={current.url}
        alt={current.alt || name}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        priority={priority}
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
