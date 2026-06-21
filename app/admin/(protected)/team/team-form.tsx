"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createAdmin, type TeamFormState } from "@/app/admin/(protected)/team/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center bg-brand px-5 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60">
      {pending ? "创建中…" : "创建管理员"}
    </button>
  );
}

const field = "h-11 border border-line px-3 font-normal outline-none focus:border-navy";

export function CreateAdminForm() {
  const [state, action] = useFormState<TeamFormState, FormData>(createAdmin, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="grid gap-4 border border-line bg-white p-6 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-bold">
        邮箱（登录用）
        <input name="email" type="email" required className={field} placeholder="ops@partavio.com" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        姓名
        <input name="name" required className={field} placeholder="运营小王" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        初始密码（至少 8 位）
        <input name="password" type="text" required minLength={8} className={field} placeholder="发给对方后让其登录修改" />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        角色
        <select name="role" defaultValue="ADMIN" className={`${field} bg-white`}>
          <option value="ADMIN">普通管理员（日常运营）</option>
          <option value="SUPER_ADMIN">超级管理员（可管团队 + 看日志）</option>
        </select>
      </label>
      {state.error && <p className="text-sm font-bold text-red-700 sm:col-span-2">{state.error}</p>}
      {state.ok && <p className="text-sm font-bold text-green-700 sm:col-span-2">已创建。</p>}
      <div className="sm:col-span-2">
        <SubmitBtn />
      </div>
    </form>
  );
}
