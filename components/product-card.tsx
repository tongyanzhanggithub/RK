import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { FitBadge } from "@/components/fit-badge";
import { InquiryButton } from "@/components/inquiry-button";
import { StockStatus } from "@/components/stock-status";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export function ProductCard({ product, activeModel }: { product: Product; activeModel?: string }) {
  return (
    <article className="grid min-h-[360px] border border-line bg-white p-5 shadow-sm">
      <div>
        <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-panel industrial-grid">
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
            <span key={tag} className="bg-safety/15 px-2 py-1 text-xs font-black text-ink">
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
            <strong>Models:</strong> {product.compatibleModels.slice(0, 3).join(", ")}
          </p>
        )}
        <p>
          <strong>Solves:</strong> {product.problemsSolved.slice(0, 2).join(", ")}
        </p>
        {product.wholesaleAvailable && (
          <p className="inline-flex items-center gap-1 font-bold text-navy">
            <CheckCircle2 size={16} /> Wholesale available
          </p>
        )}
        <StockStatus stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span>
          <span className="flex items-baseline gap-2">
            <strong className="text-lg text-ink">{formatMoney(product.priceCents, product.currency)}</strong>
            {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
              <small className="font-bold text-steel line-through">
                {formatMoney(product.compareAtPriceCents, product.currency)}
              </small>
            )}
          </span>
          <small className="font-bold text-steel">Wholesale by volume</small>
        </span>
        <Link className="bg-navy px-4 py-2 text-sm font-black text-white" href={`/products/${product.slug}`}>
          View Details
        </Link>
      </div>
      <InquiryButton
        name={product.name}
        sku={product.sku}
        url={`${SITE_URL}/products/${product.slug}`}
        className="mt-3 w-full"
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <AddToCartButton
          slug={product.slug}
          name={product.name}
          outOfStock={(product.stock ?? 0) <= 0}
        />
        <AddToQuoteButton slug={product.slug} name={product.name} />
      </div>
    </article>
  );
}
