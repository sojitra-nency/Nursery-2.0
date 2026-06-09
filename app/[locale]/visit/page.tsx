import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Locale } from "@/lib/i18n/config";

export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  const address = getLocalized(settings.address, typedLocale);
  const city = settings.city ?? "";
  const phone = settings.phone || "9876543210";
  const mapsQuery = encodeURIComponent(
    [address, city, settings.region, "Green Skill Nursery"].filter(Boolean).join(", ")
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
          className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors"
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
      {settings.openingHours && settings.openingHours.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {dict.contact.openingHours}
          </h2>
          <div className="rounded-xl border border-border overflow-hidden max-w-sm">
            {settings.openingHours.map((row: { days?: string; hours?: string }, i: number) => (
              <div
                key={i}
                className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-surface" : "bg-background"}`}
              >
                <span className="text-muted">{row.days}</span>
                <span className="font-medium text-foreground">{row.hours}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
