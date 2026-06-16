"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type QuoteItem = {
  slug: string;
  quantity: number;
};

type QuoteContextValue = {
  items: QuoteItem[];
  totalQuantity: number;
  hasItem: (slug: string) => boolean;
  addItem: (slug: string, quantity?: number) => void;
  updateItem: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearQuote: () => void;
};

const QUOTE_STORAGE_KEY = "repairkit-quote-v1";
const QuoteContext = createContext<QuoteContextValue | null>(null);

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99999, Math.floor(quantity)));
}

function parseStored(value: string | null): QuoteItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item?.slug === "string" && typeof item?.quantity === "number")
      .map((item) => ({ slug: item.slug, quantity: normalizeQuantity(item.quantity) }));
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(parseStored(window.localStorage.getItem(QUOTE_STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<QuoteContextValue>(() => {
    return {
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      hasItem(slug) {
        return items.some((item) => item.slug === slug);
      },
      addItem(slug, quantity = 1) {
        setItems((current) => {
          const existing = current.find((item) => item.slug === slug);
          if (!existing) return [...current, { slug, quantity: normalizeQuantity(quantity) }];
          return current.map((item) =>
            item.slug === slug ? { ...item, quantity: normalizeQuantity(item.quantity + quantity) } : item
          );
        });
      },
      updateItem(slug, quantity) {
        setItems((current) =>
          current
            .map((item) => (item.slug === slug ? { ...item, quantity: normalizeQuantity(quantity) } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem(slug) {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
      clearQuote() {
        setItems([]);
      }
    };
  }, [items]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used inside QuoteProvider");
  }
  return context;
}
