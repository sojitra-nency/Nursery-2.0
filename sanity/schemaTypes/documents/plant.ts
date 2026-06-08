import { defineType, defineField } from "sanity";
import { AVAILABILITY, SUNLIGHT, WATERING, GROWTH_RATE } from "../../lib/enums";

export const plant = defineType({
  name: "plant",
  title: "Plant",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "care", title: "Care Guide" },
    { name: "commerce", title: "Commerce", hidden: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "localeString",
      group: "content",
    }),
    defineField({
      name: "scientificName",
      title: "Scientific Name",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name.en" },
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localeText",
      group: "content",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "content",
    }),
    defineField({
      name: "collections",
      title: "Collections",
      type: "array",
      of: [{ type: "reference", to: [{ type: "collection" }] }],
      group: "content",
    }),
    defineField({
      name: "images",
      title: "Images",
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
      group: "content",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      group: "content",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      options: { list: AVAILABILITY.map((a) => ({ title: a.label, value: a.value })) },
      initialValue: "in_stock",
      group: "care",
    }),
    defineField({
      name: "sunlight",
      title: "Sunlight",
      type: "string",
      options: { list: SUNLIGHT.map((s) => ({ title: s.label, value: s.value })) },
      group: "care",
    }),
    defineField({
      name: "watering",
      title: "Watering",
      type: "string",
      options: { list: WATERING.map((w) => ({ title: w.label, value: w.value })) },
      group: "care",
    }),
    defineField({
      name: "growthRate",
      title: "Growth Rate",
      type: "string",
      options: { list: GROWTH_RATE.map((g) => ({ title: g.label, value: g.value })) },
      group: "care",
    }),
    defineField({ name: "size", title: "Size (e.g. 6–8 inch pot)", type: "string", group: "care" }),
    defineField({
      name: "floweringSeason",
      title: "Flowering Season",
      type: "string",
      group: "care",
    }),
    defineField({
      name: "priceMinor",
      title: "Price (paise)",
      description: "Price in INR paise (e.g. 29900 = ₹299)",
      type: "number",
      group: "commerce",
      hidden: true,
    }),
    defineField({
      name: "salePriceMinor",
      title: "Sale Price (paise)",
      type: "number",
      group: "commerce",
      hidden: true,
    }),
    defineField({
      name: "stockQuantity",
      title: "Stock Quantity",
      type: "number",
      group: "commerce",
      hidden: true,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "name.en", media: "images.0" },
    prepare({ title, media }) {
      return { title: title || "Untitled Plant", media };
    },
  },
});
