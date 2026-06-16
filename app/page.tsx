import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Cog,
  Factory,
  Globe2,
  MessageCircle,
  Ship,
  Star,
  Stethoscope
} from "lucide-react";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { PartFinder } from "@/components/part-finder";
import { ProductCard } from "@/components/product-card";
import { models } from "@/data/models";
import { problems } from "@/data/problems";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dict = getServerDict();
  const hp = dict.homepage;
  const products = await getStoreProducts();
  const bestSellers = products.slice(0, 5);
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3
  });

  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
  }
  const managedCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });
  const categories: [string, number][] = managedCategories.length
    ? managedCategories.map((category) => [category.name, categoryCounts.get(category.name) || 0])
    : [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  const supplyAdvantages = [
    [Factory, hp.supply_badge, "Sourced from China's largest motorcycle and small-engine parts cluster — the same ecosystem behind Loncin, Zongshen and Lifan engines."],
    [Boxes, "Full range, one supplier", "Complete engines, spare parts and repair kits in a single order. Consolidate your sourcing and cut freight per unit."],
    [BadgeCheck, "OEM / ODM & custom kitting", "Private-label packaging and custom carton mixes built for your local market and brand."],
    [Ship, "Export-ready logistics", "Sea LCL/FCL and China–Central Asia rail. Full export documentation, T/T payment terms for reviewed buyers."]
  ];

  const heroSlides: HeroSlide[] = [
    {
      badge: hp.badge,
      title: hp.headline,
      subtitle: hp.subtext,
      primary: { label: hp.cta_quote, href: whatsappLink(GENERAL_INQUIRY_MESSAGE), external: true, whatsapp: true },
      secondary: { label: hp.cta_distributor, href: "/wholesale" },
      panelTitle: hp.why_title,
      bullets: [hp.why_1, hp.why_2, hp.why_3, hp.why_4]
    },
    {
      badge: hp.slide2_badge,
      title: hp.slide2_title,
      subtitle: hp.slide2_sub,
      primary: { label: hp.slide2_cta, href: "/products" },
      secondary: { label: hp.engine_view_all, href: "/engines" },
      panelTitle: hp.slide2_panel,
      bullets: [hp.slide2_b1, hp.slide2_b2, hp.slide2_b3]
    },
    {
      badge: hp.slide3_badge,
      title: hp.slide3_title,
      subtitle: hp.slide3_sub,
      primary: { label: hp.cta_distributor, href: "/wholesale" },
      secondary: { label: hp.cta_browse, href: "/products" },
      panelTitle: hp.slide3_panel,
      bullets: [hp.slide3_b1, hp.slide3_b2, hp.slide3_b3]
    }
  ];

  return (
    <main>
      {/* 1 — Hero carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* 2 — Find the right part */}
      <section className="border-b border-line bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <PartFinder />
        </div>
      </section>

      {/* 3 — Region strip */}
      <section className="border-b border-line bg-navy px-4 py-5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-black">
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Middle East</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Central Asia</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> Southeast Asia</span>
          <span className="text-white/60">·</span>
          <span>Complete engines · Spare parts · Repair kits · OEM</span>
        </div>
      </section>

      {/* 4 — Best sellers (products first) */}
      <section className="border-b border-line bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{hp.bestseller_badge}</p>
              <h2 className="text-3xl font-black">{hp.bestseller_title}</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 font-black text-navy hover:underline">
              {dict.common.view_catalog} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Shop by category */}
      <section className="border-b border-line bg-panel px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{hp.category_badge}</p>
              <h2 className="text-3xl font-black">{hp.category_title}</h2>
            </div>
            <Link href="/products" className="font-black text-navy">{dict.common.view_catalog}</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(([category, count]) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group flex items-center justify-between gap-3 border border-line bg-white p-5 shadow-sm hover:border-navy"
              >
                <span>
                  <strong className="block leading-snug">{category}</strong>
                  <span className="mt-1 block text-sm font-bold text-steel">
                    {hp.products_count.replace("{n}", String(count))}
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-navy transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Shop by engine (dark spotlight — the fitment USP) */}
      <section className="border-b border-line bg-ink px-4 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{hp.engine_badge}</p>
              <h2 className="text-3xl font-black">{hp.engine_title}</h2>
            </div>
            <Link href="/engines" className="inline-flex items-center gap-1 font-black text-safety hover:underline">
              {hp.engine_view_all} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {models.map((model) => (
              <Link
                key={model.slug}
                href={`/engines/${model.slug}`}
                className="group flex items-center gap-3 border border-white/15 bg-white/5 p-4 hover:border-safety hover:bg-white/10"
              >
                <Cog size={22} className="shrink-0 text-safety" />
                <span>
                  <strong className="block leading-tight">{model.name}</strong>
                  <span className="mt-0.5 block text-xs font-bold text-white/55">{model.commonEquipment[0]}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Fix by symptom */}
      <section className="border-b border-line bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{hp.problem_badge}</p>
              <h2 className="text-3xl font-black">{hp.problem_title}</h2>
            </div>
            <Link href="/problems" className="font-black text-navy">{hp.problem_view_all}</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => (
              <Link
                key={problem.slug}
                href={`/problems/${problem.slug}`}
                className="group flex items-start gap-3 border border-line bg-white p-4 shadow-sm hover:border-navy"
              >
                <Stethoscope size={20} className="mt-0.5 shrink-0 text-navy" />
                <span>
                  <strong className="block leading-snug">{problem.title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-steel">
                    {problem.commonCauses.slice(0, 2).join(" · ")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — Why buyers source from us (trust) — differentiated with numbered accent */}
      <section className="border-b border-line bg-panel px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="font-black uppercase text-safety">{hp.supply_badge}</p>
            <h2 className="text-3xl font-black">{hp.supply_title}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supplyAdvantages.map(([Icon, title, copy], index) => (
              <div key={title as string} className="relative border border-line bg-white p-6 pl-7 shadow-sm">
                <span className="absolute left-0 top-0 h-full w-1.5 bg-safety" />
                <div className="flex items-center justify-between">
                  <Icon className="text-navy" size={28} />
                  <span className="text-2xl font-black text-line">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <strong className="mt-4 block leading-snug">{title as string}</strong>
                <p className="mt-2 text-sm leading-6 text-steel">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-b border-line bg-white px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <p className="font-black uppercase text-safety">{hp.testimonial_badge}</p>
              <h2 className="text-3xl font-black">{hp.testimonial_title}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.id} className="grid content-start gap-3 border border-line bg-panel p-6">
                  <span className="inline-flex items-center gap-0.5 text-safety">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} size={15} fill="currentColor" />
                    ))}
                  </span>
                  <blockquote className="text-sm leading-6 text-steel">
                    {dict.locale === "zh" && testimonial.contentZh ? testimonial.contentZh : testimonial.content}
                  </blockquote>
                  <figcaption className="text-sm font-black">
                    {testimonial.authorName}
                    <span className="font-bold text-steel">
                      {testimonial.company ? ` · ${testimonial.company}` : ""} · {testimonial.country}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10 — Closing CTA */}
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
