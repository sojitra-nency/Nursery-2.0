import type { Metadata } from "next";
import "../../globals.css";
import { geistSans, geistMono, fraunces, scriptFontStyle } from "@/lib/fonts";
import { locales, hasLocale, localeMeta } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { buildThemeCss } from "@/lib/theme/resolve";
import { AUTO_MODE_SCRIPT } from "@/lib/theme/clientScript";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyContactBar } from "@/components/layout/StickyContactBar";
import { BoundaryMessagesProvider } from "@/components/i18n/BoundaryMessages";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { SITE_DOMAIN, NURSERY_NAME } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    metadataBase: new URL(SITE_DOMAIN),
    title: { default: NURSERY_NAME, template: `%s | ${NURSERY_NAME}` },
    // Previously a hard-coded English string for every locale. This is the
    // description search engines and link previews show, so it has to follow the
    // locale like everything else.
    description: dict.seo.defaultDescription,
    icons: { icon: "/favicon.svg" },
    alternates: {
      languages: {
        // The language chooser at `/` is the locale-neutral entry point.
        "x-default": "/",
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const typedLocale = locale as Locale;
  const meta = localeMeta(typedLocale);
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  const nurseryName = getLocalized(settings.name, typedLocale) || NURSERY_NAME;

  const ld = localBusinessJsonLd(settings, typedLocale);
  const themeCss = buildThemeCss(settings.theme);
  const mode = settings.theme?.darkMode ?? "auto";
  const forced = mode === "light" || mode === "dark";

  return (
    <html
      lang={typedLocale}
      // Urdu is RTL; the other twelve are LTR. Setting it on <html> mirrors the
      // whole document and makes every CSS logical property resolve correctly.
      dir={meta.dir}
      // Drives the script-aware typography rules in globals.css — Latin's negative
      // letter-spacing and tight display leading are actively wrong for Indic and
      // Arabic text.
      data-script={meta.script}
      // Selects the Noto face for this locale's writing system.
      style={scriptFontStyle(meta.script)}
      suppressHydrationWarning
      {...(forced ? { "data-mode": mode } : {})}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {!forced && <script dangerouslySetInnerHTML={{ __html: AUTO_MODE_SCRIPT }} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <a href="#main-content" className="skip-link">
          {dict.common.skipToContent}
        </a>
        <Header
          nurseryName={nurseryName}
          locale={typedLocale}
          dict={dict}
          showThemeToggle={!forced}
        />
        {/* Wraps `children` so error.tsx / not-found.tsx — Client Components with
            no access to the server dictionary — still render in this locale. */}
        <main id="main-content">
          <BoundaryMessagesProvider messages={dict.errors}>{children}</BoundaryMessagesProvider>
        </main>
        <Footer nurseryName={nurseryName} locale={typedLocale} dict={dict} settings={settings} />
        <StickyContactBar settings={settings} dict={dict} />
      </body>
    </html>
  );
}
