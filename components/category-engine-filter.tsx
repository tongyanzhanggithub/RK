"use client";

import { useRouter } from "next/navigation";
import { Cog } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { models } from "@/data/models";

// Engine × category browsing: pick an engine to see only parts in THIS category
// that fit it (jumps to the filtered products page with both filters applied).
export function CategoryEngineFilter({ categoryName }: { categoryName: string }) {
  const router = useRouter();
  const t = useLanguage().dict.products;

  return (
    <div className="flex flex-wrap items-center gap-3 border border-navy/30 bg-navy/5 p-4">
      <span className="inline-flex items-center gap-2 text-sm font-black text-navy">
        <Cog size={16} /> {t.fitment_title}
      </span>
      <select
        defaultValue=""
        onChange={(event) => {
          const model = event.target.value;
          const params = new URLSearchParams({ category: categoryName });
          if (model) params.set("model", model);
          router.push(`/products?${params.toString()}`);
        }}
        aria-label={t.fitment_select}
        className="h-11 min-w-[16rem] border border-line bg-white px-3 text-sm font-bold outline-none focus:border-navy"
      >
        <option value="">{t.fitment_select}</option>
        {models.map((m) => (
          <option key={m.slug} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
