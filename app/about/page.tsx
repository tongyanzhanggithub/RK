import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Globe2, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getServerDict } from "@/lib/locale";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Partavio is a factory-direct supplier of small engine repair kits, spare parts and complete engines from the Chongqing manufacturing cluster."
};

export const dynamic = "force-dynamic";

export default function AboutPage() {
  const t = getServerDict().about_page;
  const facts = [
    [Factory, t.fact1_title, t.fact1_body],
    [Wrench, t.fact2_title, t.fact2_body],
    [Globe2, t.fact3_title, t.fact3_body],
    [ShieldCheck, t.fact4_title, t.fact4_body]
  ] as const;
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-black uppercase text-brand">{t.badge}</p>
        <h1 className="mt-1 text-4xl font-black">{t.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">{t.intro}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {facts.map(([Icon, title, copy]) => (
            <div key={title} className="border border-line bg-white p-6">
              <Icon className="mb-4 text-navy" size={28} />
              <strong className="block leading-snug">{title}</strong>
              <p className="mt-2 text-sm leading-6 text-steel">{copy}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 border border-line bg-panel p-6">
          <h2 className="text-2xl font-black">{t.how_title}</h2>
          <p className="mt-3 leading-7 text-steel">{t.how_body}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-brand px-5 font-black text-white"
            >
              <MessageCircle size={18} /> {t.cta_whatsapp}
            </a>
            <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
              {t.cta_wholesale} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
