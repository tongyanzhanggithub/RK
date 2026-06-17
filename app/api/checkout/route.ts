import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { chargeCurrency, localChargeMinor, REGION_COOKIE, resolveCountry } from "@/lib/region";
import { SHIPPING_CENTS } from "@/lib/shipping";

export const runtime = "nodejs";

type CheckoutPayload = {
  couponCode?: unknown;
  items?: {
    slug?: unknown;
    quantity?: unknown;
  }[];
};

function normalizeQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99, Math.floor(quantity)));
}

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

function createOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `RK-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_")) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env and restart the dev server." },
      { status: 500 }
    );
  }

  let payload: CheckoutPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const requestedItems = Array.isArray(payload.items) ? payload.items : [];
  const normalizedItems = requestedItems
    .map((item) => ({
      slug: typeof item.slug === "string" ? item.slug : "",
      quantity: normalizeQuantity(item.quantity)
    }))
    .filter((item) => item.slug);

  // Enable only after Stripe Tax is configured in the dashboard. With inclusive
  // behaviour the listed price already contains VAT; Stripe breaks the VAT out and
  // reports it as amount_tax (synced into order.taxCents and shown on receipts).
  const inclusiveTax = process.env.STRIPE_AUTOMATIC_TAX === "1";

  // Multi-currency: when enabled, charge in the visitor's local currency (if it is
  // a chargeable one) using the region FX rate. Off by default → charge USD.
  const multiCurrency = process.env.STRIPE_MULTICURRENCY === "1";
  const country = resolveCountry(request.cookies.get(REGION_COOKIE)?.value);
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

  const lineItems = orderLines
    .map(({ product, quantity }) => {
      return {
        price_data: {
          currency: curLower,
          ...(inclusiveTax ? { tax_behavior: "inclusive" as const } : {}),
          product_data: {
            name: product.name,
            description: product.shortDescription,
            metadata: {
              slug: product.slug,
              category: product.category
            }
          },
          unit_amount: amt(product.priceCents)
        },
        quantity
      };
    })
    .filter(Boolean) as Stripe.Checkout.SessionCreateParams.LineItem[];

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty or products are unavailable." }, { status: 400 });
  }

  const outOfStock = orderLines.filter((line) => (line.product.stock ?? 0) < line.quantity);
  if (outOfStock.length > 0) {
    const names = outOfStock
      .map((line) => `${line.product.name} (only ${line.product.stock ?? 0} left)`)
      .join(", ");
    return NextResponse.json(
      { error: `Some items are out of stock or exceed available quantity: ${names}` },
      { status: 409 }
    );
  }

  const stripe = new Stripe(secretKey);
  const baseUrl = getBaseUrl(request);
  const subtotalCents = orderLines.reduce((total, line) => total + line.product.priceCents * line.quantity, 0);
  const shippingCents = SHIPPING_CENTS;
  const couponCode = normalizeCouponCode(payload.couponCode);
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
    return NextResponse.json({ error: couponValidation.error }, { status: 400 });
  }

  const appliedCoupon = couponValidation?.ok ? couponValidation.result : null;

  // usageCount only increments after payment, so concurrent pending checkouts
  // could exceed a limited coupon. Count recent pending sessions toward the limit.
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
      return NextResponse.json(
        { error: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }
  }
  const discountCents = appliedCoupon?.discountCents || 0;
  // Amounts recorded in the CHARGE currency so the order/emails match Stripe.
  const subtotalCharged = orderLines.reduce((total, line) => total + amt(line.product.priceCents) * line.quantity, 0);
  const shippingCharged = amt(shippingCents);
  const discountCharged = amt(discountCents);
  const order = await prisma.order.create({
    data: {
      orderNumber: createOrderNumber(),
      couponId: appliedCoupon?.coupon.id || null,
      couponCode: appliedCoupon?.code || null,
      couponType: appliedCoupon?.type || null,
      couponValue: appliedCoupon?.value || null,
      customerName: "Stripe Checkout Customer",
      customerEmail: "pending@checkout.local",
      country: "Pending",
      currency: curLower,
      subtotalCents: subtotalCharged,
      shippingCents: shippingCharged,
      taxCents: 0,
      discountCents: discountCharged,
      totalCents: subtotalCharged + shippingCharged - discountCharged,
      paymentMethod: "stripe",
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
  let session: Stripe.Checkout.Session;

  // Stripe amount_off coupons only discount line items, never shipping — a
  // free-shipping coupon must zero the shipping rate itself or small orders
  // would still pay full shipping.
  const isFreeShipping = appliedCoupon?.type === "FREE_SHIPPING";
  const stripeShippingCents = isFreeShipping ? 0 : SHIPPING_CENTS;
  let stripeCoupon: Stripe.Coupon | null = null;

  try {
    stripeCoupon =
      appliedCoupon && !isFreeShipping
        ? await stripe.coupons.create({
            amount_off: amt(appliedCoupon.discountCents),
            currency: curLower,
            duration: "once",
            name: appliedCoupon.label,
            metadata: {
              source: "repairkit-supply",
              couponId: appliedCoupon.coupon.id,
              couponCode: appliedCoupon.code
            }
          })
        : null;

    session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      line_items: lineItems,
      ...(inclusiveTax ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      ...(stripeCoupon
        ? { discounts: [{ coupon: stripeCoupon.id }] }
        : appliedCoupon
          ? {}
          : { allow_promotion_codes: true }),
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [
          // Core / English-speaking
          "US", "CA", "GB", "AU",
          // Middle East
          "AE", "SA", "QA", "KW", "OM", "BH", "JO", "TR",
          // Central Asia & Caucasus
          "KZ", "UZ", "KG", "GE", "AZ",
          // Southeast Asia
          "SG", "MY", "TH", "PH", "ID", "VN", "KH"
        ]
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: amt(stripeShippingCents),
              currency: curLower
            },
            ...(inclusiveTax ? { tax_behavior: "inclusive" as const } : {}),
            display_name: isFreeShipping
              ? "Standard international shipping (free with coupon)"
              : "Standard international shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 7
              },
              maximum: {
                unit: "business_day",
                value: 15
              }
            }
          }
        }
      ],
      metadata: {
        source: "repairkit-supply",
        orderId: order.id,
        orderNumber: order.orderNumber,
        couponCode: appliedCoupon?.code || ""
      },
      payment_intent_data: {
        metadata: {
          source: "repairkit-supply",
          orderId: order.id,
          orderNumber: order.orderNumber,
          couponCode: appliedCoupon?.code || ""
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe Checkout session creation failed.";
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        internalNote: `Stripe Checkout session failed: ${message}`
      }
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (stripeCoupon) {
    // One-time coupon is already attached to the session; delete the template
    // so abandoned checkouts don't pile up coupons in the Stripe dashboard.
    try {
      await stripe.coupons.del(stripeCoupon.id);
    } catch {
      // Cleanup failure is harmless — the coupon simply stays in Stripe.
    }
  }

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id }
  });

  return NextResponse.json({ url: session.url });
}
