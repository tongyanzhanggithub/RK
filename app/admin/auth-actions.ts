"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearAdminSessionCookie,
  createAdminToken,
  hashPassword,
  setAdminSessionCookie,
  verifyPassword
} from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
});

// Simple in-memory brute-force guard: 5 failed attempts per email locks login
// for 10 minutes. Resets on success or server restart (single-instance scope).
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000;
const failedLogins = new Map<string, { count: number; lockedUntil: number }>();

function loginLocked(email: string) {
  const entry = failedLogins.get(email);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil > 0) failedLogins.delete(email);
  return false;
}

function recordLoginFailure(email: string) {
  const entry = failedLogins.get(email) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    entry.count = 0;
  }
  failedLogins.set(email, entry);
}

export async function loginAdmin(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/admin/dashboard"
  });

  if (!parsed.success) {
    return { error: "请输入有效的管理员邮箱和密码。" };
  }

  const email = parsed.data.email.toLowerCase();
  if (loginLocked(email)) {
    return { error: "失败次数过多。请在几分钟后再试。" };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const role = admin?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
  if (!admin || !admin.isActive || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    recordLoginFailure(email);
    return { error: "管理员凭据无效。" };
  }

  failedLogins.delete(email);
  setAdminSessionCookie(createAdminToken({ sub: admin.id, email: admin.email, role }, admin.passwordHash));
  await logAdminAction(admin, "admin.login");
  redirect(parsed.data.next?.startsWith("/admin") ? parsed.data.next : "/admin/dashboard");
}

export async function logoutAdmin() {
  clearAdminSessionCookie();
  redirect("/admin/login");
}

// ---- Password reset ----

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
// Rate limit: one reset email per address per 2 minutes.
const RESET_REQUEST_COOLDOWN_MS = 2 * 60 * 1000;
const resetRequests = new Map<string, number>();

const GENERIC_RESET_MESSAGE =
  "如果该邮箱存在对应的管理员账户，重置链接已发送。链接将在 30 分钟后过期。";

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  _prevState: { error?: string; message?: string },
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const parsed = z.string().email().safeParse(String(formData.get("email") || "").trim().toLowerCase());
  if (!parsed.success) {
    return { error: "请输入有效的邮箱地址。" };
  }
  const email = parsed.data;

  const lastRequest = resetRequests.get(email) || 0;
  if (Date.now() - lastRequest < RESET_REQUEST_COOLDOWN_MS) {
    // Same generic response — no hint about whether the account exists.
    return { message: GENERIC_RESET_MESSAGE };
  }
  resetRequests.set(email, Date.now());

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (admin && admin.isActive && (admin.role === "ADMIN" || admin.role === "SUPER_ADMIN")) {
    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        resetTokenHash: hashResetToken(token),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
      }
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";
    const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

    if (process.env.SMTP_HOST) {
      await sendMail({
        to: email,
        subject: "Reset your Partavio admin password",
        text: [
          "A password reset was requested for your admin account.",
          "",
          `Reset link (valid for 30 minutes): ${resetUrl}`,
          "",
          "If you did not request this, you can ignore this email — your password is unchanged."
        ].join("\n")
      }).catch(() => {
        // Swallow mail errors: response stays generic either way.
      });
    } else if (process.env.NODE_ENV !== "production") {
      // Dev convenience: no SMTP configured, print the link to the server console.
      console.log(`[password-reset] ${email}: ${resetUrl}`);
    }
  }

  return { message: GENERIC_RESET_MESSAGE };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(8).max(200),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致。",
    path: ["confirmPassword"]
  });

export async function resetPassword(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { error: "两次输入的密码必须一致，且至少为 8 个字符。" };
  }

  const admin = await prisma.adminUser.findFirst({
    where: { resetTokenHash: hashResetToken(parsed.data.token) }
  });

  if (!admin || !admin.resetTokenExpiresAt || admin.resetTokenExpiresAt < new Date()) {
    return { error: "该重置链接无效或已过期。请重新申请。" };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: hashPassword(parsed.data.password),
      // Single use: clear the token. Existing sessions are revoked automatically
      // because the session token embeds a fingerprint of the old password hash.
      resetTokenHash: null,
      resetTokenExpiresAt: null
    }
  });

  failedLogins.delete(admin.email);
  redirect("/admin/login?reset=1");
}
