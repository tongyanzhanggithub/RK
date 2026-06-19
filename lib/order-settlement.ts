// Provider-neutral order settlement.
//
// The "mark an order paid" path (status + coupon usage + inventory + confirmation
// email + customer upsert) is identical no matter which gateway took the money —
// Stripe, PayPal, Airwallex. This module is the single source of truth for it so
// every payment provider funnels through the same, tested logic.
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation";
import { sendLowStockAlert, type LowStockItem } from "@/lib/stock-alert";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type CustomerOrderData = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerWhatsapp: string | null;
  country: string;
  city: string | null;
  shippingAddress: string | null;
  postalCode: string | null;
};

// A status transition guard: never downgrade a terminal/forward state by a
// late or out-of-order event.
export function paymentStatusAfter(currentStatus: string, nextStatus: PaymentStatus) {
  if (currentStatus === "REFUNDED" && nextStatus !== "REFUNDED") return currentStatus;
  if (currentStatus === "PAID" && (nextStatus === "PENDING" || nextStatus === "FAILED")) return currentStatus;
  if (currentStatus === "FAILED" && nextStatus === "PENDING") return currentStatus;
  return nextStatus;
}

export async function syncCustomerFromOrder(order: CustomerOrderData) {
  const email = order.customerEmail.trim().toLowerCase();
  if (!email || email.endsWith("@checkout.local")) return order;

  const customer = await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      name: order.customerName,
      phone: order.customerPhone,
      whatsapp: order.customerWhatsapp,
      country: order.country,
      city: order.city,
      address: order.shippingAddress,
      postalCode: order.postalCode,
      status: "ACTIVE",
      tags: "[]"
    },
    update: {
      name: order.customerName,
      phone: order.customerPhone,
      whatsapp: order.customerWhatsapp,
      country: order.country,
      city: order.city,
      address: order.shippingAddress,
      postalCode: order.postalCode
    }
  });

  return prisma.order.update({
    where: { id: order.id },
    data: { customerId: customer.id }
  });
}

export async function reduceInventoryForOrder(orderId: string, actor = "system") {
  const lowStock: LowStockItem[] = [];

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    if (!order || order.inventoryReduced) return;

    const shortages: string[] = [];

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      if (product.stock < item.quantity) {
        shortages.push(`${item.productName}: paid ${item.quantity}, stock was ${product.stock}`);
      }
      const stockAfter = Math.max(0, product.stock - item.quantity);
      const delta = stockAfter - product.stock;
      if (delta === 0) continue;

      // Alert when stock newly crosses to/below its low threshold.
      const threshold = product.lowStockThreshold ?? 5;
      if (product.stock > threshold && stockAfter <= threshold) {
        lowStock.push({ name: product.name, sku: product.sku, stockAfter, threshold });
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: stockAfter }
      });
      await tx.inventoryAdjustment.create({
        data: {
          productId: product.id,
          type: "SALE",
          quantityDelta: delta,
          stockBefore: product.stock,
          stockAfter,
          reason: "Paid order",
          reference: order.orderNumber,
          createdBy: actor
        }
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        inventoryReduced: true,
        ...(shortages.length > 0
          ? {
              internalNote: [order.internalNote, `OVERSOLD — check before fulfilling: ${shortages.join("; ")}`]
                .filter(Boolean)
                .join("\n")
            }
          : {})
      }
    });
  });

  await sendLowStockAlert(lowStock);
}

async function recordCouponUsage(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.couponId || order.couponUsageRecorded) return;
  const couponId = order.couponId;
  await prisma.$transaction(async (tx) => {
    await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
    await tx.order.update({ where: { id: order.id }, data: { couponUsageRecorded: true } });
  });
}

type MarkPaidOptions = {
  provider: string; // "paypal" | "airwallex" | ...
  transactionId?: string | null; // gateway capture/transaction id
  paidAt?: Date;
  actor?: string; // who/what recorded it (e.g. "paypal-webhook")
  customer?: Partial<{
    name: string;
    email: string;
    phone: string | null;
    country: string;
    city: string | null;
    address: string | null;
    postalCode: string | null;
  }>;
};

// Idempotent: marks an order PAID and runs the shared post-payment side effects
// exactly once (coupon usage, inventory reduction, confirmation email, customer
// upsert). Safe to call from both a redirect-capture and a webhook for the same
// order — the second call is a no-op for the one-time effects.
export async function markOrderPaid(orderId: string, opts: MarkPaidOptions) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return null;

  const finalStatus = paymentStatusAfter(existing.paymentStatus, "PAID");
  const actor = opts.actor || `${opts.provider}`;
  const c = opts.customer;

  let order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentMethod: opts.provider,
      paymentRef: opts.transactionId ?? existing.paymentRef,
      paymentStatus: finalStatus,
      paymentFailureMessage: null,
      paidAt: finalStatus === "PAID" && !existing.paidAt ? opts.paidAt || new Date() : existing.paidAt,
      ...(c?.name ? { customerName: c.name } : {}),
      ...(c?.email ? { customerEmail: c.email } : {}),
      ...(c?.phone !== undefined ? { customerPhone: c.phone } : {}),
      ...(c?.country ? { country: c.country } : {}),
      ...(c?.city !== undefined ? { city: c.city } : {}),
      ...(c?.address !== undefined ? { shippingAddress: c.address } : {}),
      ...(c?.postalCode !== undefined ? { postalCode: c.postalCode } : {})
    }
  });

  if (finalStatus !== "PAID") return order;

  // Log the transition only when it newly becomes PAID (existing was not PAID).
  if (existing.paymentStatus !== "PAID") {
    await logOrderEvent(orderId, "PAYMENT", `支付成功（${opts.provider}${opts.transactionId ? ` · ${opts.transactionId}` : ""}）`, actor);
  }

  await recordCouponUsage(orderId);
  if (!order.inventoryReduced) await reduceInventoryForOrder(orderId, actor);
  await sendOrderConfirmationEmail(orderId);
  await syncCustomerFromOrder(order);

  // Return a fresh read so the result reflects inventory/customer side effects.
  return prisma.order.findUnique({ where: { id: orderId } });
}

// Provider-neutral refund recorder (PayPal / Airwallex webhooks call this).
// `cumulativeRefundedMinor` is the total refunded to date for the order; taking
// the max with what's on file keeps a retried webhook idempotent.
export async function recordRefund(orderId: string, cumulativeRefundedMinor: number, actor: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;
  const refundedCents = Math.max(order.refundedCents, cumulativeRefundedMinor);
  const fullyRefunded = refundedCents >= order.totalCents;
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      refundedCents,
      paymentStatus: fullyRefunded ? "REFUNDED" : paymentStatusAfter(order.paymentStatus, "PAID")
    }
  });
  await logOrderEvent(orderId, "REFUND", `退款 ${(refundedCents / 100).toFixed(2)}${fullyRefunded ? "（全额）" : "（部分）"}`, actor);
  return updated;
}
