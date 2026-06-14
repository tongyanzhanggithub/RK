"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, LANG_COOKIE, normalizeLang, translate, type Lang } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = DEFAULT_LANG
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    const value = normalizeLang(next);
    setLangState(value);
    try {
      window.localStorage.setItem(LANG_COOKIE, value);
    } catch {
      /* ignore */
    }
    document.cookie = `${LANG_COOKIE}=${value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: (key: string) => translate(lang, key) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return context;
}
