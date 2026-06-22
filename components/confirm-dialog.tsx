"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

type ConfirmButtonProps = {
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  "aria-label"?: string;
};

/**
 * A trigger that opens an accessible confirmation modal before running a
 * (possibly async) action. Replaces window.confirm — themed, keyboard-friendly,
 * and shows a pending state while the action runs.
 */
export function ConfirmButton({
  onConfirm,
  children,
  className = "",
  title = "确认操作",
  message = "确定要执行此操作吗？",
  confirmLabel = "确认",
  cancelLabel = "取消",
  tone = "danger",
  ...rest
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const confirmTone =
    tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-[#1c54bf]";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} {...rest}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm border border-line bg-white p-6 shadow-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {tone === "danger" && <AlertTriangle size={22} className="mt-0.5 shrink-0 text-red-600" />}
              <div>
                <h2 className="text-lg font-black text-graphite">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-steel">{message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center border border-line px-4 text-sm font-black text-graphite hover:bg-panel disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await onConfirm();
                    setOpen(false);
                  })
                }
                className={`inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-black text-white disabled:opacity-60 ${confirmTone}`}
              >
                {pending && <Loader2 size={15} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
