"use client";

import { CheckCircle2, Cog } from "lucide-react";
import { useMyEngine } from "@/components/engine-provider";

export function SetMyEngineButton({ modelName }: { modelName: string }) {
  const { hasEngine, addEngine, removeEngine } = useMyEngine();
  const inGarage = hasEngine(modelName);

  if (inGarage) {
    return (
      <button
        type="button"
        onClick={() => removeEngine(modelName)}
        className="inline-flex h-11 items-center gap-2 bg-green-100 px-4 font-black text-green-800 hover:bg-green-200"
        title="Remove from my garage"
      >
        <CheckCircle2 size={17} /> In my garage
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addEngine(modelName)}
      className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel"
    >
      <Cog size={17} /> Add to my garage
    </button>
  );
}
