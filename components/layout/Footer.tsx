import Link from "next/link";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import { DEFAULT_PHONE } from "@/lib/constants";
import {
  ClockIcon,
  LeafIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { LeafSprig } from "@/components/ui/botanicals";
import type { SiteSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { formatNumber } from "@/lib/i18n/format";

interface FooterProps {
  nurseryName: string;
  locale: string;
  dict: Dictionary;
  settings: SiteSettings;
}

const footerLinkClass =
  "link-focus inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors";

export function Footer({ nurseryName, locale, dict, settings }: FooterProps) {
  const typedLocale = locale as Locale;
  const description = getLocalized(settings.description, typedLocale);
  const address = getLocalized(settings.address, typedLocale);
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);
  const phone = settings.phone || DEFAULT_PHONE;
  const whatsapp = settings.whatsapp || DEFAULT_PHONE;

  const navItems = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/catalog`, label: dict.nav.catalog },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/visit`, label: dict.nav.visit },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border bg-surface">
      {/* Botanical watermark — decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -bottom-12 rotate-[16deg]"
      >
        <LeafSprig className="h-72 w-auto text-accent/[0.07]" />
      </div>
      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent"
              >
                <LeafIcon className="h-4 w-4" />
              </span>
              {nurseryName}
            </p>
            {description && (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{description}</p>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label={dict.footer.quickLinks}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {dict.footer.quickLinks}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {dict.footer.contact}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {address && (
                <li className="flex items-start gap-2 text-sm text-muted">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  {address}
                </li>
              )}
              <li>
                <a href={`tel:+91${phone}`} className={footerLinkClass}>
                  <PhoneIcon className="h-4 w-4 shrink-0" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/91${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  {dict.contact.whatsapp}
                </a>
              </li>
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className={footerLinkClass}>
                    <MailIcon className="h-4 w-4 shrink-0" />
                    {settings.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2 text-sm text-muted">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {hours}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted">
          © {formatNumber(new Date().getFullYear(), typedLocale)} {nurseryName}.{" "}
          {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
