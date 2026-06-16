import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "询价单",
  description: "管理买家提交的批量询价单。"
};

const STATUS: Record<string, { label: string; cls: string }> = {
  NEW: { label: "待报价", cls: "bg-safety/25 text-ink" },
  QUOTED: { label: "已报价", cls: "bg-blue-100 text-blue-800" },
  CLOSED: { label: "已关闭", cls: "bg-gray-100 text-gray-700" }
};

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  const newCount = quotes.filter((q) => q.status === "NEW").length;

  return (
    <main>
      <div>
        <p className="font-black uppercase text-safety">询价单</p>
        <h1 className="text-4xl font-black">批量询价单</h1>
        <p className="mt-3 text-steel">买家在前台用「加入询价单」拼好的多产品询价，集中在这里报价跟进。</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="待报价" value={String(newCount)} />
        <Metric label="询价单总数" value={String(quotes.length)} />
        <Metric label="已报价" value={String(quotes.filter((q) => q.status === "QUOTED").length)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">联系人 / 公司</th>
              <th className="p-3">国家</th>
              <th className="p-3">邮箱</th>
              <th className="p-3">产品数</th>
              <th className="p-3">总数量</th>
              <th className="p-3">状态</th>
              <th className="p-3">提交时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const badge = STATUS[quote.status] || STATUS.NEW;
              return (
                <tr key={quote.id} className="border-t border-line align-top">
                  <td className="p-3 font-black">
                    {quote.contactName}
                    {quote.company && <span className="block text-xs font-bold text-steel">{quote.company}</span>}
                  </td>
                  <td className="p-3">{quote.country}</td>
                  <td className="p-3">{quote.email}</td>
                  <td className="p-3 font-black">{quote.itemCount}</td>
                  <td className="p-3 font-black">{quote.totalQuantity}</td>
                  <td className="p-3"><span className={`inline-flex px-2 py-1 text-xs font-black ${badge.cls}`}>{badge.label}</span></td>
                  <td className="p-3 text-xs text-steel">{quote.createdAt.toLocaleString("zh-CN")}</td>
                  <td className="p-3"><Link href={`/admin/quotes/${quote.id}`} className="font-black text-navy">查看</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {quotes.length === 0 && <p className="p-5 text-sm text-steel">还没有询价单。</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-5"><p className="text-sm font-bold text-steel">{label}</p><strong className="mt-3 block text-3xl font-black">{value}</strong></div>;
}
