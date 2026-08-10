import type { Metadata } from "next";
import "../globals.css";
import { geistSans, geistMono, fraunces, allScriptsFontStyle } from "@/lib/fonts";
import { locales } from "@/lib/i18n/config";
import { LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from "@/lib/i18n/preference";
import { getSettings } from "@/lib/site";
import { buildThemeCss } from "@/lib/theme/resolve";
import { AUTO_MODE_SCRIPT } from "@/lib/theme/clientScript";
import { NURSERY_NAME } from "@/lib/constants";

/**
 * Root layout for the language chooser at `/`.
 *
 * A second root layout (route groups `(entry)` / `(site)`) rather than a page
 * inside `[locale]`, because the chooser is deliberately language-neutral: it has
 * no locale segment, no header, no nav, and no `dict` — nothing to translate,
 * because we don't yet know what to translate it into. Crossing between the two
 * groups costs a full document load, which is fine for a once-per-visitor screen.
 */

export const metadata: Metadata = {
  title: `${NURSERY_NAME} — Choose your language`,
  description:
    "Choose your language to browse the Greenskill Landscape plant catalog: English, हिन्दी, বাংলা, मराठी, తెలుగు, தமிழ், ગુજરાતી, اردو, ಕನ್ನಡ, ଓଡ଼ିଆ, മലയാളം, ਪੰਜਾਬੀ, অসমীয়া.",
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: "/",
    // `x-default` is exactly what this page is for: the locale-neutral entry point
    // search engines should show when no hreflang matches the user.
    languages: {
      "x-default": "/",
      ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  },
};

export default async function EntryLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const themeCss = buildThemeCss(settings.theme);
  const mode = settings.theme?.darkMode ?? "auto";
  const forced = mode === "light" || mode === "dark";

  /**
   * Returning visitors skip the chooser entirely.
   *
   * Runs in `<head>` before anything paints, so there's no flash of a screen the
   * visitor already answered. `?change=1` suppresses it — that's the link the
   * header's "change language" control uses to reach this page on purpose.
   *
   * Deliberately localStorage/cookie only: no `Accept-Language` sniffing, so a
   * first-time visitor always gets to choose, and a crawler (which carries neither)
   * always sees the real page rather than a redirect.
   */
  const restoreLocaleScript =
    "(function(){try{" +
    "if(location.search.indexOf('change=1')!==-1)return;" +
    `var ok=${JSON.stringify(locales)};` +
    `var v=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});` +
    "if(!v){var m=document.cookie.match(" +
    `new RegExp('(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)'));` +
    "if(m)v=decodeURIComponent(m[1]);}" +
    "if(v&&ok.indexOf(v)!==-1)location.replace('/'+v+location.hash);" +
    "}catch(e){}})();";

  return (
    <html
      lang="en"
      dir="ltr"
      data-script="latin"
      suppressHydrationWarning
      style={allScriptsFontStyle()}
      {...(forced ? { "data-mode": mode } : {})}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {!forced && <script dangerouslySetInnerHTML={{ __html: AUTO_MODE_SCRIPT }} />}
        <script dangerouslySetInnerHTML={{ __html: restoreLocaleScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
