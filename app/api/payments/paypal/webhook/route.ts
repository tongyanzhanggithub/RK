import { NextResponse, type NextRequest } from "next/server";
import { markOrderPaid, recordRefund } from "@/lib/order-settlement";
import { verifyPayPalWebhook } from "@/lib/payments/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Backstop for the redirect capture: if the buyer closes the tab before being
// redirected back, PayPal's webhook still settles the order. markOrderPaid is
// idempotent, so capture + webhook firing for the same order is safe.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const verified = await verifyPayPalWebhook(request.headers, rawBody);
  if (!verified) {
    return NextResponse.json({ error: "Webhook signature not verified." }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const type = event?.event_type as string | undefined;
  const resource = event?.resource;
  const orderId: string | null = resource?.custom_id || resource?.supplementary_data?.related_ids?.order_id || null;

  if (type === "PAYMENT.CAPTURE.COMPLETED" && orderId) {
    await markOrderPaid(orderId, {
      provider: "paypal",
      transactionId: resource?.id || null,
      actor: "paypal-webhook"
    });
  } else if ((type === "PAYMENT.CAPTURE.REFUNDED" || type === "PAYMENT.CAPTURE.REVERSED") && orderId) {
    // Prefer PayPal's cumulative total_refunded_amount; fall back to this event's amount.
    const cumulative =
      resource?.seller_payable_breakdown?.total_refunded_amount?.value ?? resource?.amount?.value ?? 0;
    await recordRefund(orderId, Math.round(Number(cumulative) * 100), "paypal-webhook");
  }

  return NextResponse.json({ received: true, handled: Boolean(orderId), eventType: type || null });
}
