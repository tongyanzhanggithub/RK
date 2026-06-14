"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type OrderFormState = {
  error?: string;
};

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
  await requireAdmin();

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
    return { error: "Please check order status, fulfillment status, tracking URL and internal note length." };
  }

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

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?saved=1`);
}
