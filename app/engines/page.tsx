import type { Metadata } from "next";
import { EnginePicker } from "@/components/engine-picker";
import { models } from "@/data/models";
import { getServerDict } from "@/lib/locale";
import { getStoreProducts } from "@/lib/product-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Parts by Engine Model",
  description:
    "Find repair kits and spare parts for 168F, 170F, 188F, GX160 and GX200 style engines, water pumps and generators. Fitment notes included for every model."
};

export default async function EnginesPage() {
  const dict = getServerDict();
  const e = dict.engines;

  // Count compatible parts per engine (specific + universal) for the coverage badge.
  const products = await getStoreProducts();
  const universalCount = products.filter((product) => product.fitmentType === "UNIVERSAL").length;
  const counts: Record<string, number> = {};
  for (const model of models) {
    const needle = model.name.toLowerCase();
    const specific = products.filter(
      (product) =>
        product.fitmentType !== "UNIVERSAL" &&
        (product.compatibleModels.some((item) => item.toLowerCase().includes(needle)) ||
          product.compatibleEquipment.some((item) => item.toLowerCase().includes(needle)))
    ).length;
    counts[model.slug] = specific + universalCount;
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-brand">{e.badge}</p>
        <h1 className="mt-1 text-4xl font-black">{e.main_heading}</h1>
        <p className="mt-3 max-w-3xl text-steel">{e.main_sub}</p>
        <div className="mt-8">
          <EnginePicker
            models={models}
            counts={counts}
            strings={{
              used_in: e.used_in,
              view_parts: e.view_parts,
              search_placeholder: e.search_placeholder,
              all_equipment: e.all_equipment,
              result_count: e.result_count,
              no_results: e.no_results,
              no_results_sub: e.no_results_sub,
              parts_count: e.parts_count
            }}
          />
        </div>
      </div>
    </main>
  );
}
