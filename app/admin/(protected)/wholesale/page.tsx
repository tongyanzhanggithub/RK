import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "批发申请管理",
  description: "审核批发申请与客户通过情况。"
};

export default async function AdminWholesalePage({
  searchParams
}: {
  searchParams?: { q?: string; country?: string; status?: string; businessType?: string };
}) {
  const q = searchParams?.q?.trim() || "";
  const country = searchParams?.country || "";
  const status = searchParams?.status || "";
  const businessType = searchParams?.businessType || "";

  const [applications, countries, businessTypes, pendingCount, approvedCount, rejectedCount, wholesaleCustomers] = await Promise.all([
    prisma.wholesaleApplication.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { companyName: { contains: q } },
                  { contactName: { contains: q } },
                  { email: { contains: q } },
                  { whatsapp: { contains: q } },
                  { productInterest: { contains: q } }
                ]
              }
            : {},
          country ? { country } : {},
          status ? { status } : {},
          businessType ? { businessType } : {}
        ]
      },
      orderBy: [{ status: "desc" }, { createdAt: "desc" }]
    }),
    prisma.wholesaleApplication.findMany({ select: { country: true }, distinct: ["country"], orderBy: { country: "asc" } }),
    prisma.wholesaleApplication.findMany({ select: { businessType: true }, distinct: ["businessType"], orderBy: { businessType: "asc" } }),
    prisma.wholesaleApplication.count({ where: { status: "PENDING" } }),
    prisma.wholesaleApplication.count({ where: { status: "APPROVED" } }),
    prisma.wholesaleApplication.count({ where: { status: "REJECTED" } }),
    prisma.customer.count({ where: { role: "WHOLESALE" } })
  ]);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">批发</p>
          <h1 className="text-4xl font-black">批发申请</h1>
          <p className="mt-3 text-steel">审核企业买家并开通批发客户权限。</p>
        </div>
        <Link href="/wholesale" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          查看公开表单
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="待审核" value={String(pendingCount)} />
        <Metric label="已通过申请" value={String(approvedCount)} />
        <Metric label="已拒绝申请" value={String(rejectedCount)} />
        <Metric label="批发客户" value={String(wholesaleCustomers)} />
      </section>

      <form className="mt-8 grid gap-3 border border-line bg-white p-4 lg:grid-cols-5">
        <input name="q" defaultValue={q} className="border border-line px-3 py-2 lg:col-span-2" placeholder="搜索公司、联系人、邮箱或产品..." />
        <select name="country" defaultValue={country} className="border border-line px-3 py-2">
          <option value="">全部国家</option>
          {countries.map((item) => <option key={item.country} value={item.country}>{item.country}</option>)}
        </select>
        <select name="businessType" defaultValue={businessType} className="border border-line px-3 py-2">
          <option value="">全部业务类型</option>
          {businessTypes.map((item) => <option key={item.businessType} value={item.businessType}>{item.businessType}</option>)}
        </select>
        <select name="status" defaultValue={status} className="border border-line px-3 py-2">
          <option value="">全部状态</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button className="bg-navy px-4 py-2 font-black text-white lg:col-start-5">应用</button>
      </form>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">公司</th>
              <th className="p-3">联系人</th>
              <th className="p-3">国家</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">邮箱</th>
              <th className="p-3">业务类型</th>
              <th className="p-3">意向产品</th>
              <th className="p-3">月采购量</th>
              <th className="p-3">状态</th>
              <th className="p-3">创建时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{application.companyName}</td>
                <td className="p-3">{application.contactName}</td>
                <td className="p-3">{application.country}</td>
                <td className="p-3">{application.whatsapp}</td>
                <td className="p-3">{application.email}</td>
                <td className="p-3">{application.businessType}</td>
                <td className="max-w-xs p-3 text-steel">{readInterests(application.productInterest).join(", ")}</td>
                <td className="p-3 font-black">{application.estimatedMonthlyQuantity ?? "-"}</td>
                <td className="p-3"><StatusBadge status={application.status} /></td>
                <td className="p-3 text-xs text-steel">{application.createdAt.toLocaleString("zh-CN")}</td>
                <td className="p-3"><Link href={`/admin/wholesale/${application.id}`} className="font-black text-navy">查看</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p className="p-5 text-sm text-steel">没有符合当前筛选条件的批发申请。</p>}
      </section>
    </main>
  );
}

function readInterests(value: string) {
  try {
    const interests = JSON.parse(value);
    return Array.isArray(interests) ? interests.filter((item) => typeof item === "string") : [value];
  } catch {
    return [value];
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-line bg-white p-5"><p className="text-sm font-bold text-steel">{label}</p><strong className="mt-3 block text-3xl font-black">{value}</strong></div>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "APPROVED" ? "bg-green-100 text-green-800" : status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-safety/25 text-ink";
  return <span className={`inline-flex px-2 py-1 text-xs font-black ${color}`}>{status}</span>;
}
