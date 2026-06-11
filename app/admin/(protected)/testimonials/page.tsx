import type { Metadata } from "next";
import { Star } from "lucide-react";
import { deleteTestimonial, toggleTestimonialPublished } from "@/app/admin/(protected)/testimonials/actions";
import { TestimonialForm } from "@/app/admin/(protected)/testimonials/testimonial-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Testimonials",
  description: "Manage customer testimonials shown on the storefront."
};

export default async function AdminTestimonialsPage({ searchParams }: { searchParams?: { saved?: string } }) {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return (
    <main>
      <div>
        <p className="font-black uppercase text-safety">Testimonials</p>
        <h1 className="text-4xl font-black">Customer Testimonials</h1>
        <p className="mt-3 text-steel">
          Published testimonials appear on the homepage. Record real buyer feedback from WhatsApp and orders.
        </p>
      </div>

      {searchParams?.saved === "1" && (
        <p className="mt-6 border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Testimonial saved.</p>
      )}

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_460px]">
        <div className="grid h-fit gap-0 border border-line bg-white">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-black">All Testimonials ({testimonials.length})</h2>
          </div>
          {testimonials.length === 0 ? (
            <p className="p-5 text-sm text-steel">No testimonials yet — add the first one with the form.</p>
          ) : (
            testimonials.map((testimonial) => (
              <article key={testimonial.id} className="grid gap-3 border-b border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <strong>{testimonial.authorName}</strong>
                    {testimonial.company && <span className="text-sm text-steel">· {testimonial.company}</span>}
                    <span className="text-sm text-steel">· {testimonial.country}</span>
                    <span className="inline-flex items-center gap-0.5 text-safety">
                      {Array.from({ length: testimonial.rating }).map((_, index) => (
                        <Star key={index} size={13} fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-black ${
                      testimonial.isPublished ? "bg-green-100 text-green-800" : "bg-panel text-steel"
                    }`}
                  >
                    {testimonial.isPublished ? "PUBLISHED" : "HIDDEN"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-steel">{testimonial.content}</p>
                {testimonial.contentZh && <p className="text-sm leading-6 text-steel">{testimonial.contentZh}</p>}
                <div className="flex gap-3">
                  <form action={toggleTestimonialPublished.bind(null, testimonial.id)}>
                    <button type="submit" className="text-sm font-black text-navy hover:underline">
                      {testimonial.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteTestimonial.bind(null, testimonial.id)}>
                    <button type="submit" className="text-sm font-black text-red-700 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <TestimonialForm />
      </section>
    </main>
  );
}
