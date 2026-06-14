import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repair Guides",
  description: "Manage repair guide content."
};

export default async function AdminGuidesPage() {
  const guides = await prisma.repairGuide.findMany({ orderBy: [{ updatedAt: "desc" }] });
  const publishedCount = guides.filter((g) => g.status === "PUBLISHED").length;

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Repair Guides</p>
          <h1 className="text-4xl font-black">Repair Guides</h1>
          <p className="mt-3 text-steel">Write and manage buyer-facing troubleshooting and repair guides for content marketing and SEO.</p>
        </div>
        <Link href="/admin/guides/new" className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400">
          New Guide
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Total Guides" value={String(guides.length)} />
        <Metric label="Published" value={String(publishedCount)} />
        <Metric label="Drafts" value={String(guides.length - publishedCount)} />
      </section>

      <section className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase text-steel">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-t border-line align-top">
                <td className="p-3 font-black">{guide.title}</td>
                <td className="p-3 text-steel">{guide.slug}</td>
                <td className="p-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-black ${guide.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {guide.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-xs text-steel">{guide.updatedAt.toLocaleString("en-US")}</td>
                <td className="p-3"><Link href={`/admin/guides/${guide.id}/edit`} className="font-black text-navy">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 && (
          <p className="p-5 text-sm text-steel">No repair guides yet. Click “New Guide” to create the first one.</p>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-sm font-bold text-steel">{label}</p>
      <strong className="mt-3 block text-3xl font-black">{value}</strong>
    </div>
  );
}
