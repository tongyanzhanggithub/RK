"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type ProductsFilterProps = {
  categories: string[];
  models: string[];
  equipmentOptions: string[];
  problems: string[];
};

const FILTER_KEYS = ["q", "category", "model", "equipment", "problem", "sort"] as const;

export function ProductsFilter({ categories, models, equipmentOptions, problems }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
        <FilterSelect label="All categories" value={currentValue("category")} options={categories} onChange={(value) => apply("category", value)} />
        <FilterSelect label="All models" value={currentValue("model")} options={models} onChange={(value) => apply("model", value)} />
        <FilterSelect label="All equipment" value={currentValue("equipment")} options={equipmentOptions} onChange={(value) => apply("equipment", value)} />
        <FilterSelect label="All problems" value={currentValue("problem")} options={problems} onChange={(value) => apply("problem", value)} />
        <select
          value={currentValue("sort")}
          onChange={(event) => apply("sort", event.target.value)}
          className="border border-line bg-white px-3 py-2 outline-none focus:border-navy"
        >
          <option value="">Sort: Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name-asc">Name: A → Z</option>
        </select>
      </div>
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="text-xs font-black uppercase text-steel">Active filters:</span>
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
            Clear all
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
