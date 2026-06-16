"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type EngineContextValue = {
  /** All engines/machines the buyer has saved. */
  garage: string[];
  /** The currently focused engine (used by the single-engine fitment checker). */
  activeEngine: string | null;
  /** Backward-compatible alias for activeEngine. */
  myEngine: string | null;
  addEngine: (model: string) => void;
  removeEngine: (model: string) => void;
  setActiveEngine: (model: string) => void;
  /** Add the model to the garage and make it active. */
  setMyEngine: (model: string) => void;
  /** Clear the whole garage. */
  clearMyEngine: () => void;
  hasEngine: (model: string) => boolean;
};

const GARAGE_STORAGE_KEY = "repairkit-garage-v2";
const LEGACY_KEY = "repairkit-my-engine-v1";
const EngineContext = createContext<EngineContextValue | null>(null);

type Stored = { garage: string[]; active: string | null };

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const [garage, setGarage] = useState<string[]>([]);
  const [activeEngine, setActive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GARAGE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (Array.isArray(parsed.garage)) {
          setGarage(parsed.garage);
          setActive(parsed.active ?? parsed.garage[0] ?? null);
        }
      } else {
        // Migrate the old single-engine value if present.
        const legacy = window.localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          setGarage([legacy]);
          setActive(legacy);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (garage.length > 0) {
      const payload: Stored = { garage, active: activeEngine };
      window.localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(GARAGE_STORAGE_KEY);
    }
    window.localStorage.removeItem(LEGACY_KEY);
  }, [garage, activeEngine, ready]);

  const value = useMemo<EngineContextValue>(() => {
    function addEngine(model: string) {
      const name = model.trim();
      if (!name) return;
      setGarage((prev) => (prev.some((m) => m.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]));
      setActive(name);
    }
    return {
      garage,
      activeEngine,
      myEngine: activeEngine,
      addEngine,
      removeEngine(model: string) {
        setGarage((prev) => {
          const next = prev.filter((m) => m.toLowerCase() !== model.toLowerCase());
          setActive((current) => (current?.toLowerCase() === model.toLowerCase() ? next[0] ?? null : current));
          return next;
        });
      },
      setActiveEngine(model: string) {
        setActive(model.trim() || null);
      },
      setMyEngine: addEngine,
      clearMyEngine() {
        setGarage([]);
        setActive(null);
      },
      hasEngine(model: string) {
        return garage.some((m) => m.toLowerCase() === model.trim().toLowerCase());
      }
    };
  }, [garage, activeEngine]);

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

/** First garage engine that matches the part's compatible models, if any. */
export function matchInGarage(garage: string[], compatibleModels: string[]) {
  return garage.find((engine) => engineMatchesModels(engine, compatibleModels)) || null;
}
