import { defineType, defineField } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "metaTitle", title: "Meta Title", type: "localeString" }),
    defineField({ name: "metaDescription", title: "Meta Description", type: "localeText" }),
    defineField({ name: "ogImage", title: "OG Image", type: "image" }),
    defineField({ name: "noIndex", title: "No Index", type: "boolean", initialValue: false }),
  ],
});
