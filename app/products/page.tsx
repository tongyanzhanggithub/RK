import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getStoreProducts } from "@/lib/product-store";

export const metadata: Metadata = {
  title: "Repair Kit Products",
  description: "Browse small engine repair kits by category, model, problem and price range."
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams?: { q?: string; category?: string; model?: string; problem?: string } }) {
  const products = await getStoreProducts();
  const q = searchParams?.q?.toLowerCase() || "";
  const category = searchParams?.category || "";
  const model = searchParams?.model || "";
  const problem = searchParams?.problem || "";
  const categories = [...new Set(products.map((product) => product.category))];
  const models = [...new Set(products.flatMap((product) => product.compatibleModels))];
  const problems = [...new Set(products.flatMap((product) => product.problemsSolved))];
  const filtered = products.filter((product) => {
    const text = [product.name, product.category, product.shortDescription, ...product.compatibleModels, ...product.problemsSolved].join(" ").toLowerCase();
    return (!q || text.includes(q)) && (!category || product.category === category) && (!model || product.compatibleModels.includes(model)) && (!problem || product.problemsSolved.includes(problem));
  });

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">Repair Kit Products</h1>
        <p className="mt-3 max-w-3xl text-steel">Filter by category, compatible model and problem solved, then add repair kits to your cart for Stripe checkout.</p>
        <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-5">
          <input name="q" defaultValue={searchParams?.q || ""} className="border border-line px-3 py-2" placeholder="Search kits..." />
          <select name="category" defaultValue={category} className="border border-line px-3 py-2">
            <option value="">All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="model" defaultValue={model} className="border border-line px-3 py-2">
            <option value="">All models</option>
            {models.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="problem" defaultValue={problem} className="border border-line px-3 py-2">
            <option value="">All problems</option>
            {problems.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="bg-navy px-4 py-2 font-black text-white">Apply Filters</button>
        </form>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      </div>
    </main>
  );
}
