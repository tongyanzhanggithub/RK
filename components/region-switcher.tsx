"use client";

import { Globe2 } from "lucide-react";
import { useRegion } from "@/components/region-provider";
import { useLanguage } from "@/components/language-provider";
import { COUNTRIES } from "@/lib/region";

export function RegionSwitcher({ className = "" }: { className?: string }) {
  const { country, setCountry } = useRegion();
  const t = useLanguage().dict.ui;

  return (
    <label className={`inline-flex items-center gap-1.5 border border-line bg-white px-2 ${className}`} title={t.ship_to_title}>
      <Globe2 size={15} className="shrink-0 text-navy" />
      <span className="shrink-0 whitespace-nowrap text-xs font-bold text-steel">{t.ship_to_prefix}</span>
      <select
        value={country.code}
        onChange={(event) => setCountry(event.target.value)}
        aria-label={t.ship_to_label}
        className="max-w-[150px] truncate bg-white py-2 text-sm font-bold text-ink outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="text-ink">
            {c.name} · {c.currency}
          </option>
        ))}
      </select>
    </label>
  );
}
