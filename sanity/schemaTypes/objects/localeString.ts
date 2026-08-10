import { defineType, defineField } from "sanity";
import { TranslateInput } from "../../components/TranslateInput";
import { localeFields } from "./localeFields";

export const localeString = defineType({
  name: "localeString",
  title: "Localized String",
  type: "object",
  components: { input: TranslateInput },
  fieldsets: [{ name: "translations", title: "Translations", options: { collapsible: true } }],
  fields: localeFields("string").map((field) => defineField(field)),
});
