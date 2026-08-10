import { hasLocale, type Locale } from "./config";

/**
 * The visitor's chosen language, persisted client-side. No account, no login.
 *
 * Stored in two places on purpose:
 *  - `localStorage` is the source of truth, read by the blocking script on `/` to
 *    send returning visitors straight to their language with no flash of the
 *    chooser.
 *  - a cookie mirrors it so the choice can travel with a request the moment the
 *    platform can read one (OpenNext on Cloudflare can't run Next 16's Node-only
 *    proxy today, so nothing server-side consumes it yet — but writing it now
 *    means no migration later, and it survives `localStorage` being cleared by
 *    storage-pressure eviction).
 *
 * Every write is wrapped: private browsing, disabled storage and quota errors
 * must degrade to "language not remembered", never to a broken page.
 */

export const LOCALE_STORAGE_KEY = "nursery-locale";
export const LOCALE_COOKIE_NAME = "nursery-locale";

/** One year — long enough that a seasonal buyer isn't asked twice. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* private mode / storage disabled — the cookie below may still work */
  }
  try {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
  } catch {
    /* ignore */
  }
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (hasLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`));
    const value = match?.[1] && decodeURIComponent(match[1]);
    if (hasLocale(value)) return value;
  } catch {
    /* ignore */
  }
  return null;
}
