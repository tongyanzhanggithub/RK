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

export async function loginAdmin(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/admin/dashboard"
  });

  if (!parsed.success) {
    return { error: "请输入有效的管理员邮箱和密码（密码至少 8 位）。" };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || admin.role !== "ADMIN" || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return { error: "管理员账号或密码不正确。" };
  }

  setAdminSessionCookie(createAdminToken({ sub: admin.id, email: admin.email, role: "ADMIN" }));
  redirect(parsed.data.next?.startsWith("/admin") ? parsed.data.next : "/admin/dashboard");
}

export async function logoutAdmin() {
  clearAdminSessionCookie();
  redirect("/admin/login");
}
