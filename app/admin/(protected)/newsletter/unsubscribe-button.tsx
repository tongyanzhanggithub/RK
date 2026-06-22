"use client";

import { useTransition } from "react";
import { toggleSubscriber } from "./actions";

export function ToggleSubscriberButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => toggleSubscriber(id, !isActive))}
      className={`text-xs font-black underline-offset-2 hover:underline disabled:opacity-50 ${
        isActive ? "text-red-600" : "text-green-700"
      }`}
    >
      {pending ? "…" : isActive ? "退订" : "恢复"}
    </button>
  );
}
