"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  slug: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (slug: string, quantity?: number) => void;
  updateItem: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "repairkit-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(99, Math.floor(quantity)));
}

function parseStoredCart(value: string | null): CartItem[] {
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
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
      clearCart() {
        setItems([]);
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
