"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type WholesaleReviewState = {
  error?: string;
};

const reviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNote: z.string().max(3000).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readTags(value: string | null | undefined) {
  try {
    const tags = JSON.parse(value || "[]");
    return Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export async function reviewWholesaleApplication(
  applicationId: string,
  _previousState: WholesaleReviewState,
  formData: FormData
): Promise<WholesaleReviewState> {
  const admin = await requireAdmin();
  const parsed = reviewSchema.safeParse({
    status: text(formData, "status"),
    adminNote: text(formData, "adminNote") || undefined
  });

  if (!parsed.success) {
    return { error: "请选择有效的审核状态并检查备注长度。" };
  }

  const application = await prisma.wholesaleApplication.findUnique({ where: { id: applicationId } });
  if (!application) return { error: "未找到该批发申请。" };

  await prisma.$transaction(async (tx) => {
    let customerId = application.customerId;

    if (parsed.data.status === "APPROVED") {
      const approvedAt = new Date();
      const existingCustomer = await tx.customer.findUnique({ where: { email: application.email.toLowerCase() } });

      if (existingCustomer) {
        const tags = Array.from(new Set([...readTags(existingCustomer.tags), "Wholesale"]));
        const customer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: existingCustomer.name || application.contactName,
            whatsapp: existingCustomer.whatsapp || application.whatsapp,
            country: existingCustomer.country || application.country,
            role: "WHOLESALE",
            status: existingCustomer.status === "BLOCKED" ? "BLOCKED" : "ACTIVE",
            tags: JSON.stringify(tags),
            wholesaleApprovedAt: existingCustomer.wholesaleApprovedAt || approvedAt
          }
        });
        customerId = customer.id;
      } else {
        const customer = await tx.customer.create({
          data: {
            email: application.email.toLowerCase(),
            name: application.contactName,
            whatsapp: application.whatsapp,
            country: application.country,
            role: "WHOLESALE",
            status: "ACTIVE",
            tags: JSON.stringify(["Wholesale"]),
            wholesaleApprovedAt: approvedAt
          }
        });
        customerId = customer.id;
      }
    }

    await tx.wholesaleApplication.update({
      where: { id: applicationId },
      data: {
        customerId,
        status: parsed.data.status,
        adminNote: parsed.data.adminNote || null,
        reviewedBy: parsed.data.status === "PENDING" ? null : admin.email,
        reviewedAt: parsed.data.status === "PENDING" ? null : new Date(),
        notificationStatus: parsed.data.status === "PENDING" ? "NOT_SENT" : "PENDING_EMAIL_SETUP"
      }
    });
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/wholesale");
  revalidatePath(`/admin/wholesale/${applicationId}`);
  revalidatePath("/admin/customers");
  if (application.customerId) revalidatePath(`/admin/customers/${application.customerId}`);
  redirect(`/admin/wholesale/${applicationId}?saved=1`);
}
