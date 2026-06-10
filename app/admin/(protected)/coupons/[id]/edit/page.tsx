import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCoupon } from "@/app/admin/(protected)/coupons/actions";
import { CouponForm } from "@/app/admin/(protected)/coupons/coupon-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Coupon",
  description: "Edit a coupon code."
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
          <p className="font-black uppercase text-safety">Coupons</p>
          <h1 className="text-4xl font-black">{coupon.code}</h1>
          <p className="mt-3 text-steel">Edit coupon status, value, limits and date range.</p>
        </div>
        <Link href="/admin/coupons" className="inline-flex h-11 items-center justify-center border border-navy px-4 font-black text-navy hover:bg-white">
          Back to Coupons
        </Link>
      </div>
      <CouponForm
        coupon={coupon}
        action={updateCoupon.bind(null, coupon.id)}
        submitLabel="Save Coupon"
        saved={searchParams?.saved === "1"}
      />
    </main>
  );
}
