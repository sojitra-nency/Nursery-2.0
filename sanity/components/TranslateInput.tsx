"use client";

import { useCallback, useMemo, useState } from "react";
import { set, type ObjectInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text, useToast } from "@sanity/ui";
import { LOCALES, defaultLocale, localeMeta, type Locale } from "../../lib/i18n/config";
import { translateToLocales, TRANSLATABLE_LOCALES } from "../../lib/translate/mymemory";

type LocaleValue = Partial<Record<Locale, string>> | undefined;

function filled(value: LocaleValue, locale: Locale): boolean {
  return typeof value?.[locale] === "string" && value[locale]!.trim() !== "";
}

/**
 * Custom input for `localeString` / `localeText`: the standard per-locale fields
 * plus a button that fills the missing languages from the English value.
 *
 * Two deliberate behaviours, both fixing real problems with the previous version:
 *
 *  - **It never overwrites existing text.** The old button replaced Hindi and
 *    Gujarati unconditionally on every click, so a translation an editor had
 *    corrected by hand was destroyed the next time anyone pressed it. Now the
 *    default only fills blanks; replacing everything is a separate, explicitly
 *    labelled action.
 *  - **Partial results are kept.** The old code used `Promise.all`, so one failed
 *    language discarded the others. Each language now succeeds or fails on its own,
 *    and the toast reports exactly which ones didn't make it.
 *
 * The engine here is keyless MyMemory, because the Studio bundle is publicly
 * downloadable and must not carry an API key. Its Indic output is draft quality —
 * for the real thing run `npm run translate`, which keeps the key server-side.
 */
export function TranslateInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const localeValue = value as LocaleValue;
  const source = localeValue?.[defaultLocale]?.trim();

  const missing = useMemo(
    () => TRANSLATABLE_LOCALES.filter((code) => !filled(localeValue, code)),
    [localeValue]
  );

  const run = useCallback(
    async (targets: Locale[]) => {
      if (!source) {
        toast.push({ status: "warning", title: "Enter the English text first" });
        return;
      }
      if (targets.length === 0) {
        toast.push({ status: "info", title: "All languages are already filled" });
        return;
      }

      setBusy(true);
      try {
        const outcomes = await translateToLocales(source, targets);
        const patches = outcomes.filter((o) => o.text).map((o) => set(o.text!, [o.locale]));

        if (patches.length > 0) onChange(patches);

        const failed = outcomes.filter((o) => !o.text);
        if (failed.length === 0) {
          toast.push({
            status: "success",
            title: `Translated into ${patches.length} language${patches.length === 1 ? "" : "s"}`,
            description: "Machine translation — please review before publishing.",
          });
        } else {
          toast.push({
            status: patches.length ? "warning" : "error",
            title: `${patches.length} translated, ${failed.length} failed`,
            description: failed
              .map((f) => `${localeMeta(f.locale).englishName}: ${f.error}`)
              .join(" · "),
          });
        }
      } finally {
        setBusy(false);
      }
    },
    [source, onChange, toast]
  );

  const filledCount = LOCALES.length - missing.length;

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3}>
            <Text size={1} muted>
              {filledCount} of {LOCALES.length} languages filled
            </Text>
          </Flex>
          <Flex gap={2} wrap="wrap">
            <Button
              text={missing.length ? `Translate ${missing.length} missing` : "All languages filled"}
              tone="primary"
              mode="ghost"
              disabled={!source || busy || missing.length === 0}
              loading={busy}
              onClick={() => run(missing)}
              fontSize={1}
              padding={2}
            />
            <Button
              text="Re-translate all"
              tone="caution"
              mode="bleed"
              disabled={!source || busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Replace every existing translation with a fresh machine translation? Any wording corrected by hand will be lost."
                  )
                ) {
                  void run([...TRANSLATABLE_LOCALES]);
                }
              }}
              fontSize={1}
              padding={2}
            />
          </Flex>
          <Text size={0} muted>
            Machine translation — review before publishing. Blank languages fall back to English on
            the site, so a partly-translated field is safe to save.
          </Text>
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
