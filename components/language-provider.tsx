"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getDict, LOCALE_COOKIE, RTL_LOCALES, type Dict, type Locale } from "@/lib/i18n";

const SUPPORTED: Locale[] = ["en", "zh", "ar", "ru"];

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

export function LanguageProvider({
  children,
  initialLocale = "en"
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // Seed from the server (cookie) so SSR renders the right language with no flash.
  const [locale, setLocaleState] = useState<Locale>(
    SUPPORTED.includes(initialLocale) ? initialLocale : "en"
  );

  // Keep <html lang/dir> in sync so Arabic switches to RTL without a reload.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

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
