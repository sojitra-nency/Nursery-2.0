"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nursery-theme";

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
    if (!localStorage.getItem(STORAGE_KEY)) {
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
 * the blocking script in layout.tsx; this button reflects it (via useSyncExternalStore,
 * so there's no setState-in-effect and no hydration mismatch) and flips it on click.
 */
export function ThemeToggle({ label }: { label: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = document.documentElement.dataset.mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.mode = next; // MutationObserver → re-render
    try {
      localStorage.setItem(STORAGE_KEY, next);
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
      className="link-focus inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
    >
      {isDark ? (
        // Sun — click to go light
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon — click to go dark
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
