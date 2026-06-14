"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useI18n } from "@/components/language-provider";

export function CartNavLink() {
  const { totalQuantity } = useCart();
  const { t } = useI18n();

  return (
    <Link
      href="/cart"
      className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-black text-graphite hover:bg-white"
    >
      <ShoppingCart size={17} />
      {t("nav.cart")}
      <span className="grid min-h-5 min-w-5 place-items-center bg-safety px-1 text-xs text-ink">
        {totalQuantity}
      </span>
    </Link>
  );
}
