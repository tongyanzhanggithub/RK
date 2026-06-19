import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendAbandonedCartEmail } from "@/lib/abandoned-cart-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hourly cron target. Finds unpaid orders 1–72h old whose buyer left an email,
// and sends a one-time reminder. Protect with CRON_SECRET:
//   curl "https://你的域名/api/cron/abandoned-cart?key=$CRON_SECRET"
// crontab: 0 * * * * curl -s "https://你的域名/api/cron/abandoned-cart?key=SECRET"
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = request.nextUrl.searchParams.get("key") || request.headers.get("x-cron-key");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      abandonedEmailSentAt: null,
      createdAt: { lte: new Date(now - 60 * 60 * 1000), gte: new Date(now - 72 * 60 * 60 * 1000) },
      NOT: { customerEmail: { endsWith: "@checkout.local" } }
    },
    select: { id: true },
    take: 100
  });

  let sent = 0;
  for (const order of orders) {
    if (await sendAbandonedCartEmail(order.id)) sent++;
  }

  return NextResponse.json({ candidates: orders.length, sent, smtp: Boolean(process.env.SMTP_HOST) });
}
