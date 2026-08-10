import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { formatHours } from "@/lib/hours";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n/config";
import { interpolate } from "@/lib/i18n/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { DEFAULT_PHONE, NURSERY_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { ClockIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildMetadata({
    title: dict.nav.visit,
    description: dict.seo.visit,
    slug: "visit",
    locale,
  });
}

export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  const address = getLocalized(settings.address, typedLocale);
  const city = getLocalized(settings.city, typedLocale);
  const region = getLocalized(settings.region, typedLocale);
  const phone = settings.phone || DEFAULT_PHONE;
  const hours = formatHours(settings, typedLocale, dict.contact.openEveryDay);
  const nurseryName = getLocalized(settings.name, typedLocale) || NURSERY_NAME;
  // Google Maps resolves place names far more reliably in English, and the address
  // stored under `en` is the canonical one — so the *query* stays English even
  // though everything the visitor reads is localized.
  const mapsQuery = encodeURIComponent(
    [
      getLocalized(settings.address, defaultLocale),
      getLocalized(settings.city, defaultLocale),
      getLocalized(settings.region, defaultLocale),
      NURSERY_NAME,
    ]
      .filter(Boolean)
      .join(", ")
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance text-foreground mb-8">
        {dict.nav.visit}
      </h1>

      {/* Map embed */}
      <div className="rounded-xl overflow-hidden border border-border shadow-soft mb-10 aspect-video">
        <iframe
          src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          // The iframe's accessible name — announced by screen readers, so it has
          // to be in the page's language, not always English.
          title={interpolate(dict.contact.mapTitle, { name: nurseryName })}
        />
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Button
          href={`https://maps.google.com/?q=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
        >
          <MapPinIcon className="h-5 w-5" />
          {dict.contact.getDirections}
        </Button>
        <Button href={`tel:+91${phone}`} variant="outline" size="lg">
          <PhoneIcon className="h-5 w-5" />
          {dict.contact.callUs}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {address && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{dict.contact.address}</h2>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-muted">{[address, city, region].filter(Boolean).join(", ")}</p>
            </div>
          </section>
        )}

        {/* Opening hours */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {dict.contact.openingHours}
          </h2>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <ClockIcon className="h-5 w-5 shrink-0 text-accent" />
            <p className="font-medium text-foreground">{hours}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
