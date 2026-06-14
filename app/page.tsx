import { HomeContent } from "@/components/home-content";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getStoreProducts();
  return <HomeContent products={products} />;
}
