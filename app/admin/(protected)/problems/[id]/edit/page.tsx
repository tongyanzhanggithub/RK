import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProblem, updateProblem } from "@/app/admin/(protected)/problems/actions";
import { ProblemForm } from "@/app/admin/(protected)/problems/problem-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑故障",
  description: "编辑故障排查内容。"
};

export default async function AdminEditProblemPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const problem = await prisma.problem.findUnique({ where: { id: params.id } });
  if (!problem) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">故障排查</p>
          <h1 className="text-4xl font-black">{problem.title}</h1>
          <p className="mt-3 text-steel">
            <Link href={`/problems/${problem.slug}`} className="font-bold text-navy hover:underline">查看前台页面 →</Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/problems" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
            返回列表
          </Link>
          <form action={deleteProblem.bind(null, problem.id)}>
            <button type="submit" className="inline-flex h-11 items-center justify-center border border-red-300 px-4 font-black text-red-700 hover:bg-red-50">
              删除
            </button>
          </form>
        </div>
      </div>
      <ProblemForm
        problem={problem}
        action={updateProblem.bind(null, problem.id)}
        submitLabel="保存修改"
        saved={searchParams?.saved === "1"}
      />
    </main>
  );
}
