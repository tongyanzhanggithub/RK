import type { Product as DbProduct } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Product } from "@/data/products";
import { saleState } from "@/lib/sale";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeProduct(product: DbProduct): Product {
  // Resolve the flash-sale window once: when live, priceCents becomes the sale
  // price and the original is surfaced as compareAtPriceCents for the strike-through.
  const sale = saleState(product);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle || undefined,
    sku: product.sku,
    category: product.category,
    brand: product.brand || undefined,
    shortDescription: product.shortDescription,
    description: product.description || undefined,
    status: product.status as Product["status"],
    priceRange: product.priceRange,
    priceCents: sale.priceCents,
    currency: "usd",
    compareAtPriceCents: sale.originalCents || undefined,
    salePriceCents: sale.onSale ? sale.priceCents : undefined,
    saleEndsAt: sale.onSale && sale.endsAt ? sale.endsAt.toISOString() : undefined,
    onSale: sale.onSale,
    wholesalePriceCents: product.wholesalePriceCents || undefined,
    costPriceCents: product.costPriceCents || undefined,
    allowCoupons: product.allowCoupons,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    weightGrams: product.weightGrams || undefined,
    lengthMm: product.lengthMm || undefined,
    widthMm: product.widthMm || undefined,
    heightMm: product.heightMm || undefined,
    wholesaleAvailable: product.wholesaleAvailable,
    isFeatured: product.isFeatured,
    isHotSeller: product.isHotSeller,
    fitmentType: product.fitmentType === "UNIVERSAL" ? "UNIVERSAL" : "SPECIFIC",
    fitmentNote: product.fitmentNote || undefined,
    fitmentGuaranteed: product.fitmentGuaranteed,
    tags: parseJson<string[]>(product.tags, []),
    compatibleModels: parseJson<string[]>(product.compatibleModels, []),
    compatibleEquipment: parseJson<string[]>(product.compatibleEquipment, []),
    problemsSolved: parseJson<string[]>(product.problemsSolved, []),
    kitIncludes: parseJson<string[]>(product.kitIncludes, []),
    notCompatibleWith: parseJson<string[]>(product.notCompatibleWith, []),
    specifications: parseJson<Product["specifications"]>(product.specifications, []),
    faqs: parseJson<Product["faqs"]>(product.faqs, []),
    images: parseJson<Product["images"]>(product.images, []),
    image: product.image || undefined,
    seoTitle: product.seoTitle || undefined,
    seoDescription: product.seoDescription || undefined,
    seoKeywords: product.seoKeywords || undefined,
    ogImage: product.ogImage || undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

export async function getStoreProducts(options: { includeArchived?: boolean } = {}) {
  const products = await prisma.product.findMany({
    where: options.includeArchived ? undefined : { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { isHotSeller: "desc" }, { createdAt: "desc" }]
  });

  return products.map(normalizeProduct);
}

export async function getStoreProduct(slug: string, options: { includeInactive?: boolean } = {}) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return null;
  if (!options.includeInactive && product.status !== "ACTIVE") return null;
  return normalizeProduct(product);
}
