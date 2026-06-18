"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "打印 / 存为 PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 bg-navy px-4 text-sm font-black text-white hover:bg-navy/90 print:hidden"
    >
      <Printer size={16} /> {label}
    </button>
  );
}
