import type { Metadata } from "next";
import Link from "next/link";
import { createCategory } from "@/app/admin/(protected)/categories/actions";
import { CategoryForm } from "@/app/admin/(protected)/categories/category-form";

export const metadata: Metadata = {
  title: "新增分类",
  description: "创建产品分类。"
};

export default function NewCategoryPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">分类</p>
          <h1 className="text-4xl font-black">新增分类</h1>
          <p className="mt-3 text-steel">创建一个产品分类。</p>
        </div>
        <Link href="/admin/categories" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回分类列表
        </Link>
      </div>
      <CategoryForm action={createCategory} submitLabel="创建分类" />
    </main>
  );
}
