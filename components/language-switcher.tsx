"use client";

import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";

const LOCALES: [Locale, string][] = [
  ["en", "EN"],
  ["zh", "中"],
  ["ar", "ع"],
  ["ru", "RU"]
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex border border-white/30 text-xs font-black">
      {LOCALES.map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2 py-1 ${locale === code ? "bg-brand text-white" : "text-white hover:bg-white/10"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
