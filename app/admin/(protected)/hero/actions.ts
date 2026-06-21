"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";

export type HeroFormState = { error?: string };

function text(fd: FormData, k: string) {
  return String(fd.get(k) || "").trim();
}

function dataFromForm(fd: FormData) {
  return {
    badge: text(fd, "badge"),
    title: text(fd, "title"),
    subtitle: text(fd, "subtitle"),
    image: text(fd, "image") || null,
    linkHref: text(fd, "linkHref") || null,
    primaryLabel: text(fd, "primaryLabel"),
    primaryHref: text(fd, "primaryHref") || "/products",
    primaryExternal: fd.get("primaryExternal") === "on",
    primaryWhatsapp: fd.get("primaryWhatsapp") === "on",
    secondaryLabel: text(fd, "secondaryLabel") || null,
    secondaryHref: text(fd, "secondaryHref") || null,
    panelTitle: text(fd, "panelTitle"),
    // 每行一个卖点 → JSON 数组
    bullets: JSON.stringify(
      text(fd, "bullets")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
    sortOrder: Number(text(fd, "sortOrder") || "0") || 0,
    isActive: fd.get("isActive") === "on"
  };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function createHeroSlide(_prev: HeroFormState, fd: FormData): Promise<HeroFormState> {
  const admin = await requireAdmin();
  const d = dataFromForm(fd);
  if (!d.title) return { error: "大标题为必填。" };
  await prisma.heroSlide.create({ data: d });
  await logAdminAction(admin, "hero.create", d.title);
  revalidate();
  redirect("/admin/hero?saved=1");
}

export async function updateHeroSlide(id: string, _prev: HeroFormState, fd: FormData): Promise<HeroFormState> {
  const admin = await requireAdmin();
  const d = dataFromForm(fd);
  if (!d.title) return { error: "大标题为必填。" };
  await prisma.heroSlide.update({ where: { id }, data: d });
  await logAdminAction(admin, "hero.update", d.title);
  revalidate();
  redirect("/admin/hero?saved=1");
}

export async function deleteHeroSlide(id: string) {
  const admin = await requireAdmin();
  const removed = await prisma.heroSlide.delete({ where: { id } });
  await logAdminAction(admin, "hero.delete", removed.title);
  revalidate();
}

export async function toggleHeroPublished(id: string) {
  await requireAdmin();
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) return;
  await prisma.heroSlide.update({ where: { id }, data: { isActive: !slide.isActive } });
  revalidate();
}
