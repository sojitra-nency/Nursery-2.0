"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import { LanguageGrid } from "@/components/i18n/LanguageGrid";
import { GlobeIcon, XIcon } from "@/components/ui/icons";

interface LanguagePickerProps {
  locale: Locale;
  labels: {
    /** Accessible name for the trigger, e.g. "Language". */
    language: string;
    /** Dialog heading, e.g. "Choose your language". */
    title: string;
    change: string;
    current: string;
    close: string;
  };
}

/**
 * The always-visible "change language" control in the header.
 *
 * Replaces the previous three-pill segmented switcher, which does not scale to
 * thirteen languages and whose pills were ~24px tall — the smallest touch target
 * in the app. This is a 44px trigger that opens the same `LanguageGrid` the
 * first-visit screen uses.
 *
 * It sits at the top level of the header at every breakpoint rather than inside the
 * hamburger menu: a visitor who cannot read the current language must not have to
 * find and interpret a menu icon first.
 *
 * Built on native `<dialog>` + `showModal()`, which gives correct modal semantics
 * for free — focus is trapped, Escape closes, focus returns to the trigger, and the
 * rest of the page is inert to assistive tech. Backdrop-click-to-close and a
 * visible close button are added on top for touch users.
 */
export function LanguagePicker({ locale, labels }: LanguagePickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const meta = localeMeta(locale);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  // Keep React state in step with the element, which can also be closed by Escape
  // or by the browser without going through our handlers.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${labels.language}: ${meta.nativeName}. ${labels.change}`}
        className="link-focus tap-target inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <GlobeIcon className="h-5 w-5 shrink-0" />
        {/* The current language, in its own script — the label a visitor who can't
            read the interface language still recognises. `max-w` + truncate keeps a
            long name from pushing the header nav off-screen. */}
        <span
          lang={locale}
          dir={meta.dir}
          className="max-w-[7ch] truncate text-sm font-medium sm:max-w-none"
        >
          {meta.nativeName}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={labels.title}
        onClick={(event) => {
          // Only a click on the backdrop itself — the dialog box is a child element.
          if (event.target === dialogRef.current) close();
        }}
        className="lang-dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">{labels.title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="link-focus tap-target -me-2 -mt-2 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <LanguageGrid
            mode="swap"
            currentLocale={locale}
            labels={{ current: labels.current }}
            onChoose={close}
          />
        </div>
      </dialog>
    </>
  );
}
