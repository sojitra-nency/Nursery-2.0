"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  /**
   * Decorative glyph paired with the label. A rendered element rather than a
   * component reference, so a Server Component can hand it across the boundary.
   *
   * Icons carry real weight for this audience: a buyer who reads slowly (or is
   * looking at a language whose translation is imperfect) can still recognise
   * "grid = the plants" and "pin = where they are" at a glance.
   */
  icon?: React.ReactNode;
}

/**
 * True when `href` is the current page or an ancestor of it. Intended for
 * section links like `/en/catalog` (safe for `/en/catalog?…` and
 * `/en/plants/...` style descendants); don't pass the bare locale root.
 */
export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop nav links with an animated accent underline: solid for the current
 * section (plus `aria-current`), soft on hover.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isActiveHref(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`link-focus relative inline-flex items-center gap-1.5 py-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-transform after:duration-300 after:ease-soft ${
              active
                ? "text-foreground after:scale-x-100 after:bg-accent"
                : "text-muted hover:text-foreground after:scale-x-0 after:bg-accent/40 hover:after:scale-x-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
