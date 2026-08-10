/**
 * One-time migration: restructure plants for the simplified admin model.
 *
 *  - Resolves each plant's `category` reference (and any `collections`) into the
 *    new `categories` string array.
 *  - Moves the plant-level care fields + images into a single default `variety`.
 *  - Removes the old fields (category, collections, availability, sunlight,
 *    watering, growthRate, size, floweringSeason, commerce fields).
 *  - Deletes the now-orphaned category / subcategory / collection documents.
 *
 * BACK UP FIRST:  pnpm sanity dataset export production ./backup.tar.gz
 * Then run:       node scripts/migrate-plants.mjs            (dry run)
 *                 node scripts/migrate-plants.mjs --commit   (apply)
 */
import { createClient } from "next-sanity";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env" });

const COMMIT = process.argv.includes("--commit");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
});

const CARE_FIELDS = [
  "availability",
  "sunlight",
  "watering",
  "growthRate",
  "size",
  "floweringSeason",
];
const COMMERCE_FIELDS = ["priceMinor", "salePriceMinor", "stockQuantity"];

async function run() {
  console.log(`\n${COMMIT ? "APPLYING" : "DRY RUN"} — plant migration\n`);

  // Build a map of category/collection _id -> English title.
  const taxonomies = await client.fetch(
    `*[_type in ["category", "collection"]]{ _id, "title": coalesce(title.en, title) }`
  );
  const titleById = Object.fromEntries(taxonomies.map((t) => [t._id, t.title]));

  const plants = await client.fetch(
    `*[_type == "plant"]{
      _id, name, category, collections,
      availability, sunlight, watering, growthRate, size, floweringSeason,
      priceMinor, salePriceMinor, stockQuantity,
      images
    }`
  );

  let migrated = 0;
  for (const plant of plants) {
    // Already migrated? (no legacy category/collections fields)
    if (!plant.category && !plant.collections && !plant.availability && !plant.size) {
      continue;
    }

    const categories = [];
    if (plant.category?._ref && titleById[plant.category._ref]) {
      categories.push(titleById[plant.category._ref]);
    }
    for (const c of plant.collections ?? []) {
      const title = titleById[c?._ref];
      if (title && !categories.includes(title)) categories.push(title);
    }

    const variety = {
      _key: randomUUID().slice(0, 12),
      _type: "variety",
      name: plant.name ?? undefined,
      availability: plant.availability ?? "in_stock",
      sunlight: plant.sunlight,
      watering: plant.watering,
      growthRate: plant.growthRate,
      sizeRange: plant.size,
      bloomSeason: plant.floweringSeason,
      priceMinor: plant.priceMinor,
      salePriceMinor: plant.salePriceMinor,
      images: plant.images,
    };
    // Drop undefined keys.
    Object.keys(variety).forEach((k) => variety[k] === undefined && delete variety[k]);

    console.log(
      `• ${plant.name?.en ?? plant._id}  →  categories: [${categories.join(", ")}], 1 variety`
    );

    if (COMMIT) {
      await client
        .patch(plant._id)
        .set({ categories, varieties: [variety] })
        .unset([...CARE_FIELDS, ...COMMERCE_FIELDS, "category", "collections"])
        .commit();
    }
    migrated++;
  }

  // Delete orphaned taxonomy documents.
  const orphans = await client.fetch(`*[_type in ["category", "subcategory", "collection"]]._id`);
  console.log(`\n${orphans.length} taxonomy documents to delete.`);
  if (COMMIT && orphans.length) {
    let tx = client.transaction();
    for (const id of orphans) tx = tx.delete(id);
    await tx.commit();
  }

  console.log(
    `\nDone. ${migrated} plant(s) ${COMMIT ? "migrated" : "would migrate"}, ` +
      `${orphans.length} taxonomy doc(s) ${COMMIT ? "deleted" : "would delete"}.`
  );
  if (!COMMIT) console.log("Re-run with --commit to apply.\n");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
