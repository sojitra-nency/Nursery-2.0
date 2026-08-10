"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { persistLocale } from "@/lib/i18n/preference";
import { CheckIcon } from "@/components/ui/icons";

interface LanguageGridProps {
  /** Marks the active card. Absent on the first-visit chooser — nothing is chosen yet. */
  currentLocale?: Locale;
  /**
   * `root` links to `/<code>` (the entry chooser).
   * `swap` rewrites the locale segment of the current path, so switching language
   * from a plant page lands on the same plant.
   */
  mode: "root" | "swap";
  labels: { current: string };
  /** Lets a containing dialog close itself once a choice is made. */
  onChoose?: () => void;
}

/**
 * The language chooser, shared by the first-visit screen at `/` and the
 * change-language dialog in the header — one component so the two can never drift
 * apart.
 *
 * Design notes, all driven by the low-digital-literacy audience:
 *  - Each language is labelled in **its own script**, at display size. That is the
 *    only cue a non-English reader can act on, so it leads. The English name sits
 *    underneath in small type for bilingual dealers.
 *  - No flags. Flags are countries, not languages: twelve of these thirteen share
 *    one flag, and using it would be both useless and politically wrong.
 *  - Every card is identical — no "suggested" or "recommended" marker. Thirteen
 *    interchangeable tiles are scanned by shape; one decorated tile pulls the eye
 *    and quietly nudges people toward a language they didn't pick.
 *  - Real `<a>` elements, so the grid is keyboard- and screen-reader-navigable and
 *    still works with JavaScript disabled (the preference simply isn't saved).
 *  - Cards are ≥ 4.5rem tall with generous padding — comfortably above the 44px
 *    touch-target floor for thumbs on a phone.
 */
export function LanguageGrid({ currentLocale, mode, labels, onChoose }: LanguageGridProps) {
  const pathname = usePathname();
  const router = useRouter();

  function hrefFor(code: Locale): string {
    if (mode === "root") return `/${code}`;
    const segments = pathname.split("/");
    segments[1] = code;
    return segments.join("/") || `/${code}`;
  }

  function handleChoose(event: React.MouseEvent<HTMLAnchorElement>, code: Locale) {
    persistLocale(code);
    onChoose?.();

    // Preserve the query string (catalog search/filters/sort) across a language
    // change. Read at click time rather than via `useSearchParams`, which would
    // opt every page containing the picker out of static rendering.
    const search = typeof window === "undefined" ? "" : window.location.search;
    if (search && mode === "swap") {
      event.preventDefault();
      router.push(hrefFor(code) + search);
    }
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {LOCALES.map((meta) => {
        const code = meta.code as Locale;
        const isCurrent = code === currentLocale;

        return (
          <li key={code}>
            <Link
              href={hrefFor(code)}
              hrefLang={code}
              lang={code}
              dir={meta.dir}
              aria-current={isCurrent ? "true" : undefined}
              onClick={(event) => handleChoose(event, code)}
              className={`link-focus flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-4 text-center transition-colors ${
                isCurrent
                  ? "border-accent bg-accent text-on-accent shadow-soft"
                  : "border-border bg-surface text-foreground hover:border-accent hover:bg-accent/5"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isCurrent && <CheckIcon className="h-4 w-4 shrink-0" />}
                {/* `text-xl` with normal leading: Indic matras and Arabic joins need
                    the headroom, and the label must stay readable at arm's length. */}
                <span className="text-xl leading-snug font-semibold">{meta.nativeName}</span>
              </span>
              <span
                lang="en"
                dir="ltr"
                className={`text-xs ${isCurrent ? "text-on-accent/80" : "text-muted"}`}
              >
                {meta.englishName}
              </span>
              {isCurrent && <span className="sr-only">{labels.current}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
