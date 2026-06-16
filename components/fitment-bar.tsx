"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Car, CheckCircle2, Cog, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMyEngine } from "@/components/engine-provider";
import { models } from "@/data/models";

export function FitmentBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const p = dict.products;
  const { garage, addEngine } = useMyEngine();

  const activeModel = searchParams.get("model") || "";
  const fitsActive = Boolean(searchParams.get("fits"));

  function apply(model: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fits");
    if (model) {
      params.set("model", model);
      addEngine(model); // remember it in the garage, eBay-style
    } else {
      params.delete("model");
    }
    router.push(params.size > 0 ? `/products?${params.toString()}` : "/products");
  }

  function applyGarage() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("model");
    params.set("fits", garage.join(";"));
    router.push(`/products?${params.toString()}`);
  }

  function clearFits() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fits");
    router.push(params.size > 0 ? `/products?${params.toString()}` : "/products");
  }

  // Garage-wide active state.
  if (fitsActive) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-green-600 bg-green-50 p-4">
        <p className="inline-flex flex-wrap items-center gap-2 text-lg font-black text-green-800">
          <CheckCircle2 size={22} /> {p.fitment_showing_garage}
          {garage.map((engine) => (
            <span key={engine} className="bg-green-600 px-2 py-0.5 text-sm text-white">{engine}</span>
          ))}
        </p>
        <button
          type="button"
          onClick={clearFits}
          className="inline-flex h-10 items-center gap-1 border border-green-700 bg-white px-3 text-sm font-black text-green-800 hover:bg-green-100"
        >
          <X size={15} /> {p.fitment_show_all}
        </button>
      </div>
    );
  }

  // Active state: clearly show "showing parts that fit X".
  if (activeModel) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-green-600 bg-green-50 p-4">
        <p className="inline-flex items-center gap-2 text-lg font-black text-green-800">
          <CheckCircle2 size={22} /> {p.fitment_showing} <span className="bg-green-600 px-2 py-0.5 text-white">{activeModel}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeModel}
            onChange={(event) => apply(event.target.value)}
            className="h-10 border border-green-600 bg-white px-3 text-sm font-bold outline-none"
            aria-label={p.fitment_select}
          >
            {!models.some((m) => m.name === activeModel) && <option value={activeModel}>{activeModel}</option>}
            {models.map((model) => (
              <option key={model.slug} value={model.name}>{model.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => apply("")}
            className="inline-flex h-10 items-center gap-1 border border-green-700 bg-white px-3 text-sm font-black text-green-800 hover:bg-green-100"
          >
            <X size={15} /> {p.fitment_show_all}
          </button>
        </div>
      </div>
    );
  }

  // Idle state: prominent "select your engine" panel.
  return (
    <div className="border-2 border-navy bg-navy/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-navy">
            <Car size={22} /> {p.fitment_title}
          </h2>
          <p className="mt-1 text-sm font-bold text-steel">{p.fitment_sub}</p>
        </div>
        <select
          defaultValue=""
          onChange={(event) => event.target.value && apply(event.target.value)}
          className="h-12 min-w-64 border border-navy bg-white px-3 font-bold text-ink outline-none focus:border-navy"
          aria-label={p.fitment_select}
        >
          <option value="" disabled>{p.fitment_select}</option>
          {models.map((model) => (
            <option key={model.slug} value={model.name}>{model.name}</option>
          ))}
        </select>
      </div>

      {garage.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy/15 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-steel">
            <Cog size={13} /> {p.fitment_garage}
          </span>
          {garage.map((engine) => (
            <button
              key={engine}
              type="button"
              onClick={() => apply(engine)}
              className="border border-navy bg-white px-3 py-1.5 text-sm font-black text-navy hover:bg-navy hover:text-white"
            >
              {engine}
            </button>
          ))}
          {garage.length >= 2 && (
            <button
              type="button"
              onClick={applyGarage}
              className="inline-flex items-center gap-1 border border-green-700 bg-green-600 px-3 py-1.5 text-sm font-black text-white hover:bg-green-700"
            >
              <CheckCircle2 size={14} /> {p.fitment_my_garage}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
