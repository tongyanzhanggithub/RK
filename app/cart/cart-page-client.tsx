"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banknote, Minus, Plus, ShieldCheck, TicketPercent, Trash2 } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { TrustBadges } from "@/components/trust-badges";
import { useCart } from "@/components/cart-provider";
import { useLanguage } from "@/components/language-provider";
import { useRegion } from "@/components/region-provider";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/format";
import type { PaymentOption } from "@/lib/payments/types";
import { DEFAULT_ITEM_WEIGHT_G, shippingQuote } from "@/lib/shipping";

type CartPageClientProps = {
  products: Product[];
  paymentOptions: PaymentOption[];
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

export function CartPageClient({ products, paymentOptions }: CartPageClientProps) {
  const { items, updateItem, removeItem, clearCart, totalQuantity } = useCart();
  const { dict } = useLanguage();
  const c = dict.cart;
  const { local, isUsd, country, charged } = useRegion();
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [email, setEmail] = useState("");
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
  const guaranteedCount = lines.filter((line) => line.product.fitmentGuaranteed).length;
  // 按目的国分区 + 总重量算运费(满额包邮)。重量缺失按默认克重估算。
  const totalWeightG = lines.reduce((total, line) => total + (line.product.weightGrams ?? DEFAULT_ITEM_WEIGHT_G) * line.quantity, 0);
  const shipping = shippingQuote({ countryCode: country.code, weightGrams: totalWeightG, subtotalCents: subtotal });
  const shippingCents = shipping.cents;
  const discountCents = appliedCoupon?.discountCents || 0;
  const estimatedTotal = subtotal + shippingCents - discountCents;
  // Nudge likely-wholesale orders toward bank transfer (T/T), which avoids card
  // processing fees. Threshold in USD cents, or a high quantity.
  const isBulkOrder = subtotal >= 15000 || totalQuantity >= 10;

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

  async function handleCheckout(endpoint: string, providerId: string) {
    setCheckoutError("");
    setPendingProvider(providerId);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ slug: line.product.slug, quantity: line.quantity })),
          couponCode: appliedCoupon?.code || undefined,
          email: email.trim() || undefined
        })
      });
      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout.");
      setPendingProvider(null);
    }
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-safety">{c.badge}</p>
            <h1 className="text-4xl font-black">{c.heading}</h1>
            <p className="mt-3 max-w-3xl text-steel">{c.subtext}</p>
          </div>
          <Link href="/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            {dict.common.continue_shopping}
          </Link>
        </div>

        {lines.length === 0 ? (
          <section className="mt-8 border border-line bg-white p-8">
            <h2 className="text-2xl font-black">{c.empty_heading}</h2>
            <p className="mt-3 text-steel">{c.empty_sub}</p>
            <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
              {c.browse}
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
                        <strong>{c.unit_price}</strong> {local(product.priceCents)}
                      </p>
                      {product.fitmentGuaranteed && (
                        <Link
                          href="/guaranteed-fit"
                          className="mt-2 inline-flex items-center gap-1.5 border border-green-600 bg-green-50 px-2 py-1 text-xs font-black text-green-800 hover:bg-green-100"
                        >
                          <ShieldCheck size={14} /> {c.gfit_item}
                        </Link>
                      )}
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
                      <strong className="text-lg">{local(lineTotal)}</strong>
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
                  <h2 className="text-lg font-black">{c.cross_sell_title}</h2>
                  <p className="mt-1 text-sm text-steel">{c.cross_sell_sub}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {crossSell.map((product) => (
                      <div key={product.slug} className="grid border border-line p-4">
                        <Link href={`/products/${product.slug}`} className="relative mb-3 grid aspect-[4/3] overflow-hidden bg-panel industrial-grid">
                          {product.image || product.images?.[0]?.url ? (
                            <Image
                              src={(product.image || product.images?.[0]?.url) as string}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-contain"
                            />
                          ) : (
                            <span className="absolute inset-0 grid place-items-center text-2xl font-black text-navy">
                              {product.name.split(" ")[0]}
                            </span>
                          )}
                        </Link>
                        <Link href={`/products/${product.slug}`} className="text-sm font-black leading-snug hover:text-navy">
                          {product.name}
                        </Link>
                        {product.fitmentType === "UNIVERSAL" && (
                          <span className="mt-1 text-xs font-bold text-navy">{dict.common.universal}</span>
                        )}
                        <strong className="mt-2">{local(product.priceCents)}</strong>
                        <AddToCartButton slug={product.slug} name={product.name} className="mt-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside className="h-fit border border-line bg-white p-6">
              <h2 className="text-2xl font-black">{c.order_summary}</h2>
              <form onSubmit={handleApplyCoupon} className="mt-5 grid gap-3 border-b border-line pb-5">
                <label className="grid gap-2 text-sm font-bold">
                  {c.coupon_label}
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
                      {isApplyingCoupon ? c.coupon_applying : c.coupon_apply}
                    </button>
                  </div>
                </label>
                {appliedCoupon && (
                  <div className="flex items-center justify-between gap-3 border border-green-200 bg-green-50 p-3 text-sm">
                    <span className="font-bold text-green-800">{appliedCoupon.label} applied</span>
                    <button type="button" className="font-black text-navy" onClick={() => setAppliedCoupon(null)}>
                      {c.coupon_remove}
                    </button>
                  </div>
                )}
                {couponError && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{couponError}</p>}
              </form>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">{c.items}</dt>
                  <dd className="font-black">{totalQuantity}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">{c.subtotal}</dt>
                  <dd className="font-black">{local(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">{c.shipping}</dt>
                  <dd className="font-black">{shipping.freeApplied ? "Free" : local(shippingCents)}</dd>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between gap-4 text-green-800">
                    <dt className="font-bold">{c.discount}</dt>
                    <dd className="font-black">-{local(discountCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
                  <dt className="font-black">{c.estimated_total}</dt>
                  <dd className="font-black">{local(estimatedTotal)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-steel">
                {country.code !== "INTL" && <>Ships to {country.name}. </>}
                <>Est. delivery {shipping.etaMinDays}–{shipping.etaMaxDays} days. </>
                {!shipping.freeApplied && <>Free shipping over {formatMoney(shipping.freeOverCents, "usd")}. </>}
                {charged && <>You will be charged in {country.currency}. </>}
                {!isUsd && !charged && (
                  <>Amounts in {country.currency} are approximate. Your card is charged {formatMoney(estimatedTotal, "usd")} (USD). </>
                )}
                {country.vat && <>{country.vat}.</>}
              </p>
              {guaranteedCount > 0 && (
                <Link
                  href="/guaranteed-fit"
                  className="mt-5 flex items-start gap-2 border border-green-600 bg-green-50 p-3 text-sm font-bold leading-5 text-green-800 hover:bg-green-100"
                >
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                  {c.gfit_summary.replace("{n}", String(guaranteedCount))}
                </Link>
              )}
              <div className="mt-6">
                <label htmlFor="checkout-email" className="text-xs font-bold text-steel">
                  Email for order updates (optional)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full border border-line px-3 py-2"
                />
              </div>
              {isBulkOrder && (
                <Link
                  href="/quote"
                  className="mt-6 flex items-start gap-2 border border-navy bg-panel p-3 text-sm leading-5 hover:bg-white"
                >
                  <Banknote size={18} className="mt-0.5 shrink-0 text-navy" />
                  <span>
                    <span className="font-black text-navy">{c.bulk_title}</span>
                    <span className="mt-0.5 block font-bold text-steel">{c.bulk_desc}</span>
                    <span className="mt-1 block font-black text-navy underline">{c.bulk_cta} →</span>
                  </span>
                </Link>
              )}
              {paymentOptions.length === 0 ? (
                <p className="mt-6 border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-800">
                  暂未配置支付方式，请联系我们下单。
                </p>
              ) : (
                paymentOptions.map((option, index) => {
                  const busy = pendingProvider === option.id;
                  const isPaypal = option.id === "paypal";
                  const base =
                    "mt-3 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 px-4 py-2 text-center font-black leading-tight disabled:cursor-not-allowed disabled:opacity-60";
                  const tone = isPaypal
                    ? "bg-[#ffc439] text-[#003087] hover:brightness-95"
                    : "bg-safety text-ink hover:bg-amber-400";
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleCheckout(option.endpoint, option.id)}
                      disabled={pendingProvider !== null}
                      className={`${base} ${tone} ${index === 0 ? "mt-6" : ""}`}
                    >
                      {!isPaypal && <ShieldCheck size={18} />}
                      {busy ? c.checking_out : isPaypal ? "PayPal" : c.checkout_btn}
                    </button>
                  );
                })
              )}
              <button
                type="button"
                onClick={clearCart}
                className="mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center border border-line px-4 py-2 text-center font-black leading-tight text-navy hover:bg-panel"
              >
                {c.clear_cart}
              </button>
              {checkoutError && (
                <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
                  {checkoutError}
                </p>
              )}
              <p className="mt-4 text-xs leading-5 text-steel">
                {c.stripe_note}
              </p>
              <TrustBadges className="mt-4 border-t border-line pt-4" />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
