"use client";

import { useFormState, useFormStatus } from "react-dom";
import { LockKeyhole } from "lucide-react";
import { loginAdmin } from "@/app/admin/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      <LockKeyhole size={18} />
      {pending ? "Signing in..." : "Sign in to Admin"}
    </button>
  );
}

export function AdminLoginForm({ next }: { next: string }) {
  const initialState: { error?: string } = {};
  const [state, formAction] = useFormState(loginAdmin, initialState);

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input
          name="email"
          type="email"
          required
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="admin@example.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          placeholder="At least 8 characters"
        />
      </label>
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
