import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "退货管理",
  description: "管理退货 / 售后（RMA）申请。"
};

const STATUS_ZH: Record<string, { label: string; cls: string }> = {
  REQUESTED: { label: "已申请", cls: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "已批准", cls: "bg-blue-100 text-blue-800" },
  RECEIVED: { label: "已收货", cls: "bg-blue-100 text-blue-800" },
  REFUNDED: { label: "已退款", cls: "bg-green-100 text-green-800" },
  REJECTED: { label: "已拒绝", cls: "bg-red-100 text-red-800" },
  CLOSED: { label: "已关闭", cls: "bg-gray-100 text-gray-700" }
};
const RES_ZH: Record<string, string> = { REFUND: "退款", REPLACE: "换货", REPAIR: "维修" };

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({ orderBy: [{ createdAt: "desc" }] });
  const open = returns.filter((r) => ["REQUESTED", "APPROVED", "RECEIVED"].includes(r.status)).length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">退货</p>
          <h1 className="text-4xl font-black">退货 / 售后管理</h1>
          <p className="mt-3 text-steel">处理 RMA：批准、收货、退款 / 换货。在订单详情页推进每一笔。</p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Metric label="退货申请总数" value={String(returns.length)} />
        <Metric label="待处理" value={String(open)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">订单号</th>
              <th className="p-3">处理方式</th>
              <th className="p-3">状态</th>
              <th className="p-3">原因</th>
              <th className="p-3">申请时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => {
              const s = STATUS_ZH[r.status] || { label: r.status, cls: "bg-gray-100 text-gray-700" };
              return (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="p-3 font-black">{r.orderNumber}</td>
                  <td className="p-3">{RES_ZH[r.resolution] || r.resolution}</td>
                  <td className="p-3"><span className={`inline-flex px-2 py-1 text-xs font-black ${s.cls}`}>{s.label}</span></td>
                  <td className="p-3 text-steel">{r.reason || "-"}</td>
                  <td className="p-3 text-xs text-steel">{r.createdAt.toLocaleString("zh-CN")}</td>
                  <td className="p-3"><Link href={`/admin/orders/${r.orderId}`} className="font-black text-navy">打开订单</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {returns.length === 0 && <p className="p-5 text-sm text-steel">暂无退货申请。</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-bold text-steel">{label}</p>
      <strong className="mt-3 block text-3xl font-black">{value}</strong>
    </div>
  );
}
