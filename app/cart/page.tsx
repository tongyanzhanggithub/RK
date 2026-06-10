import type { Metadata } from "next";
import { CartPageClient } from "@/app/cart/cart-page-client";
import { getStoreProducts } from "@/lib/product-store";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review repair kits and continue to secure Stripe checkout."
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await getStoreProducts();
  return <CartPageClient products={products} />;
}
