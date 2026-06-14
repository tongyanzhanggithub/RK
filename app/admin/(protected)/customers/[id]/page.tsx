import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCustomer } from "@/app/admin/(protected)/customers/actions";
import { CustomerManagementForm } from "@/app/admin/(protected)/customers/customer-management-form";
import { zhLabel, CUSTOMER_STATUS, CUSTOMER_ROLE, ORDER_PAYMENT_STATUS, FULFILLMENT_STATUS, WHOLESALE_STATUS } from "@/lib/admin-status";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "客户详情",
  description: "查看客户资料与订单历史。"
};

export default async function AdminCustomerDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      wholesaleApplications: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!customer) notFound();

  const paidOrders = customer.orders.filter((order) => order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED");
  const netSpend = paidOrders.reduce((total, order) => total + order.totalCents - order.refundedCents, 0);

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">客户</p>
          <h1 className="text-4xl font-black">{customer.name}</h1>
          <p className="mt-3 text-steel">{customer.email}</p>
        </div>
        <Link href="/admin/customers" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回客户列表
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="客户资料">
            <Info label="状态" value={zhLabel(CUSTOMER_STATUS, customer.status)} />
            <Info label="客户角色" value={zhLabel(CUSTOMER_ROLE, customer.role)} />
            <Info label="批发通过时间" value={customer.wholesaleApprovedAt?.toLocaleString("zh-CN") || "-"} />
            <Info label="邮箱" value={customer.email} />
            <Info label="电话" value={customer.phone || "-"} />
            <Info label="WhatsApp" value={customer.whatsapp || "-"} />
            <Info label="国家" value={customer.country || "-"} />
            <Info label="城市" value={customer.city || "-"} />
            <Info label="地址" value={customer.address || "-"} />
            <Info label="邮编" value={customer.postalCode || "-"} />
            <Info label="注册时间" value={customer.createdAt.toLocaleString("zh-CN")} />
          </InfoPanel>

          {customer.wholesaleApplications.length > 0 && (
            <section className="overflow-x-auto border border-line bg-white">
              <div className="border-b border-line p-5"><h2 className="text-xl font-black">批发申请</h2></div>
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-panel text-xs uppercase text-steel">
                  <tr>
                    <th className="p-3">公司</th>
                    <th className="p-3">业务类型</th>
                    <th className="p-3">状态</th>
                    <th className="p-3">创建时间</th>
                    <th className="p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.wholesaleApplications.map((application) => (
                    <tr key={application.id} className="border-t border-line">
                      <td className="p-3 font-black">{application.companyName}</td>
                      <td className="p-3">{application.businessType}</td>
                      <td className="p-3 font-black">{zhLabel(WHOLESALE_STATUS, application.status)}</td>
                      <td className="p-3 text-xs text-steel">{application.createdAt.toLocaleString("zh-CN")}</td>
                      <td className="p-3"><Link href={`/admin/wholesale/${application.id}`} className="font-black text-navy">查看</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="overflow-x-auto border border-line bg-white">
            <div className="border-b border-line p-5"><h2 className="text-xl font-black">订单历史</h2></div>
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-panel text-xs uppercase text-steel">
                <tr>
                  <th className="p-3">订单</th>
                  <th className="p-3">金额</th>
                  <th className="p-3">付款</th>
                  <th className="p-3">履约</th>
                  <th className="p-3">创建时间</th>
                  <th className="p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="p-3 font-black">{order.orderNumber}</td>
                    <td className="p-3 font-black">{formatMoney(order.totalCents, order.currency)}</td>
                    <td className="p-3">{zhLabel(ORDER_PAYMENT_STATUS, order.paymentStatus)}</td>
                    <td className="p-3">{zhLabel(FULFILLMENT_STATUS, order.fulfillmentStatus)}</td>
                    <td className="p-3 text-xs text-steel">{order.createdAt.toLocaleString("zh-CN")}</td>
                    <td className="p-3"><Link href={`/admin/orders/${order.id}`} className="font-black text-navy">查看</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="grid grid-cols-2 gap-3">
            <Metric label="订单数" value={String(customer.orders.length)} />
            <Metric label="已付订单" value={String(paidOrders.length)} />
            <div className="col-span-2"><Metric label="净消费" value={formatMoney(netSpend, "usd")} /></div>
          </section>
          <CustomerManagementForm customer={customer} action={updateCustomer.bind(null, customer.id)} saved={searchParams?.saved === "1"} />
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-4"><p className="text-xs font-bold uppercase text-steel">{label}</p><strong className="mt-2 block text-2xl font-black">{value}</strong></div>;
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="text-xl font-black">{title}</h2></div><dl className="grid gap-0 p-5">{children}</dl></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[180px_1fr]"><dt className="font-bold text-steel">{label}</dt><dd className="break-words font-bold">{value}</dd></div>;
}
