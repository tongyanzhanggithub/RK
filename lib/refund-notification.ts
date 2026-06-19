import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

/**
 * Email the buyer when their order is refunded (full or partial). Triggered from
 * the Stripe charge.refunded webhook and the admin resend action. Duplicate-safe
 * via refundEmailSentAt; skips silently when SMTP is not configured or the email
 * is a checkout placeholder.
 */
export async function sendRefundNotificationEmail(orderId: string) {
  if (!process.env.SMTP_HOST) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.refundedCents <= 0 || order.refundEmailSentAt) return;

  const email = order.customerEmail.trim().toLowerCase();
  if (!email || email.endsWith("@checkout.local")) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { refundEmailSentAt: new Date() }
  });

  const full = order.refundedCents >= order.totalCents;

  const lines = [
    `Hello ${order.customerName},`,
    "",
    full
      ? `Your order ${order.orderNumber} has been refunded in full.`
      : `A partial refund has been issued for your order ${order.orderNumber}.`,
    "",
    `  Refunded: ${money(order.refundedCents, order.currency)}`,
    `  Order total: ${money(order.totalCents, order.currency)}`,
    "",
    "Refunds are returned to your original payment method by Stripe and usually appear",
    "within 5-10 business days, depending on your bank or card issuer.",
    "",
    `Questions about this refund? Reply to this email or message us on WhatsApp: ${whatsappLink(GENERAL_INQUIRY_MESSAGE)}`,
    "",
    "Partavio — factory-direct engine parts from Chongqing, China"
  ];

  await sendMail({
    to: email,
    subject: `Refund issued for order ${order.orderNumber} — Partavio`,
    text: lines.join("\n")
  }).catch((error) => {
    console.error(`[refund-notification] failed for ${order.orderNumber}:`, error);
  });
}
