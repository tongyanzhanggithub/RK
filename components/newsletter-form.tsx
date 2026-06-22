"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function NewsletterForm({ source = "footer", onSubscribed }: { source?: string; onSubscribed?: () => void }) {
  const { dict, locale } = useLanguage();
  const n = dict.newsletter;
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source, locale })
      });
      if (res.ok) {
        setStatus("done");
        onSubscribed?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-brand">
        <Check size={16} /> {n.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2" noValidate>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={n.placeholder}
            aria-label={n.placeholder}
            className="h-11 w-full border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-11 items-center justify-center gap-2 bg-brand px-4 text-sm font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : n.cta}
        </button>
      </div>
      {/* Honeypot: hidden from humans, tempting to bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      {status === "error" && <p className="text-xs font-bold text-red-300">{n.error}</p>}
      <p className="text-xs leading-5 text-white/50">{n.consent}</p>
    </form>
  );
}
