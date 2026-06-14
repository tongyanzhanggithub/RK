import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Inventory",
  description: "Monitor stock levels and inventory value."
};

export default async function AdminInventoryPage({
  searchParams
}: {
  searchParams?: { q?: string; category?: string; level?: string; status?: string };
}) {
  const q = searchParams?.q?.trim() || "";
  const category = searchParams?.category || "";
  const level = searchParams?.level || "";
  const status = searchParams?.status || "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {},
          category ? { category } : {},
          status ? { status } : {}
        ]
      },
      include: { _count: { select: { inventoryAdjustments: true } } },
      orderBy: [{ stock: "asc" }, { name: "asc" }]
    }),
    prisma.product.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } })
  ]);

  const rows = products.filter((product) => {
    if (level === "out") return product.stock === 0;
    if (level === "low") return product.stock > 0 && product.stock <= product.lowStockThreshold;
    if (level === "normal") return product.stock > product.lowStockThreshold;
    return true;
  });
  const totalUnits = products.reduce((total, product) => total + product.stock, 0);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= product.lowStockThreshold).length;
  const outOfStock = products.filter((product) => product.stock === 0).length;
  const inventoryValue = products.reduce((total, product) => total + (product.costPriceCents || product.priceCents) * product.stock, 0);

  return (
    <main>
      <div>
        <p className="font-black uppercase text-safety">Inventory</p>
        <h1 className="text-4xl font-black">Inventory Management</h1>
        <p className="mt-3 text-steel">Monitor stock, identify shortages and record every inventory adjustment.</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Units" value={String(totalUnits)} />
        <Metric label="Low Stock Products" value={String(lowStock)} />
        <Metric label="Out of Stock" value={String(outOfStock)} />
        <Metric label="Estimated Cost Value" value={formatMoney(inventoryValue, "usd")} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-5">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="Search product or SKU..." />
        <select name="category" defaultValue={category} className="border border-line px-3 py-2">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.category} value={item.category}>{item.category}</option>)}
        </select>
        <select name="level" defaultValue={level} className="border border-line px-3 py-2">
          <option value="">All stock levels</option>
          <option value="out">Out of stock</option>
          <option value="low">Low stock</option>
          <option value="normal">Normal stock</option>
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">All product statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-5">Apply</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Low Threshold</th>
              <th className="p-3">Stock Level</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Cost Value</th>
              <th className="p-3">Records</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const unitCost = product.costPriceCents || product.priceCents;
              return (
                <tr key={product.id} className="border-t border-line">
                  <td className="p-3 font-black">{product.name}</td>
                  <td className="p-3">{product.sku}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3 text-lg font-black">{product.stock}</td>
                  <td className="p-3">{product.lowStockThreshold}</td>
                  <td className="p-3"><StockBadge stock={product.stock} threshold={product.lowStockThreshold} /></td>
                  <td className="p-3">{formatMoney(unitCost, product.currency)}</td>
                  <td className="p-3 font-black">{formatMoney(unitCost * product.stock, product.currency)}</td>
                  <td className="p-3">{product._count.inventoryAdjustments}</td>
                  <td className="p-3"><Link href={`/admin/inventory/${product.id}`} className="font-black text-navy">Adjust</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-5 text-sm text-steel">No products match the current filters.</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-5"><p className="text-sm font-bold text-steel">{label}</p><strong className="mt-3 block text-3xl font-black">{value}</strong></div>;
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const label = stock === 0 ? "OUT" : stock <= threshold ? "LOW" : "NORMAL";
  const color = stock === 0 ? "bg-red-100 text-red-800" : stock <= threshold ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{label}</span>;
}
