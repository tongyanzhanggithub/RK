import type { Metadata } from "next";
import Link from "next/link";
import { archiveProduct } from "@/app/admin/(protected)/products/actions";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Products",
  description: "Manage repair kit products."
};

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams?: { q?: string; category?: string; status?: string; stock?: string; wholesale?: string; sort?: string };
}) {
  const q = searchParams?.q?.trim() || "";
  const category = searchParams?.category || "";
  const status = searchParams?.status || "";
  const stock = searchParams?.stock || "";
  const wholesale = searchParams?.wholesale || "";
  const sort = searchParams?.sort || "created-desc";

  const allCategories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" }
  });

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { sku: { contains: q } }
              ]
            }
          : {},
        category ? { category } : {},
        status ? { status } : {},
        wholesale ? { wholesaleAvailable: wholesale === "yes" } : {}
      ]
    },
    orderBy:
      sort === "price-asc"
        ? { priceCents: "asc" }
        : sort === "price-desc"
          ? { priceCents: "desc" }
          : { createdAt: "desc" }
  });

  const filteredProducts = products.filter((product) => {
    if (stock === "low") return product.stock <= product.lowStockThreshold;
    if (stock === "normal") return product.stock > product.lowStockThreshold;
    return true;
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Products</p>
          <h1 className="text-4xl font-black">Product Management</h1>
          <p className="mt-3 text-steel">Search, filter, edit and archive repair kit products.</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          New Product
        </Link>
      </div>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-6">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="Search name or SKU..." />
        <select name="category" defaultValue={category} className="border border-line px-3 py-2">
          <option value="">All categories</option>
          {allCategories.map((item) => (
            <option key={item.category} value={item.category}>{item.category}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <select name="stock" defaultValue={stock} className="border border-line px-3 py-2">
          <option value="">All stock</option>
          <option value="low">Low stock</option>
          <option value="normal">Normal stock</option>
        </select>
        <select name="wholesale" defaultValue={wholesale} className="border border-line px-3 py-2">
          <option value="">Wholesale any</option>
          <option value="yes">Wholesale yes</option>
          <option value="no">Wholesale no</option>
        </select>
        <select name="sort" defaultValue={sort} className="border border-line px-3 py-2">
          <option value="created-desc">Newest</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-6">Apply</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Retail</th>
              <th className="p-3">Wholesale</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Flags</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t border-line align-top">
                <td className="p-3">
                  <div className="grid h-16 w-16 place-items-center bg-panel industrial-grid font-black text-navy">
                    {product.name.split(" ")[0]}
                  </div>
                </td>
                <td className="p-3">
                  <strong className="block leading-snug">{product.name}</strong>
                  <span className="mt-1 block max-w-xs text-xs leading-5 text-steel">{product.shortDescription}</span>
                </td>
                <td className="p-3 font-bold">{product.sku}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3 font-black">{formatMoney(product.priceCents, product.currency)}</td>
                <td className="p-3">{product.wholesalePriceCents ? formatMoney(product.wholesalePriceCents, product.currency) : "-"}</td>
                <td className="p-3">
                  <span className={product.stock <= product.lowStockThreshold ? "font-black text-orange-700" : "font-black text-green-700"}>
                    {product.stock}
                  </span>
                  <span className="block text-xs text-steel">Low: {product.lowStockThreshold}</span>
                </td>
                <td className="p-3"><StatusBadge status={product.status} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {product.isFeatured && <SmallFlag label="Featured" />}
                    {product.isHotSeller && <SmallFlag label="Hot" />}
                    {product.wholesaleAvailable && <SmallFlag label="Wholesale" />}
                  </div>
                </td>
                <td className="p-3 text-xs text-steel">{product.createdAt.toLocaleDateString("en-US")}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="font-black text-navy">Edit</Link>
                    {product.status !== "ARCHIVED" && (
                      <form action={archiveProduct.bind(null, product.id)}>
                        <button className="font-black text-red-700" type="submit">Archive</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <p className="p-5 text-sm text-steel">No products match the current filters.</p>}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : status === "DRAFT"
        ? "bg-gray-100 text-gray-700"
        : "bg-red-100 text-red-800";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${className}`}>{status}</span>;
}

function SmallFlag({ label }: { label: string }) {
  return <span className="bg-safety/15 px-2 py-1 text-[11px] font-black text-ink">{label}</span>;
}
