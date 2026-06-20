"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, RotateCcw, Stethoscope, Wrench } from "lucide-react";
import type { DiagnosticNode, DiagnosticResult } from "@/data/problems";

type Strings = {
  heading: string;
  intro: string;
  start: string;
  restart: string;
  back: string;
  result_cause: string;
  result_action: string;
  result_parts: string;
};

export function DiagnosticTree({
  tree,
  productNames,
  strings
}: {
  tree: DiagnosticNode;
  productNames: Record<string, string>;
  strings: Strings;
}) {
  const [started, setStarted] = useState(false);
  // Stack of nodes from root to current; last item is the active question.
  const [path, setPath] = useState<DiagnosticNode[]>([tree]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const current = path[path.length - 1];

  function choose(option: DiagnosticNode["options"][number]) {
    if (option.result) {
      setResult(option.result);
    } else if (option.next) {
      setPath((prev) => [...prev, option.next as DiagnosticNode]);
    }
  }

  function back() {
    if (result) {
      setResult(null);
      return;
    }
    setPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function restart() {
    setResult(null);
    setPath([tree]);
    setStarted(false);
  }

  return (
    <section className="border-2 border-navy bg-white p-6">
      <h2 className="inline-flex items-center gap-2 text-xl font-black">
        <Stethoscope className="text-navy" size={22} /> {strings.heading}
      </h2>

      {!started ? (
        <>
          <p className="mt-2 text-sm leading-6 text-steel">{strings.intro}</p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-4 inline-flex h-11 items-center gap-2 bg-brand px-5 font-black text-white hover:bg-[#1c54bf]"
          >
            {strings.start} <ArrowRight size={16} />
          </button>
        </>
      ) : result ? (
        <div className="mt-4">
          <div className="border border-line bg-panel p-4">
            <p className="text-xs font-black uppercase text-steel">{strings.result_cause}</p>
            <p className="mt-1 text-lg font-black">{result.cause}</p>
            <p className="mt-3 text-xs font-black uppercase text-steel">{strings.result_action}</p>
            <p className="mt-1 font-bold leading-6">{result.action}</p>
          </div>

          {result.productSlugs && result.productSlugs.length > 0 && (
            <div className="mt-4">
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-steel">
                <Wrench size={15} /> {strings.result_parts}
              </p>
              <div className="mt-2 grid gap-2">
                {result.productSlugs
                  .filter((slug) => productNames[slug])
                  .map((slug) => (
                    <Link
                      key={slug}
                      href={`/products/${slug}`}
                      className="group flex items-center justify-between gap-3 border border-line bg-white px-4 py-3 font-black hover:border-navy"
                    >
                      {productNames[slug]}
                      <ArrowRight size={16} className="text-navy transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 font-black text-navy hover:underline"
          >
            <RotateCcw size={16} /> {strings.restart}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-lg font-black leading-snug">{current.question}</p>
          {current.hint && <p className="mt-1 text-sm leading-6 text-steel">{current.hint}</p>}
          <div className="mt-4 grid gap-2">
            {current.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => choose(option)}
                className="group flex items-center justify-between gap-3 border border-line bg-white px-4 py-3 text-left font-bold hover:border-navy hover:bg-panel"
              >
                {option.label}
                <ArrowRight size={16} className="shrink-0 text-navy opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-4">
            {path.length > 1 && (
              <button type="button" onClick={back} className="inline-flex items-center gap-1 font-black text-steel hover:text-ink">
                <ChevronLeft size={16} /> {strings.back}
              </button>
            )}
            <button type="button" onClick={restart} className="inline-flex items-center gap-1 font-black text-steel hover:text-ink">
              <RotateCcw size={15} /> {strings.restart}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
