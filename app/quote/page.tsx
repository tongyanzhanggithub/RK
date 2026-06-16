import type { Metadata } from "next";
import { QuotePageClient } from "@/app/quote/quote-page-client";
import { getStoreProducts } from "@/lib/product-store";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Build a multi-product quote request and send it for wholesale pricing."
};

export const dynamic = "force-dynamic";

export default async function QuotePage() {
  const products = await getStoreProducts();
  return (
    <QuotePageClient
      products={products.map((product) => ({
        slug: product.slug,
        name: product.name,
        sku: product.sku || "",
        category: product.category,
        image: product.image || product.images?.[0]?.url || null
      }))}
    />
  );
}
