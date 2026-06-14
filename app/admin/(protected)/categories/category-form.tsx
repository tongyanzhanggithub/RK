"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Category } from "@prisma/client";
import type { CategoryFormState } from "@/app/admin/(protected)/categories/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center gap-2 bg-safety px-6 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CategoryForm({
  action,
  category,
  submitLabel,
  saved
}: {
  action: (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  category?: Category;
  submitLabel: string;
  saved?: boolean;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-5 border border-line bg-white p-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Saved.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Category Name
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="e.g. Water Pump Repair Kit"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Slug (URL identifier; leave blank to auto-generate from name)
        <input
          name="slug"
          defaultValue={category?.slug}
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="water-pump-repair-kit"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Description (optional)
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={3}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="Short description used on the storefront and for SEO."
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Sort Order (lower shows first)
        <input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={category?.sortOrder ?? 0}
          className="h-11 w-40 border border-line px-3 font-normal outline-none focus:border-navy"
        />
      </label>

      <label className="inline-flex items-center gap-3 text-sm font-bold">
        <input type="checkbox" name="isActive" defaultChecked={category?.isActive ?? true} className="h-4 w-4" />
        Active (visible on storefront)
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
