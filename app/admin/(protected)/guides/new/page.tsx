import type { Metadata } from "next";
import Link from "next/link";
import { createGuide } from "@/app/admin/(protected)/guides/actions";
import { GuideForm } from "@/app/admin/(protected)/guides/guide-form";

export const metadata: Metadata = {
  title: "新增维修指南",
  description: "创建一篇维修指南。"
};

export default function NewGuidePage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">维修指南</p>
          <h1 className="text-4xl font-black">新增维修指南</h1>
          <p className="mt-3 text-steel">撰写一篇排障 / 维修指南。</p>
        </div>
        <Link href="/admin/guides" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回指南列表
        </Link>
      </div>
      <GuideForm action={createGuide} submitLabel="创建指南" />
    </main>
  );
}
