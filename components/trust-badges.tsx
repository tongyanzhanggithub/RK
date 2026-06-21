"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck, Timer, Truck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function TrustBadges({ className = "" }: { className?: string }) {
  const t = useLanguage().dict.ui;
  const items = [
    [Truck, t.trust_ships, "/shipping"],
    [Timer, t.trust_delivery, "/shipping"],
    [ShieldCheck, t.trust_warranty, "/returns"],
    [CreditCard, t.trust_secure, null]
  ] as const;
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
