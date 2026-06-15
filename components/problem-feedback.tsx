"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type Strings = {
  question: string;
  yes: string;
  no: string;
  thanks_yes: string;
  thanks_no: string;
};

export function ProblemFeedback({ strings }: { strings: Strings }) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  if (voted) {
    return (
      <section className="mt-6 border border-line bg-panel p-5 text-sm font-bold text-steel">
        {voted === "yes" ? strings.thanks_yes : strings.thanks_no}
      </section>
    );
  }

  return (
    <section className="mt-6 flex flex-wrap items-center gap-3 border border-line bg-panel p-5">
      <span className="text-sm font-black">{strings.question}</span>
      <button
        type="button"
        onClick={() => setVoted("yes")}
        className="inline-flex items-center gap-2 border border-line bg-white px-4 py-2 text-sm font-black hover:border-navy"
      >
        <ThumbsUp size={16} className="text-navy" /> {strings.yes}
      </button>
      <button
        type="button"
        onClick={() => setVoted("no")}
        className="inline-flex items-center gap-2 border border-line bg-white px-4 py-2 text-sm font-black hover:border-navy"
      >
        <ThumbsDown size={16} className="text-steel" /> {strings.no}
      </button>
    </section>
  );
}
