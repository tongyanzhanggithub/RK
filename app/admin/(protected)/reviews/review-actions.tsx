"use client";

import { useTransition } from "react";
import { ConfirmButton } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast-provider";
import { deleteReview, toggleReviewPublished } from "@/app/admin/(protected)/reviews/actions";

export function ReviewActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const toast = useToast();
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await toggleReviewPublished(id);
              toast.success(isPublished ? "评价已下架" : "评价已发布");
            } catch {
              toast.error("操作失败，请重试");
            }
          })
        }
        className="text-sm font-black text-navy hover:underline disabled:opacity-50"
      >
        {isPublished ? "下架" : "通过并发布"}
      </button>
      <ConfirmButton
        title="删除评价"
        message="确定删除这条评价？此操作不可撤销。"
        confirmLabel="删除"
        className="text-sm font-black text-red-700 hover:underline"
        onConfirm={async () => {
          try {
            await deleteReview(id);
            toast.success("评价已删除");
          } catch {
            toast.error("删除失败，请重试");
          }
        }}
      >
        删除
      </ConfirmButton>
    </div>
  );
}
