import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjustInventory } from "@/app/admin/(protected)/inventory/actions";
import { InventoryAdjustmentForm } from "@/app/admin/(protected)/inventory/inventory-adjustment-form";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "库存详情",
  description: "调整库存并查看库存变动记录。"
};

export default async function AdminInventoryDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { inventoryAdjustments: { orderBy: { createdAt: "desc" }, take: 100 } }
  });
  if (!product) notFound();

  const unitCost = product.costPriceCents || product.priceCents;

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">库存</p>
          <h1 className="text-4xl font-black">{product.name}</h1>
          <p className="mt-3 text-steel">{product.sku} · {product.category}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/products/${product.id}/edit`} className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">编辑商品</Link>
          <Link href="/admin/inventory" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">返回库存列表</Link>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="当前库存" value={String(product.stock)} />
            <Metric label="低库存阈值" value={String(product.lowStockThreshold)} />
            <Metric label="单位成本" value={formatMoney(unitCost, product.currency)} />
            <Metric label="成本价值" value={formatMoney(unitCost * product.stock, product.currency)} />
          </section>

          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5"><h2 className="text-xl font-black">库存变动记录</h2></div>
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr>
                  <th className="p-3">创建时间</th>
                  <th className="p-3">类型</th>
                  <th className="p-3">变动</th>
                  <th className="p-3">变动前</th>
                  <th className="p-3">变动后</th>
                  <th className="p-3">原因</th>
                  <th className="p-3">单据号</th>
                  <th className="p-3">操作人</th>
                </tr>
              </thead>
              <tbody>
                {product.inventoryAdjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="border-t border-line align-top">
                    <td className="p-3 text-xs text-steel">{adjustment.createdAt.toLocaleString("zh-CN")}</td>
                    <td className="p-3 font-black">{adjustment.type}</td>
                    <td className={`p-3 font-black ${adjustment.quantityDelta < 0 ? "text-red-700" : "text-green-700"}`}>
                      {adjustment.quantityDelta > 0 ? "+" : ""}{adjustment.quantityDelta}
                    </td>
                    <td className="p-3">{adjustment.stockBefore}</td>
                    <td className="p-3 font-black">{adjustment.stockAfter}</td>
                    <td className="max-w-xs p-3">{adjustment.reason || "-"}</td>
                    <td className="p-3">{adjustment.reference || "-"}</td>
                    <td className="p-3">{adjustment.createdBy || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="h-fit">
          <InventoryAdjustmentForm action={adjustInventory.bind(null, product.id)} saved={searchParams?.saved === "1"} />
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-4"><p className="text-xs font-bold uppercase text-steel">{label}</p><strong className="mt-2 block text-2xl font-black">{value}</strong></div>;
}
