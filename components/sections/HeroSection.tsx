import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeroSectionProps {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}

export function HeroSection({ settings, locale, dict }: HeroSectionProps) {
  const name = getLocalized(settings.name, locale) || "Greenskill Landscape";
  const tagline = getLocalized(settings.tagline, locale) || dict.home.heroTitleFallback;
  const whatsapp = settings.whatsapp || "9876543210";
  const waText = encodeURIComponent("Hi, I'm interested in plants from Greenskill Landscape");
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;

  return (
    <section className="relative bg-gradient-to-br from-accent/10 via-surface to-background py-20 md:py-28">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{name}</p>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
          {tagline}
        </h1>
        <p className="text-muted text-lg mb-8">{dict.home.heroSubtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/catalog`}>
            <Button size="lg">{dict.home.browseCatalog}</Button>
          </Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg">
              💬 {dict.home.whatsappCta}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
