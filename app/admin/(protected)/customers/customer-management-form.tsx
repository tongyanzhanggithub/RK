"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Customer } from "@prisma/client";
import type { CustomerFormState } from "@/app/admin/(protected)/customers/actions";

type Props = {
  customer: Customer;
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  saved?: boolean;
};

function tagsText(value: string) {
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags) ? tags.join(", ") : "";
  } catch {
    return "";
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Customer"}
    </button>
  );
}

export function CustomerManagementForm({ customer, action, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">Customer Operations</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          Contact and address fields synchronize from the latest Stripe order. Manage status, tags and internal notes here.
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Customer updated.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Customer Status
        <select name="status" defaultValue={customer.status} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="ACTIVE">ACTIVE</option>
          <option value="VIP">VIP</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Tags
        <textarea
          name="tags"
          defaultValue={tagsText(customer.tags)}
          rows={3}
          placeholder="Retail, Repair Shop, Wholesale Prospect"
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Internal Note
        <textarea
          name="internalNote"
          defaultValue={customer.internalNote || ""}
          rows={5}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
