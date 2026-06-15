import type { Metadata } from "next";
import Link from "next/link";
import { createProblem } from "@/app/admin/(protected)/problems/actions";
import { ProblemForm } from "@/app/admin/(protected)/problems/problem-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新增故障",
  description: "创建一条故障排查内容。"
};

export default function AdminNewProblemPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">故障排查</p>
          <h1 className="text-4xl font-black">新增故障</h1>
        </div>
        <Link href="/admin/problems" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回列表
        </Link>
      </div>
      <ProblemForm action={createProblem} submitLabel="创建" />
    </main>
  );
}
