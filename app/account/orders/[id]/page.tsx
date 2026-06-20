import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { ReturnRequestForm } from "@/app/account/return-request-form";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your order details."
};

const PAYMENT_LABEL: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Refunded", cls: "bg-blue-100 text-blue-800" }
};
const ORDER_LABEL: Record<string, string> = {
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};
const FULFILLMENT_LABEL: Record<string, string> = {
  UNFULFILLED: "Not shipped",
  PARTIALLY_FULFILLED: "Partially shipped",
  FULFILLED: "Shipped"
};

export default async function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const customer = await requireCustomer();
  const order = await prisma.order.findFirst({
    where: { id: params.id, customerEmail: customer.email },
    include: { items: true, returnRequests: { orderBy: { createdAt: "desc" } } }
  });
  if (!order) notFound();

  const openReturn = order.returnRequests.find((r) => ["REQUESTED", "APPROVED", "RECEIVED"].includes(r.status));
  const pay = PAYMENT_LABEL[order.paymentStatus] || PAYMENT_LABEL.PENDING;
  const shipParts = [order.shippingAddress, order.city, order.postalCode, order.country].filter(Boolean);

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/account" className="inline-flex items-center gap-2 font-bold text-navy hover:underline">
          <ArrowLeft size={16} /> Back to account
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-black uppercase text-brand">Order</p>
            <h1 className="text-3xl font-black">{order.orderNumber}</h1>
            <p className="mt-1 text-steel">
              {order.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-black ${pay.cls}`}>{pay.label}</span>
        </div>

        {/* Status row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <InfoBox label="Payment" value={pay.label} />
          <InfoBox label="Order status" value={ORDER_LABEL[order.orderStatus] || order.orderStatus} />
          <InfoBox label="Fulfillment" value={FULFILLMENT_LABEL[order.fulfillmentStatus] || order.fulfillmentStatus} />
        </div>

        {/* Items */}
        <section className="mt-6 border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">Items</h2>
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-5 text-sm">
                <span>
                  <Link href={`/products/${item.productSlug}`} className="font-bold text-navy hover:underline">
                    {item.productName}
                  </Link>
                  <span className="text-steel"> × {item.quantity}</span>
                  <span className="block text-xs text-steel">SKU: {item.sku}</span>
                </span>
                <span className="font-bold">{formatMoney(item.subtotalCents, order.currency)}</span>
              </li>
            ))}
          </ul>
          {/* Totals */}
          <div className="grid gap-2 border-t border-line p-5 text-sm">
            <Row label="Subtotal" value={formatMoney(order.subtotalCents, order.currency)} />
            {order.discountCents > 0 && <Row label="Discount" value={`- ${formatMoney(order.discountCents, order.currency)}`} />}
            <Row label="Shipping" value={order.shippingCents > 0 ? formatMoney(order.shippingCents, order.currency) : "Free"} />
            {order.taxCents > 0 && <Row label="Tax" value={formatMoney(order.taxCents, order.currency)} />}
            <div className="mt-1 flex items-center justify-between border-t border-line pt-3 text-base font-black">
              <span>Total</span>
              <span>{formatMoney(order.totalCents, order.currency)}</span>
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border border-line bg-white p-5">
            <h2 className="text-lg font-black">Shipping address</h2>
            <p className="mt-2 text-sm leading-6 text-steel">
              <span className="font-bold text-ink">{order.customerName}</span>
              <br />
              {shipParts.length > 0 ? shipParts.join(", ") : "—"}
              {order.customerPhone ? <><br />{order.customerPhone}</> : null}
            </p>
          </div>
          <div className="border border-line bg-white p-5">
            <h2 className="inline-flex items-center gap-2 text-lg font-black"><Truck size={18} /> Tracking</h2>
            {order.trackingNumber ? (
              <p className="mt-2 text-sm leading-6 text-steel">
                {order.shippingCarrier ? <>{order.shippingCarrier}<br /></> : null}
                <span className="font-bold text-ink">{order.trackingNumber}</span>
                {order.trackingUrl ? (
                  <>
                    <br />
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-black text-navy hover:underline">
                      Track shipment
                    </a>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mt-2 text-sm text-steel">Not shipped yet. We’ll add tracking once it ships.</p>
            )}
          </div>
        </section>

        {order.paymentStatus === "PAID" && (
          <section className="mt-6 border border-line bg-white p-5">
            <h2 className="text-lg font-black">Returns</h2>
            <p className="mt-1 mb-3 text-sm text-steel">
              Wrong fit or a problem? Request a return and we&apos;ll help — Guaranteed Fit parts ship back free within 30 days.
            </p>
            <ReturnRequestForm orderId={order.id} openStatus={openReturn?.status} />
          </section>
        )}
      </div>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-4">
      <p className="text-xs font-bold uppercase text-steel">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-steel">
      <span>{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}
