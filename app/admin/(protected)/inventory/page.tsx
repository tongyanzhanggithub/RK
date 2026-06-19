import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "库存管理",
  description: "监控库存水平和库存价值。"
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
          q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { sku: { contains: q, mode: "insensitive" as const } }] } : {},
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
        <p className="font-black uppercase text-safety">库存</p>
        <h1 className="text-4xl font-black">库存管理</h1>
        <p className="mt-3 text-steel">监控库存、识别短缺并记录每一次库存调整。</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="总库存数量" value={String(totalUnits)} />
        <Metric label="低库存商品" value={String(lowStock)} />
        <Metric label="缺货商品" value={String(outOfStock)} />
        <Metric label="预估成本价值" value={formatMoney(inventoryValue, "usd")} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-5">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="搜索商品或SKU..." />
        <select name="category" defaultValue={category} className="border border-line px-3 py-2">
          <option value="">全部分类</option>
          {categories.map((item) => <option key={item.category} value={item.category}>{item.category}</option>)}
        </select>
        <select name="level" defaultValue={level} className="border border-line px-3 py-2">
          <option value="">全部库存水平</option>
          <option value="out">缺货</option>
          <option value="low">低库存</option>
          <option value="normal">正常库存</option>
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">全部商品状态</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-5">筛选</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">商品</th>
              <th className="p-3">SKU</th>
              <th className="p-3">分类</th>
              <th className="p-3">库存</th>
              <th className="p-3">低库存阈值</th>
              <th className="p-3">库存水平</th>
              <th className="p-3">单位成本</th>
              <th className="p-3">成本价值</th>
              <th className="p-3">记录数</th>
              <th className="p-3">操作</th>
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
                  <td className="p-3"><Link href={`/admin/inventory/${product.id}`} className="font-black text-navy">调整</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-5 text-sm text-steel">没有符合当前筛选条件的商品。</p>}
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
