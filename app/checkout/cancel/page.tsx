import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout Canceled",
  description: "Stripe checkout was canceled."
};

export default function CheckoutCancelPage() {
  return (
    <main className="px-4 py-14">
      <section className="mx-auto max-w-3xl border border-line bg-white p-8 text-center">
        <RotateCcw className="mx-auto text-navy" size={54} />
        <p className="mt-5 font-black uppercase text-safety">Checkout Canceled</p>
        <h1 className="mt-2 text-4xl font-black">Your cart was kept</h1>
        <p className="mt-4 text-steel">
          No payment was completed. You can review quantities, remove items or try Stripe Checkout again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/cart" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
            Back to Cart
          </Link>
          <Link href="/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            Browse Products
          </Link>
        </div>
      </section>
    </main>
  );
}
