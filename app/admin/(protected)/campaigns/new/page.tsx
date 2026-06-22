import type { Metadata } from "next";
import Link from "next/link";
import { createCampaign } from "../actions";
import { CampaignForm } from "../campaign-form";

export const metadata: Metadata = {
  title: "新建活动",
  description: "创建一个营销活动落地页。"
};

export default function NewCampaignPage() {
  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">活动落地页</p>
          <h1 className="text-3xl font-black">新建活动</h1>
        </div>
        <Link href="/admin/campaigns" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回活动列表
        </Link>
      </div>
      <CampaignForm action={createCampaign} submitLabel="创建活动" />
    </main>
  );
}
