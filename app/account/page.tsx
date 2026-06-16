import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, MapPin, Package, ShoppingBag } from "lucide-react";
import { logoutCustomer } from "@/app/account/actions";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your orders and details."
};

const PAYMENT_LABEL: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Paid", cls: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Refunded", cls: "bg-blue-100 text-blue-800" }
};

export default async function AccountPage() {
  const customer = await requireCustomer();

  // Match all orders placed with this email (incl. past guest orders).
  const orders = await prisma.order.findMany({
    where: { customerEmail: customer.email },
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });

  const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase text-safety">My account</p>
            <h1 className="text-4xl font-black">Welcome, {customer.name.split(" ")[0]}</h1>
            <p className="mt-2 text-steel">{customer.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/account/addresses" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
              <MapPin size={17} /> Shipping addresses
            </Link>
            <form action={logoutCustomer}>
              <button type="submit" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
                <LogOut size={17} /> Sign out
              </button>
            </form>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={ShoppingBag} label="Orders" value={String(orders.length)} />
          <Stat icon={Package} label="Paid orders" value={String(paidCount)} />
          <div className="border border-line bg-white p-5">
            <p className="text-sm font-bold text-steel">Need parts?</p>
            <Link href="/products" className="mt-3 inline-flex h-10 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
              Browse products
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">Order history</h2>
          {orders.length === 0 ? (
            <div className="mt-4 border border-line bg-white p-8 text-center">
              <Package className="mx-auto text-steel" size={40} />
              <p className="mt-3 font-black">No orders yet</p>
              <p className="mt-1 text-steel">When you place an order with this email, it will appear here.</p>
              <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {orders.map((order) => {
                const badge = PAYMENT_LABEL[order.paymentStatus] || PAYMENT_LABEL.PENDING;
                return (
                  <article key={order.id} className="border border-line bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-lg">{order.orderNumber}</strong>
                        <p className="text-sm text-steel">{order.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-black ${badge.cls}`}>{badge.label}</span>
                        <strong>{formatMoney(order.totalCents, order.currency)}</strong>
                      </div>
                    </div>
                    <ul className="mt-4 grid gap-1 border-t border-line pt-3 text-sm text-steel">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3">
                          <span>{item.productName} × {item.quantity}</span>
                          <span className="font-bold">{formatMoney(item.subtotalCents, order.currency)}</span>
                        </li>
                      ))}
                    </ul>
                    {order.trackingNumber && (
                      <p className="mt-3 text-sm font-bold text-navy">
                        Tracking: {order.shippingCarrier ? `${order.shippingCarrier} · ` : ""}{order.trackingNumber}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <Icon className="text-navy" size={22} />
      <p className="mt-3 text-sm font-bold text-steel">{label}</p>
      <strong className="mt-1 block text-3xl font-black">{value}</strong>
    </div>
  );
}
