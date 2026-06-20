import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "维修指南",
  description: "管理维修指南内容。"
};

export default async function AdminGuidesPage() {
  const guides = await prisma.repairGuide.findMany({ orderBy: [{ updatedAt: "desc" }] });
  const publishedCount = guides.filter((g) => g.status === "PUBLISHED").length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">维修指南</p>
          <h1 className="text-4xl font-black">维修指南</h1>
          <p className="mt-3 text-steel">撰写并管理面向买家的维修排障指南，用于内容营销与 SEO。</p>
        </div>
        <Link href="/admin/guides/new" className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf]">
          新增指南
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="指南总数" value={String(guides.length)} />
        <Metric label="已发布" value={String(publishedCount)} />
        <Metric label="草稿" value={String(guides.length - publishedCount)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">标题</th>
              <th className="p-3">Slug</th>
              <th className="p-3">状态</th>
              <th className="p-3">更新时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{guide.title}</td>
                <td className="p-3 text-steel">{guide.slug}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-black ${guide.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {guide.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="p-3 text-xs text-steel">{guide.updatedAt.toLocaleString("zh-CN")}</td>
                <td className="p-3"><Link href={`/admin/guides/${guide.id}/edit`} className="font-black text-navy">编辑</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 && (
          <p className="p-5 text-sm text-steel">还没有维修指南。点击右上角「新增指南」创建第一篇。</p>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-bold text-steel">{label}</p>
      <strong className="mt-3 block text-3xl font-black">{value}</strong>
    </div>
  );
}
