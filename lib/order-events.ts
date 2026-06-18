import { prisma } from "@/lib/db";

/** Append an entry to an order's audit timeline. Best-effort: never throws. */
export async function logOrderEvent(
  orderId: string,
  type: string,
  message: string,
  actor = "system"
) {
  try {
    await prisma.orderEvent.create({ data: { orderId, type, message, actor } });
  } catch (error) {
    console.error(`[order-event] failed for ${orderId}:`, error);
  }
}
