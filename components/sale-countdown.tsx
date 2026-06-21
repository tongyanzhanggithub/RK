"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, "0");

// Live countdown to a flash-sale end time. Renders nothing until mounted (avoids
// SSR/client hydration mismatch) and nothing once the sale has expired.
export function SaleCountdown({ endsAt, className = "" }: { endsAt: string | Date; className?: string }) {
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const remaining = target - now;
  if (Number.isNaN(target) || remaining <= 0) return null;

  const { days, hours, minutes, seconds } = parts(remaining);
  const label = days > 0 ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <span className={`inline-flex items-center gap-1 font-black tabular-nums ${className}`}>
      <Timer size={14} />
      {label}
    </span>
  );
}
