"use client";

import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { resetCustomerPassword } from "@/app/account/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      <KeyRound size={18} /> {pending ? "Saving..." : "Set New Password"}
    </button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetCustomerPassword, {});
  return (
    <form action={formAction} className="mt-7 grid gap-4">
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
      <input type="hidden" name="token" value={token} />
      <label className="grid gap-2 text-sm font-bold">
        New password
        <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Confirm new password
        <input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <SubmitButton />
    </form>
  );
}
