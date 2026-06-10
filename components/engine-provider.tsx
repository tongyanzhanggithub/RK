"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type EngineContextValue = {
  myEngine: string | null;
  setMyEngine: (model: string) => void;
  clearMyEngine: () => void;
};

const ENGINE_STORAGE_KEY = "repairkit-my-engine-v1";
const EngineContext = createContext<EngineContextValue | null>(null);

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const [myEngine, setEngine] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(ENGINE_STORAGE_KEY);
    if (stored) setEngine(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (myEngine) {
      window.localStorage.setItem(ENGINE_STORAGE_KEY, myEngine);
    } else {
      window.localStorage.removeItem(ENGINE_STORAGE_KEY);
    }
  }, [myEngine, ready]);

  const value = useMemo<EngineContextValue>(
    () => ({
      myEngine,
      setMyEngine(model: string) {
        setEngine(model.trim() || null);
      },
      clearMyEngine() {
        setEngine(null);
      }
    }),
    [myEngine]
  );

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useMyEngine() {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error("useMyEngine must be used inside EngineProvider");
  }
  return context;
}

export function engineMatchesModels(engine: string, compatibleModels: string[]) {
  const needle = engine.trim().toLowerCase();
  if (!needle) return false;
  return compatibleModels.some((model) => model.toLowerCase().includes(needle));
}
