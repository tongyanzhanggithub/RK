import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage product categories."
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
          <p className="font-black uppercase text-safety">Categories</p>
          <h1 className="text-4xl font-black">Category Management</h1>
          <p className="mt-3 text-steel">Maintain product category names, sort order and visibility for storefront navigation and filters.</p>
        </div>
        <Link href="/admin/categories/new" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          New Category
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Total Categories" value={String(categories.length)} />
        <Metric label="Active" value={String(activeCount)} />
        <Metric label="Categories Used by Products" value={String(productGroups.length)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Sort</th>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Products</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
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
                    {category.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3"><Link href={`/admin/categories/${category.id}/edit`} className="font-black text-navy">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-5 text-sm text-steel">No categories yet. Click “New Category” to create the first one.</p>
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
