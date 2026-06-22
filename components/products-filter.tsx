"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type ProductsFilterProps = {
  categories: string[];
  equipmentOptions: string[];
  problems: string[];
};

// "model" is owned by the prominent FitmentBar, not this filter row.
const FILTER_KEYS = ["q", "category", "equipment", "problem", "sort"] as const;

export function ProductsFilter({ categories, equipmentOptions, problems }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const p = dict.products;
  // On mobile the filter row is long, so collapse it behind a toggle. Always
  // expanded from `sm` up.
  const [open, setOpen] = useState(false);

  function currentValue(key: string) {
    return searchParams.get(key) || "";
  }

  function apply(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(params.size > 0 ? `/products?${params.toString()}` : "/products");
  }

  const activeFilters = FILTER_KEYS.map((key) => [key, currentValue(key)] as const).filter(([, value]) => value);

  return (
    <div className="border border-line bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center justify-between gap-2 border border-line bg-panel px-3 py-2 font-black text-navy sm:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} /> {p.filters_label}
          {activeFilters.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs text-white">
              {activeFilters.length}
            </span>
          )}
        </span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`${open ? "grid" : "hidden"} gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`}>
        <input
          defaultValue={currentValue("q")}
          onKeyDown={(event) => {
            if (event.key === "Enter") apply("q", event.currentTarget.value.trim());
          }}
          onBlur={(event) => {
            if (event.currentTarget.value.trim() !== currentValue("q")) {
              apply("q", event.currentTarget.value.trim());
            }
          }}
          className="border border-line px-3 py-2 outline-none focus:border-navy"
          placeholder={p.search_ph}
        />
        <FilterSelect label={p.filter_categories} value={currentValue("category")} options={categories} onChange={(value) => apply("category", value)} />
        <FilterSelect label={p.filter_equipment} value={currentValue("equipment")} options={equipmentOptions} onChange={(value) => apply("equipment", value)} />
        <FilterSelect label={p.filter_problems} value={currentValue("problem")} options={problems} onChange={(value) => apply("problem", value)} />
        <select
          value={currentValue("sort")}
          onChange={(event) => apply("sort", event.target.value)}
          className="border border-line bg-white px-3 py-2 outline-none focus:border-navy"
        >
          <option value="">{p.sort_default}</option>
          <option value="price-asc">{p.sort_price_asc}</option>
          <option value="price-desc">{p.sort_price_desc}</option>
          <option value="name-asc">{p.sort_name_asc}</option>
        </select>
      </div>
      <div className={`mt-3 ${open ? "block" : "hidden"} sm:block`}>
        <button
          type="button"
          onClick={() => apply("guaranteed", currentValue("guaranteed") === "1" ? "" : "1")}
          aria-pressed={currentValue("guaranteed") === "1"}
          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-black ${
            currentValue("guaranteed") === "1"
              ? "border-green-700 bg-green-600 text-white"
              : "border-line bg-white text-steel hover:border-navy hover:text-navy"
          }`}
        >
          <ShieldCheck size={16} /> {p.guaranteed_only}
        </button>
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="text-xs font-black uppercase text-steel">{p.active_filters}</span>
          {activeFilters.map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => apply(key, "")}
              className="inline-flex items-center gap-1 bg-navy/10 px-2 py-1 text-xs font-black text-navy hover:bg-navy/20"
            >
              {value} <X size={12} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="text-xs font-black text-steel underline hover:text-ink"
          >
            {p.clear_all}
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="border border-line bg-white px-3 py-2 outline-none focus:border-navy"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
