import { getCurrentAdmin } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonList(value: string): string {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join("; ") : "";
  } catch {
    return "";
  }
}

// Columns match what the importer accepts, so an export round-trips.
// NOTE: must NOT be exported — Next.js route modules may only export route
// handlers + config (GET/POST/dynamic/...). Exporting other symbols fails `next build`.
const PRODUCT_CSV_COLUMNS = [
  "slug", "name", "sku", "category", "brand", "status",
  "retailPrice", "compareAtPrice", "stock", "lowStockThreshold",
  "fitmentType", "fitmentNote", "compatibleModels", "compatibleEquipment",
  "tags", "shortDescription", "image"
];

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  const rows: (string | number)[][] = [PRODUCT_CSV_COLUMNS];
  for (const p of products) {
    rows.push([
      p.slug,
      p.name,
      p.sku,
      p.category,
      p.brand || "",
      p.status,
      (p.priceCents / 100).toFixed(2),
      p.compareAtPriceCents ? (p.compareAtPriceCents / 100).toFixed(2) : "",
      p.stock,
      p.lowStockThreshold,
      p.fitmentType,
      p.fitmentNote || "",
      jsonList(p.compatibleModels),
      jsonList(p.compatibleEquipment),
      jsonList(p.tags),
      p.shortDescription,
      p.image || ""
    ]);
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${date}.csv"`
    }
  });
}
