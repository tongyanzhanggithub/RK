"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type CustomerFormState = {
  error?: string;
};

const customerProfileSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  postalCode: z.string().max(30).optional(),
  status: z.enum(["ACTIVE", "VIP", "BLOCKED"]),
  role: z.enum(["CUSTOMER", "WHOLESALE"]),
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

function parseProfile(formData: FormData) {
  return customerProfileSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone") || undefined,
    whatsapp: text(formData, "whatsapp") || undefined,
    country: text(formData, "country") || undefined,
    city: text(formData, "city") || undefined,
    address: text(formData, "address") || undefined,
    postalCode: text(formData, "postalCode") || undefined,
    status: text(formData, "status"),
    role: text(formData, "role"),
    tags: text(formData, "tags"),
    internalNote: text(formData, "internalNote")
  });
}

function profileData(data: z.infer<typeof customerProfileSchema>) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    whatsapp: data.whatsapp || null,
    country: data.country || null,
    city: data.city || null,
    address: data.address || null,
    postalCode: data.postalCode || null,
    status: data.status,
    role: data.role,
    tags: JSON.stringify(tagsFromText(data.tags || "")),
    internalNote: data.internalNote || null
  };
}

function revalidateCustomerRoutes(customerId?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/customers");
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);
}

export async function createCustomer(_prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  await requireAdmin();

  const parsed = parseProfile(formData);
  if (!parsed.success) {
    return { error: "请检查必填项（姓名、有效邮箱）以及各字段长度。" };
  }

  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: `邮箱为 ${parsed.data.email} 的客户已存在。` };
  }

  const customer = await prisma.customer.create({
    data: {
      ...profileData(parsed.data),
      wholesaleApprovedAt: parsed.data.role === "WHOLESALE" ? new Date() : null
    }
  });

  revalidateCustomerRoutes(customer.id);
  redirect(`/admin/customers/${customer.id}?saved=1`);
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requireAdmin();

  const parsed = parseProfile(formData);
  if (!parsed.success) {
    return { error: "请检查必填项（姓名、有效邮箱）以及各字段长度。" };
  }

  const current = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!current) {
    return { error: "未找到该客户。" };
  }

  if (parsed.data.email !== current.email) {
    const emailTaken = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
    if (emailTaken) {
      return { error: `${parsed.data.email} 已被其他客户使用。` };
    }
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...profileData(parsed.data),
      // Stamp approval time when upgrading to wholesale; clear it on downgrade.
      wholesaleApprovedAt:
        parsed.data.role === "WHOLESALE"
          ? current.wholesaleApprovedAt || new Date()
          : null
    }
  });

  revalidateCustomerRoutes(customerId);
  redirect(`/admin/customers/${customerId}?saved=1`);
}
