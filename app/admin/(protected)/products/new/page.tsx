import type { Metadata } from "next";
import Link from "next/link";
import { createProduct } from "@/app/admin/(protected)/products/actions";
import { ProductForm } from "@/app/admin/(protected)/products/product-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Product",
  description: "Create a new repair kit product."
};

export default async function NewProductPage() {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" }
  });

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Products</p>
          <h1 className="text-4xl font-black">New Product</h1>
          <p className="mt-3 text-steel">Create a product and save it to the database.</p>
        </div>
        <Link href="/admin/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Products
        </Link>
      </div>
      <ProductForm categories={categories.map((item) => item.category)} action={createProduct} submitLabel="Create Product" />
    </main>
  );
}
