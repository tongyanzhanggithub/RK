"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  slug: string;
  name: string;
  className?: string;
  quantity?: number;
};

export function AddToCartButton({ slug, name, className = "", quantity = 1 }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Add ${name} to cart`}
      className={`inline-flex h-11 items-center justify-center gap-2 bg-safety px-4 text-sm font-black text-ink transition-colors hover:bg-amber-400 ${className}`}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
