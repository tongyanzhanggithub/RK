"use client";

import { useFormState, useFormStatus } from "react-dom";
import { LogIn, UserPlus } from "lucide-react";
import type { AuthState } from "@/app/account/actions";

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
      {pending ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
    </button>
  );
}

export function AccountAuthForm({
  action,
  mode
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "register";
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      {mode === "register" && (
        <>
          <Field label="Name" name="name" required autoComplete="name" />
          <Field label="Country (optional)" name="country" autoComplete="country-name" />
        </>
      )}
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        placeholder={mode === "register" ? "At least 8 characters" : undefined}
      />
      <SubmitButton mode={mode} />
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
  autoComplete,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}
