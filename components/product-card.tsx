"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { InquiryButton } from "@/components/inquiry-button";
import { useI18n } from "@/components/language-provider";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  return (
    <article className="grid min-h-[360px] border border-line bg-white p-5 shadow-sm">
      <div>
        <div className="mb-4 grid aspect-[4/3] place-items-center bg-panel industrial-grid">
          <span className="text-4xl font-black text-navy">{product.name.split(" ")[0]}</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-safety/15 px-2 py-1 text-xs font-black text-ink">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-black leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-steel">{product.shortDescription}</p>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <strong>{t("card.models")}</strong> {product.compatibleModels.slice(0, 3).join(", ")}
        </p>
        <p>
          <strong>{t("card.solves")}</strong> {product.problemsSolved.slice(0, 2).join(", ")}
        </p>
        {product.wholesaleAvailable && (
          <p className="inline-flex items-center gap-1 font-bold text-navy">
            <CheckCircle2 size={16} /> {t("card.wholesaleAvailable")}
          </p>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span>
          <strong className="block text-lg text-ink">{formatMoney(product.priceCents, product.currency)}</strong>
          <small className="font-bold text-steel">{t("card.wholesaleByVolume")}</small>
        </span>
        <Link className="bg-navy px-4 py-2 text-sm font-black text-white" href={`/products/${product.slug}`}>
          {t("card.viewDetails")}
        </Link>
      </div>
      <InquiryButton
        name={product.name}
        sku={product.sku}
        url={`${SITE_URL}/products/${product.slug}`}
        className="mt-3 w-full"
      />
      <AddToCartButton slug={product.slug} name={product.name} className="mt-2 w-full" />
    </article>
  );
}
