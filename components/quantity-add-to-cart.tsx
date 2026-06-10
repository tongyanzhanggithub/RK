"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";

type QuantityAddToCartProps = {
  slug: string;
  name: string;
  outOfStock?: boolean;
  maxQuantity?: number;
};

export function QuantityAddToCart({ slug, name, outOfStock = false, maxQuantity = 99 }: QuantityAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const max = Math.max(1, Math.min(99, maxQuantity));

  function clamp(value: number) {
    if (!Number.isFinite(value)) return 1;
    return Math.max(1, Math.min(max, Math.floor(value)));
  }

  if (outOfStock) {
    return <AddToCartButton slug={slug} name={name} outOfStock className="min-w-44" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-grid grid-cols-[40px_56px_40px] border border-line">
        <button
          type="button"
          className="grid h-11 place-items-center hover:bg-panel"
          onClick={() => setQuantity((current) => clamp(current - 1))}
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <input
          value={quantity}
          onChange={(event) => setQuantity(clamp(Number(event.target.value)))}
          aria-label="Quantity"
          inputMode="numeric"
          className="h-11 border-x border-line text-center font-black outline-none"
        />
        <button
          type="button"
          className="grid h-11 place-items-center hover:bg-panel"
          onClick={() => setQuantity((current) => clamp(current + 1))}
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
      <AddToCartButton slug={slug} name={name} quantity={quantity} className="min-w-44" />
    </div>
  );
}
