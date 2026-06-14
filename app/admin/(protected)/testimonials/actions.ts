"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const testimonialSchema = z.object({
  authorName: z.string().min(1).max(120),
  company: z.string().max(160).optional(),
  country: z.string().min(1).max(100),
  content: z.string().min(10).max(1500),
  contentZh: z.string().max(1500).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  isPublished: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999)
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function revalidateTestimonialRoutes() {
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export type TestimonialFormState = { error?: string };

export async function createTestimonial(
  _prevState: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  await requireAdmin();

  const parsed = testimonialSchema.safeParse({
    authorName: text(formData, "authorName"),
    company: text(formData, "company") || undefined,
    country: text(formData, "country"),
    content: text(formData, "content"),
    contentZh: text(formData, "contentZh") || undefined,
    rating: text(formData, "rating") || "5",
    isPublished: formData.get("isPublished") === "on",
    sortOrder: text(formData, "sortOrder") || "0"
  });

  if (!parsed.success) {
    return { error: "请检查必填项 — 内容至少需要 10 个字符。" };
  }

  await prisma.testimonial.create({
    data: {
      authorName: parsed.data.authorName,
      company: parsed.data.company || null,
      country: parsed.data.country,
      content: parsed.data.content,
      contentZh: parsed.data.contentZh || null,
      rating: parsed.data.rating,
      isPublished: parsed.data.isPublished,
      sortOrder: parsed.data.sortOrder
    }
  });

  revalidateTestimonialRoutes();
  redirect("/admin/testimonials?saved=1");
}

export async function toggleTestimonialPublished(testimonialId: string) {
  await requireAdmin();
  const testimonial = await prisma.testimonial.findUnique({ where: { id: testimonialId } });
  if (!testimonial) return;

  await prisma.testimonial.update({
    where: { id: testimonialId },
    data: { isPublished: !testimonial.isPublished }
  });
  revalidateTestimonialRoutes();
}

export async function deleteTestimonial(testimonialId: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id: testimonialId } });
  revalidateTestimonialRoutes();
}
