"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { RepairGuide } from "@prisma/client";
import type { GuideFormState } from "@/app/admin/(protected)/guides/actions";

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

export function GuideForm({
  action,
  guide,
  submitLabel,
  saved
}: {
  action: (state: GuideFormState, formData: FormData) => Promise<GuideFormState>;
  guide?: RepairGuide;
  submitLabel: string;
  saved?: boolean;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid max-w-3xl gap-5 border border-line bg-white p-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Saved.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Title
        <input
          name="title"
          defaultValue={guide?.title}
          required
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="e.g. Why your small engine won't start"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Slug (URL identifier; leave blank to auto-generate from title)
        <input
          name="slug"
          defaultValue={guide?.slug}
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="why-small-engine-wont-start"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Status
        <select name="status" defaultValue={guide?.status ?? "DRAFT"} className="h-11 w-48 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Excerpt (optional)
        <textarea
          name="excerpt"
          defaultValue={guide?.excerpt ?? ""}
          rows={2}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="One-line summary used in listings and for SEO."
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Content (optional, plain text / Markdown)
        <textarea
          name="content"
          defaultValue={guide?.content ?? ""}
          rows={12}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="Repair steps, common causes, parts required..."
        />
      </label>

      <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          SEO Title (optional)
          <input name="seoTitle" defaultValue={guide?.seoTitle ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          SEO Description (optional)
          <input name="seoDescription" defaultValue={guide?.seoDescription ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
      </div>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
