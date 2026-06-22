import type { Metadata } from "next";
import { Download, Mail, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { CampaignForm } from "./campaign-form";
import { ToggleSubscriberButton } from "./unsubscribe-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "邮件订阅",
  description: "管理订阅者并群发营销邮件。"
};

const SOURCE_LABEL: Record<string, string> = {
  footer: "页脚",
  popup: "弹窗",
  checkout: "结账"
};

export default async function AdminNewsletterPage() {
  const [subscribers, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } })
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">邮件订阅</h1>
          <p className="mt-1 text-sm text-steel">页脚订阅收集的邮箱,可在此群发批发优惠/到货通知。</p>
        </div>
        <a
          href="/admin/newsletter/export"
          className="inline-flex h-11 items-center gap-2 border border-line px-4 text-sm font-black text-graphite hover:border-navy hover:text-navy"
        >
          <Download size={16} /> 导出 CSV
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 border border-line bg-white p-4">
          <Users size={22} className="text-brand" />
          <div>
            <div className="text-2xl font-black">{activeCount}</div>
            <div className="text-xs font-bold text-steel">有效订阅者</div>
          </div>
        </div>
        <div className="flex items-center gap-3 border border-line bg-white p-4">
          <Mail size={22} className="text-brand" />
          <div>
            <div className="text-2xl font-black">{subscribers.length}</div>
            <div className="text-xs font-bold text-steel">订阅总数（含已退订）</div>
          </div>
        </div>
      </div>

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">群发邮件</h2>
        </div>
        <div className="p-5">
          <CampaignForm count={activeCount} />
        </div>
      </section>

      <section className="border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">订阅者列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-steel">
                <th className="p-3 font-black">邮箱</th>
                <th className="p-3 font-black">来源</th>
                <th className="p-3 font-black">语言</th>
                <th className="p-3 font-black">状态</th>
                <th className="p-3 font-black">订阅时间</th>
                <th className="p-3 font-black">操作</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-steel">还没有订阅者。</td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-line/60">
                    <td className="p-3 font-bold">{s.email}</td>
                    <td className="p-3">{SOURCE_LABEL[s.source] || s.source}</td>
                    <td className="p-3 uppercase">{s.locale || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-black ${s.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                        {s.isActive ? "有效" : "已退订"}
                      </span>
                    </td>
                    <td className="p-3 text-steel">{s.createdAt.toISOString().slice(0, 10)}</td>
                    <td className="p-3">
                      <ToggleSubscriberButton id={s.id} isActive={s.isActive} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
