import { Star } from "lucide-react";

/** Read-only star rating. `rating` is 0–5 (rounded for fill). */
export function Stars({ rating, size = 16, className = "" }: { rating: number; size?: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex ${className}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= full ? "fill-brand text-brand" : "fill-none text-line"} />
      ))}
    </span>
  );
}
