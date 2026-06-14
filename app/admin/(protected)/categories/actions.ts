"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type CategoryFormState = {
  error?: string;
};

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens."),
  description: z.string().max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryDataFromForm(formData: FormData) {
  const rawName = text(formData, "name");
  const rawSlug = text(formData, "slug") || slugify(rawName);
  const parsed = categorySchema.safeParse({
    name: rawName,
    slug: rawSlug,
    description: text(formData, "description") || undefined,
    sortOrder: text(formData, "sortOrder") || "0",
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please check the category name, slug and sort order." };
  }

  const c = parsed.data;
  return {
    data: {
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      sortOrder: c.sortOrder,
      isActive: c.isActive
    }
  };
}

function revalidateCategoryRoutes() {
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  const result = categoryDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let category;
  try {
    category = await prisma.category.create({ data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create category (slug may already exist)." };
  }

  revalidateCategoryRoutes();
  redirect(`/admin/categories/${category.id}/edit?saved=1`);
}

export async function updateCategory(
  categoryId: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();
  const result = categoryDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let category;
  try {
    category = await prisma.category.update({ where: { id: categoryId }, data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update category." };
  }

  revalidateCategoryRoutes();
  redirect(`/admin/categories/${category.id}/edit?saved=1`);
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: categoryId } });
  revalidateCategoryRoutes();
  redirect("/admin/categories");
}
