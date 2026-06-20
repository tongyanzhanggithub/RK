"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function CartNavLink() {
  const { totalQuantity } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-black text-graphite hover:bg-white"
    >
      <ShoppingCart size={17} />
      Cart
      <span className="grid min-h-5 min-w-5 place-items-center bg-brand px-1 text-xs text-white">
        {totalQuantity}
      </span>
    </Link>
  );
}
