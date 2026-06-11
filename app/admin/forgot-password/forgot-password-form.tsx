"use client";

import { useFormState, useFormStatus } from "react-dom";
import { MailQuestion } from "lucide-react";
import { requestPasswordReset } from "@/app/admin/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      <MailQuestion size={18} />
      {pending ? "Sending..." : "Send Reset Link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, {});

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      {state?.message && (
        <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">{state.message}</p>
      )}
      {state?.error && (
        <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>
      )}
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input
          type="email"
          name="email"
          required
          placeholder="admin@example.com"
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
