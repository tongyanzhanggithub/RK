import { NextResponse, type NextRequest } from "next/server";
import { markOrderPaid } from "@/lib/order-settlement";
import { capturePayPalOrder, paypalConfigured } from "@/lib/payments/paypal";

export const runtime = "nodejs";

// PayPal redirects the buyer back here after approval:
//   /api/payments/paypal/capture?token=<paypalOrderId>&PayerID=...
// We capture the funds, settle the order, then redirect to the result page.
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const paypalOrderId = request.nextUrl.searchParams.get("token");

  if (!paypalConfigured() || !paypalOrderId) {
    return NextResponse.redirect(`${base}/checkout/cancel`);
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);
    if (capture.status !== "COMPLETED" || !capture.orderId) {
      return NextResponse.redirect(`${base}/checkout/cancel`);
    }
    await markOrderPaid(capture.orderId, {
      provider: "paypal",
      transactionId: capture.captureId,
      actor: "paypal-capture",
      customer: {
        name: capture.payer.name || undefined,
        email: capture.payer.email || undefined,
        country: capture.payer.country || undefined,
        city: capture.payer.city ?? undefined,
        address: capture.payer.address ?? undefined,
        postalCode: capture.payer.postalCode ?? undefined
      }
    });
    return NextResponse.redirect(`${base}/checkout/success?order=${capture.orderId}`);
  } catch {
    return NextResponse.redirect(`${base}/checkout/cancel`);
  }
}
