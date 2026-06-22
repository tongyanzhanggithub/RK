"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast-provider";

/**
 * Watches the URL for the admin save/error redirect params (?saved=1, ?error=…)
 * fires a toast once, then strips the param so a refresh won't re-toast.
 * Mounted once in the admin layout so every server-action redirect benefits.
 */
export function SavedToast() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const handled = useRef("");

  useEffect(() => {
    const saved = params.get("saved");
    const error = params.get("error");
    if (!saved && !error) return;

    // Guard against double-firing in React strict mode / re-renders.
    const signature = `${pathname}?${saved ?? ""}|${error ?? ""}`;
    if (handled.current === signature) return;
    handled.current = signature;

    if (error) {
      toast.error(decodeURIComponent(error));
    } else {
      toast.success("已保存");
    }

    const next = new URLSearchParams(params);
    next.delete("saved");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router, toast]);

  return null;
}
