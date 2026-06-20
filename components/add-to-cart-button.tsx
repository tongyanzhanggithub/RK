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
        className={`inline-flex min-h-[2.75rem] rounded-lg cursor-not-allowed items-center justify-center gap-1.5 border border-line bg-panel px-3 py-1.5 text-center text-sm font-black leading-tight text-steel ${className}`}
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
      className={`inline-flex min-h-[2.75rem] rounded-lg items-center justify-center gap-1.5 py-1.5 text-center leading-tight bg-brand px-3 text-sm font-black text-white transition-colors hover:bg-[#1c54bf] ${className}`}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
