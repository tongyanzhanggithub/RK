import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import {
  syncChargeDispute,
  syncChargeRefund,
  syncCheckoutSession,
  syncPaymentIntentFailure,
  syncPaymentIntentSucceeded
} from "@/lib/stripe-order-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_webhook_validation_only");
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let order = null;

  switch (event.type) {
    case "checkout.session.completed":
      order = await syncCheckoutSession(event.data.object, event);
      break;
    case "checkout.session.async_payment_succeeded":
      order = await syncCheckoutSession(event.data.object, event, "PAID");
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      order = await syncCheckoutSession(event.data.object, event, "FAILED");
      break;
    case "payment_intent.payment_failed":
      order = await syncPaymentIntentFailure(event.data.object, event);
      break;
    case "payment_intent.succeeded":
      order = await syncPaymentIntentSucceeded(event.data.object, event);
      break;
    case "charge.refunded":
      order = await syncChargeRefund(event.data.object, event);
      break;
    case "charge.dispute.created":
    case "charge.dispute.closed":
      order = await syncChargeDispute(event.data.object, event);
      break;
    default:
      return NextResponse.json({ received: true, handled: false, eventType: event.type });
  }

  return NextResponse.json({
    received: true,
    handled: true,
    eventType: event.type,
    orderId: order?.id || null
  });
}
