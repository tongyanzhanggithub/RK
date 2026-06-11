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

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    include: {
      orders: { select: { totalCents: true, refundedCents: true, paymentStatus: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const header = [
    "Name", "Email", "Phone", "WhatsApp", "Country", "City",
    "Status", "Role", "Tags", "Orders", "Net Spend USD", "Customer Since"
  ].join(",");

  const rows = customers.map((customer) => {
    const paid = customer.orders.filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "REFUNDED");
    const netSpend = paid.reduce((total, o) => total + o.totalCents - o.refundedCents, 0);
    let tags = "";
    try {
      const parsed = JSON.parse(customer.tags);
      tags = Array.isArray(parsed) ? parsed.join("; ") : "";
    } catch {
      tags = "";
    }
    return [
      csvCell(customer.name),
      csvCell(customer.email),
      csvCell(customer.phone),
      csvCell(customer.whatsapp),
      csvCell(customer.country),
      csvCell(customer.city),
      csvCell(customer.status),
      csvCell(customer.role),
      csvCell(tags),
      csvCell(customer.orders.length),
      csvCell((netSpend / 100).toFixed(2)),
      csvCell(customer.createdAt.toISOString().slice(0, 10))
    ].join(",");
  });

  const csv = "﻿" + [header, ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${date}.csv"`
    }
  });
}
