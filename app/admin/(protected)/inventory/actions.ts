"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type InventoryFormState = {
  error?: string;
};

const adjustmentSchema = z.object({
  type: z.enum(["RESTOCK", "RETURN", "DAMAGE", "SALE", "CORRECTION"]),
  quantity: z.coerce.number().int().min(0).max(100000),
  reason: z.string().min(2).max(500),
  reference: z.string().max(160).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function adjustInventory(
  productId: string,
  _prevState: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const admin = await requireAdmin();
  const parsed = adjustmentSchema.safeParse({
    type: text(formData, "type"),
    quantity: text(formData, "quantity"),
    reason: text(formData, "reason"),
    reference: text(formData, "reference")
  });

  if (!parsed.success || (parsed.data.type !== "CORRECTION" && parsed.data.quantity === 0)) {
    return { error: "Enter a valid adjustment type, positive quantity and reason." };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found.");

      const quantity = parsed.data.quantity;
      const delta =
        parsed.data.type === "CORRECTION"
          ? quantity - product.stock
          : parsed.data.type === "RESTOCK" || parsed.data.type === "RETURN"
            ? quantity
            : -quantity;
      const stockAfter = product.stock + delta;
      if (stockAfter < 0) throw new Error("Inventory cannot be reduced below zero.");

      await transaction.product.update({
        where: { id: product.id },
        data: { stock: stockAfter }
      });
      await transaction.inventoryAdjustment.create({
        data: {
          productId: product.id,
          type: parsed.data.type,
          quantityDelta: delta,
          stockBefore: product.stock,
          stockAfter,
          reason: parsed.data.reason,
          reference: parsed.data.reference || null,
          createdBy: admin.email
        }
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to adjust inventory." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/products");
  redirect(`/admin/inventory/${productId}?saved=1`);
}
