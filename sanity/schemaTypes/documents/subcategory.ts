import { defineType, defineField } from "sanity";

export const subcategory = defineType({
  name: "subcategory",
  title: "Subcategory",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title.en" } }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
  ],
  preview: {
    select: { title: "title.en", parent: "parent.title.en" },
    prepare({ title, parent }) {
      return { title: title || "Untitled", subtitle: parent ? `Under: ${parent}` : undefined };
    },
  },
});
