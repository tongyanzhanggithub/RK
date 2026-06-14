"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { WholesaleApplication } from "@prisma/client";
import type { WholesaleReviewState } from "@/app/admin/(protected)/wholesale/actions";

type Props = {
  application: WholesaleApplication;
  action: (state: WholesaleReviewState, formData: FormData) => Promise<WholesaleReviewState>;
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
      {pending ? "Saving Review..." : "Save Review"}
    </button>
  );
}

export function WholesaleReviewForm({ application, action, saved }: Props) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="grid gap-5 border border-line bg-white p-5">
      <div>
        <h2 className="text-xl font-black">Review Application</h2>
        <p className="mt-2 text-sm leading-6 text-steel">
          Approving creates or upgrades the matching email customer to wholesale.
        </p>
      </div>

      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Review saved.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      <label className="grid gap-2 text-sm font-bold">
        Review status
        <select name="status" defaultValue={application.status} className="h-11 border border-line px-3 font-normal outline-none focus:border-navy">
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Internal review note
        <textarea
          name="adminNote"
          defaultValue={application.adminNote || ""}
          rows={7}
          placeholder="Record minimum order, verification details or rejection reason."
          className="border border-line px-3 py-2 font-normal leading-6 outline-none focus:border-navy"
        />
      </label>

      <p className="border border-line bg-panel p-3 text-xs leading-5 text-steel">
        Email notification status will be queued as pending setup until an email provider is configured.
      </p>

      <div className="flex justify-end"><SubmitButton /></div>
    </form>
  );
}
