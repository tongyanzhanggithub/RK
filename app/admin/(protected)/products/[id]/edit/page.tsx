import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateProduct } from "@/app/admin/(protected)/products/actions";
import { ProductForm } from "@/app/admin/(protected)/products/product-form";
import { prisma } from "@/lib/db";
import { normalizeProduct } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑产品",
  description: "编辑维修套件产品。"
};

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const [productRecord, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" }
    })
  ]);

  if (!productRecord) notFound();
  const product = normalizeProduct(productRecord);

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">产品</p>
          <h1 className="text-4xl font-black">编辑产品</h1>
          <p className="mt-3 text-steel">{product.name}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/products/${product.slug}`} className="inline-flex h-11 items-center justify-center border border-line px-4 font-black text-navy hover:bg-white">
            查看店铺页面
          </Link>
          <Link href="/admin/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
            返回产品列表
          </Link>
        </div>
      </div>
      <ProductForm
        product={product}
        categories={categories.map((item) => item.category)}
        action={updateProduct.bind(null, product.id)}
        submitLabel="保存产品"
        saved={searchParams?.saved === "1"}
      />
    </main>
  );
}
