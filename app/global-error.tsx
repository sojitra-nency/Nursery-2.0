"use client";

import { useEffect, useSyncExternalStore } from "react";
import { localeMeta, defaultLocale } from "@/lib/i18n/config";
import { localeFromPath } from "@/lib/i18n/localeFromPath";
import {
  subscribeBoundaryMessages,
  getBoundaryMessagesSnapshot,
  getBoundaryMessagesServerSnapshot,
} from "@/lib/i18n/clientMessages";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces the
 * whole document, so it must render its own <html>/<body>, can't rely on the theme
 * stylesheet, and can't read the layout's context — keep it minimal and
 * self-contained.
 *
 * Because there's no layout above it, the locale is recovered from the URL and the
 * catalog is fetched lazily (one small chunk per locale, so the 13 catalogs never
 * enter the main bundle). It paints in English for a frame and then corrects itself
 * — acceptable for a boundary that should never be reached, and far better than
 * maintaining a second hand-written copy of these strings for every language.
 */
/** The URL is fixed for the lifetime of this boundary — read it, don't subscribe. */
const subscribeToNothing = () => () => {};
const getLocaleFromUrl = () => localeFromPath(window.location.pathname);
const getDefaultLocale = () => defaultLocale;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore(subscribeToNothing, getLocaleFromUrl, getDefaultLocale);
  const t = useSyncExternalStore(
    subscribeBoundaryMessages(locale),
    getBoundaryMessagesSnapshot,
    getBoundaryMessagesServerSnapshot
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale} dir={localeMeta(locale).dir}>
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          gap: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 }}>{t.title}</h1>
        <p style={{ color: "#666", maxWidth: "28rem", lineHeight: 1.6 }}>{t.body}</p>
        <button
          onClick={reset}
          style={{
            minHeight: "2.75rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2f7d32",
            color: "#fff",
            fontWeight: 500,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {t.retry}
        </button>
      </body>
    </html>
  );
}
