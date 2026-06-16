"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";

type GalleryImage = {
  url: string;
  alt: string;
};

function collectImages(product: Pick<Product, "name" | "image" | "images">): GalleryImage[] {
  const gallery = [...(product.images || [])]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
    .map((item) => ({ url: item.url, alt: item.alt || product.name }));
  if (product.image && !gallery.some((item) => item.url === product.image)) {
    gallery.unshift({ url: product.image, alt: product.name });
  }
  return gallery;
}

export function ProductGallery({ product }: { product: Pick<Product, "name" | "image" | "images"> }) {
  const images = useMemo(() => collectImages(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] || images[0];

  if (images.length === 0) {
    return (
      <div className="grid min-h-[420px] place-items-center border border-line bg-white industrial-grid">
        <div className="text-center">
          <span className="block text-5xl font-black text-navy">{product.name.split(" ")[0]}</span>
          <span className="mt-2 block text-sm font-bold uppercase text-steel">Photo coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden border border-line bg-white">
        <Image src={active.url} alt={active.alt} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-contain" priority />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}: ${image.alt}`}
              className={`relative aspect-square overflow-hidden border bg-white ${
                index === activeIndex ? "border-navy" : "border-line hover:border-steel"
              }`}
            >
              <Image src={image.url} alt={image.alt} fill sizes="100px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
