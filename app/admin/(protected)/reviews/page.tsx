import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { deleteReview, toggleReviewPublished } from "@/app/admin/(protected)/reviews/actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "产品评价管理",
  description: "审核客户提交的产品评价（通过后才在前台展示）。"
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    // 待审核(未发布)排在最前
    orderBy: [{ isPublished: "asc" }, { createdAt: "desc" }]
  });
  const pending = reviews.filter((r) => !r.isPublished).length;

  return (
    <main>
      <div>
        <p className="font-black uppercase text-brand">产品评价</p>
        <h1 className="text-4xl font-black">评价审核</h1>
        <p className="mt-3 text-steel">
          客户在产品页提交的评价默认“待审核”，通过后才显示在前台。
          {pending > 0 && <span className="ml-1 font-black text-red-700">{pending} 条待审核。</span>}
        </p>
      </div>

      <section className="mt-8 grid h-fit gap-0 border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">全部评价（{reviews.length}）</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="p-5 text-sm text-steel">还没有评价。</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="grid gap-3 border-b border-line p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{review.authorName}</strong>
                  {review.country && <span className="text-sm text-steel">· {review.country}</span>}
                  <span className="inline-flex items-center gap-0.5 text-brand">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} size={13} fill="currentColor" />
                    ))}
                  </span>
                  <Link href={`/products/${review.productSlug}`} className="text-sm font-bold text-navy hover:underline">
                    /{review.productSlug}
                  </Link>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-black ${
                    review.isPublished ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {review.isPublished ? "PUBLISHED" : "待审核"}
                </span>
              </div>
              {review.title && <p className="font-black">{review.title}</p>}
              <p className="text-sm leading-6 text-steel">{review.body}</p>
              <div className="flex gap-3">
                <form action={toggleReviewPublished.bind(null, review.id)}>
                  <button type="submit" className="text-sm font-black text-navy hover:underline">
                    {review.isPublished ? "下架" : "通过并发布"}
                  </button>
                </form>
                <form action={deleteReview.bind(null, review.id)}>
                  <button type="submit" className="text-sm font-black text-red-700 hover:underline">
                    删除
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
