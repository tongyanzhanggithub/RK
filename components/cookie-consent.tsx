"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { readConsent, writeConsent } from "@/lib/consent";

export function CookieConsent() {
  const { dict } = useLanguage();
  const c = dict.cookie;
  const [show, setShow] = useState(false);

  // Only decide visibility on the client (cookie isn't known during SSR).
  useEffect(() => {
    setShow(readConsent() === null);
  }, []);

  if (!show) return null;

  function choose(value: "accepted" | "declined") {
    writeConsent(value);
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/98 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-5 text-steel">
          {c.text}{" "}
          <Link href="/privacy" className="font-black text-navy underline">
            {c.learn_more}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="inline-flex min-h-[2.5rem] items-center justify-center border border-line px-4 py-1.5 text-sm font-black text-navy hover:bg-panel"
          >
            {c.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex min-h-[2.5rem] items-center justify-center bg-safety px-4 py-1.5 text-sm font-black text-ink hover:bg-amber-400"
          >
            {c.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
