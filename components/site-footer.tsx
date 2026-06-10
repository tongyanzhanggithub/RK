import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="bg-ink px-4 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <strong className="text-xl">RepairKit Supply</strong>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
            Factory-direct supplier of small engine parts, repair kits and complete engines from the Chongqing
            manufacturing cluster. Wholesale and OEM for the Middle East, Central Asia and Southeast Asia.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Logistics: sea LCL/FCL and China–Central Asia rail · full export documents · T/T payment terms.
          </p>
        </div>
        <div>
          <strong className="block text-sm uppercase tracking-wide text-safety">Navigate</strong>
          <div className="mt-3 grid gap-2 text-sm font-bold text-white/80">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/wholesale">Wholesale / RFQ</Link>
            <Link href="/cart">Cart (trial orders)</Link>
          </div>
        </div>
        <div>
          <strong className="block text-sm uppercase tracking-wide text-safety">Get a quote</strong>
          <div className="mt-3 grid gap-3 text-sm font-bold">
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white hover:text-safety"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-white hover:text-safety">
              <Mail size={16} /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
