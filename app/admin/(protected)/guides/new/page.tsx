import type { Metadata } from "next";
import Link from "next/link";
import { createGuide } from "@/app/admin/(protected)/guides/actions";
import { GuideForm } from "@/app/admin/(protected)/guides/guide-form";

export const metadata: Metadata = {
  title: "New Repair Guide",
  description: "Create a repair guide."
};

export default function NewGuidePage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Repair Guides</p>
          <h1 className="text-4xl font-black">New Repair Guide</h1>
          <p className="mt-3 text-steel">Write a troubleshooting / repair guide.</p>
        </div>
        <Link href="/admin/guides" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Guides
        </Link>
      </div>
      <GuideForm action={createGuide} submitLabel="Create Guide" />
    </main>
  );
}
