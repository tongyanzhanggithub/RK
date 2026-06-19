// Cookie 同意状态(客户端)。strictly-necessary cookies(购物车/语言/会话)始终允许;
// 这里管理的是"分析类 cookie"的同意——只有 accepted 时才加载 Google Analytics。
export const CONSENT_COOKIE = "rk-cookie-consent";
export const CONSENT_EVENT = "rk-consent-change";

export type ConsentValue = "accepted" | "declined";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )rk-cookie-consent=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "accepted" || value === "declined" ? value : null;
}

export function writeConsent(value: ConsentValue) {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_EVENT));
}
