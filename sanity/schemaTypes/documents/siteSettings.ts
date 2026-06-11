import { defineType, defineField } from "sanity";

// Accepts the display format consumed by `to24h` in lib/hours.ts, e.g. "8:00 AM".
const TIME_RE = /^\d{1,2}(?::\d{2})?\s*(am|pm)?$/i;
const validTime = (v?: string): true | string =>
  !v || TIME_RE.test(v.trim()) || 'Use a time like "8:00 AM"';

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nursery Name", type: "localeString" }),
    defineField({ name: "tagline", title: "Tagline", type: "localeString" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "theme", title: "Theme", type: "themeSettings" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "address", title: "Address", type: "localeText" }),
    defineField({ name: "city", title: "City", type: "localeString" }),
    defineField({ name: "region", title: "State / Region", type: "localeString" }),
    defineField({ name: "geo", title: "Geo Coordinates", type: "geopoint" }),
    defineField({
      name: "openEveryday",
      title: "Open Every Day",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "openTime",
      title: "Opening Time",
      type: "string",
      initialValue: "8:00 AM",
      validation: (rule) => rule.custom(validTime),
    }),
    defineField({
      name: "closeTime",
      title: "Closing Time",
      type: "string",
      initialValue: "8:00 PM",
      validation: (rule) => rule.custom(validTime),
    }),
    defineField({
      name: "hoursNote",
      title: "Hours Note (optional)",
      description: "Shown instead of the times when filled — e.g. holiday hours.",
      type: "localeString",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Platform", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR",
    }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "name.en" },
    prepare({ title }) {
      return { title: title || "Site Settings" };
    },
  },
});
