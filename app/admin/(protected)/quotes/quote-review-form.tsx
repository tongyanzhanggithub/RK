"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { QuoteRequest } from "@prisma/client";
import type { QuoteAdminState } from "@/app/admin/(protected)/quotes/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60">
      {pending ? "保存中..." : "保存"}
    </button>
  );
}

export function QuoteReviewForm({
  quote,
  action,
  saved
}: {
  quote: QuoteRequest;
  action: (state: QuoteAdminState, formData: FormData) => Promise<QuoteAdminState>;
  saved?: boolean;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="grid gap-4 border border-line bg-white p-5">
      <h2 className="text-xl font-black">报价跟进</h2>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
      <label className="grid gap-2 text-sm font-bold">
        状态
        <select name="status" defaultValue={quote.status} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="NEW">待报价</option>
          <option value="QUOTED">已报价</option>
          <option value="CLOSED">已关闭</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        管理员备注
        <textarea name="adminNote" defaultValue={quote.adminNote || ""} rows={4} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" placeholder="报价金额、MOQ、运费、跟进记录..." />
      </label>
      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  );
}
