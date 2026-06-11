import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Stethoscope } from "lucide-react";
import { problems } from "@/data/problems";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engine Troubleshooting Guides | Fix by Symptom",
  description:
    "Diagnose common small engine problems — engine won't start, pull starter broken, water pump leaking — and find the exact repair kit that fixes it."
};

export default function ProblemsPage() {
  const dict = getServerDict();
  const pr = dict.problems;

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">{pr.badge}</p>
        <h1 className="mt-1 text-4xl font-black">{pr.main_heading}</h1>
        <p className="mt-3 max-w-3xl text-steel">{pr.main_sub}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <Link
              key={problem.slug}
              href={`/problems/${problem.slug}`}
              className="group border border-line bg-white p-6 shadow-sm hover:border-navy"
            >
              <Stethoscope className="mb-4 text-navy" size={28} />
              <h2 className="text-lg font-black leading-snug">{problem.title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{problem.description}</p>
              <p className="mt-4 text-sm font-bold text-steel">
                {pr.common_causes} {problem.commonCauses.slice(0, 3).join(" · ")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                {pr.diagnose} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">{pr.cta_heading}</h2>
              <p className="mt-1 text-steel">{pr.cta_sub}</p>
            </div>
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
            >
              <MessageCircle size={18} /> {pr.cta_btn}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
