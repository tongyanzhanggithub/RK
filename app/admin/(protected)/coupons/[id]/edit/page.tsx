import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCoupon } from "@/app/admin/(protected)/coupons/actions";
import { CouponForm } from "@/app/admin/(protected)/coupons/coupon-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑优惠券",
  description: "编辑一个优惠码。"
};

export default async function EditCouponPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) notFound();

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">优惠券</p>
          <h1 className="text-4xl font-black">{coupon.code}</h1>
          <p className="mt-3 text-steel">编辑优惠券状态、面值、使用限制和有效期。</p>
        </div>
        <Link href="/admin/coupons" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回优惠券列表
        </Link>
      </div>
      <CouponForm
        coupon={coupon}
        action={updateCoupon.bind(null, coupon.id)}
        submitLabel="保存优惠券"
        saved={searchParams?.saved === "1"}
      />
    </main>
  );
}
