"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { localeFromPath } from "@/lib/i18n/localeFromPath";
import type { Locale } from "@/lib/i18n/config";

const MESSAGES: Record<Locale, { title: string; body: string; retry: string }> = {
  en: {
    title: "Something went wrong",
    body: "An unexpected error occurred. Please try again.",
    retry: "Try again",
  },
  hi: {
    title: "कुछ गलत हो गया",
    body: "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।",
    retry: "पुनः प्रयास करें",
  },
  gu: {
    title: "કંઈક ખોટું થયું",
    body: "અનપેક્ષિત ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    retry: "ફરી પ્રયાસ કરો",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = localeFromPath(usePathname());
  const t = MESSAGES[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        🪴
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
        {t.title}
      </h1>
      <p className="text-muted mb-6 max-w-md">{t.body}</p>
      <Button size="lg" onClick={reset}>
        {t.retry}
      </Button>
    </div>
  );
}
