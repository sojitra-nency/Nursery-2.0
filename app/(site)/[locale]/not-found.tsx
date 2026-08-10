"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { localeFromPath } from "@/lib/i18n/localeFromPath";
import { useBoundaryMessages } from "@/components/i18n/BoundaryMessages";

export default function NotFound() {
  // `not-found.tsx` gets no `params`, so the locale comes from the URL — needed
  // here for the "back to home" target, not for the copy (see BoundaryMessages).
  const locale = localeFromPath(usePathname());
  const t = useBoundaryMessages();

  return (
    <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 text-6xl" aria-hidden="true">
        🌵
      </div>
      <h1 className="font-display mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {t.notFoundTitle}
      </h1>
      <p className="mb-6 max-w-md text-muted">{t.notFoundBody}</p>
      <Button href={`/${locale}`} size="lg">
        {t.backHome}
      </Button>
    </div>
  );
}
