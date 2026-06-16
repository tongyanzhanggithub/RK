"use client";

import { useMemo, useState } from "react";
import { models } from "@/data/models";

// Local tolerant matcher (kept here so the client bundle doesn't pull in the
// full product catalog from lib/fitment).
function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchCanonicalName(freeText: string): string | null {
  const needle = normalize(freeText);
  if (!needle) return null;
  let best: string | null = null;
  for (const engine of models) {
    const name = normalize(engine.name);
    if (needle.includes(name) || name.includes(needle)) {
      if (!best || normalize(best).length < name.length) best = engine.name;
    }
  }
  return best;
}

/**
 * Controlled-vocabulary fitment picker (eBay ACES idea). Engines are chosen
 * from the canonical list via checkboxes; anything that isn't on the list goes
 * in a free-text box. Both are merged into the hidden `compatibleModelsText`
 * field so the existing save action works unchanged.
 */
export function FitmentModelPicker({ defaultModels }: { defaultModels: string[] }) {
  const initial = useMemo(() => {
    const checked = new Set<string>();
    const custom: string[] = [];
    for (const raw of defaultModels) {
      const hit = matchCanonicalName(raw);
      if (hit) checked.add(hit);
      else custom.push(raw);
    }
    return { checked, custom: custom.join("\n") };
  }, [defaultModels]);

  const [checked, setChecked] = useState<Set<string>>(initial.checked);
  const [custom, setCustom] = useState(initial.custom);

  const combined = [
    ...models.filter((engine) => checked.has(engine.name)).map((engine) => engine.name),
    ...custom
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean)
  ].join("\n");

  function toggle(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="grid gap-3">
      <div className="text-sm font-bold">
        兼容型号
        <span className="ml-2 font-normal text-steel">从规范清单勾选，搜索与适配判断都靠它（杜绝拼写不一致）</span>
      </div>

      <div className="grid grid-cols-2 gap-2 border border-line bg-panel p-3 sm:grid-cols-3">
        {models.map((engine) => (
          <label key={engine.slug} className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={checked.has(engine.name)}
              onChange={() => toggle(engine.name)}
              className="h-4 w-4"
            />
            {engine.name}
          </label>
        ))}
      </div>

      <label className="grid gap-2 text-sm font-bold">
        其他型号（不在清单中，可选）
        <textarea
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          rows={2}
          placeholder="每行一个，例如某个尚未加入清单的型号"
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
        <span className="text-xs font-normal text-steel">
          这里填的型号会在「适配健康度」里标为「需清洗」——建议尽量用上方清单。
        </span>
      </label>

      {/* The save action reads this combined value, unchanged. */}
      <input type="hidden" name="compatibleModelsText" value={combined} />
    </div>
  );
}
