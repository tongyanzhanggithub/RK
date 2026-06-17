"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  DEFAULT_COUNTRY,
  REGION_COOKIE,
  formatLocal,
  isChargeableCurrency,
  isUsd,
  resolveCountry,
  type Country
} from "@/lib/region";
import { formatMoney } from "@/lib/format";

type PriceDisplay = { main: string; sub?: string };

type RegionContextValue = {
  country: Country;
  setCountry: (code: string) => void;
  isUsd: boolean;
  /** True when this country is actually charged in its own currency (multi-currency on). */
  charged: boolean;
  /** Local-currency string. Exact when charged in local; "≈ ..." when only a display hint. */
  local: (cents: number) => string;
  /** Main + optional USD sub-line for price blocks. */
  display: (cents: number) => PriceDisplay;
};

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({
  children,
  initialCountryCode,
  chargeEnabled = false
}: {
  children: React.ReactNode;
  initialCountryCode?: string;
  chargeEnabled?: boolean;
}) {
  const [country, setCountryState] = useState<Country>(resolveCountry(initialCountryCode) || DEFAULT_COUNTRY);

  const setCountry = useCallback((code: string) => {
    const next = resolveCountry(code);
    setCountryState(next);
    document.cookie = `${REGION_COOKIE}=${next.code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, []);

  const value = useMemo<RegionContextValue>(() => {
    const usd = isUsd(country);
    // Charged in local currency only when multi-currency is enabled AND the
    // currency is chargeable; otherwise the local figure is just an estimate.
    const charged = chargeEnabled && !usd && isChargeableCurrency(country.currency);
    const exact = usd || charged; // no "≈", no USD sub-line

    return {
      country,
      setCountry,
      isUsd: usd,
      charged,
      local: (cents: number) => (exact ? formatLocal(cents, country) : `≈ ${formatLocal(cents, country)}`),
      display: (cents: number) =>
        exact
          ? { main: formatLocal(cents, country) }
          : { main: `≈ ${formatLocal(cents, country)}`, sub: formatMoney(cents, "usd") }
    };
  }, [country, setCountry, chargeEnabled]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used inside RegionProvider");
  return ctx;
}
