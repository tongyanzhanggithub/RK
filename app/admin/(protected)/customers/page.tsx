import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Customers",
  description: "Review customer profiles and purchase history."
};

function readTags(value: string) {
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams?: { q?: string; country?: string; status?: string; role?: string; sort?: string };
}) {
  const q = searchParams?.q?.trim() || "";
  const country = searchParams?.country || "";
  const status = searchParams?.status || "";
  const role = searchParams?.role || "";
  const sort = searchParams?.sort || "recent";

  const [customers, countries] = await Promise.all([
    prisma.customer.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q } },
                  { email: { contains: q } },
                  { phone: { contains: q } }
                ]
              }
            : {},
          country ? { country } : {},
          status ? { status } : {},
          role ? { role } : {}
        ]
      },
      include: {
        orders: {
          select: { totalCents: true, refundedCents: true, paymentStatus: true, createdAt: true }
        }
      }
    }),
    prisma.customer.findMany({
      where: { country: { not: null } },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" }
    })
  ]);

  const rows = customers
    .map((customer) => {
      const paidOrders = customer.orders.filter((order) => order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED");
      const totalSpent = paidOrders.reduce((total, order) => total + order.totalCents - order.refundedCents, 0);
      const lastOrder = customer.orders.reduce<Date | null>(
        (latest, order) => (!latest || order.createdAt > latest ? order.createdAt : latest),
        null
      );
      return { customer, paidOrders: paidOrders.length, totalSpent, lastOrder };
    })
    .sort((a, b) => {
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      if (sort === "orders") return b.customer.orders.length - a.customer.orders.length;
      return (b.lastOrder?.getTime() || 0) - (a.lastOrder?.getTime() || 0);
    });

  const vipCount = customers.filter((customer) => customer.status === "VIP").length;
  const blockedCount = customers.filter((customer) => customer.status === "BLOCKED").length;
  const wholesaleCount = customers.filter((customer) => customer.role === "WHOLESALE").length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Customers</p>
          <h1 className="text-4xl font-black">Customer Management</h1>
          <p className="mt-3 text-steel">Review customer profiles, purchase history, value and internal classification.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/customers/export"
            className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white"
          >
            Export CSV
          </a>
          <Link
            href="/admin/customers/new"
            className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400"
          >
            + New Customer
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Customers" value={String(customers.length)} />
        <Metric label="Wholesale Customers" value={String(wholesaleCount)} />
        <Metric label="VIP Customers" value={String(vipCount)} />
        <Metric label="Blocked Customers" value={String(blockedCount)} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-6">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="Search name, email or phone..." />
        <select name="country" defaultValue={country} className="border border-line px-3 py-2">
          <option value="">All countries</option>
          {countries.map((item) => item.country && <option key={item.country} value={item.country}>{item.country}</option>)}
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="VIP">VIP</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        <select name="role" defaultValue={role} className="border border-line px-3 py-2">
          <option value="">All roles</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="WHOLESALE">WHOLESALE</option>
        </select>
        <select name="sort" defaultValue={sort} className="border border-line px-3 py-2">
          <option value="recent">Recent order</option>
          <option value="spent">Highest spend</option>
          <option value="orders">Most orders</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-6">Apply</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Email</th>
              <th className="p-3">Country</th>
              <th className="p-3">Status</th>
              <th className="p-3">Role</th>
              <th className="p-3">Tags</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Paid Orders</th>
              <th className="p-3">Net Spend</th>
              <th className="p-3">Last Order</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ customer, paidOrders, totalSpent, lastOrder }) => (
              <tr key={customer.id} className="border-t border-line align-top">
                <td className="p-3">
                  <strong className="block">{customer.name}</strong>
                  <span className="text-xs text-steel">{customer.phone || "-"}</span>
                </td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.country || "-"}</td>
                <td className="p-3"><StatusBadge status={customer.status} /></td>
                <td className="p-3"><RoleBadge role={customer.role} /></td>
                <td className="p-3">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {readTags(customer.tags).map((tag) => <span key={tag} className="bg-panel px-2 py-1 text-xs font-bold">{tag}</span>)}
                  </div>
                </td>
                <td className="p-3 font-black">{customer.orders.length}</td>
                <td className="p-3 font-black">{paidOrders}</td>
                <td className="p-3 font-black">{formatMoney(totalSpent, "usd")}</td>
                <td className="p-3 text-xs text-steel">{lastOrder ? lastOrder.toLocaleString("en-US") : "-"}</td>
                <td className="p-3"><Link href={`/admin/customers/${customer.id}`} className="font-black text-navy">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-5 text-sm text-steel">No customers match the current filters.</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-5"><p className="text-sm font-bold text-steel">{label}</p><strong className="mt-3 block text-3xl font-black">{value}</strong></div>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "VIP" ? "bg-safety/25 text-ink" : status === "BLOCKED" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{status}</span>;
}

function RoleBadge({ role }: { role: string }) {
  const color = role === "WHOLESALE" ? "bg-navy text-white" : "bg-panel text-steel";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{role}</span>;
}
