"use client";

import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { CONTACT_EMAIL, GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  const { dict } = useLanguage();
  const f = dict.footer;
  const nav = dict.nav;

  return (
    <footer className="bg-ink px-4 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-2 max-w-md text-sm leading-6 text-white/70">{f.description}</p>
          <p className="mt-4 text-sm leading-6 text-white/70">{f.logistics}</p>
        </div>
        <div>
          <strong className="block text-sm uppercase tracking-wide text-brand">{f.navigate}</strong>
          <div className="mt-3 grid gap-2 text-sm font-bold text-white/80">
            <Link href="/">{nav.home}</Link>
            <Link href="/products">{nav.products}</Link>
            <Link href="/engines">{nav.engines}</Link>
            <Link href="/problems">{nav.problems}</Link>
            <Link href="/guides">{nav.guides}</Link>
            <Link href="/wholesale">{nav.wholesale}</Link>
            <Link href="/cart">{f.cart_link}</Link>
          </div>
          <strong className="mt-5 block text-sm uppercase tracking-wide text-brand">{f.policies}</strong>
          <div className="mt-3 grid gap-2 text-sm font-bold text-white/80">
            <Link href="/guaranteed-fit">{dict.gfit.title}</Link>
            <Link href="/shipping">{f.shipping}</Link>
            <Link href="/returns">{f.returns}</Link>
            <Link href="/terms">{f.terms}</Link>
            <Link href="/privacy">{f.privacy}</Link>
            <Link href="/contact">{f.contact}</Link>
            <Link href="/about">{f.about}</Link>
          </div>
        </div>
        <div>
          <strong className="block text-sm uppercase tracking-wide text-brand">{f.quote}</strong>
          <div className="mt-3 grid gap-3 text-sm font-bold">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white hover:text-brand"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-white hover:text-brand">
              <Mail size={16} /> {CONTACT_EMAIL}
            </a>
          </div>
          <strong className="mt-6 block text-sm uppercase tracking-wide text-brand">{f.newsletter_title}</strong>
          <div className="mt-3">
            <NewsletterForm source="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
