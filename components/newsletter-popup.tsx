"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

const DISMISS_KEY = "nl_popup_dismissed_at";
// Re-show only after this long if the visitor closed without subscribing.
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function NewsletterPopup({
  title,
  body,
  delaySeconds
}: {
  title: string;
  body: string;
  delaySeconds: number;
}) {
  const [open, setOpen] = useState(false);
  // Don't stack on top of the cookie banner — wait until the visitor has made a
  // cookie choice before the newsletter popup is allowed to appear.
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    const check = () => {
      if (readConsent() !== null) setConsentReady(true);
    };
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  useEffect(() => {
    if (!consentReady) return;

    // Respect a recent dismissal or an existing subscription.
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < SNOOZE_MS) return;
      if (localStorage.getItem("nl_subscribed") === "1") return;
    } catch {
      // localStorage unavailable — fall through and show once.
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      cleanup();
    };

    const timer = window.setTimeout(show, Math.max(0, delaySeconds * 1000));

    // Exit-intent: pointer leaves the top of the viewport (desktop).
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseout", onMouseOut);

    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
    }
    return cleanup;
  }, [delaySeconds, consentReady]);

  if (!open) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md border border-line bg-ink p-7 text-white shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="关闭"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="pr-8 text-2xl font-black leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
        <div className="mt-5">
          <NewsletterForm source="popup" onSubscribed={() => {
            try {
              localStorage.setItem("nl_subscribed", "1");
            } catch {
              // ignore
            }
          }} />
        </div>
      </div>
    </div>
  );
}
