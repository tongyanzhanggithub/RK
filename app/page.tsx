import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Cog,
  Droplets,
  Factory,
  Globe2,
  MessageCircle,
  Ship,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { PartFinder } from "@/components/part-finder";
import { ProductCard } from "@/components/product-card";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getStoreProducts } from "@/lib/product-store";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dict = getServerDict();
  const hp = dict.homepage;
  const products = await getStoreProducts();
  const bestSellers = products.slice(0, 5);

  const featuredCategories = [
    ["Small Engine Repair Kits", "For 168F, 170F, GX160 and GX200 style engines", "Small Engine Repair Kit", Cog],
    ["Water Pump Repair Kits", "Seal kits, O-rings, gaskets and pump connectors", "Water Pump Repair Kit", Droplets],
    ["Generator Maintenance Kits", "Maintenance kits for portable generator service", "Generator Repair Kit", ShieldCheck],
    ["Pull Starter Replacement Kits", "Recoil starter, rope and quick service parts", "Starter System Kit", Wrench],
    ["Carburetor Troubleshooting Kits", "Fuel system repair kits for no-start issues", "Fuel System Kit", ClipboardList]
  ];

  const supplyAdvantages = [
    [Factory, hp.supply_badge, "Sourced from China's largest motorcycle and small-engine parts cluster — the same ecosystem behind Loncin, Zongshen and Lifan engines."],
    [Boxes, "Full range, one supplier", "Complete engines, spare parts and repair kits in a single order. Consolidate your sourcing and cut freight per unit."],
    [BadgeCheck, "OEM / ODM & custom kitting", "Private-label packaging and custom carton mixes built for your local market and brand."],
    [Ship, "Export-ready logistics", "Sea LCL/FCL and China–Central Asia rail. Full export documentation, T/T payment terms for reviewed buyers."]
  ];

  const whyItems = [hp.why_1, hp.why_2, hp.why_3, hp.why_4];

  return (
    <main>
      <section className="industrial-grid border-b border-line bg-panel px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <p className="mb-4 font-black uppercase text-safety">{hp.badge}</p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] text-ink md:text-6xl">
              {hp.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">{hp.subtext}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
              >
                <MessageCircle size={18} /> {hp.cta_quote}
              </a>
              <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
                {hp.cta_distributor} <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="inline-flex h-12 items-center gap-2 px-5 font-black text-navy">
                {hp.cta_browse} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black">{hp.why_title}</h2>
            <div className="mt-5 grid gap-3">
              {whyItems.map((item) => (
                <div key={item} className="flex items-start gap-3 border border-line p-4 font-bold">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-safety" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <PartFinder />
        </div>
      </section>

      <section className="border-b border-line bg-navy px-4 py-5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-black">
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Middle East</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Central Asia</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Southeast Asia</span>
          <span className="text-white/60">·</span>
          <span>Complete engines · Spare parts · Repair kits · OEM</span>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="font-black uppercase text-safety">{hp.supply_badge}</p>
            <h2 className="text-3xl font-black">{hp.supply_title}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supplyAdvantages.map(([Icon, title, copy]) => (
              <div key={title as string} className="border border-line bg-white p-6 shadow-sm">
                <Icon className="mb-4 text-navy" size={28} />
                <strong className="block leading-snug">{title as string}</strong>
                <p className="mt-2 text-sm leading-6 text-steel">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="font-black uppercase text-safety">{hp.category_badge}</p>
            <h2 className="text-3xl font-black">{hp.category_title}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {featuredCategories.map(([title, copy, category, Icon]) => (
              <Link key={title as string} href={`/products?category=${encodeURIComponent(category as string)}`} className="border border-line bg-white p-5 shadow-sm">
                <Icon className="mb-5 text-navy" size={28} />
                <strong className="block leading-snug">{title as string}</strong>
                <span className="mt-2 block text-sm leading-6 text-steel">{copy as string}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{hp.bestseller_badge}</p>
              <h2 className="text-3xl font-black">{hp.bestseller_title}</h2>
            </div>
            <Link href="/products" className="font-black text-navy">{dict.common.view_catalog}</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-black uppercase text-safety">{hp.cta_section_badge}</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black">{hp.cta_section_title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">{hp.cta_section_body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-safety px-6 font-black text-ink"
            >
              <MessageCircle size={18} /> {hp.cta_whatsapp}
            </a>
            <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-white/40 px-6 font-black text-white hover:bg-white/10">
              {hp.cta_apply} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
