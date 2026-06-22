"use client";

import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast-provider";
import { deleteCampaign } from "./actions";

export function DeleteCampaignButton({ id, title }: { id: string; title: string }) {
  const toast = useToast();
  return (
    <ConfirmButton
      title="删除活动"
      message={`确定删除「${title}」？此操作不可撤销。`}
      confirmLabel="删除"
      aria-label={`删除 ${title}`}
      className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:underline"
      onConfirm={async () => {
        try {
          await deleteCampaign(id);
          toast.success("活动已删除");
        } catch {
          toast.error("删除失败，请重试");
        }
      }}
    >
      <Trash2 size={13} /> 删除
    </ConfirmButton>
  );
}
