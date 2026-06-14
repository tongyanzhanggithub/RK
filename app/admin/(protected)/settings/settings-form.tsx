"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveSettings, type SettingsFormState } from "@/app/admin/(protected)/settings/actions";
import { SETTING_FIELDS } from "@/lib/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center gap-2 bg-safety px-6 font-black text-ink hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save Settings"}
    </button>
  );
}

export function SettingsForm({ values, saved }: { values: Record<string, string>; saved?: boolean }) {
  const [state, formAction] = useFormState<SettingsFormState, FormData>(saveSettings, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-5 border border-line bg-white p-6">
      {saved && <p className="border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">Settings saved.</p>}
      {state?.error && <p className="border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}

      {SETTING_FIELDS.map((field) => (
        <label key={field.key} className="grid gap-2 text-sm font-bold">
          {field.label}
          <input
            name={field.key}
            type={field.type}
            defaultValue={values[field.key] ?? ""}
            placeholder={field.placeholder}
            className="h-11 border border-line px-3 font-normal outline-none focus:border-navy"
          />
        </label>
      ))}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
