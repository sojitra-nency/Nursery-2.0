import { locales, defaultLocale, type Locale } from "./config";

/**
 * Derive the active locale from a pathname like `/hi/plants/rose`.
 * Used by client boundary components (error/not-found) that can't receive params.
 */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  return (locales as readonly string[]).includes(seg) ? (seg as Locale) : defaultLocale;
}
