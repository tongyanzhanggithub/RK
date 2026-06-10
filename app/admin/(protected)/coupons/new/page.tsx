import type { Metadata } from "next";
import Link from "next/link";
import { createCoupon } from "@/app/admin/(protected)/coupons/actions";
import { CouponForm } from "@/app/admin/(protected)/coupons/coupon-form";

export const metadata: Metadata = {
  title: "New Coupon",
  description: "Create a coupon code."
};

export default function NewCouponPage() {
  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black uppercase text-safety">Coupons</p>
          <h1 className="text-4xl font-black">New Coupon</h1>
          <p className="mt-3 text-steel">Create a checkout coupon with limits and date controls.</p>
        </div>
        <Link href="/admin/coupons" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Coupons
        </Link>
      </div>
      <CouponForm action={createCoupon} submitLabel="Create Coupon" />
    </main>
  );
}
