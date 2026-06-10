import { defineType, defineField } from "sanity";
import { CATEGORY_OPTIONS } from "../../lib/enums";
import { CheckboxListWithAdd } from "../../components/CheckboxListWithAdd";

export const plant = defineType({
  name: "plant",
  title: "Plant",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "varieties", title: "Varieties" },
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
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: { list: CATEGORY_OPTIONS as unknown as string[] },
      components: { input: CheckboxListWithAdd },
      group: "content",
    }),
    defineField({
      name: "images",
      title: "Images",
      description: "Shown when this plant has no varieties (fallback gallery).",
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
      name: "careTips",
      title: "Care Tips",
      type: "localeText",
      group: "content",
    }),
    defineField({
      name: "fragrant",
      title: "Fragrant",
      type: "boolean",
      initialValue: false,
      group: "content",
    }),
    defineField({
      name: "petSafe",
      title: "Pet-Friendly / Non-Toxic",
      type: "boolean",
      initialValue: false,
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
      name: "varieties",
      title: "Varieties",
      description: "Each variety has its own images, size, availability and care info.",
      type: "array",
      of: [{ type: "variety" }],
      group: "varieties",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: {
      title: "name.en",
      varietyMedia: "varieties.0.images.0",
      plantMedia: "images.0",
    },
    prepare({ title, varietyMedia, plantMedia }) {
      return { title: title || "Untitled Plant", media: varietyMedia || plantMedia };
    },
  },
});
