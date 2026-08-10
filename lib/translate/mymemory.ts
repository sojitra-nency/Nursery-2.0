import { LOCALES, defaultLocale, type Locale } from "@/lib/i18n/config";

/**
 * MyMemory translation — the keyless, ₹0, works-anywhere provider.
 *
 * Used by the Studio's Translate button, which runs in the editor's browser and so
 * cannot hold an API key. Quality is mediocre for Indic pairs (this is the engine
 * that produced the script-mixed Gujarati still visible in the seed data), so treat
 * its output as a **draft to be reviewed**, not a finished translation. For quality
 * output run `npm run translate`, which uses a real engine with the key kept
 * server-side — see `scripts/translate-content.mjs`.
 *
 * Anonymous quota is roughly 1000 words/day per IP, hence the sequential requests
 * and the partial-result contract: one language failing must not discard the
 * eleven that succeeded.
 */

const ENDPOINT = "https://api.mymemory.translated.net/get";

export interface TranslationOutcome {
  locale: Locale;
  text?: string;
  error?: string;
}

async function translateOne(text: string, target: Locale): Promise<string> {
  const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${defaultLocale}|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number | string;
  };

  // MyMemory answers 200 with an error message in the body when the quota is spent,
  // so the payload has to be checked rather than just the status code.
  const status = Number(data.responseStatus);
  if (status && status !== 200) throw new Error(`Provider status ${status}`);

  const translated = data.responseData?.translatedText;
  if (typeof translated !== "string" || translated.trim() === "") {
    throw new Error("Empty translation");
  }
  // The API echoes quota/warning text in the translation slot; don't store that.
  if (/^(MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID)/i.test(translated)) {
    throw new Error(translated.slice(0, 80));
  }
  return translated;
}

/**
 * Translate English into each target, sequentially, never rejecting.
 *
 * Returns one outcome per target so the caller can write the successes and report
 * the failures — the previous implementation used `Promise.all`, where a single
 * rejection threw away every translation in the batch.
 */
export async function translateToLocales(
  text: string,
  targets: readonly Locale[]
): Promise<TranslationOutcome[]> {
  const outcomes: TranslationOutcome[] = [];
  for (const locale of targets) {
    try {
      outcomes.push({ locale, text: await translateOne(text, locale) });
    } catch (err) {
      outcomes.push({ locale, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return outcomes;
}

/** Every locale except the English source. */
export const TRANSLATABLE_LOCALES: Locale[] = LOCALES.map((l) => l.code as Locale).filter(
  (code) => code !== defaultLocale
);
