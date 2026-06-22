import { getCurrentAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  const deFormula = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${deFormula.replace(/"/g, '""')}"`;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" }
  });

  const header = ["Email", "Name", "Source", "Locale", "Status", "Subscribed At"].join(",");
  const rows = subscribers.map((s) =>
    [
      csvCell(s.email),
      csvCell(s.name),
      csvCell(s.source),
      csvCell(s.locale),
      csvCell(s.isActive ? "active" : "unsubscribed"),
      csvCell(s.createdAt.toISOString().slice(0, 10))
    ].join(",")
  );

  const csv = "﻿" + [header, ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${date}.csv"`
    }
  });
}
