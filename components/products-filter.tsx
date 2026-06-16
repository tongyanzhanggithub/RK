"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          placeholder="Search kits..."
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
      <div className="mt-3">
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
