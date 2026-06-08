import Link from "next/link";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeaderProps {
  nurseryName: string;
  locale: string;
  dict: Dictionary;
}

export function Header({ nurseryName, locale, dict }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-bold text-lg text-foreground">
          {nurseryName}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href={`/${locale}/catalog`}
            className="text-muted hover:text-foreground transition-colors"
          >
            {dict.nav.catalog}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-muted hover:text-foreground transition-colors"
          >
            {dict.nav.about}
          </Link>
          <Link
            href={`/${locale}/visit`}
            className="text-muted hover:text-foreground transition-colors"
          >
            {dict.nav.visit}
          </Link>
        </nav>
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  );
}
