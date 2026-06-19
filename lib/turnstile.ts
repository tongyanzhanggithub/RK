// Cloudflare Turnstile (free, privacy-friendly CAPTCHA). Env-gated:
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY  — public site key (widget)
//   TURNSTILE_SECRET_KEY            — server secret (verification)
// When unset, verification is skipped (forms behave as before) and the widget
// renders nothing — so the site works with or without it.
export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  if (!turnstileEnabled()) return true; // not configured → don't block submissions
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY || "", response: token }),
      cache: "no-store"
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
