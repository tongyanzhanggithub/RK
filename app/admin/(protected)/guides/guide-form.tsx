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
      {pending ? "保存中…" : label}
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
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        标题
        <input
          name="title"
          defaultValue={guide?.title}
          required
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="例如：小型发动机无法启动的排查"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Slug（URL 标识，留空则按标题自动生成）
        <input
          name="slug"
          defaultValue={guide?.slug}
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="why-small-engine-wont-start"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        状态
        <select name="status" defaultValue={guide?.status ?? "DRAFT"} className="h-11 w-48 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="DRAFT">草稿</option>
          <option value="PUBLISHED">已发布</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        摘要（可选）
        <textarea
          name="excerpt"
          defaultValue={guide?.excerpt ?? ""}
          rows={2}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="一句话简介，用于列表与 SEO。"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        正文（可选，支持纯文本 / Markdown）
        <textarea
          name="content"
          defaultValue={guide?.content ?? ""}
          rows={12}
          className="border border-line px-3 py-2 font-normal outline-none focus:border-navy"
          placeholder="维修步骤、常见原因、所需配件…"
        />
      </label>

      <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          SEO 标题（可选）
          <input name="seoTitle" defaultValue={guide?.seoTitle ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          SEO 描述（可选）
          <input name="seoDescription" defaultValue={guide?.seoDescription ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
      </div>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
