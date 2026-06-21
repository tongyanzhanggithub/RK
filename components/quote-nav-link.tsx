"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useQuote } from "@/components/quote-provider";
import { useLanguage } from "@/components/language-provider";

export function QuoteNavLink() {
  const { items } = useQuote();
  const { dict } = useLanguage();
  if (items.length === 0) return null;

  return (
    <Link
      href="/quote"
      className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-black text-graphite hover:bg-white"
    >
      <FileText size={17} />
      {dict.ui.quote}
      <span className="grid min-h-5 min-w-5 place-items-center bg-navy px-1 text-xs text-white">
        {items.length}
      </span>
    </Link>
  );
}
