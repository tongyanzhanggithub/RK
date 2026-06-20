"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMyEngine } from "@/components/engine-provider";
import { equipment } from "@/data/equipment";
import { models } from "@/data/models";
import { problems } from "@/data/problems";

export function PartFinder({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { setMyEngine } = useMyEngine();
  const { dict } = useLanguage();
  const f = dict.finder;
  const [equipmentName, setEquipmentName] = useState("");
  const [modelName, setModelName] = useState("");
  const [problemTitle, setProblemTitle] = useState("");

  const modelOptions = useMemo(() => {
    if (!equipmentName) return models;
    const selected = equipment.find((item) => item.name === equipmentName);
    if (!selected) return models;
    return models.filter((model) =>
      selected.commonModels.some((name) => name.toLowerCase() === model.name.toLowerCase())
    );
  }, [equipmentName]);

  function findParts() {
    if (modelName) setMyEngine(modelName);
    const params = new URLSearchParams();
    if (equipmentName) params.set("equipment", equipmentName);
    if (modelName) params.set("model", modelName);
    if (problemTitle) params.set("problem", problemTitle);
    router.push(params.size > 0 ? `/products?${params.toString()}` : "/products");
  }

  return (
    <div className={compact ? "" : "border border-line bg-white p-5 shadow-soft"}>
      {!compact && (
        <div className="mb-4">
          <h2 className="text-xl font-black">{f.heading}</h2>
          <p className="mt-1 text-sm font-bold text-steel">{f.subtext}</p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="grid gap-1 text-xs font-black uppercase text-steel">
          {f.step1}
          <select
            value={equipmentName}
            onChange={(event) => {
              setEquipmentName(event.target.value);
              setModelName("");
            }}
            className="h-11 border border-line bg-white px-3 text-sm font-bold normal-case text-ink outline-none focus:border-navy"
          >
            <option value="">{f.any_equipment}</option>
            {equipment.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-black uppercase text-steel">
          {f.step2}
          <select
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
            className="h-11 border border-line bg-white px-3 text-sm font-bold normal-case text-ink outline-none focus:border-navy"
          >
            <option value="">{f.not_sure}</option>
            {modelOptions.map((model) => (
              <option key={model.slug} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-black uppercase text-steel">
          {f.step3}
          <select
            value={problemTitle}
            onChange={(event) => setProblemTitle(event.target.value)}
            className="h-11 border border-line bg-white px-3 text-sm font-bold normal-case text-ink outline-none focus:border-navy"
          >
            <option value="">{f.any_problem}</option>
            {problems.map((problem) => (
              <option key={problem.slug} value={problem.title}>
                {problem.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={findParts}
          className="inline-flex h-11 items-center justify-center gap-2 self-end bg-brand px-5 font-black text-white hover:bg-[#1c54bf]"
        >
          <Search size={17} /> {f.find_btn}
        </button>
      </div>
    </div>
  );
}
