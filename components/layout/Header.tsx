import Link from "next/link";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderShell } from "./HeaderShell";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeaderProps {
  nurseryName: string;
  locale: string;
  dict: Dictionary;
}

const navLinkClass =
  "text-muted hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Header({ nurseryName, locale, dict }: HeaderProps) {
  return (
    <HeaderShell>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="font-display font-semibold text-xl tracking-tight text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {nurseryName}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href={`/${locale}/catalog`} className={navLinkClass}>
            {dict.nav.catalog}
          </Link>
          <Link href={`/${locale}/about`} className={navLinkClass}>
            {dict.nav.about}
          </Link>
          <Link href={`/${locale}/visit`} className={navLinkClass}>
            {dict.nav.visit}
          </Link>
        </nav>
        <LocaleSwitcher locale={locale} />
      </div>
    </HeaderShell>
  );
}
