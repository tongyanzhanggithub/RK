"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Shipment } from "@prisma/client";
import { addShipment, deleteShipment, type OrderFormState } from "@/app/admin/(protected)/orders/actions";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-10 shrink-0 bg-navy px-3 text-sm font-black text-white disabled:opacity-60">
      {pending ? "添加中…" : "添加包裹"}
    </button>
  );
}

export function ShipmentControls({ orderId, shipments }: { orderId: string; shipments: Shipment[] }) {
  const [state, formAction] = useFormState<OrderFormState, FormData>(addShipment.bind(null, orderId), {});

  return (
    <div className="grid gap-4">
      {shipments.length > 0 && (
        <div className="grid gap-2">
          {shipments.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border border-line p-3 text-sm">
              <div>
                <span className="font-black">{s.carrier || "包裹"}</span>
                {s.trackingNumber && <span className="ml-2">{s.trackingNumber}</span>}
                {s.trackingUrl && (
                  <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 font-black text-navy hover:underline">追踪</a>
                )}
                <span className="ml-2 text-xs text-steel">{s.shippedAt.toLocaleDateString("zh-CN")}</span>
              </div>
              <form action={deleteShipment.bind(null, s.id)}>
                <button type="submit" className="text-xs font-bold text-red-700 hover:underline">删除</button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="grid gap-2 border-t border-line pt-3">
        {state?.error && <p className="border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-800">{state.error}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="carrier" placeholder="承运商（如 DHL）" className="h-10 border border-line px-3 text-sm outline-none focus:border-navy" />
          <input name="trackingNumber" placeholder="追踪号" className="h-10 border border-line px-3 text-sm outline-none focus:border-navy" />
        </div>
        <input name="trackingUrl" placeholder="追踪链接（选填，https://…）" className="h-10 border border-line px-3 text-sm outline-none focus:border-navy" />
        <div className="flex items-center gap-2">
          <input name="note" placeholder="备注（选填）" className="h-10 min-w-0 flex-1 border border-line px-3 text-sm outline-none focus:border-navy" />
          <AddButton />
        </div>
        <p className="text-xs text-steel">添加包裹会把订单标记为已发货并给客户发一次发货邮件。</p>
      </form>
    </div>
  );
}
