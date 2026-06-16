"use client";

import { useRegion } from "@/components/region-provider";

/**
 * Region-aware price. Shows an approximate local-currency amount when the visitor's
 * country uses a non-USD currency; the authoritative USD amount is shown as a sub-line
 * when `showUsd` is set (orders are always charged in USD via Stripe).
 */
export function Price({
  cents,
  className = "",
  showUsd = false
}: {
  cents: number;
  className?: string;
  showUsd?: boolean;
}) {
  const { display } = useRegion();
  const d = display(cents);
  return (
    <span className={className}>
      {d.main}
      {showUsd && d.sub && <span className="ml-1 text-xs font-bold text-steel">({d.sub} billed)</span>}
    </span>
  );
}
