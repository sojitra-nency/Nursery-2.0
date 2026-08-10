import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { DEFAULT_PHONE } from "@/lib/constants";
import { ClockIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";

const contactLinkClass =
  "link-focus inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark transition-colors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildMetadata({
    title: dict.home.aboutTeaser,
    description: dict.seo.about,
    slug: "about",
    locale,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  const description = getLocalized(settings.description, typedLocale);
  const address = getLocalized(settings.address, typedLocale);
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);
  const phone = settings.phone || DEFAULT_PHONE;
  const whatsapp = settings.whatsapp || DEFAULT_PHONE;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance text-foreground mb-8">
        {dict.home.aboutTeaser}
      </h1>

      {description && <p className="text-muted leading-relaxed text-lg mb-10">{description}</p>}

      {/* Contact */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.address}</h2>
        <div className="space-y-3">
          {address && <p className="text-muted">{address}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <a href={`tel:+91${phone}`} className={contactLinkClass}>
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
            >
              <WhatsAppIcon className="h-4 w-4" />
              {dict.contact.whatsapp}
            </a>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className={contactLinkClass}>
                <MailIcon className="h-4 w-4" />
                {settings.email}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Opening hours */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.openingHours}</h2>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 max-w-sm">
          <ClockIcon className="h-5 w-5 shrink-0 text-accent" />
          <p className="font-medium text-foreground">{hours}</p>
        </div>
      </section>

      {/* Social links */}
      {settings.socialLinks && settings.socialLinks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.followUs}</h2>
          <div className="flex gap-4 flex-wrap">
            {settings.socialLinks.map((link: { platform?: string; url?: string }, i: number) =>
              link.url ? (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${contactLinkClass} capitalize`}
                >
                  {link.platform}
                </a>
              ) : null
            )}
          </div>
        </section>
      )}
    </div>
  );
}
