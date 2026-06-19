import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

/**
 * Send the buyer an order confirmation email the first time an order is paid.
 * Safe to call multiple times: confirmationEmailSentAt guards against duplicates.
 * Skips silently when SMTP is not configured or the email is a checkout placeholder.
 */
export async function sendOrderConfirmationEmail(orderId: string) {
  if (!process.env.SMTP_HOST) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order || order.paymentStatus !== "PAID" || order.confirmationEmailSentAt) return;

  const email = order.customerEmail.trim().toLowerCase();
  if (!email || email.endsWith("@checkout.local")) return;

  // Mark first so a concurrent webhook retry cannot double-send. If the send
  // fails afterwards, the admin can still resend manually from order detail.
  await prisma.order.update({
    where: { id: order.id },
    data: { confirmationEmailSentAt: new Date() }
  });

  const itemLines = order.items.map(
    (item) => `  - ${item.productName} (${item.sku}) x${item.quantity} — ${money(item.subtotalCents, order.currency)}`
  );

  const lines = [
    `Hello ${order.customerName},`,
    "",
    `Thank you for your order ${order.orderNumber}. Your payment is confirmed and the order is being prepared.`,
    "",
    "Order summary:",
    ...itemLines,
    "",
    `  Subtotal: ${money(order.subtotalCents, order.currency)}`,
    `  Shipping: ${money(order.shippingCents, order.currency)}`,
    ...(order.discountCents > 0 ? [`  Discount: -${money(order.discountCents, order.currency)}`] : []),
    ...(order.taxCents > 0 ? [`  incl. VAT/tax: ${money(order.taxCents, order.currency)}`] : []),
    `  Total: ${money(order.totalCents, order.currency)}`,
    "",
    "Shipping: orders are handed to the carrier within 3-5 business days; delivery usually takes 7-15 days.",
    "We will email your tracking number as soon as the parcel ships.",
    "",
    `Questions or changes? Reply to this email or message us on WhatsApp: ${whatsappLink(GENERAL_INQUIRY_MESSAGE)}`,
    "",
    "Partavio — factory-direct engine parts from Chongqing, China"
  ];

  await sendMail({
    to: email,
    subject: `Order confirmed: ${order.orderNumber} — Partavio`,
    text: lines.join("\n")
  }).catch((error) => {
    console.error(`[order-confirmation] failed for ${order.orderNumber}:`, error);
  });
}
