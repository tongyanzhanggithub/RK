"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";

export function ClearCartOnSuccess({ enabled }: { enabled: boolean }) {
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!enabled || cleared) return;
    clearCart();
    setCleared(true);
  }, [clearCart, cleared, enabled]);

  return null;
}
