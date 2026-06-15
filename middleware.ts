import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";

// Optional IP allowlist for the admin area. Comma-separated list in
// ADMIN_IP_ALLOWLIST; when empty, no IP restriction is applied.
const ADMIN_IP_ALLOWLIST = (process.env.ADMIN_IP_ALLOWLIST || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    // Enforce IP allowlist (if configured) on the entire admin area, login included.
    if (ADMIN_IP_ALLOWLIST.length > 0) {
      const ip = clientIp(request);
      if (!ADMIN_IP_ALLOWLIST.includes(ip)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    if (pathname !== "/admin/login" && !pathname.startsWith("/admin/forgot-password") && !pathname.startsWith("/admin/reset-password")) {
      const hasSession = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
      if (!hasSession) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.rewrite(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
