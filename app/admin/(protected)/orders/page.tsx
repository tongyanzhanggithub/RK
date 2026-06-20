import type { Metadata } from "next";
import Link from "next/link";
import { bulkUpdateOrders } from "@/app/admin/(protected)/orders/actions";
import { zhLabel, ORDER_PAYMENT_STATUS, ORDER_STATUS, FULFILLMENT_STATUS } from "@/lib/admin-status";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "订单管理",
  description: "管理订单、履约状态、物流信息和内部备注。"
};

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    country?: string;
    paymentStatus?: string;
    orderStatus?: string;
    fulfillmentStatus?: string;
    from?: string;
    to?: string;
    bulk?: string;
  };
}) {
  const q = searchParams?.q?.trim() || "";
  const country = searchParams?.country || "";
  const paymentStatus = searchParams?.paymentStatus || "";
  const orderStatus = searchParams?.orderStatus || "";
  const fulfillmentStatus = searchParams?.fulfillmentStatus || "";
  const from = searchParams?.from || "";
  const to = searchParams?.to || "";

  const countries = await prisma.order.findMany({
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" }
  });

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { orderNumber: { contains: q, mode: "insensitive" as const } },
                { customerEmail: { contains: q, mode: "insensitive" as const } }
              ]
            }
          : {},
        country ? { country } : {},
        paymentStatus ? { paymentStatus } : {},
        orderStatus ? { orderStatus } : {},
        fulfillmentStatus ? { fulfillmentStatus } : {},
        from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59`) } : {})
              }
            }
          : {}
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">订单</p>
          <h1 className="text-4xl font-black">订单管理</h1>
          <p className="mt-3 text-steel">查看订单、履约状态、物流详情和内部备注。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/orders/new"
            className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]"
          >
            手动建单
          </Link>
          <a
            href="/admin/orders/export"
            className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white"
          >
            导出CSV
          </a>
        </div>
      </div>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-7">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="搜索订单号或邮箱..." />
        <select name="country" defaultValue={country} className="border border-line px-3 py-2">
          <option value="">全部国家</option>
          {countries.map((item) => (
            <option key={item.country} value={item.country}>{item.country}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="border border-line px-3 py-2">
          <option value="">支付状态（全部）</option>
          <option value="PENDING">{zhLabel(ORDER_PAYMENT_STATUS, "PENDING")}</option>
          <option value="PAID">{zhLabel(ORDER_PAYMENT_STATUS, "PAID")}</option>
          <option value="FAILED">{zhLabel(ORDER_PAYMENT_STATUS, "FAILED")}</option>
          <option value="REFUNDED">{zhLabel(ORDER_PAYMENT_STATUS, "REFUNDED")}</option>
        </select>
        <select name="orderStatus" defaultValue={orderStatus} className="border border-line px-3 py-2">
          <option value="">订单状态（全部）</option>
          <option value="PROCESSING">{zhLabel(ORDER_STATUS, "PROCESSING")}</option>
          <option value="SHIPPED">{zhLabel(ORDER_STATUS, "SHIPPED")}</option>
          <option value="COMPLETED">{zhLabel(ORDER_STATUS, "COMPLETED")}</option>
          <option value="CANCELLED">{zhLabel(ORDER_STATUS, "CANCELLED")}</option>
        </select>
        <select name="fulfillmentStatus" defaultValue={fulfillmentStatus} className="border border-line px-3 py-2">
          <option value="">履约状态（全部）</option>
          <option value="UNFULFILLED">{zhLabel(FULFILLMENT_STATUS, "UNFULFILLED")}</option>
          <option value="PARTIALLY_FULFILLED">{zhLabel(FULFILLMENT_STATUS, "PARTIALLY_FULFILLED")}</option>
          <option value="SHIPPED">{zhLabel(FULFILLMENT_STATUS, "SHIPPED")}</option>
          <option value="FULFILLED">{zhLabel(FULFILLMENT_STATUS, "FULFILLED")}</option>
          <option value="CANCELLED">{zhLabel(FULFILLMENT_STATUS, "CANCELLED")}</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white">筛选</button>
        <input name="from" type="date" defaultValue={from} className="border border-line px-3 py-2" />
        <input name="to" type="date" defaultValue={to} className="border border-line px-3 py-2" />
      </form>

      {searchParams?.bulk && (
        <p className="mt-6 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已批量更新 {searchParams.bulk} 个订单。</p>
      )}
      <form action={bulkUpdateOrders} className="mt-6">
        <div className="flex flex-wrap items-center gap-2 border border-line bg-panel p-3">
          <span className="text-sm font-bold text-steel">批量操作选中订单 →</span>
          <select name="bulkStatus" className="border border-line px-3 py-2 text-sm font-bold">
            <option value="PROCESSING">标记 {zhLabel(ORDER_STATUS, "PROCESSING")}</option>
            <option value="SHIPPED">标记 {zhLabel(ORDER_STATUS, "SHIPPED")}（发邮件）</option>
            <option value="COMPLETED">标记 {zhLabel(ORDER_STATUS, "COMPLETED")}</option>
            <option value="CANCELLED">标记 {zhLabel(ORDER_STATUS, "CANCELLED")}（恢复库存）</option>
          </select>
          <button className="bg-navy px-4 py-2 text-sm font-black text-white">应用到选中</button>
        </div>
        <section className="overflow-x-auto border border-t-0 border-line bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3"><span className="sr-only">选择</span></th>
              <th className="p-3">订单号</th>
              <th className="p-3">客户</th>
              <th className="p-3">邮箱</th>
              <th className="p-3">国家</th>
              <th className="p-3">金额</th>
              <th className="p-3">支付</th>
              <th className="p-3">订单状态</th>
              <th className="p-3">履约</th>
              <th className="p-3">创建时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="p-3"><input type="checkbox" name="ids" value={order.id} className="h-4 w-4" /></td>
                <td className="p-3 font-black">{order.orderNumber}</td>
                <td className="p-3">{order.customerName}</td>
                <td className="p-3">{order.customerEmail}</td>
                <td className="p-3">{order.country}</td>
                <td className="p-3 font-black">{formatMoney(order.totalCents, order.currency)}</td>
                <td className="p-3"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                <td className="p-3"><StatusBadge status={order.orderStatus} type="order" /></td>
                <td className="p-3"><StatusBadge status={order.fulfillmentStatus} type="fulfillment" /></td>
                <td className="p-3 text-xs text-steel">{order.createdAt.toLocaleString("zh-CN")}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-navy">查看</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-5 text-sm text-steel">没有符合当前筛选条件的订单。</p>}
        </section>
      </form>
    </main>
  );
}

function StatusBadge({ status, type }: { status: string; type: "payment" | "order" | "fulfillment" }) {
  const color =
    status === "PAID" || status === "COMPLETED" || status === "FULFILLED"
      ? "bg-green-100 text-green-800"
      : status === "PENDING" || status === "PROCESSING" || status === "UNFULFILLED" || status === "PARTIALLY_FULFILLED"
        ? "bg-yellow-100 text-yellow-800"
        : status === "SHIPPED"
          ? "bg-blue-100 text-blue-800"
          : status === "FAILED" || status === "CANCELLED"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-700";
  const map = type === "payment" ? ORDER_PAYMENT_STATUS : type === "order" ? ORDER_STATUS : FULFILLMENT_STATUS;
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{zhLabel(map, status)}</span>;
}
