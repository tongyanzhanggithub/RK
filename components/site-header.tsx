"use client";

import Link from "next/link";
import { MessageCircle, User } from "lucide-react";
import { CartNavLink } from "@/components/cart-nav-link";
import { QuoteNavLink } from "@/components/quote-nav-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { RegionSwitcher } from "@/components/region-switcher";
import { useLanguage } from "@/components/language-provider";
import { MyEngineChip } from "@/components/my-engine-chip";
import { SearchBox } from "@/components/search-box";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export function SiteHeader() {
  const { dict } = useLanguage();
  const nav = dict.nav;
  const h = dict.header;

  const navItems = [
    [nav.home, "/"],
    [nav.products, "/products"],
    [nav.engines, "/engines"],
    [nav.problems, "/problems"],
    [nav.guides, "/guides"],
    [nav.wholesale, "/wholesale"]
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-sm font-semibold text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>{h.topbar_left}</span>
          <div className="flex items-center gap-2">
            <RegionSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_auto] lg:items-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center bg-navy text-xl font-black text-white">RK</span>
          <span>
            <strong className="block text-xl leading-tight">RepairKit Supply</strong>
            <small className="font-bold uppercase text-steel">{h.tagline}</small>
          </span>
        </Link>
        <SearchBox />
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link
            href="/account"
            className="inline-flex h-11 items-center gap-2 px-3 text-sm font-black text-graphite hover:bg-panel"
          >
            <User size={18} /> {nav.account}
          </Link>
          <QuoteNavLink />
          <CartNavLink />
          <a
            href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 bg-safety px-4 font-black text-ink"
          >
            <MessageCircle size={18} /> {h.quote}
          </a>
        </div>
      </div>
      <nav className="border-t border-line bg-panel">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 px-4 py-3 text-sm font-black text-graphite hover:bg-white">
              {label}
            </Link>
          ))}
          <MyEngineChip />
        </div>
      </nav>
    </header>
  );
}
