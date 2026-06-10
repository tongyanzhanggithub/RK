import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex bg-safety/15 px-2 py-1 text-xs font-black text-ink ${className}`} {...props} />;
}
