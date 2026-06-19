"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

async function revalidate(productSlug?: string) {
  revalidatePath("/admin/reviews");
  if (productSlug) revalidatePath(`/products/${productSlug}`);
}

export async function toggleReviewPublished(reviewId: string) {
  await requireAdmin();
  const review = await prisma.productReview.findUnique({ where: { id: reviewId } });
  if (!review) return;
  await prisma.productReview.update({
    where: { id: reviewId },
    data: { isPublished: !review.isPublished }
  });
  await revalidate(review.productSlug);
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();
  const review = await prisma.productReview.findUnique({ where: { id: reviewId } });
  await prisma.productReview.delete({ where: { id: reviewId } });
  await revalidate(review?.productSlug);
}
