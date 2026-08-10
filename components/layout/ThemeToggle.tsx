"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme/clientScript";
import { SunIcon, MoonIcon } from "@/components/ui/icons";

/** Subscribe to `data-mode` changes on <html> + system preference changes. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });

  // Follow the OS while the visitor hasn't made an explicit choice.
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      document.documentElement.dataset.mode = mql.matches ? "dark" : "light";
    }
    onChange();
  };
  mql.addEventListener("change", onSystem);

  return () => {
    observer.disconnect();
    mql.removeEventListener("change", onSystem);
  };
}

const getSnapshot = () => document.documentElement.dataset.mode === "dark";
const getServerSnapshot = () => false; // SSR renders the light-default (moon) icon

/**
 * Icon-only light/dark toggle. The effective mode is set on <html> before paint by
 * the blocking script in the layout; this button reflects it (via
 * useSyncExternalStore, so there's no setState-in-effect and no hydration mismatch)
 * and flips it on click.
 */
export function ThemeToggle({ label }: { label: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = document.documentElement.dataset.mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.mode = next; // MutationObserver → re-render
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore (private mode / storage disabled) */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      className="link-focus tap-target inline-flex cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
    >
      {isDark ? (
        // Sun — click to go light
        <SunIcon className="h-5 w-5" />
      ) : (
        // Moon — click to go dark
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
