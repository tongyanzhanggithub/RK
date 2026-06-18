"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation";
import { sendRefundNotificationEmail } from "@/lib/refund-notification";
import { sendShippingNotificationEmail } from "@/lib/shipping-notification";

export type OrderFormState = {
  error?: string;
};

/** Put stock back when an order is cancelled (reverses the paid-order deduction). */
async function restoreInventoryForOrder(orderId: string, actorEmail: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || !order.inventoryReduced) return;

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const stockAfter = product.stock + item.quantity;
      await tx.product.update({ where: { id: product.id }, data: { stock: stockAfter } });
      await tx.inventoryAdjustment.create({
        data: {
          productId: product.id,
          type: "RETURN",
          quantityDelta: item.quantity,
          stockBefore: product.stock,
          stockAfter,
          reason: "Order cancelled — stock restored",
          reference: order.orderNumber,
          createdBy: actorEmail
        }
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { inventoryReduced: false } });
  });
}

const orderUpdateSchema = z.object({
  orderStatus: z.enum(["PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
  fulfillmentStatus: z.enum(["UNFULFILLED", "PARTIALLY_FULFILLED", "SHIPPED", "FULFILLED", "CANCELLED"]),
  shippingCarrier: z.string().max(120).optional(),
  trackingNumber: z.string().max(160).optional(),
  trackingUrl: z.string().url().or(z.literal("")).optional(),
  shippedAt: z.string().optional(),
  internalNote: z.string().max(3000).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function updateOrder(orderId: string, _prevState: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const admin = await requireAdmin();

  const parsed = orderUpdateSchema.safeParse({
    orderStatus: text(formData, "orderStatus"),
    fulfillmentStatus: text(formData, "fulfillmentStatus"),
    shippingCarrier: text(formData, "shippingCarrier"),
    trackingNumber: text(formData, "trackingNumber"),
    trackingUrl: text(formData, "trackingUrl"),
    shippedAt: text(formData, "shippedAt"),
    internalNote: text(formData, "internalNote")
  });

  if (!parsed.success) {
    return { error: "请检查订单状态、履约状态、物流链接以及内部备注长度。" };
  }

  const before = await prisma.order.findUnique({ where: { id: orderId } });
  if (!before) return { error: "订单不存在。" };

  const shippedAt = parsed.data.shippedAt ? new Date(parsed.data.shippedAt) : null;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus: parsed.data.orderStatus,
      fulfillmentStatus: parsed.data.fulfillmentStatus,
      shippingCarrier: parsed.data.shippingCarrier || null,
      trackingNumber: parsed.data.trackingNumber || null,
      trackingUrl: parsed.data.trackingUrl || null,
      shippedAt,
      internalNote: parsed.data.internalNote || null,
      updatedAt: new Date()
    }
  });

  // Audit: record status transitions.
  if (before.orderStatus !== parsed.data.orderStatus) {
    await logOrderEvent(orderId, "ORDER_STATUS", `订单状态 ${before.orderStatus} → ${parsed.data.orderStatus}`, admin.email);
  }
  if (before.fulfillmentStatus !== parsed.data.fulfillmentStatus) {
    await logOrderEvent(orderId, "FULFILLMENT", `履约状态 ${before.fulfillmentStatus} → ${parsed.data.fulfillmentStatus}`, admin.email);
  }

  // Cancelling an order restores the stock it had reserved.
  if (parsed.data.orderStatus === "CANCELLED" && before.orderStatus !== "CANCELLED" && before.inventoryReduced) {
    await restoreInventoryForOrder(orderId, admin.email);
    await logOrderEvent(orderId, "INVENTORY", "订单取消，库存已恢复", admin.email);
  }

  const nowShipped =
    parsed.data.orderStatus === "SHIPPED" ||
    parsed.data.fulfillmentStatus === "SHIPPED" ||
    parsed.data.fulfillmentStatus === "FULFILLED";
  if (nowShipped) {
    await sendShippingNotificationEmail(orderId);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?saved=1`);
}

export async function addShipment(orderId: string, _prevState: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "订单不存在。" };

  const carrier = text(formData, "carrier");
  const trackingNumber = text(formData, "trackingNumber");
  const trackingUrl = text(formData, "trackingUrl");
  const note = text(formData, "note");
  if (!trackingNumber && !carrier) return { error: "请至少填写承运商或追踪号。" };
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) return { error: "追踪链接需以 http(s):// 开头。" };

  await prisma.shipment.create({
    data: {
      orderId,
      carrier: carrier || null,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      note: note || null
    }
  });

  // Mark fulfilled + mirror the latest tracking onto the order, then notify once.
  await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStatus: "FULFILLED",
      orderStatus: order.orderStatus === "PROCESSING" ? "SHIPPED" : order.orderStatus,
      shippingCarrier: carrier || order.shippingCarrier,
      trackingNumber: trackingNumber || order.trackingNumber,
      trackingUrl: trackingUrl || order.trackingUrl,
      shippedAt: order.shippedAt || new Date()
    }
  });
  await logOrderEvent(orderId, "SHIPMENT", `新增包裹${carrier ? `（${carrier}` : ""}${trackingNumber ? ` ${trackingNumber}` : ""}${carrier ? "）" : ""}`, admin.email);
  await sendShippingNotificationEmail(orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?saved=1`);
}

export async function deleteShipment(shipmentId: string) {
  const admin = await requireAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return;
  await prisma.shipment.delete({ where: { id: shipmentId } });
  await logOrderEvent(shipment.orderId, "SHIPMENT", "删除一个包裹记录", admin.email);
  revalidatePath(`/admin/orders/${shipment.orderId}`);
}

export async function refundOrder(orderId: string, _prevState: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const admin = await requireAdmin();
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_")) {
    return { error: "Stripe 未配置，无法发起退款。请在 .env 设置 STRIPE_SECRET_KEY。" };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "订单不存在。" };
  if (!order.stripePaymentIntentId) return { error: "该订单没有可退款的 Stripe 支付。" };

  const remaining = Math.max(0, order.totalCents - order.refundedCents);
  if (remaining <= 0) return { error: "该订单已全额退款。" };

  // Amount in major units of the order currency; blank = refund the remainder.
  const raw = text(formData, "amount");
  const requested = raw ? Math.round(Number(raw) * 100) : remaining;
  if (!Number.isFinite(requested) || requested <= 0) return { error: "请输入有效的退款金额。" };
  const refundCents = Math.min(requested, remaining);

  try {
    const stripe = new Stripe(secretKey);
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: refundCents,
      metadata: { orderId: order.id, orderNumber: order.orderNumber }
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Stripe 退款失败。" };
  }

  // The charge.refunded webhook syncs refundedCents/status and emails the buyer;
  // log the admin action immediately for the audit trail.
  await logOrderEvent(
    orderId,
    "REFUND",
    `发起退款 ${(refundCents / 100).toFixed(2)} ${order.currency.toUpperCase()}（经 Stripe）`,
    admin.email
  );

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?refund=ok`);
}

export async function resendConfirmationEmail(orderId: string) {
  await requireAdmin();
  if (!process.env.SMTP_HOST) {
    redirect(`/admin/orders/${orderId}?mail=nosmtp`);
  }

  // Clear the sent flag so the sender's duplicate guard lets it through.
  await prisma.order.update({
    where: { id: orderId },
    data: { confirmationEmailSentAt: null }
  });
  await sendOrderConfirmationEmail(orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?mail=confirmation`);
}

export async function resendShippingEmail(orderId: string) {
  await requireAdmin();
  if (!process.env.SMTP_HOST) {
    redirect(`/admin/orders/${orderId}?mail=nosmtp`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { shippingEmailSentAt: null }
  });
  await sendShippingNotificationEmail(orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?mail=shipping`);
}

export async function resendRefundEmail(orderId: string) {
  await requireAdmin();
  if (!process.env.SMTP_HOST) {
    redirect(`/admin/orders/${orderId}?mail=nosmtp`);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { refundEmailSentAt: null }
  });
  await sendRefundNotificationEmail(orderId);

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?mail=refund`);
}
