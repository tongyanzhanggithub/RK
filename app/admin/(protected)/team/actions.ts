"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, requireSuperAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";

export type TeamFormState = { error?: string; ok?: boolean };

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(60),
  password: z.string().min(8).max(200),
  role: z.enum(["ADMIN", "SUPER_ADMIN"])
});

export async function createAdmin(_prev: TeamFormState, fd: FormData): Promise<TeamFormState> {
  const me = await requireSuperAdmin();
  const parsed = createSchema.safeParse({
    email: String(fd.get("email") || "").trim().toLowerCase(),
    name: String(fd.get("name") || "").trim(),
    password: String(fd.get("password") || ""),
    role: String(fd.get("role") || "ADMIN")
  });
  if (!parsed.success) return { error: "请检查邮箱与姓名，密码至少 8 位。" };
  const { email, name, password, role } = parsed.data;
  try {
    await prisma.adminUser.create({ data: { email, name, passwordHash: hashPassword(password), role, isActive: true } });
  } catch {
    return { error: "创建失败（该邮箱可能已存在）。" };
  }
  await logAdminAction(me, "team.create", email, `角色=${role}`);
  revalidatePath("/admin/team");
  return { ok: true };
}

/** Count active super-admins, optionally excluding one id (the one being changed). */
async function activeSuperCount(excludeId?: string) {
  return prisma.adminUser.count({
    where: { role: "SUPER_ADMIN", isActive: true, ...(excludeId ? { id: { not: excludeId } } : {}) }
  });
}

export async function setAdminRole(id: string, role: "ADMIN" | "SUPER_ADMIN") {
  const me = await requireSuperAdmin();
  if (id === me.id) return; // can't change your own role
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return;
  // Never leave zero super-admins.
  if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN" && (await activeSuperCount(id)) === 0) return;
  await prisma.adminUser.update({ where: { id }, data: { role } });
  await logAdminAction(me, "team.role", target.email, `→ ${role}`);
  revalidatePath("/admin/team");
}

export async function setAdminActive(id: string, isActive: boolean) {
  const me = await requireSuperAdmin();
  if (id === me.id) return; // can't disable yourself
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return;
  if (!isActive && target.role === "SUPER_ADMIN" && (await activeSuperCount(id)) === 0) return;
  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  await logAdminAction(me, isActive ? "team.enable" : "team.disable", target.email);
  revalidatePath("/admin/team");
}

export async function deleteAdmin(id: string) {
  const me = await requireSuperAdmin();
  if (id === me.id) return; // can't delete yourself
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return;
  if (target.role === "SUPER_ADMIN" && (await activeSuperCount(id)) === 0) return;
  await prisma.adminUser.delete({ where: { id } });
  await logAdminAction(me, "team.delete", target.email);
  revalidatePath("/admin/team");
}
