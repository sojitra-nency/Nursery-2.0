import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "../globals.css";
import { locales, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { buildThemeCss } from "@/lib/theme/resolve";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyContactBar } from "@/components/layout/StickyContactBar";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { NURSERY_NAME } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await params;
  return {
    title: { default: NURSERY_NAME, template: `%s | ${NURSERY_NAME}` },
    description:
      "Greenskill Landscape — quality plants for homes, gardens and offices. Browse our collection of indoor, outdoor and rare plants.",
    icons: { icon: "/favicon.svg" },
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
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
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  const nurseryName = getLocalized(settings.name, typedLocale) || NURSERY_NAME;

  const ld = localBusinessJsonLd(settings);
  const themeCss = buildThemeCss(settings.theme);
  const mode = settings.theme?.darkMode ?? "auto";
  const forced = mode === "light" || mode === "dark";

  // In `auto` mode, resolve the effective mode before first paint (no FOUC):
  // localStorage wins, else the visitor's OS preference.
  const autoModeScript =
    "(function(){try{var s=localStorage.getItem('nursery-theme');" +
    "var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;" +
    "document.documentElement.dataset.mode=d?'dark':'light';}catch(e){}})();";

  return (
    <html lang={locale} suppressHydrationWarning {...(forced ? { "data-mode": mode } : {})}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {!forced && <script dangerouslySetInnerHTML={{ __html: autoModeScript }} />}
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
        <Header nurseryName={nurseryName} locale={locale} dict={dict} showThemeToggle={!forced} />
        <main id="main-content">{children}</main>
        <Footer nurseryName={nurseryName} locale={locale} dict={dict} settings={settings} />
        <StickyContactBar settings={settings} dict={dict} />
      </body>
    </html>
  );
}
