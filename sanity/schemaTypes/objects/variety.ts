import { defineType, defineField } from "sanity";
import { AVAILABILITY, SUNLIGHT, WATERING, GROWTH_RATE, BAG_SIZES } from "../../lib/enums";

export const variety = defineType({
  name: "variety",
  title: "Variety",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Variety Name", type: "localeString" }),
    defineField({
      name: "images",
      title: "Images",
      description: "Shown as a slider on the plant page.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt Text", type: "localeString" },
            { name: "caption", title: "Caption", type: "localeString" },
          ],
        },
      ],
    }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({
      name: "sizeRange",
      title: "Size (e.g. 12 inch – 2 ft)",
      type: "string",
    }),
    defineField({
      name: "bagSizes",
      title: "Bag Sizes & Pricing",
      description: "Add each bag size and define quantity-based price tiers.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "size",
              title: "Bag Size",
              type: "string",
              options: { list: BAG_SIZES.map((s) => ({ title: s, value: s })) },
              validation: (R) => R.required(),
            }),
            defineField({
              name: "tiers",
              title: "Price Tiers",
              description:
                "Add rows for each quantity range. Leave Max Qty empty on the last row for 'and above'.",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({
                      name: "minQty",
                      title: "Min Qty",
                      type: "number",
                      validation: (R) => R.required().min(1),
                    }),
                    defineField({
                      name: "maxQty",
                      title: "Max Qty (leave empty for 'and above')",
                      type: "number",
                    }),
                    defineField({
                      name: "price",
                      title: "Price (₹)",
                      type: "number",
                      validation: (R) => R.required().min(0),
                    }),
                  ],
                  preview: {
                    select: { minQty: "minQty", maxQty: "maxQty", price: "price" },
                    prepare({ minQty, maxQty, price }) {
                      const range = maxQty ? `${minQty}–${maxQty}` : `${minQty}+`;
                      return { title: `₹${price}`, subtitle: `Qty: ${range}` };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { size: "size", tiers: "tiers" },
            prepare({ size, tiers }) {
              const count = Array.isArray(tiers) ? tiers.length : 0;
              return {
                title: size || "Unnamed size",
                subtitle: `${count} price tier${count !== 1 ? "s" : ""}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: { list: AVAILABILITY.map((a) => ({ title: a.label, value: a.value })) },
      initialValue: "in_stock",
    }),
    defineField({
      name: "sunlight",
      title: "Sunlight",
      type: "string",
      options: { list: SUNLIGHT.map((s) => ({ title: s.label, value: s.value })) },
    }),
    defineField({
      name: "watering",
      title: "Watering",
      type: "string",
      options: { list: WATERING.map((w) => ({ title: w.label, value: w.value })) },
    }),
    defineField({
      name: "growthRate",
      title: "Growth Rate",
      type: "string",
      options: { list: GROWTH_RATE.map((g) => ({ title: g.label, value: g.value })) },
    }),
    defineField({ name: "maxHeight", title: "Max Height (e.g. 3–4 ft)", type: "string" }),
    defineField({ name: "bloomSeason", title: "Bloom Season", type: "string" }),
  ],
  preview: {
    select: { title: "name.en", media: "images.0", availability: "availability" },
    prepare({ title, media, availability }) {
      return { title: title || "Untitled Variety", subtitle: availability, media };
    },
  },
});
