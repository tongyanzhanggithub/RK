import Link from "next/link";
import { CreditCard, ShieldCheck, Timer, Truck } from "lucide-react";

const items = [
  [Truck, "Ships within 3–5 business days", "/shipping"],
  [Timer, "Delivery in 7–15 business days", "/shipping"],
  [ShieldCheck, "30-day warranty on defects", "/returns"],
  [CreditCard, "Secure card payment", null]
] as const;

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-2 text-sm font-bold text-steel ${className}`}>
      {items.map(([Icon, label, href]) => (
        <li key={label} className="flex items-center gap-2">
          <Icon size={16} className="shrink-0 text-navy" />
          {href ? (
            <Link href={href} className="underline-offset-2 hover:text-navy hover:underline">
              {label}
            </Link>
          ) : (
            <span>{label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
