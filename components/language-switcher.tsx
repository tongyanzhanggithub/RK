"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex border border-white/30 text-xs font-black">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-1 ${locale === "en" ? "bg-safety text-ink" : "text-white hover:bg-white/10"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={`px-2 py-1 ${locale === "zh" ? "bg-safety text-ink" : "text-white hover:bg-white/10"}`}
      >
        中
      </button>
    </div>
  );
}
