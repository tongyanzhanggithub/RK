import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";

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
  return `RK-${date}-${String(now.getTime()).slice(-6)}`;
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
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.shortDescription,
            metadata: {
              slug: product.slug,
              category: product.category
            }
          },
          unit_amount: product.priceCents
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
  const shippingCents = 1990;
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
  const discountCents = appliedCoupon?.discountCents || 0;
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
      currency: "usd",
      subtotalCents,
      shippingCents,
      taxCents: 0,
      discountCents,
      totalCents: subtotalCents + shippingCents - discountCents,
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
          unitPriceCents: line.product.priceCents,
          quantity: line.quantity,
          subtotalCents: line.product.priceCents * line.quantity,
          image: line.product.image || null
        }))
      }
    }
  });
  let session: Stripe.Checkout.Session;

  try {
    const stripeCoupon = appliedCoupon
      ? await stripe.coupons.create({
          amount_off: appliedCoupon.discountCents,
          currency: "usd",
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
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      ...(stripeCoupon ? { discounts: [{ coupon: stripeCoupon.id }] } : { allow_promotion_codes: true }),
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
              amount: 1990,
              currency: "usd"
            },
            display_name: "Standard international shipping",
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

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id }
  });

  return NextResponse.json({ url: session.url });
}
