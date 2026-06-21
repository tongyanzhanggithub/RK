"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";

type Flag = "isFeatured" | "isHotSeller";

// Toggle a single merchandising flag for one product. Bound per-row in the UI so
// curating the homepage is one click — no full-form save.
export async function toggleProductFlag(productId: string, field: Flag, next: boolean) {
  const admin = await requireAdmin();
  if (field !== "isFeatured" && field !== "isHotSeller") return;

  await prisma.product.update({ where: { id: productId }, data: { [field]: next } });
  await logAdminAction(admin, "product.flag", productId, `${field}=${next ? "on" : "off"}`);

  revalidatePath("/admin/featured");
  revalidatePath("/");
}
