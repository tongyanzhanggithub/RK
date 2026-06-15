import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "故障排查管理",
  description: "管理故障排查指南与交互式诊断内容。"
};

const DIFFICULTY_LABEL: Record<string, string> = { easy: "简单", moderate: "中等", advanced: "较难" };

export default async function AdminProblemsPage() {
  const problems = await prisma.problem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const publishedCount = problems.filter((p) => p.status === "PUBLISHED").length;
  const withTree = problems.filter((p) => p.decisionTree).length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">故障排查</p>
          <h1 className="text-4xl font-black">故障排查管理</h1>
          <p className="mt-3 text-steel">管理故障症状、常见原因、检查步骤、推荐维修件与交互式诊断树。</p>
        </div>
        <Link href="/admin/problems/new" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          新增故障
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="故障总数" value={String(problems.length)} />
        <Metric label="已发布" value={String(publishedCount)} />
        <Metric label="含诊断树" value={String(withTree)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">标题</th>
              <th className="p-3">Slug</th>
              <th className="p-3">难度</th>
              <th className="p-3">诊断树</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{problem.title}</td>
                <td className="p-3 text-steel">{problem.slug}</td>
                <td className="p-3">{DIFFICULTY_LABEL[problem.difficulty] || problem.difficulty}</td>
                <td className="p-3">{problem.decisionTree ? "✓" : "—"}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-black ${problem.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {problem.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="p-3"><Link href={`/admin/problems/${problem.id}/edit`} className="font-black text-navy">编辑</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {problems.length === 0 && (
          <p className="p-5 text-sm text-steel">还没有故障内容。点击右上角「新增故障」创建第一条。</p>
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
