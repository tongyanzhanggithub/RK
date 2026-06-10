import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cog } from "lucide-react";
import { models } from "@/data/models";

export const metadata: Metadata = {
  title: "Shop Parts by Engine Model",
  description:
    "Find repair kits and spare parts for 168F, 170F, 188F, GX160 and GX200 style engines, water pumps and generators. Fitment notes included for every model."
};

export default function EnginesPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-safety">Shop by engine</p>
        <h1 className="mt-1 text-4xl font-black">Pick your engine or machine</h1>
        <p className="mt-3 max-w-3xl text-steel">
          Every model page lists the parts that fit, what to double-check before ordering, and the most common
          failures for that platform.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Link
              key={model.slug}
              href={`/engines/${model.slug}`}
              className="group border border-line bg-white p-6 shadow-sm hover:border-navy"
            >
              <Cog className="mb-4 text-navy" size={28} />
              <h2 className="text-lg font-black leading-snug">{model.name}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{model.description}</p>
              <p className="mt-3 text-sm font-bold text-steel">
                Used in: {model.commonEquipment.slice(0, 3).join(" · ")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                View parts <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
