"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { InventoryFormState } from "@/app/admin/(protected)/inventory/actions";

type Props = {
  action: (state: InventoryFormState, formData: FormData) => Promise<InventoryFormState>;
  saved?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "提交中..." : "提交库存调整"}
    </button>
  );
}

export function InventoryAdjustmentForm({ action, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">库存调整</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          补货和退货会增加库存。报损和销售会减少库存。修正则直接设定准确的库存数量。
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">库存已更新。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        调整类型
        <select name="type" defaultValue="RESTOCK" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="RESTOCK">RESTOCK - 补货（增加库存）</option>
          <option value="RETURN">RETURN - 退货（增加库存）</option>
          <option value="DAMAGE">DAMAGE - 报损（减少库存）</option>
          <option value="SALE">SALE - 销售（减少库存）</option>
          <option value="CORRECTION">CORRECTION - 修正（设定准确库存）</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        数量
        <input name="quantity" type="number" min="0" required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        原因
        <textarea name="reason" required rows={4} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        单据号
        <input name="reference" placeholder="采购单号、订单号、仓库备注..." className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <SubmitButton />
    </form>
  );
}
