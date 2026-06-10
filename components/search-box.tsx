"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Cog, Package, Search, Stethoscope } from "lucide-react";

type Suggestion = {
  type: "engine" | "problem" | "product";
  label: string;
  hint?: string;
  href: string;
};

const GROUP_LABELS: Record<Suggestion["type"], string> = {
  engine: "Engines",
  problem: "Troubleshooting",
  product: "Products"
};

const GROUP_ICONS: Record<Suggestion["type"], typeof Cog> = {
  engine: Cog,
  problem: Stethoscope,
  product: Package
};

export function SearchBox() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
        if (!response.ok) return;
        const data = (await response.json()) as { suggestions: Suggestion[] };
        setSuggestions(data.suggestions);
        setOpen(data.suggestions.length > 0);
      } catch {
        // network hiccup — keep the previous suggestions
      }
    }, 180);
  }

  function submit() {
    setOpen(false);
    const value = query.trim();
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  }

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const groups = (["engine", "problem", "product"] as const)
    .map((type) => ({ type, items: suggestions.filter((item) => item.type === type) }))
    .filter((group) => group.items.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="grid grid-cols-[1fr_auto] border border-line bg-white">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
            if (event.key === "Escape") setOpen(false);
          }}
          className="min-w-0 px-4 py-3 outline-none"
          placeholder="Search 168F, GX160, water pump seal, recoil starter..."
        />
        <button className="inline-flex items-center gap-2 bg-navy px-4 font-bold text-white" type="button" onClick={submit}>
          <Search size={18} /> Search
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-line bg-white shadow-soft">
          {groups.map((group) => (
            <div key={group.type} className="border-b border-line last:border-b-0">
              <p className="bg-panel px-4 py-1.5 text-xs font-black uppercase text-steel">{GROUP_LABELS[group.type]}</p>
              {group.items.map((item) => {
                const Icon = GROUP_ICONS[item.type];
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-panel"
                  >
                    <Icon size={16} className="shrink-0 text-navy" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{item.label}</span>
                      {item.hint && <span className="block truncate text-xs text-steel">{item.hint}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          <button
            type="button"
            onClick={submit}
            className="w-full px-4 py-2.5 text-left text-sm font-black text-navy hover:bg-panel"
          >
            See all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
