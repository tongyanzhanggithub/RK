"use client";

import { CheckCircle2, Globe } from "lucide-react";
import { matchInGarage, useMyEngine } from "@/components/engine-provider";

type FitBadgeProps = {
  fitmentType?: "SPECIFIC" | "UNIVERSAL";
  fitmentNote?: string;
  compatibleModels: string[];
};

export function FitBadge({ fitmentType, fitmentNote, compatibleModels }: FitBadgeProps) {
  const { garage } = useMyEngine();

  if (fitmentType === "UNIVERSAL") {
    return (
      <p className="inline-flex items-start gap-1.5 bg-navy/10 px-2 py-1 text-xs font-black text-navy">
        <Globe size={14} className="mt-0.5 shrink-0" />
        <span>Universal · {fitmentNote || "fits all small engines"}</span>
      </p>
    );
  }

  const fitsEngine = matchInGarage(garage, compatibleModels);
  if (fitsEngine) {
    return (
      <p className="inline-flex items-center gap-1.5 bg-green-100 px-2 py-1 text-xs font-black text-green-800">
        <CheckCircle2 size={14} className="shrink-0" /> Fits your {fitsEngine}
      </p>
    );
  }

  return null;
}
