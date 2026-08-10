/**
 * Translation providers for the content backfill (`scripts/translate-content.mjs`).
 *
 * All three are free. They live in a Node-only script — never in the Studio bundle
 * or the browser — so the keyed ones can hold their credentials safely.
 *
 * Pick with TRANSLATE_PROVIDER in `.env`:
 *
 *   gemini    Google AI Studio free tier. Needs GEMINI_API_KEY (aistudio.google.com,
 *             no credit card). Best quality by a wide margin: being an LLM it takes
 *             the glossary and tone instructions below, so "Bag Size" comes out as
 *             real nursery vocabulary rather than a literal word swap, and all
 *             twelve languages come back from one request.
 *
 *   bhashini  Govt. of India (ULCA). Needs BHASHINI_USER_ID, BHASHINI_API_KEY and
 *             BHASHINI_PIPELINE_KEY from bhashini.gov.in. Purpose-built IndicTrans2
 *             models — the strongest free engine for Indic pairs specifically, but
 *             one request per language and no glossary control.
 *
 *   mymemory  Keyless fallback, same engine as the Studio button. No setup at all,
 *             but visibly poor on Indic pairs and capped around 1000 words/day.
 *             This is what produced the mangled Gujarati in the old seed data.
 */

/** Terms a general-purpose engine reliably gets wrong in a plant-nursery context. */
const GLOSSARY = [
  '"plant" is a living plant sold at a nursery, never a factory',
  '"bag size" is the poly-bag / grow-bag the sapling is potted in, given in inches',
  '"variety" is a cultivar of the same species, not "assortment"',
  '"nursery" is a plant nursery (garden centre), not a childcare nursery',
  '"in stock" / "out of stock" are availability labels for a shop listing',
  '"full sun" / "partial shade" / "bright indirect" are light requirements',
  '"growth rate" is how fast the plant grows',
  '"flowering season" is the months in which the plant blooms',
];

const SYSTEM_INSTRUCTION = `You translate copy for an Indian plant-nursery catalogue.

Audience: nursery dealers, farmers and home plant buyers, many with limited formal
education. Use plain, everyday words that a shopkeeper would say out loud — not
literary or Sanskritised register, and not English words in local script when a
common native word exists.

Rules:
- Keep it about as short as the English. These strings sit in buttons and labels.
- Keep brand names in Latin script: WhatsApp, Greenskill Landscape.
- Keep numbers, measurements and ₹ amounts exactly as given.
- Preserve any {placeholder} tokens verbatim, including the braces.
- Do not add, explain or omit anything.

Glossary:
${GLOSSARY.map((g) => `- ${g}`).join("\n")}`;

const LANGUAGE_NAMES = {
  hi: "Hindi",
  bn: "Bengali",
  mr: "Marathi",
  te: "Telugu",
  ta: "Tamil",
  gu: "Gujarati",
  ur: "Urdu",
  kn: "Kannada",
  or: "Odia",
  ml: "Malayalam",
  pa: "Punjabi",
  as: "Assamese",
};

/* ── Gemini (Google AI Studio free tier) ──────────────────────────────────── */

async function geminiTranslate(text, targets) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const wanted = targets.map((t) => `${t} (${LANGUAGE_NAMES[t] ?? t})`).join(", ");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Translate the text below into: ${wanted}.\n\nReturn ONLY a JSON object whose keys are the language codes and whose values are the translations.\n\nText:\n${text}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned no content");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Gemini returned non-JSON: ${String(raw).slice(0, 200)}`);
  }

  const out = {};
  for (const target of targets) {
    const value = parsed[target];
    if (typeof value === "string" && value.trim()) out[target] = value.trim();
  }
  return out;
}

/* ── Bhashini (ULCA, Government of India) ─────────────────────────────────── */

async function bhashiniOne(text, target) {
  const userId = process.env.BHASHINI_USER_ID;
  const apiKey = process.env.BHASHINI_API_KEY;
  const pipelineKey = process.env.BHASHINI_PIPELINE_KEY;
  const endpoint =
    process.env.BHASHINI_ENDPOINT ||
    "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";
  if (!userId || !apiKey || !pipelineKey) {
    throw new Error("BHASHINI_USER_ID, BHASHINI_API_KEY and BHASHINI_PIPELINE_KEY must all be set");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      userID: userId,
      ulcaApiKey: apiKey,
      Authorization: pipelineKey,
    },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: { sourceLanguage: "en", targetLanguage: target },
          },
        },
      ],
      inputData: { input: [{ source: text }] },
    }),
  });

  if (!res.ok) {
    throw new Error(`Bhashini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  const value = data?.pipelineResponse?.[0]?.output?.[0]?.target;
  if (typeof value !== "string" || !value.trim()) throw new Error("Bhashini returned no text");
  return value.trim();
}

async function bhashiniTranslate(text, targets) {
  const out = {};
  for (const target of targets) {
    try {
      out[target] = await bhashiniOne(text, target);
    } catch (err) {
      console.warn(`    ! ${target}: ${err.message}`);
    }
  }
  return out;
}

/* ── MyMemory (keyless fallback) ──────────────────────────────────────────── */

async function myMemoryTranslate(text, targets) {
  const out = {};
  for (const target of targets) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${target}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const status = Number(data?.responseStatus);
      if (status && status !== 200) throw new Error(`status ${status}`);
      const value = data?.responseData?.translatedText;
      if (typeof value !== "string" || !value.trim()) throw new Error("empty");
      if (/^(MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID)/i.test(value)) {
        throw new Error(value.slice(0, 80));
      }
      out[target] = value.trim();
    } catch (err) {
      console.warn(`    ! ${target}: ${err.message}`);
    }
  }
  return out;
}

const PROVIDERS = {
  gemini: { translate: geminiTranslate, batched: true },
  bhashini: { translate: bhashiniTranslate, batched: false },
  mymemory: { translate: myMemoryTranslate, batched: false },
};

export function getProvider(name = process.env.TRANSLATE_PROVIDER || "mymemory") {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `Unknown TRANSLATE_PROVIDER "${name}". Expected one of: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  return { name, ...provider };
}

export { LANGUAGE_NAMES };
