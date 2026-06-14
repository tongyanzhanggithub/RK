import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteGuide, updateGuide } from "@/app/admin/(protected)/guides/actions";
import { GuideForm } from "@/app/admin/(protected)/guides/guide-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑维修指南",
  description: "编辑维修指南内容。"
};

export default async function EditGuidePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const guide = await prisma.repairGuide.findUnique({ where: { id: params.id } });
  if (!guide) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">维修指南</p>
          <h1 className="text-4xl font-black">{guide.title}</h1>
          <p className="mt-3 text-steel">编辑标题、正文、状态与 SEO。</p>
        </div>
        <Link href="/admin/guides" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回指南列表
        </Link>
      </div>

      <GuideForm
        guide={guide}
        action={updateGuide.bind(null, guide.id)}
        submitLabel="保存指南"
        saved={searchParams?.saved === "1"}
      />

      <form action={deleteGuide.bind(null, guide.id)} className="mt-6 max-w-3xl">
        <button className="h-11 border border-red-300 px-4 text-sm font-black text-red-700 hover:bg-red-50" type="submit">
          删除此指南
        </button>
      </form>
    </main>
  );
}
