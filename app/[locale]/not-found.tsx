"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { localeFromPath } from "@/lib/i18n/localeFromPath";
import type { Locale } from "@/lib/i18n/config";

const MESSAGES: Record<Locale, { title: string; body: string; home: string }> = {
  en: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist or may have moved.",
    home: "Back to home",
  },
  hi: {
    title: "पेज नहीं मिला",
    body: "आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।",
    home: "होम पर वापस जाएं",
  },
  gu: {
    title: "પેજ મળ્યું નથી",
    body: "તમે જે પેજ શોધી રહ્યા છો તે અસ્તિત્વમાં નથી અથવા ખસેડવામાં આવ્યું છે.",
    home: "હોમ પર પાછા જાઓ",
  },
};

export default function NotFound() {
  const locale = localeFromPath(usePathname());
  const t = MESSAGES[locale];

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        🌵
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
        {t.title}
      </h1>
      <p className="text-muted mb-6 max-w-md">{t.body}</p>
      <Button href={`/${locale}`} size="lg">
        {t.home}
      </Button>
    </div>
  );
}
