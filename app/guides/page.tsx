import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repair Guides",
  description:
    "Step-by-step repair and troubleshooting guides for small gasoline engines, water pumps and generators — 168F, 170F, GX160, GX200 and more."
};

export default async function GuidesPage() {
  const dict = getServerDict();
  const g = dict.guides;
  const guides = await prisma.repairGuide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">{g.badge}</p>
        <h1 className="mt-1 text-4xl font-black">{g.main_heading}</h1>
        <p className="mt-3 max-w-3xl text-steel">{g.main_sub}</p>

        {guides.length === 0 ? (
          <p className="mt-8 border border-line bg-white p-6 font-bold text-steel">{g.empty}</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex flex-col border border-line bg-white p-6 shadow-sm hover:border-navy"
              >
                <BookOpen className="mb-4 text-navy" size={28} />
                <h2 className="text-lg font-black leading-snug">{guide.title}</h2>
                {guide.excerpt && <p className="mt-2 text-sm leading-6 text-steel">{guide.excerpt}</p>}
                <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                  {g.read_more} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
