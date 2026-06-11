"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getDict, LOCALE_COOKIE, type Dict, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  dict: Dict;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  dict: getDict("en"),
  setLocale: () => {}
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_COOKIE) as Locale | null;
    if (stored === "zh" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(LOCALE_COOKIE, next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000`;
  }

  return (
    <LanguageContext.Provider value={{ locale, dict: getDict(locale), setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
