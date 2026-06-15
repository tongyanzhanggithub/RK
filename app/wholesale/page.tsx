import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Factory, MessageCircle, Ship, Tags, Wallet } from "lucide-react";
import { WholesaleApplicationForm } from "@/app/wholesale/wholesale-application-form";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Wholesale & RFQ — Engine Parts Supplier",
  description: "Request a wholesale quote for small engine parts, repair kits and complete engines. Factory-direct from China, serving the Middle East, Central Asia and Southeast Asia."
};

export default function WholesalePage({ searchParams }: { searchParams?: { submitted?: string } }) {
  const submitted = searchParams?.submitted === "1";

  return (
    <main>
      <section className="border-b border-line bg-ink px-4 py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-black uppercase text-safety">Wholesale &amp; RFQ</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Request a wholesale quote</h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
              >
                <MessageCircle size={18} /> Quote on WhatsApp
              </a>
              <a href="#application" className="inline-flex h-12 items-center gap-2 border border-white/40 px-5 font-black text-white hover:bg-white/10">
                Fill the RFQ form
              </a>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-white/75">
            For repair shops, distributors, dealers and rental fleets across the Middle East, Central Asia and
            Southeast Asia. Send your model list and quantities — we reply with factory pricing, MOQ, carton plan and
            freight options.
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Benefit icon={Factory} title="Factory-direct pricing" copy="Sourced from the Chongqing engine-parts cluster — no middleman markup." />
          <Benefit icon={Tags} title="OEM / private label" copy="Custom packaging and carton mixes built for your market and brand." />
          <Benefit icon={Ship} title="Sea & rail freight" copy="LCL/FCL ocean and China–Central Asia rail, with full export documents." />
          <Benefit icon={Wallet} title="T/T payment terms" copy="Bank transfer (T/T) for reviewed buyers. Cards available for trial orders." />
        </div>
      </section>

      <section className="border-b border-line bg-panel px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-4">
            {[
              ["1. Send your list", "Share engine models, part numbers or equipment types plus target quantities — by WhatsApp or the form below."],
              ["2. Quick verification", "We confirm you're a real reseller (a website, shop page or business address is enough). This keeps pricing fair for genuine buyers."],
              ["3. Free sample", "Once verified, we ship a free sample so you can check the quality before committing to a bulk order."],
              ["4. Bulk order", "Approve the sample, then scale to cartons or containers with wholesale pricing and T/T terms."]
            ].map(([title, copy]) => (
              <div key={title} className="border border-line bg-white p-6">
                <strong className="block text-lg">{title}</strong>
                <p className="mt-2 text-sm leading-6 text-steel">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 border border-navy bg-white p-5">
            <span className="mt-0.5 shrink-0 bg-safety px-2 py-1 text-xs font-black uppercase text-ink">Sample policy</span>
            <p className="text-sm font-bold leading-6">
              We offer <strong>free samples to verified resellers</strong>. To keep this fair and fast, we confirm your business
              first — a company website, online store, or shop address is all we need. Not a reseller yet?{" "}
              <a href="/products" className="text-navy underline">Place a small trial order by card</a> instead — it ships immediately, no verification needed.
            </p>
          </div>
        </div>
      </section>

      <section id="application" className="px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[380px_1fr]">
          <aside>
            <p className="font-black uppercase text-safety">RFQ form</p>
            <h2 className="mt-2 text-3xl font-black">Tell us what you sell or repair</h2>
            <p className="mt-4 leading-7 text-steel">
              We review the product fit, expected quantity and destination market, then reply with a quote and activate a wholesale customer profile.
            </p>
            <div className="mt-8 border-y border-line py-5 text-sm leading-6 text-steel">
              Prefer to chat? Most buyers get a faster quote on WhatsApp — send your model list and we reply with pricing the same day.
            </div>
            <Link href="/products" className="mt-6 inline-flex font-black text-navy">
              Browse products before applying
            </Link>
          </aside>

          <div className="border border-line bg-white p-5 md:p-8">
            {submitted ? (
              <div className="grid min-h-[420px] place-items-center text-center">
                <div className="max-w-xl">
                  <CheckCircle2 className="mx-auto text-green-700" size={52} />
                  <h2 className="mt-5 text-3xl font-black">Application received</h2>
                  <p className="mt-4 leading-7 text-steel">
                    Our team will review your company, product interest and expected quantity before confirming wholesale access.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link href="/products" className="inline-flex h-11 items-center bg-navy px-4 font-black text-white">Browse Products</Link>
                    <Link href="/" className="inline-flex h-11 items-center border border-navy px-4 font-black text-navy">Back Home</Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 border-b border-line pb-5">
                  <h2 className="text-2xl font-black">Wholesale application</h2>
                  <p className="mt-2 text-sm leading-6 text-steel">Required fields help us review the request without a long email exchange.</p>
                </div>
                <WholesaleApplicationForm />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({
  icon: Icon,
  title,
  copy
}: {
  icon: typeof Factory;
  title: string;
  copy: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <Icon className="text-navy" size={26} />
      <div>
        <strong className="block">{title}</strong>
        <p className="mt-1 text-sm leading-6 text-steel">{copy}</p>
      </div>
    </div>
  );
}
