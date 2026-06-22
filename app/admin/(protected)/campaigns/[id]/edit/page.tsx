import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateCampaign } from "../../actions";
import { CampaignForm } from "../../campaign-form";

export const metadata: Metadata = {
  title: "编辑活动",
  description: "编辑营销活动落地页。"
};

export default async function EditCampaignPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) notFound();

  const updateAction = updateCampaign.bind(null, campaign.id);

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">活动落地页</p>
          <h1 className="text-3xl font-black">{campaign.title}</h1>
          <p className="mt-1 text-sm text-steel">公开地址：/promo/{campaign.slug}</p>
        </div>
        <Link href="/admin/campaigns" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回活动列表
        </Link>
      </div>
      <CampaignForm campaign={campaign} action={updateAction} submitLabel="保存修改" saved={searchParams?.saved === "1"} />
    </main>
  );
}
