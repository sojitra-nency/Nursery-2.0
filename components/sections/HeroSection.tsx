import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, CheckIcon, LeafIcon, WhatsAppIcon } from "@/components/ui/icons";
import { LeafSprig } from "@/components/ui/botanicals";
import type { SiteSettings } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import { getLocalized, resolveLocalized } from "@/lib/i18n/getLocalized";
import { interpolate } from "@/lib/i18n/format";
import { NURSERY_NAME, DEFAULT_PHONE } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

interface HeroSectionProps {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}

/** Split a headline so its final word can carry the italic accent styling. */
function splitTagline(tagline: string): { lead: string; accent: string } {
  const words = tagline.trim().split(/\s+/);
  const accent = words.pop() ?? "";
  return { lead: words.join(" "), accent };
}

export function HeroSection({ settings, locale, dict }: HeroSectionProps) {
  const name = getLocalized(settings.name, locale) || NURSERY_NAME;

  // The headline is CMS content, and the CMS tagline is only authored in a few
  // languages. `getLocalized` would hand back the English tagline for the rest —
  // and because English is `required()` in the schema, that made the translated
  // `heroTitleFallback` unreachable, leaving "Quality Plants for Every Home" sitting
  // in English above otherwise fully-translated Tamil and Urdu pages.
  //
  // So: use the tagline only when it exists *in this locale*, and otherwise take the
  // translated headline from the catalog. A translated generic beats an untranslated
  // specific for a reader who can't read English at all. Once `npm run translate`
  // fills the tagline, the real one takes over automatically.
  const cmsTagline = resolveLocalized(settings.tagline, locale);
  const tagline =
    !cmsTagline.isFallback && cmsTagline.value ? cmsTagline.value : dict.home.heroTitleFallback;
  const whatsapp = settings.whatsapp || DEFAULT_PHONE;
  // The prefilled WhatsApp message is the visitor's own first words to the nursery.
  // Sending an English sentence from a Tamil or Urdu page put words in their mouth
  // they may not be able to read, let alone have chosen.
  const waText = encodeURIComponent(interpolate(dict.contact.whatsappGreeting, { nursery: name }));
  const waLink = `https://wa.me/91${whatsapp}?text=${waText}`;
  const { lead, accent } = splitTagline(tagline);
  const trustItems = [dict.home.trustHealthy, dict.home.trustVariety, dict.home.trustAdvice];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface via-background to-background pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Decorative layer — color washes + swaying botanical line art. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hero-float absolute -top-28 -left-28 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="hero-float absolute -bottom-36 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
        <div className="absolute -left-10 bottom-0 hidden -rotate-[20deg] md:block lg:left-4">
          <LeafSprig className="hero-sway h-[24rem] w-auto text-accent/15" />
        </div>
        <div className="absolute -right-10 bottom-0 hidden rotate-[20deg] -scale-x-100 md:block lg:right-4">
          <LeafSprig
            className="hero-sway h-[24rem] w-auto text-accent/15"
            style={{ animationDelay: "-4.5s" }}
          />
        </div>
      </div>

      <div className="relative container mx-auto px-4 text-center max-w-3xl">
        <Reveal
          as="p"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-accent"
        >
          <LeafIcon className="h-4 w-4" />
          {name}
        </Reveal>
        <Reveal
          as="h1"
          index={1}
          className="font-display leading-display mb-5 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {lead && <>{lead} </>}
          <em className="accent-word text-accent italic">{accent}</em>
        </Reveal>
        <Reveal as="p" index={2} className="text-muted text-lg md:text-xl text-balance mb-9">
          {dict.home.heroSubtitle}
        </Reveal>
        <Reveal index={3} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={`/${locale}/catalog`} size="lg">
            {dict.home.browseCatalog}
            <ArrowRightIcon className="rtl-flip h-4 w-4 transition-transform duration-200 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
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
        <Reveal
          index={4}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {trustItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 text-sm text-muted">
              <CheckIcon className="h-4 w-4 shrink-0 text-accent" />
              {item}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
