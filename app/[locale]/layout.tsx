import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "../globals.css";
import { locales, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { resolveThemeVars } from "@/lib/theme/resolve";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyContactBar } from "@/components/layout/StickyContactBar";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/i18n/config";

const NURSERY_NAME = "Greenskill Landscape";

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
  const themeVars = resolveThemeVars(settings.theme);

  return (
    <html lang={locale} style={themeVars as React.CSSProperties}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased pb-16 md:pb-0`}
      >
        <Header nurseryName={nurseryName} locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer nurseryName={nurseryName} locale={locale} dict={dict} />
        <StickyContactBar settings={settings} dict={dict} />
      </body>
    </html>
  );
}
