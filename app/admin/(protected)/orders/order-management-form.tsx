"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Order } from "@prisma/client";
import type { OrderFormState } from "@/app/admin/(protected)/orders/actions";
import { zhLabel, ORDER_STATUS, FULFILLMENT_STATUS } from "@/lib/admin-status";

type OrderManagementFormProps = {
  order: Order;
  action: (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;
  saved?: boolean;
};

function datetimeLocal(value: Date | null) {
  if (!value) return "";
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-brand px-4 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "保存中..." : "保存订单更新"}
    </button>
  );
}

export function OrderManagementForm({ order, action, saved }: OrderManagementFormProps) {
  const initialState: OrderFormState = {};
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">订单操作</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          此处支付状态为只读，由 Stripe webhook 事件自动同步。
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">订单已更新。</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          订单状态
          <select name="orderStatus" defaultValue={order.orderStatus} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="PROCESSING">{zhLabel(ORDER_STATUS, "PROCESSING")}</option>
            <option value="SHIPPED">{zhLabel(ORDER_STATUS, "SHIPPED")}</option>
            <option value="COMPLETED">{zhLabel(ORDER_STATUS, "COMPLETED")}</option>
            <option value="CANCELLED">{zhLabel(ORDER_STATUS, "CANCELLED")}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          履约状态
          <select name="fulfillmentStatus" defaultValue={order.fulfillmentStatus} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="UNFULFILLED">{zhLabel(FULFILLMENT_STATUS, "UNFULFILLED")}</option>
            <option value="PARTIALLY_FULFILLED">{zhLabel(FULFILLMENT_STATUS, "PARTIALLY_FULFILLED")}</option>
            <option value="SHIPPED">{zhLabel(FULFILLMENT_STATUS, "SHIPPED")}</option>
            <option value="FULFILLED">{zhLabel(FULFILLMENT_STATUS, "FULFILLED")}</option>
            <option value="CANCELLED">{zhLabel(FULFILLMENT_STATUS, "CANCELLED")}</option>
          </select>
        </label>
        <Field label="承运商" name="shippingCarrier" defaultValue={order.shippingCarrier || ""} />
        <Field label="物流单号" name="trackingNumber" defaultValue={order.trackingNumber || ""} />
        <Field label="物流链接" name="trackingUrl" defaultValue={order.trackingUrl || ""} />
        <Field label="发货时间" name="shippedAt" type="datetime-local" defaultValue={datetimeLocal(order.shippedAt)} />
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          内部备注
          <textarea
            name="internalNote"
            defaultValue={order.internalNote || ""}
            rows={5}
            className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}
