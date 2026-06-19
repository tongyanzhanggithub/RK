"use client";

import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Renders the Cloudflare Turnstile widget. Implicit rendering injects a hidden
// <input name="cf-turnstile-response"> into the surrounding <form>, which the
// server action verifies. Renders nothing when no site key is configured.
export function TurnstileWidget({ className = "" }: { className?: string }) {
  if (!SITE_KEY) return null;
  return (
    <div className={className}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="light" />
    </div>
  );
}
