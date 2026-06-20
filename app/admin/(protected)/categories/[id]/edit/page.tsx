import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCategory, updateCategory } from "@/app/admin/(protected)/categories/actions";
import { CategoryForm } from "@/app/admin/(protected)/categories/category-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑分类",
  description: "编辑产品分类。"
};

export default async function EditCategoryPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">分类</p>
          <h1 className="text-4xl font-black">{category.name}</h1>
          <p className="mt-3 text-steel">编辑分类名称、slug、排序与显示状态。</p>
        </div>
        <Link href="/admin/categories" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回分类列表
        </Link>
      </div>

      <CategoryForm
        category={category}
        action={updateCategory.bind(null, category.id)}
        submitLabel="保存分类"
        saved={searchParams?.saved === "1"}
      />

      <form action={deleteCategory.bind(null, category.id)} className="mt-6 max-w-2xl">
        <button className="h-11 border border-red-300 px-4 text-sm font-black text-red-700 hover:bg-red-50" type="submit">
          删除此分类
        </button>
      </form>
    </main>
  );
}
