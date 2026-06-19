import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

/**
 * Send a one-time abandoned-cart reminder for a still-unpaid order whose buyer
 * left an email at checkout. Idempotent via abandonedEmailSentAt. Skips silently
 * when SMTP is not configured or there is no real buyer email.
 * Returns true only when an email was actually sent.
 */
export async function sendAbandonedCartEmail(orderId: string): Promise<boolean> {
  if (!process.env.SMTP_HOST) return false;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentStatus !== "PENDING" || order.abandonedEmailSentAt) return false;

  const email = order.customerEmail.trim().toLowerCase();
  if (!email || email.endsWith("@checkout.local")) return false;

  // Mark first so a concurrent cron run cannot double-send.
  await prisma.order.update({ where: { id: order.id }, data: { abandonedEmailSentAt: new Date() } });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const items = order.items.map((item) => `  - ${item.productName} x${item.quantity}`).join("\n");
  const text = [
    "Hello,",
    "",
    "You left these items in your cart at RepairKit Supply:",
    "",
    items,
    "",
    `Complete your order here: ${site}/cart`,
    "",
    "Need help choosing the right part, or wholesale pricing? Just reply to this email or message us on WhatsApp.",
    "",
    "— RepairKit Supply"
  ].join("\n");

  await sendMail({ to: email, subject: "You left items in your cart — RepairKit Supply", text });
  return true;
}
