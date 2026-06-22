import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeleteCampaignButton } from "./delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "活动落地页",
  description: "创建并管理营销活动落地页。"
};

function countSlugs(json: string) {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function statusOf(c: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }, now: Date) {
  if (!c.isActive) return { label: "已停用", cls: "bg-gray-100 text-gray-500" };
  if (c.startsAt && c.startsAt > now) return { label: "未开始", cls: "bg-amber-100 text-amber-800" };
  if (c.endsAt && c.endsAt < now) return { label: "已结束", cls: "bg-gray-100 text-gray-500" };
  return { label: "进行中", cls: "bg-green-100 text-green-800" };
}

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">活动落地页</h1>
          <p className="mt-1 text-sm text-steel">为促销/节日/批发活动创建独立落地页（/promo/slug），可关联产品与行动按钮。</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex h-11 items-center gap-2 bg-brand px-4 text-sm font-black text-white hover:bg-[#1c54bf]"
        >
          <Plus size={16} /> 新建活动
        </Link>
      </div>

      <section className="border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-steel">
                <th className="p-3 font-black">标题</th>
                <th className="p-3 font-black">Slug</th>
                <th className="p-3 font-black">产品数</th>
                <th className="p-3 font-black">状态</th>
                <th className="p-3 font-black">有效期</th>
                <th className="p-3 font-black">操作</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-steel">还没有活动。点击右上角“新建活动”。</td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const st = statusOf(c, now);
                  return (
                    <tr key={c.id} className="border-b border-line/60">
                      <td className="p-3 font-bold">{c.title}</td>
                      <td className="p-3 font-mono text-xs text-steel">{c.slug}</td>
                      <td className="p-3">{countSlugs(c.productSlugs)}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-black ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="p-3 text-xs text-steel">
                        {c.startsAt ? c.startsAt.toISOString().slice(0, 10) : "—"} ~ {c.endsAt ? c.endsAt.toISOString().slice(0, 10) : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/campaigns/${c.id}/edit`} className="text-xs font-black text-navy hover:underline">
                            编辑
                          </Link>
                          <a
                            href={`/promo/${c.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-black text-graphite hover:text-navy"
                          >
                            预览 <ExternalLink size={12} />
                          </a>
                          <DeleteCampaignButton id={c.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
