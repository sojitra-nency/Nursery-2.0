import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/ui/icons";
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
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-surface to-background py-20 md:py-28">
      {/* Soft decorative blobs — purely cosmetic, hidden from assistive tech. */}
      <div
        aria-hidden
        className="hero-float pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="hero-float pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-accent/5 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
      <div className="relative container mx-auto px-4 text-center max-w-3xl">
        <Reveal as="p" className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          {name}
        </Reveal>
        <Reveal
          as="h1"
          index={1}
          className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-tight mb-4"
        >
          {tagline}
        </Reveal>
        <Reveal as="p" index={2} className="text-muted text-lg mb-8">
          {dict.home.heroSubtitle}
        </Reveal>
        <Reveal index={3} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={`/${locale}/catalog`} size="lg">
            {dict.home.browseCatalog}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
          <Button
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
          >
            <WhatsAppIcon className="h-5 w-5 text-accent" />
            {dict.home.whatsappCta}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
