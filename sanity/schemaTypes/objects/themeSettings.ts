import { defineType, defineField } from "sanity";
import { THEME_PRESETS, THEME_TOKEN_KEYS } from "../../../lib/theme/presets";

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// camelCase token key -> human label for the custom fields.
const TOKEN_LABELS: Record<(typeof THEME_TOKEN_KEYS)[number], string> = {
  background: "Background",
  foreground: "Foreground (text)",
  surface: "Surface",
  border: "Border",
  muted: "Muted text",
  accent: "Accent",
  accentDark: "Accent (dark / hover)",
  onAccent: "Text on accent",
};

export const themeSettings = defineType({
  name: "themeSettings",
  title: "Theme",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fieldsets: [
    {
      name: "custom",
      title: "Custom Colors",
      description: "Only used when the Color Theme is set to “Custom”.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "preset",
      title: "Color Theme",
      description: "Pick a ready-made palette, or choose Custom to set your own colors.",
      type: "string",
      initialValue: "forest",
      options: {
        layout: "radio",
        list: [
          ...THEME_PRESETS.map((p) => ({ title: `${p.label}  ·  ${p.swatch}`, value: p.key })),
          { title: "Custom (set your own colors)", value: "custom" },
        ],
      },
    }),
    defineField({
      name: "darkMode",
      title: "Dark Mode",
      description:
        "Auto = follow each visitor's device setting (with a toggle in the header). Or force one mode for the whole site.",
      type: "string",
      initialValue: "auto",
      options: {
        layout: "radio",
        list: [
          { title: "Auto (follow visitor's device)", value: "auto" },
          { title: "Always light", value: "light" },
          { title: "Always dark", value: "dark" },
        ],
      },
    }),
    ...THEME_TOKEN_KEYS.map((key) =>
      defineField({
        name: key,
        title: TOKEN_LABELS[key],
        type: "string",
        fieldset: "custom",
        placeholder: "#000000",
        hidden: ({ parent }) => parent?.preset !== "custom",
        validation: (rule) =>
          rule.custom((value) => {
            if (!value) return true; // empty falls back to the default token
            return HEX.test(value) ? true : "Enter a valid hex color, e.g. #2f7d32";
          }),
      })
    ),
  ],
});
