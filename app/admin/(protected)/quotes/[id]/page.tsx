import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuoteRequest, updateQuoteRequest } from "@/app/admin/(protected)/quotes/actions";
import { QuoteReviewForm } from "@/app/admin/(protected)/quotes/quote-review-form";
import { whatsappLink } from "@/lib/contact";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "询价单详情" };

type LineItem = { slug: string; name: string; sku: string; quantity: number };

function readItems(value: string): LineItem[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function AdminQuoteDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const quote = await prisma.quoteRequest.findUnique({ where: { id: params.id } });
  if (!quote) notFound();

  const items = readItems(quote.items);
  const replyOnWhatsApp = quote.whatsapp
    ? whatsappLink(`Hello ${quote.contactName}, thank you for your quote request. Here is our wholesale pricing:`)
    : null;

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">询价单</p>
          <h1 className="text-4xl font-black">{quote.company || quote.contactName}</h1>
          <p className="mt-3 text-steel">{quote.contactName} · {quote.country} · {quote.createdAt.toLocaleString("zh-CN")}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/quotes" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">返回列表</Link>
          <form action={deleteQuoteRequest.bind(null, quote.id)}>
            <button type="submit" className="inline-flex h-11 items-center justify-center border border-red-300 px-4 font-black text-red-700 hover:bg-red-50">删除</button>
          </form>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5"><h2 className="text-xl font-black">询价产品（{quote.itemCount} 项 · 共 {quote.totalQuantity} 件）</h2></div>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr><th className="p-3">产品</th><th className="p-3">SKU</th><th className="p-3">数量</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.slug} className="border-t border-line">
                    <td className="p-3 font-black"><Link href={`/products/${item.slug}`} className="text-navy hover:underline">{item.name}</Link></td>
                    <td className="p-3">{item.sku || "-"}</td>
                    <td className="p-3 font-black">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {quote.message && (
            <section className="border border-line bg-white p-5">
              <h2 className="text-xl font-black">买家留言</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-steel">{quote.message}</p>
            </section>
          )}
        </div>

        <aside className="grid h-fit gap-6">
          <section className="border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase text-steel">联系方式</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <Row label="邮箱" value={quote.email} />
              <Row label="WhatsApp" value={quote.whatsapp || "-"} />
              <Row label="国家" value={quote.country} />
            </dl>
            <div className="mt-4 grid gap-2">
              <a href={`mailto:${quote.email}`} className="inline-flex h-10 items-center justify-center border border-navy px-3 text-sm font-black text-navy hover:bg-panel">邮件回复</a>
              {replyOnWhatsApp && (
                <a href={replyOnWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center bg-safety px-3 text-sm font-black text-ink hover:bg-amber-400">WhatsApp 回复</a>
              )}
            </div>
          </section>

          <QuoteReviewForm quote={quote} action={updateQuoteRequest.bind(null, quote.id)} saved={searchParams?.saved === "1"} />
        </aside>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-line pb-2"><dt className="font-bold text-steel">{label}</dt><dd className="break-all font-bold">{value}</dd></div>;
}
