"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Order } from "@prisma/client";
import type { OrderFormState } from "@/app/admin/(protected)/orders/actions";

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
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Order Updates"}
    </button>
  );
}

export function OrderManagementForm({ order, action, saved }: OrderManagementFormProps) {
  const initialState: OrderFormState = {};
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">Order Operations</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          Payment status is read-only here and is synchronized automatically by Stripe webhook events.
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Order updated.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Order Status
          <select name="orderStatus" defaultValue={order.orderStatus} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Fulfillment Status
          <select name="fulfillmentStatus" defaultValue={order.fulfillmentStatus} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="UNFULFILLED">UNFULFILLED</option>
            <option value="PARTIALLY_FULFILLED">PARTIALLY_FULFILLED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="FULFILLED">FULFILLED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
        <Field label="Shipping Carrier" name="shippingCarrier" defaultValue={order.shippingCarrier || ""} />
        <Field label="Tracking Number" name="trackingNumber" defaultValue={order.trackingNumber || ""} />
        <Field label="Tracking URL" name="trackingUrl" defaultValue={order.trackingUrl || ""} />
        <Field label="Shipped At" name="shippedAt" type="datetime-local" defaultValue={datetimeLocal(order.shippedAt)} />
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Internal Note
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
