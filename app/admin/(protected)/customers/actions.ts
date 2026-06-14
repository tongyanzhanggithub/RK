"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type CustomerFormState = {
  error?: string;
};

const customerUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "VIP", "BLOCKED"]),
  tags: z.string().max(1000).optional(),
  internalNote: z.string().max(3000).optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function tagsFromText(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireAdmin();

  const parsed = customerUpdateSchema.safeParse({
    status: text(formData, "status"),
    tags: text(formData, "tags"),
    internalNote: text(formData, "internalNote")
  });

  if (!parsed.success) {
    return { error: "Please check customer status, tags and note length." };
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      status: parsed.data.status,
      tags: JSON.stringify(tagsFromText(parsed.data.tags || "")),
      internalNote: parsed.data.internalNote || null
    }
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);
  redirect(`/admin/customers/${customerId}?saved=1`);
}
