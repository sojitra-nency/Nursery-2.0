import Link from "next/link";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderShell } from "./HeaderShell";
import { ThemeToggle } from "./ThemeToggle";
import { NavLinks, type NavItem } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { LeafIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeaderProps {
  nurseryName: string;
  locale: string;
  dict: Dictionary;
  showThemeToggle?: boolean;
}

export function Header({ nurseryName, locale, dict, showThemeToggle = false }: HeaderProps) {
  const items: NavItem[] = [
    { href: `/${locale}/catalog`, label: dict.nav.catalog },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/visit`, label: dict.nav.visit },
  ];

  return (
    <HeaderShell>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2.5 font-display font-semibold text-xl tracking-tight text-foreground rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent"
          >
            <LeafIcon className="h-4 w-4" />
          </span>
          {nurseryName}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks items={items} />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LocaleSwitcher locale={locale} label={dict.common.language} />
          </div>
          {showThemeToggle && <ThemeToggle label={dict.common.toggleTheme} />}
          <MobileMenu
            items={items}
            openLabel={dict.common.openMenu}
            closeLabel={dict.common.closeMenu}
          >
            <LocaleSwitcher locale={locale} label={dict.common.language} />
          </MobileMenu>
        </div>
      </div>
    </HeaderShell>
  );
}
