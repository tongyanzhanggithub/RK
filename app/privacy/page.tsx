import type { Metadata } from "next";
import { getServerDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information RepairKit Supply collects, why, and your choices."
};

export default function PrivacyPage() {
  const L = getServerDict().legal;
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-black uppercase text-safety">{L.privacy_title}</p>
        <h1 className="mt-1 text-4xl font-black">{L.privacy_title}</h1>
        <p className="mt-3 text-lg leading-8 text-steel">{L.privacy_intro}</p>
        <div className="mt-8 grid gap-6">
          {L.privacy.map((s) => (
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
