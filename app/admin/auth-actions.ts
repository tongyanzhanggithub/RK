"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSessionCookie, createAdminToken, setAdminSessionCookie, verifyPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

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
    return { error: "Please enter a valid admin email and password." };
  }

  const email = parsed.data.email.toLowerCase();
  if (loginLocked(email)) {
    return { error: "Too many failed attempts. Try again in a few minutes." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || admin.role !== "ADMIN" || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    recordLoginFailure(email);
    return { error: "Invalid admin credentials." };
  }

  failedLogins.delete(email);
  setAdminSessionCookie(createAdminToken({ sub: admin.id, email: admin.email, role: "ADMIN" }, admin.passwordHash));
  redirect(parsed.data.next?.startsWith("/admin") ? parsed.data.next : "/admin/dashboard");
}

export async function logoutAdmin() {
  clearAdminSessionCookie();
  redirect("/admin/login");
}
