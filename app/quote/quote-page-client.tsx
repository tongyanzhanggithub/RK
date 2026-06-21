"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, FileText, Minus, MessageCircle, Plus, Send, Trash2 } from "lucide-react";
import { useQuote } from "@/components/quote-provider";
import { useLanguage } from "@/components/language-provider";
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
  const t = useLanguage().dict.quotepage;
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      <Send size={18} /> {pending ? t.sending : t.send_btn}
    </button>
  );
}

export function QuotePageClient({ products }: { products: ProductLite[] }) {
  const { items, updateItem, removeItem, clearQuote } = useQuote();
  const { dict } = useLanguage();
  const t = dict.quotepage;
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
      t.wa_msg_intro,
      ...lines.map((line) => `- ${line.product.name} (${line.product.sku}) x${line.quantity}`),
      "",
      t.wa_msg_dest,
      t.wa_msg_company
    ].join("\n")
  );

  if (state?.ok) {
    return (
      <main className="px-4 py-14">
        <section className="mx-auto max-w-2xl border border-line bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-700" size={56} />
          <h1 className="mt-5 text-3xl font-black">{t.received_title}</h1>
          <p className="mt-3 text-steel">{t.received_body}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
              {t.continue}
            </Link>
            <Link href="/" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-panel">
              {dict.common.back_home}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-brand">{t.badge}</p>
        <h1 className="text-4xl font-black">{t.title}</h1>
        <p className="mt-3 max-w-3xl text-steel">{t.subtitle}</p>

        {lines.length === 0 ? (
          <section className="mt-8 border border-line bg-white p-8">
            <h2 className="text-2xl font-black">{t.empty_title}</h2>
            <p className="mt-3 text-steel">{t.empty_body}</p>
            <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
              {t.browse}
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            <section className="border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line p-5">
                <h2 className="inline-flex items-center gap-2 text-xl font-black">
                  <FileText size={20} /> {lines.length} {lines.length === 1 ? t.product_one : t.product_other}
                </h2>
                <button type="button" onClick={clearQuote} className="text-sm font-black text-steel hover:text-ink">
                  {t.clear_all}
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
                      <p className="text-xs font-black uppercase text-brand">{product.category}</p>
                      <Link href={`/products/${product.slug}`} className="font-black hover:text-navy">{product.name}</Link>
                      {product.sku && <p className="text-xs text-steel">SKU:&nbsp;{product.sku}</p>}
                    </div>
                    <div className="flex items-center gap-3 md:justify-self-end">
                      <div className="inline-grid grid-cols-[36px_64px_36px] border border-line">
                        <button type="button" className="grid h-9 place-items-center hover:bg-panel" onClick={() => updateItem(product.slug, quantity - 1)} aria-label={t.aria_decrease}>
                          <Minus size={15} />
                        </button>
                        <input
                          value={quantity}
                          onChange={(event) => updateItem(product.slug, Number(event.target.value))}
                          inputMode="numeric"
                          aria-label={t.aria_qty.replace("{name}", product.name)}
                          className="h-9 border-x border-line text-center font-black outline-none"
                        />
                        <button type="button" className="grid h-9 place-items-center hover:bg-panel" onClick={() => updateItem(product.slug, quantity + 1)} aria-label={t.aria_increase}>
                          <Plus size={15} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(product.slug)} className="text-red-700 hover:text-red-900" aria-label={t.aria_remove}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="h-fit border border-line bg-white p-6">
              <h2 className="text-2xl font-black">{t.send_title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{t.send_sub}</p>

              <a
                href={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel"
              >
                <MessageCircle size={18} /> {t.wa_btn}
              </a>

              <div className="my-5 flex items-center gap-3 text-xs font-black uppercase text-steel">
                <span className="h-px flex-1 bg-line" /> {t.or_form} <span className="h-px flex-1 bg-line" />
              </div>

              <form action={formAction} className="grid gap-3">
                {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
                <input type="hidden" name="items" value={itemsJson} />
                <Field label={t.f_name} name="contactName" required />
                <Field label={t.f_company} name="company" />
                <Field label={t.f_country} name="country" required />
                <Field label={t.f_email} name="email" type="email" required />
                <Field label={t.f_whatsapp} name="whatsapp" />
                <label className="grid gap-1 text-sm font-bold">
                  {t.f_message}
                  <textarea name="message" rows={3} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" placeholder={t.f_message_ph} />
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
