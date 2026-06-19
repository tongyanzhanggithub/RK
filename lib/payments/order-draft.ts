// Shared "create our PENDING order" logic, provider-neutral.
//
// Both the gateway redirect (PayPal/Airwallex) and—eventually—Stripe build the
// same draft order: validate cart, check stock, apply/validate coupon, compute
// amounts in the charge currency, and create the PENDING order + items. The
// provider-specific call (create a PayPal order, an Airwallex intent, a Stripe
// session) happens after, using the returned order.
import crypto from "crypto";
import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { chargeCurrency, localChargeMinor, resolveCountry } from "@/lib/region";
import { computeShippingCents, DEFAULT_ITEM_WEIGHT_G } from "@/lib/shipping";

export type DraftItem = { slug: string; quantity: number };

export type OrderDraft = {
  order: Awaited<ReturnType<typeof prisma.order.create>>;
  chargeCurrency: string; // upper-case, e.g. "GBP"
  totalMinor: number; // amount to charge, in minor units of chargeCurrency
};

export type DraftFailure = { error: string; status: number };

export function createOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `RK-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function normalizeQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99, Math.floor(quantity)));
}

type BuildArgs = {
  provider: string; // stored as Order.paymentMethod
  items: DraftItem[];
  couponCode?: unknown;
  countryCookie?: string;
  email?: unknown; // optional buyer email captured at cart (enables abandoned-cart reminders)
};

function normalizeEmail(value: unknown): string | null {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function buildOrderDraft(args: BuildArgs): Promise<OrderDraft | DraftFailure> {
  const normalizedItems = (Array.isArray(args.items) ? args.items : [])
    .map((item) => ({ slug: typeof item.slug === "string" ? item.slug : "", quantity: normalizeQuantity(item.quantity) }))
    .filter((item) => item.slug);

  const multiCurrency = process.env.STRIPE_MULTICURRENCY === "1";
  const country = resolveCountry(args.countryCookie);
  const chargeCur = multiCurrency ? chargeCurrency(country) : "USD";
  const curLower = chargeCur.toLowerCase();
  const amt = (usdCents: number) => localChargeMinor(usdCents, chargeCur);

  const products = await getStoreProducts();
  const orderLines = normalizedItems
    .map((item) => {
      const product = products.find((candidate) => candidate.slug === item.slug);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter(Boolean) as { product: Awaited<ReturnType<typeof getStoreProducts>>[number]; quantity: number }[];

  if (orderLines.length === 0) {
    return { error: "Cart is empty or products are unavailable.", status: 400 };
  }

  const outOfStock = orderLines.filter((line) => (line.product.stock ?? 0) < line.quantity);
  if (outOfStock.length > 0) {
    const names = outOfStock.map((line) => `${line.product.name} (only ${line.product.stock ?? 0} left)`).join(", ");
    return { error: `Some items are out of stock or exceed available quantity: ${names}`, status: 409 };
  }

  // 按目的国分区 + 总重量计算运费(满额包邮)。重量缺失的商品按默认克重估算。
  const subtotalUsdCents = orderLines.reduce((total, line) => total + line.product.priceCents * line.quantity, 0);
  const totalWeightG = orderLines.reduce((total, line) => total + (line.product.weightGrams ?? DEFAULT_ITEM_WEIGHT_G) * line.quantity, 0);
  const shippingCents = computeShippingCents({ countryCode: country.code, weightGrams: totalWeightG, subtotalCents: subtotalUsdCents });
  const couponCode = normalizeCouponCode(args.couponCode);
  const coupon = couponCode ? await prisma.coupon.findUnique({ where: { code: couponCode } }) : null;
  const couponValidation = couponCode
    ? calculateCouponDiscount({
        coupon,
        lines: orderLines.map((line) => ({
          priceCents: line.product.priceCents,
          quantity: line.quantity,
          allowCoupons: line.product.allowCoupons
        })),
        shippingCents
      })
    : null;

  if (couponValidation && !couponValidation.ok) {
    return { error: couponValidation.error, status: 400 };
  }
  const appliedCoupon = couponValidation?.ok ? couponValidation.result : null;

  // Same pending-usage guard as the Stripe path: count recent unpaid orders
  // holding a limited coupon so concurrent checkouts can't exceed the cap.
  if (appliedCoupon && appliedCoupon.coupon.usageLimit !== null) {
    const pendingRecent = await prisma.order.count({
      where: {
        couponId: appliedCoupon.coupon.id,
        couponUsageRecorded: false,
        paymentStatus: "PENDING",
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) }
      }
    });
    if (appliedCoupon.coupon.usageCount + pendingRecent >= appliedCoupon.coupon.usageLimit) {
      return { error: "This coupon has reached its usage limit.", status: 400 };
    }
  }

  const discountCents = appliedCoupon?.discountCents || 0;
  const subtotalCharged = orderLines.reduce((total, line) => total + amt(line.product.priceCents) * line.quantity, 0);
  const shippingCharged = amt(shippingCents);
  const discountCharged = amt(discountCents);
  const totalMinor = subtotalCharged + shippingCharged - discountCharged;

  const order = await prisma.order.create({
    data: {
      orderNumber: createOrderNumber(),
      couponId: appliedCoupon?.coupon.id || null,
      couponCode: appliedCoupon?.code || null,
      couponType: appliedCoupon?.type || null,
      couponValue: appliedCoupon?.value || null,
      customerName: "Pending Customer",
      customerEmail: normalizeEmail(args.email) || "pending@checkout.local",
      country: "Pending",
      currency: curLower,
      subtotalCents: subtotalCharged,
      shippingCents: shippingCharged,
      taxCents: 0,
      discountCents: discountCharged,
      totalCents: totalMinor,
      paymentMethod: args.provider,
      paymentStatus: "PENDING",
      orderStatus: "PROCESSING",
      fulfillmentStatus: "UNFULFILLED",
      items: {
        create: orderLines.map((line) => ({
          productId: line.product.id,
          productName: line.product.name,
          productSlug: line.product.slug,
          sku: line.product.sku || line.product.slug,
          unitPriceCents: amt(line.product.priceCents),
          quantity: line.quantity,
          subtotalCents: amt(line.product.priceCents) * line.quantity,
          image: line.product.image || null
        }))
      }
    }
  });

  return { order, chargeCurrency: chargeCur, totalMinor };
}
