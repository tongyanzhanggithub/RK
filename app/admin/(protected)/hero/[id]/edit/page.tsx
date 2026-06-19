import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateHeroSlide } from "@/app/admin/(protected)/hero/actions";
import { HeroForm } from "@/app/admin/(protected)/hero/hero-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "编辑轮播" };

export default async function EditHeroPage({ params }: { params: { id: string } }) {
  const slide = await prisma.heroSlide.findUnique({ where: { id: params.id } });
  if (!slide) notFound();

  return (
    <main>
      <Link href="/admin/hero" className="font-bold text-navy">← 返回轮播列表</Link>
      <h1 className="mt-3 text-4xl font-black">编辑轮播幻灯片</h1>
      <div className="mt-6">
        <HeroForm action={updateHeroSlide.bind(null, slide.id)} slide={slide} />
      </div>
    </main>
  );
}
