import { getCurrentAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  // Prefix formula characters so the cell is inert when opened in Excel.
  const deFormula = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${deFormula.replace(/"/g, '""')}"`;
}

function money(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  const header = [
    "订单号", "创建时间", "支付时间", "支付状态", "订单状态", "履约状态",
    "客户", "邮箱", "国家", "城市",
    "商品", "小计(USD)", "运费(USD)", "折扣(USD)", "退款(USD)", "合计(USD)",
    "优惠券", "承运商", "物流单号"
  ].join(",");

  const rows = orders.map((order) => {
    const items = order.items.map((item) => `${item.productName} x${item.quantity}`).join("; ");
    return [
      csvCell(order.orderNumber),
      csvCell(order.createdAt.toISOString().slice(0, 16).replace("T", " ")),
      csvCell(order.paidAt ? order.paidAt.toISOString().slice(0, 16).replace("T", " ") : ""),
      csvCell(order.paymentStatus),
      csvCell(order.orderStatus),
      csvCell(order.fulfillmentStatus),
      csvCell(order.customerName),
      csvCell(order.customerEmail),
      csvCell(order.country),
      csvCell(order.city),
      csvCell(items),
      csvCell(money(order.subtotalCents)),
      csvCell(money(order.shippingCents)),
      csvCell(money(order.discountCents)),
      csvCell(money(order.refundedCents)),
      csvCell(money(order.totalCents)),
      csvCell(order.couponCode),
      csvCell(order.shippingCarrier),
      csvCell(order.trackingNumber)
    ].join(",");
  });

  const csv = "﻿" + [header, ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${date}.csv"`
    }
  });
}
