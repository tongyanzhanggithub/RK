import type { Metadata } from "next";
import Link from "next/link";
import { zhLabel, WHOLESALE_STATUS } from "@/lib/admin-status";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "后台仪表盘",
  description: "用于产品目录与订单管理的后台仪表盘。"
};

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    activeCount,
    draftCount,
    archivedCount,
    lowStockProducts,
    customerCount,
    pendingWholesaleCount,
    todayOrders,
    pendingOrders,
    toShipOrders,
    recentOrders,
    recentApplications,
    todayPaidOrders,
    monthPaidOrders,
    monthItems,
    monthCountries
  ] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.product.count({ where: { status: "ARCHIVED" } }),
    prisma.product.findMany({
      where: {
        status: { not: "ARCHIVED" },
        stock: { lte: 6 }
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: 8
    }),
    prisma.customer.count(),
    prisma.wholesaleApplication.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { orderStatus: "PROCESSING" } }),
    prisma.order.count({ where: { paymentStatus: "PAID", fulfillmentStatus: { in: ["UNFULFILLED", "PARTIALLY_FULFILLED"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.wholesaleApplication.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.order.findMany({ where: { paymentStatus: "PAID", createdAt: { gte: today } }, select: { totalCents: true } }),
    prisma.order.findMany({ where: { paymentStatus: "PAID", createdAt: { gte: monthStart } }, select: { totalCents: true } }),
    prisma.orderItem.groupBy({
      by: ["productName", "productSlug"],
      where: { order: { paymentStatus: "PAID", createdAt: { gte: monthStart } } },
      _sum: { quantity: true, subtotalCents: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    }),
    prisma.order.groupBy({
      by: ["country"],
      where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
      _count: { _all: true },
      _sum: { totalCents: true },
      orderBy: { _sum: { totalCents: "desc" } },
      take: 5
    })
  ]);

  const todaySales = todayPaidOrders.reduce((total, order) => total + order.totalCents, 0);
  const monthSales = monthPaidOrders.reduce((total, order) => total + order.totalCents, 0);
  const cards = [
    ["今日销售额", formatMoney(todaySales, "usd")],
    ["本月销售额", formatMoney(monthSales, "usd")],
    ["今日订单", String(todayOrders)],
    ["待处理订单", String(pendingOrders)],
    ["待发货", String(toShipOrders)],
    ["低库存产品", String(lowStockProducts.length)],
    ["客户总数", String(customerCount)],
    ["新批发申请", String(pendingWholesaleCount)]
  ];

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">仪表盘</p>
          <h1 className="text-4xl font-black">后台总览</h1>
          <p className="mt-3 text-steel">Admin 第 5 阶段新增了批发申请、审核决策与批发客户角色。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/orders" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
            查看订单
          </Link>
          <Link href="/admin/inventory" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
            查看库存
          </Link>
          <Link href="/admin/products/new" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
            新增产品
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-line bg-white p-5">
            <p className="text-sm font-bold text-steel">{label}</p>
            <strong className="mt-3 block text-3xl font-black">{value}</strong>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">产品状态</h2>
          </div>
          <div className="grid gap-3 p-5 text-sm">
            <StatusRow label="在售" value={activeCount} />
            <StatusRow label="草稿" value={draftCount} />
            <StatusRow label="已归档" value={archivedCount} />
          </div>
        </div>

        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">低库存产品</h2>
          </div>
          <div className="grid gap-0">
            {lowStockProducts.length === 0 ? (
              <p className="p-5 text-sm text-steel">暂无低库存产品。</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line p-4 text-sm">
                  <div>
                    <strong className="block">{product.name}</strong>
                    <span className="text-steel">{product.sku}</span>
                  </div>
                  <span className="font-black text-orange-700">{product.stock}</span>
                  <Link href={`/admin/inventory/${product.id}`} className="font-black text-navy">
                    调整
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">本月热销产品</h2>
          </div>
          <div className="grid gap-0">
            {monthItems.length === 0 ? (
              <p className="p-5 text-sm text-steel">本月暂无已支付订单。</p>
            ) : (
              monthItems.map((item) => (
                <div key={item.productSlug} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line p-4 text-sm">
                  <Link href={`/products/${item.productSlug}`} className="font-black text-navy hover:underline">
                    {item.productName}
                  </Link>
                  <span className="font-black">{item._sum.quantity ?? 0} 件</span>
                  <span className="font-black">{formatMoney(item._sum.subtotalCents ?? 0, "usd")}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">本月各国销售额</h2>
          </div>
          <div className="grid gap-0">
            {monthCountries.length === 0 ? (
              <p className="p-5 text-sm text-steel">本月暂无已支付订单。</p>
            ) : (
              monthCountries.map((row) => (
                <div key={row.country} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line p-4 text-sm">
                  <strong>{row.country}</strong>
                  <span className="font-black">{row._count._all} 笔订单</span>
                  <span className="font-black">{formatMoney(row._sum.totalCents ?? 0, "usd")}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">最近订单</h2>
          </div>
          <div className="grid gap-0">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-steel">暂无订单。</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="grid gap-3 border-b border-line p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <strong className="block">{order.orderNumber}</strong>
                    <span className="text-steel">{order.customerName} · {order.country}</span>
                  </div>
                  <span className="font-black">{formatMoney(order.totalCents, order.currency)}</span>
                  <Link href={`/admin/orders/${order.id}`} className="font-black text-navy">
                    查看
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 className="text-xl font-black">最近批发申请</h2>
            <Link href="/admin/wholesale" className="text-sm font-black text-navy">查看全部</Link>
          </div>
          <div className="grid gap-0">
            {recentApplications.length === 0 ? (
              <p className="p-5 text-sm text-steel">暂无批发申请。</p>
            ) : (
              recentApplications.map((application) => (
                <div key={application.id} className="grid gap-3 border-b border-line p-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <strong className="block">{application.companyName}</strong>
                    <span className="text-steel">{application.country} / {application.businessType}</span>
                  </div>
                  <span className="font-black">{zhLabel(WHOLESALE_STATUS, application.status)}</span>
                  <Link href={`/admin/wholesale/${application.id}`} className="font-black text-navy">审核</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <span className="text-steel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
