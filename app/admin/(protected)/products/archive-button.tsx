"use client";

import { Archive } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast-provider";
import { archiveProduct } from "@/app/admin/(protected)/products/actions";

export function ArchiveProductButton({ id, name }: { id: string; name: string }) {
  const toast = useToast();
  return (
    <ConfirmButton
      title="归档产品"
      message={`确定归档「${name}」？归档后将从店面下架，可随时在编辑页恢复。`}
      confirmLabel="归档"
      aria-label={`归档 ${name}`}
      className="inline-flex items-center gap-1 font-black text-red-700 hover:underline"
      onConfirm={async () => {
        try {
          await archiveProduct(id);
          toast.success("产品已归档");
        } catch {
          toast.error("归档失败，请重试");
        }
      }}
    >
      <Archive size={13} /> 归档
    </ConfirmButton>
  );
}
