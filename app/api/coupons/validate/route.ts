import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { calculateCouponDiscount, normalizeCouponCode } from "@/lib/coupons";
import { prisma } from "@/lib/db";
import { getStoreProducts } from "@/lib/product-store";
import { SHIPPING_CENTS } from "@/lib/shipping";

export const runtime = "nodejs";

const payloadSchema = z.object({
  couponCode: z.string().min(1).max(80),
  items: z.array(
    z.object({
      slug: z.string().min(1),
      quantity: z.coerce.number().int().min(1).max(99)
    })
  )
});

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid coupon validation payload." }, { status: 400 });
  }

  const code = normalizeCouponCode(payload.couponCode);
  const products = await getStoreProducts();
  const lines = payload.items
    .map((item) => {
      const product = products.find((candidate) => candidate.slug === item.slug);
      if (!product) return null;
      return {
        priceCents: product.priceCents,
        quantity: item.quantity,
        allowCoupons: product.allowCoupons
      };
    })
    .filter(Boolean) as { priceCents: number; quantity: number; allowCoupons?: boolean | null }[];

  if (lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty or products are unavailable." }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const validation = calculateCouponDiscount({ coupon, lines, shippingCents: SHIPPING_CENTS });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  return NextResponse.json({
    code: validation.result.code,
    type: validation.result.type,
    value: validation.result.value,
    label: validation.result.label,
    discountCents: validation.result.discountCents,
    eligibleSubtotalCents: validation.result.eligibleSubtotalCents
  });
}
