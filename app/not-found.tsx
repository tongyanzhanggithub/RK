import Link from "next/link";
import { Cog, Home, Search, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <section className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center bg-navy text-white">
          <Cog size={32} />
        </span>
        <p className="mt-6 font-black uppercase text-brand">404</p>
        <h1 className="mt-2 text-4xl font-black">This part isn&apos;t in our catalog</h1>
        <p className="mt-3 leading-7 text-steel">
          The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back to the right repair kit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center gap-2 bg-brand px-5 font-black text-white hover:bg-[#1c54bf]">
            <Home size={18} /> Home
          </Link>
          <Link href="/products" className="inline-flex h-11 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
            <Search size={18} /> Browse Products
          </Link>
          <Link href="/problems" className="inline-flex h-11 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
            <Wrench size={18} /> Troubleshooting
          </Link>
        </div>
      </section>
    </main>
  );
}
