import { sendMail } from "@/lib/mailer";

export type LowStockItem = {
  name: string;
  sku: string;
  stockAfter: number;
  threshold: number;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

/**
 * Email the admin when products cross below their low-stock threshold.
 * No-op when SMTP / ADMIN_NOTIFY_EMAIL are not configured.
 */
export async function sendLowStockAlert(items: LowStockItem[]) {
  if (items.length === 0) return;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail || !process.env.SMTP_HOST) return;

  await sendMail({
    to: adminEmail,
    subject: `Low stock alert: ${items.length} product${items.length > 1 ? "s" : ""} need restocking`,
    text: [
      "These products just dropped to or below their low-stock threshold after a paid order:",
      "",
      ...items.map((item) => `  - ${item.name} (${item.sku}) — ${item.stockAfter} left (threshold ${item.threshold})`),
      "",
      `Review inventory: ${SITE_URL}/admin/inventory`
    ].join("\n")
  }).catch((error) => {
    console.error("[low-stock-alert] failed:", error);
  });
}
