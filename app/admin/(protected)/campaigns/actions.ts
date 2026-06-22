"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";

export type CampaignFormState = {
  error?: string;
};

const campaignSchema = z
  .object({
    slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(2).max(200),
    subtitle: z.string().max(300).optional(),
    heroImage: z.string().max(500).optional(),
    bodyHtml: z.string().max(50000).optional(),
    productSlugs: z.array(z.string()),
    ctaLabel: z.string().max(60).optional(),
    ctaHref: z.string().max(500).optional(),
    isActive: z.boolean(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    seoTitle: z.string().max(200).optional(),
    seoDescription: z.string().max(400).optional()
  })
  .superRefine((c, ctx) => {
    if (c.startsAt && c.endsAt && new Date(c.endsAt) <= new Date(c.startsAt)) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "结束时间必须晚于开始时间。" });
    }
  });

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function dateOrNull(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugListFromText(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function campaignDataFromForm(formData: FormData) {
  const parsed = campaignSchema.safeParse({
    slug: text(formData, "slug").toLowerCase(),
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle") || undefined,
    heroImage: text(formData, "heroImage") || undefined,
    bodyHtml: text(formData, "bodyHtml") || undefined,
    productSlugs: slugListFromText(text(formData, "productSlugsText")),
    ctaLabel: text(formData, "ctaLabel") || undefined,
    ctaHref: text(formData, "ctaHref") || undefined,
    isActive: formData.get("isActive") === "on",
    startsAt: text(formData, "startsAt") || undefined,
    endsAt: text(formData, "endsAt") || undefined,
    seoTitle: text(formData, "seoTitle") || undefined,
    seoDescription: text(formData, "seoDescription") || undefined
  });

  if (!parsed.success) {
    return { error: "请检查 slug 格式（小写字母/数字/连字符）、标题与有效期。" };
  }

  const c = parsed.data;
  return {
    data: {
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle || null,
      heroImage: c.heroImage || null,
      bodyHtml: c.bodyHtml || null,
      productSlugs: JSON.stringify(c.productSlugs),
      ctaLabel: c.ctaLabel || null,
      ctaHref: c.ctaHref || null,
      isActive: c.isActive,
      startsAt: dateOrNull(c.startsAt),
      endsAt: dateOrNull(c.endsAt),
      seoTitle: c.seoTitle || null,
      seoDescription: c.seoDescription || null
    }
  };
}

function revalidateCampaignRoutes(slug?: string) {
  revalidatePath("/admin/campaigns");
  if (slug) revalidatePath(`/promo/${slug}`);
}

export async function createCampaign(_prev: CampaignFormState, formData: FormData): Promise<CampaignFormState> {
  const admin = await requireAdmin();
  const result = campaignDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let campaign;
  try {
    campaign = await prisma.campaign.create({ data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法创建活动（slug 可能已存在）。" };
  }

  await logAdminAction(admin, "campaign.create", campaign.title);
  revalidateCampaignRoutes(campaign.slug);
  redirect(`/admin/campaigns/${campaign.id}/edit?saved=1`);
}

export async function updateCampaign(
  campaignId: string,
  _prev: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const admin = await requireAdmin();
  const result = campaignDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let campaign;
  try {
    const existing = await prisma.campaign.findUnique({ where: { id: campaignId } });
    campaign = await prisma.campaign.update({ where: { id: campaignId }, data: result.data });
    // The slug may have changed — refresh the old public route too.
    if (existing && existing.slug !== campaign.slug) revalidateCampaignRoutes(existing.slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法更新活动。" };
  }

  await logAdminAction(admin, "campaign.update", campaign.title);
  revalidateCampaignRoutes(campaign.slug);
  redirect(`/admin/campaigns/${campaign.id}/edit?saved=1`);
}

export async function deleteCampaign(campaignId: string) {
  const admin = await requireAdmin();
  const campaign = await prisma.campaign.delete({ where: { id: campaignId } });
  await logAdminAction(admin, "campaign.delete", campaign.title);
  revalidateCampaignRoutes(campaign.slug);
}
