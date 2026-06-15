import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { ProblemsList } from "@/components/problems-list";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";
import { getServerDict } from "@/lib/locale";
import { getTroubleshooting } from "@/lib/troubleshooting";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engine Troubleshooting Guides | Fix by Symptom",
  description:
    "Diagnose common small engine problems — engine won't start, pull starter broken, water pump leaking — and find the exact repair kit that fixes it."
};

export default async function ProblemsPage() {
  const dict = getServerDict();
  const pr = dict.problems;
  const problems = await getTroubleshooting();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">{pr.badge}</p>
        <h1 className="mt-1 text-4xl font-black">{pr.main_heading}</h1>
        <p className="mt-3 max-w-3xl text-steel">{pr.main_sub}</p>
        <div className="mt-8">
          <ProblemsList
            problems={problems}
            strings={{
              search_placeholder: pr.search_placeholder,
              all: pr.all_equipment,
              difficulty_easy: pr.difficulty_easy,
              difficulty_moderate: pr.difficulty_moderate,
              difficulty_advanced: pr.difficulty_advanced,
              common_causes: pr.common_causes,
              diagnose: pr.diagnose,
              result_count: pr.result_count,
              no_results: pr.no_results,
              no_results_sub: pr.no_results_sub
            }}
          />
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
