import { cookies, headers } from "next/headers";
import { REGION_COOKIE, resolveCountry, type Country } from "@/lib/region";

// Country precedence: explicit cookie (manual switch or middleware-set) → edge geo
// header (Vercel / Cloudflare) → International default.
export function getServerCountry(): Country {
  const cookieCode = cookies().get(REGION_COOKIE)?.value;
  if (cookieCode) return resolveCountry(cookieCode);

  const h = headers();
  const geo = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || h.get("x-country") || "";
  return resolveCountry(geo);
}
