import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Canceled",
  description: "Checkout was canceled."
};

export default function CheckoutCancelPage() {
  const dict = getServerDict();
  const c = dict.cancel;

  return (
    <main className="px-4 py-14">
      <section className="mx-auto max-w-3xl border border-line bg-white p-8 text-center">
        <RotateCcw className="mx-auto text-navy" size={54} />
        <p className="mt-5 font-black uppercase text-brand">{c.badge}</p>
        <h1 className="mt-2 text-4xl font-black">{c.heading}</h1>
        <p className="mt-4 text-steel">{c.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/cart" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
            {c.back_to_cart}
          </Link>
          <Link href="/products" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
            {dict.common.continue_shopping}
          </Link>
        </div>
      </section>
    </main>
  );
}
