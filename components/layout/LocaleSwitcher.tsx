"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    return segments.join("/");
  }

  return (
    <div className="flex gap-2 text-sm">
      {locales.map((l) => (
        <Link
          key={l}
          href={switchTo(l)}
          className={`link-focus ${
            l === locale
              ? "font-semibold text-accent"
              : "text-muted hover:text-foreground transition-colors"
          }`}
        >
          {localeNames[l]}
        </Link>
      ))}
    </div>
  );
}
