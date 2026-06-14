"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type CouponFormState = {
  error?: string;
};

const couponSchema = z
  .object({
    code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
    discountValue: z.coerce.number().min(0),
    isActive: z.boolean(),
    minSubtotal: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    allowWholesaleCustomers: z.boolean()
  })
  .superRefine((coupon, context) => {
    if (coupon.type === "PERCENTAGE" && (coupon.discountValue <= 0 || coupon.discountValue > 100)) {
      context.addIssue({ code: "custom", path: ["discountValue"], message: "百分比优惠券的面值必须在 1 到 100 之间。" });
    }
    if (coupon.type === "FIXED_AMOUNT" && coupon.discountValue <= 0) {
      context.addIssue({ code: "custom", path: ["discountValue"], message: "固定金额优惠券需要填写折扣面值。" });
    }
    if (coupon.startsAt && coupon.endsAt && new Date(coupon.endsAt) <= new Date(coupon.startsAt)) {
      context.addIssue({ code: "custom", path: ["endsAt"], message: "结束时间必须晚于开始时间。" });
    }
  });

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optionalNumberText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : undefined;
}

function dateOrNull(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function couponDataFromForm(formData: FormData) {
  const parsed = couponSchema.safeParse({
    code: text(formData, "code").toUpperCase(),
    type: text(formData, "type"),
    discountValue: text(formData, "discountValue") || "0",
    isActive: formData.get("isActive") === "on",
    minSubtotal: optionalNumberText(formData, "minSubtotal"),
    usageLimit: optionalNumberText(formData, "usageLimit"),
    startsAt: text(formData, "startsAt") || undefined,
    endsAt: text(formData, "endsAt") || undefined,
    allowWholesaleCustomers: formData.get("allowWholesaleCustomers") === "on"
  });

  if (!parsed.success) {
    return { error: "请检查优惠码、类型、面值、使用限制以及有效期是否填写正确。" };
  }

  const coupon = parsed.data;
  return {
    data: {
      code: coupon.code,
      type: coupon.type,
      value:
        coupon.type === "FIXED_AMOUNT"
          ? Math.round(coupon.discountValue * 100)
          : coupon.type === "PERCENTAGE"
            ? Math.round(coupon.discountValue)
            : 0,
      isActive: coupon.isActive,
      minSubtotalCents: coupon.minSubtotal === undefined ? null : Math.round(coupon.minSubtotal * 100),
      usageLimit: coupon.usageLimit ?? null,
      // perCustomerLimit is intentionally not exposed: the checkout flow has no
      // customer identity before payment, so the limit cannot be enforced yet.
      startsAt: dateOrNull(coupon.startsAt),
      endsAt: dateOrNull(coupon.endsAt),
      allowWholesaleCustomers: coupon.allowWholesaleCustomers
    }
  };
}

function revalidateCouponRoutes() {
  revalidatePath("/cart");
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/dashboard");
}

export async function createCoupon(_previousState: CouponFormState, formData: FormData): Promise<CouponFormState> {
  await requireAdmin();
  const result = couponDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let coupon;
  try {
    coupon = await prisma.coupon.create({ data: result.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法创建优惠券。" };
  }

  revalidateCouponRoutes();
  redirect(`/admin/coupons/${coupon.id}/edit?saved=1`);
}

export async function updateCoupon(
  couponId: string,
  _previousState: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  await requireAdmin();
  const result = couponDataFromForm(formData);
  if ("error" in result) return { error: result.error };

  let coupon;
  try {
    coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: result.data
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法更新优惠券。" };
  }

  revalidateCouponRoutes();
  redirect(`/admin/coupons/${coupon.id}/edit?saved=1`);
}
