"use client";

import { useCallback, useState } from "react";
import { set, type ObjectInputProps } from "sanity";
import { Button, Stack, useToast } from "@sanity/ui";

type LocaleValue = { en?: string; hi?: string; gu?: string } | undefined;

async function translate(text: string, target: "hi" | "gu"): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation request failed (${res.status})`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || typeof translated !== "string") {
    throw new Error("No translation returned");
  }
  return translated;
}

/**
 * Custom input for `localeString` / `localeText`. Renders the default en/hi/gu
 * fields and adds a "Translate" button that fills Hindi & Gujarati from the
 * English value via the free MyMemory API. All fields stay manually editable.
 */
export function TranslateInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const en = (value as LocaleValue)?.en?.trim();

  const handleTranslate = useCallback(async () => {
    if (!en) {
      toast.push({ status: "warning", title: "Enter English text first" });
      return;
    }
    setLoading(true);
    try {
      const [hi, gu] = await Promise.all([translate(en, "hi"), translate(en, "gu")]);
      onChange([set(hi, ["hi"]), set(gu, ["gu"])]);
      toast.push({ status: "success", title: "Translated to Hindi & Gujarati" });
    } catch (err) {
      toast.push({
        status: "error",
        title: "Translation failed",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [en, onChange, toast]);

  return (
    <Stack space={3}>
      <Button
        text="Translate EN → हिन्दी + ગુજરાતી"
        tone="primary"
        mode="ghost"
        disabled={!en || loading}
        loading={loading}
        onClick={handleTranslate}
        fontSize={1}
        padding={2}
      />
      {props.renderDefault(props)}
    </Stack>
  );
}
