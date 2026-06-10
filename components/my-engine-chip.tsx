"use client";

import Link from "next/link";
import { Cog, X } from "lucide-react";
import { useMyEngine } from "@/components/engine-provider";

export function MyEngineChip() {
  const { myEngine, clearMyEngine } = useMyEngine();
  if (!myEngine) return null;

  return (
    <span className="my-1.5 ml-auto inline-flex shrink-0 items-center gap-1 self-center border border-navy/30 bg-white pl-3 text-sm font-black text-navy">
      <Cog size={14} />
      <Link href={`/products?model=${encodeURIComponent(myEngine)}`} className="py-1 hover:underline">
        My engine: {myEngine}
      </Link>
      <button
        type="button"
        onClick={clearMyEngine}
        aria-label="Clear my engine"
        className="px-2 py-1.5 text-steel hover:text-ink"
      >
        <X size={14} />
      </button>
    </span>
  );
}
