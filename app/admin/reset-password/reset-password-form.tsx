"use client";

import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { resetPassword } from "@/app/admin/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      <KeyRound size={18} />
      {pending ? "正在保存..." : "设置新密码"}
    </button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPassword, {});

  return (
    <form action={formAction} className="mt-7 grid gap-4">
      {state?.error && (
        <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>
      )}
      <input type="hidden" name="token" value={token} />
      <label className="grid gap-2 text-sm font-bold">
        新密码
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="至少 8 个字符"
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        确认新密码
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          placeholder="再次输入新密码"
          className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
