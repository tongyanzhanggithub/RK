"use client";

import { Globe2 } from "lucide-react";
import { useRegion } from "@/components/region-provider";
import { COUNTRIES } from "@/lib/region";

export function RegionSwitcher({ className = "" }: { className?: string }) {
  const { country, setCountry } = useRegion();

  return (
    <label className={`inline-flex items-center gap-1.5 border border-line bg-white px-2 ${className}`} title="Ship-to country / currency">
      <Globe2 size={15} className="shrink-0 text-navy" />
      <select
        value={country.code}
        onChange={(event) => setCountry(event.target.value)}
        aria-label="Ship-to country and currency"
        className="max-w-[150px] truncate bg-white py-2 text-sm font-bold text-ink outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code} className="text-ink">
            {c.name}{c.currency !== "USD" ? ` · ${c.currency}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
