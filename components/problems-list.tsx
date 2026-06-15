"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Stethoscope, X } from "lucide-react";
import type { Problem } from "@/data/problems";

type Strings = {
  search_placeholder: string;
  all: string;
  difficulty_easy: string;
  difficulty_moderate: string;
  difficulty_advanced: string;
  common_causes: string;
  diagnose: string;
  result_count: string;
  no_results: string;
  no_results_sub: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s\-_./]+/g, "");
}

export function ProblemsList({ problems, strings }: { problems: Problem[]; strings: Strings }) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const difficultyChips = [
    ["", strings.all],
    ["easy", strings.difficulty_easy],
    ["moderate", strings.difficulty_moderate],
    ["advanced", strings.difficulty_advanced]
  ] as const;

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return problems.filter((problem) => {
      if (difficulty && problem.difficulty !== difficulty) return false;
      if (!needle) return true;
      const haystack = normalize([problem.title, problem.description, ...problem.commonCauses].join(" "));
      return haystack.includes(needle);
    });
  }, [problems, query, difficulty]);

  const count = strings.result_count.replace("{n}", String(filtered.length));

  return (
    <div>
      <div className="grid gap-3 border border-line bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[1fr_auto] items-center border border-line">
          <div className="flex items-center gap-2 px-3">
            <Search size={18} className="shrink-0 text-steel" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={strings.search_placeholder}
              className="h-11 w-full min-w-0 font-bold outline-none"
              autoComplete="off"
            />
          </div>
          {query && (
            <button type="button" onClick={() => setQuery("")} className="grid h-11 w-11 place-items-center text-steel hover:text-ink" aria-label="Clear">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {difficultyChips.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              className={`px-3 py-1.5 text-sm font-black transition ${
                difficulty === value ? "bg-navy text-white" : "border border-line bg-white text-graphite hover:border-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm font-black uppercase text-steel">{count}</p>

      {filtered.length === 0 ? (
        <div className="mt-4 border border-line bg-white p-8 text-center">
          <p className="text-lg font-black">{strings.no_results.replace("{q}", query)}</p>
          <p className="mt-2 text-steel">{strings.no_results_sub}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((problem) => (
            <Link
              key={problem.slug}
              href={`/problems/${problem.slug}`}
              className="group border border-line bg-white p-6 shadow-sm hover:border-navy"
            >
              <Stethoscope className="mb-4 text-navy" size={28} />
              <h2 className="text-lg font-black leading-snug">{problem.title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{problem.description}</p>
              <p className="mt-4 text-sm font-bold text-steel">
                {strings.common_causes} {problem.commonCauses.slice(0, 3).join(" · ")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-black text-navy">
                {strings.diagnose} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
