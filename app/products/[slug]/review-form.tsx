"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { submitReview, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = { ok: false, error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[2.75rem] items-center justify-center bg-brand px-5 py-1.5 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit review"}
    </button>
  );
}

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [state, action] = useFormState(submitReview.bind(null, productSlug), initialState);
  const [rating, setRating] = useState(5);

  if (state.ok) {
    return (
      <p className="border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800">
        Thanks! Your review has been submitted and will appear once approved.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3 border border-line bg-panel p-5">
      <p className="font-black">Write a review</p>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star size={24} className={i <= rating ? "fill-brand text-brand" : "fill-none text-steel"} />
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="authorName" required placeholder="Your name" className="border border-line px-3 py-2" />
        <input name="country" placeholder="Country (optional)" className="border border-line px-3 py-2" />
      </div>
      <input name="title" placeholder="Title (optional)" className="border border-line px-3 py-2" />
      <textarea name="body" required rows={4} placeholder="Share your experience with this part…" className="border border-line px-3 py-2" />
      {state.error && <p className="text-sm font-bold text-red-700">{state.error}</p>}
      <TurnstileWidget />
      <SubmitButton />
    </form>
  );
}
