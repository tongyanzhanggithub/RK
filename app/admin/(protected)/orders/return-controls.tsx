"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ReturnRequest } from "@prisma/client";
import { createReturnRequest, updateReturnStatus, type ReturnFormState } from "@/app/admin/(protected)/orders/return-actions";

const NEXT_STATUS: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED", "REJECTED"],
  RECEIVED: ["REFUNDED", "CLOSED"],
  REFUNDED: ["CLOSED"],
  REJECTED: [],
  CLOSED: []
};

const STATUS_ZH: Record<string, string> = {
  REQUESTED: "已申请",
  APPROVED: "已批准",
  RECEIVED: "已收货",
  REFUNDED: "已退款",
  REJECTED: "已拒绝",
  CLOSED: "已关闭"
};

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 shrink-0 bg-navy px-3 text-sm font-black text-white disabled:opacity-60">
      {pending ? "创建中…" : "新建退货"}
    </button>
  );
}

export function ReturnControls({ orderId, returns }: { orderId: string; returns: ReturnRequest[] }) {
  const [state, formAction] = useFormState<ReturnFormState, FormData>(createReturnRequest.bind(null, orderId), {});

  return (
    <div className="grid gap-4">
      {returns.length > 0 && (
        <div className="grid gap-3">
          {returns.map((r) => (
            <div key={r.id} className="border border-line p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black">
                  {STATUS_ZH[r.status] || r.status} · {r.resolution}
                </span>
                <span className="text-xs text-steel">{r.createdAt.toLocaleString("zh-CN")}</span>
              </div>
              {r.reason && <p className="mt-1 text-steel">原因：{r.reason}</p>}
              {NEXT_STATUS[r.status]?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {NEXT_STATUS[r.status].map((s) => (
                    <form key={s} action={updateReturnStatus.bind(null, r.id)}>
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className="border border-navy px-2 py-1 text-xs font-black text-navy hover:bg-panel">
                        → {STATUS_ZH[s]}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="grid gap-2 border-t border-line pt-3">
        {state?.error && <p className="border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-800">{state.error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <select name="resolution" defaultValue="REFUND" className="h-10 border border-line px-2 text-sm font-bold outline-none">
            <option value="REFUND">退款</option>
            <option value="REPLACE">换货</option>
            <option value="REPAIR">维修</option>
          </select>
          <input name="reason" placeholder="退货原因（选填）" className="h-10 min-w-0 flex-1 border border-line px-3 text-sm outline-none focus:border-navy" />
          <CreateButton />
        </div>
      </form>
    </div>
  );
}
