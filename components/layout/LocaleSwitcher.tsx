"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

interface LocaleSwitcherProps {
  locale: string;
  /** Accessible name for the switcher, e.g. dict.common.language. */
  label?: string;
}

/** Segmented pill control for switching the page locale in place. */
export function LocaleSwitcher({ locale, label }: LocaleSwitcherProps) {
  const pathname = usePathname();

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    return segments.join("/");
  }

  return (
    <nav
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      {locales.map((l) => (
        <Link
          key={l}
          href={switchTo(l)}
          aria-current={l === locale ? "page" : undefined}
          className={`link-focus rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            l === locale
              ? "bg-accent text-on-accent shadow-soft"
              : "text-muted hover:bg-background hover:text-foreground"
          }`}
        >
          {localeNames[l]}
        </Link>
      ))}
    </nav>
  );
}
