import type { Metadata } from "next";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern use of this website and purchases from RepairKit Supply."
};

export default function TermsPage() {
  const L = getServerDict().legal;
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-black uppercase text-safety">{L.terms_title}</p>
        <h1 className="mt-1 text-4xl font-black">{L.terms_title}</h1>
        <p className="mt-3 text-lg leading-8 text-steel">{L.terms_intro}</p>
        <div className="mt-8 grid gap-6">
          {L.terms.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-black">{s.h}</h2>
              <p className="mt-1 leading-7 text-steel">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-4 text-sm text-steel">{L.updated}</p>
      </div>
    </main>
  );
}
