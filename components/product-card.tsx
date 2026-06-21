import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { FitBadge } from "@/components/fit-badge";
import { InquiryButton } from "@/components/inquiry-button";
import { Price } from "@/components/price";
import { StockStatus } from "@/components/stock-status";
import type { Product } from "@/data/products";
import { getServerDict } from "@/lib/locale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export function ProductCard({ product, activeModel }: { product: Product; activeModel?: string }) {
  const t = getServerDict().card;
  return (
    <article className="grid min-h-[360px] rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-lg">
      <div>
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-panel industrial-grid">
          {product.image || product.images?.[0]?.url ? (
            <Image
              src={(product.image || product.images?.[0]?.url) as string}
              alt={product.images?.[0]?.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
              className="object-contain"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-4xl font-black text-navy">
              {product.name.split(" ")[0]}
            </span>
          )}
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-brand/10 px-2 py-1 text-xs font-black text-[#0b2545]">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-black leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-steel">{product.shortDescription}</p>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <FitBadge
          fitmentType={product.fitmentType}
          fitmentNote={product.fitmentNote}
          compatibleModels={product.compatibleModels}
          notCompatibleWith={product.notCompatibleWith}
          activeModel={activeModel}
          guaranteed={product.fitmentGuaranteed}
        />
        {product.compatibleModels.length > 0 && (
          <p>
            <strong>{t.models}</strong> {product.compatibleModels.slice(0, 3).join(", ")}
          </p>
        )}
        <p>
          <strong>{t.solves}</strong> {product.problemsSolved.slice(0, 2).join(", ")}
        </p>
        {product.wholesaleAvailable && (
          <p className="inline-flex items-center gap-1 font-bold text-navy">
            <CheckCircle2 size={16} /> {t.wholesale_available}
          </p>
        )}
        <StockStatus stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span>
          <span className="flex items-baseline gap-2">
            <Price cents={product.priceCents} className="text-lg font-black text-ink" />
            {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
              <small className="font-bold text-steel line-through">
                <Price cents={product.compareAtPriceCents} />
              </small>
            )}
          </span>
          <small className="font-bold text-steel">{t.wholesale_by_volume}</small>
        </span>
        <Link className="rounded-lg bg-navy px-4 py-2 text-sm font-black text-white" href={`/products/${product.slug}`}>
          {t.view_details}
        </Link>
      </div>
      <InquiryButton
        name={product.name}
        sku={product.sku}
        url={`${SITE_URL}/products/${product.slug}`}
        label={t.get_wholesale_price}
        className="mt-3 w-full"
      />
      <div className="mt-2 grid grid-cols-1 gap-2">
        <AddToCartButton
          slug={product.slug}
          name={product.name}
          outOfStock={(product.stock ?? 0) <= 0}
          className="w-full"
        />
        <AddToQuoteButton slug={product.slug} name={product.name} className="w-full" />
      </div>
    </article>
  );
}
