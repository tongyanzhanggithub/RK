import { cookies } from "next/headers";
import { getDict, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export function getServerDict() {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  const locale: Locale = raw === "zh" ? "zh" : "en";
  return getDict(locale);
}
