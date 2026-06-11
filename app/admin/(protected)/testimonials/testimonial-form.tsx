"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createTestimonial, type TestimonialFormState } from "@/app/admin/(protected)/testimonials/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Add Testimonial"}
    </button>
  );
}

export function TestimonialForm() {
  const [state, formAction] = useFormState<TestimonialFormState, FormData>(createTestimonial, {});

  return (
    <form action={formAction} className="grid gap-4 border border-line bg-white p-5">
      <h2 className="text-xl font-black">Add Testimonial</h2>
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Customer Name
          <input name="authorName" required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" placeholder="Ahmed M." />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Company (optional)
          <input name="company" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" placeholder="Al-Noor Machinery" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Country
          <input name="country" required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" placeholder="United Arab Emirates" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Rating
          <select name="rating" defaultValue="5" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Content (English)
        <textarea
          name="content"
          required
          rows={3}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
          placeholder="Ordered 200 repair kits for our workshop chain. Quality matched OEM and shipping to Dubai took 12 days."
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Content (Chinese, optional)
        <textarea
          name="contentZh"
          rows={3}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
          placeholder="中文版本（切换中文时显示）"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Sort Order (smaller shows first)
          <input name="sortOrder" type="number" defaultValue="0" min="0" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-bold">
          <input name="isPublished" type="checkbox" defaultChecked className="h-4 w-4" />
          Publish immediately
        </label>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
