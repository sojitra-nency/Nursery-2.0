import Link from "next/link";
import { HeaderShell } from "./HeaderShell";
import { ThemeToggle } from "./ThemeToggle";
import { NavLinks, type NavItem } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";
import { LeafIcon, GridIcon, InfoIcon, MapPinIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

interface HeaderProps {
  nurseryName: string;
  locale: Locale;
  dict: Dictionary;
  showThemeToggle?: boolean;
}

export function Header({ nurseryName, locale, dict, showThemeToggle = false }: HeaderProps) {
  const items: NavItem[] = [
    {
      href: `/${locale}/catalog`,
      label: dict.nav.catalog,
      icon: <GridIcon className="h-4 w-4" />,
    },
    { href: `/${locale}/about`, label: dict.nav.about, icon: <InfoIcon className="h-4 w-4" /> },
    { href: `/${locale}/visit`, label: dict.nav.visit, icon: <MapPinIcon className="h-4 w-4" /> },
  ];

  return (
    <HeaderShell>
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link
          href={`/${locale}`}
          className="font-display inline-flex min-w-0 items-center gap-2.5 rounded-full text-xl font-semibold tracking-tight text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent"
          >
            <LeafIcon className="h-4 w-4" />
          </span>
          {/* Localized nursery names run much longer than the English one; truncate
              rather than let the brand shove the language control off-screen.
              `dir="auto"` so a Latin brand name inside the RTL Urdu header clips at
              its end instead of its beginning. */}
          <span dir="auto" className="truncate">
            {nurseryName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks items={items} />
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {/* Visible at every breakpoint, never inside the hamburger: a visitor who
              can't read the current language must be able to change it without
              first decoding a menu icon. */}
          <LanguagePicker
            locale={locale}
            labels={{
              language: dict.common.language,
              title: dict.language.title,
              change: dict.language.change,
              current: dict.language.current,
              close: dict.common.close,
            }}
          />
          {showThemeToggle && <ThemeToggle label={dict.common.toggleTheme} />}
          <MobileMenu
            items={items}
            openLabel={dict.common.openMenu}
            closeLabel={dict.common.closeMenu}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
