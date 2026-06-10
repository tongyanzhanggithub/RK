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
      className="inline-flex h-11 items-center justify-center bg-safety px-4 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Applying..." : "Apply Inventory Adjustment"}
    </button>
  );
}

export function InventoryAdjustmentForm({ action, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">Adjust Inventory</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          Restock and returns add units. Damage and sale remove units. Correction sets the exact stock quantity.
        </p>
      </div>
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Inventory updated.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Adjustment Type
        <select name="type" defaultValue="RESTOCK" className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="RESTOCK">RESTOCK - add units</option>
          <option value="RETURN">RETURN - add units</option>
          <option value="DAMAGE">DAMAGE - remove units</option>
          <option value="SALE">SALE - remove units</option>
          <option value="CORRECTION">CORRECTION - set exact stock</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Quantity
        <input name="quantity" type="number" min="0" required className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Reason
        <textarea name="reason" required rows={4} className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Reference
        <input name="reference" placeholder="PO number, order number, warehouse note..." className="h-11 border border-line px-3 font-normal outline-none focus:border-navy" />
      </label>
      <SubmitButton />
    </form>
  );
}
