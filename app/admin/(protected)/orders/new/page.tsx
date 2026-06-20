import type { Metadata } from "next";
import Link from "next/link";
import { ManualOrderForm } from "@/app/admin/(protected)/orders/new/manual-order-form";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "手动建单", description: "为线下/电汇(T/T)订单手动建单。" };

export default async function NewOrderPage() {
  const products = await getStoreProducts();
  const items = products.map((p) => ({ slug: p.slug, name: p.name, sku: p.sku || p.slug, priceCents: p.priceCents }));

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">订单</p>
          <h1 className="text-4xl font-black">手动建单</h1>
          <p className="mt-3 text-steel">用于批发电汇(T/T)等不走 Stripe 的订单。</p>
        </div>
        <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回订单列表
        </Link>
      </div>
      <ManualOrderForm products={items} />
    </main>
  );
}
