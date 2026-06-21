import { headers } from "next/headers";
import { prisma } from "@/lib/db";

function clientIp(): string | null {
  try {
    const h = headers();
    return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim() || null;
  } catch {
    return null;
  }
}

/** Record an admin action for the activity log. Best-effort: never throws, so a
 *  logging failure can't break the underlying operation. */
export async function logAdminAction(
  admin: { id?: string | null; email: string } | null,
  action: string,
  target?: string | null,
  detail?: string | null
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin?.id ?? null,
        adminEmail: admin?.email ?? "unknown",
        action,
        target: target ?? null,
        detail: detail ?? null,
        ip: clientIp()
      }
    });
  } catch {
    // swallow
  }
}
