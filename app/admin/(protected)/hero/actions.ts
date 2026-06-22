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

// Collect the per-locale overrides (zh/ar/ru) into a compact JSON object. Empty
// fields are omitted so the storefront falls back to the English base columns.
function translationsFromForm(fd: FormData): string | null {
  const result: Record<string, Record<string, unknown>> = {};
  for (const code of ["zh", "ar", "ru"]) {
    const o: Record<string, unknown> = {};
    for (const key of ["badge", "title", "subtitle", "primaryLabel", "secondaryLabel", "panelTitle"]) {
      const v = text(fd, `${code}_${key}`);
      if (v) o[key] = v;
    }
    const bullets = text(fd, `${code}_bullets`)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (bullets.length) o.bullets = bullets;
    if (Object.keys(o).length) result[code] = o;
  }
  return Object.keys(result).length ? JSON.stringify(result) : null;
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
    translations: translationsFromForm(fd),
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
