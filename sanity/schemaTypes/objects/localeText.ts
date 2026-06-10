import { defineType, defineField } from "sanity";
import { TranslateInput } from "../../components/TranslateInput";

export const localeText = defineType({
  name: "localeText",
  title: "Localized Text",
  type: "object",
  components: { input: TranslateInput },
  fieldsets: [{ name: "translations", title: "Translations", options: { collapsible: true } }],
  fields: [
    defineField({ name: "en", title: "English", type: "text", validation: (r) => r.required() }),
    defineField({ name: "hi", title: "Hindi", type: "text", fieldset: "translations" }),
    defineField({ name: "gu", title: "Gujarati", type: "text", fieldset: "translations" }),
  ],
});
