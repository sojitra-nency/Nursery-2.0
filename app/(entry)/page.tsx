import { LanguageGrid } from "@/components/i18n/LanguageGrid";
import { LeafSprig } from "@/components/ui/botanicals";
import { GlobeIcon } from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { NURSERY_NAME } from "@/lib/constants";

/**
 * First-visit language selection.
 *
 * Reachable in three ways: a genuine first visit, `?change=1` from the header's
 * change-language control, and a crawler (which sees a real, indexable hub linking
 * to all thirteen locales). Anyone with a stored preference is redirected by the
 * blocking script in the layout before this renders.
 *
 * Copy is in English because the visitor's language is precisely what we don't know
 * yet — so the instruction text is kept to a minimum and the work is done by the
 * globe icon and by each card naming itself in its own script.
 */
export default async function ChooseLanguagePage() {
  const [dict, settings] = await Promise.all([getDictionary("en"), getSettings()]);
  const nurseryName = getLocalized(settings.name, "en") || NURSERY_NAME;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <LeafSprig
        className="pointer-events-none absolute -top-8 -left-10 h-48 w-48 text-accent/10"
        aria-hidden="true"
      />
      <LeafSprig
        className="pointer-events-none absolute -right-12 -bottom-10 h-56 w-56 -scale-x-100 text-accent/10"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <GlobeIcon className="h-8 w-8" />
          </span>
          <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">
            {nurseryName}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-balance text-foreground md:text-4xl">
            {dict.language.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{dict.language.hint}</p>
        </header>

        <nav aria-label={dict.language.selectAria}>
          <LanguageGrid mode="root" labels={{ current: dict.language.current }} />
        </nav>
      </div>
    </main>
  );
}
