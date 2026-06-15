"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cog, Search, X } from "lucide-react";
import type { EngineModel } from "@/data/models";

type PickerStrings = {
  used_in: string;
  view_parts: string;
  search_placeholder: string;
  all_equipment: string;
  result_count: string;
  no_results: string;
  no_results_sub: string;
};

// Tolerant match: "gx 160" / "GX-160" / "168" all hit the right model.
function normalize(value: string) {
  return value.toLowerCase().replace(/[\s\-_./]+/g, "");
}

export function EnginePicker({ models, strings }: { models: EngineModel[]; strings: PickerStrings }) {
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("");

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const model of models) {
      for (const item of model.commonEquipment) set.add(item);
    }
    return [...set].sort();
  }, [models]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return models.filter((model) => {
      if (equipment && !model.commonEquipment.includes(equipment)) return false;
      if (!needle) return true;
      const haystack = normalize(
        [model.name, model.description, ...model.commonEquipment, ...model.commonProblems].join(" ")
      );
      return haystack.includes(needle);
    });
  }, [models, query, equipment]);

  const count = strings.result_count.replace("{n}", String(filtered.length));

  return (
    <div>
      <div className="sticky top-[120px] z-10 grid gap-3 border border-line bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[1fr_auto] items-center border border-line">
          <div className="flex items-center gap-2 px-3">
            <Search size={18} className="shrink-0 text-steel" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={strings.search_placeholder}
              className="h-11 w-full min-w-0 font-bold outline-none"
              autoComplete="off"
            />
          </div>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid h-11 w-11 place-items-center text-steel hover:text-ink"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={equipment === ""} onClick={() => setEquipment("")} label={strings.all_equipment} />
          {equipmentOptions.map((item) => (
            <FilterChip key={item} active={equipment === item} onClick={() => setEquipment(item)} label={item} />
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm font-black uppercase text-steel">{count}</p>

      {filtered.length === 0 ? (
        <div className="mt-4 border border-line bg-white p-8 text-center">
          <p className="text-lg font-black">{strings.no_results.replace("{q}", query)}</p>
          <p className="mt-2 text-steel">{strings.no_results_sub}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((model) => (
            <Link
              key={model.slug}
              href={`/engines/${model.slug}`}
              className="group border border-line bg-white p-6 shadow-sm hover:border-navy"
            >
              <Cog className="mb-4 text-navy" size={28} />
              <h2 className="text-lg font-black leading-snug">{model.name}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{model.description}</p>
              <p className="mt-3 text-sm font-bold text-steel">
                {strings.used_in} {model.commonEquipment.slice(0, 3).join(" · ")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                {strings.view_parts} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-black transition ${
        active ? "bg-navy text-white" : "border border-line bg-white text-graphite hover:border-navy"
      }`}
    >
      {label}
    </button>
  );
}
