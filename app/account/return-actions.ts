"use server";

import { revalidatePath } from "next/cache";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";

export type CustomerReturnState = { error?: string; ok?: boolean };

export async function requestReturn(orderId: string, _prev: CustomerReturnState, formData: FormData): Promise<CustomerReturnState> {
  const customer = await requireCustomer();
  const order = await prisma.order.findFirst({ where: { id: orderId, customerEmail: customer.email } });
  if (!order) return { error: "Order not found." };

  // One open request at a time.
  const existing = await prisma.returnRequest.findFirst({
    where: { orderId, status: { in: ["REQUESTED", "APPROVED", "RECEIVED"] } }
  });
  if (existing) return { error: "A return request for this order is already in progress." };

  const reason = String(formData.get("reason") || "").trim().slice(0, 1000);
  await prisma.returnRequest.create({
    data: { orderId, orderNumber: order.orderNumber, status: "REQUESTED", resolution: "REFUND", reason: reason || null }
  });
  await logOrderEvent(orderId, "RETURN", "客户提交退货申请", customer.email);

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin/returns");
  return { ok: true };
}
