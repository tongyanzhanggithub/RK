import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { getServerDict } from "@/lib/locale";

type StockStatusProps = {
  stock?: number;
  lowStockThreshold?: number;
  className?: string;
};

export function StockStatus({ stock = 0, lowStockThreshold = 5, className = "" }: StockStatusProps) {
  const t = getServerDict().card;
  if (stock <= 0) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm font-black text-red-700 ${className}`}>
        <CircleX size={15} /> {t.out_of_stock}
      </p>
    );
  }
  if (stock <= lowStockThreshold) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm font-black text-amber-700 ${className}`}>
        <CircleAlert size={15} /> {t.low_stock.replace("{n}", String(stock))}
      </p>
    );
  }
  return (
    <p className={`inline-flex items-center gap-1.5 text-sm font-black text-green-700 ${className}`}>
      <CheckCircle2 size={15} /> {t.in_stock}
    </p>
  );
}
