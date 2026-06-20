import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Globe2, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Partavio is a factory-direct supplier of small engine repair kits, spare parts and complete engines from the Chongqing manufacturing cluster."
};

const facts = [
  [Factory, "Factory-direct from Chongqing", "We source from China's largest motorcycle and small-engine manufacturing cluster — the ecosystem behind Loncin, Zongshen and Lifan engines."],
  [Wrench, "Built around real repairs", "Our kits are assembled around actual field failures — hard starting, broken recoil starters, leaking pump seals — not random parts bundles."],
  [Globe2, "Export-focused", "We serve repair shops, distributors and dealers across the Middle East, Central Asia and Southeast Asia with sea, rail and courier logistics."],
  [ShieldCheck, "Fitment-first service", "Every order can be fitment-checked for free over WhatsApp before you pay. If we confirm fit and it doesn't fit, replacement is on us."]
];

export default function AboutPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-black uppercase text-brand">About us</p>
        <h1 className="mt-1 text-4xl font-black">A parts supplier that speaks repair</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">
          Partavio sells small engine repair kits, spare parts and complete 168F / GX160-style engines directly
          from the factory floor in Chongqing, China. We exist for the repair shop that needs the right carburetor the
          first time, and the distributor who wants one supplier for the full range.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {facts.map(([Icon, title, copy]) => (
            <div key={title as string} className="border border-line bg-white p-6">
              <Icon className="mb-4 text-navy" size={28} />
              <strong className="block leading-snug">{title as string}</strong>
              <p className="mt-2 text-sm leading-6 text-steel">{copy as string}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 border border-line bg-panel p-6">
          <h2 className="text-2xl font-black">How we work</h2>
          <p className="mt-3 leading-7 text-steel">
            Retail trial orders go through Stripe checkout and ship by international courier. Wholesale buyers send a
            model list on WhatsApp and receive factory pricing, MOQ, carton plans and freight options — usually the
            same day. OEM and private-label packaging are available for established partners.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-brand px-5 font-black text-white"
            >
              <MessageCircle size={18} /> Talk to us on WhatsApp
            </a>
            <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
              Apply for Wholesale <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
