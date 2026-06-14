"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type ProductFormState = {
  error?: string;
};

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().optional(),
  sku: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().optional(),
  shortDescription: z.string().min(10),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  retailPrice: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  wholesalePrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  currency: z.literal("usd"),
  allowCoupons: z.boolean(),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  weightGrams: z.coerce.number().int().min(0).optional(),
  lengthMm: z.coerce.number().int().min(0).optional(),
  widthMm: z.coerce.number().int().min(0).optional(),
  heightMm: z.coerce.number().int().min(0).optional(),
  wholesaleAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isHotSeller: z.boolean(),
  tagsText: z.string().optional(),
  kitIncludesText: z.string().optional(),
  compatibleModelsText: z.string().optional(),
  compatibleEquipmentText: z.string().optional(),
  problemsSolvedText: z.string().optional(),
  notCompatibleWithText: z.string().optional(),
  specificationsText: z.string().optional(),
  faqsText: z.string().optional(),
  image: z.string().optional(),
  imagesText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  ogImage: z.string().optional()
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optionalNumber(value: number | undefined) {
  return value && Number.isFinite(value) ? value : null;
}

function dollarsToCents(value: number | undefined) {
  return value && Number.isFinite(value) ? Math.round(value * 100) : null;
}

function listFromText(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function specsFromText(value: string | undefined) {
  return listFromText(value)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label?.trim(), value: rest.join(":").trim() };
    })
    .filter((item) => item.label && item.value);
}

function faqsFromText(value: string | undefined) {
  return (value || "")
    .split("\n")
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return { question: question?.trim(), answer: rest.join("|").trim() };
    })
    .filter((item) => item.question && item.answer);
}

function imagesFromText(value: string | undefined) {
  return (value || "")
    .split("\n")
    .map((line, index) => {
      const [url, alt, primary] = line.split("|").map((item) => item?.trim());
      return {
        url,
        alt: alt || "Product image",
        sortOrder: index,
        isPrimary: primary?.toLowerCase() === "primary"
      };
    })
    .filter((item) => item.url);
}

function productDataFromForm(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    subtitle: text(formData, "subtitle"),
    sku: text(formData, "sku"),
    category: text(formData, "category"),
    brand: text(formData, "brand"),
    shortDescription: text(formData, "shortDescription"),
    description: text(formData, "description"),
    status: text(formData, "status"),
    retailPrice: text(formData, "retailPrice"),
    compareAtPrice: text(formData, "compareAtPrice") || undefined,
    wholesalePrice: text(formData, "wholesalePrice") || undefined,
    costPrice: text(formData, "costPrice") || undefined,
    currency: text(formData, "currency") || "usd",
    allowCoupons: formData.get("allowCoupons") === "on",
    stock: text(formData, "stock") || "0",
    lowStockThreshold: text(formData, "lowStockThreshold") || "0",
    weightGrams: text(formData, "weightGrams") || undefined,
    lengthMm: text(formData, "lengthMm") || undefined,
    widthMm: text(formData, "widthMm") || undefined,
    heightMm: text(formData, "heightMm") || undefined,
    wholesaleAvailable: formData.get("wholesaleAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isHotSeller: formData.get("isHotSeller") === "on",
    tagsText: text(formData, "tagsText"),
    kitIncludesText: text(formData, "kitIncludesText"),
    compatibleModelsText: text(formData, "compatibleModelsText"),
    compatibleEquipmentText: text(formData, "compatibleEquipmentText"),
    problemsSolvedText: text(formData, "problemsSolvedText"),
    notCompatibleWithText: text(formData, "notCompatibleWithText"),
    specificationsText: text(formData, "specificationsText"),
    faqsText: text(formData, "faqsText"),
    image: text(formData, "image"),
    imagesText: text(formData, "imagesText"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
    seoKeywords: text(formData, "seoKeywords"),
    ogImage: text(formData, "ogImage")
  });

  if (!parsed.success) {
    return { error: "Please check required fields, slug format, prices and inventory values." };
  }

  const product = parsed.data;
  const priceCents = Math.round(product.retailPrice * 100);

  return {
    data: {
      name: product.name,
      slug: product.slug,
      subtitle: product.subtitle || null,
      sku: product.sku,
      category: product.category,
      brand: product.brand || null,
      shortDescription: product.shortDescription,
      description: product.description || null,
      status: product.status,
      priceRange: `USD ${product.retailPrice.toFixed(2)}`,
      priceCents,
      currency: "usd",
      compareAtPriceCents: dollarsToCents(product.compareAtPrice),
      wholesalePriceCents: dollarsToCents(product.wholesalePrice),
      costPriceCents: dollarsToCents(product.costPrice),
      allowCoupons: product.allowCoupons,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      weightGrams: optionalNumber(product.weightGrams),
      lengthMm: optionalNumber(product.lengthMm),
      widthMm: optionalNumber(product.widthMm),
      heightMm: optionalNumber(product.heightMm),
      wholesaleAvailable: product.wholesaleAvailable,
      isFeatured: product.isFeatured,
      isHotSeller: product.isHotSeller,
      tags: JSON.stringify(listFromText(product.tagsText)),
      kitIncludes: JSON.stringify(listFromText(product.kitIncludesText)),
      compatibleModels: JSON.stringify(listFromText(product.compatibleModelsText)),
      compatibleEquipment: JSON.stringify(listFromText(product.compatibleEquipmentText)),
      problemsSolved: JSON.stringify(listFromText(product.problemsSolvedText)),
      notCompatibleWith: JSON.stringify(listFromText(product.notCompatibleWithText)),
      specifications: JSON.stringify(specsFromText(product.specificationsText)),
      faqs: JSON.stringify(faqsFromText(product.faqsText)),
      image: product.image || null,
      images: JSON.stringify(imagesFromText(product.imagesText)),
      seoTitle: product.seoTitle || product.name,
      seoDescription: product.seoDescription || product.shortDescription,
      seoKeywords: product.seoKeywords || product.tagsText || null,
      ogImage: product.ogImage || product.image || null
    }
  };
}

function revalidateProductRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/cart");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const admin = await requireAdmin();
  const result = productDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let product;
  try {
    product = await prisma.$transaction(async (transaction) => {
      const createdProduct = await transaction.product.create({
        data: {
          ...result.data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      await transaction.inventoryAdjustment.create({
        data: {
          productId: createdProduct.id,
          type: "INITIAL",
          quantityDelta: createdProduct.stock,
          stockBefore: 0,
          stockAfter: createdProduct.stock,
          reason: "Initial inventory from product creation",
          reference: "PRODUCT_CREATE",
          createdBy: admin.email
        }
      });
      return createdProduct;
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create product." };
  }

  revalidateProductRoutes(product.slug);
  redirect(`/admin/products/${product.id}/edit?saved=1`);
}

export async function updateProduct(productId: string, _prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const admin = await requireAdmin();
  const result = productDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let product;
  try {
    product = await prisma.$transaction(async (transaction) => {
      const existingProduct = await transaction.product.findUnique({ where: { id: productId } });
      if (!existingProduct) throw new Error("Product not found.");

      const updatedProduct = await transaction.product.update({
        where: { id: productId },
        data: {
          ...result.data,
          updatedAt: new Date()
        }
      });
      if (existingProduct.stock !== updatedProduct.stock) {
        await transaction.inventoryAdjustment.create({
          data: {
            productId,
            type: "CORRECTION",
            quantityDelta: updatedProduct.stock - existingProduct.stock,
            stockBefore: existingProduct.stock,
            stockAfter: updatedProduct.stock,
            reason: "Inventory changed from product editor",
            reference: "PRODUCT_EDIT",
            createdBy: admin.email
          }
        });
      }
      return updatedProduct;
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update product." };
  }

  revalidateProductRoutes(product.slug);
  redirect(`/admin/products/${product.id}/edit?saved=1`);
}

export async function archiveProduct(productId: string) {
  await requireAdmin();
  const product = await prisma.product.update({
    where: { id: productId },
    data: { status: "ARCHIVED" }
  });
  revalidateProductRoutes(product.slug);
}
