import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, BadgeCheck } from "lucide-react";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guaranteed Fit",
  description:
    "Set your engine, look for the green Guaranteed Fit badge, and buy with confidence — if a Guaranteed Fit part doesn't fit, return it free within 30 days."
};

export default function GuaranteedFitPage() {
  const dict = getServerDict();
  const g = dict.gfit;
  const steps = [
    { icon: Car, t: g.step1_t, d: g.step1_d },
    { icon: BadgeCheck, t: g.step2_t, d: g.step2_d },
    { icon: ShieldCheck, t: g.step3_t, d: g.step3_d }
  ];

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex items-center gap-2 font-black uppercase text-brand">
          <ShieldCheck size={18} /> {g.badge}
        </p>
        <h1 className="mt-1 text-4xl font-black">{g.title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-steel">{g.tagline}</p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.t} className="border border-line bg-white p-6">
              <s.icon className="mb-3 text-navy" size={28} />
              <h2 className="text-lg font-black leading-snug">{s.t}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{s.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 border border-green-600 bg-green-50 p-6">
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-green-800">
            <ShieldCheck size={22} /> {g.covers_t}
          </h2>
          <p className="mt-2 text-sm leading-7 text-green-800/90">{g.covers_d}</p>
        </section>

        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-line bg-panel p-6">
          <p className="max-w-xl font-bold leading-6 text-steel">{g.note}</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center gap-2 bg-brand px-6 font-black text-white hover:bg-[#1c54bf]"
          >
            {g.cta} <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
