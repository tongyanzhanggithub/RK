"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, User, X } from "lucide-react";
import { CartNavLink } from "@/components/cart-nav-link";
import { QuoteNavLink } from "@/components/quote-nav-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { RegionSwitcher } from "@/components/region-switcher";
import { useLanguage } from "@/components/language-provider";
import { MyEngineChip } from "@/components/my-engine-chip";
import { SearchBox } from "@/components/search-box";
import { Logo } from "@/components/logo";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export function SiteHeader() {
  const { dict } = useLanguage();
  const nav = dict.nav;
  const h = dict.header;
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Announcement bar — desktop only (keeps the mobile sticky header short). */}
      <div className="hidden bg-ink px-4 py-2 text-sm font-semibold text-white lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>{h.topbar_left}</span>
          <div className="flex items-center gap-2">
            <RegionSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main bar: compact single row on mobile, full grid on desktop. */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:grid lg:grid-cols-[280px_1fr_auto] lg:py-4">
        <Link href="/" className="mr-auto flex items-center gap-3 lg:mr-0" aria-label="Partavio home" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop search */}
        <div className="hidden lg:block">
          <SearchBox />
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center justify-end gap-1 sm:gap-2 lg:flex">
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
            className="inline-flex h-11 items-center justify-center gap-2 bg-brand px-4 font-black text-white"
          >
            <MessageCircle size={18} /> {h.quote}
          </a>
        </div>

        {/* Mobile actions: cart + hamburger */}
        <div className="flex items-center gap-1 lg:hidden">
          <CartNavLink />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-graphite hover:bg-panel"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t border-line bg-panel lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 px-4 py-3 text-sm font-black text-graphite hover:bg-white">
              {label}
            </Link>
          ))}
          <MyEngineChip />
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-line bg-white lg:hidden">
          <div className="p-4">
            <SearchBox />
          </div>
          <nav className="grid border-t border-line">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line px-4 py-3 text-sm font-black text-graphite hover:bg-panel"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 border-b border-line px-4 py-3 text-sm font-black text-graphite hover:bg-panel"
            >
              <User size={18} /> {nav.account}
            </Link>
          </nav>
          <div className="flex flex-col gap-3 p-4">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-black text-white"
            >
              <MessageCircle size={18} /> {h.quote}
            </a>
            <div className="flex items-center justify-between gap-2">
              <RegionSwitcher />
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-2">
              <QuoteNavLink />
              <MyEngineChip />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
