import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <h1 className="text-4xl font-bold text-foreground">{dict.home.heroTitleFallback}</h1>
    </div>
  );
}
