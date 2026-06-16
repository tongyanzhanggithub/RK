"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_COUNTRY, REGION_COOKIE, formatLocal, isUsd, resolveCountry, type Country } from "@/lib/region";
import { formatMoney } from "@/lib/format";

type PriceDisplay = { main: string; sub?: string };

type RegionContextValue = {
  country: Country;
  setCountry: (code: string) => void;
  isUsd: boolean;
  /** Approximate local-currency string, e.g. "≈ AED 91" (or "$24.90" for USD regions). */
  local: (cents: number) => string;
  /** Main + optional USD sub-line for price blocks. */
  display: (cents: number) => PriceDisplay;
};

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({
  children,
  initialCountryCode
}: {
  children: React.ReactNode;
  initialCountryCode?: string;
}) {
  const [country, setCountryState] = useState<Country>(resolveCountry(initialCountryCode) || DEFAULT_COUNTRY);

  const setCountry = useCallback((code: string) => {
    const next = resolveCountry(code);
    setCountryState(next);
    document.cookie = `${REGION_COOKIE}=${next.code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, []);

  const value = useMemo<RegionContextValue>(() => {
    const usd = isUsd(country);
    return {
      country,
      setCountry,
      isUsd: usd,
      local: (cents: number) => (usd ? formatLocal(cents, country) : `≈ ${formatLocal(cents, country)}`),
      display: (cents: number) =>
        usd
          ? { main: formatMoney(cents, "usd") }
          : { main: `≈ ${formatLocal(cents, country)}`, sub: formatMoney(cents, "usd") }
    };
  }, [country, setCountry]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used inside RegionProvider");
  return ctx;
}
