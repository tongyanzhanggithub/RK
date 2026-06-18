"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { logOrderEvent } from "@/lib/order-events";

export type ManualOrderState = { error?: string };

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function orderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RK-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createManualOrder(_prev: ManualOrderState, formData: FormData): Promise<ManualOrderState> {
  const admin = await requireAdmin();

  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  if (name.length < 2 || !email.includes("@")) return { error: "请填写客户姓名和有效邮箱。" };

  const paid = text(formData, "paymentStatus") === "PAID";
  const shippingCents = Math.max(0, Math.round(Number(text(formData, "shipping") || "0") * 100));

  const products = await getStoreProducts();
  const lines = products
    .map((p) => ({ p, qty: Math.max(0, Math.floor(Number(formData.get(`qty_${p.slug}`) || 0))) }))
    .filter((l) => l.qty > 0);
  if (lines.length === 0) return { error: "请至少为一个商品填写数量。" };

  const subtotalCents = lines.reduce((t, l) => t + l.p.priceCents * l.qty, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      customerName: name,
      customerEmail: email,
      customerPhone: text(formData, "phone") || null,
      country: text(formData, "country") || "-",
      city: text(formData, "city") || null,
      shippingAddress: text(formData, "address") || null,
      postalCode: text(formData, "postalCode") || null,
      currency: "usd",
      subtotalCents,
      shippingCents,
      taxCents: 0,
      discountCents: 0,
      totalCents: subtotalCents + shippingCents,
      paymentMethod: "manual",
      paymentStatus: paid ? "PAID" : "PENDING",
      paidAt: paid ? new Date() : null,
      orderStatus: "PROCESSING",
      fulfillmentStatus: "UNFULFILLED",
      internalNote: text(formData, "note") || "手动建单（线下/电汇）",
      inventoryReduced: false,
      items: {
        create: lines.map((l) => ({
          productId: l.p.id,
          productName: l.p.name,
          productSlug: l.p.slug,
          sku: l.p.sku || l.p.slug,
          unitPriceCents: l.p.priceCents,
          quantity: l.qty,
          subtotalCents: l.p.priceCents * l.qty,
          image: l.p.image || null
        }))
      }
    }
  });

  if (paid) {
    await prisma.$transaction(async (tx) => {
      for (const l of lines) {
        const product = await tx.product.findUnique({ where: { id: l.p.id } });
        if (!product) continue;
        const stockAfter = Math.max(0, product.stock - l.qty);
        await tx.product.update({ where: { id: product.id }, data: { stock: stockAfter } });
        await tx.inventoryAdjustment.create({
          data: {
            productId: product.id, type: "SALE", quantityDelta: stockAfter - product.stock,
            stockBefore: product.stock, stockAfter, reason: "Manual order", reference: order.orderNumber, createdBy: admin.email
          }
        });
      }
      await tx.order.update({ where: { id: order.id }, data: { inventoryReduced: true } });
    });
  }

  await logOrderEvent(order.id, "MANUAL", `手动建单（${paid ? "已付款" : "待付款"}，线下/电汇）`, admin.email);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}?saved=1`);
}
