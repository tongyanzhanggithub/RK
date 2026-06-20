import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewWholesaleApplication } from "@/app/admin/(protected)/wholesale/actions";
import { WholesaleReviewForm } from "@/app/admin/(protected)/wholesale/wholesale-review-form";
import { zhLabel, WHOLESALE_STATUS } from "@/lib/admin-status";
import { prisma } from "@/lib/db";
import { scoreLead, TIER_CLASS, TIER_LABEL } from "@/lib/lead-score";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "批发申请详情",
  description: "审核批发申请。"
};

export default async function AdminWholesaleDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const application = await prisma.wholesaleApplication.findUnique({
    where: { id: params.id },
    include: { customer: true }
  });
  if (!application) notFound();

  const lead = scoreLead(application);

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">批发申请</p>
          <h1 className="text-4xl font-black">{application.companyName}</h1>
          <p className="mt-3 text-steel">{application.contactName} · {application.country}</p>
        </div>
        <Link href="/admin/wholesale" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回申请列表
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <InfoPanel title="企业申请">
            <Info label="状态" value={zhLabel(WHOLESALE_STATUS, application.status)} />
            <Info label="公司" value={application.companyName} />
            <Info label="联系人" value={application.contactName} />
            <Info label="业务类型" value={application.businessType} />
            <Info label="国家" value={application.country} />
            <Info label="WhatsApp" value={application.whatsapp} />
            <Info label="邮箱" value={application.email} />
            <Info label="预计月采购量" value={String(application.estimatedMonthlyQuantity ?? "-")} />
            <Info label="公司网站" value={application.website || "-"} />
            <Info label="实体经营地址" value={application.businessAddress || "-"} />
            <Info label="销售渠道/市场" value={application.salesChannel || "-"} />
            <Info label="意向产品" value={readInterests(application.productInterest).join(", ")} />
            <Info label="留言" value={application.message || "-"} />
            <Info label="提交时间" value={application.createdAt.toLocaleString("zh-CN")} />
          </InfoPanel>

          <InfoPanel title="审核记录">
            <Info label="审核人" value={application.reviewedBy || "-"} />
            <Info label="审核时间" value={application.reviewedAt?.toLocaleString("zh-CN") || "-"} />
            <Info label="通知状态" value={application.notificationStatus} />
            <Info label="管理员备注" value={application.adminNote || "-"} />
          </InfoPanel>
        </div>

        <aside className="grid h-fit gap-6">
          <section className="border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase text-steel">资质可信度评分</p>
              <span className={`inline-flex px-2 py-1 text-xs font-black ${TIER_CLASS[lead.tier]}`}>
                {TIER_LABEL[lead.tier]} · {lead.score}/100
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-steel">
              用于人工审核参考 —— 分数越高越可能是真实企业。寄样前建议要求「可疑」级别的申请补充公司网站或营业执照。
            </p>
            <ul className="mt-4 grid gap-2 text-sm">
              {lead.signals.map((signal) => (
                <li key={signal.label} className="flex items-start gap-2">
                  <span className={signal.positive ? "text-green-700" : "text-red-600"}>{signal.positive ? "✓" : "✕"}</span>
                  <span className="font-bold">{signal.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase text-steel">关联客户</p>
            {application.customer ? (
              <>
                <strong className="mt-3 block text-xl">{application.customer.name}</strong>
                <p className="mt-1 text-sm text-steel">{application.customer.email}</p>
                <p className="mt-3 text-sm font-black">{application.customer.role} · {application.customer.status}</p>
                <Link href={`/admin/customers/${application.customer.id}`} className="mt-5 inline-flex font-black text-navy">查看客户</Link>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-steel">尚未关联客户。通过审核后将按邮箱创建或关联客户。</p>
            )}
          </section>

          <WholesaleReviewForm
            application={application}
            action={reviewWholesaleApplication.bind(null, application.id)}
            saved={searchParams?.saved === "1"}
          />
        </aside>
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

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="text-xl font-black">{title}</h2></div><dl className="grid gap-0 p-5">{children}</dl></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-line py-3 text-sm md:grid-cols-[220px_1fr]"><dt className="font-bold text-steel">{label}</dt><dd className="whitespace-pre-wrap break-words font-bold">{value}</dd></div>;
}
