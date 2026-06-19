"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";

export type ReviewFormState = { ok: boolean; error: string };

// Customer-submitted product review. Saved UNPUBLISHED — an admin approves it in
// /admin/reviews before it shows on the storefront (spam/quality control).
export async function submitReview(
  productSlug: string,
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const authorName = String(formData.get("authorName") || "").trim().slice(0, 80);
  const country = String(formData.get("country") || "").trim().slice(0, 60) || null;
  const title = String(formData.get("title") || "").trim().slice(0, 120) || null;
  const body = String(formData.get("body") || "").trim().slice(0, 2000);
  let rating = Number(formData.get("rating"));
  if (!Number.isFinite(rating)) rating = 5;
  rating = Math.max(1, Math.min(5, Math.round(rating)));

  if (!authorName || body.length < 4) {
    return { ok: false, error: "Please enter your name and a short review." };
  }

  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") || "")))) {
    return { ok: false, error: "Verification failed. Please complete the challenge and try again." };
  }

  const product = await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true } });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.productReview.create({
    data: { productId: product.id, productSlug, authorName, country, title, body, rating, isPublished: false }
  });

  revalidatePath(`/products/${productSlug}`);
  return { ok: true, error: "" };
}
