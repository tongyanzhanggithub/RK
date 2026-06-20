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
      className="inline-flex h-12 items-center justify-center gap-2 bg-brand px-6 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "保存中…" : label}
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
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        分类名称
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="例如：水泵维修套件"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Slug（URL 标识，留空则按名称自动生成）
        <input
          name="slug"
          defaultValue={category?.slug}
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="water-pump-repair-kit"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        描述（可选）
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={3}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="分类简介，用于前台展示与 SEO。"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        排序（数字越小越靠前）
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
        启用（前台显示）
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
