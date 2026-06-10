import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Returns & Warranty",
  description:
    "30-day warranty on defective or incorrect parts, free pre-purchase fitment checks and how cross-border claims are resolved."
};

export default function ReturnsPage() {
  const claimLink = whatsappLink(
    "Hello, I need help with an order. Order number: \nIssue: \nI can send photos/videos of the part."
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="font-black uppercase text-safety">Policies</p>
        <h1 className="mt-1 text-4xl font-black">Returns &amp; Warranty</h1>
        <p className="mt-3 text-steel">Plain rules, no fine print: if we shipped the wrong or defective part, we fix it.</p>

        <section className="mt-8 border border-line bg-white p-6">
          <h2 className="inline-flex items-center gap-2 text-2xl font-black">
            <ShieldCheck className="text-navy" size={24} /> 30-day warranty
          </h2>
          <ul className="mt-4 grid gap-3 text-steel">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={18} />
              <span>
                <strong className="text-ink">Defective on arrival or wrong item shipped:</strong> we send a free
                replacement with your next order or refund the item — your choice. Report within 30 days of delivery.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={18} />
              <span>
                <strong className="text-ink">Evidence-based claims:</strong> because international return shipping
                often costs more than the part, we resolve claims with photos or a short video — no need to ship the
                part back in most cases.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" size={18} />
              <span>
                <strong className="text-ink">Free fitment checks before you buy:</strong> send your engine photo on
                WhatsApp and we confirm compatibility. If we confirm fitment and the part still does not fit, the
                replacement is on us.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-6 border border-line bg-white p-6">
          <h2 className="inline-flex items-center gap-2 text-2xl font-black">
            <RotateCcw className="text-navy" size={24} /> What is not covered
          </h2>
          <ul className="mt-4 grid gap-2 text-steel">
            <li>- Parts damaged by incorrect installation, modification or use beyond rated load</li>
            <li>- Normal wear items after use (gaskets, filters, ropes) unless defective on arrival</li>
            <li>- Orders where the buyer skipped a recommended fitment check and the model does not match</li>
          </ul>
        </section>

        <section className="mt-6 border border-line bg-panel p-6">
          <h2 className="text-xl font-black">How to make a claim</h2>
          <ol className="mt-3 grid gap-2 text-steel">
            <li>1. Message us on WhatsApp with your order number.</li>
            <li>2. Attach photos or a short video showing the issue.</li>
            <li>3. We reply within 1 business day with replacement or refund options.</li>
          </ol>
          <a
            href={claimLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
          >
            <MessageCircle size={18} /> Start a claim on WhatsApp
          </a>
        </section>

        <p className="mt-6 text-sm text-steel">
          See also: <Link href="/shipping" className="font-black text-navy underline">Shipping Policy</Link> ·{" "}
          <Link href="/about" className="font-black text-navy underline">About Us</Link>
        </p>
      </div>
    </main>
  );
}
