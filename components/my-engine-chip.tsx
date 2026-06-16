"use client";

import Link from "next/link";
import { Cog, X } from "lucide-react";
import { useMyEngine } from "@/components/engine-provider";

export function MyEngineChip() {
  const { garage, activeEngine, setActiveEngine, removeEngine } = useMyEngine();
  if (garage.length === 0) return null;

  return (
    <span className="my-1.5 ml-auto inline-flex shrink-0 items-center gap-2 self-center">
      <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-steel">
        <Cog size={13} /> My garage
      </span>
      {garage.map((engine) => {
        const isActive = engine.toLowerCase() === activeEngine?.toLowerCase();
        return (
          <span
            key={engine}
            className={`inline-flex items-center border pl-2 text-sm font-black ${
              isActive ? "border-navy bg-navy text-white" : "border-navy/30 bg-white text-navy"
            }`}
          >
            <Link
              href={`/products?model=${encodeURIComponent(engine)}`}
              onClick={() => setActiveEngine(engine)}
              className="py-1 hover:underline"
            >
              {engine}
            </Link>
            <button
              type="button"
              onClick={() => removeEngine(engine)}
              aria-label={`Remove ${engine} from garage`}
              className={`px-1.5 py-1.5 ${isActive ? "text-white/80 hover:text-white" : "text-steel hover:text-ink"}`}
            >
              <X size={13} />
            </button>
          </span>
        );
      })}
    </span>
  );
}
