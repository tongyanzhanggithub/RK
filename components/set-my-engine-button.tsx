"use client";

import { CheckCircle2, Cog } from "lucide-react";
import { useMyEngine } from "@/components/engine-provider";

export function SetMyEngineButton({ modelName }: { modelName: string }) {
  const { myEngine, setMyEngine } = useMyEngine();
  const isActive = myEngine?.toLowerCase() === modelName.toLowerCase();

  if (isActive) {
    return (
      <span className="inline-flex h-11 items-center gap-2 bg-green-100 px-4 font-black text-green-800">
        <CheckCircle2 size={17} /> This is my engine
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setMyEngine(modelName)}
      className="inline-flex h-11 items-center gap-2 border border-navy px-4 font-black text-navy hover:bg-panel"
    >
      <Cog size={17} /> Set as my engine
    </button>
  );
}
