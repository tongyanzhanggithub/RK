import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductsFilter } from "@/components/products-filter";
import { getStoreProducts } from "@/lib/product-store";
import type { Product } from "@/data/products";

export const metadata: Metadata = {
  title: "Repair Kit Products",
  description: "Browse small engine repair kits by category, model, equipment and problem solved."
};

export const dynamic = "force-dynamic";

type ProductsSearchParams = {
  q?: string;
  category?: string;
  model?: string;
  equipment?: string;
  problem?: string;
};

function fuzzyIncludes(values: string[], needle: string) {
  const target = needle.trim().toLowerCase();
  return values.some((value) => value.toLowerCase().includes(target));
}

function matchesModel(product: Product, model: string) {
  if (product.fitmentType === "UNIVERSAL") return true;
  return fuzzyIncludes(product.compatibleModels, model);
}

export default async function ProductsPage({ searchParams }: { searchParams?: ProductsSearchParams }) {
  const products = await getStoreProducts();
  const q = searchParams?.q?.toLowerCase() || "";
  const category = searchParams?.category || "";
  const model = searchParams?.model || "";
  const equipmentFilter = searchParams?.equipment || "";
  const problem = searchParams?.problem || "";

  const categories = [...new Set(products.map((product) => product.category))];
  const models = [...new Set(products.flatMap((product) => product.compatibleModels))];
  const equipmentOptions = [...new Set(products.flatMap((product) => product.compatibleEquipment))];
  const problems = [...new Set(products.flatMap((product) => product.problemsSolved))];

  const filtered = products.filter((product) => {
    const text = [
      product.name,
      product.sku || "",
      product.category,
      product.shortDescription,
      product.fitmentNote || "",
      ...product.compatibleModels,
      ...product.compatibleEquipment,
      ...product.problemsSolved
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (!category || product.category === category) &&
      (!model || matchesModel(product, model)) &&
      (!equipmentFilter || fuzzyIncludes(product.compatibleEquipment, equipmentFilter)) &&
      (!problem || fuzzyIncludes(product.problemsSolved, problem))
    );
  });

  const sorted = model
    ? [...filtered].sort((a, b) => {
        const aUniversal = a.fitmentType === "UNIVERSAL" ? 1 : 0;
        const bUniversal = b.fitmentType === "UNIVERSAL" ? 1 : 0;
        return aUniversal - bUniversal;
      })
    : filtered;

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">Repair Kit Products</h1>
        <p className="mt-3 max-w-3xl text-steel">
          Filter by category, compatible model, equipment and problem solved. Model-specific kits show first; universal
          parts that also fit are listed after them.
        </p>
        <div className="mt-8">
          <Suspense>
            <ProductsFilter categories={categories} models={models} equipmentOptions={equipmentOptions} problems={problems} />
          </Suspense>
        </div>
        <p className="mt-6 text-sm font-black uppercase text-steel">
          {sorted.length} {sorted.length === 1 ? "product" : "products"} found
        </p>
        {sorted.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-4 border border-line bg-white p-8 text-center">
            <p className="text-lg font-black">No products match these filters.</p>
            <p className="mt-2 text-steel">
              Try removing a filter, or contact us on WhatsApp — we stock more parts than the catalog shows.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
