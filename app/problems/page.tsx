import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Stethoscope } from "lucide-react";
import { problems } from "@/data/problems";
import { GENERAL_INQUIRY_MESSAGE, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Engine Troubleshooting Guides | Fix by Symptom",
  description:
    "Diagnose common small engine problems — engine won't start, pull starter broken, water pump leaking — and find the exact repair kit that fixes it."
};

export default function ProblemsPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">Fix by symptom</p>
        <h1 className="mt-1 text-4xl font-black">What is wrong with your machine?</h1>
        <p className="mt-3 max-w-3xl text-steel">
          Pick the symptom you see in the field. Each guide lists the common causes, quick checks and the repair kit
          that fixes it — the same diagnosis flow repair shops use every day.
        </p>
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
                Common causes: {problem.commonCauses.slice(0, 3).join(" · ")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                Diagnose &amp; fix <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Symptom not listed, or not sure what you are looking at?</h2>
              <p className="mt-1 text-steel">Send us a photo or video on WhatsApp — we diagnose and quote the right kit.</p>
            </div>
            <a
              href={whatsappLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 bg-safety px-5 font-black text-ink"
            >
              <MessageCircle size={18} /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
