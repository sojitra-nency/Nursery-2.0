import { defineType, defineField } from "sanity";
import { TranslateInput } from "../../components/TranslateInput";

export const localeString = defineType({
  name: "localeString",
  title: "Localized String",
  type: "object",
  components: { input: TranslateInput },
  fieldsets: [{ name: "translations", title: "Translations", options: { collapsible: true } }],
  fields: [
    defineField({ name: "en", title: "English", type: "string", validation: (r) => r.required() }),
    defineField({ name: "hi", title: "Hindi", type: "string", fieldset: "translations" }),
    defineField({ name: "gu", title: "Gujarati", type: "string", fieldset: "translations" }),
  ],
});
