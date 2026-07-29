import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "@/content/site";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void };
const I18nContext = createContext<Ctx>({ locale: "pt", setLocale: () => {} });

const STORAGE_KEY = "assoc641.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with "pt" on SSR + first client render to avoid hydration mismatch,
  // then read from localStorage after mount.
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "en") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return <I18nContext.Provider value={{ locale, setLocale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}