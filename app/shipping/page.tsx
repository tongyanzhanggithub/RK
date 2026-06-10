import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, MessageCircle, Package, Ship, Timer } from "lucide-react";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping times, costs and destinations for retail trial orders and wholesale shipments from our Chongqing warehouse."
};

export default function ShippingPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="font-black uppercase text-safety">Policies</p>
        <h1 className="mt-1 text-4xl font-black">Shipping Policy</h1>
        <p className="mt-3 text-steel">How we ship retail trial orders and wholesale cartons, and what to expect.</p>

        <section className="mt-8 border border-line bg-white p-6">
          <h2 className="inline-flex items-center gap-2 text-2xl font-black">
            <Package className="text-navy" size={24} /> Retail / trial orders (paid by card)
          </h2>
          <ul className="mt-4 grid gap-3 text-steel">
            <li className="flex items-start gap-3">
              <Timer className="mt-0.5 shrink-0 text-navy" size={18} />
              <span>
                <strong className="text-ink">Processing:</strong> orders are packed and handed to the courier within
                3–5 business days of payment confirmation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Globe2 className="mt-0.5 shrink-0 text-navy" size={18} />
              <span>
                <strong className="text-ink">Delivery time:</strong> 7–15 business days by standard international
                courier, depending on destination and customs.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Ship className="mt-0.5 shrink-0 text-navy" size={18} />
              <span>
                <strong className="text-ink">Shipping cost:</strong> flat $19.90 per order, calculated at checkout.
              </span>
            </li>
          </ul>
          <p className="mt-4 border-l-4 border-safety bg-panel p-4 text-sm font-bold">
            A tracking number is sent to your email once the parcel ships. Import duties or taxes charged by your
            country, if any, are the buyer&apos;s responsibility.
          </p>
        </section>

        <section className="mt-6 border border-line bg-white p-6">
          <h2 className="inline-flex items-center gap-2 text-2xl font-black">
            <Ship className="text-navy" size={24} /> Wholesale shipments
          </h2>
          <p className="mt-3 leading-7 text-steel">
            Carton and pallet orders ship by sea (LCL / FCL) or China–Central Asia rail with full export documentation.
            Freight terms (EXW / FOB / CIF) and lead times are quoted per order based on quantity and destination.
            Message us with your model list and destination port for a same-day freight quote.
          </p>
        </section>

        <section className="mt-6 border border-line bg-white p-6">
          <h2 className="text-2xl font-black">Destinations we serve</h2>
          <p className="mt-3 leading-7 text-steel">
            We currently ship retail orders to the United States, Canada, United Kingdom, Australia, the Middle East
            (UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain, Jordan, Turkey), Central Asia and the Caucasus
            (Kazakhstan, Uzbekistan, Kyrgyzstan, Georgia, Azerbaijan) and Southeast Asia (Singapore, Malaysia,
            Thailand, Philippines, Indonesia, Vietnam, Cambodia). Wholesale shipments can be arranged to most ports
            worldwide.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
          >
            <MessageCircle size={18} /> Ask about shipping
          </a>
          <Link href="/returns" className="inline-flex h-12 items-center gap-2 border border-navy px-5 font-black text-navy hover:bg-panel">
            Returns &amp; Warranty
          </Link>
        </div>
      </div>
    </main>
  );
}
