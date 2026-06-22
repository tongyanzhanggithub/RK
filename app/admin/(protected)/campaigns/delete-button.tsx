"use client";

import { useTransition } from "react";
import { deleteCampaign } from "./actions";

export function DeleteCampaignButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("确定删除这个活动？此操作不可撤销。")) start(() => deleteCampaign(id));
      }}
      className="text-xs font-black text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {pending ? "删除中…" : "删除"}
    </button>
  );
}
