import type { Metadata } from "next";
import Link from "next/link";
import { createCategory } from "@/app/admin/(protected)/categories/actions";
import { CategoryForm } from "@/app/admin/(protected)/categories/category-form";

export const metadata: Metadata = {
  title: "New Category",
  description: "Create a product category."
};

export default function NewCategoryPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Categories</p>
          <h1 className="text-4xl font-black">New Category</h1>
          <p className="mt-3 text-steel">Create a product category.</p>
        </div>
        <Link href="/admin/categories" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Categories
        </Link>
      </div>
      <CategoryForm action={createCategory} submitLabel="Create Category" />
    </main>
  );
}
