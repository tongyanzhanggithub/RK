"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { parseCsv } from "@/lib/csv";
import { prisma } from "@/lib/db";

export type ImportState = {
  error?: string;
  created?: number;
  updated?: number;
  rowErrors?: string[];
};

const rowSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 格式无效"),
  name: z.string().min(2),
  sku: z.string().min(1),
  category: z.string().min(1),
  shortDescription: z.string().min(1),
  retailPrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  compareAtPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  fitmentType: z.enum(["SPECIFIC", "UNIVERSAL"]).optional(),
  brand: z.string().optional(),
  fitmentNote: z.string().optional(),
  compatibleModels: z.string().optional(),
  compatibleEquipment: z.string().optional(),
  tags: z.string().optional(),
  image: z.string().optional()
});

function listJson(value?: string) {
  if (!value) return "[]";
  return JSON.stringify(
    value
      .split(/[;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function dollarsToCents(value?: number) {
  return value === undefined ? undefined : Math.round(value * 100);
}

export async function importProducts(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireAdmin();
  const raw = String(formData.get("csv") || "").trim();
  if (!raw) return { error: "请粘贴 CSV 内容。" };

  const rows = parseCsv(raw);
  if (rows.length < 2) return { error: "CSV 至少需要表头和一行数据。" };

  const header = rows[0].map((cell) => cell.trim());
  const dataRows = rows.slice(1);

  let created = 0;
  let updated = 0;
  const rowErrors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i];
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });

    const parsed = rowSchema.safeParse(record);
    if (!parsed.success) {
      rowErrors.push(`第 ${i + 2} 行（${record.slug || record.sku || "?"}）：${parsed.error.issues[0]?.message || "字段无效"}`);
      continue;
    }
    const d = parsed.data;

    try {
      const existing = await prisma.product.findUnique({ where: { slug: d.slug } });
      const priceCents = Math.round(d.retailPrice * 100);

      // Fields safe to update on every import.
      const common = {
        name: d.name,
        sku: d.sku,
        category: d.category,
        shortDescription: d.shortDescription,
        brand: d.brand || null,
        status: d.status || "ACTIVE",
        priceRange: `USD ${d.retailPrice.toFixed(2)}`,
        priceCents,
        compareAtPriceCents: dollarsToCents(d.compareAtPrice) ?? null,
        stock: d.stock ?? 0,
        lowStockThreshold: d.lowStockThreshold ?? 5,
        fitmentType: d.fitmentType || "SPECIFIC",
        fitmentNote: d.fitmentNote || null,
        compatibleModels: listJson(d.compatibleModels),
        compatibleEquipment: listJson(d.compatibleEquipment),
        tags: listJson(d.tags),
        image: d.image || null
      };

      if (existing) {
        await prisma.product.update({ where: { slug: d.slug }, data: common });
        updated += 1;
      } else {
        await prisma.product.create({
          data: {
            ...common,
            slug: d.slug,
            currency: "usd",
            // Required JSON fields with no default — seed empty for new rows.
            problemsSolved: "[]",
            kitIncludes: "[]",
            seoTitle: d.name,
            seoDescription: d.shortDescription
          }
        });
        created += 1;
      }
    } catch (error) {
      rowErrors.push(`第 ${i + 2} 行（${d.slug}）：${error instanceof Error ? error.message : "写入失败（slug/sku 可能重复）"}`);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { created, updated, rowErrors };
}
