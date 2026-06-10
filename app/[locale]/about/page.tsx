import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import type { Locale } from "@/lib/i18n/config";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  const description = getLocalized(settings.description, typedLocale);
  const address = getLocalized(settings.address, typedLocale);
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);
  const phone = settings.phone || "9876543210";
  const whatsapp = settings.whatsapp || "9876543210";

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
        {dict.home.aboutTeaser}
      </h1>

      {description && <p className="text-muted leading-relaxed text-lg mb-10">{description}</p>}

      {/* Contact */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.address}</h2>
        <div className="space-y-3">
          {address && <p className="text-muted">{address}</p>}
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:+91${phone}`}
              className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark"
            >
              📞 {phone}
            </a>
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark"
            >
              💬 WhatsApp
            </a>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-dark"
              >
                ✉️ {settings.email}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Opening hours */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.openingHours}</h2>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 max-w-sm">
          <p className="font-medium text-foreground">{hours}</p>
        </div>
      </section>

      {/* Social links */}
      {settings.socialLinks && settings.socialLinks.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Follow Us</h2>
          <div className="flex gap-4 flex-wrap">
            {settings.socialLinks.map((link: { platform?: string; url?: string }, i: number) =>
              link.url ? (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-medium hover:text-accent-dark capitalize"
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
