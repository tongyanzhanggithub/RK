"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Customer } from "@prisma/client";
import type { CustomerFormState } from "@/app/admin/(protected)/customers/actions";

type Props = {
  customer?: Customer;
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  saved?: boolean;
  submitLabel?: string;
};

function tagsText(value?: string) {
  if (!value) return "";
  try {
    const tags = JSON.parse(value);
    return Array.isArray(tags) ? tags.join(", ") : "";
  } catch {
    return "";
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CustomerManagementForm({ customer, action, saved, submitLabel = "Save Customer" }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">{customer ? "Customer Operations" : "New Customer"}</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          {customer
            ? "Contact fields update automatically from the latest Stripe order — manual edits here may be overwritten by the next paid order."
            : "Create a profile for buyers who order by WhatsApp or bank transfer, so their history stays in one place."}
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Customer updated.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={customer?.name} />
        <Field label="Email" name="email" type="email" required defaultValue={customer?.email} />
        <Field label="Phone" name="phone" defaultValue={customer?.phone || ""} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={customer?.whatsapp || ""} />
        <Field label="Country" name="country" defaultValue={customer?.country || ""} />
        <Field label="City" name="city" defaultValue={customer?.city || ""} />
        <Field label="Address" name="address" defaultValue={customer?.address || ""} />
        <Field label="Postal Code" name="postalCode" defaultValue={customer?.postalCode || ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Customer Status
          <select name="status" defaultValue={customer?.status || "ACTIVE"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="ACTIVE">ACTIVE</option>
            <option value="VIP">VIP</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Role
          <select name="role" defaultValue={customer?.role || "CUSTOMER"} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="WHOLESALE">WHOLESALE</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Tags
        <textarea
          name="tags"
          defaultValue={tagsText(customer?.tags)}
          rows={2}
          placeholder="Retail, Repair Shop, Wholesale Prospect"
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Internal Note
        <textarea
          name="internalNote"
          defaultValue={customer?.internalNote || ""}
          rows={4}
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}
