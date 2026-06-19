import { cookies } from "next/headers";
import { getDict, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

const SUPPORTED: Locale[] = ["en", "zh", "ar", "ru"];

export function getServerLocale(): Locale {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  return raw && SUPPORTED.includes(raw as Locale) ? (raw as Locale) : "en";
}

export function getServerDict() {
  return getDict(getServerLocale());
}
