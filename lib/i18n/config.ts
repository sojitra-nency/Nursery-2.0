/**
 * The single source of truth for every locale the site supports.
 *
 * Everything locale-shaped derives from `LOCALES`: routing (`generateStaticParams`),
 * the language picker, Sanity's localized field sets, hreflang alternates, the
 * sitemap, per-script font selection and `dir`. Adding a language means adding one
 * row here plus a `messages/<code>.json` — nothing else hard-codes a locale list.
 *
 * Scope: English + the 12 most widely spoken Indian languages. English is the
 * internal/default language (authored first in the CMS, and the fallback every
 * other locale resolves against).
 */

/** Writing systems we support, used to pick a script-appropriate webfont. */
export type LocaleScript =
  | "latin"
  | "devanagari"
  | "bengali"
  | "gujarati"
  | "gurmukhi"
  | "kannada"
  | "malayalam"
  | "odia"
  | "tamil"
  | "telugu"
  | "arabic";

export interface LocaleMeta {
  /** ISO 639-1 code — also the URL segment (`/ta/catalog`) and the hreflang value. */
  code: string;
  /**
   * The language's own name in its own script. This is the primary label in the
   * picker: a Tamil speaker recognises "தமிழ்" instantly, and never "Tamil".
   */
  nativeName: string;
  /** English name, shown as a small secondary label (helps bilingual dealers). */
  englishName: string;
  script: LocaleScript;
  dir: "ltr" | "rtl";
  /**
   * BCP-47 tag for `Intl.*`. `-u-nu-latn` pins Latin digits everywhere: modern
   * Indian usage writes prices and quantities in ASCII numerals, and mixing
   * numeral systems is a real readability problem for low-literacy users.
   */
  intl: string;
}

export const LOCALES = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    script: "latin",
    dir: "ltr",
    intl: "en-IN",
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    script: "devanagari",
    dir: "ltr",
    intl: "hi-IN-u-nu-latn",
  },
  {
    code: "bn",
    nativeName: "বাংলা",
    englishName: "Bengali",
    script: "bengali",
    dir: "ltr",
    intl: "bn-IN-u-nu-latn",
  },
  {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    script: "devanagari",
    dir: "ltr",
    intl: "mr-IN-u-nu-latn",
  },
  {
    code: "te",
    nativeName: "తెలుగు",
    englishName: "Telugu",
    script: "telugu",
    dir: "ltr",
    intl: "te-IN-u-nu-latn",
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    script: "tamil",
    dir: "ltr",
    intl: "ta-IN-u-nu-latn",
  },
  {
    code: "gu",
    nativeName: "ગુજરાતી",
    englishName: "Gujarati",
    script: "gujarati",
    dir: "ltr",
    intl: "gu-IN-u-nu-latn",
  },
  {
    code: "ur",
    nativeName: "اردو",
    englishName: "Urdu",
    script: "arabic",
    dir: "rtl",
    intl: "ur-IN-u-nu-latn",
  },
  {
    code: "kn",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
    script: "kannada",
    dir: "ltr",
    intl: "kn-IN-u-nu-latn",
  },
  {
    code: "or",
    nativeName: "ଓଡ଼ିଆ",
    englishName: "Odia",
    script: "odia",
    dir: "ltr",
    intl: "or-IN-u-nu-latn",
  },
  {
    code: "ml",
    nativeName: "മലയാളം",
    englishName: "Malayalam",
    script: "malayalam",
    dir: "ltr",
    intl: "ml-IN-u-nu-latn",
  },
  {
    code: "pa",
    nativeName: "ਪੰਜਾਬੀ",
    englishName: "Punjabi",
    script: "gurmukhi",
    dir: "ltr",
    intl: "pa-IN-u-nu-latn",
  },
  {
    code: "as",
    nativeName: "অসমীয়া",
    englishName: "Assamese",
    script: "bengali",
    dir: "ltr",
    intl: "as-IN-u-nu-latn",
  },
] as const satisfies readonly LocaleMeta[];

export type Locale = (typeof LOCALES)[number]["code"];

/** Locale codes in picker/route order (English first, then by speaker count). */
export const locales: readonly Locale[] = LOCALES.map((l) => l.code);

export const defaultLocale: Locale = "en";

const BY_CODE = new Map<string, LocaleMeta>(LOCALES.map((l) => [l.code, l]));

export function hasLocale(locale: string | undefined | null): locale is Locale {
  return !!locale && BY_CODE.has(locale);
}

/** Metadata for a locale, falling back to English for unknown codes. */
export function localeMeta(locale: string): LocaleMeta {
  return BY_CODE.get(locale) ?? BY_CODE.get(defaultLocale)!;
}

/** Text direction for a locale — only Urdu is RTL in this set. */
export function dirFor(locale: string): "ltr" | "rtl" {
  return localeMeta(locale).dir;
}

/** BCP-47 tag for `Intl.NumberFormat` / `Intl.DateTimeFormat`. */
export function intlLocale(locale: string): string {
  return localeMeta(locale).intl;
}

/**
 * Native language names keyed by code — the shape most call sites want.
 */
export const localeNames = Object.fromEntries(LOCALES.map((l) => [l.code, l.nativeName])) as Record<
  Locale,
  string
>;
