"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitWholesaleApplication, type WholesaleApplicationState } from "@/app/wholesale/actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

const initialState: WholesaleApplicationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center bg-safety px-6 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit Wholesale Application"}
    </button>
  );
}

export function WholesaleApplicationForm() {
  const [state, formAction] = useFormState(submitWholesaleApplication, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      {state?.error && (
        <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company name" name="companyName" required />
        <Field label="Contact person" name="contactName" required />
        <Field label="Country" name="country" required />
        <Field label="WhatsApp" name="whatsapp" placeholder="+60..." required />
        <Field label="Business email" name="email" type="email" required />
        <label className="grid gap-2 text-sm font-bold">
          Business type
          <select name="businessType" required defaultValue="" className="h-12 border border-line bg-white px-3 font-normal outline-none focus:border-navy">
            <option value="" disabled>Select business type</option>
            <option value="Repair Shop">Repair Shop</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
            <option value="Online Seller">Online Seller</option>
            <option value="Fleet or Rental">Fleet or Rental</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Products of interest
        <textarea
          name="productInterest"
          required
          rows={3}
          placeholder="168F repair kits, water pump seal kits, generator maintenance kits"
          className="border border-line bg-white px-3 py-3 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>

      <Field
        label="Estimated monthly purchase quantity"
        name="estimatedMonthlyQuantity"
        type="number"
        min="1"
        placeholder="Example: 100"
      />

      <div className="border border-line bg-panel p-4">
        <p className="text-sm font-black">Business verification <span className="font-bold text-steel">(optional — speeds up approval & free samples)</span></p>
        <p className="mt-1 text-xs leading-5 text-steel">
          Genuine resellers who add these get approved faster and qualify for free samples. We only ship free samples after a quick verification.
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Field label="Company website or store page" name="website" placeholder="https:// or your shop / marketplace link" />
          <Field label="Sales channel / market" name="salesChannel" placeholder="e.g. repair shop in Dubai, Lazada store, B2B distributor" />
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Physical business address
            <input
              name="businessAddress"
              placeholder="Street, city, country — where your shop or warehouse is"
              className="h-12 border border-line bg-white px-3 font-normal outline-none focus:border-navy"
            />
          </label>
        </div>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Message
        <textarea
          name="message"
          rows={5}
          placeholder="Tell us about your market, packaging needs or the models you service."
          className="border border-line bg-white px-3 py-3 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="max-w-xl text-xs leading-5 text-steel">
          Applications are reviewed manually. Submitting this form does not immediately activate wholesale pricing.
        </p>
        <TurnstileWidget />
        <SubmitButton />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  min
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className="h-12 border border-line bg-white px-3 font-normal outline-none focus:border-navy"
      />
    </label>
  );
}
