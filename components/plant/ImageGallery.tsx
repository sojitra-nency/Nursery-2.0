"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  _key: string;
  url: string;
  alt?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-[4/3] bg-surface border border-border rounded-xl flex items-center justify-center text-6xl">
        🌿
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-border">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img._key}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-accent" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
