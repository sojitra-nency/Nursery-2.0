/**
 * Report suspicious translations in the live Sanity dataset. **Read-only** — this
 * script never writes, so it is safe to run against production at any time.
 *
 *   node scripts/check-translations.mjs
 *   node scripts/check-translations.mjs --locales=gu,hi
 *
 * It exists because machine translation fails in ways that are invisible unless you
 * read the script: the dataset seeded with the old keyless engine contains Gujarati
 * fields holding romanised Latin ("UpperMost 2 inch sukha tyanej paani"), untouched
 * English ("Marble Queen"), and single tokens mixing three scripts ("લૉरेntI").
 * None of that is detectable by eye unless you happen to read Gujarati.
 *
 * Checks per field:
 *   MISSING     no text for this locale (harmless — the site falls back to English)
 *   UNTRANSLATED identical to the English source
 *   WRONG_SCRIPT mostly Latin letters where the locale's own script is expected
 *   MIXED_SCRIPT contains letters from a third Indic script
 */
import { createClient } from "next-sanity";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const args = process.argv.slice(2);
const ONLY = args
  .find((a) => a.startsWith("--locales="))
  ?.split("=")[1]
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Unicode block per writing system, mirroring the `script` field in lib/i18n/config.ts. */
const SCRIPT_RANGES = {
  devanagari: /[ऀ-ॿ]/g,
  bengali: /[ঀ-৿]/g,
  gurmukhi: /[਀-੿]/g,
  gujarati: /[઀-૿]/g,
  odia: /[଀-୿]/g,
  tamil: /[஀-௿]/g,
  telugu: /[ఀ-౿]/g,
  kannada: /[ಀ-೿]/g,
  malayalam: /[ഀ-ൿ]/g,
  arabic: /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g,
};

const LOCALE_SCRIPT = {
  hi: "devanagari",
  mr: "devanagari",
  bn: "bengali",
  as: "bengali",
  gu: "gujarati",
  pa: "gurmukhi",
  or: "odia",
  ta: "tamil",
  te: "telugu",
  kn: "kannada",
  ml: "malayalam",
  ur: "arabic",
};

const LOCALES = Object.keys(LOCALE_SCRIPT).filter((code) => !ONLY?.length || ONLY.includes(code));

/** Brand and product names legitimately written in Latin inside translated text. */
const ALLOWED_LATIN = /WhatsApp|Greenskill|Landscape|UPI|SMS|https?:\/\/\S+/gi;

const count = (text, re) => (text.match(re) ?? []).length;

function inspect(source, value, locale) {
  if (typeof value !== "string" || value.trim() === "") return "MISSING";
  if (value.trim() === source.trim()) return "UNTRANSLATED";

  const stripped = value.replace(ALLOWED_LATIN, "");
  const expected = SCRIPT_RANGES[LOCALE_SCRIPT[locale]];
  const native = count(stripped, expected);
  const latin = count(stripped, /[A-Za-z]/g);

  // Latin outnumbering the locale's own script means romanised or untranslated text.
  if (native === 0 || latin > native) return "WRONG_SCRIPT";

  const foreign = Object.entries(SCRIPT_RANGES)
    .filter(([name]) => name !== LOCALE_SCRIPT[locale] && name !== "arabic")
    .filter(([, re]) => count(stripped, re) > 0)
    .map(([name]) => name);
  if (foreign.length > 0) return `MIXED_SCRIPT (${foreign.join(", ")})`;

  return null;
}

function walk(node, path, out) {
  if (node == null || typeof node !== "object") return;

  if (typeof node.en === "string" && node.en.trim() !== "") {
    for (const locale of LOCALES) {
      const verdict = inspect(node.en, node[locale], locale);
      if (verdict && verdict !== "MISSING") {
        out.push({ path, locale, verdict, en: node.en, value: node[locale] });
      }
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, out));
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("_")) continue;
    walk(child, path ? `${path}.${key}` : key, out);
  }
}

async function run() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set — nothing to check.");
    process.exit(1);
  }

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    // No token and no writes: this is a read-only audit of published content.
    useCdn: false,
  });

  const docs = await client.fetch(`*[_type in ["plant", "siteSettings"]]`);
  console.log(`\nScanning ${docs.length} document(s) across ${LOCALES.length} language(s)…\n`);

  let total = 0;
  for (const doc of docs) {
    const findings = [];
    walk(doc, "", findings);
    if (findings.length === 0) continue;

    total += findings.length;
    console.log(`${doc._type}: ${doc.name?.en ?? doc._id}`);
    for (const f of findings) {
      console.log(`  [${f.verdict}] ${f.path}.${f.locale}`);
      console.log(`      en: ${JSON.stringify(f.en.slice(0, 70))}`);
      console.log(`      ${f.locale}: ${JSON.stringify(String(f.value).slice(0, 70))}`);
    }
    console.log("");
  }

  if (total === 0) {
    console.log("No suspicious translations found.\n");
  } else {
    console.log(
      `${total} suspicious value(s).\n\n` +
        "To re-translate them, clear the bad fields in the Studio (or run with --force)\n" +
        "and then: node scripts/translate-content.mjs --commit\n"
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
