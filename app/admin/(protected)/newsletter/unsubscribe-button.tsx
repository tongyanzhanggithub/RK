"use client";

import { useTransition } from "react";
import { useToast } from "@/components/toast-provider";
import { toggleSubscriber } from "./actions";

export function ToggleSubscriberButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await toggleSubscriber(id, !isActive);
            toast.success(isActive ? "已退订该邮箱" : "已恢复订阅");
          } catch {
            toast.error("操作失败，请重试");
          }
        })
      }
      className={`text-xs font-black underline-offset-2 hover:underline disabled:opacity-50 ${
        isActive ? "text-red-600" : "text-green-700"
      }`}
    >
      {pending ? "…" : isActive ? "退订" : "恢复"}
    </button>
  );
}
