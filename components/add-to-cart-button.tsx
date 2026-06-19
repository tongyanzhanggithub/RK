"use client";

import { useState } from "react";
import { Check, ShoppingCart, XCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  slug: string;
  name: string;
  className?: string;
  quantity?: number;
  outOfStock?: boolean;
};

export function AddToCartButton({ slug, name, className = "", quantity = 1, outOfStock = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(slug, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${name} is out of stock`}
        className={`inline-flex h-11 whitespace-nowrap cursor-not-allowed items-center justify-center gap-2 border border-line bg-panel px-4 text-sm font-black text-steel ${className}`}
      >
        <XCircle size={17} /> Out of Stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Add ${name} to cart`}
      className={`inline-flex h-11 whitespace-nowrap items-center justify-center gap-2 bg-safety px-4 text-sm font-black text-ink transition-colors hover:bg-amber-400 ${className}`}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
