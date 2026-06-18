import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { COMPANY_NAME } from "@/lib/contact";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Packing Slip" };

export default async function PackingSlipPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();
  const totalQty = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <main className="mx-auto max-w-3xl bg-white p-8 text-ink">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">PACKING SLIP 装箱单</h1>
          <p className="mt-1 text-sm text-steel">Order {order.orderNumber} · {order.createdAt.toLocaleDateString("en-GB")}</p>
        </div>
        <PrintButton />
      </div>

      <div className="border-y border-line py-4 text-sm">
        <p className="font-black uppercase text-steel">Ship to</p>
        <p className="mt-1 font-bold">{order.customerName}</p>
        <p className="text-steel">{[order.shippingAddress, order.city, order.postalCode, order.country].filter(Boolean).join(", ")}</p>
        {order.customerPhone && <p className="text-steel">{order.customerPhone}</p>}
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead className="border-b border-ink">
          <tr>
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">✓</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-line">
              <td className="py-2">{item.productName}</td>
              <td className="py-2 text-steel">{item.sku}</td>
              <td className="py-2 text-right font-black">{item.quantity}</td>
              <td className="py-2 text-right text-steel">▢</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-sm font-black">Total items: {totalQty}</p>
      <p className="mt-8 text-xs text-steel">Prices intentionally omitted. Packed by {COMPANY_NAME}. No commercial value shown — see commercial invoice for customs.</p>
    </main>
  );
}
