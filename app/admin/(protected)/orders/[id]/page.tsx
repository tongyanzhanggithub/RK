import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrder } from "@/app/admin/(protected)/orders/actions";
import { OrderManagementForm } from "@/app/admin/(protected)/orders/order-management-form";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Detail",
  description: "Review and update order fulfillment details."
};

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });

  if (!order) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Orders</p>
          <h1 className="text-4xl font-black">{order.orderNumber}</h1>
          <p className="mt-3 text-steel">Created {order.createdAt.toLocaleString("en-US")}</p>
        </div>
        <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Orders
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="Basic Information">
            <Info label="Order Number" value={order.orderNumber} />
            <Info label="Customer Name" value={order.customerName} />
            <Info label="Email" value={order.customerEmail} />
            <Info label="Phone" value={order.customerPhone || "-"} />
            <Info label="WhatsApp" value={order.customerWhatsapp || "-"} />
            <Info label="Country" value={order.country} />
            {order.customerId && (
              <div className="border-b border-line py-3 text-sm">
                <Link href={`/admin/customers/${order.customerId}`} className="font-black text-navy">Open Customer Profile</Link>
              </div>
            )}
          </InfoPanel>

          <InfoPanel title="Payment Information">
            <Info label="Payment Method" value={order.paymentMethod} />
            <Info label="Payment Status" value={order.paymentStatus} />
            <Info label="Stripe Checkout Session" value={order.stripeCheckoutSessionId || "-"} />
            <Info label="Stripe Payment Intent" value={order.stripePaymentIntentId || "-"} />
            <Info label="Paid Amount" value={formatMoney(order.totalCents, order.currency)} />
            <Info label="Refunded Amount" value={formatMoney(order.refundedCents, order.currency)} />
            <Info label="Paid At" value={order.paidAt ? order.paidAt.toLocaleString("en-US") : "-"} />
            <Info label="Payment Failure" value={order.paymentFailureMessage || "-"} />
            <Info label="Last Stripe Event" value={order.stripeLastEventType || "-"} />
            <Info label="Last Stripe Event ID" value={order.stripeLastEventId || "-"} />
            <Info label="Last Stripe Sync" value={order.stripeLastSyncedAt ? order.stripeLastSyncedAt.toLocaleString("en-US") : "-"} />
          </InfoPanel>

          <InfoPanel title="Shipping Address">
            <Info label="Name" value={order.customerName} />
            <Info label="Phone" value={order.customerPhone || "-"} />
            <Info label="Country" value={order.country} />
            <Info label="City" value={order.city || "-"} />
            <Info label="Address" value={order.shippingAddress || "-"} />
            <Info label="Postal Code" value={order.postalCode || "-"} />
          </InfoPanel>

          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-black">Order Items</h2>
            </div>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="p-3">
                      <Link href={`/products/${item.productSlug}`} className="font-black text-navy">{item.productName}</Link>
                    </td>
                    <td className="p-3">{item.sku}</td>
                    <td className="p-3">{formatMoney(item.unitPriceCents, order.currency)}</td>
                    <td className="p-3 font-black">{item.quantity}</td>
                    <td className="p-3 font-black">{formatMoney(item.subtotalCents, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <InfoPanel title="Amount Detail">
            <Info label="Subtotal" value={formatMoney(order.subtotalCents, order.currency)} />
            <Info label="Shipping" value={formatMoney(order.shippingCents, order.currency)} />
            <Info label="Tax Estimate" value={formatMoney(order.taxCents, order.currency)} />
            <Info label="Coupon" value={order.couponCode ? `${order.couponCode} / ${order.couponType || "-"}` : "-"} />
            <Info label="Discount" value={`-${formatMoney(order.discountCents, order.currency)}`} />
            <Info label="Total" value={formatMoney(order.totalCents, order.currency)} strong />
          </InfoPanel>
        </div>

        <aside className="grid h-fit gap-6">
          <OrderManagementForm order={order} action={updateOrder.bind(null, order.id)} saved={searchParams?.saved === "1"} />
          <InfoPanel title="Logistics Snapshot">
            <Info label="Order Status" value={order.orderStatus} />
            <Info label="Fulfillment" value={order.fulfillmentStatus} />
            <Info label="Carrier" value={order.shippingCarrier || "-"} />
            <Info label="Tracking Number" value={order.trackingNumber || "-"} />
            <Info label="Tracking URL" value={order.trackingUrl || "-"} />
            <Info label="Shipped At" value={order.shippedAt ? order.shippedAt.toLocaleString("en-US") : "-"} />
          </InfoPanel>
        </aside>
      </section>
    </main>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <dl className="grid gap-0 p-5">{children}</dl>
    </section>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[180px_1fr]">
      <dt className="font-bold text-steel">{label}</dt>
      <dd className={`${strong ? "text-lg font-black" : "font-bold"} break-words`}>{value}</dd>
    </div>
  );
}
