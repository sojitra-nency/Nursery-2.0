import type { FieldDefinition } from "sanity";
import { LOCALES, defaultLocale } from "../../../lib/i18n/config";

/**
 * Build the per-locale fields for `localeString` / `localeText` from the locale
 * registry, so adding a language never means hand-editing two schema files that
 * quietly disagree with `lib/i18n/config.ts`.
 *
 * English is the only required field and sits outside the collapsed fieldset: the
 * owner authors once in English and the translations are filled in from it (by the
 * Translate button, or in bulk by `npm run translate`). Every other locale is
 * optional, and the frontend falls back to English for anything left blank — so a
 * half-translated document is a usable document, never a broken page.
 *
 * Field titles carry both names ("Tamil (தமிழ்)") so an editor who can't read the
 * script can still find the right box, and one who can read it recognises theirs.
 *
 * Note this module is loaded into the Studio bundle: like `lib/theme/presets`, the
 * registry it imports must stay free of server-only code.
 */
export function localeFields(type: "string" | "text"): FieldDefinition[] {
  return LOCALES.map((locale) => {
    const isDefault = locale.code === defaultLocale;
    return {
      name: locale.code,
      title:
        locale.englishName === locale.nativeName
          ? locale.englishName
          : `${locale.englishName} (${locale.nativeName})`,
      type,
      ...(isDefault
        ? { validation: (rule: { required: () => unknown }) => rule.required() }
        : { fieldset: "translations" }),
    } as FieldDefinition;
  });
}
