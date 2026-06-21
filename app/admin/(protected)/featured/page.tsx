import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { toggleProductFlag } from "@/app/admin/(protected)/featured/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "精选 / 热销位",
  description: "管理首页精选与热销推荐位。"
};

export default async function AdminFeaturedPage({ searchParams }: { searchParams?: { q?: string; only?: string } }) {
  const q = searchParams?.q?.trim() || "";
  const only = searchParams?.only || "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { sku: { contains: q, mode: "insensitive" as const } }] } : {},
        only === "featured" ? { isFeatured: true } : {},
        only === "hot" ? { isHotSeller: true } : {}
      ]
    },
    orderBy: [{ isFeatured: "desc" }, { isHotSeller: "desc" }, { name: "asc" }],
    take: 200
  });

  const featuredCount = await prisma.product.count({ where: { isFeatured: true } });
  const hotCount = await prisma.product.count({ where: { isHotSeller: true } });

  return (
    <main>
      <div>
        <p className="font-black uppercase text-brand">营销</p>
        <h1 className="text-4xl font-black">精选 / 热销位</h1>
        <p className="mt-3 text-steel">勾选后商品会出现在首页的「精选」与「热销」推荐位。点击徽章即可即时切换。</p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Metric label="精选商品" value={String(featuredCount)} />
        <Metric label="热销商品" value={String(hotCount)} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2" placeholder="搜索商品或 SKU..." />
        <select name="only" defaultValue={only} className="border border-line px-3 py-2">
          <option value="">全部商品</option>
          <option value="featured">仅精选</option>
          <option value="hot">仅热销</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white">筛选</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">商品</th>
              <th className="p-3">SKU</th>
              <th className="p-3">价格</th>
              <th className="p-3 text-center">精选</th>
              <th className="p-3 text-center">热销</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="p-3 font-black">
                  <Link href={`/admin/products/${product.id}/edit`} className="hover:text-brand">
                    {product.name}
                  </Link>
                </td>
                <td className="p-3 text-steel">{product.sku}</td>
                <td className="p-3">{formatMoney(product.priceCents, product.currency)}</td>
                <td className="p-3 text-center">
                  <FlagToggle productId={product.id} field="isFeatured" active={product.isFeatured} label="精选" />
                </td>
                <td className="p-3 text-center">
                  <FlagToggle productId={product.id} field="isHotSeller" active={product.isHotSeller} label="热销" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-5 text-sm text-steel">没有符合条件的商品。</p>}
      </section>
    </main>
  );
}

function FlagToggle({
  productId,
  field,
  active,
  label
}: {
  productId: string;
  field: "isFeatured" | "isHotSeller";
  active: boolean;
  label: string;
}) {
  return (
    <form action={toggleProductFlag.bind(null, productId, field, !active)}>
      <button
        type="submit"
        className={`inline-flex min-w-[64px] items-center justify-center px-3 py-1.5 text-xs font-black ${
          active ? "bg-brand text-white" : "bg-panel text-steel hover:bg-line"
        }`}
      >
        {active ? `✓ ${label}` : label}
      </button>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-bold text-steel">{label}</p>
      <strong className="mt-3 block text-3xl font-black">{value}</strong>
    </div>
  );
}
