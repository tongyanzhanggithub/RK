"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const VARIANT_STYLE: Record<ToastVariant, { icon: typeof CheckCircle2; bar: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bar: "bg-green-500", iconColor: "text-green-400" },
  error: { icon: XCircle, bar: "bg-red-500", iconColor: "text-red-400" },
  info: { icon: Info, bar: "bg-brand", iconColor: "text-brand" }
};

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  // Portal target only exists after mount (avoids SSR document access).
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      if (!message) return;
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info")
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
            role="region"
            aria-live="polite"
            aria-label="通知"
          >
            {toasts.map((t) => {
              const style = VARIANT_STYLE[t.variant];
              const Icon = style.icon;
              return (
                <div
                  key={t.id}
                  role="status"
                  className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border border-line bg-white py-3 pl-3 pr-2 shadow-card-lg"
                >
                  <span className={`mt-px h-full w-1 self-stretch rounded ${style.bar}`} aria-hidden="true" />
                  <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
                  <p className="flex-1 text-sm font-bold leading-5 text-graphite">{t.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="关闭通知"
                    className="shrink-0 rounded p-1 text-steel hover:bg-panel hover:text-graphite"
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
