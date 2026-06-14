import type { Metadata } from "next";
import { SettingsForm } from "@/app/admin/(protected)/settings/settings-form";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "设置",
  description: "站点基础设置。"
};

export default async function AdminSettingsPage({ searchParams }: { searchParams?: { saved?: string } }) {
  const values = await getSettings();

  return (
    <main>
      <div className="mb-8">
        <p className="font-black uppercase text-safety">设置</p>
        <h1 className="text-4xl font-black">站点设置</h1>
        <p className="mt-3 text-steel">店铺名称、联系方式、币种与公告栏等基础信息，保存后存入数据库。</p>
      </div>
      <SettingsForm values={values} saved={searchParams?.saved === "1"} />
    </main>
  );
}
