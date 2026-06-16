"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

export type ViewedProduct = {
  slug: string;
  name: string;
  image: string | null;
  priceCents: number;
  currency: string;
};

const STORAGE_KEY = "repairkit-recently-viewed-v1";
const MAX_ITEMS = 8;

function readStored(): ViewedProduct[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Records the current product into a localStorage history and renders the
 * other recently-viewed products. Self-contained: stores a display snapshot
 * so no catalog data needs to be passed around.
 */
export function RecentlyViewed({ current, heading }: { current: ViewedProduct; heading: string }) {
  const [others, setOthers] = useState<ViewedProduct[]>([]);

  useEffect(() => {
    const history = readStored().filter((item) => item.slug !== current.slug);
    setOthers(history.slice(0, 4));

    const next = [current, ...history].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.slug]);

  if (others.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-black">{heading}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {others.map((product) => (
          <Link key={product.slug} href={`/products/${product.slug}`} className="group border border-line bg-white p-4 hover:border-navy">
            <div className="relative mb-3 aspect-[4/3] overflow-hidden bg-panel industrial-grid">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" />
              ) : (
                <span className="absolute inset-0 grid place-items-center text-xl font-black text-navy">
                  {product.name.split(" ")[0]}
                </span>
              )}
            </div>
            <p className="text-sm font-black leading-snug group-hover:text-navy">{product.name}</p>
            <strong className="mt-1 block text-sm">{formatMoney(product.priceCents, product.currency)}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
