import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MessageCircle, SearchX } from "lucide-react";
import { FitmentBar } from "@/components/fitment-bar";
import { ProductCard } from "@/components/product-card";
import { ProductsFilter } from "@/components/products-filter";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getStoreProducts } from "@/lib/product-store";
import { getServerDict } from "@/lib/locale";
import type { Product } from "@/data/products";

export function generateMetadata(): Metadata {
  const d = getServerDict();
  return { title: d.products.heading, description: d.products.subtext };
}

export const dynamic = "force-dynamic";

type ProductsSearchParams = {
  q?: string;
  category?: string;
  model?: string;
  equipment?: string;
  problem?: string;
  sort?: string;
  fits?: string;
  guaranteed?: string;
  page?: string;
};

function fuzzyIncludes(values: string[], needle: string) {
  const target = needle.trim().toLowerCase();
  return values.some((value) => value.toLowerCase().includes(target));
}

function matchesModel(product: Product, model: string) {
  if (product.fitmentType === "UNIVERSAL") return true;
  return fuzzyIncludes(product.compatibleModels, model);
}

// "fits my garage": product fits ANY of the buyer's saved engines (or is universal).
function matchesGarage(product: Product, engines: string[]) {
  if (product.fitmentType === "UNIVERSAL") return true;
  return engines.some((engine) => fuzzyIncludes(product.compatibleModels, engine));
}

export default async function ProductsPage({ searchParams }: { searchParams?: ProductsSearchParams }) {
  const dict = getServerDict();
  const p = dict.products;
  const products = await getStoreProducts();
  const q = searchParams?.q?.toLowerCase() || "";
  const category = searchParams?.category || "";
  const model = searchParams?.model || "";
  const equipmentFilter = searchParams?.equipment || "";
  const problem = searchParams?.problem || "";
  const sort = searchParams?.sort || "";
  const fitsEngines = (searchParams?.fits || "").split(";").map((s) => s.trim()).filter(Boolean);
  const guaranteedOnly = searchParams?.guaranteed === "1";

  const categories = [...new Set(products.map((product) => product.category))];
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
      (!guaranteedOnly || product.fitmentGuaranteed) &&
      (fitsEngines.length === 0 || matchesGarage(product, fitsEngines)) &&
      (!equipmentFilter || fuzzyIncludes(product.compatibleEquipment, equipmentFilter)) &&
      (!problem || fuzzyIncludes(product.problemsSolved, problem))
    );
  });

  const universalLast = (model || fitsEngines.length > 0)
    ? [...filtered].sort((a, b) => {
        const aUniversal = a.fitmentType === "UNIVERSAL" ? 1 : 0;
        const bUniversal = b.fitmentType === "UNIVERSAL" ? 1 : 0;
        return aUniversal - bUniversal;
      })
    : [...filtered];

  const sorted =
    sort === "price-asc"
      ? universalLast.sort((a, b) => a.priceCents - b.priceCents)
      : sort === "price-desc"
        ? universalLast.sort((a, b) => b.priceCents - a.priceCents)
        : sort === "name-asc"
          ? universalLast.sort((a, b) => a.name.localeCompare(b.name))
          : universalLast;

  // Pagination: keep the in-memory filter/sort, then render one page at a time so
  // a growing catalog doesn't ship hundreds of cards in a single response.
  const PAGE_SIZE = 24;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(searchParams?.page) || 1), totalPages);
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Build a query string for a target page, preserving every active filter.
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (key === "page" || value == null || value === "") continue;
      params.set(key, String(value));
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };
  const pageWindow = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black">{p.heading}</h1>
        <p className="mt-3 max-w-3xl text-steel">{p.subtext}</p>
        <div className="mt-8">
          <Suspense>
            <FitmentBar />
          </Suspense>
        </div>
        <div className="mt-4">
          <Suspense>
            <ProductsFilter categories={categories} equipmentOptions={equipmentOptions} problems={problems} />
          </Suspense>
        </div>
        <p className="mt-6 text-sm font-black uppercase text-steel">
          {sorted.length === 1 ? p.count_one : p.count_other.replace("{n}", String(sorted.length))}
        </p>
        {sorted.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((product) => (
                <ProductCard key={product.slug} product={product} activeModel={model || undefined} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="inline-flex h-10 items-center justify-center border border-line bg-white px-3 font-black text-navy hover:border-navy">
                    ‹
                  </Link>
                )}
                {pageWindow.map((n, i) => {
                  const gap = i > 0 && n - pageWindow[i - 1] > 1;
                  return (
                    <span key={n} className="flex items-center gap-2">
                      {gap && <span className="px-1 text-steel">…</span>}
                      <Link
                        href={pageHref(n)}
                        aria-current={n === page ? "page" : undefined}
                        className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 font-black ${
                          n === page ? "border-brand bg-brand text-white" : "border-line bg-white text-navy hover:border-navy"
                        }`}
                      >
                        {n}
                      </Link>
                    </span>
                  );
                })}
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className="inline-flex h-10 items-center justify-center border border-line bg-white px-3 font-black text-navy hover:border-navy">
                    ›
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="mt-4 border border-line bg-white p-10 text-center">
            <SearchX className="mx-auto text-steel" size={44} />
            <p className="mt-4 text-lg font-black">{p.no_results}</p>
            <p className="mx-auto mt-2 max-w-md text-steel">{p.no_results_sub}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
                {p.clear_all}
              </Link>
              <a
                href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel"
              >
                <MessageCircle size={17} /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
