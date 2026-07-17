import Link from "next/link";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import { DEFAULT_PHONE } from "@/lib/constants";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { SiteSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
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

      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} {nurseryName}. {dict.footer.rights}
        </div>
      </div>
    </footer>
  );
}
