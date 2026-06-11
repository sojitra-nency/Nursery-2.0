import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import type { Locale } from "@/lib/i18n/config";

export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  const address = getLocalized(settings.address, typedLocale);
  const city = getLocalized(settings.city, typedLocale);
  const region = getLocalized(settings.region, typedLocale);
  const phone = settings.phone || "9876543210";
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);
  const mapsQuery = encodeURIComponent(
    [address, city, region, "Green Skill Nursery"].filter(Boolean).join(", ")
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{dict.nav.visit}</h1>

      {/* Map embed */}
      <div className="rounded-xl overflow-hidden border border-border mb-10 aspect-video">
        <iframe
          src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Greenskill Landscape location"
        />
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 mb-10">
        <a
          href={`https://maps.google.com/?q=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-on-accent font-semibold rounded-xl hover:bg-accent-dark transition-colors"
        >
          📍 {dict.contact.getDirections}
        </a>
        <a
          href={`tel:+91${phone}`}
          className="inline-flex items-center gap-2 px-5 py-3 border-2 border-accent text-accent font-semibold rounded-xl hover:bg-accent/10 transition-colors"
        >
          📞 {dict.contact.callUs}
        </a>
      </div>

      {address && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-2">{dict.contact.address}</h2>
          <p className="text-muted">{address}</p>
        </div>
      )}

      {/* Opening hours */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.openingHours}</h2>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 max-w-sm">
          <p className="font-medium text-foreground">{hours}</p>
        </div>
      </section>
    </div>
  );
}
