"use client";

import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { CartNavLink } from "@/components/cart-nav-link";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/components/language-provider";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

const navItems: [string, string][] = [
  ["nav.home", "/"],
  ["nav.products", "/products"],
  ["nav.wholesale", "/wholesale"]
];

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-sm font-semibold text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>{t("topbar.factory")}</span>
          <span className="text-safety">{t("topbar.serving")}</span>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_auto] lg:items-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-navy text-xl font-black text-white">RK</span>
          <span>
            <strong className="block text-xl leading-tight">RepairKit Supply</strong>
            <small className="font-bold uppercase text-steel">{t("brand.tagline")}</small>
          </span>
        </Link>
        <form action="/products" className="grid grid-cols-[1fr_auto] border border-line bg-white">
          <input name="q" className="min-w-0 px-4 py-3 outline-none" placeholder={t("search.placeholder")} />
          <button className="inline-flex items-center gap-2 bg-navy px-4 font-bold text-white" type="submit">
            <Search size={18} /> {t("search.button")}
          </button>
        </form>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <a
            href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 bg-safety px-5 font-black text-ink"
          >
            <MessageCircle size={18} /> {t("cta.getQuote")}
          </a>
        </div>
      </div>
      <nav className="border-t border-line bg-panel">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {navItems.map(([labelKey, href]) => (
            <Link key={href} href={href} className="shrink-0 px-4 py-3 text-sm font-black text-graphite hover:bg-white">
              {t(labelKey)}
            </Link>
          ))}
          <CartNavLink />
        </div>
      </nav>
    </header>
  );
}
