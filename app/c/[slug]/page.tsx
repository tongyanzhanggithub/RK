import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryEngineFilter } from "@/components/category-engine-filter";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { getServerDict, getServerLocale } from "@/lib/locale";
import { categoryLabel } from "@/lib/category-label";

export const dynamic = "force-dynamic";

async function loadCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } }
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = await loadCategory(params.slug);
  if (!cat) return {};
  const name = categoryLabel(cat, getServerLocale());
  return {
    title: name,
    description: cat.description || `Wholesale ${cat.name} — factory-direct auto parts and complete engines from Partavio.`,
    alternates: { canonical: `/c/${cat.slug}` }
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = await loadCategory(params.slug);
  if (!cat || !cat.isActive) notFound();
  const dict = getServerDict();
  const locale = getServerLocale();
  const name = categoryLabel(cat, locale);

  // Products in this category plus any of its child categories (matched by name).
  const names = new Set([cat.name, ...cat.children.map((c) => c.name)]);
  const products = (await getStoreProducts()).filter((p) => names.has(p.category));

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/products" className="inline-flex items-center gap-1 font-bold text-navy">
          <ArrowLeft size={16} /> {dict.common.back_to_products}
        </Link>

        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <CategoryIcon slug={cat.slug} icon={cat.icon} size={28} />
          </span>
          <div>
            <p className="font-black uppercase text-brand">{dict.homepage.category_badge}</p>
            <h1 className="text-4xl font-black">{name}</h1>
          </div>
        </div>
        {cat.description && <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">{cat.description}</p>}

        {/* Sub-category tiles */}
        {cat.children.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cat.children.map((ch) => (
              <Link
                key={ch.slug}
                href={`/c/${ch.slug}`}
                className="flex items-center gap-3 border border-line bg-white p-4 font-bold hover:border-navy"
              >
                <CategoryIcon slug={ch.slug} icon={ch.icon} size={18} className="shrink-0 text-brand" />
                {categoryLabel(ch, locale)}
              </Link>
            ))}
          </div>
        )}

        {/* Engine × category filter */}
        <div className="mt-8">
          <CategoryEngineFilter categoryName={cat.name} />
        </div>

        {/* Products */}
        <div className="mt-6">
          {products.length === 0 ? (
            <p className="border border-line bg-white p-10 text-center font-bold text-steel">{dict.products.no_results}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
