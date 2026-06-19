import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { buildOrderDraft } from "@/lib/payments/order-draft";
import { createPayPalOrder, paypalConfigured } from "@/lib/payments/paypal";
import { REGION_COOKIE } from "@/lib/region";

export const runtime = "nodejs";

type Payload = { couponCode?: unknown; items?: { slug?: unknown; quantity?: unknown }[]; email?: unknown };

function baseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "PayPal 未配置（缺少 PAYPAL_CLIENT_ID / PAYPAL_SECRET）。" }, { status: 503 });
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const draft = await buildOrderDraft({
    provider: "paypal",
    items: (payload.items as { slug: string; quantity: number }[]) || [],
    couponCode: payload.couponCode,
    email: payload.email,
    countryCookie: request.cookies.get(REGION_COOKIE)?.value
  });
  if ("error" in draft) {
    return NextResponse.json({ error: draft.error }, { status: draft.status });
  }

  const url = baseUrl(request);
  try {
    const pp = await createPayPalOrder({
      orderId: draft.order.id,
      orderNumber: draft.order.orderNumber,
      amountValue: (draft.totalMinor / 100).toFixed(2),
      currency: draft.chargeCurrency,
      returnUrl: `${url}/api/payments/paypal/capture`,
      cancelUrl: `${url}/checkout/cancel`
    });
    await prisma.order.update({ where: { id: draft.order.id }, data: { paymentRef: pp.id } });
    return NextResponse.json({ url: pp.approveUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayPal order creation failed.";
    await prisma.order.update({
      where: { id: draft.order.id },
      data: { paymentStatus: "FAILED", internalNote: `PayPal create failed: ${message}` }
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
