import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "分类管理",
  description: "管理产品分类。"
};

export default async function AdminCategoriesPage() {
  const [categories, productGroups] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } })
  ]);

  const countByName = new Map(productGroups.map((g) => [g.category, g._count._all]));
  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">分类</p>
          <h1 className="text-4xl font-black">分类管理</h1>
          <p className="mt-3 text-steel">维护产品分类的名称、排序与显示状态，用于前台导航与筛选。</p>
        </div>
        <Link href="/admin/categories/new" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
          新增分类
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="分类总数" value={String(categories.length)} />
        <Metric label="已启用" value={String(activeCount)} />
        <Metric label="产品涉及的分类" value={String(productGroups.length)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">排序</th>
              <th className="p-3">名称</th>
              <th className="p-3">Slug</th>
              <th className="p-3">关联产品</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{category.sortOrder}</td>
                <td className="p-3 font-black">{category.name}</td>
                <td className="p-3 text-steel">{category.slug}</td>
                <td className="p-3 font-black">{countByName.get(category.name) ?? 0}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-black ${category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {category.isActive ? "启用" : "停用"}
                  </span>
                </td>
                <td className="p-3"><Link href={`/admin/categories/${category.id}/edit`} className="font-black text-navy">编辑</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-5 text-sm text-steel">还没有分类。点击右上角「新增分类」创建第一个。</p>
        )}
      </section>
    </main>
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
