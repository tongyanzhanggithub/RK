"use client";

import { useFormState, useFormStatus } from "react-dom";
import { importProducts, type ImportState } from "@/app/admin/(protected)/products/import/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center bg-safety px-6 font-black text-ink hover:bg-amber-400 disabled:opacity-60">
      {pending ? "导入中..." : "开始导入"}
    </button>
  );
}

export function ImportForm() {
  const [state, formAction] = useFormState<ImportState, FormData>(importProducts, {});
  const done = state.created !== undefined || state.updated !== undefined;

  return (
    <form action={formAction} className="grid gap-4">
      {state.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}
      {done && (
        <div className="border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">
          导入完成：新增 {state.created ?? 0} 个，更新 {state.updated ?? 0} 个。
          {state.rowErrors && state.rowErrors.length > 0 && (
            <div className="mt-3 border-t border-green-200 pt-3 text-red-700">
              <p>以下行被跳过：</p>
              <ul className="mt-1 grid gap-1">
                {state.rowErrors.map((err) => <li key={err}>• {err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      <label className="grid gap-2 text-sm font-bold">
        粘贴 CSV 内容
        <textarea
          name="csv"
          rows={14}
          className="border border-line px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-navy"
          placeholder={"slug,name,sku,category,retailPrice,stock,fitmentType,compatibleModels\n168f-x-kit,168F X Kit,SKU-001,Small Engine Repair Kit,29.90,100,SPECIFIC,168F; GX160"}
        />
      </label>
      <div><SubmitButton /></div>
    </form>
  );
}
