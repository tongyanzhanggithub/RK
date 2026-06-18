"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestReturn, type CustomerReturnState } from "@/app/account/return-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 shrink-0 border border-navy px-4 text-sm font-black text-navy hover:bg-panel disabled:opacity-60">
      {pending ? "Submitting…" : "Request a return"}
    </button>
  );
}

export function ReturnRequestForm({ orderId, openStatus }: { orderId: string; openStatus?: string }) {
  const [state, formAction] = useFormState<CustomerReturnState, FormData>(requestReturn.bind(null, orderId), {});

  if (openStatus) {
    return <p className="text-sm font-bold text-steel">Return status: {openStatus}. We&apos;ll email you with the next steps.</p>;
  }
  if (state.ok) {
    return <p className="text-sm font-bold text-green-800">Return requested — we&apos;ll review it and email you shortly.</p>;
  }

  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
      <input name="reason" placeholder="What's the issue? (optional)" className="h-10 border border-line px-3 text-sm outline-none focus:border-navy" />
      <SubmitButton />
      {state.error && <p className="text-xs font-bold text-red-700 sm:col-span-2">{state.error}</p>}
    </form>
  );
}
