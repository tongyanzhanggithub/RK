"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { WholesaleApplication } from "@prisma/client";
import type { WholesaleReviewState } from "@/app/admin/(protected)/wholesale/actions";

type Props = {
  application: WholesaleApplication;
  action: (state: WholesaleReviewState, formData: FormData) => Promise<WholesaleReviewState>;
  saved?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "保存审核中..." : "保存审核"}
    </button>
  );
}

export function WholesaleReviewForm({ application, action, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">审核申请</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          通过审核会将匹配邮箱的客户创建或升级为批发客户。
        </p>
      </div>

      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">审核已保存。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        审核状态
        <select name="status" defaultValue={application.status} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        内部审核备注
        <textarea
          name="adminNote"
          defaultValue={application.adminNote || ""}
          rows={7}
          placeholder="记录起订量、核实信息或拒绝原因。"
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>

      <p className="border border-line bg-panel p-3 text-xs leading-5 text-steel">
        在配置好邮件服务商之前，邮件通知状态将排队等待设置。
      </p>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  );
}
