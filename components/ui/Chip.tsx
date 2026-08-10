import Link from "next/link";
import type { ReactNode } from "react";

type ChipShape = "pill" | "square";
type ChipSize = "sm" | "md";

const shapeClass: Record<ChipShape, string> = {
  pill: "rounded-full",
  square: "rounded-md",
};

/**
 * Chips are the catalog's primary filter control on mobile. `sm` was a ~28px box
 * with 12px text — technically above the WCAG 2.5.8 24px floor, but small for a
 * thumb and hard to read for the low-literacy audience this catalog serves. Both
 * sizes now clear 36px with 14px text; icon-only controls elsewhere use the
 * stricter 44px `.tap-target`.
 */
const sizeClass: Record<ChipSize, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2 text-sm",
};

function chipClass(active: boolean, shape: ChipShape, size: ChipSize, extra: string) {
  const state = active
    ? "bg-accent text-on-accent border-accent shadow-soft"
    : "bg-surface border-border text-muted hover:border-accent hover:text-accent hover:bg-accent/5";
  return [
    "inline-flex items-center justify-center font-medium border cursor-pointer transition-colors",
    shapeClass[shape],
    sizeClass[size],
    state,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ChipProps {
  /** Toggle/selected state — drives the filled style and `aria-pressed` (buttons). */
  active?: boolean;
  shape?: ChipShape;
  size?: ChipSize;
  className?: string;
  children: ReactNode;
  /** When set, renders a `next/link` instead of a `<button>`. */
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  "aria-label"?: string;
}

/**
 * Shared "pill / toggle chip" used by catalog filters, the variety + bag-size
 * selectors and the featured-category links. Replaces four ad-hoc inline copies.
 */
export function Chip({
  active = false,
  shape = "pill",
  size = "sm",
  className = "",
  children,
  href,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}: ChipProps) {
  const cls = chipClass(active, shape, size, className);

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cls}
    >
      {children}
    </button>
  );
}
