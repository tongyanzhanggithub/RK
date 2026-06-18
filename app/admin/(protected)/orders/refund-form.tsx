"use client";

import { useFormState, useFormStatus } from "react-dom";
import { refundOrder, type OrderFormState } from "@/app/admin/(protected)/orders/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 shrink-0 border border-red-300 px-3 text-sm font-black text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "退款中…" : "发起退款"}
    </button>
  );
}

export function RefundForm({
  orderId,
  currency,
  refundableMajor
}: {
  orderId: string;
  currency: string;
  refundableMajor: string;
}) {
  const [state, formAction] = useFormState<OrderFormState, FormData>(refundOrder.bind(null, orderId), {});

  return (
    <form action={formAction} className="mt-3 grid gap-2">
      <div className="flex items-center gap-2">
        <input
          name="amount"
          inputMode="decimal"
          placeholder={`留空=全退（剩 ${refundableMajor} ${currency.toUpperCase()}）`}
          className="h-10 min-w-0 flex-1 border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <SubmitButton />
      </div>
      {state?.error && <p className="border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-800">{state.error}</p>}
      <p className="text-xs text-steel">通过 Stripe 退款；退款结果由 Webhook 回填并自动发退款邮件。</p>
    </form>
  );
}
