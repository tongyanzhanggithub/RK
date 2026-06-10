"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, TicketPercent, Trash2 } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { TrustBadges } from "@/components/trust-badges";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/format";
import { SHIPPING_CENTS } from "@/lib/shipping";

type CartPageClientProps = {
  products: Product[];
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

type AppliedCoupon = {
  code: string;
  label: string;
  discountCents: number;
};

export function CartPageClient({ products }: CartPageClientProps) {
  const { items, updateItem, removeItem, clearCart, totalQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const productMap = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
  const cartSignature = items.map((item) => `${item.slug}:${item.quantity}`).join("|");
  const lines = items
    .map((item) => {
      const product = productMap.get(item.slug);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        lineTotal: item.quantity * product.priceCents
      };
    })
    .filter(Boolean) as { product: Product; quantity: number; lineTotal: number }[];
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const shippingCents = SHIPPING_CENTS;
  const discountCents = appliedCoupon?.discountCents || 0;
  const estimatedTotal = subtotal + shippingCents - discountCents;

  const cartSlugs = new Set(lines.map((line) => line.product.slug));
  const cartModels = new Set(lines.flatMap((line) => line.product.compatibleModels));
  const crossSell = products
    .filter((product) => !cartSlugs.has(product.slug) && (product.stock ?? 0) > 0)
    .map((product) => {
      const modelOverlap = product.compatibleModels.filter((model) => cartModels.has(model)).length;
      const score = (product.fitmentType === "UNIVERSAL" ? 4 : 0) + modelOverlap * 3;
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => product);

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError("");
  }, [cartSignature]);

  async function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCouponError("");
    setCheckoutError("");
    setAppliedCoupon(null);

    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code first.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode,
          items: lines.map((line) => ({ slug: line.product.slug, quantity: line.quantity }))
        })
      });
      const data = (await response.json()) as AppliedCoupon & { error?: string };
      if (!response.ok || !data.code) {
        throw new Error(data.error || "Coupon could not be applied.");
      }
      setCouponCode(data.code);
      setAppliedCoupon({ code: data.code, label: data.label, discountCents: data.discountCents });
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : "Coupon could not be applied.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  async function handleCheckout() {
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ slug: line.product.slug, quantity: line.quantity })),
          couponCode: appliedCoupon?.code || undefined
        })
      });
      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to create Stripe Checkout session.");
      }
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout.");
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-safety">Secure checkout</p>
            <h1 className="text-4xl font-black">Cart</h1>
            <p className="mt-3 max-w-3xl text-steel">
              Review repair kits before secure Stripe checkout. Prices are sample-order prices; bulk quotes can be handled later.
            </p>
          </div>
          <Link href="/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            Continue Shopping
          </Link>
        </div>

        {lines.length === 0 ? (
          <section className="mt-8 border border-line bg-white p-8">
            <h2 className="text-2xl font-black">Your cart is empty</h2>
            <p className="mt-3 text-steel">Add repair kits from the product list or product detail page.</p>
            <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="border border-line bg-white">
              <div className="grid gap-0">
                {lines.map(({ product, quantity, lineTotal }) => (
                  <article key={product.slug} className="grid gap-4 border-b border-line p-5 md:grid-cols-[120px_1fr_auto]">
                    <Link href={`/products/${product.slug}`} className="grid aspect-square place-items-center bg-panel industrial-grid">
                      <span className="text-2xl font-black text-navy">{product.name.split(" ")[0]}</span>
                    </Link>
                    <div>
                      <p className="text-sm font-black uppercase text-safety">{product.category}</p>
                      <Link href={`/products/${product.slug}`} className="mt-1 block text-xl font-black hover:text-navy">
                        {product.name}
                      </Link>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">{product.shortDescription}</p>
                      <p className="mt-3 text-sm">
                        <strong>Unit price:</strong> {formatMoney(product.priceCents, product.currency)}
                      </p>
                    </div>
                    <div className="grid gap-4 md:min-w-44 md:justify-items-end">
                      <div className="inline-grid grid-cols-[40px_56px_40px] border border-line">
                        <button
                          type="button"
                          className="grid h-10 place-items-center hover:bg-panel"
                          onClick={() => updateItem(product.slug, quantity - 1)}
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          aria-label={`${product.name} quantity`}
                          value={quantity}
                          onChange={(event) => updateItem(product.slug, Number(event.target.value))}
                          className="h-10 border-x border-line text-center font-black outline-none"
                          inputMode="numeric"
                        />
                        <button
                          type="button"
                          className="grid h-10 place-items-center hover:bg-panel"
                          onClick={() => updateItem(product.slug, quantity + 1)}
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <strong className="text-lg">{formatMoney(lineTotal, product.currency)}</strong>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm font-black text-red-700"
                        onClick={() => removeItem(product.slug)}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {crossSell.length > 0 && (
                <div className="border-t-4 border-panel p-5">
                  <h2 className="text-lg font-black">You may also need</h2>
                  <p className="mt-1 text-sm text-steel">Parts that fit the engines in your cart — add before checkout.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {crossSell.map((product) => (
                      <div key={product.slug} className="grid border border-line p-4">
                        <Link href={`/products/${product.slug}`} className="mb-3 grid aspect-[4/3] place-items-center overflow-hidden bg-panel industrial-grid">
                          {product.image || product.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image || product.images?.[0]?.url}
                              alt={product.name}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-2xl font-black text-navy">{product.name.split(" ")[0]}</span>
                          )}
                        </Link>
                        <Link href={`/products/${product.slug}`} className="text-sm font-black leading-snug hover:text-navy">
                          {product.name}
                        </Link>
                        {product.fitmentType === "UNIVERSAL" && (
                          <span className="mt-1 text-xs font-bold text-navy">Universal — fits all small engines</span>
                        )}
                        <strong className="mt-2">{formatMoney(product.priceCents, product.currency)}</strong>
                        <AddToCartButton slug={product.slug} name={product.name} className="mt-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside className="h-fit border border-line bg-white p-6">
              <h2 className="text-2xl font-black">Order Summary</h2>
              <form onSubmit={handleApplyCoupon} className="mt-5 grid gap-3 border-b border-line pb-5">
                <label className="grid gap-2 text-sm font-bold">
                  Coupon code
                  <div className="grid grid-cols-[1fr_auto] border border-line">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      className="min-w-0 px-3 py-2 font-normal uppercase outline-none"
                      placeholder="WELCOME10"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon}
                      className="inline-flex items-center gap-2 bg-navy px-3 text-sm font-black text-white disabled:opacity-60"
                    >
                      <TicketPercent size={16} />
                      {isApplyingCoupon ? "Applying" : "Apply"}
                    </button>
                  </div>
                </label>
                {appliedCoupon && (
                  <div className="flex items-center justify-between gap-3 border border-green-200 bg-green-50 p-3 text-sm">
                    <span className="font-bold text-green-800">{appliedCoupon.label} applied</span>
                    <button type="button" className="font-black text-navy" onClick={() => setAppliedCoupon(null)}>
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{couponError}</p>}
              </form>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">Items</dt>
                  <dd className="font-black">{totalQuantity}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">Subtotal</dt>
                  <dd className="font-black">{formatMoney(subtotal, "usd")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">Shipping</dt>
                  <dd className="font-black">{formatMoney(shippingCents, "usd")}</dd>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between gap-4 text-green-800">
                    <dt className="font-bold">Discount</dt>
                    <dd className="font-black">-{formatMoney(discountCents, "usd")}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
                  <dt className="font-black">Estimated Total</dt>
                  <dd className="font-black">{formatMoney(estimatedTotal, "usd")}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck size={18} />
                {isCheckingOut ? "Creating Checkout..." : "Proceed to Stripe Checkout"}
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 inline-flex h-11 w-full items-center justify-center border border-line px-4 font-black text-navy hover:bg-panel"
              >
                Clear Cart
              </button>
              {checkoutError && (
                <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
                  {checkoutError}
                </p>
              )}
              <p className="mt-4 text-xs leading-5 text-steel">
                Checkout is powered by Stripe. No card data is stored by this site.
              </p>
              <TrustBadges className="mt-4 border-t border-line pt-4" />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
