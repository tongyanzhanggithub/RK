import type { Metadata } from "next";
import Link from "next/link";
import { couponDisplayValue } from "@/lib/coupons";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Coupons",
  description: "Manage coupon codes and checkout discounts."
};

export default async function AdminCouponsPage({
  searchParams
}: {
  searchParams?: { q?: string; type?: string; status?: string };
}) {
  const q = searchParams?.q?.trim().toUpperCase() || "";
  const type = searchParams?.type || "";
  const status = searchParams?.status || "";
  const now = new Date();

  const where = {
    AND: [
      q ? { code: { contains: q } } : {},
      type ? { type } : {},
      status === "ACTIVE"
        ? { isActive: true }
        : status === "INACTIVE"
          ? { isActive: false }
          : status === "EXPIRED"
            ? { endsAt: { lt: now } }
            : {}
    ]
  };

  const [coupons, activeCount, inactiveCount, expiredCount] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    }),
    prisma.coupon.count({ where: { isActive: true } }),
    prisma.coupon.count({ where: { isActive: false } }),
    prisma.coupon.count({ where: { endsAt: { lt: now } } })
  ]);

  const totalUsage = coupons.reduce((total, coupon) => total + coupon.usageCount, 0);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Coupons</p>
          <h1 className="text-4xl font-black">Coupon Management</h1>
          <p className="mt-3 text-steel">Create and edit checkout coupon codes for retail and wholesale buyers.</p>
        </div>
        <Link href="/admin/coupons/new" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          New Coupon
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Coupons" value={String(activeCount)} />
        <Metric label="Inactive Coupons" value={String(inactiveCount)} />
        <Metric label="Expired Coupons" value={String(expiredCount)} />
        <Metric label="Visible Usage" value={String(totalUsage)} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-5">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="Search coupon code..." />
        <select name="type" defaultValue={type} className="border border-line px-3 py-2">
          <option value="">All types</option>
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
          <option value="FREE_SHIPPING">FREE_SHIPPING</option>
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white">Apply</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Min Subtotal</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Date Range</th>
              <th className="p-3">Wholesale</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{coupon.code}</td>
                <td className="p-3">{coupon.type}</td>
                <td className="p-3 font-black">{couponDisplayValue(coupon)}</td>
                <td className="p-3"><StatusBadge coupon={coupon} now={now} /></td>
                <td className="p-3">{coupon.minSubtotalCents ? formatMoney(coupon.minSubtotalCents, "usd") : "-"}</td>
                <td className="p-3 font-black">{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td>
                <td className="p-3 text-xs text-steel">
                  {coupon.startsAt ? coupon.startsAt.toLocaleString("en-US") : "Now"} - {coupon.endsAt ? coupon.endsAt.toLocaleString("en-US") : "No end"}
                </td>
                <td className="p-3">{coupon.allowWholesaleCustomers ? "Allowed" : "Retail only"}</td>
                <td className="p-3"><Link href={`/admin/coupons/${coupon.id}/edit`} className="font-black text-navy">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-5 text-sm text-steel">No coupons match the current filters.</p>}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-5"><p className="text-sm font-bold text-steel">{label}</p><strong className="mt-3 block text-3xl font-black">{value}</strong></div>;
}

function StatusBadge({ coupon, now }: { coupon: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }; now: Date }) {
  const label = !coupon.isActive ? "INACTIVE" : coupon.endsAt && coupon.endsAt < now ? "EXPIRED" : coupon.startsAt && coupon.startsAt > now ? "SCHEDULED" : "ACTIVE";
  const color = label === "ACTIVE" ? "bg-green-100 text-green-800" : label === "SCHEDULED" ? "bg-blue-100 text-blue-800" : label === "EXPIRED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{label}</span>;
}
