"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="border border-line bg-white p-6">
      <h2 className="text-xl font-black">FAQ</h2>
      <ul className="mt-4 divide-y divide-line">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm font-bold hover:text-navy"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="pb-4 text-sm leading-6 text-steel">{item.answer}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
