import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "客户管理",
  description: "查看客户资料与购买历史。"
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
          <p className="font-black uppercase text-safety">客户</p>
          <h1 className="text-4xl font-black">客户管理</h1>
          <p className="mt-3 text-steel">查看客户资料、购买历史、消费价值与内部分类。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/customers/export"
            className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white"
          >
            导出CSV
          </a>
          <Link
            href="/admin/customers/new"
            className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400"
          >
            + 新增客户
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="客户" value={String(customers.length)} />
        <Metric label="批发客户" value={String(wholesaleCount)} />
        <Metric label="VIP客户" value={String(vipCount)} />
        <Metric label="已封禁客户" value={String(blockedCount)} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-6">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="搜索姓名、邮箱或电话..." />
        <select name="country" defaultValue={country} className="border border-line px-3 py-2">
          <option value="">全部国家</option>
          {countries.map((item) => item.country && <option key={item.country} value={item.country}>{item.country}</option>)}
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">全部状态</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="VIP">VIP</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        <select name="role" defaultValue={role} className="border border-line px-3 py-2">
          <option value="">全部角色</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="WHOLESALE">WHOLESALE</option>
        </select>
        <select name="sort" defaultValue={sort} className="border border-line px-3 py-2">
          <option value="recent">最近订单</option>
          <option value="spent">消费最高</option>
          <option value="orders">订单最多</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-6">应用</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">客户</th>
              <th className="p-3">邮箱</th>
              <th className="p-3">国家</th>
              <th className="p-3">状态</th>
              <th className="p-3">角色</th>
              <th className="p-3">标签</th>
              <th className="p-3">订单数</th>
              <th className="p-3">已付订单</th>
              <th className="p-3">净消费</th>
              <th className="p-3">最近订单</th>
              <th className="p-3">操作</th>
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
                <td className="p-3 text-xs text-steel">{lastOrder ? lastOrder.toLocaleString("zh-CN") : "-"}</td>
                <td className="p-3"><Link href={`/admin/customers/${customer.id}`} className="font-black text-navy">查看</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-5 text-sm text-steel">没有符合当前筛选条件的客户。</p>}
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
