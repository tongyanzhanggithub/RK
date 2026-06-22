"use client";

import { Check, FilePlus2 } from "lucide-react";
import { useQuote } from "@/components/quote-provider";
import { useLanguage } from "@/components/language-provider";
import { useToast } from "@/components/toast-provider";

type Props = {
  slug: string;
  name: string;
  className?: string;
  quantity?: number;
};

export function AddToQuoteButton({ slug, name, className = "", quantity = 1 }: Props) {
  const { hasItem, addItem } = useQuote();
  const t = useLanguage().dict.card;
  const toast = useToast();
  const inQuote = hasItem(slug);

  return (
    <button
      type="button"
      onClick={() => {
        if (inQuote) return;
        addItem(slug, quantity);
        toast.success(`${name} · ${t.in_quote}`);
      }}
      aria-label={`Add ${name} to quote request`}
      className={`inline-flex min-h-[2.75rem] rounded-lg items-center justify-center gap-1.5 border px-3 py-1.5 text-center text-sm font-black leading-tight transition-colors ${
        inQuote ? "border-green-300 bg-green-50 text-green-800" : "border-navy text-navy hover:bg-panel"
      } ${className}`}
    >
      {inQuote ? <Check size={17} /> : <FilePlus2 size={17} />}
      {inQuote ? t.in_quote : t.add_to_quote}
    </button>
  );
}
