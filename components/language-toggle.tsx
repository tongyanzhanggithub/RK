"use client";

import { useI18n } from "@/components/language-provider";
import type { Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "zh", label: "中文" }
];

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex shrink-0 items-center border border-line bg-white ${className}`}
    >
      {OPTIONS.map((option) => {
        const active = lang === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLang(option.value)}
            aria-pressed={active}
            className={`px-3 py-2 text-sm font-black transition-colors ${
              active ? "bg-navy text-white" : "text-graphite hover:bg-panel"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
