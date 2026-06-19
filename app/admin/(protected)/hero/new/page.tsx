import type { Metadata } from "next";
import Link from "next/link";
import { createHeroSlide } from "@/app/admin/(protected)/hero/actions";
import { HeroForm } from "@/app/admin/(protected)/hero/hero-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "新建轮播" };

export default function NewHeroPage() {
  return (
    <main>
      <Link href="/admin/hero" className="font-bold text-navy">← 返回轮播列表</Link>
      <h1 className="mt-3 text-4xl font-black">新建轮播幻灯片</h1>
      <div className="mt-6">
        <HeroForm action={createHeroSlide} />
      </div>
    </main>
  );
}
