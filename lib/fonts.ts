import {
  Geist,
  Geist_Mono,
  Fraunces,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Arabic,
} from "next/font/google";
import type { LocaleScript } from "@/lib/i18n/config";

/**
 * Fonts, split by writing system.
 *
 * Geist and Fraunces are Latin-only, so before this existed every Devanagari,
 * Bengali, Tamil, Telugu, Gujarati, Kannada, Odia, Malayalam, Gurmukhi and Arabic
 * character fell through to whatever the visitor's OS happened to ship — different
 * on every Android build, unstyled by the design system, and frequently missing
 * glyphs outright.
 *
 * Each non-Latin locale gets a matching Noto face, requested with **only its own
 * script subset**. Latin runs inside Indic text (brand names, "WhatsApp", digits,
 * ₹) therefore still fall through to Geist, which keeps one consistent Latin voice
 * across all 13 locales. `--font-script` is the hand-off: the layout sets it to the
 * active locale's family and the `--font-sans` / `--font-display` stacks in
 * globals.css consume it.
 *
 * `preload: false` is deliberate — declaring ten families would otherwise emit ten
 * `<link rel="preload">` tags on every page. Only the @font-face rules ship (a few
 * hundred bytes of CSS each); browsers download a face only when text actually
 * uses it, so a Tamil visitor fetches exactly one Indic font.
 *
 * Urdu uses Noto Sans Arabic (naskh) rather than Nastaliq: Nastaliq's steep
 * diagonal baseline needs roughly double line-height and overflows dense mobile
 * controls, and legibility at button/label sizes matters more here than
 * calligraphic tradition.
 */

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

// `next/font` is a compile-time transform and only accepts fully literal
// arguments — no spreads, no shared options object.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
});
const notoBengali = Noto_Sans_Bengali({ subsets: ["bengali"], display: "swap", preload: false });
const notoGujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], display: "swap", preload: false });
const notoGurmukhi = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], display: "swap", preload: false });
const notoKannada = Noto_Sans_Kannada({ subsets: ["kannada"], display: "swap", preload: false });
const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  display: "swap",
  preload: false,
});
const notoOdia = Noto_Sans_Oriya({ subsets: ["oriya"], display: "swap", preload: false });
const notoTamil = Noto_Sans_Tamil({ subsets: ["tamil"], display: "swap", preload: false });
const notoTelugu = Noto_Sans_Telugu({ subsets: ["telugu"], display: "swap", preload: false });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], display: "swap", preload: false });

/** `font-family` value for a script, or `null` for Latin (Geist already covers it). */
const SCRIPT_FAMILY: Record<LocaleScript, string | null> = {
  latin: null,
  devanagari: notoDevanagari.style.fontFamily,
  bengali: notoBengali.style.fontFamily,
  gujarati: notoGujarati.style.fontFamily,
  gurmukhi: notoGurmukhi.style.fontFamily,
  kannada: notoKannada.style.fontFamily,
  malayalam: notoMalayalam.style.fontFamily,
  odia: notoOdia.style.fontFamily,
  tamil: notoTamil.style.fontFamily,
  telugu: notoTelugu.style.fontFamily,
  arabic: notoArabic.style.fontFamily,
};

/**
 * The `--font-script` custom property for a locale's script, ready to spread onto
 * an element's `style`. Returns `undefined` for Latin so the CSS default applies.
 */
export function scriptFontStyle(script: LocaleScript): React.CSSProperties | undefined {
  const family = SCRIPT_FAMILY[script];
  return family ? ({ "--font-script": family } as React.CSSProperties) : undefined;
}

/**
 * Every non-Latin family at once — for the language chooser, the single page that
 * renders all thirteen scripts side by side.
 *
 * This is the one place the payload is worth it: a visitor whose device lacks a
 * font for their script would otherwise see tofu boxes on exactly the card they
 * need. `display: swap` keeps it non-blocking, the page carries no images, and a
 * returning visitor never loads it again (the stored preference redirects first).
 */
export function allScriptsFontStyle(): React.CSSProperties {
  const families = Object.values(SCRIPT_FAMILY).filter((f): f is string => f !== null);
  return { "--font-script": families.join(", ") } as React.CSSProperties;
}
