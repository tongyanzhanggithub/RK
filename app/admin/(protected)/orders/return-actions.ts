"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";

export type ReturnFormState = { error?: string };

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

const createSchema = z.object({
  reason: z.string().max(1000).optional(),
  resolution: z.enum(["REFUND", "REPLACE", "REPAIR"])
});

const RETURN_STATUSES = ["REQUESTED", "APPROVED", "RECEIVED", "REFUNDED", "REJECTED", "CLOSED"] as const;

export async function createReturnRequest(orderId: string, _prev: ReturnFormState, formData: FormData): Promise<ReturnFormState> {
  const admin = await requireAdmin();
  const parsed = createSchema.safeParse({
    reason: text(formData, "reason") || undefined,
    resolution: text(formData, "resolution") || "REFUND"
  });
  if (!parsed.success) return { error: "请选择处理方式（退款/换货/维修）。" };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "订单不存在。" };

  await prisma.returnRequest.create({
    data: {
      orderId,
      orderNumber: order.orderNumber,
      status: "REQUESTED",
      resolution: parsed.data.resolution,
      reason: parsed.data.reason ?? null
    }
  });
  await logOrderEvent(orderId, "RETURN", `创建退货申请（${parsed.data.resolution}）`, admin.email);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/returns");
  return {};
}

export async function updateReturnStatus(returnId: string, formData: FormData) {
  const admin = await requireAdmin();
  const status = text(formData, "status");
  if (!RETURN_STATUSES.includes(status as (typeof RETURN_STATUSES)[number])) return;
  const adminNote = text(formData, "adminNote");

  const rr = await prisma.returnRequest.update({
    where: { id: returnId },
    data: { status, ...(adminNote ? { adminNote } : {}) }
  });
  await logOrderEvent(rr.orderId, "RETURN", `退货状态 → ${status}`, admin.email);

  revalidatePath(`/admin/orders/${rr.orderId}`);
  revalidatePath("/admin/returns");
}
