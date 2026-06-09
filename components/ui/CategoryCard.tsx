import Link from "next/link";
import Image from "next/image";
import { getLocalized } from "@/lib/i18n/getLocalized";
import type { Locale } from "@/lib/i18n/config";
import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/sanity/lib/image";

interface CategoryCardProps {
  category: {
    title: { en?: string; hi?: string; gu?: string };
    slug: { current: string };
    heroImage?: { asset: SanityImageSource };
  };
  locale: Locale;
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const title = getLocalized(category.title, locale);
  const imageUrl = category.heroImage?.asset
    ? urlForImage(category.heroImage.asset).width(400).height(300).fit("crop").url()
    : null;

  return (
    <Link
      href={`/${locale}/categories/${category.slug.current}`}
      className="group relative block rounded-xl overflow-hidden aspect-[4/3] bg-border"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-accent/10 flex items-center justify-center text-5xl">
          🌸
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm">{title}</p>
    </Link>
  );
}
