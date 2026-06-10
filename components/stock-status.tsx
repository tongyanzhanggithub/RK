import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";

type StockStatusProps = {
  stock?: number;
  lowStockThreshold?: number;
  className?: string;
};

export function StockStatus({ stock = 0, lowStockThreshold = 5, className = "" }: StockStatusProps) {
  if (stock <= 0) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm font-black text-red-700 ${className}`}>
        <CircleX size={15} /> Out of stock — ask for restock date
      </p>
    );
  }
  if (stock <= lowStockThreshold) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm font-black text-amber-700 ${className}`}>
        <CircleAlert size={15} /> Only {stock} left in stock
      </p>
    );
  }
  return (
    <p className={`inline-flex items-center gap-1.5 text-sm font-black text-green-700 ${className}`}>
      <CheckCircle2 size={15} /> In stock — ready to ship
    </p>
  );
}
