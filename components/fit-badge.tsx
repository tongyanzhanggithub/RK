"use client";

import Link from "next/link";
import { CheckCircle2, CircleSlash, Globe, ShieldCheck } from "lucide-react";
import { engineMatchesModels, matchInGarage, useMyEngine } from "@/components/engine-provider";

type FitBadgeProps = {
  fitmentType?: "SPECIFIC" | "UNIVERSAL";
  fitmentNote?: string;
  compatibleModels: string[];
  notCompatibleWith?: string[];
  /** Active fitment filter on the listing — shows a confirmed-fit badge even before a garage is saved. */
  activeModel?: string;
  /** Part is enrolled in Guaranteed Fit — a confirmed match shows the guarantee badge. */
  guaranteed?: boolean;
};

function GuaranteedBadge({ model }: { model: string }) {
  return (
    <Link
      href="/guaranteed-fit"
      title="Guaranteed Fit — free 30-day returns if it doesn't fit"
      className="inline-flex items-center gap-1.5 border border-green-700 bg-green-600 px-2.5 py-1.5 text-sm font-black text-white hover:bg-green-700"
    >
      <ShieldCheck size={16} className="shrink-0" /> Guaranteed Fit: {model}
    </Link>
  );
}

export function FitBadge({ fitmentType, fitmentNote, compatibleModels, notCompatibleWith, activeModel, guaranteed }: FitBadgeProps) {
  const { garage } = useMyEngine();

  // Explicit incompatibility with an engine the buyer cares about — warn first.
  const blockedBy =
    (activeModel && notCompatibleWith && engineMatchesModels(activeModel, notCompatibleWith) && activeModel) ||
    (notCompatibleWith ? matchInGarage(garage, notCompatibleWith) : null);
  if (blockedBy) {
    return (
      <p className="inline-flex items-center gap-1.5 border border-red-300 bg-red-50 px-2 py-1 text-xs font-black text-red-700">
        <CircleSlash size={14} className="shrink-0" /> Not for your {blockedBy}
      </p>
    );
  }

  if (fitmentType === "UNIVERSAL") {
    return (
      <p className="inline-flex items-start gap-1.5 bg-navy/10 px-2 py-1 text-xs font-black text-navy">
        <Globe size={14} className="mt-0.5 shrink-0" />
        <span>Universal · {fitmentNote || "fits all small engines"}</span>
      </p>
    );
  }

  // Confirmed against the active listing filter — most prominent.
  if (activeModel && engineMatchesModels(activeModel, compatibleModels)) {
    if (guaranteed) return <GuaranteedBadge model={activeModel} />;
    return (
      <p className="inline-flex items-center gap-1.5 border border-green-600 bg-green-100 px-2.5 py-1.5 text-sm font-black text-green-800">
        <CheckCircle2 size={16} className="shrink-0" /> Confirmed fit: {activeModel}
      </p>
    );
  }

  const fitsEngine = matchInGarage(garage, compatibleModels);
  if (fitsEngine) {
    if (guaranteed) return <GuaranteedBadge model={fitsEngine} />;
    return (
      <p className="inline-flex items-center gap-1.5 bg-green-100 px-2 py-1 text-xs font-black text-green-800">
        <CheckCircle2 size={14} className="shrink-0" /> Fits your {fitsEngine}
      </p>
    );
  }

  return null;
}
