import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation";
import { sendRefundNotificationEmail } from "@/lib/refund-notification";
import {
  paymentStatusAfter,
  reduceInventoryForOrder,
  syncCustomerFromOrder,
  type PaymentStatus
} from "@/lib/order-settlement";

type StripeEventReference = {
  id: string;
  type: string;
  created: number;
};

function objectId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function countryName(code: string | null | undefined) {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function shippingAddress(session: Stripe.Checkout.Session) {
  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address || session.customer_details?.address;
  if (!address) return null;

  return [address.line1, address.line2, address.state].filter(Boolean).join(", ") || null;
}

async function findOrderForSession(session: Stripe.Checkout.Session) {
  const identifiers = [
    session.metadata?.orderId ? { id: session.metadata.orderId } : null,
    session.id ? { stripeCheckoutSessionId: session.id } : null,
    session.metadata?.orderNumber ? { orderNumber: session.metadata.orderNumber } : null,
    session.client_reference_id ? { id: session.client_reference_id } : null
  ].filter(Boolean) as { id?: string; stripeCheckoutSessionId?: string; orderNumber?: string }[];

  if (identifiers.length === 0) return null;
  return prisma.order.findFirst({ where: { OR: identifiers } });
}

function syncReference(event: StripeEventReference, lastSyncedAt: Date | null) {
  const eventDate = new Date(event.created * 1000);
  if (lastSyncedAt && lastSyncedAt > eventDate) return {};

  return {
    stripeLastEventId: event.id,
    stripeLastEventType: event.type,
    stripeLastSyncedAt: eventDate
  };
}

export async function syncCheckoutSession(
  session: Stripe.Checkout.Session,
  event: StripeEventReference,
  requestedStatus?: PaymentStatus
) {
  const order = await findOrderForSession(session);
  if (!order) return null;

  const details = session.customer_details;
  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address || details?.address;
  const subtotalCents = session.amount_subtotal ?? order.subtotalCents;
  const shippingCents = session.shipping_cost?.amount_total ?? order.shippingCents;
  const taxCents = session.total_details?.amount_tax ?? order.taxCents;
  const totalCents = session.amount_total ?? order.totalCents;
  const discountCents = Math.max(0, subtotalCents + shippingCents + taxCents - totalCents);
  const paymentStatus = requestedStatus || (session.payment_status === "paid" ? "PAID" : "PENDING");
  const finalStatus = paymentStatusAfter(order.paymentStatus, paymentStatus);

  let updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: objectId(session.payment_intent),
      customerName: shipping?.name || details?.name || order.customerName,
      customerEmail: details?.email || session.customer_email || order.customerEmail,
      customerPhone: details?.phone || order.customerPhone,
      country: countryName(address?.country) || order.country,
      city: address?.city || order.city,
      shippingAddress: shippingAddress(session) || order.shippingAddress,
      postalCode: address?.postal_code || order.postalCode,
      currency: session.currency || order.currency,
      subtotalCents,
      shippingCents,
      taxCents,
      discountCents,
      totalCents,
      paymentStatus: finalStatus,
      paymentFailureMessage: finalStatus === "FAILED" ? "Stripe reported that the payment was not completed." : null,
      paidAt: finalStatus === "PAID" && !order.paidAt ? new Date(event.created * 1000) : order.paidAt,
      ...syncReference(event, order.stripeLastSyncedAt)
    }
  });

  if (finalStatus === "PAID" && updatedOrder.couponId && !updatedOrder.couponUsageRecorded) {
    const couponId = updatedOrder.couponId;
    updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } }
      });
      return tx.order.update({
        where: { id: updatedOrder.id },
        data: { couponUsageRecorded: true }
      });
    });
  }

  if (finalStatus === "PAID" && !updatedOrder.inventoryReduced) {
    await reduceInventoryForOrder(updatedOrder.id, "stripe-webhook");
  }

  if (finalStatus === "PAID") {
    await sendOrderConfirmationEmail(updatedOrder.id);
  }

  return syncCustomerFromOrder(updatedOrder);
}

