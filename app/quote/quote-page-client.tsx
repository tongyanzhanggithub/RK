"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, FileText, Minus, MessageCircle, Plus, Send, Trash2 } from "lucide-react";
import { useQuote } from "@/components/quote-provider";
import { submitQuoteRequest, type QuoteRequestState } from "@/app/quote/actions";
import { whatsappLink } from "@/lib/contact";
import { TurnstileWidget } from "@/components/turnstile-widget";

type ProductLite = {
  slug: string;
  name: string;
  sku: string;
  category: string;
  image: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      <Send size={18} /> {pending ? "Sending..." : "Send Quote Request"}
    </button>
  );
}

export function QuotePageClient({ products }: { products: ProductLite[] }) {
  const { items, updateItem, removeItem, clearQuote } = useQuote();
  const productMap = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
  const [state, formAction] = useFormState<QuoteRequestState, FormData>(submitQuoteRequest, {});

  const lines = items
    .map((item) => {
      const product = productMap.get(item.slug);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter(Boolean) as { product: ProductLite; quantity: number }[];

  // Clear the quote list once a request is accepted.
  useEffect(() => {
    if (state?.ok) clearQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.ok]);

  const itemsJson = JSON.stringify(lines.map((line) => ({ slug: line.product.slug, quantity: line.quantity })));
  const whatsappMessage = whatsappLink(
    [
      "Hello, I'd like a wholesale quote for these items:",
      ...lines.map((line) => `- ${line.product.name} (${line.product.sku}) x${line.quantity}`),
      "",
      "Destination country: ",
      "Company: "
    ].join("\n")
  );

  if (state?.ok) {
    return (
      <main className="px-4 py-14">
        <section className="mx-auto max-w-2xl border border-line bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-700" size={56} />
          <h1 className="mt-5 text-3xl font-black">Quote request received</h1>
          <p className="mt-3 text-steel">
            We&apos;ll review your list and reply with wholesale pricing, MOQ and freight — usually the same day.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
              Continue Browsing
            </Link>
            <Link href="/" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
              Back Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">Wholesale</p>
        <h1 className="text-4xl font-black">Request a Quote</h1>
        <p className="mt-3 max-w-3xl text-steel">
          Build one list of everything you need with quantities, and send it for wholesale pricing in a single request —
          no need to ask product by product.
        </p>

        {lines.length === 0 ? (
          <section className="mt-8 border border-line bg-white p-8">
            <h2 className="text-2xl font-black">Your quote list is empty</h2>
            <p className="mt-3 text-steel">Browse the catalog and click &quot;Add to quote&quot; on the parts you need.</p>
            <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            <section className="border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line p-5">
                <h2 className="inline-flex items-center gap-2 text-xl font-black">
                  <FileText size={20} /> {lines.length} {lines.length === 1 ? "product" : "products"}
                </h2>
                <button type="button" onClick={clearQuote} className="text-sm font-black text-steel hover:text-ink">
                  Clear all
                </button>
              </div>
              <div>
                {lines.map(({ product, quantity }) => (
                  <article key={product.slug} className="grid gap-4 border-b border-line p-5 md:grid-cols-[64px_1fr_auto] md:items-center">
                    <Link href={`/products/${product.slug}`} className="relative grid aspect-square overflow-hidden bg-panel industrial-grid">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="64px" className="object-contain" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-lg font-black text-navy">
                          {product.name.split(" ")[0]}
                        </span>
                      )}
                    </Link>
                    <div>
                      <p className="text-xs font-black uppercase text-safety">{product.category}</p>
                      <Link href={`/products/${product.slug}`} className="font-black hover:text-navy">{product.name}</Link>
                      {product.sku && <p className="text-xs text-steel">SKU: {product.sku}</p>}
                    </div>
                    <div className="flex items-center gap-3 md:justify-self-end">
                      <div className="inline-grid grid-cols-[36px_64px_36px] border border-line">
                        <button type="button" className="grid h-9 place-items-center hover:bg-panel" onClick={() => updateItem(product.slug, quantity - 1)} aria-label="Decrease">
                          <Minus size={15} />
                        </button>
                        <input
                          value={quantity}
                          onChange={(event) => updateItem(product.slug, Number(event.target.value))}
                          inputMode="numeric"
                          aria-label={`${product.name} quantity`}
                          className="h-9 border-x border-line text-center font-black outline-none"
                        />
                        <button type="button" className="grid h-9 place-items-center hover:bg-panel" onClick={() => updateItem(product.slug, quantity + 1)} aria-label="Increase">
                          <Plus size={15} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(product.slug)} className="text-red-700 hover:text-red-900" aria-label="Remove">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="h-fit border border-line bg-white p-6">
              <h2 className="text-2xl font-black">Send your request</h2>
              <p className="mt-2 text-sm leading-6 text-steel">
                We reply with wholesale pricing, MOQ and freight. Prefer chat? Use WhatsApp below.
              </p>

              <a
                href={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel"
              >
                <MessageCircle size={18} /> Request on WhatsApp
              </a>

              <div className="my-5 flex items-center gap-3 text-xs font-black uppercase text-steel">
                <span className="h-px flex-1 bg-line" /> or by form <span className="h-px flex-1 bg-line" />
              </div>

              <form action={formAction} className="grid gap-3">
                {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
                <input type="hidden" name="items" value={itemsJson} />
                <Field label="Contact name" name="contactName" required />
                <Field label="Company (optional)" name="company" />
                <Field label="Country" name="country" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="WhatsApp (optional)" name="whatsapp" />
                <label className="grid gap-1 text-sm font-bold">
                  Message (optional)
                  <textarea name="message" rows={3} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" placeholder="Target market, packaging, timeline..." />
                </label>
                <TurnstileWidget />
                <SubmitButton />
              </form>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
    </label>
  );
}
