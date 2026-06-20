"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CustomerAddress } from "@prisma/client";
import type { AddressFormState } from "@/app/account/address-actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center bg-brand px-6 font-black text-white hover:bg-[#1c54bf] disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function AddressForm({
  action,
  address,
  submitLabel
}: {
  action: (state: AddressFormState, formData: FormData) => Promise<AddressFormState>;
  address?: CustomerAddress;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const isOnlyDefault = address?.isDefault;

  return (
    <form action={formAction} className="grid max-w-xl gap-4 border border-line bg-white p-6">
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Recipient name
        <input name="recipient" defaultValue={address?.recipient} required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Phone
          <input name="phone" defaultValue={address?.phone ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" placeholder="+971 ..." />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Country
          <input name="country" defaultValue={address?.country} required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Address (street, building, area)
        <textarea name="line1" defaultValue={address?.line1} required rows={3} className="border border-line px-3 py-2 font-normal outline-none focus:border-navy" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          City
          <input name="city" defaultValue={address?.city ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Postal code
          <input name="postalCode" defaultValue={address?.postalCode ?? ""} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
        </label>
      </div>

      <label className="inline-flex items-center gap-3 text-sm font-bold">
        <input type="checkbox" name="isDefault" defaultChecked={isOnlyDefault} className="h-4 w-4" />
        Set as default shipping address
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