async function findOrderForPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  return prisma.order.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ id: orderId }] : []),
        { stripePaymentIntentId: paymentIntent.id }
      ]
    }
  });
}

export async function syncPaymentIntentFailure(paymentIntent: Stripe.PaymentIntent, event: StripeEventReference) {
  const order = await findOrderForPaymentIntent(paymentIntent);
  if (!order) return null;
  const finalStatus = paymentStatusAfter(order.paymentStatus, "FAILED");

  return prisma.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: finalStatus,
      paymentFailureMessage:
        finalStatus === "FAILED"
          ? paymentIntent.last_payment_error?.message || "Stripe reported that the payment failed."
          : null,
      ...syncReference(event, order.stripeLastSyncedAt)
    }
  });
}

export async function syncPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, event: StripeEventReference) {
  const order = await findOrderForPaymentIntent(paymentIntent);
  if (!order) return null;

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: paymentStatusAfter(order.paymentStatus, "PAID"),
      paymentFailureMessage: null,
      paidAt: order.paidAt || new Date(event.created * 1000),
      ...syncReference(event, order.stripeLastSyncedAt)
    }
  });

  if (updatedOrder.paymentStatus === "PAID" && !updatedOrder.inventoryReduced) {
    await reduceInventoryForOrder(updatedOrder.id, "stripe-webhook");
  }

  if (updatedOrder.paymentStatus === "PAID") {
    await sendOrderConfirmationEmail(updatedOrder.id);
  }

  return updatedOrder;
}

export async function syncChargeRefund(charge: Stripe.Charge, event: StripeEventReference) {
  const paymentIntentId = objectId(charge.payment_intent);
  if (!paymentIntentId) return null;

  const orderId = charge.metadata?.orderId;
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ id: orderId }] : []),
        { stripePaymentIntentId: paymentIntentId }
      ]
    }
  });
  if (!order) return null;

  const refundedCents = Math.max(order.refundedCents, charge.amount_refunded);
  const fullyRefunded = refundedCents >= charge.amount;
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      stripePaymentIntentId: paymentIntentId,
      refundedCents,
      paymentStatus: fullyRefunded ? "REFUNDED" : paymentStatusAfter(order.paymentStatus, "PAID"),
      paymentFailureMessage: null,
      ...syncReference(event, order.stripeLastSyncedAt)
    }
  });

  // Notify the buyer once a refund has actually been recorded.
  if (refundedCents > 0) {
    await sendRefundNotificationEmail(updated.id);
  }

  return updated;
}

export async function syncChargeRisk(charge: Stripe.Charge, event: StripeEventReference) {
  const paymentIntentId = objectId(charge.payment_intent);
  if (!paymentIntentId) return null;
  const order = await prisma.order.findFirst({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!order) return null;

  const level = charge.outcome?.risk_level;
  const score = typeof charge.outcome?.risk_score === "number" ? charge.outcome.risk_score : null;
  if (!level && score === null) return order;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { riskLevel: level || order.riskLevel, riskScore: score ?? order.riskScore }
  });
  if (level === "elevated" || level === "highest") {
    await logOrderEvent(order.id, "RISK", `Stripe 风控：${level}${score !== null ? `（评分 ${score}）` : ""}`, "stripe-webhook");
  }
  return updated;
}

export async function syncChargeDispute(dispute: Stripe.Dispute, event: StripeEventReference) {
  const paymentIntentId = objectId(dispute.payment_intent);
  const chargeId = objectId(dispute.charge);
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
        ...(chargeId ? [{ stripePaymentIntentId: chargeId }] : [])
      ]
    }
  });
  if (!order) return null;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { disputeStatus: dispute.status, ...syncReference(event, order.stripeLastSyncedAt) }
  });
  await logOrderEvent(order.id, "DISPUTE", `收到拒付/争议：${dispute.status}（理由 ${dispute.reason}）`, "stripe-webhook");
  return updated;
}
