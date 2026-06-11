import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

/**
 * Email the buyer when their order ships. Triggered from the admin order
 * update; duplicate-safe via shippingEmailSentAt. Silently skips when SMTP
 * is not configured or the email is a checkout placeholder.
 */
export async function sendShippingNotificationEmail(orderId: string) {
  if (!process.env.SMTP_HOST) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order || order.shippingEmailSentAt) return;

  const email = order.customerEmail.trim().toLowerCase();
  if (!email || email.endsWith("@checkout.local")) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { shippingEmailSentAt: new Date() }
  });

  const lines = [
    `Hello ${order.customerName},`,
    "",
    `Good news — your order ${order.orderNumber} has shipped.`,
    "",
    ...(order.shippingCarrier ? [`Carrier: ${order.shippingCarrier}`] : []),
    ...(order.trackingNumber ? [`Tracking number: ${order.trackingNumber}`] : []),
    ...(order.trackingUrl ? [`Track your parcel: ${order.trackingUrl}`] : []),
    "",
    "Items in this shipment:",
    ...order.items.map((item) => `  - ${item.productName} x${item.quantity}`),
    "",
    "Delivery usually takes 7-15 days depending on destination and customs.",
    "",
    `Questions? Reply to this email or message us on WhatsApp: ${whatsappLink(GENERAL_INQUIRY_MESSAGE)}`,
    "",
    "RepairKit Supply — factory-direct engine parts from Chongqing, China"
  ];

  await sendMail({
    to: email,
    subject: `Your order ${order.orderNumber} has shipped — RepairKit Supply`,
    text: lines.join("\n")
  }).catch((error) => {
    console.error(`[shipping-notification] failed for ${order.orderNumber}:`, error);
  });
}
