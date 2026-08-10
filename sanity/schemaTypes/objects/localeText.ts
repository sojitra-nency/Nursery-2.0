import { defineType, defineField } from "sanity";
import { TranslateInput } from "../../components/TranslateInput";
import { localeFields } from "./localeFields";

export const localeText = defineType({
  name: "localeText",
  title: "Localized Text",
  type: "object",
  components: { input: TranslateInput },
  fieldsets: [{ name: "translations", title: "Translations", options: { collapsible: true } }],
  fields: localeFields("text").map((field) => defineField(field)),
});
