"use client";

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
import type { LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useI18n } from "@/components/language-provider";
import type { Product } from "@/data/products";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

const featuredCategories: [string, string, string, LucideIcon][] = [
  ["home.cat.1.title", "home.cat.1.copy", "Small Engine Repair Kit", Cog],
  ["home.cat.2.title", "home.cat.2.copy", "Water Pump Repair Kit", Droplets],
  ["home.cat.3.title", "home.cat.3.copy", "Generator Repair Kit", ShieldCheck],
  ["home.cat.4.title", "home.cat.4.copy", "Starter System Kit", Wrench],
  ["home.cat.5.title", "home.cat.5.copy", "Fuel System Kit", ClipboardList]
];

const supplyAdvantages: [LucideIcon, string, string][] = [
  [Factory, "home.adv.1.title", "home.adv.1.copy"],
  [Boxes, "home.adv.2.title", "home.adv.2.copy"],
  [BadgeCheck, "home.adv.3.title", "home.adv.3.copy"],
  [Ship, "home.adv.4.title", "home.adv.4.copy"]
];

const heroWhyKeys = ["home.hero.why1", "home.hero.why2", "home.hero.why3", "home.hero.why4"];

export function HomeContent({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const bestSellers = products.slice(0, 5);

  return (
    <main>
      <section className="industrial-grid border-b border-line bg-panel px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <p className="mb-4 font-black uppercase text-safety">{t("home.hero.badge")}</p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] text-ink md:text-6xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">{t("home.hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
              >
                <MessageCircle size={18} /> {t("home.hero.getQuote")}
              </a>
              <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-white">
                {t("home.hero.becomeDistributor")} <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="inline-flex h-12 items-center gap-2 px-5 font-black text-navy">
                {t("home.hero.browseCatalog")} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black">{t("home.hero.whyTitle")}</h2>
            <div className="mt-5 grid gap-3">
              {heroWhyKeys.map((key) => (
                <div key={key} className="flex items-start gap-3 border border-line p-4 font-bold">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-safety" size={18} />
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-navy px-4 py-5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-black">
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> {t("home.region.me")}</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> {t("home.region.ca")}</span>
          <span className="inline-flex items-center gap-2"><Globe2 size={16} className="text-safety" /> {t("home.region.sea")}</span>
          <span className="text-white/60">·</span>
          <span>{t("home.region.tagline")}</span>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="font-black uppercase text-safety">{t("home.adv.eyebrow")}</p>
            <h2 className="text-3xl font-black">{t("home.adv.title")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supplyAdvantages.map(([Icon, titleKey, copyKey]) => (
              <div key={titleKey} className="border border-line bg-white p-6 shadow-sm">
                <Icon className="mb-4 text-navy" size={28} />
                <strong className="block leading-snug">{t(titleKey)}</strong>
                <p className="mt-2 text-sm leading-6 text-steel">{t(copyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="font-black uppercase text-safety">{t("home.cat.eyebrow")}</p>
            <h2 className="text-3xl font-black">{t("home.cat.title")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {featuredCategories.map(([titleKey, copyKey, category, Icon]) => (
              <Link key={titleKey} href={`/products?category=${encodeURIComponent(category)}`} className="border border-line bg-white p-5 shadow-sm">
                <Icon className="mb-5 text-navy" size={28} />
                <strong className="block leading-snug">{t(titleKey)}</strong>
                <span className="mt-2 block text-sm leading-6 text-steel">{t(copyKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-black uppercase text-safety">{t("home.best.eyebrow")}</p>
              <h2 className="text-3xl font-black">{t("home.best.title")}</h2>
            </div>
            <Link href="/products" className="font-black text-navy">{t("home.best.viewAll")}</Link>
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
            <p className="font-black uppercase text-safety">{t("home.cta.eyebrow")}</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black">{t("home.cta.title")}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">{t("home.cta.copy")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-safety px-6 font-black text-ink"
            >
              <MessageCircle size={18} /> {t("home.cta.whatsapp")}
            </a>
            <Link href="/wholesale" className="inline-flex h-12 items-center gap-2 border border-white/40 px-6 font-black text-white hover:bg-white/10">
              {t("home.cta.apply")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
