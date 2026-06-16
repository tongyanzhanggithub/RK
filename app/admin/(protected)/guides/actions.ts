"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type GuideFormState = {
  error?: string;
};

const guideSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug 只能是小写字母、数字和连字符。"),
  excerpt: z.string().max(300).optional(),
  content: z.string().max(20000).optional(),
  videoUrl: z.string().max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(300).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function guideDataFromForm(formData: FormData) {
  const title = text(formData, "title");
  const slug = text(formData, "slug") || slugify(title);
  const parsed = guideSchema.safeParse({
    title,
    slug,
    excerpt: text(formData, "excerpt") || undefined,
    content: text(formData, "content") || undefined,
    videoUrl: text(formData, "videoUrl") || undefined,
    status: text(formData, "status") || "DRAFT",
    seoTitle: text(formData, "seoTitle") || undefined,
    seoDescription: text(formData, "seoDescription") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "请检查标题、slug 与状态。" };
  }

  const g = parsed.data;
  return {
    data: {
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt ?? null,
      content: g.content ?? null,
      videoUrl: g.videoUrl ?? null,
      status: g.status,
      seoTitle: g.seoTitle ?? null,
      seoDescription: g.seoDescription ?? null
    }
  };
}

function revalidateGuideRoutes() {
  revalidatePath("/admin/guides");
  revalidatePath("/guides");
}

export async function createGuide(_prev: GuideFormState, formData: FormData): Promise<GuideFormState> {
  await requireAdmin();
  const result = guideDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let guide;
  try {
    guide = await prisma.repairGuide.create({ data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法创建指南（slug 可能已存在）。" };
  }

  revalidateGuideRoutes();
  redirect(`/admin/guides/${guide.id}/edit?saved=1`);
}

export async function updateGuide(
  guideId: string,
  _prev: GuideFormState,
  formData: FormData
): Promise<GuideFormState> {
  await requireAdmin();
  const result = guideDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let guide;
  try {
    guide = await prisma.repairGuide.update({ where: { id: guideId }, data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法更新指南。" };
  }

  revalidateGuideRoutes();
  redirect(`/admin/guides/${guide.id}/edit?saved=1`);
}

export async function deleteGuide(guideId: string) {
  await requireAdmin();
  await prisma.repairGuide.delete({ where: { id: guideId } });
  revalidateGuideRoutes();
  redirect("/admin/guides");
}
