"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type QuoteAdminState = { error?: string };

const schema = z.object({
  status: z.enum(["NEW", "QUOTED", "CLOSED"]),
  adminNote: z.string().max(3000).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function updateQuoteRequest(
  quoteId: string,
  _prev: QuoteAdminState,
  formData: FormData
): Promise<QuoteAdminState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    status: text(formData, "status"),
    adminNote: text(formData, "adminNote") || undefined
  });
  if (!parsed.success) return { error: "请选择有效状态并检查备注长度。" };

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status: parsed.data.status, adminNote: parsed.data.adminNote || null }
  });

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath("/admin/dashboard");
  redirect(`/admin/quotes/${quoteId}?saved=1`);
}

export async function deleteQuoteRequest(quoteId: string) {
  await requireAdmin();
  await prisma.quoteRequest.delete({ where: { id: quoteId } });
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}
