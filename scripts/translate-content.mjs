/**
 * Fill every empty locale field in Sanity from its English value.
 *
 * This is the "author once in English, get all thirteen languages" workflow. It
 * walks every localized field on every plant and on siteSettings, translates only
 * the blanks, and never touches text that already exists — so anything corrected by
 * hand survives every future run.
 *
 *   node scripts/translate-content.mjs                  dry run (default)
 *   node scripts/translate-content.mjs --commit         write to the dataset
 *   node scripts/translate-content.mjs --locales=ta,ml  restrict to some languages
 *   node scripts/translate-content.mjs --limit=1        just the first document
 *   node scripts/translate-content.mjs --force          also replace existing text
 *
 * Requires SANITY_API_EDIT_TOKEN for --commit. Choose the engine with
 * TRANSLATE_PROVIDER (see scripts/lib/providers.mjs); the default needs no key.
 *
 * BACK UP FIRST:  npx sanity dataset export production ./backup.tar.gz
 */
import { createClient } from "next-sanity";
import { config } from "dotenv";
import { getProvider } from "./lib/providers.mjs";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const FORCE = args.includes("--force");
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const ONLY_LOCALES = args
  .find((a) => a.startsWith("--locales="))
  ?.split("=")[1]
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Mirrors lib/i18n/config.ts. Kept as literals because this is a plain Node script. */
const ALL_TARGETS = ["hi", "bn", "mr", "te", "ta", "gu", "ur", "kn", "or", "ml", "pa", "as"];
const TARGETS = ONLY_LOCALES?.length
  ? ALL_TARGETS.filter((code) => ONLY_LOCALES.includes(code))
  : ALL_TARGETS;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

/**
 * Every localized field, as a path into the document. Array items are addressed by
 * `_key` so a patch stays correct even if the array is reordered between the read
 * and the write.
 */
const FIELD_PATHS = {
  plant: (doc) => {
    const paths = ["name", "description", "careTips"];
    (doc.images ?? []).forEach((img) => {
      if (img?._key)
        paths.push(`images[_key=="${img._key}"].alt`, `images[_key=="${img._key}"].caption`);
    });
    (doc.varieties ?? []).forEach((variety) => {
      if (!variety?._key) return;
      const base = `varieties[_key=="${variety._key}"]`;
      paths.push(`${base}.name`, `${base}.description`);
      (variety.images ?? []).forEach((img) => {
        if (img?._key)
          paths.push(
            `${base}.images[_key=="${img._key}"].alt`,
            `${base}.images[_key=="${img._key}"].caption`
          );
      });
    });
    paths.push("seo.metaTitle", "seo.metaDescription");
    return paths;
  },
  siteSettings: () => [
    "name",
    "tagline",
    "description",
    "address",
    "city",
    "region",
    "hoursNote",
    "defaultSeo.metaTitle",
    "defaultSeo.metaDescription",
  ],
};

/** Read a value at a `foo.bar[_key=="x"].baz` path. */
function readPath(doc, path) {
  let node = doc;
  for (const segment of path.split(".")) {
    if (node == null) return undefined;
    const keyed = segment.match(/^(\w+)\[_key=="([^"]+)"\]$/);
    if (keyed) {
      const [, field, key] = keyed;
      node = (node[field] ?? []).find((item) => item?._key === key);
    } else {
      node = node[segment];
    }
  }
  return node;
}

const isBlank = (value) => typeof value !== "string" || value.trim() === "";

async function run() {
  const provider = getProvider();
  console.log(`\n${COMMIT ? "APPLYING" : "DRY RUN"} — content translation`);
  console.log(`  provider : ${provider.name}`);
  console.log(`  languages: ${TARGETS.join(", ")}`);
  console.log(`  mode     : ${FORCE ? "replace ALL translations" : "fill blanks only"}\n`);

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set — nothing to do.");
    process.exit(1);
  }
  if (COMMIT && !process.env.SANITY_API_EDIT_TOKEN) {
    console.error("SANITY_API_EDIT_TOKEN is required for --commit.");
    process.exit(1);
  }

  const docs = await client.fetch(
    `*[_type in ["plant", "siteSettings"]] | order(_type asc, _createdAt asc)`
  );
  const targets = LIMIT > 0 ? docs.slice(0, LIMIT) : docs;

  let fieldsTouched = 0;
  let valuesWritten = 0;

  for (const doc of targets) {
    const paths = FIELD_PATHS[doc._type]?.(doc) ?? [];
    const patch = {};
    const label = doc.name?.en ?? doc.title?.en ?? doc._type;
    let docLines = [];

    for (const path of paths) {
      const field = readPath(doc, path);
      const source = field?.en;
      if (isBlank(source)) continue;

      const missing = TARGETS.filter((code) => FORCE || isBlank(field?.[code]));
      if (missing.length === 0) continue;

      fieldsTouched += 1;
      docLines.push(`  ${path}  →  ${missing.join(", ")}`);

      if (!COMMIT) continue;

      const translations = await provider.translate(source, missing);
      for (const [code, text] of Object.entries(translations)) {
        patch[`${path}.${code}`] = text;
        valuesWritten += 1;
      }
    }

    if (docLines.length === 0) continue;

    console.log(`\n${doc._type}: ${label}`);
    docLines.forEach((line) => console.log(line));

    if (COMMIT && Object.keys(patch).length > 0) {
      await client.patch(doc._id).set(patch).commit();
      console.log(`  ✓ wrote ${Object.keys(patch).length} values`);
    }
  }

  console.log(
    `\n${COMMIT ? "Done" : "Dry run complete"} — ${fieldsTouched} field(s) need translation` +
      (COMMIT ? `, ${valuesWritten} value(s) written.` : ".")
  );
  if (!COMMIT && fieldsTouched > 0) {
    console.log("Re-run with --commit to write these to the dataset.\n");
  }
  console.log(
    "Machine translation: have a native speaker review before publishing, and re-run\n" +
      "safely at any time — existing text is never overwritten without --force.\n"
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
