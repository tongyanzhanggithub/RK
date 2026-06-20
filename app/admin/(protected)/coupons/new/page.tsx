import type { Metadata } from "next";
import Link from "next/link";
import { createCoupon } from "@/app/admin/(protected)/coupons/actions";
import { CouponForm } from "@/app/admin/(protected)/coupons/coupon-form";

export const metadata: Metadata = {
  title: "新增优惠券",
  description: "创建一个优惠码。"
};

export default function NewCouponPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-brand">优惠券</p>
          <h1 className="text-4xl font-black">新增优惠券</h1>
          <p className="mt-3 text-steel">创建带使用限制和有效期控制的结算优惠券。</p>
        </div>
        <Link href="/admin/coupons" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          返回优惠券列表
        </Link>
      </div>
      <CouponForm action={createCoupon} submitLabel="创建优惠券" />
    </main>
  );
}
