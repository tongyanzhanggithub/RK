import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Orders",
  description: "Manage orders, fulfillment status, logistics and internal notes."
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
                { orderNumber: { contains: q } },
                { customerEmail: { contains: q } }
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
          <p className="font-black uppercase text-safety">Orders</p>
          <h1 className="text-4xl font-black">Order Management</h1>
          <p className="mt-3 text-steel">Review orders, fulfillment status, logistics details and internal notes.</p>
        </div>
        <a
          href="/admin/orders/export"
          className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-7">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="Search order number or email..." />
        <select name="country" defaultValue={country} className="border border-line px-3 py-2">
          <option value="">All countries</option>
          {countries.map((item) => (
            <option key={item.country} value={item.country}>{item.country}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="border border-line px-3 py-2">
          <option value="">Payment any</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select name="orderStatus" defaultValue={orderStatus} className="border border-line px-3 py-2">
          <option value="">Order any</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select name="fulfillmentStatus" defaultValue={fulfillmentStatus} className="border border-line px-3 py-2">
          <option value="">Fulfillment any</option>
          <option value="UNFULFILLED">UNFULFILLED</option>
          <option value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="FULFILLED">FULFILLED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white">Apply</button>
        <input name="from" type="date" defaultValue={from} className="border border-line px-3 py-2" />
        <input name="to" type="date" defaultValue={to} className="border border-line px-3 py-2" />
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Order No.</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Email</th>
              <th className="p-3">Country</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Order</th>
              <th className="p-3">Fulfillment</th>
              <th className="p-3">Created</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="p-3 font-black">{order.orderNumber}</td>
                <td className="p-3">{order.customerName}</td>
                <td className="p-3">{order.customerEmail}</td>
                <td className="p-3">{order.country}</td>
                <td className="p-3 font-black">{formatMoney(order.totalCents, order.currency)}</td>
                <td className="p-3"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                <td className="p-3"><StatusBadge status={order.orderStatus} type="order" /></td>
                <td className="p-3"><StatusBadge status={order.fulfillmentStatus} type="fulfillment" /></td>
                <td className="p-3 text-xs text-steel">{order.createdAt.toLocaleString("en-US")}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-navy">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-5 text-sm text-steel">No orders match the current filters.</p>}
      </section>
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
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{status}</span>;
}
