import type { Coupon } from "@prisma/client";

export type CouponLine = {
  priceCents: number;
  quantity: number;
  allowCoupons?: boolean | null;
};

export type CouponValidationResult = {
  coupon: Coupon;
  code: string;
  type: string;
  value: number;
  label: string;
  discountCents: number;
  eligibleSubtotalCents: number;
};

export function normalizeCouponCode(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function couponDisplayValue(coupon: Pick<Coupon, "type" | "value">) {
  if (coupon.type === "PERCENTAGE") return `${coupon.value}%`;
  if (coupon.type === "FIXED_AMOUNT") return `$${(coupon.value / 100).toFixed(2)}`;
  if (coupon.type === "FREE_SHIPPING") return "Free shipping";
  return String(coupon.value);
}

export function couponLabel(coupon: Pick<Coupon, "code" | "type" | "value">) {
  return `${coupon.code} / ${couponDisplayValue(coupon)}`;
}

export function calculateCouponDiscount({
  coupon,
  lines,
  shippingCents,
  now = new Date()
}: {
  coupon: Coupon | null;
  lines: CouponLine[];
  shippingCents: number;
  now?: Date;
}): { ok: true; result: CouponValidationResult } | { ok: false; error: string } {
  if (!coupon) return { ok: false, error: "Coupon code was not found." };

  const subtotalCents = lines.reduce((total, line) => total + line.priceCents * line.quantity, 0);
  const eligibleSubtotalCents = lines
    .filter((line) => line.allowCoupons !== false)
    .reduce((total, line) => total + line.priceCents * line.quantity, 0);

  if (!coupon.isActive) return { ok: false, error: "This coupon is not active." };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "This coupon has not started yet." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "This coupon has expired." };
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (coupon.minSubtotalCents !== null && subtotalCents < coupon.minSubtotalCents) {
    return { ok: false, error: `This coupon requires at least $${(coupon.minSubtotalCents / 100).toFixed(2)} in products.` };
  }
  if (eligibleSubtotalCents <= 0 && coupon.type !== "FREE_SHIPPING") {
    return { ok: false, error: "The products in this cart do not allow coupons." };
  }

  let discountCents = 0;
  if (coupon.type === "PERCENTAGE") {
    discountCents = Math.round(eligibleSubtotalCents * (coupon.value / 100));
  } else if (coupon.type === "FIXED_AMOUNT") {
    discountCents = Math.min(coupon.value, eligibleSubtotalCents);
  } else if (coupon.type === "FREE_SHIPPING") {
    discountCents = shippingCents;
  } else {
    return { ok: false, error: "Unsupported coupon type." };
  }

  if (discountCents <= 0) return { ok: false, error: "This coupon does not apply a discount to the current cart." };

  return {
    ok: true,
    result: {
      coupon,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      label: couponLabel(coupon),
      discountCents,
      eligibleSubtotalCents
    }
  };
}
