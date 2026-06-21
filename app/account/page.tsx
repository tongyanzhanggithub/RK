import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LogOut, MapPin, Package, ShoppingBag } from "lucide-react";
import { logoutCustomer } from "@/app/account/actions";
import { requireCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your orders and details."
};

export default async function AccountPage() {
  const t = getServerDict().acct;
  const PAYMENT_LABEL: Record<string, { label: string; cls: string }> = {
    PAID: { label: t.pay_paid, cls: "bg-green-100 text-green-800" },
    PENDING: { label: t.pay_pending, cls: "bg-amber-100 text-amber-800" },
    FAILED: { label: t.pay_failed, cls: "bg-red-100 text-red-800" },
    REFUNDED: { label: t.pay_refunded, cls: "bg-blue-100 text-blue-800" }
  };
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
            <p className="font-black uppercase text-brand">{t.badge}</p>
            <h1 className="text-4xl font-black">{t.welcome.replace("{name}", customer.name.split(" ")[0])}</h1>
            <p className="mt-2 text-steel">{customer.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/account/addresses" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
              <MapPin size={17} /> {t.addresses}
            </Link>
            <form action={logoutCustomer}>
              <button type="submit" className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel">
                <LogOut size={17} /> {t.sign_out}
              </button>
            </form>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={ShoppingBag} label={t.stat_orders} value={String(orders.length)} />
          <Stat icon={Package} label={t.stat_paid} value={String(paidCount)} />
          <div className="border border-line bg-white p-5">
            <p className="text-sm font-bold text-steel">{t.need_parts}</p>
            <Link href="/products" className="mt-3 inline-flex h-10 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
              {t.browse}
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">{t.history}</h2>
          {orders.length === 0 ? (
            <div className="mt-4 border border-line bg-white p-8 text-center">
              <Package className="mx-auto text-steel" size={40} />
              <p className="mt-3 font-black">{t.no_orders}</p>
              <p className="mt-1 text-steel">{t.no_orders_body}</p>
              <Link href="/products" className="mt-5 inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
                {t.start_shopping}
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {orders.map((order) => {
                const badge = PAYMENT_LABEL[order.paymentStatus] || PAYMENT_LABEL.PENDING;
                return (
                  <article key={order.id} className="border border-line bg-white p-5 transition-colors hover:border-navy">
                    <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-lg text-navy underline-offset-2 hover:underline">{order.orderNumber}</strong>
                        <p className="text-sm text-steel">{order.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-black ${badge.cls}`}>{badge.label}</span>
                        <strong>{formatMoney(order.totalCents, order.currency)}</strong>
                      </div>
                    </Link>
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
                        {t.tracking} {order.shippingCarrier ? `${order.shippingCarrier} · ` : ""}{order.trackingNumber}
                      </p>
                    )}
                    <Link href={`/account/orders/${order.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-black text-navy hover:underline">
                      {t.view_details} <ArrowRight size={15} />
                    </Link>
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
