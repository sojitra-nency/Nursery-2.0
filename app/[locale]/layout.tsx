import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { locales, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/site";
import { getLocalized } from "@/lib/i18n/getLocalized";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const NURSERY_NAME = "Green Valley Nursery";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    description: "Browse our collection of healthy plants for every home.",
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

  const typedLocale = locale as import("@/lib/i18n/config").Locale;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  const nurseryName = getLocalized(settings.name, typedLocale) || NURSERY_NAME;

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header nurseryName={nurseryName} locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer nurseryName={nurseryName} locale={locale} dict={dict} />
      </body>
    </html>
  );
}
