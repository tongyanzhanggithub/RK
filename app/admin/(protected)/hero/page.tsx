import type { Metadata } from "next";
import Link from "next/link";
import { deleteHeroSlide, toggleHeroPublished } from "@/app/admin/(protected)/hero/actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "首页轮播",
  description: "编辑首页大图轮播(hero)。"
};

export default async function AdminHeroPage({ searchParams }: { searchParams?: { saved?: string } }) {
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">首页</p>
          <h1 className="text-4xl font-black">首页轮播 (Hero)</h1>
          <p className="mt-3 max-w-2xl text-steel">
            编辑首页顶部大图的标题、卖点和按钮。<strong>没有任何启用的幻灯片时,首页会回退到内置多语言默认</strong>。
          </p>
        </div>
        <Link href="/admin/hero/new" className="inline-flex h-11 items-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          + 新建幻灯片
        </Link>
      </div>

      {searchParams?.saved === "1" && (
        <p className="mt-6 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已保存。</p>
      )}

      <section className="mt-8 grid gap-0 border border-line bg-white">
        {slides.length === 0 ? (
          <p className="p-5 text-sm text-steel">
            还没有自定义幻灯片(首页正显示内置默认)。点右上「新建」开始,或在服务器运行 <code>node scripts/seed-hero.js</code> 导入现有 3 张默认幻灯片再编辑。
          </p>
        ) : (
          slides.map((s) => (
            <article key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-steel">#{s.sortOrder}</span>
                  <strong>{s.title}</strong>
                  <span className={`px-2 py-0.5 text-xs font-black ${s.isActive ? "bg-green-100 text-green-800" : "bg-panel text-steel"}`}>
                    {s.isActive ? "启用" : "隐藏"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-steel">{s.badge}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/hero/${s.id}/edit`} className="text-sm font-black text-navy hover:underline">编辑</Link>
                <form action={toggleHeroPublished.bind(null, s.id)}>
                  <button type="submit" className="text-sm font-black text-navy hover:underline">{s.isActive ? "隐藏" : "启用"}</button>
                </form>
                <form action={deleteHeroSlide.bind(null, s.id)}>
                  <button type="submit" className="text-sm font-black text-red-700 hover:underline">删除</button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
