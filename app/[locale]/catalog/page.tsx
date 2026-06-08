import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">{dict.nav.catalog}</h1>
    </div>
  );
}
