"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Top promo strip. Driven by the `announcement` / `announcement_link` settings.
// Dismissible per-message: we key the localStorage flag on the text so editing
// the announcement re-shows it to everyone who had dismissed the old one.
export function AnnouncementBar({ text, link }: { text: string; link?: string | null }) {
  const [visible, setVisible] = useState(false);
  const storageKey = `pv_ann_dismissed:${hash(text)}`;

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(storageKey) !== "1");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!text.trim() || !visible) return null;

  const inner = <span className="font-bold">{text}</span>;

  return (
    <div className="relative bg-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-xs sm:text-sm">
        {link ? (
          <Link href={link} className="underline-offset-2 hover:underline">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
      <button
        type="button"
        aria-label="关闭公告"
        onClick={() => {
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

// Tiny stable hash so the dismiss flag changes when the message text changes.
function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
